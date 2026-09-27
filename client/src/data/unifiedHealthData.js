// ============================================================
// src/data/unifiedHealthData.js
// SINGLE SOURCE OF TRUTH for all Aheadly data.
// Every page, the copilot, and the landing page imports from here.
// NEVER generate random numbers in a component — always import.
// ============================================================

// ── WARD DATA ──────────────────────────────────────────────────────────────────
// All 16 sectors mapped from HospitalRegistry.js ward names.
// Sector names correspond to GeoJSON "Name" fields via getSectorID().

export const wardData = {
  'Sector-01': {
    id: 'Sector-01', name: 'Sector-01', displayName: 'Sector-01 (Ashok Chowk)',
    population: 16800,
    hri: {
      total: 71, severity: 'HIGH',
      breakdown: { heatExposure: 18, waterStagnation: 14, vectorDensity: 12, diseaseBurden: 18, sanitationStress: 9 }
    },
    convergenceCount: 4,
    diseases: {
      typhoid: { cases: 14, trend: 'rising', transmission: 'Contaminated water / food' },
      dengue: { cases: 2, trend: 'stable', transmission: 'Aedes aegypti' },
      respiratory: { cases: 3, trend: 'stable' },
    },
    communityReports: { total: 6, garbage: 2, stagnantWater: 2, openDrains: 2, last7Days: 5 },
    ashaData: { totalHouseholds: 20, visited: 12, flagged: 2, symptomsReported: 3 },
  },
  'Sector-02': {
    id: 'Sector-02', name: 'Sector-02', displayName: 'Sector-02 (Bhavani Peth)',
    population: 21000,
    hri: {
      total: 42, severity: 'MODERATE',
      breakdown: { heatExposure: 10, waterStagnation: 12, vectorDensity: 8, diseaseBurden: 6, sanitationStress: 6 }
    },
    convergenceCount: 2,
    diseases: {
      malaria: { cases: 3, trend: 'stable', transmission: 'Anopheles mosquito' },
      respiratory: { cases: 4, trend: 'stable' },
      dengue: { cases: 1, trend: 'stable', transmission: 'Aedes aegypti' },
    },
    communityReports: { total: 11, garbage: 4, stagnantWater: 4, openDrains: 3, last7Days: 9 },
    ashaData: { totalHouseholds: 20, visited: 10, flagged: 3, symptomsReported: 6 },
  },
  'Sector-03': {
    id: 'Sector-03', name: 'Sector-03', displayName: 'Sector-03 (Civil Lines)',
    population: 14500,
    hri: {
      total: 89, severity: 'CRITICAL',
      breakdown: { heatExposure: 22, waterStagnation: 20, vectorDensity: 18, diseaseBurden: 22, sanitationStress: 7 }
    },
    convergenceCount: 5,
    diseases: {
      dengue: { cases: 31, trend: 'outbreak', transmission: 'Aedes aegypti' },
      respiratory: { cases: 2, trend: 'stable' },
      gastro: { cases: 0, trend: 'none' },
    },
    communityReports: { total: 4, garbage: 1, stagnantWater: 1, openDrains: 2, last7Days: 3 },
    ashaData: { totalHouseholds: 20, visited: 17, flagged: 1, symptomsReported: 2 },
  },
  'Sector-04': {
    id: 'Sector-04', name: 'Sector-04', displayName: 'Sector-04 (Hotgi Road)',
    population: 18500,
    hri: {
      total: 67, severity: 'HIGH',
      breakdown: { heatExposure: 18, waterStagnation: 16, vectorDensity: 12, diseaseBurden: 16, sanitationStress: 5 }
    },
    convergenceCount: 4,
    diseases: {
      dengue: { cases: 12, trend: 'rising', transmission: 'Aedes aegypti' },
      respiratory: { cases: 5, trend: 'stable' },
      gastro: { cases: 3, trend: 'declining' },
    },
    communityReports: { total: 15, garbage: 6, stagnantWater: 5, openDrains: 4, last7Days: 12 },
    ashaData: { totalHouseholds: 20, visited: 14, flagged: 4, symptomsReported: 8 },
  },
  'Sector-05': {
    id: 'Sector-05', name: 'Sector-05', displayName: 'Sector-05 (Jule Solapur)',
    population: 19200,
    hri: {
      total: 68, severity: 'HIGH',
      breakdown: { heatExposure: 16, waterStagnation: 14, vectorDensity: 12, diseaseBurden: 16, sanitationStress: 10 }
    },
    convergenceCount: 4,
    diseases: {
      diarrhoea: { cases: 8, trend: 'rising', transmission: 'Contaminated water' },
      dengue: { cases: 3, trend: 'stable', transmission: 'Aedes aegypti' },
      respiratory: { cases: 2, trend: 'stable' },
    },
    communityReports: { total: 8, garbage: 3, stagnantWater: 3, openDrains: 2, last7Days: 6 },
    ashaData: { totalHouseholds: 20, visited: 13, flagged: 2, symptomsReported: 4 },
  },
  'Sector-06': {
    id: 'Sector-06', name: 'Sector-06', displayName: 'Sector-06 (MIDC Area)',
    population: 12000,
    hri: {
      total: 34, severity: 'LOW',
      breakdown: { heatExposure: 10, waterStagnation: 8, vectorDensity: 6, diseaseBurden: 6, sanitationStress: 4 }
    },
    convergenceCount: 2,
    diseases: {
      dengue: { cases: 5, trend: 'stable', transmission: 'Aedes aegypti' },
      respiratory: { cases: 6, trend: 'stable' },
      gastro: { cases: 2, trend: 'stable' },
    },
    communityReports: { total: 12, garbage: 5, stagnantWater: 4, openDrains: 3, last7Days: 10 },
    ashaData: { totalHouseholds: 20, visited: 11, flagged: 4, symptomsReported: 7 },
  },
  'Sector-07': {
    id: 'Sector-07', name: 'Sector-07', displayName: 'Sector-07 (Navy Peth)',
    population: 17500,
    hri: {
      total: 72, severity: 'HIGH',
      breakdown: { heatExposure: 18, waterStagnation: 14, vectorDensity: 12, diseaseBurden: 16, sanitationStress: 12 }
    },
    convergenceCount: 4,
    diseases: {
      respiratory: { cases: 19, trend: 'rising', transmission: 'Airborne' },
      dengue: { cases: 4, trend: 'rising', transmission: 'Aedes aegypti' },
      gastro: { cases: 1, trend: 'stable' },
    },
    communityReports: { total: 9, garbage: 3, stagnantWater: 4, openDrains: 2, last7Days: 7 },
    ashaData: { totalHouseholds: 20, visited: 12, flagged: 3, symptomsReported: 5 },
  },
  'Sector-08': {
    id: 'Sector-08', name: 'Sector-08', displayName: 'Sector-08 (North Solapur)',
    population: 23000,
    hri: {
      total: 86, severity: 'CRITICAL',
      breakdown: { heatExposure: 22, waterStagnation: 18, vectorDensity: 18, diseaseBurden: 20, sanitationStress: 8 }
    },
    convergenceCount: 5,
    diseases: {
      dengue: { cases: 27, trend: 'outbreak', transmission: 'Aedes aegypti' },
      respiratory: { cases: 2, trend: 'stable' },
      gastro: { cases: 0, trend: 'none' },
    },
    communityReports: { total: 5, garbage: 2, stagnantWater: 1, openDrains: 2, last7Days: 4 },
    ashaData: { totalHouseholds: 20, visited: 16, flagged: 1, symptomsReported: 2 },
  },
  'Sector-09': {
    id: 'Sector-09', name: 'Sector-09', displayName: 'Sector-09 (Railway Lines)',
    population: 15800,
    hri: {
      total: 69, severity: 'HIGH',
      breakdown: { heatExposure: 18, waterStagnation: 12, vectorDensity: 12, diseaseBurden: 18, sanitationStress: 9 }
    },
    convergenceCount: 3,
    diseases: {
      typhoid: { cases: 11, trend: 'rising', transmission: 'Contaminated water / food' },
      dengue: { cases: 2, trend: 'stable', transmission: 'Aedes aegypti' },
      respiratory: { cases: 2, trend: 'stable' },
    },
    communityReports: { total: 7, garbage: 2, stagnantWater: 3, openDrains: 2, last7Days: 5 },
    ashaData: { totalHouseholds: 20, visited: 14, flagged: 2, symptomsReported: 4 },
  },
  'Sector-10': {
    id: 'Sector-10', name: 'Sector-10', displayName: 'Sector-10 (Sadar Bazar)',
    population: 20500,
    hri: {
      total: 74, severity: 'HIGH',
      breakdown: { heatExposure: 18, waterStagnation: 16, vectorDensity: 14, diseaseBurden: 18, sanitationStress: 8 }
    },
    convergenceCount: 4,
    diseases: {
      dengue: { cases: 22, trend: 'rising', transmission: 'Aedes aegypti' },
      respiratory: { cases: 4, trend: 'rising' },
      gastro: { cases: 3, trend: 'stable' },
    },
    communityReports: { total: 14, garbage: 6, stagnantWater: 4, openDrains: 4, last7Days: 11 },
    ashaData: { totalHouseholds: 20, visited: 11, flagged: 4, symptomsReported: 9 },
  },
  'Sector-11': {
    id: 'Sector-11', name: 'Sector-11', displayName: 'Sector-11 (South Solapur)',
    population: 24000,
    hri: {
      total: 38, severity: 'LOW',
      breakdown: { heatExposure: 8, waterStagnation: 8, vectorDensity: 8, diseaseBurden: 10, sanitationStress: 4 }
    },
    convergenceCount: 1,
    diseases: {
      malaria: { cases: 2, trend: 'stable', transmission: 'Anopheles mosquito' },
      respiratory: { cases: 1, trend: 'stable' },
      gastro: { cases: 0, trend: 'none' },
    },
    communityReports: { total: 5, garbage: 2, stagnantWater: 1, openDrains: 2, last7Days: 4 },
    ashaData: { totalHouseholds: 20, visited: 16, flagged: 1, symptomsReported: 2 },
  },
  'Sector-12': {
    id: 'Sector-12', name: 'Sector-12', displayName: 'Sector-12 (Market Yard / Siddheshwar)',
    population: 22000,
    hri: {
      total: 73, severity: 'HIGH',
      breakdown: { heatExposure: 18, waterStagnation: 16, vectorDensity: 14, diseaseBurden: 16, sanitationStress: 9 }
    },
    convergenceCount: 4,
    diseases: {
      dengue: { cases: 18, trend: 'rising', transmission: 'Aedes aegypti' },
      respiratory: { cases: 1, trend: 'stable' },
      gastro: { cases: 0, trend: 'none' },
    },
    communityReports: { total: 8, garbage: 3, stagnantWater: 3, openDrains: 2, last7Days: 6 },
    ashaData: { totalHouseholds: 20, visited: 8, flagged: 3, symptomsReported: 5 },
  },
  'Sector-13': {
    id: 'Sector-13', name: 'Sector-13', displayName: 'Sector-13',
    population: 11000,
    hri: {
      total: 67, severity: 'HIGH',
      breakdown: { heatExposure: 16, waterStagnation: 14, vectorDensity: 12, diseaseBurden: 16, sanitationStress: 9 }
    },
    convergenceCount: 3,
    diseases: {
      cholera: { cases: 6, trend: 'rising', transmission: 'Contaminated water' },
      dengue: { cases: 1, trend: 'stable', transmission: 'Aedes aegypti' },
      respiratory: { cases: 1, trend: 'stable' },
    },
    communityReports: { total: 5, garbage: 2, stagnantWater: 2, openDrains: 1, last7Days: 4 },
    ashaData: { totalHouseholds: 20, visited: 15, flagged: 1, symptomsReported: 2 },
  },
  'Sector-14': {
    id: 'Sector-14', name: 'Sector-14', displayName: 'Sector-14',
    population: 13500,
    hri: {
      total: 45, severity: 'MODERATE',
      breakdown: { heatExposure: 12, waterStagnation: 10, vectorDensity: 8, diseaseBurden: 10, sanitationStress: 5 }
    },
    convergenceCount: 2,
    diseases: {
      respiratory: { cases: 4, trend: 'stable', transmission: 'Airborne' },
      dengue: { cases: 3, trend: 'stable', transmission: 'Aedes aegypti' },
      gastro: { cases: 1, trend: 'stable' },
    },
    communityReports: { total: 7, garbage: 3, stagnantWater: 2, openDrains: 2, last7Days: 6 },
    ashaData: { totalHouseholds: 20, visited: 13, flagged: 2, symptomsReported: 3 },
  },
  'Sector-15': {
    id: 'Sector-15', name: 'Sector-15', displayName: 'Sector-15',
    population: 9800,
    hri: {
      total: 28, severity: 'LOW',
      breakdown: { heatExposure: 8, waterStagnation: 6, vectorDensity: 6, diseaseBurden: 4, sanitationStress: 4 }
    },
    convergenceCount: 1,
    diseases: {
      diarrhoea: { cases: 1, trend: 'stable', transmission: 'Contaminated water' },
      respiratory: { cases: 1, trend: 'stable' },
      gastro: { cases: 0, trend: 'none' },
    },
    communityReports: { total: 4, garbage: 1, stagnantWater: 2, openDrains: 1, last7Days: 3 },
    ashaData: { totalHouseholds: 20, visited: 17, flagged: 1, symptomsReported: 1 },
  },
  'Sector-16': {
    id: 'Sector-16', name: 'Sector-16', displayName: 'Sector-16',
    population: 10200,
    hri: {
      total: 52, severity: 'MODERATE',
      breakdown: { heatExposure: 14, waterStagnation: 12, vectorDensity: 10, diseaseBurden: 10, sanitationStress: 6 }
    },
    convergenceCount: 2,
    diseases: {
      dengue: { cases: 9, trend: 'stable', transmission: 'Aedes aegypti' },
      respiratory: { cases: 2, trend: 'stable' },
      gastro: { cases: 0, trend: 'none' },
    },
    communityReports: { total: 6, garbage: 2, stagnantWater: 2, openDrains: 2, last7Days: 5 },
    ashaData: { totalHouseholds: 20, visited: 14, flagged: 2, symptomsReported: 3 },
  },
};

