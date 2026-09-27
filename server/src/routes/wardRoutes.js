const express = require('express');
const { query } = require('../config/db');
const { addDualScale } = require('../utils/hriScale');
const { computeWardHri } = require('../db/hriRepository');
const { ApiError } = require('../utils/errors');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT w.*, 
         h.final_hri, h.severity, h.convergence_count,
         h.heat_exposure, h.water_stagnation, h.vector_density,
         h.disease_burden, h.sanitation_stress, h.wastewater_index,
         h.vulnerability_multiplier, h.computed_at,
         (SELECT COUNT(*) FROM community_reports cr 
            WHERE cr.ward_id = w.id 
              AND cr.submitted_at > NOW() - INTERVAL '7 days') AS reports_7d,
         (SELECT COALESCE(SUM(case_count),0) FROM disease_reports dr 
            WHERE dr.ward_id = w.id 
              AND dr.report_date > CURRENT_DATE - 7) AS cases_7d
       FROM wards w
       LEFT JOIN hri_scores h ON h.ward_id = w.id
        AND h.id = (
          SELECT id FROM hri_scores 
           WHERE ward_id = w.id 
           ORDER BY computed_at DESC, id DESC LIMIT 1
        )
       ORDER BY h.final_hri DESC NULLS LAST, w.id ASC`
    );

    res.json({ success: true, data: result.rows.map(addDualScale) });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const wardId = req.params.id;

    const ward = await query(`SELECT * FROM wards WHERE id = $1`, [wardId]);
    if (!ward.rows.length) throw new ApiError(404, `Ward ${wardId} not found`);

    let hri = await query(
      `SELECT * FROM hri_scores WHERE ward_id = $1 ORDER BY computed_at DESC, id DESC LIMIT 1`,
      [wardId]
    );

    if (!hri.rows.length) {
      await computeWardHri(wardId);
      hri = await query(
        `SELECT * FROM hri_scores WHERE ward_id = $1 ORDER BY computed_at DESC, id DESC LIMIT 1`,
        [wardId]
      );
    }

    const [history, interventions, reports, flags, diseases] = await Promise.all([
      query(`SELECT * FROM hri_history WHERE ward_id = $1 ORDER BY recorded_date DESC LIMIT 30`, [wardId]),
      query(`SELECT * FROM interventions WHERE ward_id = $1 ORDER BY implemented_at DESC LIMIT 20`, [wardId]),
      query(`SELECT * FROM community_reports WHERE ward_id = $1 ORDER BY submitted_at DESC LIMIT 25`, [wardId]),
      query(`SELECT * FROM field_flags WHERE ward_id = $1 ORDER BY flagged_at DESC LIMIT 25`, [wardId]),
      query(`SELECT disease_name, case_count, report_date, trend FROM disease_reports WHERE ward_id = $1 ORDER BY report_date DESC LIMIT 50`, [wardId])
    ]);

    res.json({
      success: true,
      data: {
        ward: ward.rows[0],
        latest_hri: addDualScale(hri.rows[0]),
        hri_history: history.rows,
        interventions: interventions.rows,
        community_reports: reports.rows,
        field_flags: flags.rows,
        disease_reports: diseases.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
