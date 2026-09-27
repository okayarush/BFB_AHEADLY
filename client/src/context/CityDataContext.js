import React, { createContext, useContext, useReducer, useEffect } from "react";
import { nasaDataService } from "../services/nasaDataService";
import { interventionAnalysisService } from "../services/interventionAnalysisService";

const CityDataContext = createContext();

// Initial state for city data
const initialState = {
  selectedCity: {
    name: "Dhaka",
    country: "Bangladesh",
    coordinates: [23.8103, 90.4125],
    population: 9500000,
    area: 306.38, // km²
  },
  nasaData: {
    temperature: {
      current: null,
      historical: [],
      forecast: [],
      heatIslandIndex: null,
      loading: false,
    },
    precipitation: {
      current: null,
      historical: [],
      forecast: [],
      floodRisk: null,
      loading: false,
    },
    vegetation: {
      ndvi: null,
      greenCoverage: null,
      changes: [],
      loading: false,
    },
    elevation: {
      data: null,
      floodZones: [],
      loading: false,
    },
    airQuality: {
      current: null,
      historical: [],
      pollutants: {
        no2: null,
        o3: null,
        pm25: null,
        pm10: null,
      },
      loading: false,
    },
  },
  riskAssessment: {
    heatRisk: "medium",
    floodRisk: "high",
    airQualityRisk: "high",
    overallRisk: "high",
  },
  loading: false,
  error: null,
};

// Action types
const ACTION_TYPES = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_SELECTED_CITY: "SET_SELECTED_CITY",
  SET_TEMPERATURE_DATA: "SET_TEMPERATURE_DATA",
  SET_PRECIPITATION_DATA: "SET_PRECIPITATION_DATA",
  SET_VEGETATION_DATA: "SET_VEGETATION_DATA",
  SET_ELEVATION_DATA: "SET_ELEVATION_DATA",
  SET_AIR_QUALITY_DATA: "SET_AIR_QUALITY_DATA",
  UPDATE_RISK_ASSESSMENT: "UPDATE_RISK_ASSESSMENT",
  SET_SECTION_LOADING: "SET_SECTION_LOADING",
};

// Reducer function
function cityDataReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case ACTION_TYPES.SET_SELECTED_CITY:
      return {
        ...state,
        selectedCity: action.payload,
      };

    case ACTION_TYPES.SET_SECTION_LOADING:
      return {
        ...state,
        nasaData: {
          ...state.nasaData,
          [action.section]: {
            ...state.nasaData[action.section],
            loading: action.payload,
          },
        },
      };

    case ACTION_TYPES.SET_TEMPERATURE_DATA:
      return {
        ...state,
        nasaData: {
          ...state.nasaData,
          temperature: {
            ...state.nasaData.temperature,
            ...action.payload,
            loading: false,
          },
        },
      };

    case ACTION_TYPES.SET_PRECIPITATION_DATA:
      return {
        ...state,
        nasaData: {
          ...state.nasaData,
          precipitation: {
            ...state.nasaData.precipitation,
            ...action.payload,
            loading: false,
          },
        },
      };

    case ACTION_TYPES.SET_VEGETATION_DATA:
      return {
        ...state,
        nasaData: {
          ...state.nasaData,
          vegetation: {
            ...state.nasaData.vegetation,
            ...action.payload,
            loading: false,
          },
        },
      };

    case ACTION_TYPES.SET_ELEVATION_DATA:
      return {
        ...state,
        nasaData: {
          ...state.nasaData,
          elevation: {
            ...state.nasaData.elevation,
            ...action.payload,
            loading: false,
          },
        },
      };

    case ACTION_TYPES.SET_AIR_QUALITY_DATA:
      return {
        ...state,
        nasaData: {
          ...state.nasaData,
          airQuality: {
            ...state.nasaData.airQuality,
            ...action.payload,
            loading: false,
          },
        },
      };

    case ACTION_TYPES.UPDATE_RISK_ASSESSMENT:
      return {
        ...state,
        riskAssessment: {
          ...state.riskAssessment,
          ...action.payload,
        },
      };

    default:
      return state;
  }
}

