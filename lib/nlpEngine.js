import { statLogic, PREREQ_MAP, METRIC_METADATA } from './kosisStatLogic.js';

export const nlpEngine = {
  // \ud55c\uae00 \uc22a\uc790 -> \uc544\ub77c\ube44\uc544 \uc22a\uc790 \ubcc0\ud658\uae30 (\uc5f0\ub3c4 \uc804\uc6a9)
  koreanToNumber: (text) => {
    const map = { '\uc601': 0, '\uc77c': 1, '\uc774': 2, '\uc0bc': 3, '\uc0ac': 4, '\uc624': 5, '\uc721': 6, '\uc9c8': 7, '\ud314': 8, '\uad6c': 9, '\uc2ed': 10 };
    if (!text) return 0;
    if (text === '\uc2ed') return 10;
    if (text.length === 2 && text.startsWith('\uc2ed')) return 10 + map[text[1]];
    return map[text] || parseInt(text) || 0;
  },

  parseQuery: (query, context = {}) => {
    const raw = query.toLowerCase().replace(/\s+/g, ' ');
    
    // 1. \ud45c \ubc88\ud638 \ucd94\ucd9c (Table-First Strategy)
    const tableMatch = raw.match(/(\ud45c|table)\s*(\d{1,2})/i);
    const tableIdInput = tableMatch ? parseInt(tableMatch[2]) : null;
    
    let surveyType = context.surveyType || 'YOUTH';
    if (raw.includes('\uadfc\ub85c\ud615\ud0dc') || raw.includes('work')) surveyType = 'WORK';
    if (raw.includes('\uccad\ub144') || raw.includes('youth')) surveyType = 'YOUTH';

    const result = {
      surveyType: surveyType,
      metric: null,
      filters: [],
      dimensions: ['\uc131\ubcc4'], // Default dimension: gender
      yearRange: { start: 2025, end: 2025 }
    };

    // 2. \ud45c \ubc88\ud638\uac00 \uc788\uc744 \uacbd\uc6b0 \uaddc\uce31 \uac15\uc81c \uc801\uc6a9
    if (tableIdInput !== null) {
      const paddedId = String(tableIdInput).padStart(2, '0');
      const key = `${surveyType}_${paddedId}`;
      if (METRIC_METADATA[key]) {
        result.metric = key;
        const meta = METRIC_METADATA[key];
        if (meta.prerequisites) {
          meta.prerequisites.forEach(p => {
            if (PREREQ_MAP[p]) result.filters.push({ label: p, fn: PREREQ_MAP[p] });
          });
        }
        return result; // \ud45c \ubc88\ud638\uac00 \uc788\uc73c\uba74 \ud0a4\uc6cc\ub4dc \ub9e4\uce6d \uac74\ub108\ub6f0
      }
    }

    // 3. \ud0a4\uc6cc\ub4dc \uae30\ubc18 \uc758\ub3c4 \ud30c\uc545 (Dimension & Metric Extraction)
    const keywords = {
      dimensions: {
        '\uc0b0\uc5c5': 'getIndustryDistribution',
        '\uc9c1\uc5c5': 'getOccupationDistribution',
        '\uad50\uc721': 'getEducationGroupLabel',
        '\ud559\ub825': 'getEducationGroupLabel',
        '\uc6d4\uae09': 'monthlyWage',
        '\uc784\uae08': 'monthlyWage',
        '\uc2dc\uac04': 'weeklyHours',
        '\uadfc\uc11d': 'calculateTenureMonths'
      },
      metrics: {
        '\uacbd\uc81c\ud65c\ub3d9': 'YOUTH_02',
        '\uc218\ud559': 'YOUTH_01',
        '\uccab\uc9c1\uc7a5': 'YOUTH_13',
        '\uccab\uc77c\uc790\ub9ac': 'YOUTH_13',
        '\ube44\uc815\uaddc\uc9c1': 'WORK_02'
      }
    };

    Object.keys(keywords.dimensions).forEach(kw => {
      if (raw.includes(kw)) result.dimensions.push(kw);
    });

    Object.keys(keywords.metrics).forEach(kw => {
      if (raw.includes(kw)) result.metric = keywords.metrics[kw];
    });

    // Default metric if none found
    if (!result.metric) result.metric = (surveyType === 'YOUTH') ? 'YOUTH_02' : 'WORK_01';

    return result;
  }
};
