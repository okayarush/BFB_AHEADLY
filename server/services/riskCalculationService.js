const logger = require('../utils/logger');
const { cacheManager } = require('../utils/cache');

/**
 * Risk calculation service for environmental assessment
 * Processes NASA data to generate risk indices for urban planning
 */

// Risk thresholds and weights
const RISK_THRESHOLDS = {
  temperature: {
    low: 25,
    medium: 30,
    high: 35,
    very_high: 40
  },
  precipitation: {
    low: 10,
    medium: 25,
    high: 50,
    very_high: 100
  },
  airQuality: {
    good: 50,
    moderate: 100,
    unhealthy: 150,
    very_unhealthy: 200
  },
  vegetation: {
    excellent: 0.7,
    good: 0.5,
    fair: 0.3,
    poor: 0.1
  },
  elevation: {
    high_flood_risk: 10,
    medium_flood_risk: 20,
    low_flood_risk: 50
  }
};

// Risk weights for overall calculation
const RISK_WEIGHTS = {
  heat: 0.25,
  flood: 0.30,
  airQuality: 0.25,
  vegetation: 0.20
};

/**
 * Calculate comprehensive risk indices for a location
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {object} options - Additional options and parameters
 * @returns {object} Risk assessment results
 */
async function calculateRiskIndices(latitude, longitude, options = {}) {
  try {
    logger.info(`Calculating risk indices for ${latitude}, ${longitude}`);
    
    // Check cache first
    const cacheKey = `risk_${latitude}_${longitude}`;
    const cachedResult = cacheManager.get(cacheKey, 'risk');
    
    if (cachedResult && !options.forceRefresh) {
      logger.info('Returning cached risk indices');
      return cachedResult;
    }

    // For demo purposes, generate realistic risk data
    // In production, this would fetch actual NASA data
    const riskData = await generateRiskAssessment(latitude, longitude, options);
    
    // Cache the result
    cacheManager.set(cacheKey, riskData, 1800, 'risk'); // Cache for 30 minutes
    
    logger.logRiskAssessment(
      { latitude, longitude },
      riskData.factors,
      riskData.overallRisk
    );
    
    return riskData;
  } catch (error) {
    logger.error('Error calculating risk indices:', error);
    throw new Error(`Risk calculation failed: ${error.message}`);
  }
}

/**
 * Generate risk assessment based on location characteristics
 */
async function generateRiskAssessment(latitude, longitude, options = {}) {
  const location = { latitude, longitude };
  
  // Calculate individual risk factors
  const heatRisk = calculateHeatRisk(location);
  const floodRisk = calculateFloodRisk(location);
  const airQualityRisk = calculateAirQualityRisk(location);
  const vegetationRisk = calculateVegetationRisk(location);
  
  // Calculate composite indices
  const urbanHeatIslandIndex = calculateUrbanHeatIslandIndex(location);
  const climateResilienceIndex = calculateClimateResilienceIndex({
    heat: heatRisk.level,
    flood: floodRisk.level,
    airQuality: airQualityRisk.level,
    vegetation: vegetationRisk.level
  });
  
  // Calculate overall risk
  const overallRisk = calculateOverallRisk({
    heat: heatRisk.score,
    flood: floodRisk.score,
    airQuality: airQualityRisk.score,
    vegetation: vegetationRisk.score
  });
  
  // Generate recommendations
  const recommendations = generateRecommendations({
    heat: heatRisk,
    flood: floodRisk,
    airQuality: airQualityRisk,
    vegetation: vegetationRisk,
    overall: overallRisk
  });
  
  // Generate intervention priorities
  const interventionPriorities = calculateInterventionPriorities({
    heat: heatRisk.score,
    flood: floodRisk.score,
    airQuality: airQualityRisk.score,
    vegetation: vegetationRisk.score
  });

  return {
    location,
    timestamp: new Date().toISOString(),
    factors: {
      heatRisk: heatRisk.level,
      floodRisk: floodRisk.level,
      airQualityRisk: airQualityRisk.level,
      vegetationRisk: vegetationRisk.level
    },
    scores: {
      heat: heatRisk.score,
      flood: floodRisk.score,
      airQuality: airQualityRisk.score,
      vegetation: vegetationRisk.score
    },
    indices: {
      urbanHeatIsland: urbanHeatIslandIndex,
      climateResilience: climateResilienceIndex,
      overall: overallRisk.score
    },
    overallRisk: overallRisk.level,
    confidence: calculateConfidenceLevel(location),
    recommendations,
    interventionPriorities,
    metadata: {
      calculationMethod: 'composite_risk_assessment',
      version: '1.0',
      dataSource: 'NASA Earth Observations',
      updateFrequency: 'hourly'
    }
  };
}

