// interventionAnalysisService.js
// Service for calculating environmental impact, cost, and ROI of interventions

class InterventionAnalysisService {
  constructor() {
    // Global constants for calculations
    this.CONSTANTS = {
      // Carbon pricing (USD per ton CO2)
      CARBON_PRICE: 50,

      // Energy costs (USD per kWh)
      ELECTRICITY_COST: 0.15,

      // Water costs (USD per cubic meter)
      WATER_COST: 2.5,

      // Air quality health benefits (USD per person per year)
      AIR_QUALITY_BENEFIT: 150,

      // Biodiversity value (USD per hectare per year)
      BIODIVERSITY_VALUE: 1000,

      // Temperature reduction value (USD per degree per hectare)
      COOLING_VALUE: 500,

      // Property value increase per degree of cooling (%)
      PROPERTY_VALUE_INCREASE: 2,

      // Inflation rate for future projections
      INFLATION_RATE: 0.03,
    };
  }

  /**
   * Main analysis function that processes all intervention types
   */
  analyzeIntervention(baselineData, interventionConfig) {
    const analysisResults = {
      intervention: interventionConfig,
      baseline: baselineData,
      projections: {},
      costs: {},
      benefits: {},
      roi: {},
      summary: {},
    };

    // Calculate costs
    analysisResults.costs = this.calculateCosts(interventionConfig);

    // Calculate environmental impacts over time
    analysisResults.projections = this.calculateProjections(
      baselineData,
      interventionConfig
    );

    // Calculate monetary benefits
    analysisResults.benefits = this.calculateBenefits(
      baselineData,
      interventionConfig,
      analysisResults.projections
    );

    // Calculate ROI
    analysisResults.roi = this.calculateROI(
      analysisResults.costs,
      analysisResults.benefits
    );

    // Generate summary
    analysisResults.summary = this.generateSummary(analysisResults);

    return analysisResults;
  }

  /**
   * Calculate implementation and maintenance costs
   */
  calculateCosts(config) {
    console.log("calculateCosts received config:", config);
    console.log("config.type:", config.type);
    console.log("config.config:", config.config);

    const costs = {
      implementation: 0,
      maintenance: {},
      total: {},
    };

    switch (config.type) {
      case "urban-forestry":
        costs.implementation =
          config.config.numTrees * config.config.costPerTree;
        const annualMaintenance =
          config.config.numTrees * config.config.maintenanceCostPerYear;

        [5, 10, 15].forEach((year) => {
          costs.maintenance[year] = this.calculateFutureValue(
            annualMaintenance * year,
            year
          );
          costs.total[year] = costs.implementation + costs.maintenance[year];
        });
        break;

      case "green-roofs":
        costs.implementation =
          config.config.coverageArea * config.config.costPerSqm;
        const annualMaintenanceRoof =
          config.config.coverageArea * config.config.maintenanceCostPerSqm;

        [5, 10, 15].forEach((year) => {
          costs.maintenance[year] = this.calculateFutureValue(
            annualMaintenanceRoof * year,
            year
          );
          costs.total[year] = costs.implementation + costs.maintenance[year];
        });
        break;

      case "urban-wetlands":
        costs.implementation =
          config.config.wetlandArea * config.config.costPerSqm;
        const annualMaintenanceWetland =
          config.config.wetlandArea * config.config.maintenanceCostPerSqm;

        [5, 10, 15].forEach((year) => {
          costs.maintenance[year] = this.calculateFutureValue(
            annualMaintenanceWetland * year,
            year
          );
          costs.total[year] = costs.implementation + costs.maintenance[year];
        });
        break;

      case "rooftop-solar":
        costs.implementation =
          config.config.solarArea * config.config.costPerSqmSolar +
          config.config.reflectiveArea * config.config.costPerSqmReflective;
        const annualMaintenanceSolar =
          (config.config.solarArea + config.config.reflectiveArea) *
          config.config.maintenanceCostPerSqm;

        [5, 10, 15].forEach((year) => {
          costs.maintenance[year] = this.calculateFutureValue(
            annualMaintenanceSolar * year,
            year
          );
          costs.total[year] = costs.implementation + costs.maintenance[year];
        });
        break;
    }

    return costs;
  }

