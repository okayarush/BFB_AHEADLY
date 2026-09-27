BEGIN;

CREATE TABLE IF NOT EXISTS wards (
  id VARCHAR(20) PRIMARY KEY,
  name TEXT NOT NULL,
  population INTEGER NOT NULL,
  vaccination_coverage FLOAT DEFAULT 72,
  elderly_percent FLOAT DEFAULT 8.2,
  comorbidity_burden FLOAT DEFAULT 18,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS satellite_data (
  id BIGSERIAL PRIMARY KEY,
  ward_id VARCHAR(20) REFERENCES wards(id) ON DELETE CASCADE,
  lst_celsius FLOAT NOT NULL,
  mndwi FLOAT NOT NULL,
  ndvi FLOAT NOT NULL,
  rainfall_mm FLOAT NOT NULL DEFAULT 0,
  source TEXT DEFAULT 'seed',
  observed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hri_scores (
  id BIGSERIAL PRIMARY KEY,
  ward_id VARCHAR(20) REFERENCES wards(id) ON DELETE CASCADE,
  heat_exposure FLOAT NOT NULL,
  water_stagnation FLOAT NOT NULL,
  vector_density FLOAT NOT NULL,
  disease_burden FLOAT NOT NULL,
  sanitation_stress FLOAT NOT NULL,
  wastewater_index FLOAT NOT NULL,
  base_hri FLOAT NOT NULL,
  seasonal_multiplier FLOAT NOT NULL,
  vulnerability_multiplier FLOAT NOT NULL,
  final_hri FLOAT NOT NULL,
  severity VARCHAR(20) NOT NULL,
  convergence_count INTEGER NOT NULL,
  rainfall_mm FLOAT DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hri_history (
  id BIGSERIAL PRIMARY KEY,
  ward_id VARCHAR(20) REFERENCES wards(id) ON DELETE CASCADE,
  recorded_date DATE NOT NULL,
  final_hri FLOAT NOT NULL,
  severity VARCHAR(20) NOT NULL,
  convergence_count INTEGER NOT NULL,
  heat_exposure FLOAT,
  water_stagnation FLOAT,
  vector_density FLOAT,
  disease_burden FLOAT,
  sanitation_stress FLOAT,
  wastewater_index FLOAT,
  vulnerability_multiplier FLOAT,
  UNIQUE (ward_id, recorded_date)
);

CREATE TABLE IF NOT EXISTS interventions (
  id BIGSERIAL PRIMARY KEY,
  ward_id VARCHAR(20) REFERENCES wards(id) ON DELETE CASCADE,
  intervention_type VARCHAR(50) NOT NULL,
  label TEXT,
  implemented_at TIMESTAMPTZ DEFAULT NOW(),
  implemented_by VARCHAR(100) DEFAULT 'SMC Officer',
  hri_before FLOAT,
  signals_before JSONB,
  hri_after FLOAT,
  signals_after JSONB,
  reduction_amount FLOAT,
  reduction_percent FLOAT,
  projected_case_reduction INTEGER,
  projected_case_reduction_percent FLOAT,
  status VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS community_reports (
  id BIGSERIAL PRIMARY KEY,
  ward_id VARCHAR(20) REFERENCES wards(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL,
  source VARCHAR(30) DEFAULT 'citizen',
  severity VARCHAR(20) DEFAULT 'medium',
  lat FLOAT,
  lng FLOAT,
  description TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS field_flags (
  id BIGSERIAL PRIMARY KEY,
  ward_id VARCHAR(20) REFERENCES wards(id) ON DELETE CASCADE,
  household_id VARCHAR(50),
  asha_worker_name VARCHAR(100) DEFAULT 'ASHA Worker',
  risk_score INTEGER NOT NULL,
  risk_level VARCHAR(20) NOT NULL,
  reasons JSONB DEFAULT '[]'::jsonb,
  cluster_intelligence TEXT,
  symptoms_reported TEXT[] DEFAULT ARRAY[]::TEXT[],
  sanitation_flags TEXT[] DEFAULT ARRAY[]::TEXT[],
  flagged_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_by VARCHAR(100),
  reviewed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS disease_reports (
  id BIGSERIAL PRIMARY KEY,
  ward_id VARCHAR(20) REFERENCES wards(id) ON DELETE CASCADE,
  disease_name VARCHAR(50) NOT NULL,
  case_count INTEGER NOT NULL,
  trend VARCHAR(20) DEFAULT 'stable',
  report_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS alerts (
  id BIGSERIAL PRIMARY KEY,
  ward_id VARCHAR(20) REFERENCES wards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL,
  message TEXT,
  created_by VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hospitals (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  ward_id VARCHAR(20) REFERENCES wards(id) ON DELETE SET NULL,
  type VARCHAR(30) DEFAULT 'General'
);

CREATE TABLE IF NOT EXISTS hospital_capacity (
  hospital_id INTEGER PRIMARY KEY REFERENCES hospitals(id) ON DELETE CASCADE,
  total_beds INTEGER NOT NULL,
  occupied_beds INTEGER NOT NULL,
  icu_total INTEGER NOT NULL,
  icu_available INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS predictions (
  id BIGSERIAL PRIMARY KEY,
  ward_id VARCHAR(20) REFERENCES wards(id) ON DELETE CASCADE,
  prediction_date DATE NOT NULL,
  predicted_hri FLOAT NOT NULL,
  severity VARCHAR(20) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hri_ward_computed_desc ON hri_scores (ward_id, computed_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_ward_submitted ON community_reports (ward_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_disease_ward_date ON disease_reports (ward_id, report_date DESC);
CREATE INDEX IF NOT EXISTS idx_flags_status_flagged ON field_flags (status, flagged_at DESC);

COMMIT;
