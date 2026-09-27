const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

async function run() {
  if (!pool) throw new Error('DATABASE_URL is not set. Configure it before running migrations.');
  const sql = fs.readFileSync(path.join(__dirname, '../src/db/migrations/001_init.sql'), 'utf8');
  await pool.query(sql);
  console.log('[migrate] schema applied');
}

run()
  .catch((err) => {
    console.error('[migrate] failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (pool) await pool.end();
  });
