import { METRIC_METADATA, PREREQ_MAP } from '../kosisStatLogic.js';

export const PlannerAgent = {
  plan: async (query, context = {}) => {
    const raw = query.toLowerCase().replace(/\s+/g, ' ');
    let surveyType = context.surveyType || 'YOUTH';
    if (raw.includes('근로형태') || raw.includes('work')) surveyType = 'WORKING_TYPE';
    if (raw.includes('청년') || raw.includes('youth')) surveyType = 'YOUTH';

    const result = {
      query,
      surveyType,
      metric: null,
      filters: [],
      dimensions: ['성별'],
      yearRange: { start: 2025, end: 2025 },
      isLlmInferred: false
    };

    // 연도 범위 추출 (예: 2021~2025, 2021-2025, 2025년 등)
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

    const metricPrefix = surveyType === 'WORKING_TYPE' ? 'WORK' : 'YOUTH';

    // 0. [청년] 표 05. 대학졸업 소요기간 — '수학 여부(표01)' 키워드보다 반드시 우선
    if (metricPrefix === 'YOUTH') {
      const r = raw;
      const compact = r.replace(/\s+/g, '');
      const wantsGradDuration =
        /(대학|학제|학력|교육수준)/.test(r) &&
        /(졸업까지|졸업소요|소요기간|소요\s*기간|걸린\s*기간|걸린기간|기간을|개월)/.test(r);
      if (wantsGradDuration || /대학졸업/.test(compact)) {
        result.metric = 'YOUTH_05';
        const m = METRIC_METADATA.YOUTH_05;
        if (m?.prerequisites) {
          result.filters = m.prerequisites.map(p => ({ label: p, fnKey: p }));
        }
        return result;
      }
    }

    // 1. 테이블 번호 직접 매칭 (가장 높은 우선순위)
    const tableMatch = raw.match(/(표|table)\s*(\d{1,2})/i);
    if (tableMatch) {
      const paddedId = String(tableMatch[2]).padStart(2, '0');
      const key = `${metricPrefix}_${paddedId}`;
      if (METRIC_METADATA[key]) {
        result.metric = key;
        const meta = METRIC_METADATA[key];
        if (meta.prerequisites) {
          result.filters = meta.prerequisites.map(p => ({ label: p, fnKey: p }));
        }
        return result;
      }
    }

    // 2. 지식베이스 라벨 매칭 (표 01 '수학여부'가 표 05 '소요기간' 질의에 끼어들지 않도록 제외)
    for (const [key, meta] of Object.entries(METRIC_METADATA)) {
      if (key.startsWith(metricPrefix)) {
        if (key === 'YOUTH_01' && /(졸업|소요|기간|개월|학제|대학졸업)/.test(raw.replace(/\s+/g, ''))) {
          continue;
        }
        const cleanLabel = meta.label.replace(/\[.*?\]\s*표\s*\d+\.\s*/, '').replace(/\s+/g,'');
        const rawNoSpace = raw.replace(/\s+/g, '');
        if (rawNoSpace.includes(cleanLabel)) {
           result.metric = key;
           if (meta.prerequisites) {
             result.filters = meta.prerequisites.map(p => ({ label: p, fnKey: p }));
           }
           return result;
        }
      }
    }
    
    // 3. Fallback: 포괄적 키워드 사전 매칭
    const keywords = {
      '경제활동': 'YOUTH_02',
      '수학': 'YOUTH_01',
      '수학여부': 'YOUTH_01',
      '대학졸업': 'YOUTH_05',
      '소요기간': 'YOUTH_05',
      '걸린기간': 'YOUTH_05',
      '걸린 기간': 'YOUTH_05',
      '취업자분포': 'YOUTH_03',
      '취업경험': 'YOUTH_11',
      '임금': 'YOUTH_18',
      '월평균임금': 'YOUTH_18',
      '월급': 'YOUTH_18',
      '임금근로자': 'WORK_01',
      '비정규직': 'WORK_01'
    };

    const qLower = query.toLowerCase();
    const gradTimeKeywords = ['졸업', '소요', '기간', '걸린', '학제', '개월'];
    const hits = gradTimeKeywords.filter(k => qLower.includes(k)).length;
    if (hits >= 2 && (qLower.includes('대학') || qLower.includes('학력'))) {
      result.metric = 'YOUTH_05';
      const meta = METRIC_METADATA[result.metric];
      if (meta?.prerequisites) {
        result.filters = meta.prerequisites.map(p => ({ label: p, fnKey: p }));
      }
      return result;
    }

    const sortedKw = Object.keys(keywords).sort((a,b)=>b.length - a.length);
    for (const kw of sortedKw) {
      if (raw.includes(kw)) {
        result.metric = keywords[kw];
        const meta = METRIC_METADATA[result.metric];
        if (meta && meta.prerequisites) {
          result.filters = meta.prerequisites.map(p => ({ label: p, fnKey: p }));
        }
        return result;
      }
    }

    // 4. Gemini API Fallback (마스터 프롬프트 1-2 요구사항)
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log("Local Planner failed to match. Invoking Gemini API Agent...");
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const payload = {
          contents: [{
            parts: [{
              text: `You are KOSIS Planner Agent, a semantic mapping AI. Interpret this user query: "${query}".
Select the most semantically relevant METRIC key from the following options:
${JSON.stringify(
  Object.fromEntries(
    Object.entries(METRIC_METADATA).map(([k, v]) => [k, v.label])
  )
)}
Return ONLY a valid JSON object starting with { and ending with } in the format: {"metric": "YOUTH_XX"}`
            }]
          }]
        };

        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log("DEBUG [GEMINI RAW JSON]:", JSON.stringify(data));
        const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log("DEBUG [GEMINI RAW TEXT]:", textResponse);
        
        // 정규식으로 JSON 부분 추출
        const jsonMatch = textResponse.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.metric && METRIC_METADATA[parsed.metric]) {
            result.metric = parsed.metric;
            result.isLlmInferred = true;
            const meta = METRIC_METADATA[result.metric];
            if (meta.prerequisites) {
              result.filters = meta.prerequisites.map(p => ({ label: p, fnKey: p }));
            }
            return result;
          }
        }
      } catch (e) {
        console.warn("Gemini Fallback Agent failed:", e.message);
      }
    }

    // 5. Default 최후 보루 반환
    result.metric = surveyType === 'WORKING_TYPE' ? 'WORK_01' : 'YOUTH_02';
    const fallbackMeta = METRIC_METADATA[result.metric];
    if (fallbackMeta && fallbackMeta.prerequisites) {
       result.filters = fallbackMeta.prerequisites.map(p => ({ label: p, fnKey: p }));
    }
    return result;
  }
};
