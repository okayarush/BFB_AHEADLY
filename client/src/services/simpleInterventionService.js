// Research-backed intervention analysis service - Complete rebuild
import { computeProjections, CONFIG } from "./interventionModel.js";

class SimpleInterventionService {
  constructor() {
    this.baselineDataKey = "baselineAnalysisData";
    this.baselineIdKey = "baselineAnalysisId";
  }

  // Store baseline data
  async storeBaselineData(analysisData) {
    try {
      // Try backend first
      const response = await fetch("https://urbanome-1.onrender.com/api/interventions/store-baseline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisData }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          localStorage.setItem(this.baselineIdKey, result.analysisId);
          localStorage.setItem(
            this.baselineDataKey,
            JSON.stringify({
              data: analysisData,
              timestamp: Date.now(),
            })
          );
          return result.analysisId;
        }
      }
    } catch (error) {
      console.warn("Backend storage failed:", error.message);
    }

    // Fallback to local storage
    const localId = "local_" + Date.now();
    localStorage.setItem(this.baselineIdKey, localId);
    localStorage.setItem(
      this.baselineDataKey,
      JSON.stringify({
        data: analysisData,
        timestamp: Date.now(),
      })
    );
    return localId;
  }

  // Get baseline data
  getBaselineData() {
    const stored = localStorage.getItem(this.baselineDataKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Date.now() - parsed.timestamp < 3600000) {
        // 1 hour
        return parsed.data;
      }
    }
    return null;
  }

  // Convert baseline analysis data to the format expected by interventionModel
  convertBaselineData(analysisData, polygonArea) {
    // Extract data from the baseline analysis structure
    const analysis = analysisData.analysis_results?.[0]?.analysis || {};

    return {
      polygon_id: `polygon_${Date.now()}`,
      polygon_area_m2: polygonArea || 10000, // Default 1 hectare
      baseline_year: 2025,
      LST_mean: analysis.temperature?.mean
        ? analysis.temperature.mean - 273.15
        : 32.5, // Convert K to C
      NDVI_mean: analysis.vegetation?.ndvi_mean || 0.3,
      precip_mm_yr: analysis.precipitation?.annual_mm || 1200,
      elevation_mean: analysis.elevation?.mean || 10,
      impervious_fraction: analysis.urban?.impervious_fraction || 0.6,
    };
  }

  // Convert intervention config to the format expected by interventionModel
  convertInterventionConfig(interventionConfig) {
    const { type, config } = interventionConfig;
    const interventions = {};

    switch (type) {
      case "urban-forestry":
        interventions.urban_forestry = {
          number_of_trees: config.numTrees || 100,
          cost_per_tree_usd: config.costPerTree || 150,
          planting_density_m2_per_tree: config.plantingDensity || 100,
        };
        break;

      case "green-roofs":
        interventions.green_roofs = {
          coverage_area_m2: config.coverageArea || 1000,
          cost_per_m2_usd: config.costPerSqm || 120,
          roof_area_available_m2: config.coverageArea
            ? config.coverageArea * 1.2
            : 1200, // Assume 20% extra available
        };
        break;

      case "urban-wetlands":
        interventions.urban_wetlands = {
          wetland_area_m2: config.wetlandArea || 2000,
          average_water_depth_m: config.waterDepth || 1.5,
          cost_per_m2_usd: config.costPerSqm || 200,
        };
        break;

      case "rooftop-solar":
        interventions.rooftop_solar = {
          solar_panel_area_m2: config.solarArea || 500,
          panel_efficiency_pct: config.panelEfficiency || 20,
          reflective_coating_area_m2: config.reflectiveArea || 300,
          solar_cost_per_m2_usd: config.costPerSqmSolar || 300,
          reflective_cost_per_m2_usd: config.costPerSqmReflective || 50,
        };
        break;

      default:
        throw new Error(`Unknown intervention type: ${type}`);
    }

    return interventions;
  }

  // Main analysis function using advanced intervention model
  async analyzeIntervention(interventionConfig, polygonArea = 10000) {
    console.log(
      "Analyzing intervention with advanced model:",
      interventionConfig
    );

    try {
      const baselineId = localStorage.getItem(this.baselineIdKey);
      const rawBaselineData = this.getBaselineData();

      if (!rawBaselineData || !baselineId) {
        throw new Error(
          "No baseline data. Please analyze current situation first."
        );
      }

      // Convert baseline data to expected format
      const baseline = this.convertBaselineData(rawBaselineData, polygonArea);

      // Convert intervention config to expected format
      const interventions = this.convertInterventionConfig(interventionConfig);

      console.log("Converted baseline:", baseline);
      console.log("Converted interventions:", interventions);

      // Try backend first
      try {
        const response = await fetch("https://urbanome-1.onrender.com/api/interventions/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interventionConfig,
            baselineDataId: baselineId,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Convert backend result to expected format if needed
            return {
              success: true,
              data: this.convertToExpectedFormat(result.data),
            };
          }
        }
      } catch (backendError) {
        console.warn(
          "Backend failed, using advanced client model:",
          backendError.message
        );
      }

      // Use advanced intervention model
      const modelResults = computeProjections(baseline, interventions, CONFIG);
      const convertedResults = this.convertToExpectedFormat(modelResults);

      console.log("Advanced model results:", modelResults);
      console.log("Converted results:", convertedResults);

      return { success: true, data: convertedResults, fallback: true };
    } catch (error) {
      console.error("Analysis error:", error);
      return { success: false, error: error.message };
    }
  }

  // Convert advanced model results to format expected by the UI
  convertToExpectedFormat(modelResults) {
    const { baseline, projections, summary, interventions } = modelResults;

    // Find projections for different time periods
    const proj5yr = projections.find((p) => p.year === 5) || projections[1];
    const proj10yr = projections.find((p) => p.year === 10) || projections[2];
    const proj15yr = projections.find((p) => p.year === 15) || projections[3];

    // Calculate totals
    const totalCapitalCost = projections.reduce(
      (sum, p) => sum + (p.capital_cost_total || 0),
      0
    );
    const avgAnnualBenefits =
      projections
        .slice(1)
        .reduce((sum, p) => sum + (p.annual_benefits_usd || 0), 0) /
      (projections.length - 1);
    const avgAnnualCosts =
      projections
        .slice(1)
        .reduce((sum, p) => sum + (p.annual_costs_usd || 0), 0) /
      (projections.length - 1);

    return {
      baseline: {
        analysis_results: [
          {
            analysis: {
              temperature: { mean: baseline.LST_mean + 273.15 }, // Convert C to K for compatibility
              vegetation: {
                green_area_percent: baseline.NDVI_mean * 100,
                ndvi_mean: baseline.NDVI_mean,
              },
              precipitation: { annual_mm: baseline.precip_mm_yr },
              elevation: { mean: baseline.elevation_mean },
            },
          },
        ],
      },
      projections: {
        temperature: {
          5: {
            newTemperature: proj5yr.LST_mean + 273.15,
            reduction: baseline.LST_mean - proj5yr.LST_mean,
            percentImprovement: Math.abs(
              ((baseline.LST_mean - proj5yr.LST_mean) / baseline.LST_mean) * 100
            ),
          },
          10: {
            newTemperature: proj10yr.LST_mean + 273.15,
            reduction: baseline.LST_mean - proj10yr.LST_mean,
            percentImprovement: Math.abs(
              ((baseline.LST_mean - proj10yr.LST_mean) / baseline.LST_mean) *
                100
            ),
          },
          15: {
            newTemperature: proj15yr.LST_mean + 273.15,
            reduction: baseline.LST_mean - proj15yr.LST_mean,
            percentImprovement: Math.abs(
              ((baseline.LST_mean - proj15yr.LST_mean) / baseline.LST_mean) *
                100
            ),
          },
        },
        vegetation: {
          5: {
            total: proj5yr.NDVI_mean * 100,
            improvement: (proj5yr.NDVI_mean - baseline.NDVI_mean) * 100,
          },
          10: {
            total: proj10yr.NDVI_mean * 100,
            improvement: (proj10yr.NDVI_mean - baseline.NDVI_mean) * 100,
          },
          15: {
            total: proj15yr.NDVI_mean * 100,
            improvement: (proj15yr.NDVI_mean - baseline.NDVI_mean) * 100,
          },
        },
        carbonSequestration: {
          5: {
            totalSequestration: proj5yr.tCO2_sequestered * 5,
            annualSequestration: proj5yr.tCO2_sequestered,
            monetaryValue:
              proj5yr.tCO2_sequestered *
              CONFIG.social_cost_of_carbon_usd_per_tCO2 *
              5,
          },
          10: {
            totalSequestration: proj10yr.tCO2_sequestered * 10,
            annualSequestration: proj10yr.tCO2_sequestered,
            monetaryValue:
              proj10yr.tCO2_sequestered *
              CONFIG.social_cost_of_carbon_usd_per_tCO2 *
              10,
          },
          15: {
            totalSequestration: proj15yr.tCO2_sequestered * 15,
            annualSequestration: proj15yr.tCO2_sequestered,
            monetaryValue:
              proj15yr.tCO2_sequestered *
              CONFIG.social_cost_of_carbon_usd_per_tCO2 *
              15,
          },
        },
        waterManagement: {
          5: {
            totalStormwaterManaged:
              (((1 - proj5yr.runoff_index) *
                baseline.precip_mm_yr *
                modelResults.polygon_area_m2) /
                1000) *
              5,
            monetaryValue: (1 - proj5yr.runoff_index) * 500 * 5, // REALISTIC: $500/year max benefit
          },
          10: {
            totalStormwaterManaged:
              (((1 - proj10yr.runoff_index) *
                baseline.precip_mm_yr *
                modelResults.polygon_area_m2) /
                1000) *
              10,
            monetaryValue: (1 - proj10yr.runoff_index) * 500 * 10, // REALISTIC: $500/year max benefit
          },
          15: {
            totalStormwaterManaged:
              (((1 - proj15yr.runoff_index) *
                baseline.precip_mm_yr *
                modelResults.polygon_area_m2) /
                1000) *
              15,
            monetaryValue: (1 - proj15yr.runoff_index) * 500 * 15, // REALISTIC: $500/year max benefit
          },
        },
      },
      costs: {
        implementation: totalCapitalCost,
        maintenance: {
          5: avgAnnualCosts * 5,
          10: avgAnnualCosts * 10,
          15: avgAnnualCosts * 15,
        },
        total: {
          5: totalCapitalCost + avgAnnualCosts * 5,
          10: totalCapitalCost + avgAnnualCosts * 10,
          15: totalCapitalCost + avgAnnualCosts * 15,
        },
      },
      benefits: {
        carbonSequestration: {
          5:
            proj5yr.tCO2_sequestered *
            CONFIG.social_cost_of_carbon_usd_per_tCO2 *
            5,
          10:
            proj10yr.tCO2_sequestered *
            CONFIG.social_cost_of_carbon_usd_per_tCO2 *
            10,
          15:
            proj15yr.tCO2_sequestered *
            CONFIG.social_cost_of_carbon_usd_per_tCO2 *
            15,
        },
        energySavings: {
          5: avgAnnualBenefits * 0.4 * 5,
          10: avgAnnualBenefits * 0.4 * 10,
          15: avgAnnualBenefits * 0.4 * 15,
        },
        waterManagement: {
          5: (1 - proj5yr.runoff_index) * 10000 * 5,
          10: (1 - proj10yr.runoff_index) * 10000 * 10,
          15: (1 - proj15yr.runoff_index) * 10000 * 15,
        },
        airQuality: {
          5: avgAnnualBenefits * 0.3 * 5,
          10: avgAnnualBenefits * 0.3 * 10,
          15: avgAnnualBenefits * 0.3 * 15,
        },
        propertyValue: {
          5: avgAnnualBenefits * 0.3 * 5,
          10: avgAnnualBenefits * 0.3 * 10,
          15: avgAnnualBenefits * 0.3 * 15,
        },
        total: {
          5: avgAnnualBenefits * 5,
          10: avgAnnualBenefits * 10,
          15: avgAnnualBenefits * 15,
        },
      },
      roi: {
        5: (() => {
          const annualCashFlows = Array(5)
            .fill(0)
            .map((_, year) => (avgAnnualBenefits || 0) - (avgAnnualCosts || 0));
          const roi =
            totalCapitalCost > 0
              ? (annualCashFlows.reduce((sum, cf) => sum + cf, 0) /
                  5 /
                  totalCapitalCost) *
                100
              : 0;
          return {
            roi: Math.max(-100, Math.min(50, roi)),
            paybackPeriod:
              totalCapitalCost > 0 && annualCashFlows[0] > 0
                ? Math.round((totalCapitalCost / annualCashFlows[0]) * 10) / 10
                : null,
          };
        })(),
        10: (() => {
          const annualCashFlows = Array(10)
            .fill(0)
            .map((_, year) => (avgAnnualBenefits || 0) - (avgAnnualCosts || 0));
          const roi =
            totalCapitalCost > 0
              ? (annualCashFlows.reduce((sum, cf) => sum + cf, 0) /
                  10 /
                  totalCapitalCost) *
                100
              : 0;
          return {
            roi: Math.max(-100, Math.min(50, roi)),
            paybackPeriod:
              totalCapitalCost > 0 && annualCashFlows[0] > 0
                ? Math.round((totalCapitalCost / annualCashFlows[0]) * 10) / 10
                : null,
          };
        })(),
        15: (() => {
          const annualCashFlows = Array(15)
            .fill(0)
            .map((_, year) => (avgAnnualBenefits || 0) - (avgAnnualCosts || 0));
          const roi =
            totalCapitalCost > 0
              ? (annualCashFlows.reduce((sum, cf) => sum + cf, 0) /
                  15 /
                  totalCapitalCost) *
                100
              : 0;
          return {
            roi: Math.max(-100, Math.min(50, roi)),
            paybackPeriod:
              totalCapitalCost > 0 && annualCashFlows[0] > 0
                ? Math.round((totalCapitalCost / annualCashFlows[0]) * 10) / 10
                : null,
          };
        })(),
      },
      summary: {
        keyBenefits: [
          {
            name: "Carbon Sequestration",
            value:
              proj10yr.tCO2_sequestered *
              CONFIG.social_cost_of_carbon_usd_per_tCO2 *
              10,
          },
          { name: "Energy Savings", value: avgAnnualBenefits * 0.4 * 10 },
          {
            name: "Water Management",
            value: (1 - proj10yr.runoff_index) * 10000 * 10,
          },
          { name: "Air Quality", value: avgAnnualBenefits * 0.3 * 10 },
        ],
        environmentalImpact: {
          temperatureReduction: Math.abs(baseline.LST_mean - proj10yr.LST_mean),
          vegetationIncrease: (proj10yr.NDVI_mean - baseline.NDVI_mean) * 100,
          carbonSequestered: proj10yr.tCO2_sequestered * 10,
          airQualityImprovement: Math.min(
            25,
            Math.abs(baseline.LST_mean - proj10yr.LST_mean) * 5
          ),
        },
        riskFactors: projections[1].warnings || [],
      },
      intervention: {
        metadata: {
          name: this.getInterventionName(interventions),
          description: this.getInterventionDescription(interventions),
          area: modelResults.polygon_area_m2,
        },
      },
    };
  }

  // Helper methods
  getInterventionName(interventions) {
    if (interventions.urban_forestry) return "Urban Forestry";
    if (interventions.green_roofs) return "Green Roofs";
    if (interventions.urban_wetlands) return "Urban Wetlands";
    if (interventions.rooftop_solar)
      return "Rooftop Solar + Reflective Coating";
    return "Mixed Interventions";
  }

  getInterventionDescription(interventions) {
    if (interventions.urban_forestry)
      return "Strategic tree planting to reduce urban heat and improve air quality";
    if (interventions.green_roofs)
      return "Rooftop vegetation for temperature reduction and energy savings";
    if (interventions.urban_wetlands)
      return "Water bodies for flood control and biodiversity enhancement";
    if (interventions.rooftop_solar)
      return "Solar energy generation with reflective surfaces for cooling";
    return "Combination of nature-based solutions for comprehensive urban improvement";
  }
}

// Export the service
const simpleInterventionService = new SimpleInterventionService();
export { simpleInterventionService as interventionAnalysisService };
export default simpleInterventionService;
