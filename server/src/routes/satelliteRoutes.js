const express = require('express');
const { query } = require('../config/db');
const { requireRole } = require('../middleware/roleAuth');
const { requireFields } = require('../middleware/validate');
const { computeWardHri, getWardInputs } = require('../db/hriRepository');
const { publish } = require('../services/sseBus');

const router = express.Router();

router.get('/:wardId', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM satellite_data WHERE ward_id = $1 ORDER BY observed_at DESC, id DESC LIMIT 1`,
      [req.params.wardId]
    );
    res.json({ success: true, data: result.rows[0] || null });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', requireRole(['SMC']), async (_req, res, next) => {
  try {
    const wards = await query(`SELECT id FROM wards ORDER BY id`);
    const recomputed = [];
    for (const ward of wards.rows) {
      recomputed.push(await computeWardHri(ward.id));
      publish('hri.updated', { ward_id: ward.id, latest_hri: recomputed[recomputed.length - 1], reason: 'satellite_refresh' });
    }
    res.json({ success: true, recomputed_count: recomputed.length });
  } catch (error) {
    next(error);
  }
});

router.post('/simulate', requireRole(['SMC']), requireFields(['ward_id', 'scenario']), async (req, res, next) => {
  try {
    const { ward_id, scenario } = req.body;
    const inputs = await getWardInputs(ward_id);

    if (!inputs.satellite) {
      return res.status(404).json({ success: false, error: `No satellite data found for ${ward_id}` });
    }

    const delta = {
      heat_spike: { lst: 1.5, mndwi: 0.02, rainfall: 0 },
      rain_event: { lst: -0.4, mndwi: 0.08, rainfall: 18 },
      drought: { lst: 1.0, mndwi: -0.07, rainfall: -4 }
    }[scenario];

    if (!delta) {
      return res.status(400).json({ success: false, error: 'scenario must be heat_spike | rain_event | drought' });
    }

    const insertedSat = await query(
      `INSERT INTO satellite_data (ward_id, lst_celsius, mndwi, ndvi, rainfall_mm, source)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [
        ward_id,
        Number(inputs.satellite.lst_celsius) + delta.lst,
        Math.max(0, Number(inputs.satellite.mndwi) + delta.mndwi),
        Number(inputs.satellite.ndvi),
        Math.max(0, Number(inputs.satellite.rainfall_mm) + delta.rainfall),
        'simulation'
      ]
    );

    const recomputed = await computeWardHri(ward_id);

    publish('hri.updated', { ward_id, latest_hri: recomputed, reason: `satellite_${scenario}` });

    res.json({
      success: true,
      scenario,
      satellite: insertedSat.rows[0],
      latest_hri: recomputed
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
