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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - NASA data services may be slow');
    }
    throw error;
  }
);

export const nasaDataService = {
  // Get MODIS/VIIRS Land Surface Temperature data
  async getTemperatureData(latitude, longitude, startDate, endDate) {
    try {
      const dateRange = this.getValidDateRange(startDate, endDate);
      const params = {
        latitude,
        longitude,
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      };

      const response = await apiClient.get('/nasa/temperature', { params });
      
      return {
        current: response.data.current,
        historical: response.data.historical || [],
        forecast: response.data.forecast || [],
        heatIslandIndex: response.data.heatIslandIndex || response.data.heat_island_index,
        trends: response.data.trends,
        metadata: response.data.metadata,
      };
    } catch (error) {
      console.error('Error fetching temperature data:', error);
      
      // Return mock data for demo purposes
      return this.getMockTemperatureData();
    }
  },

  // Get GPM IMERG Precipitation data
  async getPrecipitationData(latitude, longitude, startDate, endDate) {
    try {
      const dateRange = this.getValidDateRange(startDate, endDate);
      const params = {
        latitude,
        longitude,
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      };

      const response = await apiClient.get('/nasa/precipitation', { params });
      
      return {
        current: response.data.current,
        historical: response.data.historical || [],
        forecast: response.data.forecast || [],
        floodRisk: response.data.floodRisk || response.data.flood_risk,
        extremeEvents: response.data.extremeEvents || response.data.extreme_events,
        metadata: response.data.metadata,
      };
    } catch (error) {
      console.error('Error fetching precipitation data:', error);
      
      // Return mock data for demo purposes
      return this.getMockPrecipitationData();
    }
  },

  // Get NDVI Vegetation data
  async getVegetationData(latitude, longitude, startDate, endDate) {
    try {
      const dateRange = this.getValidDateRange(startDate, endDate);
      const params = {
        latitude,
        longitude,
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      };

      const response = await apiClient.get('/nasa/vegetation', { params });
      
      return {
        ndvi: response.data.ndvi,
        greenCoverage: response.data.greenCoverage || response.data.green_coverage,
        changes: response.data.changes || [],
        trends: response.data.trends,
        healthIndex: response.data.healthIndex || response.data.health_index,
        metadata: response.data.metadata,
      };
    } catch (error) {
      console.error('Error fetching vegetation data:', error);
      
      // Return mock data for demo purposes
      return this.getMockVegetationData();
    }
  },

  // Get SRTM Elevation data
  async getElevationData(latitude, longitude) {
    try {
      const params = { latitude, longitude };
      const response = await apiClient.get('/nasa/elevation', { params });
      
      return {
        elevation: response.data.elevation,
        floodZones: response.data.flood_zones || [],
        topography: response.data.topography,
        drainageBasin: response.data.drainage_basin,
        metadata: response.data.metadata,
      };
    } catch (error) {
      console.error('Error fetching elevation data:', error);
      
      // Return mock data for demo purposes
      return this.getMockElevationData();
    }
  },

  // Get TEMPO Air Quality data (North America only)
  async getAirQualityData(latitude, longitude, startDate, endDate) {
    try {
      const params = {
        latitude,
        longitude,
        start_date: startDate || this.getDefaultStartDate(),
        end_date: endDate || this.getDefaultEndDate(),
      };

      const response = await apiClient.get('/nasa/air-quality', { params });
      
      return {
        current: response.data.current,
        historical: response.data.historical || [],
        pollutants: response.data.pollutants,
        aqi: response.data.aqi,
        healthIndex: response.data.health_index,
        metadata: response.data.metadata,
      };
    } catch (error) {
      console.error('Error fetching air quality data:', error);
      
      // Return mock data for demo purposes
      return this.getMockAirQualityData();
    }
  },

  // Get processed risk indices
  async getRiskIndices(latitude, longitude) {
    try {
      const params = { latitude, longitude };
      const response = await apiClient.get('/nasa/risk-indices', { params });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching risk indices:', error);
      
      return {
        heatRisk: 'high',
        floodRisk: 'medium',
        airQualityRisk: 'high',
        overallRisk: 'high',
      };
    }
  },

  // Utility functions
  getDefaultStartDate() {
    const date = new Date();
    date.setMonth(date.getMonth() - 12); // 1 year ago
    return date.toISOString().split('T')[0];
  },

  getDefaultEndDate() {
    return new Date().toISOString().split('T')[0];
  },

  // Mock data generators for demo purposes
  getMockTemperatureData() {
    const currentDate = new Date();
    const historical = [];
    
    // Generate mock historical data
    for (let i = 365; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      
      historical.push({
        date: date.toISOString().split('T')[0],
        temperature: 25 + Math.sin(i * 0.017) * 10 + Math.random() * 5, // Seasonal pattern
        heat_index: Math.random() * 100,
      });
    }

    return {
      current: {
        value: 32.5,
        unit: '°C',
        timestamp: new Date().toISOString(),
        quality: 'good',
      },
      historical,
      forecast: this.generateMockForecast('temperature'),
      heatIslandIndex: 0.75,
      trends: {
        yearly_change: 0.8,
        seasonal_variation: 12.3,
      },
      metadata: {
        source: 'MODIS/VIIRS',
        resolution: '1km',
        last_updated: new Date().toISOString(),
      },
    };
  },

  getMockPrecipitationData() {
    const currentDate = new Date();
    const historical = [];
    
    // Generate mock historical data
    for (let i = 365; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      
      // Seasonal precipitation pattern for Bangladesh
      const monsoonFactor = Math.sin((date.getMonth() + 1) * 0.52) * 0.5 + 0.5;
      const rainfall = monsoonFactor * (50 + Math.random() * 100);
      
      historical.push({
        date: date.toISOString().split('T')[0],
        precipitation: rainfall,
        intensity: rainfall > 75 ? 'heavy' : rainfall > 25 ? 'moderate' : 'light',
      });
    }

    return {
      current: {
        value: 15.2,
        unit: 'mm/hr',
        timestamp: new Date().toISOString(),
        intensity: 'moderate',
      },
      historical,
      forecast: this.generateMockForecast('precipitation'),
      floodRisk: {
        level: 'high',
        probability: 0.73,
        areas_affected: ['Old Dhaka', 'Dhanmondi', 'Gulshan'],
      },
      extremeEvents: [
        {
          date: '2024-07-15',
          type: 'heavy_rain',
          intensity: 125.5,
          duration: 6,
        },
      ],
      metadata: {
        source: 'GPM IMERG',
        resolution: '0.1°',
        last_updated: new Date().toISOString(),
      },
    };
  },

  getMockVegetationData() {
    return {
      ndvi: {
        current: 0.42,
        change_1year: -0.05,
        change_5year: -0.12,
      },
      greenCoverage: {
        percentage: 18.5,
        total_area: 56.7, // km²
        change_1year: -2.3,
      },
      changes: [
        { year: 2019, ndvi: 0.54, coverage: 23.1 },
        { year: 2020, ndvi: 0.51, coverage: 21.8 },
        { year: 2021, ndvi: 0.48, coverage: 20.5 },
        { year: 2022, ndvi: 0.45, coverage: 19.2 },
        { year: 2023, ndvi: 0.42, coverage: 18.5 },
      ],
      trends: {
        deforestation_rate: -2.1,
        urbanization_impact: 'high',
      },
      healthIndex: 0.35, // Low due to urban stress
      metadata: {
        source: 'MODIS NDVI',
        resolution: '250m',
        last_updated: new Date().toISOString(),
      },
    };
  },

  getMockElevationData() {
    return {
      elevation: {
        min: 2,
        max: 14,
        average: 8,
        unit: 'meters',
      },
      floodZones: [
        { zone: 'very_high_risk', elevation_range: [2, 5], area_percentage: 35 },
        { zone: 'high_risk', elevation_range: [5, 8], area_percentage: 40 },
        { zone: 'medium_risk', elevation_range: [8, 12], area_percentage: 20 },
        { zone: 'low_risk', elevation_range: [12, 14], area_percentage: 5 },
      ],
      topography: {
        terrain: 'flat_lowland',
        slope: 'minimal',
        drainage: 'poor',
      },
      drainageBasin: 'Ganges-Brahmaputra',
      metadata: {
        source: 'SRTM',
        resolution: '30m',
        last_updated: new Date().toISOString(),
      },
    };
  },

  getMockAirQualityData() {
    const pollutants = {
      no2: 45.2,
      o3: 68.1,
      pm25: 85.3,
      pm10: 125.7,
      so2: 12.4,
      co: 1250,
    };

    const aqi = Math.max(...Object.values(pollutants)) * 1.2; // Simplified AQI calculation

    return {
      current: {
        aqi: Math.round(aqi),
        category: aqi > 150 ? 'unhealthy' : aqi > 100 ? 'moderate' : 'good',
        timestamp: new Date().toISOString(),
      },
      historical: this.generateMockAQIHistory(),
      pollutants,
      healthIndex: {
        respiratory_risk: 'high',
        cardiovascular_risk: 'moderate',
        overall_health_impact: 'significant',
      },
      metadata: {
        source: 'TEMPO/Ground Stations',
        resolution: '2km',
        last_updated: new Date().toISOString(),
        note: 'TEMPO data available for North America only',
      },
    };
  },

  generateMockForecast(type) {
    const forecast = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      if (type === 'temperature') {
        forecast.push({
          date: date.toISOString().split('T')[0],
          value: 28 + Math.random() * 8,
          confidence: 0.8 - i * 0.1,
        });
      } else if (type === 'precipitation') {
        forecast.push({
          date: date.toISOString().split('T')[0],
          value: Math.random() * 30,
          probability: Math.random(),
        });
      }
    }
    return forecast;
  },

  generateMockAQIHistory() {
    const history = [];
    const currentDate = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      
      history.push({
        date: date.toISOString().split('T')[0],
        aqi: 80 + Math.random() * 100,
        category: Math.random() > 0.5 ? 'moderate' : 'unhealthy',
      });
    }
    
    return history;
  },

  // Helper functions for date handling
  getDefaultStartDate() {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1); // 1 year ago
    return date.toISOString().split('T')[0];
  },

  getDefaultEndDate() {
    const date = new Date();
    date.setDate(date.getDate() - 7); // 7 days ago to avoid future dates
    return date.toISOString().split('T')[0];
  },

  // Get date range for valid NASA data (avoiding future dates)
  getValidDateRange(requestedStart, requestedEnd) {
    const today = new Date();
    const maxDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    let startDate = requestedStart ? new Date(requestedStart) : new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
    let endDate = requestedEnd ? new Date(requestedEnd) : maxDate;
    
    // Ensure dates don't exceed available data
    if (endDate > maxDate) {
      endDate = maxDate;
    }
    
    if (startDate > maxDate) {
      startDate = new Date(maxDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days before max date
    }
    
    return {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    };
  }
};