// ── HOSPITAL DATA ──────────────────────────────────────────────────────────────
// Matches the HOSPITALS array in HospitalApp.js — one source of truth.

export const hospitalData = {
  'solapur-civil': {
    id: 1,
    name: 'Solapur Civil Hospital', type: 'Government', ward: 'Sector-04',
    totalBeds: 500, occupied: 480,
    icu: { total: 30, available: 3 },
    general: { total: 350, available: 23 },
    pediatric: { total: 80, available: 14 },
    maternity: { total: 40, available: 10 },
    medicine: ['Ceftriaxone'], bloodAlerts: ['O-'],
    coordinates: { lat: 17.6599, lng: 75.9064 },
  },
  'siddheshwar': {
    id: 2,
    name: 'Siddheshwar Hospital', type: 'Private', ward: 'Sector-07',
    totalBeds: 200, occupied: 174,
    icu: { total: 15, available: 5 },
    general: { total: 140, available: 20 },
    pediatric: { total: 25, available: 4 },
    maternity: { total: 20, available: 7 },
    medicine: [], bloodAlerts: [],
    coordinates: { lat: 17.668, lng: 75.912 },
  },
  'yashwant': {
    id: 3,
    name: 'Yashwant Hospital', type: 'Government', ward: 'Sector-12',
    totalBeds: 150, occupied: 142,
    icu: { total: 10, available: 1 },
    general: { total: 110, available: 5 },
    pediatric: { total: 20, available: 2 },
    maternity: { total: 10, available: 2 },
    medicine: ['Paracetamol IV'], bloodAlerts: ['AB+'],
    coordinates: { lat: 17.675, lng: 75.904 },
  },
  'ashwini': {
    id: 4,
    name: 'Ashwini Hospital', type: 'Private', ward: 'Sector-09',
    totalBeds: 120, occupied: 95,
    icu: { total: 8, available: 4 },
    general: { total: 90, available: 21 },
    pediatric: { total: 12, available: 4 },
    maternity: { total: 10, available: 0 },
    medicine: [], bloodAlerts: [],
    coordinates: { lat: 17.652, lng: 75.918 },
  },
  'borban': {
    id: 5,
    name: 'Borban Hospital', type: 'Government', ward: 'Sector-02',
    totalBeds: 100, occupied: 88,
    icu: { total: 6, available: 2 },
    general: { total: 75, available: 11 },
    pediatric: { total: 12, available: 1 },
    maternity: { total: 7, available: 0 },
    medicine: ['ORS Sachets'], bloodAlerts: [],
    coordinates: { lat: 17.648, lng: 75.895 },
  },
  'sai-aarogya': {
    id: 6,
    name: 'Sai Aarogya Hospital', type: 'Private', ward: 'Sector-15',
    totalBeds: 80, occupied: 56,
    icu: { total: 5, available: 3 },
    general: { total: 60, available: 22 },
    pediatric: { total: 10, available: 2 },
    maternity: { total: 5, available: 2 },
    medicine: [], bloodAlerts: [],
    coordinates: { lat: 17.643, lng: 75.908 },
  },
  'sanman': {
    id: 7,
    name: 'Sanman Hospital', type: 'Private', ward: 'Sector-11',
    totalBeds: 60, occupied: 45,
    icu: { total: 4, available: 2 },
    general: { total: 46, available: 14 },
    pediatric: { total: 6, available: 1 },
    maternity: { total: 4, available: 0 },
    medicine: [], bloodAlerts: [],
    coordinates: { lat: 17.660, lng: 75.899 },
  },
  'kamla-nehru': {
    id: 8,
    name: 'Kamla Nehru Hospital', type: 'Government', ward: 'Sector-01',
    totalBeds: 200, occupied: 165,
    icu: { total: 12, available: 3 },
    general: { total: 155, available: 30 },
    pediatric: { total: 20, available: 5 },
    maternity: { total: 13, available: 2 },
    medicine: [], bloodAlerts: ['B-'],
    coordinates: { lat: 17.672, lng: 75.921 },
  },
};