  /**
   * Calculate environmental impacts over time (5, 10, 15 years)
   */
  calculateProjections(baselineData, config) {
    const projections = {
      temperature: {},
      vegetation: {},
      airQuality: {},
      carbonSequestration: {},
      energyGeneration: {},
      waterManagement: {},
    };

    const baselineAnalysis = baselineData.analysis_results[0].analysis;

    [5, 10, 15].forEach((year) => {
      projections.temperature[year] = this.calculateTemperatureReduction(
        baselineAnalysis,
        config,
        year
      );
      projections.vegetation[year] = this.calculateVegetationImprovement(
        baselineAnalysis,
        config,
        year
      );
      projections.airQuality[year] = this.calculateAirQualityImprovement(
        baselineAnalysis,
        config,
        year
      );
      projections.carbonSequestration[year] = this.calculateCarbonSequestration(
        config,
        year
      );
      projections.energyGeneration[year] = this.calculateEnergyGeneration(
        config,
        year
      );
      projections.waterManagement[year] = this.calculateWaterManagement(
        config,
        year
      );
    });

    return projections;
  }

  /**
   * Calculate temperature reduction based on intervention type
   */
  calculateTemperatureReduction(baseline, config, years) {
    let reductionCelsius = 0;
    const maturityFactor = Math.min(years / 10, 1); // Full effect at 10 years

    switch (config.type) {
      case "urban-forestry":
        // Trees provide cooling through evapotranspiration and shade
        const treeArea = config.config.numTrees * config.config.plantingDensity;
        const coolingPerHectare = 2.5; // degrees per hectare of forest
        reductionCelsius =
          (treeArea / 10000) * coolingPerHectare * maturityFactor;
        break;

      case "green-roofs":
        // Green roofs reduce surface temperature
        const roofCooling = 3.0; // degrees reduction on roof surface
        const areaCooling = 1.5; // degrees reduction in surrounding area
        reductionCelsius =
          areaCooling * (config.config.coverageArea / 10000) * maturityFactor;
        break;

      case "urban-wetlands":
        // Wetlands provide evaporative cooling
        const wetlandCooling = 2.0; // degrees per hectare
        reductionCelsius =
          (config.config.wetlandArea / 10000) * wetlandCooling * maturityFactor;
        break;

      case "rooftop-solar":
        // Reflective coatings reduce heat absorption
        const reflectiveCooling = 1.5; // degrees per hectare of reflective surface
        reductionCelsius =
          (config.config.reflectiveArea / 10000) * reflectiveCooling;
        break;
    }

    return {
      reduction: reductionCelsius,
      newTemperature: (baseline.temperature?.mean || 298) - reductionCelsius, // Kelvin
      percentImprovement:
        (reductionCelsius / ((baseline.temperature?.mean || 298) - 273.15)) *
        100,
    };
  }

  /**
   * Calculate vegetation coverage improvement
   */
  calculateVegetationImprovement(baseline, config, years) {
    let additionalGreenPercent = 0;
    const totalArea = baseline.geometry_info?.area_m2 || 10000;
    const maturityFactor = Math.min(years / 8, 1); // Full green coverage at 8 years

    switch (config.type) {
      case "urban-forestry":
        const treeCanopyArea =
          config.config.numTrees * config.config.plantingDensity * 0.7; // 70% canopy coverage
        additionalGreenPercent =
          (treeCanopyArea / totalArea) * 100 * maturityFactor;
        break;

      case "green-roofs":
        additionalGreenPercent =
          (config.config.coverageArea / totalArea) * 100 * maturityFactor;
        break;

      case "urban-wetlands":
        const wetlandVegetation = config.config.wetlandArea * 0.6; // 60% vegetation coverage
        additionalGreenPercent =
          (wetlandVegetation / totalArea) * 100 * maturityFactor;
        break;

      case "rooftop-solar":
        // Solar panels may reduce some vegetation but reflective coatings don't add green
        additionalGreenPercent = 0;
        break;
    }

    const currentGreen = baseline.vegetation?.green_area_percent || 0;
    const newGreenPercent = Math.min(currentGreen + additionalGreenPercent, 95); // Cap at 95%

    return {
      additional: additionalGreenPercent,
      total: newGreenPercent,
      improvement: additionalGreenPercent,
      percentIncrease:
        currentGreen > 0 ? (additionalGreenPercent / currentGreen) * 100 : 100,
    };
  }

