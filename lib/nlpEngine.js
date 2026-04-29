import { statLogic, PREREQ_MAP, METRIC_METADATA } from './kosisStatLogic.js';
import { NLP_VARIABLE_MAP } from './nlpDictionaryMap.js';

export const nlpEngine = {
  // 한글 숫자 -> 아라비아 숫자 변환기 (연도 전용)
  koreanToNumber: (text) => {
    const map = { '영': 0, '일': 1, '이': 2, '삼': 3, '사': 4, '오': 5, '육': 6, '칠': 7, '팔': 8, '구': 9, '십': 10 };
    if (!text) return 0;
    if (text === '십') return 10;
    if (text.length === 2 && text.startsWith('십')) return 10 + map[text[1]];
    return map[text] || parseInt(text) || 0;
  },

  parseQuery: (query, context = {}) => {
    const raw = query.toLowerCase().replace(/\s+/g, ' ');
    
    // 1. 설문 유형 판별 (Priority: context -> query)
    let surveyType = context.surveyType || 'YOUTH';
    if (raw.includes('근로형태') || raw.includes('work') || raw.includes('비정규직')) surveyType = 'WORK';
    if (raw.includes('청년') || raw.includes('youth') || raw.includes('졸업')) surveyType = 'YOUTH';

    const result = {
      surveyType: surveyType,
      metric: null,
      filters: [],
      dimensions: ['성별코드'], // Default dimension
      yearRange: { start: 2025, end: 2025 }
    };

    // 연도 범위 추출
    const yearRangeMatch = raw.match(/(\d{4})\s*[~-]\s*(\d{4})/);
    if (yearRangeMatch) {
      result.yearRange.start = parseInt(yearRangeMatch[1]);
      result.yearRange.end = parseInt(yearRangeMatch[2]);
    } else {
      const singleYearMatch = raw.match(/(\d{4})\s*(년|년도)?/);
      if (singleYearMatch) {
        result.yearRange.start = parseInt(singleYearMatch[1]);
        result.yearRange.end = parseInt(singleYearMatch[1]);
      }
    }

    // 2. 표 번호 직접 매칭 (Table-First Strategy)
    const tableMatch = raw.match(/(표|table|테이블)\s*(\d{1,2})/i);
    if (tableMatch) {
      const paddedId = String(parseInt(tableMatch[2])).padStart(2, '0');
      const key = `${surveyType}_${paddedId}`;
      if (METRIC_METADATA[key]) {
        result.metric = key;
        const meta = METRIC_METADATA[key];
        if (meta.prerequisites) {
          meta.prerequisites.forEach(p => {
            if (PREREQ_MAP[p]) result.filters.push({ label: p, fn: PREREQ_MAP[p] });
          });
        }
        return result;
      }
    }

    // 3. 매핑 사전(NLP_VARIABLE_MAP) 기반 의도 매핑
    const mapping = NLP_VARIABLE_MAP[surveyType] || [];
    const usedVariables = [];

    mapping.forEach(item => {
      // 키워드 중 하나라도 포함되어 있으면 해당 변수를 사용한 것으로 간주
      if (item.nlKeywords.some(kw => raw.includes(kw))) {
        usedVariables.push(item);
        
        // 지표(Metric) 강제 지정이 있는 경우 (예: 월급 -> YOUTH_13)
        if (item.targetMetric && !result.metric) {
          result.metric = item.targetMetric;
        }

        // 축(Dimension)으로 활용 가능한 경우 추가
        if ((item.type === 'dimension' || item.type === 'dimension_or_filter') && !result.dimensions.includes(item.variable)) {
          // '성별코드'가 기본인데 다른게 들어오면 교체하거나 추가 (현재는 추가)
          if (!result.dimensions.includes(item.variable)) {
            result.dimensions.push(item.variable);
          }
        }
      }
    });

    // 4. 추출된 변수 기반 기본 지표(Metric) 설정
    if (!result.metric) {
      // 청년층에서 '졸업' 관련 키워드가 있으면 지표 설정
      if (surveyType === 'YOUTH' && usedVariables.some(v => v.variable.includes('졸업'))) {
        result.metric = 'YOUTH_13'; // 첫 취업 관련
      } else if (surveyType === 'WORK') {
        result.metric = 'WORK_01'; // 비정규직 비중 등 기본
      } else {
        result.metric = 'YOUTH_02'; // 경제활동상태 기본
      }
    }

    // 5. 중복된 기본 차원 제거 (성별이 겹치면 하나만 유지)
    result.dimensions = [...new Set(result.dimensions)];

    return result;
  }
};

