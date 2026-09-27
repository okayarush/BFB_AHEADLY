const env = require('../config/env');

const requireRole = (allowedRoles) => (req, res, next) => {
  const role = String(req.headers['x-user-role'] || env.defaultRole || '').toUpperCase();
  const userName = String(req.headers['x-user-name'] || '').trim() || `${role} User`;
  const secret = String(req.headers['x-role-secret'] || '');

  if (env.roleHeaderSecret && secret !== env.roleHeaderSecret) {
    return res.status(401).json({ success: false, error: 'Invalid role secret' });
  }

  if (!allowedRoles.includes(role)) {
    return res.status(403).json({ success: false, error: `Role ${role || 'UNKNOWN'} not allowed` });
  }

  req.actor = { role, userName };
  next();
};

module.exports = { requireRole };
