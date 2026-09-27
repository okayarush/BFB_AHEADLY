const express = require('express');
const { query } = require('../config/db');
const { requireRole } = require('../middleware/roleAuth');
const { requireFields } = require('../middleware/validate');
const { publish } = require('../services/sseBus');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const result = await query(`SELECT * FROM alerts WHERE status = 'active' ORDER BY created_at DESC LIMIT 100`);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireRole(['SMC']), requireFields(['ward_id', 'title', 'severity']), async (req, res, next) => {
  try {
    const created = await query(
      `INSERT INTO alerts (ward_id, title, severity, message, created_by, status)
       VALUES ($1,$2,$3,$4,$5, COALESCE($6, 'active'))
       RETURNING *`,
      [req.body.ward_id, req.body.title, req.body.severity, req.body.message || null, req.actor.userName, req.body.status || 'active']
    );
    publish('alert.created', { alert: created.rows[0] });
    res.status(201).json({ success: true, alert: created.rows[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
