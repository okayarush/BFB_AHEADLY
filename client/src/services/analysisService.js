import axios from "axios";

const API_BASE_URL =
  // process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  // process.env.REACT_APP_API_URL || "https://nsac-primary-project.onrender.com/api";
  process.env.REACT_APP_API_URL || "https://urbanome-1.onrender.com/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Analysis API Error:", error);
    if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout - Analysis services may be slow");
    }
    throw error;
  }
);

export const analysisService = {
  // Get risk assessment for a city
  async getRiskAssessment(cityId, lat, lon) {
    try {
      const params = {
        cityId: cityId || 1,
        lat: lat || 23.8103,
        lon: lon || 90.4125,
      };

      const response = await apiClient.get("/analysis/risk-assessment", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching risk assessment:", error);
      throw error;
    }
  },

  // Run cost-benefit analysis
  async runCostBenefitAnalysis(
    interventions,
    timeframe = 20,
    discountRate = 0.045
  ) {
    try {
      const data = {
        interventions,
        timeframe,
        discountRate,
      };

      const response = await apiClient.post("/analysis/cost-benefit", data);
      return response.data;
    } catch (error) {
      console.error("Error running cost-benefit analysis:", error);
      throw error;
    }
  },

  // Get environmental trends
  async getEnvironmentalTrends(cityId, period = "12months", lat, lon) {
    try {
      const params = {
        cityId: cityId || 1,
        period,
        lat: lat || 23.8103,
        lon: lon || 90.4125,
      };

      const response = await apiClient.get("/analysis/environmental-trends", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching environmental trends:", error);
      throw error;
    }
  },

  // Run scenario analysis
  async runScenarioAnalysis(interventions, parameters = {}) {
    try {
      const data = {
        interventions,
        parameters,
      };

      const response = await apiClient.post("/analysis/scenario", data);
      return response.data;
    } catch (error) {
      console.error("Error running scenario analysis:", error);
      throw error;
    }
  },

  // Get optimization recommendations
  async getOptimizationRecommendations(
    budget = 500000,
    priority = "balanced",
    cityId = 1
  ) {
    try {
      const params = {
        budget,
        priority,
        cityId,
      };

      const response = await apiClient.get("/analysis/optimization", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching optimization recommendations:", error);
      throw error;
    }
  },

  // Generate policy brief
  async generatePolicyBrief(cityId, lat, lon, focus = "comprehensive") {
    try {
      const params = {
        cityId: cityId || 1,
        lat: lat || 23.8103,
        lon: lon || 90.4125,
        focus,
      };

      const response = await apiClient.get("/analysis/policy-brief", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error generating policy brief:", error);
      throw error;
    }
  },
};

export default analysisService;
