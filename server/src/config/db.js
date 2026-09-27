const { Pool } = require('pg');
const env = require('./env');

const missingDbMessage = 'DATABASE_URL is not set. Configure it before running DB-backed commands.';
if (!env.databaseUrl) console.warn(`[aheadly] ${missingDbMessage}`);

const pool = env.databaseUrl
  ? new Pool({
      connectionString: env.databaseUrl,
      ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false
    })
  : null;

const query = (text, params) => {
  if (!pool) throw new Error(missingDbMessage);
  return pool.query(text, params);
};

module.exports = {
  pool,
  query
};
