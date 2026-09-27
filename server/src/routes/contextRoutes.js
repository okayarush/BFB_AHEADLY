const express = require('express');
const { query } = require('../config/db');
const { addDualScale } = require('../utils/hriScale');

const router = express.Router();

router.get('/:wardId', async (req, res, next) => {
  try {
    const { wardId } = req.params;
    const { page = 'Digital Twin', layer = '' } = req.query;

    const [ward, hri, diseases, reports, cityMetrics, flags] = await Promise.all([
      query('SELECT * FROM wards WHERE id = $1', [wardId]),
      query('SELECT * FROM hri_scores WHERE ward_id = $1 ORDER BY computed_at DESC, id DESC LIMIT 1', [wardId]),
      query(`SELECT disease_name, SUM(case_count)::int AS cases, COALESCE(MAX(trend),'stable') AS trend
             FROM disease_reports
            WHERE ward_id = $1 AND report_date >= CURRENT_DATE - 7
            GROUP BY disease_name
            ORDER BY cases DESC
            LIMIT 3`, [wardId]),
      query(`SELECT COUNT(*)::int AS total
             FROM community_reports
            WHERE ward_id = $1
              AND submitted_at >= NOW() - INTERVAL '7 days'`, [wardId]),
      query(`SELECT COUNT(*)::int AS total_wards,
                    SUM(CASE WHEN latest.severity = 'HIGH' THEN 1 ELSE 0 END)::int AS high_risk,
                    AVG(latest.final_hri)::numeric AS avg_hri
               FROM (
                 SELECT DISTINCT ON (ward_id) ward_id, final_hri, severity
                   FROM hri_scores
                  ORDER BY ward_id, computed_at DESC, id DESC
               ) latest`),
      query(`SELECT COUNT(*)::int AS pending
             FROM field_flags WHERE ward_id = $1 AND status = 'pending'`, [wardId])
    ]);

    const w = ward.rows[0] || { id: wardId, name: wardId };
    const h = hri.rows[0] || null;
    const city = cityMetrics.rows[0] || { total_wards: 0, high_risk: 0, avg_hri: 0 };

    const context = `
You are the Aheadly AI Health Copilot for Solapur Municipal Corporation.
You have access to live health intelligence data for all 16 Solapur wards.

CURRENT SESSION CONTEXT:
- Page: ${page}
- Active ward: ${w.name}
- Ward ID: ${wardId}
- Active layer: ${layer || 'default'}

LIVE WARD DATA — ${w.name}:
- HRI Score: ${h ? `${h.final_hri}/12 (${h.severity})` : 'not available'}
- Convergence: ${h ? `${h.convergence_count}/6 signals elevated` : 'not available'}
- Computed: ${h?.computed_at ? new Date(h.computed_at).toLocaleString('en-IN') : 'not available'}

SIGNAL BREAKDOWN:
- Heat Exposure: ${h?.heat_exposure ?? 'n/a'}/2.0
- Water Stagnation: ${h?.water_stagnation ?? 'n/a'}/2.0
- Vector Density: ${h?.vector_density ?? 'n/a'}/2.0
- Disease Burden: ${h?.disease_burden ?? 'n/a'}/2.0
- Sanitation Stress: ${h?.sanitation_stress ?? 'n/a'}/2.0
- Wastewater Index: ${h?.wastewater_index ?? 'n/a'}/2.0
- Seasonal Multiplier: ${h?.seasonal_multiplier ?? 'n/a'}x
- Vulnerability Multiplier: ${h?.vulnerability_multiplier ?? 'n/a'}x

DISEASE INTELLIGENCE:
${diseases.rows.map((d) => `- ${d.disease_name}: ${d.cases} cases (last 7 days, trend: ${d.trend})`).join('\n') || '- no recent disease records'}

COMMUNITY GROUND TRUTH:
- Citizen/ASHA reports (last 7 days): ${reports.rows[0]?.total ?? 0}
- Pending ASHA field flags: ${flags.rows[0]?.pending ?? 0}

CITY-WIDE CONTEXT:
- Wards monitored: ${city.total_wards}/16
- HIGH risk wards: ${city.high_risk}
- City average HRI: ${Number(city.avg_hri || 0).toFixed(1)}/12

INSTRUCTIONS:
1. Always cite specific ward names, HRI scores, and signal values in your responses
2. End every analytical response with 2-3 specific recommended actions
3. If asked about this ward, reference the live data above — do not invent numbers
4. Tone: authoritative and data-driven for SMC officers
5. If you don't know something, say so — never fabricate health data
`.trim();

    res.json({
      success: true,
      context,
      ward_name: w.name,
      hri: h ? addDualScale(h) : null
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
