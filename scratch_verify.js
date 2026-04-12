import { nlpEngine } from './lib/nlpEngine.js';
import { statLogic, PREREQ_MAP } from './lib/statLogic.js';

// Mock context for Youth survey
const context = { year: 2025, month: 5, surveyType: 'YOUTH', globalAge: { min: 15, max: 29 } };

async function test() {
  console.log("=== Testing Graduation Duration Query ===");
  const result = nlpEngine.parseQuery("대학 졸업까지 걸린 기간을 집계해줘", context);
  
  console.log("Detected TargetLogic:", result.targetLogic);
  console.log("Prerequisite Description:", result.surveySkipDesc);
  console.log("Title:", result.title);
  
  // Verify if isUniversityGradOnly filter is injected
  const hasPrereq = result.filters.some(f => f.label === 'isUniversityGradOnly');
  console.log("Is 'isUniversityGradOnly' filter present?", hasPrereq);
  
  if (hasPrereq) {
      console.log("SUCCESS: Systematic skip logic injected correctly.");
  } else {
      console.log("FAILURE: Prerequisite filter missing!");
  }

  console.log("\n=== Testing First Job Resignation Reason Query ===");
  const resResult = nlpEngine.parseQuery("첫 직장을 그만둔 사유 통계", context);
  console.log("Detected TargetLogic:", resResult.targetLogic);
  const hasJobExp = resResult.filters.some(f => f.label === 'isJobExperienced');
  console.log("Is 'isJobExperienced' filter present?", hasJobExp);
}

test();
