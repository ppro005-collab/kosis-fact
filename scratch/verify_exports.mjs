import * as sl from '../lib/statLogic.js';
console.log('METRIC_METADATA found:', !!sl.METRIC_METADATA);
console.log('PREREQ_MAP found:', !!sl.PREREQ_MAP);
console.log('statLogic found:', !!sl.statLogic);
console.log('getFirstJobAttribute found:', !!sl.getFirstJobAttribute);
if (sl.getFirstJobAttribute) {
  console.log('getFirstJobAttribute is a function:', typeof sl.getFirstJobAttribute === 'function');
}