/**
 * Calculate heat risk based on temperature and urban characteristics
 */
function calculateHeatRisk(location) {
  const { latitude, longitude } = location;
  
  // Urban heat island effect factors
  const isUrban = isUrbanArea(latitude, longitude);
  const populationDensity = estimatePopulationDensity(latitude, longitude);
  
  // Base temperature estimation (simplified)
  const baseTemp = estimateAverageTemperature(latitude);
  
  // Urban heat island adjustment
  let adjustedTemp = baseTemp;
  if (isUrban) {
    adjustedTemp += 2 + (populationDensity / 1000) * 0.5; // UHI effect
  }
  
  // Seasonal variation
  const seasonalFactor = getSeasonalFactor();
  adjustedTemp += seasonalFactor;
  
  // Calculate risk level and score
  let level, score;
  if (adjustedTemp >= RISK_THRESHOLDS.temperature.very_high) {
    level = 'very_high';
    score = 0.9 + (adjustedTemp - RISK_THRESHOLDS.temperature.very_high) * 0.02;
  } else if (adjustedTemp >= RISK_THRESHOLDS.temperature.high) {
    level = 'high';
    score = 0.7 + (adjustedTemp - RISK_THRESHOLDS.temperature.high) * 0.04;
  } else if (adjustedTemp >= RISK_THRESHOLDS.temperature.medium) {
    level = 'medium';
    score = 0.4 + (adjustedTemp - RISK_THRESHOLDS.temperature.medium) * 0.06;
  } else {
    level = 'low';
    score = Math.max(0.1, adjustedTemp / RISK_THRESHOLDS.temperature.medium * 0.4);
  }
  
  return {
    level,
    score: Math.min(1.0, score),
    temperature: adjustedTemp,
    factors: {
      baseTemperature: baseTemp,
      urbanHeatIsland: isUrban ? adjustedTemp - baseTemp : 0,
      seasonalVariation: seasonalFactor
    }
  };
}

/**
 * Calculate flood risk based on precipitation and topography
 */
function calculateFloodRisk(location) {
  const { latitude, longitude } = location;
  
  // Estimate elevation and drainage
  const elevation = estimateElevation(latitude, longitude);
  const drainageQuality = estimateDrainageQuality(latitude, longitude);
  const coastalProximity = estimateCoastalProximity(latitude, longitude);
  
  // Precipitation patterns
  const annualRainfall = estimateAnnualRainfall(latitude, longitude);
  const extremeEventsProbability = estimateExtremeEventsProbability(latitude, longitude);
  
  // Base flood risk calculation
  let baseRisk = 0.1;
  
  // Elevation factor
  if (elevation < RISK_THRESHOLDS.elevation.high_flood_risk) {
    baseRisk += 0.4;
  } else if (elevation < RISK_THRESHOLDS.elevation.medium_flood_risk) {
    baseRisk += 0.2;
  }
  
  // Precipitation factor
  if (annualRainfall > 150) {
    baseRisk += 0.3;
  } else if (annualRainfall > 100) {
    baseRisk += 0.2;
  }
  
  // Drainage factor
  if (drainageQuality === 'poor') {
    baseRisk += 0.2;
  } else if (drainageQuality === 'fair') {
    baseRisk += 0.1;
  }
  
  // Coastal factor
  baseRisk += coastalProximity * 0.2;
  
  // Extreme events factor
  baseRisk += extremeEventsProbability * 0.1;
  
  const score = Math.min(1.0, baseRisk);
  
  let level;
  if (score >= 0.8) level = 'very_high';
  else if (score >= 0.6) level = 'high';
  else if (score >= 0.4) level = 'medium';
  else level = 'low';
  
  return {
    level,
    score,
    factors: {
      elevation,
      annualRainfall,
      drainageQuality,
      coastalProximity,
      extremeEventsProbability
    }
  };
}