  /**
   * Calculate air quality improvement
   */
  calculateAirQualityImprovement(baseline, config, years) {
    let pm25Reduction = 0; // PM2.5 reduction in μg/m³
    let no2Reduction = 0; // NO2 reduction in μg/m³
    const maturityFactor = Math.min(years / 5, 1);

    switch (config.type) {
      case "urban-forestry":
        pm25Reduction = config.config.numTrees * 0.048 * maturityFactor; // kg/year per tree
        no2Reduction = config.config.numTrees * 0.075 * maturityFactor;
        break;

      case "green-roofs":
        pm25Reduction =
          (config.config.coverageArea / 1000) * 2.5 * maturityFactor; // per 1000m²
        no2Reduction =
          (config.config.coverageArea / 1000) * 1.8 * maturityFactor;
        break;

      case "urban-wetlands":
        pm25Reduction =
          (config.config.wetlandArea / 1000) * 1.5 * maturityFactor;
        no2Reduction =
          (config.config.wetlandArea / 1000) * 1.2 * maturityFactor;
        break;

      case "rooftop-solar":
        // Indirect improvement through reduced energy demand
        pm25Reduction = (config.config.solarArea / 1000) * 0.8;
        no2Reduction = (config.config.solarArea / 1000) * 0.6;
        break;
    }

    return {
      pm25Reduction,
      no2Reduction,
      overallImprovement: (pm25Reduction + no2Reduction) / 2,
      healthBenefit: this.calculateHealthBenefit(pm25Reduction, no2Reduction),
    };
  }

  /**
   * Calculate carbon sequestration
   */
  calculateCarbonSequestration(config, years) {
    let carbonSequestered = 0; // tons CO2 per year

    switch (config.type) {
      case "urban-forestry":
        // Trees sequester more carbon as they mature
        const sequestrationRate = this.getTreeSequestrationRate(
          config.config.treeType,
          years
        );
        carbonSequestered = config.config.numTrees * sequestrationRate;
        break;

      case "green-roofs":
        carbonSequestered = (config.config.coverageArea / 1000) * 0.5; // 0.5 tons per 1000m² per year
        break;

      case "urban-wetlands":
        carbonSequestered = (config.config.wetlandArea / 1000) * 1.2; // 1.2 tons per 1000m² per year
        break;

      case "rooftop-solar":
        // Carbon offset through clean energy generation
        const energyGenerated = this.calculateEnergyGeneration(
          config,
          years
        ).annualGeneration;
        carbonSequestered = energyGenerated * 0.0005; // tons CO2 per kWh avoided
        break;
    }

    return {
      annualSequestration: carbonSequestered,
      totalSequestration: carbonSequestered * years,
      monetaryValue: carbonSequestered * years * this.CONSTANTS.CARBON_PRICE,
    };
  }

  /**
   * Calculate energy generation (for solar interventions)
   */
  calculateEnergyGeneration(config, years) {
    if (config.type !== "rooftop-solar") {
      return { annualGeneration: 0, totalGeneration: 0, monetaryValue: 0 };
    }

    const solarIrradiance = 4.5; // kWh/m²/day average for Dhaka
    const degradationRate = 0.005; // 0.5% per year

    let totalGeneration = 0;
    for (let year = 1; year <= years; year++) {
      const efficiency = config.config.panelEfficiency / 100;
      const yearlyDegradation = Math.pow(1 - degradationRate, year - 1);
      const yearlyGeneration =
        config.config.solarArea *
        solarIrradiance *
        365 *
        efficiency *
        yearlyDegradation;
      totalGeneration += yearlyGeneration;
    }

    return {
      annualGeneration: totalGeneration / years,
      totalGeneration,
      monetaryValue: totalGeneration * this.CONSTANTS.ELECTRICITY_COST,
    };
  }

