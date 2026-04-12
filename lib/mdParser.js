import { identifyDataset, DATASET_CONFIGS } from './datasetConfigs.js';
import { METRIC_METADATA, getFirstJobAttribute } from './kosisStatLogic.js';

export const mdParser = {
  aggregateData: function(data, queryPlan) {
    if (!data || data.length === 0) return [];

    const surveyType = queryPlan.surveyType || identifyDataset(Object.keys(data[0]))[0];
    const config = DATASET_CONFIGS[surveyType];
    const meta = METRIC_METADATA[queryPlan.metric];

    if (!meta) return [];

    // 1. Grouping by dimensions (Gender, Age, etc.)
    const groups = {};
    data.forEach(row => {
      // Apply filters (e.g., Age 15-29, Graduate/Dropout)
      let pass = true;
      if (queryPlan.filters) {
        for (const filter of queryPlan.filters) {
          if (!filter.fn(row)) {
            pass = false;
            break;
          }
        }
      }
      if (!pass) return;

      const dimValues = queryPlan.dimensions.map(dim => {
        if (dim === '\uc131\ubcc4' || dim === 'gender') return (parseInt(row['\uc131\ubcc4\ucf54\ub4dc']) === 1 ? '\ub0a8\uc790' : '\uc5ec\uc790');
        return 'Total';
      });
      const groupKey = dimValues.join(' | ');

      if (!groups[groupKey]) groups[groupKey] = { label: groupKey, count: 0, sum: 0, weightSum: 0 };
      
      const weight = parseFloat(row['\uac00\uc911\uac12'] || row['weight'] || 1);
      groups[groupKey].weightSum += weight;

      // Extract value based on logicKey (e.g., monthlyWage, getEconomicStatus)
      // Note: For 'count' type, we just aggregate weights of rows matching certain criteria
      // For 'average' type, we aggregate (value * weight)
      groups[groupKey].count += weight;
    });

    // 2. Format results
    return Object.values(groups).map(g => ({
      label: g.label,
      value: Math.round(g.weightSum / 1000), // Standard unit: 1000 persons
      unit: meta.unit
    }));
  }
};