/**
 * Calculate air quality risk
 */
function calculateAirQualityRisk(location) {
  const { latitude, longitude } = location;
  
  const isUrban = isUrbanArea(latitude, longitude);
  const industrialActivity = estimateIndustrialActivity(latitude, longitude);
  const trafficDensity = estimateTrafficDensity(latitude, longitude);
  const windPatterns = estimateWindPatterns(latitude, longitude);
  
  // Base AQI estimation
  let baseAQI = 30; // Clean air baseline
  
  if (isUrban) {
    baseAQI += 40;
  }
  
  baseAQI += industrialActivity * 30;
  baseAQI += trafficDensity * 25;
  baseAQI -= windPatterns * 10; // Good ventilation reduces pollution
  
  const score = Math.min(1.0, Math.max(0.1, baseAQI / 200));
  
  let level;
  if (baseAQI >= RISK_THRESHOLDS.airQuality.very_unhealthy) level = 'very_high';
  else if (baseAQI >= RISK_THRESHOLDS.airQuality.unhealthy) level = 'high';
  else if (baseAQI >= RISK_THRESHOLDS.airQuality.moderate) level = 'medium';
  else level = 'low';
  
  return {
    level,
    score,
    aqi: Math.round(baseAQI),
    factors: {
      urbanInfluence: isUrban ? 40 : 0,
      industrialActivity: industrialActivity * 30,
      trafficDensity: trafficDensity * 25,
      ventilation: windPatterns * 10
    }
  };
}

/**
 * Calculate vegetation/green space risk
 */
function calculateVegetationRisk(location) {
  const { latitude, longitude } = location;
  
  const isUrban = isUrbanArea(latitude, longitude);
  const climateZone = getClimateZone(latitude);
  const landUseIntensity = estimateLandUseIntensity(latitude, longitude);
  
  // Base NDVI estimation
  let baseNDVI = 0.6; // Natural vegetation baseline
  
  if (isUrban) {
    baseNDVI *= 0.3; // Urban areas have much less vegetation
  }
  
  // Climate zone adjustment
  if (climateZone === 'arid') baseNDVI *= 0.5;
  else if (climateZone === 'temperate') baseNDVI *= 0.9;
  else if (climateZone === 'tropical') baseNDVI *= 1.1;
  
  // Land use adjustment
  baseNDVI *= (1 - landUseIntensity * 0.5);
  
  const score = Math.max(0.1, 1 - baseNDVI);
  
  let level;
  if (baseNDVI < RISK_THRESHOLDS.vegetation.poor) level = 'very_high';
  else if (baseNDVI < RISK_THRESHOLDS.vegetation.fair) level = 'high';
  else if (baseNDVI < RISK_THRESHOLDS.vegetation.good) level = 'medium';
  else level = 'low';
  
  return {
    level,
    score,
    ndvi: baseNDVI,
    greenCoverage: baseNDVI * 100,
    factors: {
      urbanization: isUrban,
      climateZone,
      landUseIntensity
    }
  };
}

/**
 * Calculate urban heat island index
 */
function calculateUrbanHeatIslandIndex(location) {
  const { latitude, longitude } = location;
  
  const isUrban = isUrbanArea(latitude, longitude);
  if (!isUrban) return 0;
  
  const populationDensity = estimatePopulationDensity(latitude, longitude);
  const buildingDensity = estimateBuildingDensity(latitude, longitude);
  const vegetationCover = estimateVegetationCover(latitude, longitude);
  
  // UHI index calculation (0-1 scale)
  const uhiIndex = Math.min(1.0, 
    (populationDensity / 10000) * 0.4 +
    buildingDensity * 0.4 +
    (1 - vegetationCover) * 0.2
  );
  
  return uhiIndex;
}

/**
 * Calculate climate resilience index
 */
