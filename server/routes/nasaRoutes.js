const express = require('express');
const router = express.Router();
const {
  getTemperatureData,
  getPrecipitationData,
  getVegetationData,
  getElevationData,
  getAirQualityData,
  getRiskIndices,
  getDataSummary
} = require('../controllers/nasaController');

// Middleware for parameter validation
const { validateCoordinates, validateDateRange } = require('../middleware/validation');

/**
 * @route GET /api/nasa/temperature
 * @desc Get MODIS/VIIRS Land Surface Temperature data
 * @query lat, lon, start_date, end_date
 */
router.get('/temperature', validateCoordinates, validateDateRange, getTemperatureData);

/**
 * @route GET /api/nasa/precipitation
 * @desc Get GPM IMERG precipitation data
 * @query lat, lon, start_date, end_date
 */
router.get('/precipitation', validateCoordinates, validateDateRange, getPrecipitationData);

/**
 * @route GET /api/nasa/vegetation
 * @desc Get MODIS NDVI vegetation data
 * @query lat, lon, start_date, end_date
 */
router.get('/vegetation', validateCoordinates, validateDateRange, getVegetationData);

/**
 * @route GET /api/nasa/elevation
 * @desc Get SRTM elevation data
 * @query lat, lon
 */
router.get('/elevation', validateCoordinates, getElevationData);

/**
 * @route GET /api/nasa/air-quality
 * @desc Get TEMPO air quality data (North America only)
 * @query lat, lon, start_date, end_date
 */
router.get('/air-quality', validateCoordinates, validateDateRange, getAirQualityData);

/**
 * @route GET /api/nasa/risk-indices
 * @desc Get computed risk indices for a location
 * @query lat, lon
 */
router.get('/risk-indices', validateCoordinates, getRiskIndices);

/**
 * @route GET /api/nasa/summary
 * @desc Get summary of all available NASA data for a location
 * @query lat, lon, start_date, end_date
 */
router.get('/summary', validateCoordinates, validateDateRange, getDataSummary);

module.exports = router;
