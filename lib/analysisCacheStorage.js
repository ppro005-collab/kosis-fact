import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CACHE_DIR = path.join(process.cwd(), 'data', 'analysis_response_cache');

function ensureDir() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function hashQuery(q) {
  return crypto.createHash('sha256').update(q.trim().toLowerCase(), 'utf8').digest('hex');
}

export function getAnalysisResponseCache(query) {
  try {
    ensureDir();
    const file = path.join(CACHE_DIR, `${hashQuery(query)}.json`);
    if (!fs.existsSync(file)) return null;
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    return raw?.payload || null;
  } catch {
    return null;
  }
}

export function setAnalysisResponseCache(query, payload) {
  try {
    ensureDir();
    const file = path.join(CACHE_DIR, `${hashQuery(query)}.json`);
    fs.writeFileSync(
      file,
      JSON.stringify({ savedAt: new Date().toISOString(), payload }, null, 0),
      'utf8'
    );
  } catch (e) {
    console.warn('analysis response cache write:', e.message);
  }
}