// ── BLOOD BANK (City-wide) ─────────────────────────────────────────────────────
export const bloodBankData = [
  { type: 'A+',  units: 120, status: 'adequate' },
  { type: 'A-',  units: 18,  status: 'low' },
  { type: 'B+',  units: 95,  status: 'adequate' },
  { type: 'B-',  units: 8,   status: 'critical' },
  { type: 'AB+', units: 45,  status: 'adequate' },
  { type: 'AB-', units: 6,   status: 'critical' },
  { type: 'O+',  units: 210, status: 'adequate' },
  { type: 'O-',  units: 22,  status: 'low' },
];

// ── MEDICINE STOCK (City-wide) ─────────────────────────────────────────────────
export const medicineStockData = [
  { name: 'ORS Sachets',     cityStock: 2400, threshold: 2000, daysLeft: 3,  status: 'CRITICAL' },
  { name: 'Ceftriaxone 1g',  cityStock: 180,  threshold: 200,  daysLeft: 5,  status: 'LOW' },
  { name: 'Paracetamol IV',  cityStock: 320,  threshold: 300,  daysLeft: 7,  status: 'LOW' },
  { name: 'Chloroquine',     cityStock: 850,  threshold: 500,  daysLeft: 18, status: 'ADEQUATE' },
  { name: 'Doxycycline',     cityStock: 1200, threshold: 400,  daysLeft: 22, status: 'ADEQUATE' },
  { name: 'Cotrimoxazole',   cityStock: 680,  threshold: 350,  daysLeft: 14, status: 'ADEQUATE' },
];

