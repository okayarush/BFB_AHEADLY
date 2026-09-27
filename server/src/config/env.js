const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: process.env.DOTENV_PATH || path.resolve(process.cwd(), '.env') });

const parseOrigins = (value) => {
  if (!value) return ['http://localhost:3000', 'http://127.0.0.1:3000'];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
};

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  databaseUrl: process.env.DATABASE_URL || '',
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
  roleHeaderSecret: process.env.ROLE_HEADER_SECRET || '',
  defaultRole: process.env.DEFAULT_ROLE || 'SMC'
};
