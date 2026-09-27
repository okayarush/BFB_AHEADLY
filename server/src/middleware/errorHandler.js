const { ApiError } = require('../utils/errors');

const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

const errorHandler = (err, _req, res, _next) => {
  const status = err.status || 500;
  const payload = {
    success: false,
    error: err.message || 'Internal server error'
  };

  if (err.details) payload.details = err.details;
  if (status >= 500) payload.trace = process.env.NODE_ENV === 'development' ? err.stack : undefined;

  res.status(status).json(payload);
};

module.exports = { notFound, errorHandler };
