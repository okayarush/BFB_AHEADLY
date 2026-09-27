import axios from 'axios';

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://nsac-primary-project.onrender.com/api';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://urbanome-1.onrender.com/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const interventionService = {
  // Get available intervention types
  async getInterventionTypes() {
    try {
      const response = await apiClient.get('/interventions/types');
      return response.data;
    } catch (error) {
      console.error('Error fetching intervention types:', error);
      throw error;
    }
  },

  // Calculate intervention impact
  async calculateInterventionImpact(interventions, cityData, budget = 500000) {
    try {
      const data = {
        interventions,
        cityData,
        budget,
      };

      const response = await apiClient.post('/interventions/calculate', data);
      return response.data;
    } catch (error) {
      console.error('Error calculating intervention impact:', error);
      throw error;
    }
  },

  // Optimize intervention selection
  async optimizeInterventions(availableInterventions = [], budget = 500000, priorities = {}, constraints = {}) {
    try {
      const data = {
        availableInterventions,
        budget,
        priorities,
        constraints,
      };

      const response = await apiClient.post('/interventions/optimize', data);
      return response.data;
    } catch (error) {
      console.error('Error optimizing interventions:', error);
      throw error;
    }
  },

  // Get intervention case studies
  async getCaseStudies() {
    try {
      const response = await apiClient.get('/interventions/case-studies');
      return response.data;
    } catch (error) {
      console.error('Error fetching case studies:', error);
      throw error;
    }
  },
};

export default interventionService;
