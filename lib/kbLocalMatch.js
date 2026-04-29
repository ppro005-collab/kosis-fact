import { getKbChunks } from './kbIndexer.js';
import { METRIC_METADATA } from './kosisStatLogic.js';

const PREFERRED = new Set([6, 10, 12]);

function tokenize(q) {
  return q
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function scoreChunk(queryTokens, text, bucket) {
  const tl = text.toLowerCase();
  let hit = 0;
  for (const t of queryTokens) {
    if (t.length < 2) continue;
    if (tl.includes(t)) hit += 1;
  }
  const base = hit / Math.max(1, queryTokens.length);
  const boost = PREFERRED.has(bucket) ? 1.25 : 1;
  return base * boost;
}

/**
 * KB(6·10·12 우선)에서 질문과 유사한 문서 청크를 찾고, 텍스트에서 표 번호 후보를 추출합니다.
 * @returns {{ matches: Array<{ id: string, score: number, source: string, snippet: string, bucket: number }>, suggestedMetricKey: string | null }}
 */
export function localKbMatch(query, surveyType = 'YOUTH') {
  const chunks = getKbChunks();
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return { matches: [], suggestedMetricKey: null };
  }

  const prefix = surveyType === 'WORKING_TYPE' ? 'WORK' : 'YOUTH';

  const scored = chunks
    .map(c => ({
      chunk: c,
      score: scoreChunk(queryTokens, c.text, c.bucket)
    }))
    .filter(s => s.score > 0.08)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  const matches = scored.map(s => ({
    id: s.chunk.id,
    score: Math.round(s.score * 1000) / 1000,
    source: s.chunk.source,
    snippet: s.chunk.text.slice(0, 480).replace(/\s+/g, ' ').trim(),
    bucket: s.chunk.bucket
  }));

  let suggestedMetricKey = null;

  /** 사용자 질문에만 '표 NN'이 있을 때만 표 번호를 인정 (KB 본문의 표 번호는 무시) */
  const userTableMatch = query.match(/표\s*0?(\d{1,2})/i);
  if (userTableMatch) {
    const n = String(userTableMatch[1]).padStart(2, '0');
    const key = `${prefix}_${n}`;
    if (METRIC_METADATA[key]) suggestedMetricKey = key;
  }

  /** 질문만으로 표 05(대학졸업 소요기간) 의도 — KB와 무관하게 고정 */
  if (!suggestedMetricKey) {
    const r = query.toLowerCase().replace(/\s+/g, ' ');
    const gradIntent =
      /(대학|학제|학력|교육수준)/.test(r) &&
      /(졸업까지|졸업\s*소요|졸업소요|소요\s*기간|소요기간|걸린\s*기간|걸린기간|기간을|개월)/.test(r);
    if (gradIntent) {
      const k = `${prefix}_05`;
      if (METRIC_METADATA[k]) suggestedMetricKey = k;
    }
  }

  return { matches, suggestedMetricKey };
}
