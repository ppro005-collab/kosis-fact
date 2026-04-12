import fs from 'fs';
import path from 'path';

/**
 * 상위 폴더(1~12번) 및 knowledge_source를 순회해 검색용 청크 인덱스를 구축합니다.
 * 빌드 산출물: data/kb_index.json
 */

const TEXT_EXT = new Set(['.txt', '.sas', '.md', '.csv', '.json']);

function readTextSafe(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const utf8 = buffer.toString('utf8');
    if (utf8.includes('\ufffd')) throw new Error('not utf8');
    return utf8;
  } catch {
    try {
      return new TextDecoder('euc-kr').decode(fs.readFileSync(filePath));
    } catch {
      return '';
    }
  }
}

function walkFiles(dir, out, depth = 0, fixedBucket = null) {
  if (!fs.existsSync(dir) || depth > 24) return;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === '.git') continue;
      walkFiles(full, out, depth + 1, fixedBucket);
    } else {
      const ext = path.extname(ent.name).toLowerCase();
      if (TEXT_EXT.has(ext)) out.push({ full, bucket: fixedBucket });
    }
  }
}

function bucketFromPath(relPath) {
  const m = relPath.match(/^(\d+)[\\.\\s]/);
  if (m) return parseInt(m[1], 10);
  if (relPath.includes('10.') || relPath.includes('10-')) return 10;
  if (relPath.includes('12.') || relPath.includes('12-')) return 12;
  if (relPath.includes('6.') || relPath.includes('6-')) return 6;
  return 0;
}

/**
 * @returns {{ chunks: Array<{ id: string, text: string, source: string, bucket: number }>, rootsTried: string[] }}
 */
export function buildKbIndex() {
  const files = [];
  const rootsTried = [];

  const parent = path.join(process.cwd(), '..');
  if (fs.existsSync(parent)) {
    try {
      for (const name of fs.readdirSync(parent, { withFileTypes: true })) {
        if (!name.isDirectory()) continue;
        if (!/^\d{1,2}\./.test(name.name)) continue;
        const bucket = parseInt(name.name, 10) || 0;
        const subRoot = path.join(parent, name.name);
        rootsTried.push(subRoot);
        walkFiles(subRoot, files, 0, bucket);
      }
    } catch {
      /* ignore */
    }
  }

  const ks = path.join(process.cwd(), 'knowledge_source');
  if (fs.existsSync(ks)) {
    rootsTried.push(ks);
    walkFiles(ks, files);
  }

  const chunks = [];
  let id = 0;
  for (const entry of files) {
    const file = entry.full || entry;
    const presetBucket = entry.bucket;
    const rel = rootsTried.map(r => {
      try {
        return path.relative(r, file);
      } catch {
        return file;
      }
    }).find(s => !s.startsWith('..')) || path.basename(file);

    const text = readTextSafe(file);
    if (!text || text.length < 40) continue;

    const bucket = presetBucket != null ? presetBucket : bucketFromPath(rel);
    const sliceSize = 12000;
    for (let i = 0; i < text.length; i += sliceSize) {
      const slice = text.slice(i, i + sliceSize);
      chunks.push({
        id: `kb_${++id}`,
        text: slice,
        source: rel,
        bucket
      });
    }
  }

  return { chunks, rootsTried };
}

export function loadKbIndexFromDisk() {
  const p = path.join(process.cwd(), 'data', 'kb_index.json');
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

export function saveKbIndexToDisk(payload) {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, 'kb_index.json');
  fs.writeFileSync(p, JSON.stringify(payload, null, 0), 'utf8');
}

let memoryIndex = null;

export function getKbChunks() {
  if (memoryIndex?.chunks?.length) return memoryIndex.chunks;
  const disk = loadKbIndexFromDisk();
  if (disk?.chunks?.length) {
    memoryIndex = disk;
    return disk.chunks;
  }
  const built = buildKbIndex();
  memoryIndex = { chunks: built.chunks, builtAt: new Date().toISOString(), rootsTried: built.rootsTried };
  try {
    saveKbIndexToDisk(memoryIndex);
  } catch {
    /* ignore */
  }
  return memoryIndex.chunks;
}
