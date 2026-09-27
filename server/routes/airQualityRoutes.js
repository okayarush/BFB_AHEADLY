const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); // for Node < 18




const OPENAQ_API_KEY = 'bc9104f94e89cf55c3a74a5ccbf11dd4ecb510b25dbf45779cf9718e44783025'; // Get your API key from OpenAQ
const OPENAQ_BASE_URL = 'https://api.openaq.org/v3';

router.get('/air-quality/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const limit = req.query.limit || 10;
    
    // Configure the request to OpenAQ API
    const config = {
      method: 'GET',
      url: `${OPENAQ_BASE_URL}/measurements`,
      params: {
        city: city,
        parameter: 'pm25', // or pm10, no2, etc.
        limit: limit,
        sort: 'desc'
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    // Add API key if available
    if (OPENAQ_API_KEY) {
      config.headers['X-API-Key'] = OPENAQ_API_KEY;
    }

    const response = await axios(config);
    
    // Return the data to frontend
    res.json(response.data);
    
  } catch (error) {
    console.error('OpenAQ API Error:', error.response?.data || error.message);
    
    // Return appropriate error response
    if (error.response?.status === 401) {
      res.status(401).json({ 
        error: 'API authentication failed', 
        message: 'Please check your OpenAQ API key' 
      });
    } else if (error.response?.status === 429) {
      res.status(429).json({ 
        error: 'Rate limit exceeded', 
        message: 'Too many requests to OpenAQ API' 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to fetch air quality data',
        message: error.message
      });
    }
  }
});

// Alternative route for locations data
router.get('/locations/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    const config = {
      method: 'GET',
      url: `${OPENAQ_BASE_URL}/locations`,
      params: {
        city: city,
        parameters_id: 2, // PM2.5
        limit: 100
      },
      headers: {
        'Accept': 'application/json'
      }
    };

    if (OPENAQ_API_KEY) {
      config.headers['X-API-Key'] = OPENAQ_API_KEY;
    }

    const response = await axios(config);
    res.json(response.data);
    
  } catch (error) {
    console.error('OpenAQ Locations API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch location data',
      message: error.message
    });
  }
});

module.exports = router;