  /**
   * Calculate water management benefits
   */
  calculateWaterManagement(config, years) {
    let stormwaterManaged = 0; // cubic meters per year
    let waterQualityImprovement = 0; // percentage

    switch (config.type) {
      case "urban-forestry":
        stormwaterManaged = config.config.numTrees * 0.5; // m³ per tree per year (interception)
        waterQualityImprovement = 15;
        break;

      case "green-roofs":
        stormwaterManaged = config.config.coverageArea * 0.8; // 80% retention
        waterQualityImprovement = 25;
        break;

      case "urban-wetlands":
        stormwaterManaged = config.config.wetlandArea * 2.0; // m³ per m² per year
        waterQualityImprovement = 60;
        break;

      case "rooftop-solar":
        stormwaterManaged = 0;
        waterQualityImprovement = 0;
        break;
    }

    return {
      annualStormwaterManaged: stormwaterManaged,
      totalStormwaterManaged: stormwaterManaged * years,
      waterQualityImprovement,
      monetaryValue: stormwaterManaged * years * this.CONSTANTS.WATER_COST,
    };
  }

  /**
   * Calculate total monetary benefits
   */
  calculateBenefits(baselineData, config, projections) {
    const benefits = {
      carbonSequestration: {},
      energySavings: {},
      waterManagement: {},
      airQuality: {},
      biodiversity: {},
      cooling: {},
      propertyValue: {},
      total: {},
    };

    [5, 10, 15].forEach((year) => {
      // Carbon sequestration benefits
      benefits.carbonSequestration[year] =
        projections.carbonSequestration[year].monetaryValue;

      // Energy benefits
      benefits.energySavings[year] =
        projections.energyGeneration[year].monetaryValue +
        this.calculateCoolingEnergySavings(
          projections.temperature[year],
          config
        );

      // Water management benefits
      benefits.waterManagement[year] =
        projections.waterManagement[year].monetaryValue;

      // Air quality health benefits
      const populationDensity = 8000; // people per km²
      const affectedPopulation =
        (baselineData.analysis_results[0].analysis.geometry_info?.area_km2 ||
          0.01) * populationDensity;
      benefits.airQuality[year] =
        affectedPopulation *
        this.CONSTANTS.AIR_QUALITY_BENEFIT *
        (projections.airQuality[year].overallImprovement / 100) *
        year;

      // Biodiversity benefits
      const areaHa =
        (baselineData.analysis_results[0].analysis.geometry_info?.area_m2 ||
          10000) / 10000;
      benefits.biodiversity[year] =
        areaHa *
        this.CONSTANTS.BIODIVERSITY_VALUE *
        (projections.vegetation[year].improvement / 100) *
        year;

      // Cooling benefits
      benefits.cooling[year] =
        areaHa *
        this.CONSTANTS.COOLING_VALUE *
        projections.temperature[year].reduction *
        year;

      // Property value increase
      const basePropertyValue = 200000; // USD average property value
      const propertyCount = Math.floor(affectedPopulation / 2.5); // 2.5 people per property
      benefits.propertyValue[year] =
        propertyCount *
        basePropertyValue *
        (this.CONSTANTS.PROPERTY_VALUE_INCREASE / 100) *
        projections.temperature[year].reduction;

      // Calculate total benefits
      benefits.total[year] =
        benefits.carbonSequestration[year] +
        benefits.energySavings[year] +
        benefits.waterManagement[year] +
        benefits.airQuality[year] +
        benefits.biodiversity[year] +
        benefits.cooling[year] +
        benefits.propertyValue[year];
    });

    return benefits;
  }

