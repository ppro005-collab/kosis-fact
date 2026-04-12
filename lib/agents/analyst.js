import { METRIC_METADATA, PREREQ_MAP, statLogic } from '../kosisStatLogic.js';
import { labelToDimExtractor, logicSecondaryLabel } from '../planBuilder.js';

/**
 * 가중 마이크로데이터 집계 (pandas groupby·가중평균과 동일 로직, 런타임은 JS).
 */
export const AnalystAgent = {
  analyze: (data, queryPlan) => {
    if (!data || data.length === 0) return [];

    const meta = METRIC_METADATA[queryPlan.metric];
    if (!meta) return [];

    const logicKey = meta.logicKey;
    const valueExtractor = statLogic[logicKey];

    const groupByLabels =
      queryPlan.groupByLabels ||
      (queryPlan.groupBys || []).map(g => g.label) ||
      queryPlan.dimensions ||
      ['성별', logicSecondaryLabel(logicKey)];

    const dimExtractors = groupByLabels.map(lab => labelToDimExtractor(lab, logicKey));

    const filteredRows = data.filter(row => {
      if (queryPlan.filters) {
        for (const f of queryPlan.filters) {
          const fn = PREREQ_MAP[f.fnKey];
          if (fn && !fn(row)) return false;
        }
      }
      return true;
    });

    if (meta.type === 'average') {
      const acc = {};
      for (const row of filteredRows) {
        const keys = dimExtractors.map(fn => fn(row));
        const k = keys.join('|');
        const w = parseFloat(row['가중값'] || 1);
        const val = valueExtractor(row);
        if (!acc[k]) acc[k] = { sum: 0, w: 0 };
        acc[k].sum += val * w;
        acc[k].w += w;
      }
      return Object.entries(acc)
        .map(([key, v]) => {
          const groupKeys = key.split('|');
          const avg = v.w > 0 ? v.sum / v.w : 0;
          return {
            groupKeys,
            value: Math.round(avg * 10) / 10,
            unit: meta.unit || '개월',
            dimension: groupKeys[0],
            category: groupKeys.slice(1).join(' / ') || '평균'
          };
        })
        .sort((a, b) => String(a.groupKeys).localeCompare(String(b.groupKeys), 'ko'));
    }

    const acc = {};
    for (const row of filteredRows) {
      const keys = dimExtractors.map(fn => fn(row));
      const k = keys.join('|');
      const w = parseFloat(row['가중값'] || 1);
      if (!acc[k]) acc[k] = 0;
      acc[k] += w;
    }

    return Object.entries(acc)
      .map(([key, wSum]) => {
        const groupKeys = key.split('|');
        return {
          groupKeys,
          value: Math.round(wSum / 1000000),
          unit: '천 명',
          dimension: groupKeys[0],
          category: groupKeys.slice(1).join(' / ') || '전체'
        };
      })
      .sort((a, b) => String(a.groupKeys).localeCompare(String(b.groupKeys), 'ko'));
  }
};
