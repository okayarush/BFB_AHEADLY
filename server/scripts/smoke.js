const axios = require('axios');

const base = process.env.SMOKE_BASE_URL || 'http://localhost:5000';
const headers = { 'x-user-role': 'SMC' };

const pass = (name, detail) => console.log(`PASS ${name}${detail ? ` :: ${detail}` : ''}`);
const fail = (name, err) => console.error(`FAIL ${name} :: ${err.message || err}`);

async function run() {
  // Step 2
  const wards = await axios.get(`${base}/api/wards`);
  if (!Array.isArray(wards.data.data) || wards.data.data.length !== 16) throw new Error('Expected 16 wards');
  pass('GET /api/wards', `rows=${wards.data.data.length}`);

  const wardId = wards.data.data[0].id;
  const wardDetail = await axios.get(`${base}/api/wards/${wardId}`);
  if (!wardDetail.data.data.latest_hri) throw new Error('missing latest_hri');
  pass('GET /api/wards/:id', wardId);

  // Step 3
  const beforeReport = wardDetail.data.data.latest_hri.hri_12;
  const report = await axios.post(`${base}/api/reports`, {
    ward_id: wardId,
    report_type: 'stagnant_water',
    source: 'citizen',
    severity: 'high',
    description: 'smoke test report'
  }, { headers });
  if (!report.data.hri_update) throw new Error('missing hri_update');
  pass('POST /api/reports', `${beforeReport} -> ${report.data.hri_update.hri_after}`);

  // Step 4
  const intervention = await axios.post(`${base}/api/interventions`, {
    ward_id: wardId,
    intervention_type: 'fogging'
  }, { headers });
  if (!intervention.data.hri_update) throw new Error('missing intervention hri_update');
  pass('POST /api/interventions', `${intervention.data.hri_update.hri_before} -> ${intervention.data.hri_update.hri_after}`);

  // Step 5
  const flag = await axios.post(`${base}/api/field-flags`, {
    ward_id: wardId,
    household_id: 'HH-SMOKE-01',
    risk_score: 78,
    risk_level: 'HIGH',
    reasons: ['Fever cluster'],
    symptoms_reported: ['fever'],
    sanitation_flags: ['open_drain']
  }, { headers: { 'x-user-role': 'ASHA' } });
  const list = await axios.get(`${base}/api/field-flags`, { headers });
  await axios.patch(`${base}/api/field-flags/${flag.data.flag.id}`, { status: 'reviewed' }, { headers });
  pass('Field flag lifecycle', `flags=${list.data.data.length}`);

  // Step 6
  const context = await axios.get(`${base}/api/context/${wardId}`);
  if (!context.data.context.includes('HRI Score')) throw new Error('context missing HRI text');
  pass('GET /api/context/:wardId');

  // Step 7 via simulate endpoint (event emission path)
  const simulate = await axios.post(`${base}/api/satellite/simulate`, { ward_id: wardId, scenario: 'heat_spike' }, { headers });
  if (!simulate.data.latest_hri) throw new Error('simulate missing hri');
  pass('POST /api/satellite/simulate');

  console.log('SMOKE COMPLETE');
}

run().catch((err) => {
  fail('SMOKE', err);
  process.exitCode = 1;
});
