import { PlannerAgent } from './lib/agents/planner.js';

async function test() {
  const query = "2021~2025년 기준 대학졸업까지 걸린 기간을 교육수준별, 성별로 집계해줘";
  const plan = await PlannerAgent.plan(query);
  
  console.log("Query:", query);
  console.log("Year Range extracted:", plan.yearRange);
  
  if (plan.yearRange.start === 2021 && plan.yearRange.end === 2025) {
    console.log("[SUCCESS] Year range 2021~2025 correctly extracted!");
  } else {
    console.log("[FAILURE] Year range extraction failed. Plan:", JSON.stringify(plan.yearRange));
  }

  const query2 = "2023년 취업자 수";
  const plan2 = await PlannerAgent.plan(query2);
  console.log("\nQuery:", query2);
  console.log("Year Range extracted:", plan2.yearRange);
  if (plan2.yearRange.start === 2023 && plan2.yearRange.end === 2023) {
      console.log("[SUCCESS] Single year 2023 correctly extracted!");
  }
}

test();