function calculateClimateResilienceIndex(risks) {
  // Inverse of risk - higher resilience means lower risk
  const riskScores = {
    heat: getRiskScore(risks.heat),
    flood: getRiskScore(risks.flood),
    airQuality: getRiskScore(risks.airQuality),
    vegetation: getRiskScore(risks.vegetation)
  };
  
  const averageRisk = Object.values(riskScores).reduce((sum, score) => sum + score, 0) / 4;
  return Math.max(0, 1 - averageRisk);
}

/**
 * Calculate overall risk score
 */
function calculateOverallRisk(scores) {
  const weightedScore = 
    scores.heat * RISK_WEIGHTS.heat +
    scores.flood * RISK_WEIGHTS.flood +
    scores.airQuality * RISK_WEIGHTS.airQuality +
    scores.vegetation * RISK_WEIGHTS.vegetation;
  
  let level;
  if (weightedScore >= 0.8) level = 'very_high';
  else if (weightedScore >= 0.6) level = 'high';
  else if (weightedScore >= 0.4) level = 'medium';
  else level = 'low';
  
  return { level, score: weightedScore };
}

/**
 * Generate recommendations based on risk assessment
 */
function generateRecommendations(riskData) {
  const recommendations = [];
  
  if (riskData.heat.level === 'high' || riskData.heat.level === 'very_high') {
    recommendations.push({
      type: 'heat_mitigation',
      priority: 'high',
      title: 'Implement Heat Mitigation Strategies',
      description: 'Consider urban tree planting, cool roofs, and green infrastructure to reduce urban heat island effect.',
      interventions: ['tree_planting', 'cool_roofs', 'green_walls'],
      expectedImpact: 'high'
    });
  }
  
  if (riskData.flood.level === 'high' || riskData.flood.level === 'very_high') {
    recommendations.push({
      type: 'flood_management',
      priority: 'high',
      title: 'Enhance Flood Management',
      description: 'Implement sustainable drainage systems, wetlands, and permeable surfaces.',
      interventions: ['wetlands', 'permeable_surfaces', 'green_corridors'],
      expectedImpact: 'high'
    });
  }
  
  if (riskData.airQuality.level === 'high' || riskData.airQuality.level === 'very_high') {
    recommendations.push({
      type: 'air_quality_improvement',
      priority: 'medium',
      title: 'Improve Air Quality',
      description: 'Increase green spaces and implement air-purifying vegetation.',
      interventions: ['tree_planting', 'green_walls', 'green_corridors'],
      expectedImpact: 'medium'
    });
  }
  
  if (riskData.vegetation.level === 'high' || riskData.vegetation.level === 'very_high') {
    recommendations.push({
      type: 'green_infrastructure',
      priority: 'medium',
      title: 'Expand Green Infrastructure',
      description: 'Increase urban vegetation to improve ecosystem services and resilience.',
      interventions: ['tree_planting', 'green_corridors', 'wetlands'],
      expectedImpact: 'medium'
    });
  }
  
  return recommendations;
}

/**
 * Calculate intervention priorities based on risk scores
 */
function calculateInterventionPriorities(scores) {
  const priorities = {
    heat_reduction: scores.heat * 0.4 + scores.vegetation * 0.2,
    flood_mitigation: scores.flood * 0.5 + scores.vegetation * 0.1,
    air_quality_improvement: scores.airQuality * 0.4 + scores.vegetation * 0.2,
    biodiversity_enhancement: scores.vegetation * 0.5 + scores.flood * 0.1
  };
  
  // Normalize priorities
  const total = Object.values(priorities).reduce((sum, val) => sum + val, 0);
  Object.keys(priorities).forEach(key => {
    priorities[key] = priorities[key] / total;
  });
  
  return priorities;
}

// Helper functions for environmental estimation
function isUrbanArea(latitude, longitude) {
  // Simplified urban detection based on known major cities
  const majorCities = [
    { name: 'Dhaka', lat: 23.8103, lon: 90.4125, radius: 0.5 },
    { name: 'New York', lat: 40.7128, lon: -74.0060, radius: 1.0 },
    { name: 'London', lat: 51.5074, lon: -0.1278, radius: 1.0 },
    // Add more cities as needed
  ];
  
  return majorCities.some(city => {
    const distance = Math.sqrt(
      Math.pow(latitude - city.lat, 2) + Math.pow(longitude - city.lon, 2)
    );
    return distance <= city.radius;
  });
}

