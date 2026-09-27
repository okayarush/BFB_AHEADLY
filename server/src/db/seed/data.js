// server/src/db/seed/data.js
// Geographically accurate seed data for Solapur Municipal Corporation
// Season: April (pre-summer) — hot, dry, pre-monsoon
// Centroids computed from actual GeoJSON ward boundary coordinates
// Disease profile: Gastroenteritis dominant, Dengue early-season rising,
//                 Typhoid elevated (summer water stress), Respiratory declining

'use strict';

// ─── WARDS ────────────────────────────────────────────────────────────────────
// Real centroids computed from GeoJSON polygon coordinates
// Geographic context applied:
//   HIGH risk:   Sector-10 (large, old drainage, near Sina), Sector-12 (large,
//                peri-urban sprawl, poor infra), Sector-15 (low-lying, stagnation)
//   MODERATE:    Sector-11, 13, 14, 09, 16
//   LOW:         Sector-01,02,03,04,05,06,07,08 (denser urban, better coverage)

const WARDS = [
  {
    id: 'Sector-01',
    name: 'Sector-01',
    display_name: 'Sector-01 (Hutatma Chowk North)',
    population: 38200,
    area_sqkm: 3.06,
    centroid_lat: 17.6755,
    centroid_lng: 75.8881,
    zone: 'Central',
    // Dense residential, relatively better municipal services
    vaccination_coverage: 79,
    elderly_percent: 7.2,
    comorbidity_burden: 16
  },
  {
    id: 'Sector-02',
    name: 'Sector-02',
    display_name: 'Sector-02 (Mangalwar Peth)',
    population: 44800,
    area_sqkm: 2.99,
    centroid_lat: 17.6825,
    centroid_lng: 75.9018,
    zone: 'Central',
    // Old city core — dense, old drainage, moderate sanitation stress
    vaccination_coverage: 71,
    elderly_percent: 9.4,
    comorbidity_burden: 21
  },
  {
    id: 'Sector-03',
    name: 'Sector-03',
    display_name: 'Sector-03 (Budhwar Peth)',
    population: 41500,
    area_sqkm: 3.79,
    centroid_lat: 17.6909,
    centroid_lng: 75.9153,
    zone: 'Central-North',
    // Mixed residential-commercial, moderate infrastructure
    vaccination_coverage: 74,
    elderly_percent: 8.1,
    comorbidity_burden: 18
  },
  {
    id: 'Sector-04',
    name: 'Sector-04',
    display_name: 'Sector-04 (Akkalkot Road)',
    population: 31200,
    area_sqkm: 1.95,
    centroid_lat: 17.6736,
    centroid_lng: 75.9144,
    zone: 'Central',
    // Compact urban ward, reasonable coverage
    vaccination_coverage: 76,
    elderly_percent: 7.8,
    comorbidity_burden: 17
  },
  {
    id: 'Sector-05',
    name: 'Sector-05',
    display_name: 'Sector-05 (Vijapur Road)',
    population: 29800,
    area_sqkm: 1.69,
    centroid_lat: 17.6734,
    centroid_lng: 75.9271,
    zone: 'East-Central',
    // Small compact sector, newer development patches
    vaccination_coverage: 78,
    elderly_percent: 7.1,
    comorbidity_burden: 15
  },
  {
    id: 'Sector-06',
    name: 'Sector-06',
    display_name: 'Sector-06 (Ashok Chowk)',
    population: 36400,
    area_sqkm: 4.15,
    centroid_lat: 17.6590,
    centroid_lng: 75.9237,
    zone: 'South-Central',
    // Mixed zone, some older drainage issues
    vaccination_coverage: 72,
    elderly_percent: 8.6,
    comorbidity_burden: 19
  },
  {
    id: 'Sector-07',
    name: 'Sector-07',
    display_name: 'Sector-07 (Railway Lines)',
    population: 28600,
    area_sqkm: 2.27,
    centroid_lat: 17.6666,
    centroid_lng: 75.9122,
    zone: 'Central',
    // Near railway station — transient population, mixed sanitation
    vaccination_coverage: 68,
    elderly_percent: 9.1,
    comorbidity_burden: 20
  },
  {
    id: 'Sector-08',
    name: 'Sector-08',
    display_name: 'Sector-08 (Siddheshwar Peth)',
    population: 33100,
    area_sqkm: 2.14,
    centroid_lat: 17.6600,
    centroid_lng: 75.8993,
    zone: 'South-Central',
    // Near Siddheshwar Lake — stagnation risk in monsoon but April is dry
    vaccination_coverage: 73,
    elderly_percent: 8.3,
    comorbidity_burden: 18
  },
  {
    id: 'Sector-09',
    name: 'Sector-09',
    display_name: 'Sector-09 (Hotgi Road)',
    population: 52400,
    area_sqkm: 10.17,
    centroid_lat: 17.6499,
    centroid_lng: 75.8819,
    zone: 'South-West',
    // Industrial belt fringe — textile mill workers, poor sanitation pockets
    vaccination_coverage: 65,
    elderly_percent: 10.2,
    comorbidity_burden: 24
  },
  {
    id: 'Sector-10',
    name: 'Sector-10',
    display_name: 'Sector-10 (Barshi Road)',
    population: 78300,
    area_sqkm: 28.86,
    centroid_lat: 17.6629,
    centroid_lng: 75.8478,
    zone: 'West',
    // LARGEST ward — peri-urban, near Sina River, old drainage, HIGH RISK
    // Sina River proximity = water stagnation, poor drainage networks
    vaccination_coverage: 59,
    elderly_percent: 11.8,
    comorbidity_burden: 28
  },
  {
    id: 'Sector-11',
    name: 'Sector-11',
    display_name: 'Sector-11 (Jule Solapur West)',
    population: 61200,
    area_sqkm: 19.47,
    centroid_lat: 17.7020,
    centroid_lng: 75.8679,
    zone: 'North-West',
    // Large ward, mix of older and newer development
    vaccination_coverage: 67,
    elderly_percent: 9.7,
    comorbidity_burden: 22
  },
  {
    id: 'Sector-12',
    name: 'Sector-12',
    display_name: 'Sector-12 (Shelgi Outskirts)',
    population: 74600,
    area_sqkm: 25.87,
    centroid_lat: 17.7044,
    centroid_lng: 75.9278,
    zone: 'North-East',
    // 2ND LARGEST — peri-urban sprawl, limited piped water, informal settlements
    // HIGH RISK: low vaccination, high elderly burden, poor waste management
    vaccination_coverage: 56,
    elderly_percent: 12.4,
    comorbidity_burden: 30
  },
  {
    id: 'Sector-13',
    name: 'Sector-13',
    display_name: 'Sector-13 (North Solapur)',
    population: 58900,
    area_sqkm: 23.18,
    centroid_lat: 17.6618,
    centroid_lng: 75.9553,
    zone: 'East',
    // Large east ward, growing area, moderate infrastructure
    vaccination_coverage: 69,
    elderly_percent: 9.0,
    comorbidity_burden: 21
  },
  {
    id: 'Sector-14',
    name: 'Sector-14',
    display_name: 'Sector-14 (South Solapur)',
    population: 53700,
    area_sqkm: 18.64,
    centroid_lat: 17.6086,
    centroid_lng: 75.9265,
    zone: 'South',
    // Southern ward, semi-arid zone, summer heat stress high
    vaccination_coverage: 66,
    elderly_percent: 10.5,
    comorbidity_burden: 23
  },
  {
    id: 'Sector-15',
    name: 'Sector-15',
    display_name: 'Sector-15 (Akkalkot Road South)',
    population: 62800,
    area_sqkm: 12.46,
    centroid_lat: 17.6319,
    centroid_lng: 75.9016,
    zone: 'South-West',
    // LOW-LYING ward — historically floods in monsoon, drainage issues persist
    // April: dry but structural drainage problems remain, HIGH RISK
    vaccination_coverage: 61,
    elderly_percent: 11.1,
    comorbidity_burden: 26
  },
  {
    id: 'Sector-16',
    name: 'Sector-16',
    display_name: 'Sector-16 (Jule Solapur East)',
    population: 47300,
    area_sqkm: 21.39,
    centroid_lat: 17.6435,
    centroid_lng: 75.8789,
    zone: 'South-West',
    // Mixed ward, some newer planned areas
    vaccination_coverage: 70,
    elderly_percent: 9.3,
    comorbidity_burden: 20
  }
];

