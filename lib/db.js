// lib/db.js - Adaptive DB Layer (v8.7: Lazy-Init)
let pool = null;
let sqlite = null;
let isPg = false;
let initPromise = null;

const INIT_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    userId TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL, 
    name TEXT NOT NULL,
    approved INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS datasets (
    id SERIAL PRIMARY KEY,
    year TEXT UNIQUE NOT NULL,
    filePath TEXT NOT NULL,
    uploadedBy INTEGER,
    uploadDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

async function initDb() {
  if (pool || sqlite) return;
  // 빌드 타임 패스
  if (process.env.npm_lifecycle_event === 'build') return;

  if (process.env.DATABASE_URL) {
    isPg = true;
    const { default: pg } = await import('pg');
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    await pool.query(INIT_SQL.replace(/SERIAL PRIMARY KEY/g, 'SERIAL PRIMARY KEY').replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY'));
  } else {
    isPg = false;
    const { default: Database } = await import('better-sqlite3');
    sqlite = new Database('kosis_md.db');
    sqlite.exec(INIT_SQL.replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT').replace(/TIMESTAMP/g, 'DATETIME'));
  }
}

function ensureInit() {
  if (!initPromise) initPromise = initDb();
  return initPromise;
}

const db = {
  exec: async (sql) => {
    await ensureInit();
    if (isPg) return pool.query(sql);
    else return sqlite.exec(sql);
  },
  prepare: (sql) => ({
    run: async (...args) => {
      await ensureInit();
      if (isPg) return pool.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), args);
      else return sqlite.prepare(sql).run(...args);
    },
    get: async (...args) => {
      await ensureInit();
      if (isPg) {
        const res = await pool.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), args);
        return res.rows[0];
      }
      else return sqlite.prepare(sql).get(...args);
    },
    all: async (...args) => {
      await ensureInit();
      if (isPg) {
        const res = await pool.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), args);
        return res.rows;
      }
      else return sqlite.prepare(sql).all(...args);
    }
  })
};

export default db;
