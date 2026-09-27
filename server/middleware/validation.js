const Joi = require('joi');
const logger = require('../utils/logger');

// Validation schemas
const coordinateSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required()
    .messages({
      'number.min': 'Latitude must be between -90 and 90 degrees',
      'number.max': 'Latitude must be between -90 and 90 degrees',
      'any.required': 'Latitude is required'
    }),
  longitude: Joi.number().min(-180).max(180).required()
    .messages({
      'number.min': 'Longitude must be between -180 and 180 degrees',
      'number.max': 'Longitude must be between -180 and 180 degrees',
      'any.required': 'Longitude is required'
    })
});

const dateRangeSchema = Joi.object({
  start_date: Joi.date().iso().optional()
    .messages({
      'date.format': 'Start date must be in ISO format (YYYY-MM-DD)'
    }),
  end_date: Joi.date().iso().min(Joi.ref('start_date')).optional()
    .messages({
      'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
      'date.min': 'End date must be after start date'
    })
});

const interventionSchema = Joi.object({
  type: Joi.string().valid(
    'tree_planting',
    'cool_roofs',
    'wetlands',
    'green_corridors',
    'green_walls',
    'permeable_surfaces'
  ).required()
    .messages({
      'any.only': 'Intervention type must be one of: tree_planting, cool_roofs, wetlands, green_corridors, green_walls, permeable_surfaces'
    }),
  quantity: Joi.number().min(1).required()
    .messages({
      'number.min': 'Quantity must be at least 1'
    }),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    area: Joi.number().min(0).optional()
  }).optional(),
  budget: Joi.number().min(0).optional(),
  timeline: Joi.number().min(1).max(50).optional()
    .messages({
      'number.min': 'Timeline must be at least 1 year',
      'number.max': 'Timeline cannot exceed 50 years'
    }),
  priority: Joi.string().valid('low', 'medium', 'high').optional()
});

const costBenefitSchema = Joi.object({
  interventions: Joi.array().items(interventionSchema).min(1).required()
    .messages({
      'array.min': 'At least one intervention is required'
    }),
  budget: Joi.number().min(0).required()
    .messages({
      'number.min': 'Budget must be a positive number'
    }),
  timeline: Joi.number().min(1).max(50).required()
    .messages({
      'number.min': 'Timeline must be at least 1 year',
      'number.max': 'Timeline cannot exceed 50 years'
    }),
  priorities: Joi.object({
    heat_reduction: Joi.number().min(0).max(1).optional(),
    flood_mitigation: Joi.number().min(0).max(1).optional(),
    air_quality: Joi.number().min(0).max(1).optional(),
    biodiversity: Joi.number().min(0).max(1).optional()
  }).optional()
});

// Middleware functions
const validateCoordinates = (req, res, next) => {
  const coordinates = {
    latitude: parseFloat(req.query.latitude || req.body.latitude),
    longitude: parseFloat(req.query.longitude || req.body.longitude)
  };

  const { error } = coordinateSchema.validate(coordinates);
  
  if (error) {
    logger.warn('Coordinate validation failed:', {
      error: error.details[0].message,
      coordinates,
      url: req.originalUrl
    });
    
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
      field: error.details[0].path[0]
    });
  }

  // Add parsed coordinates to request
  req.coordinates = coordinates;
  next();
};

const validateDateRange = (req, res, next) => {
  const dateRange = {
    start_date: req.query.start_date || req.body.start_date,
    end_date: req.query.end_date || req.body.end_date
  };

  // Set default date range if not provided
  if (!dateRange.start_date) {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    dateRange.start_date = oneYearAgo.toISOString().split('T')[0];
  }

  if (!dateRange.end_date) {
    dateRange.end_date = new Date().toISOString().split('T')[0];
  }

  const { error } = dateRangeSchema.validate(dateRange);
  
  if (error) {
    logger.warn('Date range validation failed:', {
      error: error.details[0].message,
      dateRange,
      url: req.originalUrl
    });
    
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
      field: error.details[0].path[0]
    });
  }

  // Validate date range is not too large (max 5 years)
  const startDate = new Date(dateRange.start_date);
  const endDate = new Date(dateRange.end_date);
  const diffYears = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365);
  
  if (diffYears > 5) {
    return res.status(400).json({
      success: false,
      error: 'Date range cannot exceed 5 years',
      field: 'date_range'
    });
  }

  req.dateRange = dateRange;
  next();
};

const validateIntervention = (req, res, next) => {
  const { error } = interventionSchema.validate(req.body);
  
  if (error) {
    logger.warn('Intervention validation failed:', {
      error: error.details[0].message,
      body: req.body,
      url: req.originalUrl
    });
    
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
      field: error.details[0].path[0]
    });
  }

  next();
};

const validateCostBenefit = (req, res, next) => {
  const { error } = costBenefitSchema.validate(req.body);
  
  if (error) {
    logger.warn('Cost-benefit validation failed:', {
      error: error.details[0].message,
      body: req.body,
      url: req.originalUrl
    });
    
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
      field: error.details[0].path.join('.')
    });
  }

  // Validate that priorities sum to 1 if provided
  if (req.body.priorities) {
    const prioritySum = Object.values(req.body.priorities).reduce((sum, val) => sum + val, 0);
    if (Math.abs(prioritySum - 1) > 0.01) { // Allow small floating point errors
      return res.status(400).json({
        success: false,
        error: 'Priorities must sum to 1.0',
        field: 'priorities'
      });
    }
  }

  next();
};

// Generic validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      logger.warn('Validation failed:', {
        error: error.details[0].message,
        body: req.body,
        url: req.originalUrl
      });
      
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
        field: error.details[0].path.join('.')
      });
    }

    next();
  };
};

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove any potentially dangerous characters
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Basic XSS prevention
        sanitized[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
          .replace(/javascript:/gi, '')
          .trim();
      } else if (typeof value === 'object') {
        sanitized[key] = sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  if (req.query) {
    req.query = sanitize(req.query);
  }

  next();
};

// Rate limiting validation
const validateRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    
    // Clean up old entries
    if (requests.has(clientId)) {
      const clientRequests = requests.get(clientId);
      const validRequests = clientRequests.filter(time => now - time < windowMs);
      requests.set(clientId, validRequests);
    }
    
    const clientRequests = requests.get(clientId) || [];
    
    if (clientRequests.length >= maxRequests) {
      logger.warn('Rate limit exceeded:', {
        clientId,
        requests: clientRequests.length,
        url: req.originalUrl
      });
      
      return res.status(429).json({
        success: false,
        error: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 60000} minutes.`,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    clientRequests.push(now);
    requests.set(clientId, clientRequests);
    
    next();
  };
};

module.exports = {
  validateCoordinates,
  validateDateRange,
  validateIntervention,
  validateCostBenefit,
  validate,
  sanitizeInput,
  validateRateLimit,
  schemas: {
    coordinateSchema,
    dateRangeSchema,
    interventionSchema,
    costBenefitSchema
  }
};