// ─── SATELLITE DATA ───────────────────────────────────────────────────────────
// April pre-summer baseline values for Solapur
// GEOGRAPHIC LOGIC:
//   LST:   Solapur April range 33–42°C. Western/larger wards hotter (less
//          vegetation, more exposed surfaces). Compact urban wards slightly
//          cooler due to shade/building density.
//   NDVI:  Solapur is semi-arid. Range 0.08–0.38. Larger peri-urban wards
//          have more bare soil (higher) but also more vegetation gaps.
//          Old city wards have low NDVI (concrete dominant).
//   MNDWI: April is DRY season. High values only near Sina River (Sector-10),
//          low-lying Sector-15, and wards with structural drainage problems.
//   Rainfall: April pre-summer — 0–4mm only. Occasional dust storms, no rain.
//   Humidity: 35–55% (dry season Solapur)

const SATELLITE_DATA = [
  // Sector-01: Central, compact, good coverage, moderate heat
  { ward_id: 'Sector-01', lst_celsius: 36.2, ndvi: 0.24, mndwi: 0.21, humidity_percent: 44, rainfall_mm: 0.0 },

  // Sector-02: Old city core, dense concrete, high urban heat island
  { ward_id: 'Sector-02', lst_celsius: 38.1, ndvi: 0.14, mndwi: 0.28, humidity_percent: 47, rainfall_mm: 0.3 },

  // Sector-03: Mixed residential-commercial, slightly cooler
  { ward_id: 'Sector-03', lst_celsius: 37.2, ndvi: 0.19, mndwi: 0.24, humidity_percent: 45, rainfall_mm: 0.0 },

  // Sector-04: Compact urban, moderate heat
  { ward_id: 'Sector-04', lst_celsius: 36.8, ndvi: 0.21, mndwi: 0.22, humidity_percent: 44, rainfall_mm: 0.0 },

  // Sector-05: Small east-central sector, newer development
  { ward_id: 'Sector-05', lst_celsius: 36.4, ndvi: 0.23, mndwi: 0.20, humidity_percent: 43, rainfall_mm: 0.0 },

  // Sector-06: South-central, slightly larger, older drainage
  { ward_id: 'Sector-06', lst_celsius: 37.6, ndvi: 0.17, mndwi: 0.31, humidity_percent: 46, rainfall_mm: 0.4 },

  // Sector-07: Railway zone, transient pop, mixed sanitation
  { ward_id: 'Sector-07', lst_celsius: 38.4, ndvi: 0.13, mndwi: 0.29, humidity_percent: 47, rainfall_mm: 0.2 },

  // Sector-08: Siddheshwar Peth, near lake, slightly elevated MNDWI
  { ward_id: 'Sector-08', lst_celsius: 37.8, ndvi: 0.18, mndwi: 0.34, humidity_percent: 48, rainfall_mm: 0.5 },

  // Sector-09: Industrial fringe, Hotgi Road, textile area
  // Higher LST (industrial heat), lower NDVI, moderate stagnation
  { ward_id: 'Sector-09', lst_celsius: 39.3, ndvi: 0.12, mndwi: 0.42, humidity_percent: 51, rainfall_mm: 1.2 },

  // Sector-10: LARGEST — near Sina River, OLD DRAINAGE, HIGH RISK
  // Sina River proximity drives high MNDWI even in dry April
  // Exposed large surfaces = highest LST in city
  { ward_id: 'Sector-10', lst_celsius: 41.2, ndvi: 0.09, mndwi: 0.67, humidity_percent: 58, rainfall_mm: 3.1 },

  // Sector-11: Large NW ward, mix of old/new, moderate risk
  { ward_id: 'Sector-11', lst_celsius: 38.7, ndvi: 0.15, mndwi: 0.38, humidity_percent: 49, rainfall_mm: 0.8 },

  // Sector-12: Peri-urban sprawl, informal settlements, HIGH RISK
  // Limited piped water = open storage = stagnation risk
  // Large bare land area = high LST
  { ward_id: 'Sector-12', lst_celsius: 40.6, ndvi: 0.10, mndwi: 0.61, humidity_percent: 55, rainfall_mm: 2.4 },

  // Sector-13: Growing east ward, moderate infrastructure
  { ward_id: 'Sector-13', lst_celsius: 38.2, ndvi: 0.16, mndwi: 0.35, humidity_percent: 48, rainfall_mm: 0.6 },

  // Sector-14: Southern ward, semi-arid, very high summer LST
  // But April = early — not peak yet. Moderate stagnation (dry drainage)
  { ward_id: 'Sector-14', lst_celsius: 39.8, ndvi: 0.11, mndwi: 0.44, humidity_percent: 52, rainfall_mm: 1.4 },

  // Sector-15: LOW-LYING — structural drainage issues, HIGH RISK
  // Even in April dry season, low-lying areas retain residual moisture
  // High MNDWI because of drainage network problems
  { ward_id: 'Sector-15', lst_celsius: 39.1, ndvi: 0.13, mndwi: 0.58, humidity_percent: 53, rainfall_mm: 1.8 },

  // Sector-16: South-west, mix of planned and unplanned, moderate
  { ward_id: 'Sector-16', lst_celsius: 38.5, ndvi: 0.16, mndwi: 0.37, humidity_percent: 49, rainfall_mm: 0.7 }
];

