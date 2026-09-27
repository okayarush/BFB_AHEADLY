const express = require('express');
const { computeWardHri, computeAllHri } = require('../db/hriRepository');
const { addDualScale } = require('../utils/hriScale');
const { requireRole } = require('../middleware/roleAuth');

const router = express.Router();

router.post('/compute/:wardId', requireRole(['SMC']), async (req, res, next) => {
  try {
    const computed = await computeWardHri(req.params.wardId);
    res.json({ success: true, data: addDualScale(computed) });
  } catch (error) {
    next(error);
  }
});

router.post('/compute-all', requireRole(['SMC']), async (_req, res, next) => {
  try {
    const rows = await computeAllHri();
    res.json({ success: true, count: rows.length, data: rows.map(addDualScale) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
