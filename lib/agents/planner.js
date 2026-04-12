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

    const metricPrefix = surveyType === 'WORKING_TYPE' ? 'WORK' : 'YOUTH';

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

    // 2. 지식베이스의 정확한 시맨틱 라벨 추출 (공백 제거 후 매칭)
    for (const [key, meta] of Object.entries(METRIC_METADATA)) {
      if (key.startsWith(metricPrefix)) {
        // "[청년층] 표 01." 같은 불필요한 태그 제거
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
      '취업자분포': 'YOUTH_03',
      '취업경험': 'YOUTH_11',
      '임금': 'YOUTH_18',
      '월평균임금': 'YOUTH_18',
      '월급': 'YOUTH_18',
      '임금근로자': 'WORK_01',
      '비정규직': 'WORK_01'
    };

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
