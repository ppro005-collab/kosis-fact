import { buildEnrichedPlan } from './lib/planBuilder.js';
import { PlannerAgent } from './lib/agents/planner.js';

async function test() {
  const queries = [
    "연령별 수학여부 집계해줘",               // 기본 → max 29
    "30~34세 포함한 연령별 수학여부",          // 30대 → max 34
    "확장청년 15~34세 연령별 경제활동상태",   // 확장 → max 34
  ];

  for (const q of queries) {
    const plan = await PlannerAgent.plan(q);
    const enriched = buildEnrichedPlan({ query: q, rawPlanner: plan });
    console.log(`\nQuery: "${q}"`);
    console.log(`  ageRange: ${enriched.ageRange.min}~${enriched.ageRange.max}세`);
    console.log(`  metric  : ${enriched.metric}`);
    console.log(`  groupBys: ${enriched.groupByLabels?.join(', ')}`);
  }
}

test().catch(console.error);