// ── CITY-WIDE STATIC EXTRAS ────────────────────────────────────────────────────
export const cityExtras = {
  ventilators: { total: 62, inUse: 38 },
  ambulances:  { total: 18, active: 12 },
};

// ── COMPUTED CITY METRICS ──────────────────────────────────────────────────────
// Landing page, copilot, and any city-wide view uses this.
// Numbers are derived directly from wardData + hospitalData.

export const getCityMetrics = () => {
  const wards     = Object.values(wardData);
  const hospitals = Object.values(hospitalData);

  const totalBeds     = hospitals.reduce((sum, h) => sum + h.totalBeds, 0);
  const occupiedBeds  = hospitals.reduce((sum, h) => sum + h.occupied, 0);
  const icuAvailable  = hospitals.reduce((sum, h) => sum + h.icu.available, 0);

  const highRiskWards = wards.filter(w => w.hri.severity === 'HIGH');
  const avgHRI = parseFloat(
    (wards.reduce((sum, w) => sum + w.hri.total, 0) / wards.length).toFixed(1)
  );

  const totalDiseaseSignals = wards.reduce(
    (sum, w) => sum + Object.values(w.diseases).filter(d => d.cases > 0).length, 0
  );
  const totalCommunityReports = wards.reduce((sum, w) => sum + w.communityReports.last7Days, 0);

  return {
    wardsMonitored:      wards.length,
    highRiskCount:       highRiskWards.length,
    highRiskNames:       highRiskWards.map(w => w.name),
    avgHRI,
    totalBeds,
    occupiedBeds,
    occupancyPercent:    Math.round((occupiedBeds / totalBeds) * 100),
    icuAvailable,
    totalDiseaseSignals,
    totalCommunityReports,
    ventilators:         cityExtras.ventilators,
    ambulances:          cityExtras.ambulances,
  };
};

