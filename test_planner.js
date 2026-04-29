import { PlannerAgent } from './lib/agents/planner.js';

// 하드코딩된 테스트 (Next.js 가동과 독립적으로 순수 모델 테스트)
process.env.GEMINI_API_KEY = 'AIzaSyAaWb0q-p1Oadv8MjXgGme164b3JsVvAtU';

async function test() {
  console.log("1. Starting test...");
  try {
    const res = await PlannerAgent.plan("신입 초봉 어떻게 되는지 알려줄래?", { surveyType: 'YOUTH' });
    console.log("RESULT:", res);
  } catch(e) {
    console.error("ERROR:", e);
  }
}
test();