  /**
   * Calculate Return on Investment (ROI)
   */
  calculateROI(costs, benefits) {
    const roi = {};

    [5, 10, 15].forEach((year) => {
      const totalCost = costs.total[year];
      const totalBenefit = benefits.total[year];
      const netBenefit = totalBenefit - totalCost;

      // Calculate CORRECT ROI based on net annual return vs initial investment
      const initialInvestment = costs.implementation;
      const totalOperatingCosts = totalCost - initialInvestment; // Total operating costs over project life
      const averageAnnualOperatingCost = totalOperatingCosts / year;
      const averageAnnualBenefit = totalBenefit / year;
      const netAnnualReturn = averageAnnualBenefit - averageAnnualOperatingCost;

      // ROI = Net Annual Return / Initial Investment * 100
      const correctROI =
        initialInvestment > 0
          ? Math.max(
              -100,
              Math.min(50, (netAnnualReturn / initialInvestment) * 100)
            )
          : 0;

      roi[year] = {
        roi: correctROI,
        paybackPeriod: this.calculatePaybackPeriod(
          initialInvestment,
          netAnnualReturn
        ),
        netPresentValue: this.calculateNPV(
          initialInvestment,
          netAnnualReturn,
          year
        ),
        benefitCostRatio: totalCost > 0 ? totalBenefit / totalCost : 0,
        netAnnualReturn: netAnnualReturn,
      };
    });

    return roi;
  }

  /**
   * Generate summary insights
   */
  generateSummary(analysisResults) {
    const { costs, benefits, roi, projections } = analysisResults;
    const config = analysisResults.intervention;

    // Find the best performing timeframe
    const bestROI = Math.max(roi[5].roi, roi[10].roi, roi[15].roi);
    const bestYear = [5, 10, 15].find((year) => roi[year].roi === bestROI);

    const summary = {
      recommendation: bestROI > 0 ? "Recommended" : "Not Recommended",
      bestTimeframe: bestYear,
      keyBenefits: this.identifyKeyBenefits(benefits, bestYear),
      environmentalImpact: this.summarizeEnvironmentalImpact(
        projections,
        bestYear
      ),
      financialHighlights: {
        totalCost: costs.total[bestYear],
        totalBenefit: benefits.total[bestYear],
        roi: roi[bestYear].roi,
        paybackPeriod: roi[bestYear].paybackPeriod,
      },
      riskFactors: this.identifyRiskFactors(config, analysisResults),
    };

    return summary;
  }

  // Helper functions
  calculateFutureValue(presentValue, years) {
    return presentValue * Math.pow(1 + this.CONSTANTS.INFLATION_RATE, years);
  }

  getTreeSequestrationRate(treeType, years) {
    const baseRates = {
      "native-mixed": 0.025,
      "fruit-trees": 0.02,
      "shade-trees": 0.03,
      ornamental: 0.015,
    };

    const baseRate = baseRates[treeType] || 0.025;
    const maturityFactor = Math.min(years / 15, 1); // Peak at 15 years
    return baseRate * (1 + maturityFactor);
  }

  calculateHealthBenefit(pm25Reduction, no2Reduction) {
    // Simplified health benefit calculation
    return pm25Reduction * 100 + no2Reduction * 80; // USD per year
  }

  calculateCoolingEnergySavings(temperatureReduction, config) {
    if (!temperatureReduction.reduction) return 0;

    // Energy savings from reduced cooling demand
    const coolingDegreeDays = temperatureReduction.reduction * 365;
    const energySavingsKWh = coolingDegreeDays * 50; // kWh per degree-day
    return energySavingsKWh * this.CONSTANTS.ELECTRICITY_COST;
  }

  calculatePaybackPeriod(initialCost, annualBenefit) {
    if (annualBenefit <= 0) return Infinity;
    return initialCost / annualBenefit;
  }

  calculateNPV(initialCost, annualBenefit, years) {
    const discountRate = 0.05; // 5% discount rate
    let npv = -initialCost;

    for (let year = 1; year <= years; year++) {
      npv += annualBenefit / Math.pow(1 + discountRate, year);
    }

    return npv;
  }