// ── TICKER EVENTS ──────────────────────────────────────────────────────────────
// For landing page live pulse strip.

export const generateTickerEvents = () => {
  const events = [];
  Object.values(wardData).forEach(ward => {
    const hb = ward.hri.breakdown;
    if (hb.heatExposure >= 2.0)
      events.push({ icon: '🌡️', text: `${ward.name} LST: ${(43 + (hb.heatExposure - 8) * (2 / 14)).toFixed(1)}°C` });
    if (hb.waterStagnation >= 2.0)
      events.push({ icon: '💧', text: `Stagnation alert — ${ward.name}` });
    if (ward.communityReports.last7Days > 8)
      events.push({ icon: '🗑️', text: `${ward.communityReports.last7Days} reports in ${ward.name} (7d)` });
    if (ward.hri.severity === 'HIGH')
      events.push({ icon: '📊', text: `${ward.name} escalated — HRI ${ward.hri.total}/100` });
    if (ward.diseases.dengue.trend === 'rising')
      events.push({ icon: '🦟', text: `Dengue rising in ${ward.name}: ${ward.diseases.dengue.cases} cases` });
  });
  return events;
};

// ── COPILOT CONTEXT BUILDER ────────────────────────────────────────────────────
// Dynamically builds the context portion of the LLM system prompt.
// selectedWardId can be null; activeLayer is optional.

