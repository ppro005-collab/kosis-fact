/**
 * 1~12번 폴더 + knowledge_source 텍스트 색인 재생성
 * Usage: node scripts/build-kb-index.mjs
 */
import { buildKbIndex, saveKbIndexToDisk } from '../lib/kbIndexer.js';

const { chunks, rootsTried } = buildKbIndex();
saveKbIndexToDisk({ chunks, builtAt: new Date().toISOString(), rootsTried });
console.log(`kb_index.json: ${chunks.length} chunks, roots: ${rootsTried.join(' | ')}`);
