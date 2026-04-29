import { nlpEngine } from './lib/nlpEngine.js';

// Mock context for Youth survey
const context = { year: 2025, month: 5, surveyType: 'YOUTH' };

async function test() {
  console.log("=== Testing '졸업' 관련 키워드 인식 ===");
  const res1 = nlpEngine.parseQuery("졸업생들의 첫 직장 취업 소요기간", context);
  console.log("Q: 졸업생들의 첫 직장 취업 소요기간");
  console.log("A: SurveyType:", res1.surveyType, "| Metric:", res1.metric, "| Dimensions:", res1.dimensions);

  console.log("\n=== Testing '월급' 키워드 인식 (YOUTH_13 매핑) ===");
  const res2 = nlpEngine.parseQuery("대졸자들의 월급 수준 알려줘", context);
  console.log("Q: 대졸자들의 월급 수준 알려줘");
  console.log("A: Metric:", res2.metric, "| Dimensions:", res2.dimensions);

  console.log("\n=== Testing '비정규직' 키워드 인식 (WORK 자동 전환) ===");
  const res3 = nlpEngine.parseQuery("2025년 비정규직 통계", context);
  console.log("Q: 2025년 비정규직 통계");
  console.log("A: SurveyType:", res3.surveyType, "| Metric:", res3.metric);

  console.log("\n=== Testing '산업' 및 '차원' 추출 ===");
  const res4 = nlpEngine.parseQuery("산업별 남녀 임금 격차", context);
  console.log("Q: 산업별 남녀 임금 격차");
  console.log("A: Dimensions:", res4.dimensions);

  console.log("\n=== Testing Excel Synced Keywords ('백수', '구직중') ===");
  const res5 = nlpEngine.parseQuery("서울 사는 백수들 근황 알려줘", context);
  console.log("Q: 서울 사는 백수들 근황 알려줘");
  console.log("A: Metric:", res5.metric, "| Dimensions:", res5.dimensions);

  const res6 = nlpEngine.parseQuery("구직 중인 청년들의 비율", context);
  console.log("Q: 구직 중인 청년들의 비율");
  console.log("A: Metric:", res6.metric);
}

test();