export const buildCopilotContext = (currentPage, selectedWardId = null, activeLayer = null) => {
  const city = getCityMetrics();
  const ward = selectedWardId ? wardData[selectedWardId] : null;
  const vuln = selectedWardId ? wardVulnerabilityData[selectedWardId] : null;

  let ctx = `CITY LIVE DATA: ${city.wardsMonitored} wards monitored | ${city.highRiskCount} HIGH risk (${city.highRiskNames.join(', ')}) | Avg HRI ${city.avgHRI}/100 | Hospital ${city.occupancyPercent}% occupied (${city.occupiedBeds}/${city.totalBeds} beds) | ${city.icuAvailable} ICU beds available | ${city.totalDiseaseSignals} disease signals active | ${city.totalCommunityReports} community reports (7d)\n`;
  ctx += `VENTILATORS: ${city.ventilators.inUse}/${city.ventilators.total} in use | AMBULANCES: ${city.ambulances.active}/${city.ambulances.total} active\n`;
  ctx += `PAGE: ${currentPage}\n`;

  if (activeLayer) ctx += `MAP LAYER: ${activeLayer}\n`;

  // Always include per-ward summary so AI can answer questions about any ward
  ctx += `ALL WARDS (HRI/100 | severity | top disease | vaccination% | comorbidity burden% | elderly%):\n`;
  Object.values(wardData).forEach(w => {
    const topDisease = Object.entries(w.diseases).sort((a, b) => b[1].cases - a[1].cases)[0];
    const vuln2 = wardVulnerabilityData[w.id];
    ctx += `  ${w.id}: HRI ${w.hri.total}/100 (${w.hri.severity}) | convergence ${w.convergenceCount}/5 | top disease: ${topDisease[0]} ${topDisease[1].cases} cases (${topDisease[1].trend})`;
    if (vuln2) ctx += ` | vaccination ${vuln2.vaccination_coverage}% | comorbidity ${vuln2.comorbidity_burden}% | elderly ${vuln2.elderly_percent}% | vulnerability ${vuln2.vulnerability_multiplier}x`;
    ctx += `\n`;
  });

  if (ward) {
    // Ward-specific context — full profile for the selected ward
    ctx += `SELECTED WARD: ${ward.displayName} | HRI ${ward.hri.total}/100 (${ward.hri.severity}) | Convergence ${ward.convergenceCount}/5 signals\n`;
    ctx += `SIGNALS: Heat=${ward.hri.breakdown.heatExposure}, Water=${ward.hri.breakdown.waterStagnation}, Vector=${ward.hri.breakdown.vectorDensity}, Disease=${ward.hri.breakdown.diseaseBurden}, Sanitation=${ward.hri.breakdown.sanitationStress}\n`;
    ctx += `DISEASES: ${Object.entries(ward.diseases).map(([d, v]) => `${d}: ${v.cases} cases (${v.trend})`).join(', ')}\n`;
    ctx += `COMMUNITY (7d): ${ward.communityReports.last7Days} reports | ASHA: ${ward.ashaData.visited}/${ward.ashaData.totalHouseholds} visited, ${ward.ashaData.flagged} flagged, ${ward.ashaData.symptomsReported} with symptoms\n`;
    if (vuln) {
      ctx += `POPULATION VULNERABILITY: Vaccination coverage ${vuln.vaccination_coverage}% | Child immunization coverage ${vuln.vaccination_coverage}% | Elderly population ${vuln.elderly_percent}% | Comorbidity burden ${vuln.comorbidity_burden}% | Vulnerability multiplier ${vuln.vulnerability_multiplier}x\n`;
    }
  }

  return ctx;
};