function estimatePopulationDensity(latitude, longitude) {
  // Simplified population density estimation
  const isUrban = isUrbanArea(latitude, longitude);
  if (!isUrban) return 100; // Rural baseline
  
  // Urban areas have higher density
  return 2000 + Math.random() * 3000;
}

function estimateAverageTemperature(latitude) {
  // Simplified temperature estimation based on latitude
  const absLat = Math.abs(latitude);
  if (absLat > 60) return 5; // Polar
  if (absLat > 30) return 15; // Temperate
  return 27; // Tropical
}

function getSeasonalFactor() {
  // Simplified seasonal variation
  const month = new Date().getMonth();
  return Math.sin((month + 1) * Math.PI / 6) * 5;
}

function estimateElevation(latitude, longitude) {
  // Simplified elevation estimation
  if (latitude > 23 && latitude < 24 && longitude > 90 && longitude < 91) {
    return 8; // Dhaka region
  }
  return 50 + Math.random() * 100;
}

function estimateDrainageQuality(latitude, longitude) {
  const elevation = estimateElevation(latitude, longitude);
  if (elevation < 20) return 'poor';
  if (elevation < 100) return 'fair';
  return 'good';
}

function estimateCoastalProximity(latitude, longitude) {
  // Simplified coastal proximity (0-1 scale)
  // This would use actual geographic data in production
  return Math.random() * 0.5;
}

function estimateAnnualRainfall(latitude, longitude) {
  // Simplified rainfall estimation
  const absLat = Math.abs(latitude);
  if (absLat < 10) return 200; // Equatorial
  if (absLat < 30) return 120; // Tropical/subtropical
  return 80; // Temperate
}

function estimateExtremeEventsProbability(latitude, longitude) {
  // Simplified extreme events probability
  return Math.random() * 0.3;
}

function estimateIndustrialActivity(latitude, longitude) {
  const isUrban = isUrbanArea(latitude, longitude);
  return isUrban ? Math.random() * 0.7 : Math.random() * 0.2;
}

function estimateTrafficDensity(latitude, longitude) {
  const populationDensity = estimatePopulationDensity(latitude, longitude);
  return Math.min(1.0, populationDensity / 5000);
}

function estimateWindPatterns(latitude, longitude) {
  // Simplified wind ventilation factor
  return 0.3 + Math.random() * 0.4;
}

function getClimateZone(latitude) {
  const absLat = Math.abs(latitude);
  if (absLat < 15) return 'tropical';
  if (absLat < 30) return 'subtropical';
  if (absLat < 60) return 'temperate';
  return 'polar';
}

function estimateLandUseIntensity(latitude, longitude) {
  const isUrban = isUrbanArea(latitude, longitude);
  return isUrban ? 0.7 + Math.random() * 0.2 : Math.random() * 0.3;
}

function estimateBuildingDensity(latitude, longitude) {
  const populationDensity = estimatePopulationDensity(latitude, longitude);
  return Math.min(1.0, populationDensity / 10000);
}

function estimateVegetationCover(latitude, longitude) {
  const isUrban = isUrbanArea(latitude, longitude);
  return isUrban ? 0.1 + Math.random() * 0.2 : 0.4 + Math.random() * 0.4;
}

function calculateConfidenceLevel(location) {
  // Simplified confidence calculation
  // In production, this would be based on data availability and quality
  return 0.7 + Math.random() * 0.2;
}

function getRiskScore(riskLevel) {
  const scores = { low: 0.2, medium: 0.5, high: 0.8, very_high: 0.95 };
  return scores[riskLevel] || 0.5;
}

module.exports = {
  calculateRiskIndices,
  generateRiskAssessment,
  calculateHeatRisk,
  calculateFloodRisk,
  calculateAirQualityRisk,
  calculateVegetationRisk,
  RISK_THRESHOLDS,
  RISK_WEIGHTS
};
