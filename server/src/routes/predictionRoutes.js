const express = require('express');
const { query } = require('../config/db');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT p.*, w.name as ward_name
         FROM predictions p
         JOIN wards w ON w.id = p.ward_id
        WHERE prediction_date >= CURRENT_DATE
        ORDER BY p.prediction_date ASC, p.ward_id ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

router.get('/:wardId', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM predictions
        WHERE ward_id = $1 AND prediction_date >= CURRENT_DATE
        ORDER BY prediction_date ASC`,
      [req.params.wardId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