// ── PREDICTIONS ────────────────────────────────────────────────────────────────
// Deterministic forecast per ward per disease.
// algorithm: currentCases × seasonalMultiplier × trendMultiplier × convergenceFactor

export const getPredictions = (wardId, days = 7) => {
  const ward = wardData[wardId];
  if (!ward) return [];

  const month = new Date().getMonth(); // 0-11
  // Seasonal drivers: Dengue peaks Jul-Oct (monsoon), Gastro Apr-Jun (summer), Respiratory Nov-Feb (winter)
  const seasonalMultiplier =
    month >= 6 && month <= 9 ? 2.5 :   // monsoon → dengue
    month >= 3 && month <= 5 ? 2.0 :   // summer  → gastro
    month >= 10 || month <= 1 ? 1.8 :  // winter  → respiratory
    1.2;                                // spring

  const trendMultiplier  = { rising: 1.5, stable: 1.0, declining: 0.6, none: 0.5 };
  const convergenceFactor =
    ward.convergenceCount >= 4 ? 2.0 :
    ward.convergenceCount >= 3 ? 1.5 :
    ward.convergenceCount >= 2 ? 1.2 : 1.0;

  const dayFactor = days === 14 ? 1.4 : 1.0;

  return Object.entries(ward.diseases).map(([disease, data]) => {
    const tm = trendMultiplier[data.trend] ?? 1.0;
    const predicted7d  = Math.round(data.cases * seasonalMultiplier * tm * convergenceFactor);
    const predicted14d = Math.round(predicted7d * dayFactor);
    const riskLevel =
      ward.convergenceCount >= 4 ? 'CRITICAL' :
      ward.convergenceCount >= 3 ? 'HIGH' : 'MODERATE';

    return {
      disease,
      currentCases: data.cases,
      predicted7d,
      predicted14d,
      riskLevel,
      trend: data.trend,
      drivers: Object.entries(ward.hri.breakdown)
        .filter(([, v]) => v >= 1.5)
        .map(([k]) => k),
    };
  });
};