// ─── HOSPITALS ────────────────────────────────────────────────────────────────
// Real Solapur hospitals with ward assignments based on geography

const HOSPITALS = [
  {
    name: 'Solapur Civil Hospital',
    type: 'GOV',
    ward_id: 'Sector-07',
    total_beds: 850,
    icu_beds: 48,
    ventilators: 18,
    lat: 17.6698,
    lng: 75.9089,
    contact: '0217-2726161',
    emergency_dept: true,
    fhir_enabled: true,
    general_available: 214,
    icu_available: 11,
    ventilators_available: 6,
    occupancy_percent: 74.8
  },
  {
    name: 'Solapur District Hospital',
    type: 'GOV',
    ward_id: 'Sector-03',
    total_beds: 320,
    icu_beds: 24,
    ventilators: 8,
    lat: 17.6872,
    lng: 75.9134,
    contact: '0217-2724000',
    emergency_dept: true,
    fhir_enabled: false,
    general_available: 89,
    icu_available: 7,
    ventilators_available: 3,
    occupancy_percent: 71.2
  },
  {
    name: 'Kamala Nehru Hospital',
    type: 'GOV',
    ward_id: 'Sector-02',
    total_beds: 180,
    icu_beds: 12,
    ventilators: 4,
    lat: 17.6801,
    lng: 75.8994,
    contact: '0217-2723456',
    emergency_dept: true,
    fhir_enabled: false,
    general_available: 52,
    icu_available: 4,
    ventilators_available: 1,
    occupancy_percent: 68.9
  },
  {
    name: 'Aashirwad Hospital',
    type: 'PVT',
    ward_id: 'Sector-06',
    total_beds: 120,
    icu_beds: 16,
    ventilators: 6,
    lat: 17.6612,
    lng: 75.9201,
    contact: '0217-2347890',
    emergency_dept: true,
    fhir_enabled: true,
    general_available: 28,
    icu_available: 3,
    ventilators_available: 2,
    occupancy_percent: 81.7
  },
  {
    name: 'Yashwant Hospital',
    type: 'PVT',
    ward_id: 'Sector-04',
    total_beds: 90,
    icu_beds: 10,
    ventilators: 4,
    lat: 17.6743,
    lng: 75.9156,
    contact: '0217-2356789',
    emergency_dept: false,
    fhir_enabled: false,
    general_available: 31,
    icu_available: 4,
    ventilators_available: 2,
    occupancy_percent: 63.3
  },
  {
    name: 'Barshi Road PHC',
    type: 'PHC',
    ward_id: 'Sector-10',
    total_beds: 30,
    icu_beds: 2,
    ventilators: 1,
    lat: 17.6589,
    lng: 75.8523,
    contact: '0217-2289000',
    emergency_dept: false,
    fhir_enabled: false,
    general_available: 8,
    icu_available: 1,
    ventilators_available: 0,
    occupancy_percent: 66.7
  },
  {
    name: 'Jule Solapur Urban PHC',
    type: 'PHC',
    ward_id: 'Sector-11',
    total_beds: 30,
    icu_beds: 2,
    ventilators: 1,
    lat: 17.6978,
    lng: 75.8712,
    contact: '0217-2290000',
    emergency_dept: false,
    fhir_enabled: false,
    general_available: 11,
    icu_available: 1,
    ventilators_available: 1,
    occupancy_percent: 56.7
  },
  {
    name: 'Akkalkot Road PHC',
    type: 'PHC',
    ward_id: 'Sector-15',
    total_beds: 25,
    icu_beds: 2,
    ventilators: 0,
    lat: 17.6356,
    lng: 75.9034,
    contact: '0217-2291000',
    emergency_dept: false,
    fhir_enabled: false,
    general_available: 7,
    icu_available: 0,
    ventilators_available: 0,
    occupancy_percent: 72.0
  }
];