// City Data Provider Component
export function CityDataProvider({ children }) {
  const [state, dispatch] = useReducer(cityDataReducer, initialState);

  // Actions
  const actions = {
    setLoading: (loading) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: loading });
    },

    setError: (error) => {
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error });
    },

    setSelectedCity: (city) => {
      dispatch({ type: ACTION_TYPES.SET_SELECTED_CITY, payload: city });
      // Fetch new data for the selected city
      actions.fetchCityData(city);
    },

    setSectionLoading: (section, loading) => {
      dispatch({
        type: ACTION_TYPES.SET_SECTION_LOADING,
        section,
        payload: loading,
      });
    },

    // Fetch NASA data for a specific city
    fetchCityData: async (city) => {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });

        // Fetch all NASA data types
        await Promise.all([
          actions.fetchTemperatureData(city),
          actions.fetchPrecipitationData(city),
          actions.fetchVegetationData(city),
          actions.fetchElevationData(city),
          actions.fetchAirQualityData(city),
        ]);

        // Update risk assessment
        actions.updateRiskAssessment();
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    },

    // Fetch temperature data (MODIS/VIIRS LST)
    fetchTemperatureData: async (city) => {
      try {
        dispatch({
          type: ACTION_TYPES.SET_SECTION_LOADING,
          section: "temperature",
          payload: true,
        });

        const temperatureData = await nasaDataService.getTemperatureData(
          city.coordinates[0],
          city.coordinates[1]
        );

        dispatch({
          type: ACTION_TYPES.SET_TEMPERATURE_DATA,
          payload: temperatureData,
        });
      } catch (error) {
        console.error("Error fetching temperature data:", error);
      }
    },

    // Fetch precipitation data (GPM IMERG)
    fetchPrecipitationData: async (city) => {
      try {
        dispatch({
          type: ACTION_TYPES.SET_SECTION_LOADING,
          section: "precipitation",
          payload: true,
        });

        const precipitationData = await nasaDataService.getPrecipitationData(
          city.coordinates[0],
          city.coordinates[1]
        );

        dispatch({
          type: ACTION_TYPES.SET_PRECIPITATION_DATA,
          payload: precipitationData,
        });
      } catch (error) {
        console.error("Error fetching precipitation data:", error);
      }
    },

    // Fetch vegetation data (NDVI)
    fetchVegetationData: async (city) => {
      try {
        dispatch({
          type: ACTION_TYPES.SET_SECTION_LOADING,
          section: "vegetation",
          payload: true,
        });

        const vegetationData = await nasaDataService.getVegetationData(
          city.coordinates[0],
          city.coordinates[1]
        );

        dispatch({
          type: ACTION_TYPES.SET_VEGETATION_DATA,
          payload: vegetationData,
        });
      } catch (error) {
        console.error("Error fetching vegetation data:", error);
      }
    },

    // Fetch elevation data (SRTM)
    fetchElevationData: async (city) => {
      try {
        dispatch({
          type: ACTION_TYPES.SET_SECTION_LOADING,
          section: "elevation",
          payload: true,
        });

        const elevationData = await nasaDataService.getElevationData(
          city.coordinates[0],
          city.coordinates[1]
        );

        dispatch({
          type: ACTION_TYPES.SET_ELEVATION_DATA,
          payload: elevationData,
        });
      } catch (error) {
        console.error("Error fetching elevation data:", error);
      }
    },

    // Fetch air quality data (TEMPO)
    fetchAirQualityData: async (city) => {
      try {
        dispatch({
          type: ACTION_TYPES.SET_SECTION_LOADING,
          section: "airQuality",
          payload: true,
        });

        const airQualityData = await nasaDataService.getAirQualityData(
          city.coordinates[0],
          city.coordinates[1]
        );

        dispatch({
          type: ACTION_TYPES.SET_AIR_QUALITY_DATA,
          payload: airQualityData,
        });
      } catch (error) {
        console.error("Error fetching air quality data:", error);
      }
    },

    // Update risk assessment based on current data
    updateRiskAssessment: () => {
      const { nasaData } = state;

      // Calculate risk levels based on data
      const heatRisk = calculateHeatRisk(nasaData.temperature);
      const floodRisk = calculateFloodRisk(
        nasaData.precipitation,
        nasaData.elevation
      );
      const airQualityRisk = calculateAirQualityRisk(nasaData.airQuality);
      const overallRisk = calculateOverallRisk(
        heatRisk,
        floodRisk,
        airQualityRisk
      );

      dispatch({
        type: ACTION_TYPES.UPDATE_RISK_ASSESSMENT,
        payload: {
          heatRisk,
          floodRisk,
          airQualityRisk,
          overallRisk,
        },
      });
    },

    // Store analysis data for intervention planning
    storeAnalysisForIntervention: async (analysisData) => {
      try {
        const analysisId = await interventionAnalysisService.storeBaselineData(
          analysisData
        );
        return analysisId;
      } catch (error) {
        console.error("Error storing analysis data for intervention:", error);
        throw error;
      }
    },

    // Run intervention analysis
    analyzeIntervention: async (interventionConfig) => {
      try {
        const result = await interventionAnalysisService.analyzeIntervention(
          interventionConfig
        );
        return result;
      } catch (error) {
        console.error("Error analyzing intervention:", error);
        throw error;
      }
    },
  };

  // Load initial data on mount
  useEffect(() => {
    actions.fetchCityData(state.selectedCity);
  }, []);

  const value = {
    ...state,
    ...actions,
  };

  return (
    <CityDataContext.Provider value={value}>
      {children}
    </CityDataContext.Provider>
  );
}

// Custom hook to use city data context
export const useCityData = () => {
  const context = useContext(CityDataContext);
  if (!context) {
    throw new Error("useCityData must be used within a CityDataProvider");
  }
  return context;
};

// Risk calculation helper functions
function calculateHeatRisk(temperatureData) {
  if (!temperatureData.current) return "low";

  const temp = temperatureData.current.value;
  if (temp > 40) return "very_high";
  if (temp > 35) return "high";
  if (temp > 30) return "medium";
  return "low";
}

function calculateFloodRisk(precipitationData, elevationData) {
  if (!precipitationData.current) return "low";

  const rainfall = precipitationData.current.value;
  if (rainfall > 100) return "very_high";
  if (rainfall > 50) return "high";
  if (rainfall > 25) return "medium";
  return "low";
}

function calculateAirQualityRisk(airQualityData) {
  if (!airQualityData.current) return "low";

  const aqi = airQualityData.current.aqi;
  if (aqi > 200) return "very_high";
  if (aqi > 150) return "high";
  if (aqi > 100) return "medium";
  return "low";
}

function calculateOverallRisk(heatRisk, floodRisk, airQualityRisk) {
  const riskLevels = { low: 1, medium: 2, high: 3, very_high: 4 };
  const avgRisk =
    (riskLevels[heatRisk] +
      riskLevels[floodRisk] +
      riskLevels[airQualityRisk]) /
    3;

  if (avgRisk > 3.5) return "very_high";
  if (avgRisk > 2.5) return "high";
  if (avgRisk > 1.5) return "medium";
  return "low";
}
