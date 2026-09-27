const express = require('express');
const { query } = require('../config/db');
const { requireFields } = require('../middleware/validate');
const { requireRole } = require('../middleware/roleAuth');
const { latestHriByWard, getWardInputs, insertHriSnapshot } = require('../db/hriRepository');
const { computeHRI } = require('../services/hriEngine');
const { publish } = require('../services/sseBus');

const router = express.Router();

router.post('/', requireRole(['ASHA', 'SMC', 'HOSPITAL']), requireFields(['ward_id', 'report_type']), async (req, res, next) => {
  try {
    const {
      ward_id,
      report_type,
      source = 'citizen',
      severity = 'medium',
      lat = null,
      lng = null,
      description = null
    } = req.body;

    const insert = await query(
      `INSERT INTO community_reports (ward_id, report_type, source, severity, lat, lng, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [ward_id, report_type, source, severity, lat, lng, description]
    );

    const before = await latestHriByWard(ward_id);
    const inputs = await getWardInputs(ward_id);
    const reportData = {
      cases_last_7_days: inputs.disease.cases_last_7_days,
      trend: inputs.disease.trend,
      sanitation_reports_7_days: inputs.reports.sanitation_reports_7_days
    };
    const computed = computeHRI(inputs.satellite, reportData, inputs.ward);
    const after = await insertHriSnapshot(ward_id, computed);

    const response = {
      success: true,
      report: insert.rows[0],
      hri_update: {
        ward_id,
        hri_before: before?.final_hri ?? null,
        hri_after: after.final_hri,
        severity_before: before?.severity ?? null,
        severity_after: after.severity,
        convergence_before: before?.convergence_count ?? null,
        convergence_after: after.convergence_count,
        signal_changed: 'sanitation_stress',
        signal_before: before?.sanitation_stress ?? null,
        signal_after: after.sanitation_stress,
        severity_changed: before ? before.severity !== after.severity : true
      }
    };

    publish('report.created', { ward_id, report: insert.rows[0] });
    publish('hri.updated', { ward_id, latest_hri: after, reason: 'community_report' });

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (_req, res, next) => {
  try {
    const result = await query(`SELECT * FROM community_reports ORDER BY submitted_at DESC LIMIT 250`);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

router.get('/:wardId', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM community_reports WHERE ward_id = $1 ORDER BY submitted_at DESC LIMIT 200`,
      [req.params.wardId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
