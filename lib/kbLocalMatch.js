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
  const topText = scored[0]?.chunk?.text || '';
  const tableMatch =
    topText.match(/표\s*0?(\d{1,2})/) ||
    query.match(/표\s*0?(\d{1,2})/i);
  if (tableMatch) {
    const n = String(tableMatch[1]).padStart(2, '0');
    const key = `${prefix}_${n}`;
    if (METRIC_METADATA[key]) suggestedMetricKey = key;
  }

  if (!suggestedMetricKey) {
    for (const [key] of Object.entries(METRIC_METADATA)) {
      if (!key.startsWith(prefix)) continue;
      const label = (METRIC_METADATA[key].label || '').replace(/\s+/g, '');
      const qns = query.replace(/\s+/g, '');
      if (label && qns.length > 3 && (qns.includes(label.slice(-8)) || label.includes(qns.slice(-8)))) {
        suggestedMetricKey = key;
        break;
      }
    }
  }

  return { matches, suggestedMetricKey };
}