  identifyKeyBenefits(benefits, year) {
    const yearBenefits = {
      "Carbon Sequestration": benefits.carbonSequestration[year],
      "Energy Savings": benefits.energySavings[year],
      "Water Management": benefits.waterManagement[year],
      "Air Quality": benefits.airQuality[year],
      Biodiversity: benefits.biodiversity[year],
      Cooling: benefits.cooling[year],
      "Property Value": benefits.propertyValue[year],
    };

    return Object.entries(yearBenefits)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, value]) => ({ name, value }));
  }

  summarizeEnvironmentalImpact(projections, year) {
    return {
      temperatureReduction: projections.temperature[year].reduction,
      vegetationIncrease: projections.vegetation[year].improvement,
      carbonSequestered:
        projections.carbonSequestration[year].totalSequestration,
      airQualityImprovement: projections.airQuality[year].overallImprovement,
    };
  }

  identifyRiskFactors(config, analysisResults) {
    const risks = [];

    if (analysisResults.roi[5].paybackPeriod > 10) {
      risks.push("Long payback period may affect financing");
    }

    if (config.type === "urban-forestry" && config.config.numTrees > 1000) {
      risks.push(
        "Large tree planting may require significant maintenance resources"
      );
    }

    if (
      config.type === "rooftop-solar" &&
      analysisResults.projections.energyGeneration[15].totalGeneration < 50000
    ) {
      risks.push("Solar generation may be limited by available roof space");
    }

    return risks;
  }
}

// Create singleton instance
const analysisServiceInstance = new InterventionAnalysisService();

// Export the service wrapper that handles backend integration
export const interventionAnalysisService = {
  // Store baseline data on backend for intervention comparison
  storeBaselineData: async (analysisData) => {
    try {
      const response = await fetch("https://nsac-primary-project.onrender.com/api/interventions/store-baseline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ analysisData }),
      });

      const result = await response.json();

      if (result.success) {
        // Store the analysis ID locally for quick access
        localStorage.setItem("baselineAnalysisId", result.analysisId);
        localStorage.setItem(
          "baselineAnalysisData",
          JSON.stringify({
            data: analysisData,
            timestamp: Date.now(),
          })
        );
        return result.analysisId;
      } else {
        throw new Error(result.message || "Failed to store baseline data");
      }
    } catch (error) {
      console.error("Error storing baseline data:", error);
      // Fallback to local storage
      localStorage.setItem(
        "baselineAnalysisData",
        JSON.stringify({
          data: analysisData,
          timestamp: Date.now(),
        })
      );
      return "local_" + Date.now();
    }
  },

  // Get stored baseline data
  getBaselineData: () => {
    const stored = localStorage.getItem("baselineAnalysisData");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check if data is less than 1 hour old
      if (Date.now() - parsed.timestamp < 3600000) {
        return parsed.data;
      }
    }
    return null;
  },

  // Run intervention analysis
  analyzeIntervention: async (interventionConfig) => {
    try {
      const baselineAnalysisId = localStorage.getItem("baselineAnalysisId");
      const baselineData = interventionAnalysisService.getBaselineData();

      if (!baselineData || !baselineAnalysisId) {
        throw new Error(
          "No baseline data available. Please run current situation analysis first."
        );
      }

      // Try backend API first for intervention analysis
      try {
        const response = await fetch("https://nsac-primary-project.onrender.com/api/interventions/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            interventionConfig,
            baselineDataId: baselineAnalysisId,
          }),
        });

        const result = await response.json();

        if (result.success) {
          return {
            success: true,
            data: result.data,
          };
        } else {
          throw new Error(result.message || "Backend analysis failed");
        }
      } catch (backendError) {
        console.warn(
          "Backend analysis failed, using client-side analysis:",
          backendError.message
        );

        // Fallback to detailed client-side calculation
        const analysisResults = analysisServiceInstance.analyzeIntervention(
          baselineData,
          interventionConfig
        );
        return {
          success: true,
          data: analysisResults,
          fallback: true,
        };
      }
    } catch (error) {
      console.error("Intervention analysis error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export default analysisServiceInstance;
