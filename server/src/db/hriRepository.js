const { query } = require('../config/db');
const { computeHRI } = require('../services/hriEngine');

const latestHriByWard = async (wardId) => {
  const result = await query(
    `SELECT * FROM hri_scores WHERE ward_id = $1 ORDER BY computed_at DESC, id DESC LIMIT 1`,
    [wardId]
  );
  return result.rows[0] || null;
};

const getWardInputs = async (wardId) => {
  const ward = await query(`SELECT * FROM wards WHERE id = $1`, [wardId]);
  const satellite = await query(
    `SELECT * FROM satellite_data WHERE ward_id = $1 ORDER BY observed_at DESC, id DESC LIMIT 1`,
    [wardId]
  );
  const disease = await query(
    `SELECT COALESCE(SUM(case_count),0)::int AS cases_last_7_days,
            COALESCE(MAX(trend), 'stable') AS trend
       FROM disease_reports
      WHERE ward_id = $1
        AND report_date >= CURRENT_DATE - 7`,
    [wardId]
  );
  const reports = await query(
    `SELECT COUNT(*)::int AS sanitation_reports_7_days
       FROM community_reports
      WHERE ward_id = $1
        AND report_type != 'symptom'
        AND submitted_at >= NOW() - INTERVAL '7 days'`,
    [wardId]
  );

  return {
    ward: ward.rows[0] || null,
    satellite: satellite.rows[0] || null,
    disease: disease.rows[0] || { cases_last_7_days: 0, trend: 'stable' },
    reports: reports.rows[0] || { sanitation_reports_7_days: 0 }
  };
};

const insertHriSnapshot = async (wardId, computed, at = null) => {
  const result = await query(
    `INSERT INTO hri_scores (
      ward_id, heat_exposure, water_stagnation, vector_density,
      disease_burden, sanitation_stress, wastewater_index,
      base_hri, seasonal_multiplier, vulnerability_multiplier,
      final_hri, severity, convergence_count, rainfall_mm, computed_at
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,COALESCE($15, NOW())
    ) RETURNING *`,
    [
      wardId,
      computed.heat_exposure,
      computed.water_stagnation,
      computed.vector_density,
      computed.disease_burden,
      computed.sanitation_stress,
      computed.wastewater_index,
      computed.base_hri,
      computed.seasonal_multiplier,
      computed.vulnerability_multiplier,
      computed.final_hri,
      computed.severity,
      computed.convergence_count,
      computed.rainfall_mm || 0,
      at
    ]
  );

  await query(
    `INSERT INTO hri_history (
      ward_id, recorded_date, final_hri, severity, convergence_count,
      heat_exposure, water_stagnation, vector_density, disease_burden,
      sanitation_stress, wastewater_index, vulnerability_multiplier
    ) VALUES (
      $1, CURRENT_DATE, $2,$3,$4,$5,$6,$7,$8,$9,$10,$11
    ) ON CONFLICT (ward_id, recorded_date) DO UPDATE SET
      final_hri = EXCLUDED.final_hri,
      severity = EXCLUDED.severity,
      convergence_count = EXCLUDED.convergence_count,
      heat_exposure = EXCLUDED.heat_exposure,
      water_stagnation = EXCLUDED.water_stagnation,
      vector_density = EXCLUDED.vector_density,
      disease_burden = EXCLUDED.disease_burden,
      sanitation_stress = EXCLUDED.sanitation_stress,
      wastewater_index = EXCLUDED.wastewater_index,
      vulnerability_multiplier = EXCLUDED.vulnerability_multiplier`,
    [
      wardId,
      computed.final_hri,
      computed.severity,
      computed.convergence_count,
      computed.heat_exposure,
      computed.water_stagnation,
      computed.vector_density,
      computed.disease_burden,
      computed.sanitation_stress,
      computed.wastewater_index,
      computed.vulnerability_multiplier
    ]
  );

  return result.rows[0];
};

const computeWardHri = async (wardId) => {
  const inputs = await getWardInputs(wardId);
  if (!inputs.ward || !inputs.satellite) {
    throw new Error(`Missing ward/satellite data for ${wardId}`);
  }

  const reportData = {
    cases_last_7_days: inputs.disease.cases_last_7_days,
    trend: inputs.disease.trend,
    sanitation_reports_7_days: inputs.reports.sanitation_reports_7_days
  };

  const computed = computeHRI(inputs.satellite, reportData, inputs.ward);
  return insertHriSnapshot(wardId, computed);
};

const computeAllHri = async () => {
  const wards = await query(`SELECT id FROM wards ORDER BY id`);
  const rows = [];
  for (const ward of wards.rows) {
    rows.push(await computeWardHri(ward.id));
  }
  return rows;
};

module.exports = {
  latestHriByWard,
  getWardInputs,
  insertHriSnapshot,
  computeWardHri,
  computeAllHri
};
