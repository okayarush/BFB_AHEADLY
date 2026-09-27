const INTERVENTION_REDUCTIONS = {
  fogging: { vectorDensity: -0.6, waterStagnation: -0.3, label: 'Vector Fogging Deployment' },
  boilwater_advisory: { diseaseBurden: -0.4, label: 'Boil-Water Advisory' },
  asha_mobilisation: { diseaseBurden: -0.3, sanitationStress: -0.2, label: 'ASHA Worker Mobilisation' },
  drain_cleaning: { waterStagnation: -0.5, sanitationStress: -0.4, wastewaterIndex: -0.3, label: 'Drain Cleaning & Desilting' },
  vaccination_drive: { diseaseBurden: -0.5, vulnerabilityMultiplierReduction: 0.08, label: 'Emergency Vaccination Drive' }
};

const severityFrom12 = (hri) => (hri >= 7 ? 'HIGH' : hri >= 4 ? 'MODERATE' : 'LOW');

const computeHRI = (satelliteData, reportData, wardDemographics, date = new Date()) => {
  const lst = Number(satelliteData.lst_celsius ?? 32);
  const heatExposure = Number(Math.min(2, Math.max(0, ((lst - 28) / 14) * 2)).toFixed(3));

  const mndwi = Number(satelliteData.mndwi ?? 0.3);
  const waterStagnation = Number(Math.min(2, mndwi * 2).toFixed(3));

  const ndvi = Number(satelliteData.ndvi ?? 0.35);
  const vectorDensity = Number(Math.min(2, heatExposure * 0.4 + waterStagnation * 0.4 + (1 - ndvi) * 0.8).toFixed(3));

  const cases = Number(reportData.cases_last_7_days ?? 0);
  const population = Number(wardDemographics.population || 50000);
  const trendMult = { rising: 1.5, stable: 1.0, declining: 0.6 }[String(reportData.trend || 'stable')] || 1.0;
  const diseaseBurden = Number(Math.min(2, ((cases / population) * 10000) * trendMult * 0.8).toFixed(3));

  const sanitationReports = Number(reportData.sanitation_reports_7_days ?? 0);
  const sanitationStress = Number(Math.min(2, (sanitationReports / 20) * 2).toFixed(3));

  const rainfall = Number(satelliteData.rainfall_mm ?? 0);
  const rainfallEffect = rainfall > 20 ? 0.7 : rainfall > 5 ? 0.3 : 0.1;
  const wastewaterIndex = Number(Math.min(2, sanitationStress * 0.5 + waterStagnation * 0.3 + rainfallEffect).toFixed(3));

  const month = date.getMonth() + 1;
  const seasonalMultiplier = [6, 7, 8, 9, 10].includes(month)
    ? 1.4
    : [4, 5].includes(month)
      ? 1.3
      : [11, 12, 1, 2].includes(month)
        ? 1.1
        : 1.0;

  const vacGap = 1 - (Number(wardDemographics.vaccination_coverage ?? 72) / 100);
  const elderlyRisk = Number(wardDemographics.elderly_percent ?? 8) / 100;
  const comorbidityRisk = Number(wardDemographics.comorbidity_burden ?? 18) / 100;
  const vulnerabilityScore = vacGap * 0.4 + elderlyRisk * 0.35 + comorbidityRisk * 0.25;
  const vulnerabilityMultiplier = Number((1 + vulnerabilityScore * 0.3).toFixed(3));

  const baseHRI = heatExposure + waterStagnation + vectorDensity + diseaseBurden + sanitationStress + wastewaterIndex;
  const finalHRI = Number(Math.min(12, baseHRI * seasonalMultiplier * vulnerabilityMultiplier).toFixed(2));

  const convergenceCount = [
    heatExposure > 1,
    waterStagnation > 1,
    vectorDensity > 1,
    diseaseBurden > 0.5,
    sanitationStress > 0.5,
    wastewaterIndex > 0.5
  ].filter(Boolean).length;

  return {
    heat_exposure: heatExposure,
    water_stagnation: waterStagnation,
    vector_density: vectorDensity,
    disease_burden: diseaseBurden,
    sanitation_stress: sanitationStress,
    wastewater_index: wastewaterIndex,
    base_hri: Number(baseHRI.toFixed(2)),
    seasonal_multiplier: seasonalMultiplier,
    vulnerability_multiplier: vulnerabilityMultiplier,
    final_hri: finalHRI,
    severity: severityFrom12(finalHRI),
    convergence_count: convergenceCount,
    rainfall_mm: rainfall
  };
};

const applyIntervention = (currentSignals, interventionType) => {
  const reductions = INTERVENTION_REDUCTIONS[interventionType];
  if (!reductions) throw new Error(`Unknown intervention type: ${interventionType}`);

  const next = { ...currentSignals };
  if (reductions.vectorDensity) next.vector_density = Math.max(0, Number(next.vector_density) + reductions.vectorDensity);
  if (reductions.waterStagnation) next.water_stagnation = Math.max(0, Number(next.water_stagnation) + reductions.waterStagnation);
  if (reductions.diseaseBurden) next.disease_burden = Math.max(0, Number(next.disease_burden) + reductions.diseaseBurden);
  if (reductions.sanitationStress) next.sanitation_stress = Math.max(0, Number(next.sanitation_stress) + reductions.sanitationStress);
  if (reductions.wastewaterIndex) next.wastewater_index = Math.max(0, Number(next.wastewater_index) + reductions.wastewaterIndex);

  const base = Number(next.heat_exposure) + Number(next.water_stagnation) + Number(next.vector_density) + Number(next.disease_burden) + Number(next.sanitation_stress) + Number(next.wastewater_index);
  let vuln = Number(next.vulnerability_multiplier);
  if (reductions.vulnerabilityMultiplierReduction) vuln = Math.max(1, vuln - reductions.vulnerabilityMultiplierReduction);

  const final = Number(Math.min(12, base * Number(next.seasonal_multiplier) * vuln).toFixed(2));
  return {
    signals_after: {
      ...next,
      vulnerability_multiplier: vuln,
      base_hri: Number(base.toFixed(2))
    },
    hri_after: final,
    severity_after: severityFrom12(final),
    convergence_after: [
      next.heat_exposure > 1,
      next.water_stagnation > 1,
      next.vector_density > 1,
      next.disease_burden > 0.5,
      next.sanitation_stress > 0.5,
      next.wastewater_index > 0.5
    ].filter(Boolean).length
  };
};

module.exports = { computeHRI, applyIntervention, INTERVENTION_REDUCTIONS, severityFrom12 };
