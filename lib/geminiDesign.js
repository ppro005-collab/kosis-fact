import { METRIC_METADATA } from './kosisStatLogic.js';

/**
 * 로컬 매칭이 빈약할 때 Gemini로 메트릭 키·분석 축 후보를 설계합니다.
 * (데이터 컬럼명은 서버에서 샘플 헤더로 함께 전달)
 */
export async function geminiDesignPlan(query, sampleColumnNames = [], surveyType = 'YOUTH') {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const prefix = surveyType === 'WORKING_TYPE' ? 'WORK' : 'YOUTH';
  const metricKeys = Object.keys(METRIC_METADATA).filter(k => k.startsWith(prefix));

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `You are a Korean official statistics assistant. User question:
"""${query}"""

Survey family: ${prefix === 'YOUTH' ? 'Youth supplement (청년층 부가)' : 'Working type supplement (근로형태별 부가)'}.

Available METRIC keys (pick exactly one):
${metricKeys.join(', ')}

Sample MD column names (match user keywords like 졸업소요기간 to these):
${sampleColumnNames.slice(0, 120).join(', ')}

Return ONLY JSON:
{"metric":"${prefix}_NN","groupByLabels":["성별","조사연도"],"notes":"short Korean rationale"}
groupByLabels must use only these Korean labels when possible: 성별, 학력 그룹, 연령대 구분, 조사연도, 경제활동상태, 근로형태 (subset as needed, 1~3 items).`
          }
        ]
      }
    ]
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.metric && METRIC_METADATA[parsed.metric]) {
      return {
        metric: parsed.metric,
        groupByLabels: Array.isArray(parsed.groupByLabels) ? parsed.groupByLabels : [],
        notes: parsed.notes || '',
        isGeminiDesigned: true
      };
    }
  } catch (e) {
    console.warn('geminiDesignPlan:', e.message);
  }
  return null;
}
