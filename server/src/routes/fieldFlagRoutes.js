const express = require('express');
const { query } = require('../config/db');
const { requireFields } = require('../middleware/validate');
const { requireRole } = require('../middleware/roleAuth');
const { publish } = require('../services/sseBus');
const { ApiError } = require('../utils/errors');

const router = express.Router();

router.post('/', requireRole(['ASHA', 'SMC']), requireFields(['ward_id', 'risk_score', 'risk_level']), async (req, res, next) => {
  try {
    const {
      ward_id,
      household_id = null,
      asha_worker_name,
      risk_score,
      risk_level,
      reasons = [],
      cluster_intelligence = null,
      symptoms_reported = [],
      sanitation_flags = []
    } = req.body;

    const created = await query(
      `INSERT INTO field_flags (
        ward_id, household_id, asha_worker_name,
        risk_score, risk_level, reasons,
        cluster_intelligence, symptoms_reported, sanitation_flags
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        ward_id,
        household_id,
        asha_worker_name || req.actor.userName,
        risk_score,
        risk_level,
        JSON.stringify(reasons),
        cluster_intelligence,
        symptoms_reported,
        sanitation_flags
      ]
    );

    publish('field_flag.created', { ward_id, flag: created.rows[0] });
    res.status(201).json({ success: true, flag: created.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.get('/', requireRole(['SMC', 'ASHA']), async (req, res, next) => {
  try {
    const result = await query(
      `SELECT ff.*, w.name as ward_name
       FROM field_flags ff
       JOIN wards w ON w.id = ff.ward_id
       ORDER BY ff.flagged_at DESC
       LIMIT 100`
    );

    res.json({
      success: true,
      data: result.rows,
      pending_count: result.rows.filter((row) => row.status === 'pending').length
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', requireRole(['SMC']), async (req, res, next) => {
  try {
    const updated = await query(
      `UPDATE field_flags
          SET status = COALESCE($1, 'reviewed'),
              reviewed_by = COALESCE($2, $3),
              reviewed_at = NOW()
        WHERE id = $4
        RETURNING *`,
      [req.body.status, req.body.reviewed_by, req.actor.userName, req.params.id]
    );

    if (!updated.rows.length) throw new ApiError(404, `Flag ${req.params.id} not found`);

    publish('field_flag.reviewed', { flag: updated.rows[0] });
    res.json({ success: true, flag: updated.rows[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
