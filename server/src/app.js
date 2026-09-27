const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const env = require('./config/env');
const { query } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const wardRoutes = require('./routes/wardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const interventionRoutes = require('./routes/interventionRoutes');
const fieldFlagRoutes = require('./routes/fieldFlagRoutes');
const contextRoutes = require('./routes/contextRoutes');
const satelliteRoutes = require('./routes/satelliteRoutes');
const streamRoutes = require('./routes/streamRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const alertRoutes = require('./routes/alertRoutes');
const hriRoutes = require('./routes/hriRoutes');

const app = express();

app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors({ origin: env.corsOrigins, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', async (_req, res) => {
  try {
    const dbCheck = await query('SELECT NOW() AS now');
    res.json({
      status: 'OK',
      service: 'Aheadly API',
      time: dbCheck.rows[0].now,
      env: env.nodeEnv
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', service: 'Aheadly API', error: error.message });
  }
});

app.get('/api', (_req, res) => {
  res.json({
    message: 'Aheadly API',
    endpoints: {
      wards: ['GET /api/wards', 'GET /api/wards/:id'],
      hri: ['POST /api/hri/compute/:wardId', 'POST /api/hri/compute-all'],
      reports: ['POST /api/reports', 'GET /api/reports', 'GET /api/reports/:wardId'],
      interventions: ['POST /api/interventions', 'GET /api/interventions/:wardId'],
      fieldFlags: ['POST /api/field-flags', 'GET /api/field-flags', 'PATCH /api/field-flags/:id'],
      context: ['GET /api/context/:wardId'],
      satellite: ['GET /api/satellite/:wardId', 'POST /api/satellite/refresh', 'POST /api/satellite/simulate'],
      predictions: ['GET /api/predictions', 'GET /api/predictions/:wardId'],
      hospitals: ['GET /api/hospitals', 'PATCH /api/hospitals/:id/capacity'],
      alerts: ['GET /api/alerts', 'POST /api/alerts'],
      stream: ['GET /api/stream']
    }
  });
});

app.use('/api/wards', wardRoutes);
app.use('/api/hri', hriRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/field-flags', fieldFlagRoutes);
app.use('/api/context', contextRoutes);
app.use('/api/satellite', satelliteRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/stream', streamRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