// ── WARD VULNERABILITY DATA ────────────────────────────────────────────────────
// Population vulnerability metrics per sector.
// Used by the Digital Twin HRI drill-down panel (Population Vulnerability Multiplier section).
// vulnerability_multiplier: amplification above raw HRI from population-level risk factors.

export const wardVulnerabilityData = {
  'Sector-01': { vulnerability_multiplier: 1.22, vaccination_coverage: 62, elderly_percent: 12.5, comorbidity_burden: 29 },
  'Sector-02': { vulnerability_multiplier: 1.08, vaccination_coverage: 71, elderly_percent: 9.2,  comorbidity_burden: 21 },
  'Sector-03': { vulnerability_multiplier: 1.35, vaccination_coverage: 54, elderly_percent: 14.1, comorbidity_burden: 33 },
  'Sector-04': { vulnerability_multiplier: 1.18, vaccination_coverage: 66, elderly_percent: 10.8, comorbidity_burden: 25 },
  'Sector-05': { vulnerability_multiplier: 1.21, vaccination_coverage: 60, elderly_percent: 11.3, comorbidity_burden: 27 },
  'Sector-06': { vulnerability_multiplier: 1.04, vaccination_coverage: 78, elderly_percent: 7.4,  comorbidity_burden: 18 },
  'Sector-07': { vulnerability_multiplier: 1.24, vaccination_coverage: 64, elderly_percent: 13.2, comorbidity_burden: 30 },
  'Sector-08': { vulnerability_multiplier: 1.38, vaccination_coverage: 55, elderly_percent: 15.0, comorbidity_burden: 34 },
  'Sector-09': { vulnerability_multiplier: 1.16, vaccination_coverage: 67, elderly_percent: 10.5, comorbidity_burden: 26 },
  'Sector-10': { vulnerability_multiplier: 1.20, vaccination_coverage: 61, elderly_percent: 12.0, comorbidity_burden: 28 },
  'Sector-11': { vulnerability_multiplier: 1.05, vaccination_coverage: 79, elderly_percent: 8.1,  comorbidity_burden: 19 },
  'Sector-12': { vulnerability_multiplier: 1.19, vaccination_coverage: 63, elderly_percent: 11.5, comorbidity_burden: 27 },
  'Sector-13': { vulnerability_multiplier: 1.28, vaccination_coverage: 57, elderly_percent: 13.8, comorbidity_burden: 32 },
  'Sector-14': { vulnerability_multiplier: 1.10, vaccination_coverage: 72, elderly_percent: 9.0,  comorbidity_burden: 22 },
  'Sector-15': { vulnerability_multiplier: 1.02, vaccination_coverage: 82, elderly_percent: 6.8,  comorbidity_burden: 16 },
  'Sector-16': { vulnerability_multiplier: 1.12, vaccination_coverage: 69, elderly_percent: 9.8,  comorbidity_burden: 23 },
};
