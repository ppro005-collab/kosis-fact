import fs from 'fs';
import Papa from 'papaparse';
import { AnalystAgent } from '../lib/agents/analyst.js';
import { METRIC_METADATA, PREREQ_MAP } from '../lib/kosisStatLogic.js';

function runTotalVerification() {
  console.log("==============================================");
  console.log(" KOSIS MDIS AGGREGATION PIPELINE VERIFICATION ");
  console.log("==============================================\n");

  const youthData = Papa.parse(fs.readFileSync('data/YOUTH_2025.csv', 'utf-8'), { header: true }).data;
  // const workData = Papa.parse(fs.readFileSync('data/WORKING_TYPE_2025.csv', 'utf-8'), { header: true }).data;

  // Verify YOUTH tables
  const youthTables = ['YOUTH_01', 'YOUTH_02', 'YOUTH_03', 'YOUTH_05', 'YOUTH_11', 'YOUTH_18'];

  youthTables.forEach(t => {
    console.log(`\n▶ VERIFYING: ${t} (${METRIC_METADATA[t].label})`);
    
    // Simulate Planner
    const filters = METRIC_METADATA[t].prerequisites.map(p => ({ fnKey: p }));
    const queryPlan = {
      metric: t,
      filters: filters,
      dimensions: ['성별']
    };

    const results = AnalystAgent.analyze(youthData, queryPlan);
    
    // Quick summary grouping
    const sumMap = {};
    results.forEach(r => {
      const key = `${r.category}`;
      if (!sumMap[key]) sumMap[key] = { 남: "-", 여: "-" };
      if (r.dimension === '남자') sumMap[key]['남'] = r.value;
      if (r.dimension === '여자') sumMap[key]['여'] = r.value;
    });

    console.table(sumMap);
  });
}

runTotalVerification();
