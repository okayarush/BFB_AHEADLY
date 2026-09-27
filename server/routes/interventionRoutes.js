const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const path = require("path");
const logger = require("../utils/logger");

// Store analysis data temporarily (in production, use a database)
const analysisDataStore = new Map();

/**
 * @route POST /api/interventions/analyze
 * @desc Run intervention analysis
 * @access Public
 */
router.post("/analyze", async (req, res) => {
  try {
    const { interventionConfig, baselineDataId } = req.body;

    if (!interventionConfig || !baselineDataId) {
      return res.status(400).json({
        success: false,
        message: "Missing intervention configuration or baseline data ID",
      });
    }

    // Validate intervention config structure
    if (!interventionConfig.type) {
      return res.status(400).json({
        success: false,
        message: "Intervention configuration must include 'type' field",
      });
    }

    if (!interventionConfig.config && !interventionConfig.parameters) {
      return res.status(400).json({
        success: false,
        message: "Intervention configuration must include 'config' or 'parameters' field",
      });
    }

    // Retrieve baseline data from store
    const baselineData = analysisDataStore.get(baselineDataId);
    if (!baselineData) {
      return res.status(404).json({
        success: false,
        message:
          "Baseline analysis data not found. Please run current situation analysis first.",
      });
    }

    logger.info("Starting intervention analysis", {
      interventionType: interventionConfig.type,
      baselineDataId,
    });

    // For now, we'll use the frontend service logic
    // In production, you might want to implement this in Python
    const analysisResults = simulateInterventionAnalysis(
      baselineData,
      interventionConfig
    );

    logger.info("Intervention analysis completed successfully");

    res.json({
      success: true,
      data: analysisResults,
      message: "Intervention analysis completed successfully",
    });
  } catch (error) {
    logger.error("Error in intervention analysis:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during intervention analysis",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * @route POST /api/interventions/store-baseline
 * @desc Store baseline analysis data for intervention calculations
 * @access Public
 */
router.post("/store-baseline", async (req, res) => {
  try {
    const { analysisData } = req.body;

    if (!analysisData) {
      return res.status(400).json({
        success: false,
        message: "Missing analysis data",
      });
    }

    // Generate a unique ID for this analysis
    const analysisId =
      "baseline_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

    // Store the data
    analysisDataStore.set(analysisId, analysisData);

    // Clean up old data (keep only last 100 analyses)
    if (analysisDataStore.size > 100) {
      const oldestKey = analysisDataStore.keys().next().value;
      analysisDataStore.delete(oldestKey);
    }

    logger.info("Baseline data stored", { analysisId });

    res.json({
      success: true,
      analysisId,
      message: "Baseline data stored successfully",
    });
  } catch (error) {
    logger.error("Error storing baseline data:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error storing baseline data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// GET /api/interventions/types - Get available intervention types
router.get("/types", async (req, res) => {
  try {
    const interventionTypes = [
      {
        id: "urban-forestry",
        name: "Urban Forestry",
        category: "vegetation",
        description: "Plant trees and create green corridors",
        benefits: [
          "Air quality improvement",
          "Carbon sequestration",
          "Temperature reduction",
        ],
        icon: "tree",
      },
      {
        id: "green-roofs",
        name: "Green Roofs",
        category: "vegetation",
        description: "Install vegetation on building rooftops",
        benefits: [
          "Temperature reduction",
          "Energy savings",
          "Stormwater management",
        ],
        icon: "green-roof",
      },
      {
        id: "urban-wetlands",
        name: "Urban Wetlands",
        category: "water-management",
        description: "Create water bodies for ecosystem services",
        benefits: [
          "Flood prevention",
          "Water quality improvement",
          "Biodiversity",
        ],
        icon: "wetland",
      },
      {
        id: "rooftop-solar",
        name: "Rooftop Solar + Reflective Coatings",
        category: "energy",
        description: "Solar panels with heat-reflective surfaces",
        benefits: [
          "Clean energy generation",
          "Temperature reduction",
          "Energy savings",
        ],
        icon: "solar",
      },
    ];

    res.json({
      success: true,
      data: interventionTypes,
      count: interventionTypes.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get intervention types",
      error: error.message,
    });
  }
});

// POST /api/interventions/calculate - Calculate intervention impact
router.post("/calculate", async (req, res) => {
  try {
    const { interventions, cityData, budget = 500000 } = req.body;

    if (!interventions || !Array.isArray(interventions)) {
      return res.status(400).json({
        success: false,
        message: "Interventions array is required",
      });
    }

    // Mock calculation based on interventions
    const calculation = {
      totalCost: interventions.reduce(
        (sum, int) => sum + (int.cost || int.averageCost || 100000),
        0
      ),
      totalBenefit: interventions.reduce(
        (sum, int) => sum + (int.benefit || 200000),
        0
      ),
      impactMetrics: {
        temperatureReduction: Math.min(interventions.length * 0.8, 5.0), // Max 5°C reduction
        co2Reduction: interventions.reduce(
          (sum, int) => sum + (int.co2Reduction || 5),
          0
        ),
        energySavings: interventions.length * 15000, // kWh per year
        waterSavings: interventions.length * 25000, // liters per year
        airQualityImprovement: Math.min(interventions.length * 12, 50), // Max 50% improvement
        greenSpaceIncrease:
          interventions.filter((i) => i.category === "vegetation").length * 5, // hectares
      },
      implementation: {
        phases: [
          {
            phase: 1,
            duration: "0-6 months",
            interventions: interventions.slice(
              0,
              Math.ceil(interventions.length / 3)
            ),
            cost: budget * 0.4,
          },
          {
            phase: 2,
            duration: "6-18 months",
            interventions: interventions.slice(
              Math.ceil(interventions.length / 3),
              Math.ceil((interventions.length * 2) / 3)
            ),
            cost: budget * 0.4,
          },
          {
            phase: 3,
            duration: "18-24 months",
            interventions: interventions.slice(
              Math.ceil((interventions.length * 2) / 3)
            ),
            cost: budget * 0.2,
          },
        ],
        totalDuration: "24 months",
        riskFactors: [
          "Weather dependencies",
          "Community acceptance",
          "Regulatory approvals",
        ],
      },
      roi: {
        paybackPeriod: 6.8, // years
        netPresentValue: 750000,
        internalRateOfReturn: 0.185, // 18.5%
      },
      calculatedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: calculation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to calculate intervention impact",
      error: error.message,
    });
  }
});

// POST /api/interventions/optimize - Optimize intervention selection
router.post("/optimize", async (req, res) => {
  try {
    const {
      availableInterventions = [],
      budget = 500000,
      priorities = { temperature: 1, flood: 1, air_quality: 1, cost: 1 },
      constraints = {},
    } = req.body;

    // Mock optimization algorithm
    const optimizedSelection = [
      {
        intervention: "green-roofs",
        name: "Green Roofs",
        quantity: 8,
        totalCost: 180000,
        priority: 1,
        score: 9.2,
        benefits: {
          temperatureReduction: 2.1,
          energySavings: 45000,
          co2Reduction: 41.6,
        },
      },
      {
        intervention: "urban-trees",
        name: "Urban Tree Planting",
        quantity: 400,
        totalCost: 120000,
        priority: 2,
        score: 8.8,
        benefits: {
          airQualityImprovement: 25,
          temperatureReduction: 1.5,
          co2Reduction: 200,
        },
      },
      {
        intervention: "wetlands",
        name: "Urban Wetlands",
        quantity: 0.8,
        totalCost: 200000,
        priority: 3,
        score: 8.5,
        benefits: {
          floodReduction: 35,
          waterQuality: 40,
          biodiversity: 60,
        },
      },
    ];

    const optimization = {
      budget,
      usedBudget: optimizedSelection.reduce(
        (sum, item) => sum + item.totalCost,
        0
      ),
      remainingBudget:
        budget -
        optimizedSelection.reduce((sum, item) => sum + item.totalCost, 0),
      selectedInterventions: optimizedSelection,
      projectedImpacts: {
        overallScore: 8.8,
        temperatureReduction: 3.6,
        floodReduction: 35,
        airQualityImprovement: 25,
        co2Reduction: 241.6,
        energySavings: 45000,
      },
      alternatives: [
        {
          scenario: "cost-focused",
          score: 7.2,
          budget: budget * 0.7,
          interventions: ["urban-trees", "permeable-surfaces"],
        },
        {
          scenario: "impact-focused",
          score: 9.5,
          budget: budget * 1.2,
          interventions: ["green-roofs", "wetlands", "solar-panels"],
        },
      ],
      optimizedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: optimization,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to optimize interventions",
      error: error.message,
    });
  }
});

// GET /api/interventions/case-studies - Get intervention case studies
router.get("/case-studies", async (req, res) => {
  try {
    const caseStudies = [
      {
        id: 1,
        title: "Singapore Green Building Program",
        location: "Singapore",
        interventions: ["green-roofs", "cool-roofs", "urban-trees"],
        duration: "2008-2018",
        budget: 2500000,
        results: {
          temperatureReduction: 2.3,
          energySavings: 35,
          greenSpaceIncrease: 45,
          co2Reduction: 12000,
        },
        lessons: [
          "Strong government support crucial",
          "Community engagement essential",
          "Regular monitoring improves outcomes",
        ],
      },
      {
        id: 2,
        title: "Medellín Green Corridors",
        location: "Medellín, Colombia",
        interventions: ["urban-trees", "green-corridors", "wetlands"],
        duration: "2016-2020",
        budget: 1800000,
        results: {
          temperatureReduction: 2.0,
          airQualityImprovement: 18,
          floodReduction: 42,
          biodiversityIncrease: 35,
        },
        lessons: [
          "Multi-benefit approach more effective",
          "Local species selection important",
          "Maintenance planning critical",
        ],
      },
    ];

    res.json({
      success: true,
      data: caseStudies,
      count: caseStudies.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get case studies",
      error: error.message,
    });
  }
});

/**
 * Simulate intervention analysis (dummy implementation)
 * In production, this would call Python analysis scripts
 */
function simulateInterventionAnalysis(baselineData, interventionConfig) {
  const { type, config } = interventionConfig;
  
  // Ensure config exists, fallback to empty object
  const safeConfig = config || {};

  // Base impact multipliers by intervention type (updated with realistic costs)
  const impactMultipliers = {
    "urban-forestry": {
      temperature: -2.5,
      airQuality: 0.35,
      carbonSequestration: 21.0, // kg CO2/tree/year for mature urban trees
      costPerUnit: 350, // More realistic cost per tree including planting and establishment
    },
    "green-roofs": {
      temperature: -1.8,
      airQuality: 0.25,
      carbonSequestration: 2.5, // kg CO2/m²/year for green roofs
      costPerUnit: 120, // Cost per m² for extensive green roof
    },
    "urban-wetlands": {
      temperature: -3.2,
      airQuality: 0.45,
      carbonSequestration: 5.2, // kg CO2/m²/year for wetlands
      costPerUnit: 85, // Cost per m² for constructed wetland (much more realistic)
    },
    "rooftop-solar": {
      temperature: -2.1,
      airQuality: 0.15,
      carbonSequestration: 0, // Solar doesn't sequester carbon, but avoids emissions
      carbonAvoidance: 0.7, // kg CO2 avoided per kWh generated
      costPerUnit: 200, // Cost per m² for solar installation (declining costs)
    },
  };

  const multiplier =
    impactMultipliers[type] || impactMultipliers["urban-forestry"];

  // Calculate impacts based on intervention parameters
  const coverage = safeConfig.coverage || 50;
  const intensity = safeConfig.intensity || 1;
  const scale = (coverage / 100) * intensity;

  // Simulate baseline metrics (from stored baseline data)
  const baselineTemp = baselineData.avgTemperature || 32.5;
  const baselineAQI = baselineData.avgAQI || 85;
  const baselineCarbon = baselineData.carbonEmissions || 450;

  // Calculate projected improvements
  const tempReduction = multiplier.temperature * scale;
  const aqiImprovement = multiplier.airQuality * scale * 100;
  const carbonReduction = multiplier.carbonSequestration * scale;

  const projectedTemp = Math.max(baselineTemp + tempReduction, 25);
  const projectedAQI = Math.max(baselineAQI - aqiImprovement, 30);
  const projectedCarbon = Math.max(baselineCarbon - carbonReduction, 200);

  // Calculate costs and REALISTIC benefits
  const quantity = config.quantity || Math.floor(coverage * 10);
  const totalCost = quantity * multiplier.costPerUnit;

  // REALISTIC benefit calculations based on intervention type and quantity
  let annualEnergySavings, annualHealthSavings, annualCarbonValue;

  if (type === "urban-forestry") {
    // For trees: ultra-conservative per-tree benefits (minimal abstract benefits)
    annualEnergySavings = quantity * 0.08; // $0.08 per tree per year (minimal measurable impact)
    annualHealthSavings = quantity * 0.04; // $0.04 per tree per year (minimal abstract benefit)
    annualCarbonValue = quantity * 0.29; // ~$0.29 per tree per year (carbon + stormwater, conservative)
  } else if (type === "green-roofs") {
    // For green roofs: per m² benefits (reduced speculative benefits)
    annualEnergySavings = quantity * 0.8; // $0.80 per m² per year (reduced from measurement uncertainty)
    annualHealthSavings = quantity * 0.3; // $0.30 per m² per year (reduced abstract benefit)
    annualCarbonValue = quantity * 0.4; // $0.40 per m² per year (stormwater + carbon, more measurable)
  } else if (type === "urban-wetlands") {
    // For wetlands: per m² benefits
    annualEnergySavings = quantity * 0.8; // $0.80 per m² per year
    annualHealthSavings = quantity * 1.0; // $1.00 per m² per year
    annualCarbonValue = quantity * 0.4; // $0.40 per m² per year
  } else {
    // rooftop-solar
    // For solar: per m² benefits
    annualEnergySavings = quantity * 15; // $15 per m² per year (realistic solar returns)
    annualHealthSavings = quantity * 0.3; // $0.30 per m² per year
    annualCarbonValue = quantity * 2.5; // $2.50 per m² per year
  }

  const totalAnnualBenefits =
    annualEnergySavings + annualHealthSavings + annualCarbonValue;

  // Proper payback period calculation
  const annualMaintenanceCost = totalCost * 0.02; // 2% annual maintenance
  const netAnnualBenefits = totalAnnualBenefits - annualMaintenanceCost;
  const paybackPeriod =
    netAnnualBenefits > 0 ? totalCost / netAnnualBenefits : null;

  // Proper NPV calculation (20-year timeframe, 4.5% discount rate)
  const discountRate = 0.045;
  const timeframe = 20;
  let npv = -totalCost; // Initial investment
  let totalDiscountedBenefits = 0;

  for (let year = 1; year <= timeframe; year++) {
    const discountedBenefit =
      netAnnualBenefits / Math.pow(1 + discountRate, year);
    npv += discountedBenefit;
    totalDiscountedBenefits += discountedBenefit;
  }

  // CORRECT ROI calculation - Annual Return / Initial Investment
  const roi =
    totalCost > 0
      ? Math.max(-100, Math.min(50, (netAnnualBenefits / totalCost) * 100))
      : 0;

  // Generate time series data for before/after comparison
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const beforeData = months.map((month, index) => ({
    month,
    temperature: baselineTemp + Math.sin(index / 2) * 3 + (Math.random() - 0.5),
    aqi: baselineAQI + Math.sin(index / 3) * 15 + (Math.random() - 0.5) * 10,
    energy: 1000 + Math.sin(index / 2) * 200 + (Math.random() - 0.5) * 50,
  }));

  const afterData = months.map((month, index) => ({
    month,
    temperature:
      projectedTemp + Math.sin(index / 2) * 3 + (Math.random() - 0.5),
    aqi: projectedAQI + Math.sin(index / 3) * 15 + (Math.random() - 0.5) * 10,
    energy:
      1000 -
      annualEnergySavings / 12 +
      Math.sin(index / 2) * 200 +
      (Math.random() - 0.5) * 50,
  }));

  return {
    interventionConfig,
    impacts: {
      temperature: {
        baseline: baselineTemp,
        projected: projectedTemp,
        improvement: Math.abs(tempReduction),
        unit: "°C",
      },
      airQuality: {
        baseline: baselineAQI,
        projected: projectedAQI,
        improvement: aqiImprovement,
        unit: "AQI",
      },
      carbonSequestration: {
        baseline: baselineCarbon,
        projected: projectedCarbon,
        improvement: carbonReduction,
        unit: "tons CO2/year",
      },
    },
    costs: {
      implementation: totalCost,
      maintenance: annualMaintenanceCost,
      total: totalCost + annualMaintenanceCost * timeframe,
      currency: "USD",
    },
    benefits: {
      energySavings: annualEnergySavings,
      healthSavings: annualHealthSavings,
      carbonValue: annualCarbonValue,
      total: totalAnnualBenefits,
      annualTotal: totalAnnualBenefits,
      presentValue: totalDiscountedBenefits,
      currency: "USD",
    },
    roi: {
      percentage: Math.round(roi * 10) / 10,
      paybackPeriod: paybackPeriod ? Math.round(paybackPeriod * 10) / 10 : null,
      npv: Math.round(npv),
      discountRate: discountRate,
      timeframe: timeframe,
      unit: "years",
    },
    projections: {
      before: beforeData,
      after: afterData,
    },
    timeline: {
      implementation: `${config.timeline || 6} months`,
      fullEffects: "2-3 years",
      lifespan: "15-25 years",
    },
  };
}

module.exports = router;
