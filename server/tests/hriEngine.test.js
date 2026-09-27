const { computeHRI, applyIntervention } = require('../src/services/hriEngine');

describe('hriEngine', () => {
  test('computeHRI returns bounded score and severity', () => {
    const result = computeHRI(
      { lst_celsius: 39, mndwi: 0.7, ndvi: 0.28, rainfall_mm: 18 },
      { cases_last_7_days: 20, trend: 'rising', sanitation_reports_7_days: 12 },
      { population: 22000, vaccination_coverage: 66, elderly_percent: 9, comorbidity_burden: 20 },
      new Date('2026-08-10T00:00:00.000Z')
    );

    expect(result.final_hri).toBeGreaterThanOrEqual(0);
    expect(result.final_hri).toBeLessThanOrEqual(12);
    expect(['LOW', 'MODERATE', 'HIGH']).toContain(result.severity);
  });

  test('applyIntervention reduces selected signals', () => {
    const current = {
      heat_exposure: 1.2,
      water_stagnation: 1.4,
      vector_density: 1.6,
      disease_burden: 1.1,
      sanitation_stress: 1.0,
      wastewater_index: 1.1,
      seasonal_multiplier: 1.3,
      vulnerability_multiplier: 1.12,
      final_hri: 11.4
    };

    const next = applyIntervention(current, 'fogging');
    expect(next.signals_after.vector_density).toBeLessThan(current.vector_density);
    expect(next.signals_after.water_stagnation).toBeLessThan(current.water_stagnation);
    expect(next.hri_after).toBeLessThan(current.final_hri);
  });
});
