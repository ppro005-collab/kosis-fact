import { METRIC_METADATA, statLogic, DIMENSION_LABEL_EXTRACTORS } from './kosisStatLogic.js';
import { KOSIS_MAP } from './kosisMap.js';

export function normalizeSurveyType(st) {
  if (!st) return 'YOUTH';
  if (st === 'WORK' || st === 'WORKING_TYPE') return 'WORKING_TYPE';
  return 'YOUTH';
}

function dedupe(arr) {
  return [...new Set(arr)];
}

function logicSecondaryLabel(logicKey) {
  const M = {
    getEconomicStatus: '경제활동상태',
    getEducationStatus: '구분',
    getIndustryDistribution: '산업',
    getJobExperienceCount: '취업경험',
    getFirstJobWage: '임금구간',
    getEmploymentTypeLabel: '근로형태'
  };
  return M[logicKey] || '범주';
}

function inferGroupByLabels(query, metricKey, geminiLabels = []) {
  const q = query.toLowerCase();
  const meta = METRIC_METADATA[metricKey];
  const logicKey = meta?.logicKey;
  const gIn = (geminiLabels || []).filter(x => typeof x === 'string' && x.trim());

  if (gIn.length) return dedupe(gIn);

  const picked = [];
  if (/성별|남자|여자|남녀/.test(q)) picked.push('성별');
  if (/학제|학력|교육|대학|전문대/.test(q)) picked.push('학력 그룹');
  if (/연령|\d+세|청년|10대|20대/.test(q)) picked.push('연령대 구분');
  if (/\d{4}|연도|년도|년별|시계열/.test(q)) picked.push('조사연도');

  if (meta?.type === 'average') {
    if (!picked.includes('성별')) picked.unshift('성별');
    if (!picked.includes('학력 그룹') && /학제|졸업|대학|소요/.test(q)) picked.push('학력 그룹');
    if (picked.filter(Boolean).length === 0) return ['성별', '학력 그룹'];
    return dedupe(picked);
  }

  const sec = logicSecondaryLabel(logicKey);
  if (picked.length === 0) return dedupe(['성별', sec]);

  const hasSec = picked.some(p => p === sec || p.includes(sec.slice(0, 2)));
  if (!hasSec) picked.push(sec);
  return dedupe(picked);
}

export function labelToDimExtractor(label, logicKey) {
  if (DIMENSION_LABEL_EXTRACTORS[label]) return DIMENSION_LABEL_EXTRACTORS[label];
  const sec = logicSecondaryLabel(logicKey);
  if (label === sec && statLogic[logicKey]) return (row) => statLogic[logicKey](row);
  return () => '\uacc4';
}

/**
 * Planner 출력 + KB/Gemini 힌트를 UI·Analyst가 쓰는 통합 plan으로 변환합니다.
 */
export function buildEnrichedPlan({
  query,
  rawPlanner,
  kbSuggestedMetric,
  geminiExtras = null,
  manualSurveyType,
  manualAgeMin,
  manualAgeMax
}) {
  let surveyType = normalizeSurveyType(manualSurveyType || rawPlanner?.surveyType || 'YOUTH');
  const metric = kbSuggestedMetric || rawPlanner?.metric || (surveyType === 'WORKING_TYPE' ? 'WORK_01' : 'YOUTH_02');
  if (String(metric).startsWith('WORK_')) surveyType = 'WORKING_TYPE';
  if (String(metric).startsWith('YOUTH_')) surveyType = 'YOUTH';
  const meta = METRIC_METADATA[metric] || METRIC_METADATA[surveyType === 'WORKING_TYPE' ? 'WORK_01' : 'YOUTH_02'];
  const kosis = KOSIS_MAP[metric];

  const groupByLabels = inferGroupLabelsFinal(query, metric, geminiExtras?.groupByLabels);
  const groupBys = groupByLabels.map(label => ({ label }));

  const title = kosis?.title || meta.label || metric;
  const targetLogic = kosis?.logicKey || meta.logicKey;
  const ageRange = {
    min: manualAgeMin ?? 15,
    max: manualAgeMax ?? 29
  };

  const unit = meta.type === 'average' ? meta.unit || '개월' : '천 명';

  return {
    ...rawPlanner,
    query,
    surveyType,
    metric,
    title,
    targetLogic,
    groupBys,
    groupByLabels,
    metrics: { type: meta.type || 'count' },
    ageRange,
    unit,
    yearRange: rawPlanner?.yearRange || { start: 2025, end: 2025 },
    filters: rawPlanner?.filters || [],
    filterDesc: (rawPlanner?.filters || [])
      .map(f => f.label || f.fnKey)
      .filter(Boolean)
      .join(', '),
    kbNotes: geminiExtras?.notes || '',
    isGeminiDesigned: !!geminiExtras?.isGeminiDesigned,
    isLlmInferred: !!(rawPlanner?.isLlmInferred || geminiExtras?.isGeminiDesigned)
  };
}

function inferGroupLabelsFinal(query, metricKey, geminiLabels) {
  const base = inferGroupByLabels(query, metricKey, geminiLabels);
  const meta = METRIC_METADATA[metricKey];
  if (meta?.type === 'average' && base.length > 3) return base.slice(0, 3);
  return base;
}

export { inferGroupByLabels, labelToDimExtractor, logicSecondaryLabel };
