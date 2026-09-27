import { CommunityIntelligenceManager } from '../utils/CommunityIntelligenceManager';

const TRANSMISSION_BY_DISEASE = {
  Dengue: 'Aedes aegypti (Day biter)',
  Malaria: 'Anopheles mosquito (Night biter)',
  Typhoid: 'Contaminated water/food',
  Diarrhoea: 'Waterborne — open drain exposure',
  Respiratory: 'Airborne — high PM2.5 + humidity',
  Cholera: 'Contaminated water source'
};

const slugInterventionId = (sectorKey, name) => {
  const suffix = String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${sectorKey}-${suffix}`;
};

const contributorLines = (contributors = []) =>
  contributors.map((item) => `${item.source}: ${item.note}`);

const toTrendLabel = (trend) => {
  if (trend === 'OUTBREAK') return '⚠ Outbreak Alert';
  if (trend === 'RISING') return 'Rising ↑';
  return 'Stable →';
};

// Replace the hardcoded Community Reports contributor with live data
const withLiveCommunity = (sectorName, contributors) => {
  const liveContributor = CommunityIntelligenceManager.getCommunityContributor(sectorName);
  return contributors.map(c =>
    c.source === 'Community Reports' ? liveContributor : c
  );
};

export const SECTOR_DATA = {
  'sector-03': {
    name: 'Sector-03',
    label: 'Civil Lines',
    hri: 89,
    hriMax: 100,
    severity: 'CRITICAL',
    disease: 'Dengue',
    cases: 31,
    trend: 'OUTBREAK',
    outbreakProbability: 88,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 3.2, max: 3.2, color: '#4da6ff', note: '31 confirmed dengue admissions this week' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 2.6, max: 2.8, color: '#f5a623', note: '14 HIGH risk households flagged in sector' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 1.8, max: 2.0, color: '#00d4aa', note: 'LST 44.8°C · Stagnation index CRITICAL' },
      { source: 'Community Reports', icon: '👥', score: 1.2, max: 1.4, color: '#2dd48a', note: '18 stagnant water + 9 symptom reports' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.5, max: 0.6, color: '#b48aff', note: 'Humidity 84% · High breeding conditions' }
    ],
    primaryRiskDrivers: [
      'Hospital HMS reporting 31 dengue admissions — highest clinical burden in city this week',
      'ASHA workers flagged 14 HIGH risk households with fever + joint pain — active transmission confirmed at ground level',
      'NASA satellite shows CRITICAL stagnation index — confirmed by 18 community stagnant water reports'
    ],
    interventions: [
      { 
        name: 'Emergency Fogging Campaign', 
        hriReduction: 18, 
        caseReductionPct: 35, 
        tag: 'RECOMMENDED FROM ALERT', 
        description: 'Immediate thermal fogging across all high-risk sub-wards to reduce adult mosquito population.',
        executionSteps: [
          'Deploy fogging teams in all flagged sub-wards',
          'Focus on peak mosquito activity hours',
          'Cover high-density residential clusters',
          'Repeat cycles for 3–5 days'
        ],
        effort: 'High',
        costCategory: 'Municipal Emergency'
      },
      { 
        name: 'Larviciding & Source Reduction', 
        hriReduction: 16, 
        caseReductionPct: 40, 
        tag: 'RECOMMENDED FROM ALERT', 
        description: 'Eliminate mosquito breeding sites through larvicide application and removal of stagnant water.',
        executionSteps: [
          'Identify stagnation hotspots',
          'Apply larvicides',
          'Remove open water containers',
          'Clean drains and blocked areas'
        ],
        effort: 'High',
        costCategory: 'Municipal'
      },
      { 
        name: 'ASHA Worker Mobilization', 
        hriReduction: 14, 
        caseReductionPct: 20, 
        tag: null, 
        description: 'Deploy ASHA workers for intensive household surveillance and reporting.',
        executionSteps: [
          'Intensify daily surveys in affected clusters',
          'Identify new fever/joint pain cases',
          'Report daily for 14 days',
          'Escalate critical cases immediately'
        ],
        effort: 'Moderate–High',
        costCategory: 'Workforce'
      },
      { 
        name: 'Hyperlocal Dengue Alerting', 
        hriReduction: 10, 
        caseReductionPct: 15, 
        tag: 'RECOMMENDED FROM ALERT', 
        description: 'Send targeted dengue alerts to high-risk clusters with prevention guidance.',
        executionSteps: [
          'Identify high-risk streets via HRI',
          'Send localized alerts (NOT ward-wide)',
          'Include prevention steps + symptoms',
          'Update dynamically'
        ],
        effort: 'Low',
        costCategory: 'Digital'
      },
      { 
        name: 'Hospital Preparedness & Surge Control', 
        hriReduction: 8, 
        caseReductionPct: 5, 
        tag: null, 
        description: 'Prepare hospitals for dengue surge with medicines, beds, and diagnostic kits.',
        executionSteps: [
          'Alert hospitals for surge readiness',
          'Pre-stock NS1 kits, IV fluids, paracetamol',
          'Allocate isolation beds',
          'Monitor capacity in real-time'
        ],
        effort: 'Moderate',
        costCategory: 'Healthcare System'
      }
    ],
    expectedImpact: {
      hriAfter: 46,
      timelineDays: 5,
      caseReduction: 75,
      containmentProbability: 82,
      description: 'Comprehensive deployment (Fogging + Larviciding + ASHA + Alerts) projects HRI reduction from 89 → 46 within 5 days. Transmission chain disruption likely within 72 hours.'
    }
  },
  'sector-08': {
    name: 'Sector-08',
    label: 'North Solapur',
    hri: 86,
    hriMax: 100,
    severity: 'CRITICAL',
    disease: 'Dengue',
    cases: 27,
    trend: 'OUTBREAK',
    outbreakProbability: 82,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 3.1, max: 3.2, color: '#4da6ff', note: '27 dengue admissions — active outbreak' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 2.4, max: 2.8, color: '#f5a623', note: '11 HIGH risk households flagged' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 1.7, max: 2.0, color: '#00d4aa', note: 'LST 43.5°C · Stagnation HIGH' },
      { source: 'Community Reports', icon: '👥', score: 1.1, max: 1.4, color: '#2dd48a', note: '14 stagnant water reports this week' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.5, max: 0.6, color: '#b48aff', note: 'Humidity 81%' }
    ],
    primaryRiskDrivers: [
      'Hospital HMS reporting 27 dengue admissions — second highest in city',
      'ASHA surveys flagged 11 HIGH risk households — fever and joint pain cluster confirmed',
      'Satellite stagnation HIGH — breeding sites identified near Railway Colony area'
    ],
    interventions: [
      { 
        name: 'Emergency Fogging Campaign', 
        hriReduction: 17, 
        caseReductionPct: 35, 
        tag: 'RECOMMENDED FROM ALERT', 
        description: 'Immediate fogging in high-risk sub-wards to reduce adult mosquito population.',
        executionSteps: [
          'Deploy fogging in Railway Colony + nearby clusters',
          'Target peak mosquito activity hours',
          'Repeat cycles for 3–5 days',
          'Focus on dense residential zones'
        ],
        effort: 'High',
        costCategory: 'Emergency'
      },
      { 
        name: 'Larviciding & Source Reduction', 
        hriReduction: 15, 
        caseReductionPct: 40, 
        tag: 'RECOMMENDED FROM ALERT', 
        description: 'Eliminate mosquito breeding sites in stagnation zones.',
        executionSteps: [
          'Identify stagnation points',
          'Apply larvicides',
          'Remove standing water containers',
          'Clean drains'
        ],
        effort: 'High',
        costCategory: 'Municipal'
      },
      { 
        name: 'ASHA Worker Mobilization', 
        hriReduction: 13, 
        caseReductionPct: 20, 
        tag: null, 
        description: 'Intensify household surveys and daily reporting in affected clusters.',
        executionSteps: [
          'Conduct daily household surveys',
          'Track fever + joint pain cases',
          'Report daily for 14 days',
          'Escalate critical cases'
        ],
        effort: 'Moderate–High',
        costCategory: 'Workforce'
      },
      { 
        name: 'Hyperlocal Dengue Alerting', 
        hriReduction: 9, 
        caseReductionPct: 15, 
        tag: 'RECOMMENDED FROM ALERT', 
        description: 'Deliver targeted dengue alerts to affected clusters (not full ward).',
        executionSteps: [
          'Identify high-risk streets',
          'Send localized alerts',
          'Include prevention steps (remove water, avoid bites)',
          'Update dynamically'
        ],
        effort: 'Low',
        costCategory: 'Digital'
      },
      { 
        name: 'Hospital Preparedness Alert', 
        hriReduction: 7, 
        caseReductionPct: 5, 
        tag: null, 
        description: 'Prepare hospitals for dengue case surge.',
        executionSteps: [
          'Alert hospitals',
          'Pre-stock NS1 kits, IV fluids',
          'Allocate dengue beds',
          'Monitor capacity'
        ],
        effort: 'Moderate',
        costCategory: 'Healthcare'
      }
    ],
    expectedImpact: {
      hriAfter: 46,
      timelineDays: 5,
      caseReduction: 72,
      containmentProbability: 80,
      description: 'Emergency Railway Colony response projects HRI reduction from 86 → 46 within 5 days. High-intensity vector suppression likely disrupts transmission chain by Day 3.'
    }
  },
  'sector-10': {
    name: 'Sector-10',
    label: 'Central Solapur',
    hri: 74,
    hriMax: 100,
    severity: 'HIGH',
    disease: 'Dengue',
    cases: 22,
    trend: 'RISING',
    outbreakProbability: 71,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 2.8, max: 3.2, color: '#4da6ff', note: '22 dengue cases — rising trend' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 2.1, max: 2.8, color: '#f5a623', note: '8 HIGH risk households this week' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 1.4, max: 2.0, color: '#00d4aa', note: 'LST 43.5°C · Stagnation MODERATE' },
      { source: 'Community Reports', icon: '👥', score: 0.9, max: 1.4, color: '#2dd48a', note: '9 reports this week' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.5, max: 0.6, color: '#b48aff', note: 'Humidity 79%' }
    ],
    primaryRiskDrivers: [
      'Hospital HMS showing 22 dengue cases with accelerating week-on-week growth',
      'ASHA surveys flagged 8 HIGH risk households — early cluster forming',
      'Moderate stagnation risk — proactive source reduction can prevent escalation'
    ],
    interventions: [
      { name: 'Drain Desilting Priority', hriReduction: 10, caseReductionPct: 22, tag: 'RECOMMENDED FROM ALERT', description: 'Clear clogged drains to eliminate primary stagnation sources.' },
      { name: 'Targeted Fogging', hriReduction: 9, caseReductionPct: 20, tag: 'RECOMMENDED FROM ALERT', description: 'Preventive fogging in flagged sub-wards before outbreak escalates.' },
      { name: 'Community Advisory', hriReduction: 3, caseReductionPct: 8, tag: null, description: 'Issue dengue prevention advisory to residents.' },
      { name: 'ASHA Surveillance Ramp-up', hriReduction: 4, caseReductionPct: 6, tag: null, description: 'Increase survey frequency in flagged households.' }
    ],
    expectedImpact: {
      hriAfter: 52,
      timelineDays: 10,
      caseReduction: 50,
      containmentProbability: 81,
      description: 'Early intervention projects HRI reduction from 74 → 52 within 10 days. 50% case reduction likely if implemented within 48 hours.'
    }
  },
  'sector-12': {
    name: 'Sector-12', label: 'Market Yard / Siddheshwar',
    hri: 73, hriMax: 100, severity: 'HIGH',
    disease: 'Dengue', cases: 18, trend: 'RISING', outbreakProbability: 67,
    contributors: [
      { source: 'Hospital HMS Cases',     icon: '🏥', score: 2.6, max: 3.2, color: '#4da6ff', note: '18 dengue cases — rising trend' },
      { source: 'ASHA Field Surveys',     icon: '👩‍⚕️', score: 2.0, max: 2.8, color: '#f5a623', note: '9 HIGH risk households flagged near market' },
      { source: 'NASA Satellite Signals', icon: '🛰',  score: 1.5, max: 2.0, color: '#00d4aa', note: 'LST 44.5°C · Stagnation MODERATE-HIGH' },
      { source: 'Community Reports',      icon: '👥', score: 1.1, max: 1.4, color: '#2dd48a', note: '16 stagnant water reports near market drains' },
      { source: 'Weather & Environment',  icon: '🌦', score: 0.5, max: 0.6, color: '#b48aff', note: 'Humidity 81%' }
    ],
    primaryRiskDrivers: [
      'Hospital HMS reporting 18 dengue cases — dense market area accelerating transmission',
      'ASHA surveys flagged 9 HIGH risk households — fever and joint pain cluster near Market Yard',
      '16 citizen reports of stagnant water in market drains — primary breeding source identified'
    ],
    interventions: [
      { 
        name: 'Market Drain Emergency Cleanup', 
        hriReduction: 13, 
        caseReductionPct: 35, 
        tag: 'RECOMMENDED FROM ALERT', 
        description: 'Clear clogged drains and eliminate stagnant water in Market Yard area.',
        executionSteps: [
          'Identify clogged drains in Market Yard',
          'Deploy emergency desilting teams',
          'Remove stagnant water',
          'Ensure continuous drainage flow'
        ],
        effort: 'High',
        costCategory: 'Infrastructure'
      },
      { 
        name: 'Targeted Fogging — Market Zone', 
        hriReduction: 12, 
        caseReductionPct: 30, 
        tag: 'RECOMMENDED FROM ALERT', 
        description: 'Conduct localized fogging in Market Yard and surrounding residential areas.',
        executionSteps: [
          'Fog market + nearby residential lanes',
          'Target peak mosquito activity times',
          'Repeat for 3–4 days',
          'Monitor effectiveness'
        ],
        effort: 'Moderate',
        costCategory: 'Municipal'
      },
      { 
        name: 'ASHA Worker Mobilization', 
        hriReduction: 10, 
        caseReductionPct: 20, 
        tag: null, 
        description: 'Intensify household surveys in market-adjacent clusters.',
        executionSteps: [
          'Conduct daily surveys in flagged households',
          'Track fever + joint pain symptoms',
          'Identify new cases early',
          'Escalate critical cases'
        ],
        effort: 'Moderate',
        costCategory: 'Workforce'
      },
      { 
        name: 'Hyperlocal Dengue Alerting', 
        hriReduction: 8, 
        caseReductionPct: 15, 
        tag: null, 
        description: 'Send targeted dengue alerts to residents around Market Yard.',
        executionSteps: [
          'Identify high-risk streets near market',
          'Send localized alerts',
          'Include prevention steps (remove water, avoid bites)',
          'Update dynamically'
        ],
        effort: 'Low',
        costCategory: 'Digital'
      }
    ],
    expectedImpact: { 
      hriAfter: 43, 
      timelineDays: 5, 
      caseReduction: 70, 
      containmentProbability: 78,
      description: 'Market drain cleanup + fogging projects HRI reduction from 73 → 43 within 5 days. Transmission chain disruption likely if market-zone vector density is reduced by 85%.' 
    }
  },
  'sector-07': {
    name: 'Sector-07',
    label: 'Navy Peth',
    hri: 72,
    hriMax: 100,
    severity: 'HIGH',
    disease: 'Respiratory',
    cases: 19,
    trend: 'RISING',
    outbreakProbability: 64,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 2.6, max: 3.2, color: '#4da6ff', note: '19 respiratory admissions — rising' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 2.0, max: 2.8, color: '#f5a623', note: '7 households with cough/breathlessness' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 1.6, max: 2.0, color: '#00d4aa', note: 'LST 45.0°C · Stagnation MODERATE · PM2.5 elevated' },
      { source: 'Community Reports', icon: '👥', score: 0.7, max: 1.4, color: '#2dd48a', note: '6 air quality complaints' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.6, max: 0.6, color: '#b48aff', note: 'High humidity + monsoon conditions' }
    ],
    primaryRiskDrivers: [
      'Hospital HMS reporting 19 respiratory admissions — linked to elevated PM2.5 and monsoon humidity',
      'ASHA surveys flagged 7 households with cough and breathlessness clusters',
      'Urban heat island effect elevating vulnerability in dense residential areas of Navy Peth'
    ],
    interventions: [
      { 
        name: 'PM2.5 Monitoring Intensification', 
        hriReduction: 8, 
        caseReductionPct: 15, 
        tag: 'RECOMMENDED FROM ALERT', 
        description: 'Deploy temporary air quality monitors in high-density zones.',
        executionSteps: [
          'Install temporary sensors in Navy Peth hotspots',
          'Track PM2.5 levels in real time',
          'Feed data into HRI system',
          'Identify peak exposure zones'
        ],
        effort: 'Moderate',
        costCategory: 'Technical / Monitoring'
      },
      { 
        name: 'Community Mask Distribution', 
        hriReduction: 10, 
        caseReductionPct: 20, 
        tag: 'RECOMMENDED FROM ALERT', 
        description: 'Distribute N95 masks to vulnerable populations via ASHA workers.',
        executionSteps: [
          'Identify vulnerable households',
          'Distribute N95 masks',
          'Educate on proper usage',
          'Prioritize elderly and children'
        ],
        effort: 'Moderate',
        costCategory: 'Municipal / Health'
      },
      { 
        name: 'Hyperlocal Air Quality Alerting', 
        hriReduction: 7, 
        caseReductionPct: 15, 
        tag: null, 
        description: 'Send localized alerts on air quality levels and safety precautions.',
        executionSteps: [
          'Identify high PM2.5 zones',
          'Send alerts (app/SMS)',
          'Recommend mask usage + reduced outdoor exposure',
          'Update dynamically'
        ],
        effort: 'Low',
        costCategory: 'Digital'
      },
      { 
        name: 'Mobile Health Camp Deployment', 
        hriReduction: 12, 
        caseReductionPct: 25, 
        tag: null, 
        description: 'Deploy rapid-response medical teams for respiratory screening and treatment.',
        executionSteps: [
          'Set up camps in high-risk zones',
          'Screen for respiratory symptoms',
          'Provide basic treatment and referrals',
          'Monitor case trends'
        ],
        effort: 'High',
        costCategory: 'Healthcare'
      }
    ],
    expectedImpact: {
      hriAfter: 46,
      timelineDays: 5,
      caseReduction: 68,
      containmentProbability: 76,
      description: 'Air quality monitoring + mobile health camp deployment projects HRI reduction from 72 → 46 within 5 days. Effective PM2.5 exposure reduction likely through community masking.'
    }
  },
  'sector-01': {
    name: 'Sector-01',
    label: 'Ashok Chowk',
    hri: 71,
    hriMax: 100,
    severity: 'HIGH',
    disease: 'Typhoid',
    cases: 14,
    trend: 'RISING',
    outbreakProbability: 61,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 2.4, max: 3.2, color: '#4da6ff', note: '14 typhoid cases — rising trend' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 2.2, max: 2.8, color: '#f5a623', note: '9 households — fever + GI symptoms' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 1.2, max: 2.0, color: '#00d4aa', note: 'LST 44.4°C · Stagnation MODERATE · Water stagnation near supply lines' },
      { source: 'Community Reports', icon: '👥', score: 1.1, max: 1.4, color: '#2dd48a', note: '12 contaminated water reports' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.4, max: 0.6, color: '#b48aff', note: 'Moderate conditions' }
    ],
    primaryRiskDrivers: [
      'Hospital HMS reporting 14 typhoid cases — contaminated water/food source suspected',
      'ASHA surveys flagged 9 households with fever and gastrointestinal symptoms in same locality',
      '12 citizen reports of contaminated or discoloured water in Ashok Chowk area'
    ],
    interventions: [
      { 
        name: 'Water Network Isolation + Geo-Chlorination', 
        hriReduction: 13, 
        caseReductionPct: 35, 
        tag: 'RECOMMENDED FROM ALERT', 
        description: 'Isolate contaminated pipeline segments and apply targeted chlorination in affected zones.',
        executionSteps: [
          'Identify affected pipelines using complaint clusters + ASHA data',
          'Temporarily isolate contaminated segments',
          'Reroute safe water supply',
          'Conduct targeted chlorination in flagged zones'
        ],
        effort: 'High',
        costCategory: 'Infrastructure + Municipal'
      },
      { 
        name: 'Mobile Water Testing + Source Traceback', 
        hriReduction: 11, 
        caseReductionPct: 25, 
        tag: 'RECOMMENDED FROM ALERT', 
        description: 'Deploy mobile testing units and identify the exact contamination source (pipeline, tank, or vendor).',
        executionSteps: [
          'Deploy field testing units in Ashok Chowk clusters',
          'Test water samples from households and supply lines',
          'Analyze patterns to identify common contamination source',
          'Flag source for immediate corrective action'
        ],
        effort: 'Moderate',
        costCategory: 'Municipal / Operational'
      },
      { 
        name: 'ASHA Micro-Cluster Surveillance', 
        hriReduction: 16, 
        caseReductionPct: 35, 
        tag: null, 
        description: 'Deploy ASHA workers for daily monitoring in high-risk micro-clusters.',
        executionSteps: [
          'Assign ASHA workers to flagged streets',
          'Conduct daily symptom tracking in households',
          'Identify new cases and escalate immediately',
          'Monitor cluster expansion patterns'
        ],
        effort: 'Moderate',
        costCategory: 'Workforce (ASHA)'
      },
      { 
        name: 'Targeted High-Risk Vendor Inspection', 
        hriReduction: 9, 
        caseReductionPct: 15, 
        tag: null, 
        description: 'Inspect and regulate food vendors in contamination-affected zones.',
        executionSteps: [
          'Identify vendors in high-risk streets',
          'Conduct hygiene and water source inspections',
          'Shut down non-compliant vendors temporarily',
          'Enforce safe food handling practices'
        ],
        effort: 'Low–Moderate',
        costCategory: 'Regulatory'
      },
      { 
        name: 'Hyperlocal Citizen Alerting System', 
        hriReduction: 14, 
        caseReductionPct: 25, 
        tag: 'RECOMMENDED FROM ALERT', 
        description: 'Deliver precise, zone-specific alerts to affected households.',
        executionSteps: [
          'Identify high-risk streets via HRI + reports',
          'Send targeted alerts (app/SMS)',
          'Provide safe water instructions + alternatives',
          'Update alerts dynamically based on new data'
        ],
        effort: 'Low',
        costCategory: 'Digital / Communication'
      }
    ],
    expectedImpact: {
      hriAfter: 48,
      timelineDays: 7,
      caseReduction: 55,
      containmentProbability: 76,
      description: 'Water testing + boil advisory projects HRI reduction from 71 → 48 within 7 days. Transmission chain likely broken within 72 hours of water source fix.'
    }
  },
  'sector-09': {
    name: 'Sector-09',
    label: 'Railway Lines',
    hri: 69,
    hriMax: 100,
    severity: 'HIGH',
    disease: 'Typhoid',
    cases: 11,
    trend: 'RISING',
    outbreakProbability: 58,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 2.3, max: 3.2, color: '#4da6ff', note: '11 typhoid admissions from rail colony catchments' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 2.1, max: 2.8, color: '#f5a623', note: '8 households with fever + GI complaints' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 1.1, max: 2.0, color: '#00d4aa', note: 'LST 44.0°C · Stagnation MODERATE · Localized near service lanes' },
      { source: 'Community Reports', icon: '👥', score: 1.0, max: 1.4, color: '#2dd48a', note: '9 contaminated water complaints in 7 days' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.4, max: 0.6, color: '#b48aff', note: 'Intermittent rain stress on pipelines' }
    ],
    primaryRiskDrivers: [
      'Hospital HMS reports 11 typhoid admissions in a concentrated rail colony catchment',
      'ASHA teams identified 8 symptomatic households with likely common source exposure',
      'Community complaints indicate recurring pipeline contamination near service lanes'
    ],
    interventions: [
      { name: 'Pipeline Leak Rectification', tag: 'RECOMMENDED FROM ALERT', description: 'Repair and flush vulnerable segments near Railway Lines supply routes.' },
      { name: 'Boil Water Advisory', tag: 'RECOMMENDED FROM ALERT', description: 'Issue immediate boil-water notice and ward-level guidance.' },
      { name: 'ORS Distribution Drive', tag: null, description: 'Deploy ORS packets through ASHA workers for vulnerable households.' }
    ],
    expectedImpact: {
      hriAfter: 49,
      timelineDays: 8,
      caseReduction: 52,
      containmentProbability: 75,
      description: 'Leak rectification + advisory measures project HRI reduction from 69 → 49 within 8 days with major reduction in typhoid spread.'
    }
  },
  'sector-05': {
    name: 'Sector-05',
    label: 'Jule Solapur',
    hri: 68,
    hriMax: 100,
    severity: 'HIGH',
    disease: 'Diarrhoea',
    cases: 8,
    trend: 'RISING',
    outbreakProbability: 54,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 2.1, max: 3.2, color: '#4da6ff', note: '8 diarrhoeal admissions with rising week-on-week trend' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 2.0, max: 2.8, color: '#f5a623', note: '7 households flagged near open drains' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 1.2, max: 2.0, color: '#00d4aa', note: 'LST 43.8°C · Stagnation MODERATE · Runoff in low-lying pockets' },
      { source: 'Community Reports', icon: '👥', score: 0.9, max: 1.4, color: '#2dd48a', note: '8 open-drain and wastewater overflow complaints' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.4, max: 0.6, color: '#b48aff', note: 'Monsoon humidity sustaining contamination risk' }
    ],
    primaryRiskDrivers: [
      'Hospital admissions indicate a growing diarrhoeal burden in vulnerable blocks',
      'ASHA surveys link new cases to households near open-drain exposure corridors',
      'Community complaints confirm wastewater overflow persistence in the same sub-wards'
    ],
    interventions: [
      { 
        name: 'Drain Desilting + Wastewater Clearance', 
        hriReduction: 14, 
        caseReductionPct: 35, 
        tag: 'RECOMMENDED FROM ALERT', 
        description: 'Rapid desilting of open drains and removal of wastewater blockages in flagged areas.',
        executionSteps: [
          'Identify blocked drains from reports',
          'Deploy desilting teams in priority zones',
          'Clear overflow points',
          'Restore proper drainage flow'
        ],
        effort: 'High',
        costCategory: 'Infrastructure'
      },
      { 
        name: 'Targeted Water Chlorination Sweep', 
        hriReduction: 12, 
        caseReductionPct: 30, 
        tag: 'RECOMMENDED FROM ALERT', 
        description: 'Chlorinate household and public water sources in affected zones.',
        executionSteps: [
          'Identify affected water supply areas',
          'Chlorinate taps and storage tanks',
          'Monitor chlorine levels',
          'Repeat in high-risk pockets'
        ],
        effort: 'Moderate',
        costCategory: 'Municipal'
      },
      { 
        name: 'ASHA Cluster Surveillance', 
        hriReduction: 10, 
        caseReductionPct: 20, 
        tag: null, 
        description: 'Monitor households in drain-adjacent clusters for diarrhoeal symptoms.',
        executionSteps: [
          'Assign ASHA workers to flagged zones',
          'Track symptoms daily',
          'Identify new cases',
          'Escalate severe cases'
        ],
        effort: 'Moderate',
        costCategory: 'Workforce'
      },
      { 
        name: 'Hyperlocal Hygiene Alerting', 
        hriReduction: 8, 
        caseReductionPct: 15, 
        tag: null, 
        description: 'Deliver targeted hygiene and safe-water alerts to affected households.',
        executionSteps: [
          'Identify high-risk streets',
          'Send localized alerts (SMS/app/ASHA)',
          'Provide hygiene + safe water guidance',
          'Update dynamically'
        ],
        effort: 'Low',
        costCategory: 'Digital'
      }
    ],
    expectedImpact: {
      hriAfter: 31,
      timelineDays: 5,
      caseReduction: 70,
      containmentProbability: 78,
      description: 'Systemic desilting + chlorination drive projects HRI reduction from 68 → 31 within 5 days. Enteric transmission chain likely broken if 100% of identified drains are cleared.'
    }
  },
  'sector-13': {
    name: 'Sector-13',
    label: 'Sector-13',
    hri: 67,
    hriMax: 100,
    severity: 'HIGH',
    disease: 'Cholera',
    cases: 6,
    trend: 'RISING',
    outbreakProbability: 49,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 2.0, max: 3.2, color: '#4da6ff', note: '6 cholera admissions tied to shared water source' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 1.9, max: 2.8, color: '#f5a623', note: '6 households with acute watery diarrhoea symptoms' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 1.1, max: 2.0, color: '#00d4aa', note: 'LST 43.6°C · Stagnation HIGH · Drain backup near borewell strip' },
      { source: 'Community Reports', icon: '👥', score: 0.9, max: 1.4, color: '#2dd48a', note: '7 foul-water complaints this week' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.4, max: 0.6, color: '#b48aff', note: 'Persistent humidity supports contamination survival' }
    ],
    primaryRiskDrivers: [
      'Hospital HMS confirms cholera-linked admissions associated with a common water source',
      'ASHA teams report clustered watery-diarrhoea symptoms in adjacent households',
      'Community complaints indicate foul-water persistence and possible sewage mixing'
    ],
    interventions: [
      { 
        name: 'Emergency Chlorination Drive', 
        hriReduction: 15, 
        caseReductionPct: 40, 
        tag: 'RECOMMENDED FROM ALERT', 
        description: 'Shock chlorination of affected water supply points and storage nodes.',
        executionSteps: [
          'Identify affected supply nodes',
          'Perform high-dose chlorination',
          'Monitor chlorine levels',
          'Repeat in high-risk pockets'
        ],
        effort: 'High',
        costCategory: 'Municipal'
      },
      { 
        name: 'Source Isolation + Safe Water Supply', 
        hriReduction: 14, 
        caseReductionPct: 35, 
        tag: 'RECOMMENDED FROM ALERT', 
        description: 'Isolate contaminated source and provide alternate safe water.',
        executionSteps: [
          'Identify contaminated borewell/pipeline',
          'Shut off supply temporarily',
          'Deploy tanker supply',
          'Prevent further mixing'
        ],
        effort: 'High',
        costCategory: 'Infrastructure'
      },
      { 
        name: 'ASHA Cluster Surveillance', 
        hriReduction: 11, 
        caseReductionPct: 20, 
        tag: null, 
        description: 'Monitor households with diarrhoeal symptoms for cluster control.',
        executionSteps: [
          'Assign ASHA workers to affected zones',
          'Conduct daily symptom tracking',
          'Identify new cases',
          'Escalate severe cases'
        ],
        effort: 'Moderate',
        costCategory: 'Workforce'
      },
      { 
        name: 'ORS Distribution + Household Support', 
        hriReduction: 8, 
        caseReductionPct: 15, 
        tag: null, 
        description: 'Distribute ORS and provide basic care support in affected households.',
        executionSteps: [
          'Distribute ORS via ASHA workers',
          'Educate on usage',
          'Prioritize vulnerable households',
          'Monitor recovery'
        ],
        effort: 'Low–Moderate',
        costCategory: 'Healthcare'
      }
    ],
    expectedImpact: {
      hriAfter: 34,
      timelineDays: 5,
      caseReduction: 75,
      containmentProbability: 80,
      description: 'Rapid chlorination + source isolation response projects HRI reduction from 67 → 34 within 5 days. Transmission chain disruption likely within 48 hours of source shutdown.'
    }
  },
  'sector-16': {
    name: 'Sector-16',
    label: 'Sector-16',
    hri: 52,
    hriMax: 100,
    severity: 'MODERATE',
    disease: 'Dengue',
    cases: 9,
    trend: 'STABLE',
    outbreakProbability: 32,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 1.4, max: 3.2, color: '#4da6ff', note: '9 dengue cases with no accelerated spread' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 1.3, max: 2.8, color: '#f5a623', note: '4 households under observation' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 1.0, max: 2.0, color: '#00d4aa', note: 'LST 43.0°C · Stagnation MODERATE-HIGH · Localized pockets' },
      { source: 'Community Reports', icon: '👥', score: 0.6, max: 1.4, color: '#2dd48a', note: '4 stagnant water reports addressed' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.3, max: 0.6, color: '#b48aff', note: 'Moderate humidity profile' }
    ],
    primaryRiskDrivers: [
      'Hospital data shows low but persistent dengue burden requiring sustained control',
      'ASHA surveillance indicates scattered households needing follow-up',
      'Environmental risk remains moderate due to recurring small stagnation points'
    ],
    interventions: [
      { name: 'Routine Fogging Cadence', tag: null, description: 'Maintain weekly fogging in previously flagged lanes.' },
      { name: 'Source Reduction Patrol', tag: null, description: 'Continue larval source checks and container emptying drives.' }
    ],
    expectedImpact: {
      hriAfter: 44,
      timelineDays: 14,
      caseReduction: 28,
      containmentProbability: 88,
      description: 'Routine control measures keep risk moderated, projecting HRI reduction from 52 → 44 over two weeks.'
    }
  },
  'sector-14': {
    name: 'Sector-14',
    label: 'Sector-14',
    hri: 45,
    hriMax: 100,
    severity: 'MODERATE',
    disease: 'Respiratory',
    cases: 4,
    trend: 'STABLE',
    outbreakProbability: 21,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 1.1, max: 3.2, color: '#4da6ff', note: '4 respiratory admissions, stable trajectory' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 1.0, max: 2.8, color: '#f5a623', note: '3 households with mild respiratory symptoms' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 0.9, max: 2.0, color: '#00d4aa', note: 'LST 43.2°C · Stagnation LOW · PM2.5 near arterial roads' },
      { source: 'Community Reports', icon: '👥', score: 0.5, max: 1.4, color: '#2dd48a', note: '2 air quality complaints logged' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.3, max: 0.6, color: '#b48aff', note: 'Humidity stable, no severe spikes' }
    ],
    primaryRiskDrivers: [
      'Clinical burden remains low and stable with no clustering escalation',
      'Localized PM2.5 exposure near high-traffic corridors is the key residual risk',
      'Community signal volume remains limited and manageable'
    ],
    interventions: [
      { 
        name: 'Air Quality Monitoring Intensification', 
        hriReduction: 6, 
        caseReductionPct: 10, 
        tag: null, 
        description: 'Deploy mobile air quality sensors to identify PM2.5 hotspots.',
        executionSteps: [
          'Install mobile sensors in high-traffic zones',
          'Track PM2.5 levels in real time',
          'Identify peak exposure areas',
          'Feed data into HRI system'
        ],
        effort: 'Moderate',
        costCategory: 'Technical'
      },
      { 
        name: 'Hyperlocal Air Quality Advisory', 
        hriReduction: 5, 
        caseReductionPct: 12, 
        tag: null, 
        description: 'Deliver targeted advisories to populations in high PM2.5 zones.',
        executionSteps: [
          'Identify high-risk streets near arterial roads',
          'Send localized alerts',
          'Recommend mask usage + reduced outdoor exposure',
          'Update dynamically'
        ],
        effort: 'Low',
        costCategory: 'Digital'
      },
      { 
        name: 'ASHA Respiratory Surveillance', 
        hriReduction: 5, 
        caseReductionPct: 10, 
        tag: null, 
        description: 'Increase monitoring of mild respiratory symptoms in affected households.',
        executionSteps: [
          'Monitor flagged households',
          'Track respiratory symptoms',
          'Conduct periodic follow-ups',
          'Escalate if cluster forms'
        ],
        effort: 'Low–Moderate',
        costCategory: 'Workforce'
      }
    ],
    expectedImpact: {
      hriAfter: 33,
      timelineDays: 7,
      caseReduction: 35,
      containmentProbability: 88,
      description: 'Advisory + mobile monitoring projects HRI reduction from 45 → 33 within 7 days. Early detection allows for preventive behavior before symptoms escalate.'
    }
  },
  'sector-02': {
    name: 'Sector-02',
    label: 'Bhavani Peth',
    hri: 42,
    hriMax: 100,
    severity: 'MODERATE',
    disease: 'Malaria',
    cases: 3,
    trend: 'STABLE',
    outbreakProbability: 18,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 0.9, max: 3.2, color: '#4da6ff', note: '3 malaria cases with no rise trend' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 0.9, max: 2.8, color: '#f5a623', note: '2 households under watch' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 0.8, max: 2.0, color: '#00d4aa', note: 'LST 43.9°C · Stagnation LOW · Low-to-moderate breeding conditions' },
      { source: 'Community Reports', icon: '👥', score: 0.4, max: 1.4, color: '#2dd48a', note: 'Minimal mosquito complaints this week' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.2, max: 0.6, color: '#b48aff', note: 'Weather stable and moderate' }
    ],
    primaryRiskDrivers: [
      'Malaria burden remains limited with isolated case pattern',
      'ASHA surveillance indicates no active household cluster progression',
      'Vector breeding indicators remain within controlled baseline limits'
    ],
    interventions: [
      { 
        name: 'Targeted Larval Source Reduction', 
        hriReduction: 6, 
        caseReductionPct: 15, 
        tag: null, 
        description: 'Eliminate mosquito breeding sites in identified hotspots using targeted larval control.',
        executionSteps: [
          'Identify stagnant water hotspots',
          'Apply larvicides in targeted areas',
          'Remove standing water sources',
          'Conduct weekly follow-ups'
        ],
        effort: 'Low–Moderate',
        costCategory: 'Municipal'
      },
      { 
        name: 'ASHA Sentinel Monitoring', 
        hriReduction: 5, 
        caseReductionPct: 10, 
        tag: null, 
        description: 'Maintain active surveillance of flagged households and nearby areas.',
        executionSteps: [
          'Assign ASHA workers to flagged households',
          'Monitor fever/malaria symptoms',
          'Conduct follow-ups',
          'Escalate if new cases appear'
        ],
        effort: 'Low',
        costCategory: 'Workforce'
      },
      { 
        name: 'Targeted Household Inspection Drive', 
        hriReduction: 6, 
        caseReductionPct: 12, 
        tag: null, 
        description: 'Inspect households in flagged zones to eliminate hidden breeding sources.',
        executionSteps: [
          'Inspect homes in flagged + nearby areas',
          'Identify hidden breeding spots',
          'Educate residents on safe practices',
          'Remove or treat risk sources'
        ],
        effort: 'Moderate',
        costCategory: 'Municipal / Field'
      }
    ],
    expectedImpact: {
      hriAfter: 36,
      timelineDays: 14,
      caseReduction: 24,
      containmentProbability: 93,
      description: 'Routine surveillance and preventive advisories maintain control and project HRI reduction from 42 → 36 in two weeks.'
    }
  },
  'sector-11': {
    name: 'Sector-11',
    label: 'South Solapur',
    hri: 38,
    hriMax: 100,
    severity: 'LOW',
    disease: 'Malaria',
    cases: 2,
    trend: 'STABLE',
    outbreakProbability: 12,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 0.4, max: 3.2, color: '#4da6ff', note: '2 malaria cases — no active trend' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 0.6, max: 2.8, color: '#f5a623', note: '1 HIGH risk household this week' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 0.8, max: 2.0, color: '#00d4aa', note: 'LST 43.4°C · Stagnation LOW' },
      { source: 'Community Reports', icon: '👥', score: 0.2, max: 1.4, color: '#2dd48a', note: 'No active reports' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.3, max: 0.6, color: '#b48aff', note: 'Normal conditions' }
    ],
    primaryRiskDrivers: [
      '2 isolated malaria cases — no cluster pattern detected',
      'ASHA surveys show no symptomatic clusters in this sector',
      'Satellite and community signals within normal baseline range'
    ],
    interventions: [
      { name: 'Routine Surveillance', hriReduction: 3, caseReductionPct: 8, tag: null, description: 'Continue standard weekly ASHA surveys. No immediate escalation required.' },
      { name: 'Preventive Advisory', hriReduction: 2, caseReductionPct: 5, tag: null, description: 'Circulate standard mosquito prevention guidelines.' }
    ],
    expectedImpact: {
      hriAfter: 32,
      timelineDays: 14,
      caseReduction: 20,
      containmentProbability: 95,
      description: 'Routine surveillance maintains current low-risk status. No significant intervention required.'
    }
  },
  'sector-06': {
    name: 'Sector-06',
    label: 'MIDC Area',
    hri: 34,
    hriMax: 100,
    severity: 'LOW',
    disease: 'Dengue',
    cases: 5,
    trend: 'STABLE',
    outbreakProbability: 16,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 0.8, max: 3.2, color: '#4da6ff', note: '5 dengue cases, trend remains stable' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 0.7, max: 2.8, color: '#f5a623', note: '2 households under observation' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 0.7, max: 2.0, color: '#00d4aa', note: 'LST 43.7°C · Stagnation LOW · Monitored zones stable' },
      { source: 'Community Reports', icon: '👥', score: 0.3, max: 1.4, color: '#2dd48a', note: 'Few vector complaints, mostly resolved' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.2, max: 0.6, color: '#b48aff', note: 'No adverse weather trigger' }
    ],
    primaryRiskDrivers: [
      'Case burden remains stable without expansion into new sub-wards',
      'Environmental and survey indicators are within low-risk operational thresholds',
      'Existing preventive response appears sufficient to prevent escalation'
    ],
    interventions: [
      { 
        name: 'Routine Fogging Cadence', 
        hriReduction: 4, 
        caseReductionPct: 10, 
        tag: null, 
        description: 'Continue scheduled anti-vector fogging in identified pockets.',
        executionSteps: [
          'Follow scheduled fogging cycles',
          'Focus on previously flagged zones',
          'Monitor mosquito density trends',
          'Adjust frequency if risk increases'
        ],
        effort: 'Low',
        costCategory: 'Municipal'
      },
      { 
        name: 'Community Source Check', 
        hriReduction: 3, 
        caseReductionPct: 8, 
        tag: null, 
        description: 'Conduct periodic checks for household water storage and container hygiene.',
        executionSteps: [
          'Inspect water storage containers',
          'Check coolers, tanks, and small water sources',
          'Educate residents on preventive practices',
          'Reinforce weekly checks'
        ],
        effort: 'Low',
        costCategory: 'Community / Field'
      }
    ],
    expectedImpact: {
      hriAfter: 28,
      timelineDays: 14,
      caseReduction: 20,
      containmentProbability: 96,
      description: 'Current preventive routines sustain stable low-risk conditions, projecting HRI reduction from 34 → 28 over 14 days.'
    }
  },
  'sector-15': {
    name: 'Sector-15',
    label: 'Sector-15',
    hri: 28,
    hriMax: 100,
    severity: 'LOW',
    disease: 'Diarrhoea',
    cases: 1,
    trend: 'STABLE',
    outbreakProbability: 9,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 0.3, max: 3.2, color: '#4da6ff', note: '1 isolated diarrhoeal case recorded' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 0.4, max: 2.8, color: '#f5a623', note: 'No household cluster flagged' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 0.5, max: 2.0, color: '#00d4aa', note: 'LST 43.3°C · Stagnation LOW · Low environmental stress' },
      { source: 'Community Reports', icon: '👥', score: 0.2, max: 1.4, color: '#2dd48a', note: 'No sanitation escalation reports' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.2, max: 0.6, color: '#b48aff', note: 'Stable weather conditions' }
    ],
    primaryRiskDrivers: [
      'Only one isolated case with no epidemiological linkage detected',
      'ASHA and community signals remain at baseline across monitoring points',
      'No immediate environmental trigger requiring escalation'
    ],
    interventions: [
      { 
        name: 'Routine Hygiene Messaging', 
        hriReduction: 2, 
        caseReductionPct: 5, 
        tag: null, 
        description: 'Continue baseline hygiene and safe-water awareness campaigns.',
        executionSteps: [
          'Share hygiene practices (handwashing, safe water use)',
          'Use community portal / ASHA outreach',
          'Maintain periodic messaging'
        ],
        effort: 'Low',
        costCategory: 'Digital / Community'
      },
      { 
        name: 'Standard Water Monitoring', 
        hriReduction: 2, 
        caseReductionPct: 5, 
        tag: null, 
        description: 'Maintain routine water quality checks at distribution points.',
        executionSteps: [
          'Conduct periodic water quality tests',
          'Monitor supply points',
          'Maintain reporting logs',
          'Escalate if anomalies detected'
        ],
        effort: 'Low',
        costCategory: 'Municipal'
      }
    ],
    expectedImpact: {
      hriAfter: 25,
      timelineDays: 14,
      caseReduction: 15,
      containmentProbability: 98,
      description: 'Routine hygiene messaging + water monitoring projects HRI reduction from 28 → 25 over 14 days. Maintains low-risk enteric stability.'
    }
  }
};

export const toSectorKey = (nameOrKey) => {
  if (!nameOrKey) return 'sector-03';
  const lower = String(nameOrKey).trim().toLowerCase();
  if (SECTOR_DATA[lower]) return lower;
  const match = lower.match(/(\d+)/);
  if (!match) return 'sector-03';
  const num = Math.max(1, Math.min(16, parseInt(match[0], 10)));
  return `sector-${String(num).padStart(2, '0')}`;
};

export const getSectorDataByName = (nameOrKey) => {
  const data = SECTOR_DATA[toSectorKey(nameOrKey)] || SECTOR_DATA['sector-03'];
  return { ...data, contributors: withLiveCommunity(data.name, data.contributors) };
};

export const calculateImpact = (sectorKey, appliedInterventionNames = []) => {
  const sector = SECTOR_DATA[toSectorKey(sectorKey)];
  if (!sector) return null;

  const baseHRI = sector.hri;
  if (!appliedInterventionNames || appliedInterventionNames.length === 0) return null;

  let totalHriReduction = 0;
  let compoundedCaseReduction = 0; // percent (0-100)

  appliedInterventionNames.forEach((appliedName) => {
    const needle = String(appliedName || '').trim().toLowerCase();
    const intervention = (sector.interventions || []).find((entry) => String(entry.name || '').trim().toLowerCase() === needle);

    if (!intervention) {
      // Debug: log which name failed to match
      // eslint-disable-next-line no-console
      console.warn(`[Intervention Match Failed] Sector: ${toSectorKey(sectorKey)}, Looking for: "${appliedName}"`);
      // eslint-disable-next-line no-console
      console.warn('[Available interventions]:', (sector.interventions || []).map(i => i.name));
      return;
    }

    if (intervention.hriReduction) totalHriReduction += intervention.hriReduction;

    const pct = intervention.caseReductionPct || 0;
    // compound: new = 1 - (1 - prev)*(1 - pct)
    const prev = compoundedCaseReduction / 100;
    const next = 1 - (1 - prev) * (1 - pct / 100);
    compoundedCaseReduction = next * 100;
  });

  // Safety check — if still 0 after loop, something likely mismatched
  if (totalHriReduction === 0) {
    // eslint-disable-next-line no-console
    console.error(`[calculateImpact] Zero HRI reduction for sector ${toSectorKey(sectorKey)} with interventions:`, appliedInterventionNames);
    return null;
  }

  totalHriReduction = Math.min(totalHriReduction, Math.max(0, baseHRI - 15));
  const totalCaseReduction = Math.min(Math.round(compoundedCaseReduction), 85);

  const projectedHRI = Math.round(baseHRI - totalHriReduction);
  const projectedSeverity = projectedHRI >= 80 ? 'CRITICAL'
    : projectedHRI >= 65 ? 'HIGH'
      : projectedHRI >= 45 ? 'MODERATE'
        : 'LOW';

  const timelineDays = appliedInterventionNames.length >= 3
    ? 7
    : appliedInterventionNames.length === 2
      ? 10
      : 14;

  return {
    projectedHRI,
    reduction: totalHriReduction,
    projectedSeverity,
    caseReduction: totalCaseReduction,
    timelineDays,
    appliedCount: appliedInterventionNames.length,
    totalInterventions: (sector.interventions || []).length,
    baseHRI
  };
};

export const SECTOR_SELECTOR_OPTIONS = Object.values(SECTOR_DATA)
  .slice()
  .sort((a, b) => b.hri - a.hri)
  .map((item) => ({
    key: toSectorKey(item.name),
    name: item.name,
    label: item.label,
    hri: item.hri,
    severity: item.severity,
    display: `${item.name} — ${item.label} · ${item.hri} · ${item.severity}`
  }));

// Build sector health profile with live community data
const getSectorHealthProfile = (sectorId) => {
  const item = SECTOR_DATA[toSectorKey(sectorId)] || SECTOR_DATA['sector-03'];
  return {
    sector: item.name,
    sectorLabel: item.label,
    hri: item.hri,
    severity: item.severity,
    disease: item.disease,
    cases: item.cases,
    trend: item.trend.toLowerCase(),
    trendLabel: toTrendLabel(item.trend),
    transmission: TRANSMISSION_BY_DISEASE[item.disease] || 'Transmission data unavailable',
    contributors: contributorLines(withLiveCommunity(item.name, item.contributors)),
    insight: item.expectedImpact?.description || 'Continue monitoring.'
  };
};

// Proxy-backed access to live sector health profiles
// Allows DigitalTwin.js and other consumers to use SECTOR_HEALTH_PROFILES[sectorId] syntax
// while receiving dynamically computed community contributor data
export const SECTOR_HEALTH_PROFILES = new Proxy({}, {
  get(_, sectorId) {
    if (typeof sectorId !== 'string') return undefined;
    return getSectorHealthProfile(sectorId);
  },
  ownKeys() {
    return Object.values(SECTOR_DATA).map(d => d.name);
  },
  getOwnPropertyDescriptor(_, key) {
    return { enumerable: true, configurable: true, value: getSectorHealthProfile(key) };
  }
});

export const PREDEFINED_SECTORS = {
  'Sector-03': SECTOR_HEALTH_PROFILES['Sector-03'],
  'Sector-08': SECTOR_HEALTH_PROFILES['Sector-08'],
  'Sector-10': SECTOR_HEALTH_PROFILES['Sector-10'],
  'Sector-07': SECTOR_HEALTH_PROFILES['Sector-07'],
  'Sector-01': SECTOR_HEALTH_PROFILES['Sector-01']
};

export const plannerQueue = {
  items: [],

  add(item) {
    const sector = item?.sector || item?.name;
    const disease = item?.disease;
    if (!sector || !disease) return;

    const exists = this.items.find((queued) => queued.sector === sector && queued.disease === disease && !queued.consumed);
    if (!exists) {
      this.items.push({ ...item, sector, addedAt: new Date(), consumed: false });
      this.notify();
    }
  },

  getUnconsumed() {
    return this.items.filter((entry) => !entry.consumed);
  },

  markConsumed(sector) {
    const item = this.items.find((entry) => entry.sector === sector);
    if (item) item.consumed = true;
    this.notify();
  },

  listeners: [],
  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== fn);
    };
  },
  notify() {
    this.listeners.forEach((fn) => fn([...this.items]));
  }
};

export const mapSectorInterventions = (sectorName) => {
  const sector = getSectorDataByName(sectorName);
  return (sector?.interventions || []).map((entry) => ({
    id: slugInterventionId(toSectorKey(sector.name), entry.name),
    name: entry.name,
    description: entry.description,
    tag: entry.tag,
    hriReduction: entry.hriReduction || 0,
    caseReductionPct: entry.caseReductionPct || 0,
    expectedHealthImpact: entry.hriReduction ? `Projected HRI reduction: ${sector.hri} → ~${Math.round(sector.hri - entry.hriReduction)}` : sector.expectedImpact?.description,
    executionSteps: entry.executionSteps || [entry.description],
    riskDrivers: sector.primaryRiskDrivers || [],
    effort: entry.effort || 'Moderate',
    costCategory: entry.costCategory || 'Municipal'
  }));
};