// ─── DISEASE REPORTS ──────────────────────────────────────────────────────────
// April pre-summer disease profile:
//   - Gastroenteritis (A09): DOMINANT — summer water contamination rising
//   - Typhoid (A01):         ELEVATED — water source stress in hot season
//   - Dengue (A90):          EARLY SEASON — pre-monsoon Aedes activity, low-moderate
//   - Respiratory (J06):     DECLINING from winter, low-moderate
//   - Malaria (B50):         VERY LOW in April (monsoon disease, too early)
// HIGH risk wards (10, 12, 15) get more cases, rising trends
// LOW risk wards (01, 03, 04, 05) get fewer cases, stable/declining

const DISEASE_REPORTS = [
  // ── SECTOR-10 (HIGH RISK — Sina River, worst drainage) ──
  { ward_id: 'Sector-10', disease_code: 'A09', disease_name: 'Acute Gastroenteritis', case_count: 31, severity: 'moderate', trend: 'rising' },
  { ward_id: 'Sector-10', disease_code: 'A01', disease_name: 'Typhoid Fever', case_count: 18, severity: 'moderate', trend: 'rising' },
  { ward_id: 'Sector-10', disease_code: 'A90', disease_name: 'Dengue Fever', case_count: 11, severity: 'moderate', trend: 'rising' },
  { ward_id: 'Sector-10', disease_code: 'J06', disease_name: 'Acute Respiratory Infection', case_count: 8, severity: 'mild', trend: 'stable' },
  { ward_id: 'Sector-10', disease_code: 'A09', disease_name: 'Acute Gastroenteritis', case_count: 24, severity: 'moderate', trend: 'rising' },

  // ── SECTOR-12 (HIGH RISK — peri-urban sprawl, informal settlements) ──
  { ward_id: 'Sector-12', disease_code: 'A09', disease_name: 'Acute Gastroenteritis', case_count: 27, severity: 'moderate', trend: 'rising' },
  { ward_id: 'Sector-12', disease_code: 'A01', disease_name: 'Typhoid Fever', case_count: 14, severity: 'moderate', trend: 'rising' },
  { ward_id: 'Sector-12', disease_code: 'A90', disease_name: 'Dengue Fever', case_count: 9, severity: 'mild', trend: 'rising' },
  { ward_id: 'Sector-12', disease_code: 'B50', disease_name: 'Malaria', case_count: 4, severity: 'mild', trend: 'stable' },
  { ward_id: 'Sector-12', disease_code: 'A09', disease_name: 'Acute Gastroenteritis', case_count: 19, severity: 'moderate', trend: 'rising' },

  // ── SECTOR-15 (HIGH RISK — low-lying, drainage problems) ──
  { ward_id: 'Sector-15', disease_code: 'A09', disease_name: 'Acute Gastroenteritis', case_count: 22, severity: 'moderate', trend: 'rising' },
  { ward_id: 'Sector-15', disease_code: 'A01', disease_name: 'Typhoid Fever', case_count: 13, severity: 'moderate', trend: 'rising' },
  { ward_id: 'Sector-15', disease_code: 'A90', disease_name: 'Dengue Fever', case_count: 7, severity: 'mild', trend: 'stable' },
  { ward_id: 'Sector-15', disease_code: 'J06', disease_name: 'Acute Respiratory Infection', case_count: 9, severity: 'mild', trend: 'declining' },

  // ── SECTOR-09 (MODERATE — industrial fringe, Hotgi Road) ──
  { ward_id: 'Sector-09', disease_code: 'A09', disease_name: 'Acute Gastroenteritis', case_count: 16, severity: 'moderate', trend: 'rising' },
  { ward_id: 'Sector-09', disease_code: 'A01', disease_name: 'Typhoid Fever', case_count: 9, severity: 'mild', trend: 'stable' },
  { ward_id: 'Sector-09', disease_code: 'J06', disease_name: 'Acute Respiratory Infection', case_count: 11, severity: 'mild', trend: 'declining' },
  { ward_id: 'Sector-09', disease_code: 'A90', disease_name: 'Dengue Fever', case_count: 5, severity: 'mild', trend: 'stable' },

  // ── SECTOR-14 (MODERATE — south, hot and dry) ──
  { ward_id: 'Sector-14', disease_code: 'A09', disease_name: 'Acute Gastroenteritis', case_count: 14, severity: 'moderate', trend: 'rising' },
  { ward_id: 'Sector-14', disease_code: 'A01', disease_name: 'Typhoid Fever', case_count: 8, severity: 'mild', trend: 'stable' },
  { ward_id: 'Sector-14', disease_code: 'J06', disease_name: 'Acute Respiratory Infection', case_count: 7, severity: 'mild', trend: 'declining' },

  // ── SECTOR-11 (MODERATE — large NW ward) ──
  { ward_id: 'Sector-11', disease_code: 'A09', disease_name: 'Acute Gastroenteritis', case_count: 12, severity: 'mild', trend: 'stable' },
  { ward_id: 'Sector-11', disease_code: 'A01', disease_name: 'Typhoid Fever', case_count: 7, severity: 'mild', trend: 'stable' },
  { ward_id: 'Sector-11', disease_code: 'A90', disease_name: 'Dengue Fever', case_count: 4, severity: 'mild', trend: 'stable' },

  // ── SECTOR-13 (MODERATE — growing east) ──
  { ward_id: 'Sector-13', disease_code: 'A09', disease_name: 'Acute Gastroenteritis', case_count: 11, severity: 'mild', trend: 'stable' },
  { ward_id: 'Sector-13', disease_code: 'J06', disease_name: 'Acute Respiratory Infection', case_count: 8, severity: 'mild', trend: 'declining' },
  { ward_id: 'Sector-13', disease_code: 'A01', disease_name: 'Typhoid Fever', case_count: 5, severity: 'mild', trend: 'stable' },

  // ── SECTOR-16 (MODERATE — south-west mix) ──
  { ward_id: 'Sector-16', disease_code: 'A09', disease_name: 'Acute Gastroenteritis', case_count: 10, severity: 'mild', trend: 'stable' },
  { ward_id: 'Sector-16', disease_code: 'J06', disease_name: 'Acute Respiratory Infection', case_count: 9, severity: 'mild', trend: 'declining' },
  { ward_id: 'Sector-16', disease_code: 'A01', disease_name: 'Typhoid Fever', case_count: 4, severity: 'mild', trend: 'stable' },

  // ── SECTOR-07 (MODERATE — railway zone) ──
  { ward_id: 'Sector-07', disease_code: 'A09', disease_name: 'Acute Gastroenteritis', case_count: 9, severity: 'mild', trend: 'stable' },
  { ward_id: 'Sector-07', disease_code: 'J06', disease_name: 'Acute Respiratory Infection', case_count: 7, severity: 'mild', trend: 'declining' },

  // ── SECTOR-08 (LOW-MODERATE — Siddheshwar Peth) ──
  { ward_id: 'Sector-08', disease_code: 'A09', disease_name: 'Acute Gastroenteritis', case_count: 7, severity: 'mild', trend: 'stable' },
  { ward_id: 'Sector-08', disease_code: 'J06', disease_name: 'Acute Respiratory Infection', case_count: 6, severity: 'mild', trend: 'declining' },

  // ── SECTOR-02 (LOW-MODERATE — old city, dense) ──
  { ward_id: 'Sector-02', disease_code: 'A09', disease_name: 'Acute Gastroenteritis', case_count: 8, severity: 'mild', trend: 'stable' },
  { ward_id: 'Sector-02', disease_code: 'J06', disease_name: 'Acute Respiratory Infection', case_count: 6, severity: 'mild', trend: 'declining' },
  { ward_id: 'Sector-02', disease_code: 'A01', disease_name: 'Typhoid Fever', case_count: 4, severity: 'mild', trend: 'stable' },

  // ── SECTOR-06 (LOW — south-central) ──
  { ward_id: 'Sector-06', disease_code: 'A09', disease_name: 'Acute Gastroenteritis', case_count: 6, severity: 'mild', trend: 'stable' },
  { ward_id: 'Sector-06', disease_code: 'J06', disease_name: 'Acute Respiratory Infection', case_count: 5, severity: 'mild', trend: 'declining' },

  // ── SECTOR-03 (LOW — mixed residential) ──
  { ward_id: 'Sector-03', disease_code: 'A09', disease_name: 'Acute Gastroenteritis', case_count: 5, severity: 'mild', trend: 'stable' },
  { ward_id: 'Sector-03', disease_code: 'J06', disease_name: 'Acute Respiratory Infection', case_count: 4, severity: 'mild', trend: 'declining' },

  // ── SECTOR-01 (LOW — central, better coverage) ──
  { ward_id: 'Sector-01', disease_code: 'J06', disease_name: 'Acute Respiratory Infection', case_count: 4, severity: 'mild', trend: 'declining' },
  { ward_id: 'Sector-01', disease_code: 'A09', disease_name: 'Acute Gastroenteritis', case_count: 3, severity: 'mild', trend: 'stable' },

  // ── SECTOR-04 (LOW — compact urban) ──
  { ward_id: 'Sector-04', disease_code: 'J06', disease_name: 'Acute Respiratory Infection', case_count: 4, severity: 'mild', trend: 'declining' },
  { ward_id: 'Sector-04', disease_code: 'A09', disease_name: 'Acute Gastroenteritis', case_count: 3, severity: 'mild', trend: 'stable' },

  // ── SECTOR-05 (LOW — small east sector) ──
  { ward_id: 'Sector-05', disease_code: 'J06', disease_name: 'Acute Respiratory Infection', case_count: 3, severity: 'mild', trend: 'declining' },
  { ward_id: 'Sector-05', disease_code: 'A09', disease_name: 'Acute Gastroenteritis', case_count: 2, severity: 'mild', trend: 'stable' }
];

