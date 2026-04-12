// lib/db.js - Adaptive DB Layer (v8.6: Auto-Init)
let db;

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

if (process.env.DATABASE_URL) {
  // CLOUD MODE (Vercel/Supabase)
  const { default: pg } = await import('pg');
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  // Auto-init Cloud Tables
  await pool.query(INIT_SQL.replace(/SERIAL PRIMARY KEY/g, 'SERIAL PRIMARY KEY').replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY'));

  db = {
    exec: (sql) => pool.query(sql),
    prepare: (sql) => ({
      run: (...args) => pool.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), args),
      get: async (...args) => {
        const res = await pool.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), args);
        return res.rows[0];
      },
      all: async (...args) => {
        const res = await pool.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), args);
        return res.rows;
      }
    })
  };
} else {
  // LOCAL MODE (Development)
  const { default: Database } = await import('better-sqlite3');
  const sqlite = new Database('kosis_md.db');
  
  // Auto-init Local Tables
  sqlite.exec(INIT_SQL.replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT').replace(/TIMESTAMP/g, 'DATETIME'));
  
  db = {
    exec: (sql) => sqlite.exec(sql),
    prepare: (sql) => sqlite.prepare(sql)
  };
}

export default db;
