'use strict';

const { pool } = require('../src/config/db');
const { WARDS, SATELLITE_DATA, HOSPITALS, DISEASE_REPORTS, COMMUNITY_REPORTS } = require('../src/db/seed/data');
const { computeAllHri } = require('../src/db/hriRepository');

async function seed() {
  if (!pool) throw new Error('DATABASE_URL is not set. Configure it before running seed.');

  await pool.query('BEGIN');
  try {
    await pool.query(`TRUNCATE TABLE
      alerts, predictions, interventions, hri_history, hri_scores,
      field_flags, community_reports, disease_reports, hospital_capacity,
      hospitals, satellite_data, wards
      RESTART IDENTITY CASCADE`);

    // ── WARDS ──────────────────────────────────────────────────────────────
    for (const ward of WARDS) {
      await pool.query(
        `INSERT INTO wards
           (id, name, display_name, population, area_sqkm,
            centroid_lat, centroid_lng, zone,
            vaccination_coverage, elderly_percent, comorbidity_burden)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          ward.id, ward.name, ward.display_name,
          ward.population, ward.area_sqkm,
          ward.centroid_lat, ward.centroid_lng, ward.zone,
          ward.vaccination_coverage, ward.elderly_percent, ward.comorbidity_burden
        ]
      );
    }

    // ── SATELLITE DATA ─────────────────────────────────────────────────────
    for (const sat of SATELLITE_DATA) {
      await pool.query(
        `INSERT INTO satellite_data
           (ward_id, lst_celsius, ndvi, mndwi, humidity_percent, rainfall_mm, source)
         VALUES ($1,$2,$3,$4,$5,$6,'ECOSTRESS_SENTINEL2')`,
        [sat.ward_id, sat.lst_celsius, sat.ndvi, sat.mndwi, sat.humidity_percent, sat.rainfall_mm]
      );
    }

    // ── HOSPITALS ──────────────────────────────────────────────────────────
    for (const hospital of HOSPITALS) {
      const inserted = await pool.query(
        `INSERT INTO hospitals
           (name, type, ward_id, total_beds, icu_beds, ventilators,
            lat, lng, contact, emergency_dept, fhir_enabled)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING id`,
        [
          hospital.name, hospital.type, hospital.ward_id,
          hospital.total_beds, hospital.icu_beds, hospital.ventilators,
          hospital.lat, hospital.lng, hospital.contact,
          hospital.emergency_dept, hospital.fhir_enabled
        ]
      );
      await pool.query(
        `INSERT INTO hospital_capacity
           (hospital_id, general_available, icu_available,
            ventilators_available, occupancy_percent, updated_at)
         VALUES ($1,$2,$3,$4,$5,NOW())`,
        [
          inserted.rows[0].id,
          hospital.general_available, hospital.icu_available,
          hospital.ventilators_available, hospital.occupancy_percent
        ]
      );
    }

    // ── DISEASE REPORTS ────────────────────────────────────────────────────
    for (const report of DISEASE_REPORTS) {
      await pool.query(
        `INSERT INTO disease_reports
           (ward_id, disease_code, disease_name, case_count, severity, trend, report_date)
         VALUES ($1,$2,$3,$4,$5,$6,CURRENT_DATE)`,
        [
          report.ward_id, report.disease_code, report.disease_name,
          report.case_count, report.severity, report.trend
        ]
      );
    }

    // ── COMMUNITY REPORTS ──────────────────────────────────────────────────
    for (const report of COMMUNITY_REPORTS) {
      await pool.query(
        `INSERT INTO community_reports
           (ward_id, report_type, source, severity, lat, lng, description, submitted_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())`,
        [
          report.ward_id, report.report_type, report.source,
          report.severity, report.lat, report.lng, report.description
        ]
      );
    }

    await pool.query('COMMIT');
    console.log('[seed] all tables populated successfully');

  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }

  // ── COMPUTE HRI FOR ALL WARDS ──────────────────────────────────────────
  console.log('[seed] computing HRI for all 16 wards...');
  const computedRows = await computeAllHri();

  // ── SEED PREDICTIONS ───────────────────────────────────────────────────
  console.log('[seed] generating 14-day predictions...');
  for (const row of computedRows) {
    for (let day = 1; day <= 14; day++) {
      const drift = day <= 7 ? 0.15 : 0.28;
      const predicted = Math.max(
        0,
        Math.min(12, Number(row.final_hri) + (Math.random() * drift - drift / 2))
      );
      const severity = predicted >= 7 ? 'HIGH' : predicted >= 4 ? 'MODERATE' : 'LOW';
      await pool.query(
        `INSERT INTO predictions (ward_id, prediction_date, predicted_hri, severity, note)
         VALUES ($1, CURRENT_DATE + $2, $3, $4, $5)`,
        [row.ward_id, day, Number(predicted.toFixed(2)), severity, 'seed_forecast']
      );
    }
  }

  // ── VERIFICATION ───────────────────────────────────────────────────────
  const wardsCount = await pool.query(`SELECT COUNT(*)::int AS count FROM wards`);
  const satCount = await pool.query(`SELECT COUNT(*)::int AS count FROM satellite_data`);
  const hospCount = await pool.query(`SELECT COUNT(*)::int AS count FROM hospitals`);
  const diseaseCount = await pool.query(`SELECT COUNT(*)::int AS count FROM disease_reports`);
  const reportCount = await pool.query(`SELECT COUNT(*)::int AS count FROM community_reports`);
  const severityMix = await pool.query(
    `SELECT severity, COUNT(*)::int AS count FROM hri_scores
     WHERE id IN (SELECT MAX(id) FROM hri_scores GROUP BY ward_id)
     GROUP BY severity ORDER BY severity`
  );

  console.log('[seed] wards:            ', wardsCount.rows[0].count);
  console.log('[seed] satellite rows:   ', satCount.rows[0].count);
  console.log('[seed] hospitals:        ', hospCount.rows[0].count);
  console.log('[seed] disease reports:  ', diseaseCount.rows[0].count);
  console.log('[seed] community reports:', reportCount.rows[0].count);
  console.log('[seed] HRI severity mix: ', severityMix.rows);
  console.log('[seed] done ✓');
}

seed()
  .catch((err) => {
    console.error('[seed] failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (pool) await pool.end();
  });