// ─── COMMUNITY REPORTS ────────────────────────────────────────────────────────
// April-specific: Garbage and stagnant water reports are the dominant types
// in summer — water stored in open containers, dried drainage with residual waste
// HIGH risk wards get more reports, particularly stagnant_water and open_drain

const COMMUNITY_REPORTS = [
  // ── SECTOR-10 (most reports — Sina River area) ──
  { ward_id: 'Sector-10', report_type: 'stagnant_water', source: 'citizen', severity: 'high', lat: 17.6589, lng: 75.8512, description: 'Stagnant water near Sina River embankment, mosquito breeding observed' },
  { ward_id: 'Sector-10', report_type: 'open_drain', source: 'citizen', severity: 'high', lat: 17.6634, lng: 75.8489, description: 'Open nala overflow near Barshi Road — foul smell, waste accumulation' },
  { ward_id: 'Sector-10', report_type: 'garbage', source: 'citizen', severity: 'high', lat: 17.6601, lng: 75.8534, description: 'Uncollected garbage for 5 days near weekly market area' },
  { ward_id: 'Sector-10', report_type: 'stagnant_water', source: 'asha', severity: 'high', lat: 17.6567, lng: 75.8478, description: 'Open container water storage observed at 6 consecutive households' },
  { ward_id: 'Sector-10', report_type: 'open_drain', source: 'citizen', severity: 'medium', lat: 17.6612, lng: 75.8501, description: 'Broken drain cover, sewage visible on street surface' },
  { ward_id: 'Sector-10', report_type: 'garbage', source: 'citizen', severity: 'medium', lat: 17.6578, lng: 75.8523, description: 'Overflowing municipal bin near primary school' },
  { ward_id: 'Sector-10', report_type: 'stagnant_water', source: 'citizen', severity: 'high', lat: 17.6645, lng: 75.8467, description: 'Unused plot with water accumulation — breeding site risk' },

  // ── SECTOR-12 (peri-urban informal) ──
  { ward_id: 'Sector-12', report_type: 'garbage', source: 'citizen', severity: 'high', lat: 17.7034, lng: 75.9256, description: 'No municipal collection for 7 days in informal settlement area' },
  { ward_id: 'Sector-12', report_type: 'stagnant_water', source: 'asha', severity: 'high', lat: 17.7056, lng: 75.9289, description: 'Open water tanks without covers at multiple households — dengue risk' },
  { ward_id: 'Sector-12', report_type: 'open_drain', source: 'citizen', severity: 'high', lat: 17.7012, lng: 75.9234, description: 'Open drain without cover along main approach road' },
  { ward_id: 'Sector-12', report_type: 'garbage', source: 'citizen', severity: 'medium', lat: 17.7067, lng: 75.9312, description: 'Construction debris mixed with household waste, no clearance' },
  { ward_id: 'Sector-12', report_type: 'stagnant_water', source: 'citizen', severity: 'medium', lat: 17.7023, lng: 75.9201, description: 'Waterlogging in low-lying lane — persists from last week' },

  // ── SECTOR-15 (low-lying, drainage issues) ──
  { ward_id: 'Sector-15', report_type: 'stagnant_water', source: 'citizen', severity: 'high', lat: 17.6334, lng: 75.9023, description: 'Persistent waterlogging in low-lying colony — structural drainage issue' },
  { ward_id: 'Sector-15', report_type: 'open_drain', source: 'citizen', severity: 'high', lat: 17.6289, lng: 75.8998, description: 'Major drain blockage near Akkalkot Road junction' },
  { ward_id: 'Sector-15', report_type: 'garbage', source: 'asha', severity: 'medium', lat: 17.6312, lng: 75.9045, description: 'Garbage dump near water supply point — contamination risk' },
  { ward_id: 'Sector-15', report_type: 'stagnant_water', source: 'citizen', severity: 'medium', lat: 17.6356, lng: 75.9067, description: 'Defunct drainage channel collecting runoff water' },

  // ── SECTOR-09 (industrial fringe) ──
  { ward_id: 'Sector-09', report_type: 'garbage', source: 'citizen', severity: 'high', lat: 17.6512, lng: 75.8834, description: 'Industrial waste mixed with household garbage near mill area' },
  { ward_id: 'Sector-09', report_type: 'open_drain', source: 'citizen', severity: 'medium', lat: 17.6478, lng: 75.8801, description: 'Partially covered drain — open section near residential area' },
  { ward_id: 'Sector-09', report_type: 'stagnant_water', source: 'citizen', severity: 'medium', lat: 17.6534, lng: 75.8856, description: 'Water collected in disused factory compound — accessible to children' },

  // ── SECTOR-14 (south, summer heat stress) ──
  { ward_id: 'Sector-14', report_type: 'garbage', source: 'citizen', severity: 'high', lat: 17.6112, lng: 75.9289, description: 'Garbage burning near residential area due to collection delay' },
  { ward_id: 'Sector-14', report_type: 'stagnant_water', source: 'citizen', severity: 'medium', lat: 17.6067, lng: 75.9234, description: 'Water tanker spillage on unpaved road creating stagnation' },

  // ── SECTOR-11 ──
  { ward_id: 'Sector-11', report_type: 'garbage', source: 'citizen', severity: 'medium', lat: 17.6989, lng: 75.8645, description: 'Overflowing bin near bus stop, collection missed twice' },
  { ward_id: 'Sector-11', report_type: 'open_drain', source: 'citizen', severity: 'medium', lat: 17.7034, lng: 75.8712, description: 'Drain cover missing on main road — safety and health hazard' },

  // ── SECTOR-13 ──
  { ward_id: 'Sector-13', report_type: 'garbage', source: 'citizen', severity: 'medium', lat: 17.6634, lng: 75.9534, description: 'Unauthorised dumping ground growing near new development area' },
  { ward_id: 'Sector-13', report_type: 'stagnant_water', source: 'citizen', severity: 'low', lat: 17.6589, lng: 75.9578, description: 'Small water collection on construction site' },

  // ── SECTOR-07 (railway area) ──
  { ward_id: 'Sector-07', report_type: 'garbage', source: 'citizen', severity: 'high', lat: 17.6689, lng: 75.9134, description: 'Accumulated garbage near railway station approach road' },
  { ward_id: 'Sector-07', report_type: 'open_drain', source: 'citizen', severity: 'medium', lat: 17.6656, lng: 75.9112, description: 'Open drain near station — foul smell, public complaint' },

  // ── SECTOR-08 ──
  { ward_id: 'Sector-08', report_type: 'stagnant_water', source: 'citizen', severity: 'medium', lat: 17.6623, lng: 75.9012, description: 'Water near Siddheshwar Lake edge — mosquito breeding concern' },
  { ward_id: 'Sector-08', report_type: 'garbage', source: 'citizen', severity: 'low', lat: 17.6578, lng: 75.8978, description: 'Delayed collection near temple area' },

  // ── SECTOR-02 (old city) ──
  { ward_id: 'Sector-02', report_type: 'garbage', source: 'citizen', severity: 'medium', lat: 17.6823, lng: 75.9034, description: 'Old city lane — narrow street, collection vehicle cannot access' },
  { ward_id: 'Sector-02', report_type: 'open_drain', source: 'citizen', severity: 'medium', lat: 17.6801, lng: 75.8989, description: 'Century-old drain system partially blocked' },

  // ── SECTOR-06 ──
  { ward_id: 'Sector-06', report_type: 'garbage', source: 'citizen', severity: 'low', lat: 17.6601, lng: 75.9212, description: 'Collection delayed by one day, minor accumulation' },

  // ── SECTOR-16 ──
  { ward_id: 'Sector-16', report_type: 'garbage', source: 'citizen', severity: 'medium', lat: 17.6456, lng: 75.8812, description: 'Large household colony — bin capacity insufficient' },

  // ── SECTOR-03 ──
  { ward_id: 'Sector-03', report_type: 'garbage', source: 'citizen', severity: 'low', lat: 17.6912, lng: 75.9145, description: 'Missed collection on holiday — back to normal next day' },

  // ── LOW RISK WARDS (minimal reports) ──
  { ward_id: 'Sector-01', report_type: 'garbage', source: 'citizen', severity: 'low', lat: 17.6745, lng: 75.8867, description: 'Minor delay in collection near central area' },
  { ward_id: 'Sector-04', report_type: 'open_drain', source: 'citizen', severity: 'low', lat: 17.6723, lng: 75.9134, description: 'Small drain section needing minor repair' },
  { ward_id: 'Sector-05', report_type: 'garbage', source: 'citizen', severity: 'low', lat: 17.6723, lng: 75.9256, description: 'Reported and resolved within 24 hours' }
];

module.exports = { WARDS, SATELLITE_DATA, HOSPITALS, DISEASE_REPORTS, COMMUNITY_REPORTS };