const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    if (stack) {
      return `${timestamp} ${level}: ${message}\n${stack}`;
    }
    return `${timestamp} ${level}: ${message}`;
  })
);

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'nasa-healthy-cities',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    
    // Combined logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    
    // NASA API specific logs
    new winston.transports.File({
      filename: path.join(logsDir, 'nasa-api.log'),
      level: 'info',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 3,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          // Only log NASA API related messages
          if (message.includes('NASA API') || message.includes('nasa')) {
            return JSON.stringify({ timestamp, level, message, ...meta });
          }
          return '';
        })
      )
    })
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 2
    })
  ],
  
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 2
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
} else {
  // In production, only log errors to console
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'error'
  }));
}

// Create a stream object for Morgan HTTP logging
logger.stream = {
  write: function(message, encoding) {
    logger.info(message.trim());
  }
};

// Helper functions for structured logging
logger.logNASARequest = (method, url, params = {}) => {
  logger.info('NASA API Request', {
    type: 'nasa_api_request',
    method,
    url,
    params,
    timestamp: new Date().toISOString()
  });
};

logger.logNASAResponse = (url, status, responseTime, dataSize = null) => {
  logger.info('NASA API Response', {
    type: 'nasa_api_response',
    url,
    status,
    responseTime,
    dataSize,
    timestamp: new Date().toISOString()
  });
};

logger.logNASAError = (url, error, params = {}) => {
  logger.error('NASA API Error', {
    type: 'nasa_api_error',
    url,
    error: error.message,
    stack: error.stack,
    params,
    timestamp: new Date().toISOString()
  });
};

logger.logInterventionCalculation = (type, parameters, result) => {
  logger.info('Intervention Calculation', {
    type: 'intervention_calculation',
    interventionType: type,
    parameters,
    result,
    timestamp: new Date().toISOString()
  });
};

logger.logRiskAssessment = (location, riskFactors, overallRisk) => {
  logger.info('Risk Assessment', {
    type: 'risk_assessment',
    location,
    riskFactors,
    overallRisk,
    timestamp: new Date().toISOString()
  });
};

logger.logUserAction = (action, userId = null, metadata = {}) => {
  logger.info('User Action', {
    type: 'user_action',
    action,
    userId,
    metadata,
    timestamp: new Date().toISOString()
  });
};

logger.logPerformanceMetric = (operation, duration, metadata = {}) => {
  logger.info('Performance Metric', {
    type: 'performance',
    operation,
    duration,
    metadata,
    timestamp: new Date().toISOString()
  });
};

// Log startup information
logger.info('Logger initialized', {
  environment: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  logsDirectory: logsDir
});

module.exports = logger;
