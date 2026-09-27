const logger = require('../utils/logger');

/**
 * Global error handling middleware
 * Handles all errors thrown in the application
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error Handler:', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = 'Invalid input data';
    error = { message, statusCode: 400 };
  }

  // Axios errors (NASA API calls)
  if (err.isAxiosError) {
    const message = err.response?.data?.message || 'External API error';
    const statusCode = err.response?.status || 503;
    error = { message, statusCode };
    
    logger.error('External API Error:', {
      url: err.config?.url,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data
    });
  }

  // Rate limit errors
  if (err.statusCode === 429) {
    const message = 'Too many requests, please try again later';
    error = { message, statusCode: 429 };
  }

  // NASA API specific errors
  if (err.message?.includes('NASA') || err.config?.url?.includes('nasa')) {
    logger.logNASAError(err.config?.url || 'unknown', err, err.config?.params);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  });
};

// Not found handler
const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};

// Export default as errorHandler for backward compatibility
module.exports = errorHandler;
