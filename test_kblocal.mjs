import { localKbMatch } from './lib/kbLocalMatch.js';

const q = "2021~2024년 기준 대학졸업까지 걸린 기간을 교육수준별, 성별로 집계해줘! (캐시우회용)";
const result = localKbMatch(q);
console.log(result.suggestedMetricKey);
