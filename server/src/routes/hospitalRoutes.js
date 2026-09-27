const express = require('express');
const { query } = require('../config/db');
const { requireRole } = require('../middleware/roleAuth');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT h.*, hc.total_beds, hc.occupied_beds, hc.icu_total, hc.icu_available, hc.updated_at
         FROM hospitals h
         LEFT JOIN hospital_capacity hc ON hc.hospital_id = h.id
        ORDER BY h.id ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/capacity', requireRole(['HOSPITAL', 'SMC']), async (req, res, next) => {
  try {
    const hospitalId = Number(req.params.id);
    const { total_beds, occupied_beds, icu_total, icu_available } = req.body;

    const updated = await query(
      `INSERT INTO hospital_capacity (hospital_id, total_beds, occupied_beds, icu_total, icu_available, updated_at)
       VALUES ($1,$2,$3,$4,$5,NOW())
       ON CONFLICT (hospital_id) DO UPDATE SET
         total_beds = EXCLUDED.total_beds,
         occupied_beds = EXCLUDED.occupied_beds,
         icu_total = EXCLUDED.icu_total,
         icu_available = EXCLUDED.icu_available,
         updated_at = NOW()
       RETURNING *`,
      [hospitalId, total_beds, occupied_beds, icu_total, icu_available]
    );

    res.json({ success: true, data: updated.rows[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
