const express = require('express');
const { query } = require('../config/db');
const { requireFields } = require('../middleware/validate');
const { requireRole } = require('../middleware/roleAuth');
const { applyIntervention, INTERVENTION_REDUCTIONS } = require('../services/hriEngine');
const { latestHriByWard, insertHriSnapshot } = require('../db/hriRepository');
const { publish } = require('../services/sseBus');
const { ApiError } = require('../utils/errors');

const router = express.Router();

router.post('/', requireRole(['SMC']), requireFields(['ward_id', 'intervention_type']), async (req, res, next) => {
  try {
    const { ward_id, intervention_type } = req.body;
    const implementedBy = req.body.implemented_by || req.actor.userName;

    const current = await latestHriByWard(ward_id);
    if (!current) throw new ApiError(404, `No HRI data found for ${ward_id}`);

    const result = applyIntervention(current, intervention_type);
    const reductionAmount = Number((Number(current.final_hri) - result.hri_after).toFixed(2));
    const reductionPercent = current.final_hri > 0
      ? Number(((reductionAmount / Number(current.final_hri)) * 100).toFixed(1))
      : 0;

    const diseaseCases = await query(
      `SELECT COALESCE(SUM(case_count),0)::int AS total FROM disease_reports WHERE ward_id = $1 AND report_date >= CURRENT_DATE - 7`,
      [ward_id]
    );
    const currentCaseCount = Number(diseaseCases.rows[0].total || 0);
    const projectedCaseReduction = Math.round(currentCaseCount * (reductionPercent / 100));

    const intervention = await query(
      `INSERT INTO interventions (
          ward_id, intervention_type, label, implemented_by,
          hri_before, signals_before, hri_after, signals_after,
          reduction_amount, reduction_percent, projected_case_reduction,
          projected_case_reduction_percent
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        ward_id,
        intervention_type,
        INTERVENTION_REDUCTIONS[intervention_type]?.label || intervention_type,
        implementedBy,
        current.final_hri,
        JSON.stringify(current),
        result.hri_after,
        JSON.stringify(result.signals_after),
        reductionAmount,
        reductionPercent,
        projectedCaseReduction,
        reductionPercent
      ]
    );

    const insertedHri = await insertHriSnapshot(ward_id, {
      ...result.signals_after,
      final_hri: result.hri_after,
      severity: result.severity_after,
      convergence_count: result.convergence_after,
      rainfall_mm: current.rainfall_mm || 0
    });

    const payload = {
      success: true,
      intervention: intervention.rows[0],
      hri_update: {
        ward_id,
        hri_before: current.final_hri,
        hri_after: result.hri_after,
        severity_before: current.severity,
        severity_after: result.severity_after,
        reduction_amount: reductionAmount,
        reduction_percent: reductionPercent,
        projected_case_reduction: projectedCaseReduction,
        signals_after: result.signals_after,
        convergence_after: result.convergence_after
      }
    };

    publish('intervention.applied', { ward_id, intervention: intervention.rows[0], hri_update: payload.hri_update });
    publish('hri.updated', { ward_id, latest_hri: insertedHri, reason: 'intervention' });

    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
});

router.get('/:wardId', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM interventions WHERE ward_id = $1 ORDER BY implemented_at DESC LIMIT 100`,
      [req.params.wardId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
