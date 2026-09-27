const { ApiError } = require('../utils/errors');

const requireFields = (fields) => (req, _res, next) => {
  const missing = fields.filter((field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === '');
  if (missing.length > 0) {
    return next(new ApiError(400, `Missing required fields: ${missing.join(', ')}`));
  }
  next();
};

module.exports = { requireFields };
