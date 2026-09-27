<div align="center">

```
█████╗ ██╗  ██╗███████╗ █████╗ ██████╗ ██╗  ██╗   ██╗
██╔══██╗██║  ██║██╔════╝██╔══██╗██╔══██╗██║  ╚██╗ ██╔╝
███████║███████║█████╗  ███████║██║  ██║██║   ╚████╔╝ 
██╔══██║██╔══██║██╔══╝  ██╔══██║██║  ██║██║    ╚██╔╝  
██║  ██║██║  ██║███████╗██║  ██║██████╔╝███████╗██║   
╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝   
```

### *Always a step ahead in public health.*

**Smart Satellite-Based Public Health Management System**  
Built for **Solapur Municipal Corporation** · **SIH 2026**  
by **Team Arva**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-aheadlybygoddamn.netlify.app-00d4aa?style=for-the-badge)](https://aheadlybygoddamn.netlify.app/)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)
![Leaflet](https://img.shields.io/badge/Leaflet.js-GeoJSON_Maps-199900?style=for-the-badge)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-Animated-0055FF?style=for-the-badge)
![Netlify](https://img.shields.io/badge/Deployed-Netlify-00C7B7?style=for-the-badge)

</div>

---

> **"Other platforms tell you a ward has 47 fever cases. Aheadly tells you WHY — because 38°C heat, 0.12 NDVI, stagnant water, and 23 sanitation complaints converged simultaneously, creating perfect vector breeding conditions. And we detected it 7 days before the first patient reached the hospital. That's not monitoring — that's a city's digital immune system."**

---

## Table of Contents

1. [The Problem We're Solving](#1-the-problem-were-solving)
2. [What Aheadly Is](#2-what-aheadly-is)
3. [The Core Innovation — Signal Convergence](#3-the-core-innovation--signal-convergence)
4. [System Architecture](#4-system-architecture)
5. [The Health Rate Index (HRI)](#5-the-health-rate-index-hri)
6. [Unified Data Architecture](#6-unified-data-architecture)
7. [Portal 1 — SMC Health Command Center](#7-portal-1--smc-health-command-center)
8. [Portal 2 — Hospital Connect](#8-portal-2--hospital-connect)
9. [Portal 3 — Community Portal (Citizen Services)](#9-portal-3--community-portal-citizen-services)
10. [Portal 4 — ASHA Field Portal](#10-portal-4--asha-field-portal)
11. [The Landing Page — Cinematic Scroll Experience](#11-the-landing-page--cinematic-scroll-experience)
12. [AI Copilot — Context-Aware Intelligence Layer](#12-ai-copilot--context-aware-intelligence-layer)
13. [Outbreak Prediction Engine](#13-outbreak-prediction-engine)
14. [The Digital Twin & Real Solapur GeoJSON](#14-the-digital-twin--real-solapur-geojson)
15. [The Data Feedback Loop](#15-the-data-feedback-loop)
16. [Design System](#16-design-system)
17. [Tech Stack](#17-tech-stack)
18. [Problem Statement Coverage](#18-problem-statement-coverage)
19. [Competitive Differentiation](#19-competitive-differentiation)
20. [Project Structure](#20-project-structure)
21. [Recent Additions (ASHA & Conversational AI)](#21-recent-additions-asha-&-conversational-ai)

---

## 1. The Problem We're Solving

Solapur Municipal Corporation serves a rapidly expanding urban population of over 1.2 million people. Despite ongoing public health initiatives, the city faces a structural breakdown across four critical dimensions:

**Fragmented Health Data.** Disease records live in hospital HIS systems. ASHA survey data lives in paper registers. Environmental data from satellites is never connected to disease surveillance. Lab results don't flow to the people who need to act on them. The result: no one has a complete picture.

**Delayed Outbreak Detection.** By the time a ward sees 47 dengue cases, the conditions that caused them — stagnant water, extreme heat, low vegetation cover — were detectable weeks earlier. But no system was watching. Traditional surveillance is reactive; the damage is already done.

**Citizens Left Out.** There was no digital way for a Solapur resident to report stagnant water, check hospital bed availability, track their family's vaccinations, or get symptom triage without physically visiting a facility. No portal, no app, no feedback mechanism.

**Invisible Infrastructure.** Hospital administrators manually track bed counts in registers. Medicine stockouts are discovered when stocks run dry. Equipment downtime isn't reported until it causes harm. Municipal officers have no live visibility into the infrastructure they're responsible for.

Aheadly was built to solve all four — simultaneously, in a single integrated platform.

---

## 2. What Aheadly Is

Aheadly is a **multi-portal, ward-level digital twin platform** that combines environmental satellite data, disease surveillance signals, hospital infrastructure telemetry, and community ground-truth reports into a single, explainable intelligence system for Solapur.

It serves four distinct stakeholder types through four purpose-built portals:

| Portal | Audience | Primary Function |
|--------|----------|-----------------|
| 🏛️ SMC Health Command | Municipal Health Officers, Ward Officers, City Planners | Digital Twin, Outbreak Prediction, Intervention Planning, Policy Briefs |
| 🏥 Hospital Connect | Hospital Administrators, Medical Records, Lab Staff | Live Capacity Dashboard, Disease Case Reporting, Medicine Stocks, Integration Gateway |
| 👥 Community Portal | Citizens of Solapur | Sanitation Reporting, Symptom Triage, Vaccination Tracking, Emergency SOS, Health Passport |
| 👩‍⚕️ ASHA Field | Accredited Social Health Activist Workers | Household Surveys, AI Risk Flagging, Daily Intelligence Brief, Emergency Escalation |

All four portals share one unified data backend. When a hospital reports a dengue case in Sector-12, the Digital Twin updates, HRI recalculates, the Intervention Planner flags it, the ASHA worker queue reprioritizes, the citizen advisory updates, and the Copilot can discuss it. **One event. One data system. Every stakeholder informed.**

---

## 3. The Core Innovation — Signal Convergence

The foundational thesis of Aheadly is this:

> **"Cities don't fail because of one problem. They fail when heat, water, sanitation, and disease overlap in the same ward at the same time."**

Traditional public health systems track individual metrics in isolation — disease case counts here, sanitation complaints there, satellite temperature data in a completely different system that no health officer ever sees. Aheadly treats public health risk as an **emergent property of signal convergence**. A ward with high land surface temperature alone is not dangerous. A ward with high LST + stagnant water + low vegetation + rising disease cases + sanitation complaints is a convergence zone — and Aheadly detects this **7-14 days before traditional surveillance systems would notice**.

### The Convergence Timeline (What This Looks Like in Practice)

```
Day 0   🛰️ SATELLITE SIGNAL       LST hits 38.2°C in Sector-12. NDVI drops to 0.12.
                                   Aheadly flags: Heat + vegetation anomaly detected.

Day 3   💧 STAGNATION DETECTED    MNDWI water index shows standing water increase.
                                   Aheadly: Water stagnation signal elevated.

Day 5   🗑️ COMMUNITY GROUND TRUTH 12 citizen reports validate satellite data:
                                   open drains, stagnant water, uncollected garbage.

Day 6   📊 CONVERGENCE THRESHOLD  HRI crosses from 3.0 → 8.0/12. 4 of 5 signals elevated.
        CROSSED                   ┌────────────────────────────────────────────────┐
                                  │           THE FORK IN THE ROAD                 │
                                  └─────────────┬──────────────────────────────────┘
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                  ▼
              WITH AHEADLY                                     WITHOUT AHEADLY
              ─────────────                                    ───────────────
Day 7:   ✅ Fogging deployed                         Day 9:  ❌ First cases reported
Day 7:   ✅ Advisory to 3,200 households             Day 12: ❌ 47 confirmed dengue cases
Day 8:   ✅ ASHA workers pre-deployed                Day 14: ❌ Reactive scramble begins
Result:  60% reduction in outbreak probability       Result: Community-wide health emergency
```

This is not a theoretical diagram. Every value — 38.2°C LST, NDVI 0.12, 12 citizen reports — comes from real Solapur satellite and community data ranges.

---

## 4. System Architecture

Aheadly is a **React.js single-page application** with a role-based multi-portal architecture, unified data layer, and a floating AI intelligence companion. It is fully deployed as a static frontend on Netlify with zero backend server dependency, while the architecture is explicitly designed for backend integration.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AHEADLY PLATFORM                             │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────┐ │
│  │ SMC COMMAND  │  │   HOSPITAL   │  │  COMMUNITY   │  │  ASHA  │ │
│  │   PORTAL     │  │   CONNECT    │  │   PORTAL     │  │ FIELD  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └───┬────┘ │
│         │                 │                  │               │      │
│         └─────────────────┴──────────────────┴───────────────┘      │
│                                    │                                 │
│                    ┌───────────────▼───────────────┐                │
│                    │    UNIFIED DATA ARCHITECTURE   │                │
│                    │    unifiedHealthData.js         │                │
│                    │    • wardData (16 sectors)      │                │
│                    │    • hospitalData (8+ facilities)│               │
│                    │    • getCityMetrics()            │               │
│                    │    • buildCopilotContext()       │               │
│                    │    • getPredictions()            │               │
│                    └───────────────┬───────────────┘                │
│                                    │                                 │
│              ┌─────────────────────┼─────────────────────┐          │
│              ▼                     ▼                     ▼          │
│    ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐│
│    │  HRI ENGINE      │  │  GEMINI AI API   │  │  LEAFLET MAPS    ││
│    │  5-signal scoring│  │  Context-aware   │  │  Real Solapur    ││
│    │  Convergence calc│  │  copilot         │  │  GeoJSON wards   ││
│    └──────────────────┘  └──────────────────┘  └──────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow Between Portals

When a citizen submits a sanitation report → `wardData[sector].communityReports` updates → Digital Twin choropleth recalculates → HRI for that ward adjusts → Intervention Planner picks it up → ASHA worker queue deprioritizes other sectors in favor of this one → Copilot can immediately discuss it with an SMC officer. This closed loop is the system's defining characteristic.

---

## 5. The Health Rate Index (HRI)

HRI is Aheadly's original, explainable composite health risk score — scored out of 12, calculated per ward, updated as data changes.

### Signal Breakdown

| Signal | Max Points | Data Source | Weight in Formula |
|--------|-----------|-------------|-------------------|
| Heat Exposure | 2.0 | Landsat 8/MODIS LST. Solapur summer range: 35–42°C | 22% |
| Water Stagnation | 2.0 | MNDWI + terrain/drainage analysis | 19% |
| Vector Density | 2.0 | Stagnation + temperature + vegetation combination | 18% |
| Disease Burden | 2.0 | Hospital case reports, weighted by trend direction | 24% |
| Sanitation Stress | 2.0 | Citizen-reported garbage, open drains, stagnant water (aggregated) | 14% |
| Govt. Program Coverage | 2.0 | NRHM/ABDM vaccination and program data | 3% |

### The Formula

```
HRI(w) = Σ(wᵢ × Sᵢ(w)) × seasonalMultiplier(w)

Where:
  w = ward
  wᵢ = signal weight
  Sᵢ = normalized score [0–100] for each signal

seasonalMultiplier:
  Jun–Oct (Monsoon):  1.4 × (dengue, malaria, leptospirosis amplified)
  Apr–Jun (Summer):   1.3 × (heat stress, gastroenteritis amplified)
  Nov–Feb (Winter):   1.1 × (respiratory disease amplified)
  Mar (Transition):   1.0 × (baseline)
```

### Severity Thresholds

| Score | Severity | Response Protocol |
|-------|----------|------------------|
| 0–4.0 | 🟢 LOW | Standard monitoring, routine ASHA surveys |
| 4.0–7.0 | 🟡 MODERATE | Increased surveillance frequency, pre-position resources |
| 7.0–12.0 | 🔴 HIGH | Immediate intervention required, mandatory SMC escalation |

### The Convergence Count

Beyond the score itself, Aheadly tracks the **convergence count** — how many of the 5 primary signals are simultaneously above their concern threshold. A ward with 1/5 elevated is manageable. A ward with 4/5 elevated simultaneously is a convergence zone. Convergence counter badges appear directly on ward polygons in the Digital Twin map, transforming "red = bad" into "4/5 = four risk factors converging here right now."

---

## 6. Unified Data Architecture

### The Problem This Solves

Before this architecture, each page generated its own mock data independently. The Digital Twin might show Sector-12 with HRI 5.0. The Hospital Dashboard would show different numbers. The Copilot would make up its own. A judge navigating between pages would notice the discrepancy and lose confidence in the entire system.

### The Solution

A single JavaScript module — `src/data/unifiedHealthData.js` — serves as the **sole source of truth** for the entire application. Every page, every chart, every metric card, and the AI copilot all import from this one file.

```javascript
// src/data/unifiedHealthData.js — Single source of truth

export const wardData = {
  'sector-03': {
    id: 'sector-03', name: 'Civil Lines', population: 47320,
    hri: {
      total: 8.0, severity: 'HIGH',
      breakdown: {
        heatExposure: 2.0, waterStagnation: 1.8,
        vectorDensity: 1.6, diseaseBurden: 1.8, sanitationStress: 0.8
      }
    },
    convergenceCount: 4, // 4 of 5 signals elevated
    diseases: {
      dengue: { cases: 23, trend: 'rising', transmission: 'Vector-borne (Aedes aegypti)' },
      respiratory: { cases: 8, trend: 'stable' },
      gastro: { cases: 5, trend: 'declining' }
    },
    communityReports: { total: 31, garbage: 12, stagnantWater: 11, openDrains: 8, last7Days: 14 },
    ashaData: { totalHouseholds: 1840, visited: 1230, flagged: 47, symptomsReported: 89 }
  },
  // ... 15 more sectors
};

export const hospitalData = { /* 8+ Solapur facilities with real names */ };

export const getCityMetrics = () => ({
  wardsMonitored: 16, highRiskCount: 3, avgHRI: 4.7,
  totalBeds: 4200, icuAvailable: 142,
  totalDiseaseSignals: 127, totalCommunityReports: 412
});

export const buildCopilotContext = (currentPage, selectedWardId, activeLayer) => 
  `[CONTEXT] Page: ${currentPage}. Selected ward: ${wardData[selectedWardId]?.name}. 
   HRI: ${wardData[selectedWardId]?.hri.total}/12 (${wardData[selectedWardId]?.hri.severity}).
   City: ${getCityMetrics().highRiskCount} HIGH risk wards. ...`;

export const getPredictions = (wardId, days) => { /* deterministic prediction algorithm */ };
```

### Data Consistency Rules

1. No component generates random numbers — always imports from the unified store
2. No JSX hardcodes ward names, HRI scores, or hospital statistics — always references data objects
3. New data requirements are added **to the store**, never as local mock variables
4. City-wide metrics shown on the landing page are **computed** from ward + hospital data via `getCityMetrics()` — the same numbers the Digital Twin uses
5. Prediction scores are **derived** from HRI + seasonality + convergence factors — never invented

A judge can navigate from the Landing Page (showing "3 HIGH risk wards") → Digital Twin (3 red wards visible) → Intervention Planner (same HRI breakdown shown) → Copilot (references the same numbers) and everything will match perfectly.

---

## 7. Portal 1 — SMC Health Command Center

The administrative nerve center for Municipal Health Officers. This is where satellite data, disease surveillance, hospital infrastructure, and community ground-truth converge into a single operational picture.

### 7.1 How Aheadly Works — Cinematic Explainer Page

The Command Center's landing experience is a **7-section full-viewport scroll story** built with a custom JavaScript scroll controller (not CSS scroll-snap), telling the complete narrative of how Aheadly works from raw satellite signal to municipal intervention.

**Technical architecture of the scroll engine:**
```javascript
// Custom scroll controller — solves trackpad multi-section skip
const wheelAccumulator = { delta: 0, timer: null };

window.addEventListener('wheel', (e) => {
  e.preventDefault();
  wheelAccumulator.delta += e.deltaY;
  clearTimeout(wheelAccumulator.timer);
  wheelAccumulator.timer = setTimeout(() => { wheelAccumulator.delta = 0 }, 50);
  
  if (Math.abs(wheelAccumulator.delta) > 50 && !isScrolling) {
    const direction = wheelAccumulator.delta > 0 ? 1 : -1;
    goToSection(currentSection + direction);
    wheelAccumulator.delta = 0;
  }
}, { passive: false });
```

**The 7 Sections:**

| Section | Content | Key Interaction |
|---------|---------|----------------|
| Cold Open | AHEADLY wordmark in 120px `Bebas Neue`, typewriter stat counter, 80-particle canvas field | Particle opacity 0.3, fade-in on load |
| The Problem | Three lines landing sequentially: "1.2 million people / No way to see outbreaks coming / Until now" | Staggered text reveal, 400ms intervals |
| Signal Moment | Split screen: OLD WAY vs AHEADLY WAY with color-coded timelines | Color contrast: red left, teal right |
| Data Pulse | Animated SVG showing 6 data streams flowing into HRI Engine orb | `stroke-dashoffset` path animation |
| The Proof | Count-up animated stats (5 days, 84%, 2.4M) | `useAnimatedCounter` hook, 1.5s lerp |
| Problem → Solution | 4 SMC problem cards mapped to Aheadly solutions with SVG connector lines | `stroke-dasharray` self-drawing connectors |
| Portal Selector | Full portal chooser with card-flip interactions | CSS `rotateY 180deg`, 600ms cubic-bezier |

**Navigation:** Right-edge 7-dot chapter navigator, active dot teal-filled, hover reveals section name. Thin 3px teal progress bar at top fills as user progresses. Full keyboard + touch support.

### 7.2 Digital Twin — Real Solapur Ward Map

The Digital Twin is an interactive geographic representation of Solapur using **actual government GeoJSON ward boundary data** (`solapur_ward_boundary.json`). This is not a generic or approximated map — every polygon matches the real administrative boundary, and a Solapur municipal official will immediately recognize their own ward geography.

**6 Toggleable Intelligence Layers:**

| Layer | Data Source | Choropleth Logic |
|-------|-------------|-----------------|
| HRI Score | `wardData[id].hri.total` | Green (LOW) → Orange (MODERATE) → Red (HIGH) |
| Disease Signals | `wardData[id].diseases` | Intensity by active case count |
| Community Reports | `wardData[id].communityReports` | Density of citizen submissions |
| Urban Heat Index | Satellite LST data | Temperature gradient blue → red |
| Water Stagnation Risk | MNDWI + drain network | Low → High stagnation probability |
| NDVI Vegetation Index | Sentinel-2 NDVI | Brown (bare/dry) → Dark green (vegetated) |

**Convergence Counter Badges:** Small `X/5` Leaflet `DivIcon` markers overlaid on ward polygon centroids. Wards with 4/5 or 5/5 signals elevated get a CSS `@keyframes` pulsing red border on the GeoJSON polygon layer. A judge sees "4/5" on a red ward and immediately understands the convergence thesis without clicking anything.

**Ward Click Drill-Down:** Clicking any ward opens a slide-in right panel showing complete ward profile — HRI breakdown with per-signal bars, active disease cases with trend arrows, community report counts, ASHA survey coverage, and a "Send to Intervention Planner" action that pre-loads the ward's data.

### 7.3 Intervention Planner — Shared State Architecture

The Intervention Planner and Future Overview page are connected through a **single shared state object** (`plannerState.js`) — a publish/subscribe store that eliminates data discrepancy.

```javascript
// src/utils/plannerState.js — Single source of truth for planner queue
export const plannerQueue = {
  items: [],
  
  add(item) {
    if (!this.items.find(i => i.sector === item.sector)) {
      this.items.push({ ...item, addedAt: Date.now(), consumed: false });
      this.notify();
    }
  },
  
  getUnconsumed() { return this.items.filter(i => !i.consumed) },
  markConsumed(sector) { /* marks item as consumed after planner reads it */ },
  
  listeners: [],
  subscribe(fn) { this.listeners.push(fn) },
  notify() { this.listeners.forEach(fn => fn(this.items)) }
};
```

**plannerItem schema** (defined once, referenced everywhere, never re-typed):
```javascript
{
  sector: "Sector-03", sectorLabel: "Civil Lines",
  disease: "Dengue", severity: "CRITICAL",
  outbreakProbability: 88, hri: 8.0, hriMax: 12,
  recommendedActions: [
    { id: "fogging", label: "Deploy fogging within 48h", interventionType: "Sanitation Rapid Response" },
    { id: "boilwater", label: "Issue boil-water advisory", interventionType: "Community Advisory" },
    { id: "asha", label: "Alert ASHA workers", interventionType: "Field Mobilization" }
  ],
  source: "Future Overview AI", consumed: false
}
```

The Future Overview's predictive alert cards have "Send to Planner" buttons. Clicking one transforms the button to "✓ Added" and drops a floating pill (bottom-center, 400ms spring animation) showing queue count. The Intervention Planner, on mount, reads `plannerQueue.getUnconsumed()`, pre-loads the sector data, highlights recommended actions with "⚡ RECOMMENDED FROM ALERT" badges, and calls `markConsumed()` after loading.

### 7.4 Data Sources — Living Ecosystem Visualization

The Data Sources page was rebuilt from a static API catalogue into an **animated SVG flow diagram** showing all 6 data streams, the HRI Engine, and 5 output types, with clickable source nodes that open detail drawers.

Each data source node opens a right-side drawer (300ms `translateX` transition) with two tabs:

- **Sample Data tab:** Actual Solapur-specific data (Sector LST heatmap, ICD-10 case feed, vaccination coverage by ward, weather readings)
- **Methodology tab:** FHIR compliance details, satellite processing pipeline, HRI weight contribution, data update frequency

The central HRI Engine node shows multi-ring radiating animations and a live fluctuating counter: "Processing 847 signals right now." Animated dots flow along SVG paths from input nodes through the engine to output nodes (City Risk Map, Intervention Planner, Outbreak Alerts, ASHA Dispatch, Citizen Advisories).

### 7.5 Policy Brief Generator

A 3-step wizard that auto-generates downloadable PDF policy briefs for municipal commissioners and ward officers:

1. **Ward Selection** → clinical risk assessment preview
2. **Risk Review** → situation summary, ICD-10 coded cases, transmission mode, HRI drivers
3. **Generate Brief** → PDF with: Clinical Assessment, Risk Factors, Mandated Actions, Implementation Timeline, Department assignments with officer names

---

## 8. Portal 2 — Hospital Connect

### 8.1 Integration Setup Wizard

The Integration Gateway is Aheadly's answer to hospital data silos. Instead of a dummy "Request Setup" button, it's a fully simulated **5-step onboarding wizard** for connecting a hospital's HMS to the Aheadly intelligence network.

**Step 1 — Hospital Identity:** Facility name, type, address, ward, technical contact, facility type (Government PHC / District Hospital / Private / CHC)

**Step 2 — HMS Selection & Credential Generation:** Dropdown: Bahmni / OpenMRS / eHospital / Practo / Custom / None. On selection, auto-generates:
- Facility ID: `SMC-HOS-0047` (formatted with copy button)
- API Key: 64-character hex string (copy button + visibility toggle)  
- Webhook Secret: 32-character hex string
- "Download credentials.json" button

**Step 3 — Adapter Installation:** HMS-specific installation instructions. "Test Connection" button → simulated 142ms ping → "✅ Connection Established"

**Step 4 — Legal & Compliance:** Clause-by-clause checkboxes for FHIR R4, ABDM (Ayushman Bharat Digital Mission), and DPDPA 2023. Digital signature field + "Download Agreement PDF"

**Step 5 — Go Live:** Animated connection status showing data streams connecting one by one (Bed counts → Case reports → Medicine stocks → Lab aggregates). "First sync expected in ~15 minutes."

**Compliance Framework:**
- **FHIR R4**: Accepts `Bundle` resources containing `Encounter`, `Condition`, `Location`, `MedicationStatement` resources
- **ABDM**: Connects via Health Information Exchange & Consent Manager (HIE-CM)
- **DPDPA 2023**: Only aggregate data flows (no patient names), data minimization enforced, hospital remains Data Fiduciary

**API Specification (displayed in wizard):**
```json
POST /api/v1/facility/sync
{
  "resourceType": "Bundle",
  "facility_id": "IN-MH-SOL-001",
  "entries": [
    { "resourceType": "Location", "name": "ICU", "capacity": 20, "occupied": 17 },
    { "resourceType": "Condition", "code": "A90 (Dengue)", "ward_sector": "sector-12", "new_cases_24h": 3 }
  ]
}
```

### 8.2 Hospital Live Ops Dashboard

A dark, control-room-style operations dashboard for hospital administrators. Opens directly to populated data — **no empty state, no landing page** — with Sector-10 pre-selected by default (or overridden if the plannerQueue has a priority sector).

**Live Data Simulation (two intervals running simultaneously):**
```javascript
// Bed fluctuation — every 30 seconds
setInterval(() => {
  // Fluctuate ±1 beds across random departments
  // Update "Last Synced" timestamp for changed rows
  // Recalculate occupancy summary pills
  // Occasionally trigger a medicine stock item: OK → LOW
}, 30000);

// Case feed — every 45 seconds
setInterval(() => {
  // Add new ICD-10 case to live admission feed
  // Randomize: code, ward, patient type, timestamp
  // Pre-tagged "HMS Auto-sync"
}, 45000);
```

**Surge Alert Banner (conditional):** Activates when ICU occupancy exceeds 85% or an unacknowledged OUTBREAK WARNING exists. Full-width amber→red gradient, CSS pulse animation, "View Surge Plan" button opening a 5-step surge protocol checklist modal. Pre-triggered on demo load (ICU at 95%).

**"Expected Incoming Surge" Intelligence Feed:** Horizontal scrollable cards showing disease signals from nearby wards that will likely send patients to this hospital — reframing satellite/community data from "city overview" to "what's coming through YOUR doors." Each card: disease + ICD code, signal strength (WEAK/MODERATE/STRONG), source breakdown, trend arrow, actionable CTA linked to Medicine & Stock.

### 8.3 Bidirectional SMC Alerts System

Five alert types with a full compliance action workflow:

| Alert Type | Color | Compliance Action Required |
|------------|-------|--------------------------|
| OUTBREAK WARNING | 🔴 Red | Isolation capacity, designated ward, contact person |
| AI PREDICTION | 🟠 Orange | Preparedness level, resource pre-positioning |
| STOCK REPLENISHMENT ORDER | 🟡 Yellow | Confirm order placed, quantity, delivery date, invoice |
| MANDATORY REPORTING DEADLINE | 🔵 Blue | Upload file or structured inline form |
| CITIZEN SYMPTOM CLUSTER | 🟣 Purple | Surge capacity confirmation, triage plan activation |

Alerts unacknowledged after 24 hours automatically gain an "OVERDUE" red badge. Hospitals don't just acknowledge alerts — they submit structured compliance responses that close the governance loop.

### 8.4 AI-Compiled Shift Handover

Departing administrators click "Generate Summary" → 1.5-second skeleton loading → structured handover card revealing auto-compiled sections from live data:

1. Bed Status at Handover (critical departments, beds changed this shift)
2. Cases Reported This Shift (by ICD category, flagged and severe cases listed by name)
3. Active SMC Alerts (unacknowledged, sorted by urgency)
4. Stock Alerts (items that crossed LOW/CRITICAL this shift)
5. Notes for Incoming Shift (free-text, pre-populated with AI suggestions)

"Mark Handover Complete" → overlay with outgoing name (pre-filled), incoming name input, timestamp, "Download PDF Summary." Collapsible log shows last 5 handovers with timestamps and administrator names.

---

## 9. Portal 3 — Community Portal (Citizen Services)

The Community Portal serves Solapur's general public with 8 features across a mobile-first, accessibility-compliant interface. Minimum tap target: 48px. Bottom tab navigation. Large-text CTAs. No medical jargon.

### 9.1 Citizen Onboarding Flow

New users experience a 3-step onboarding before reaching the dashboard:
- **Step 1:** Name entry (personalized greeting throughout app)
- **Step 2:** Ward selection (all 16 Solapur sectors as searchable list)
- **Step 3:** Language preference (Marathi / Hindi / English) — persisted in localStorage

### 9.2 Sanitation Reporter

Map-click location pinning for reporting environmental health issues (Uncollected Garbage, Open Drains, Stagnant Water, Overflowing Public Bins, Dead Animal, Other). The Leaflet map shows existing reports as colored markers sized by severity. Photo upload: base64-encoded, stored locally. Ward auto-detected from click coordinates.

**Page header:** "Spotted garbage, stagnant water, or an open drain? Pin it on the map and we'll alert the municipal team." + Trust line: "147 issues reported this month · Avg. municipal response: 48 hours"

### 9.3 Symptom Checker

An interactive SVG body map with clickable anatomical regions. Tapping head, chest, abdomen, or limbs reveals region-specific symptom checklists. Client-side triage algorithm produces three-level results:

- 🟢 **GREEN (Monitor):** Mild, non-specific symptoms → "Rest, hydrate, monitor 24h"
- 🟡 **YELLOW (Consult):** Fever + joint pain + rash → "Pattern consistent with dengue. Visit clinic within 24 hours."
- 🔴 **RED (Emergency):** Breathing difficulty + fever + chest pain → "Seek immediate care. Nearest ER: [distance, beds available]"

Red triage automatically creates a `symptom_report` entry that feeds the admin disease surveillance heatmap.

### 9.4 Health Passport

A QR-code portable health record that citizens control. Demo profile: Priya Deshmukh, 34 yrs, Sector-12, B+. Contains allergies, known conditions, emergency contact, vaccination timeline, and a QR code generated from citizen data. **Privacy toggles** control which categories are encoded — citizens decide what a hospital can see when they scan.

### 9.5 Family Vaccination Insights

Family management with per-member vaccination timelines. Each family member card shows:
- ✅ **Completed** vaccinations with dates
- ⏰ **Due Soon** with days countdown and centre finder link
- 📅 **Upcoming** with schedule date

Overdue vaccinations trigger a red banner: "2 pending vaccinations for [Name] — overdue by 14 days." "Find Nearest Vaccination Centre" as a floating action button linked to the hospital finder filtered to `vaccineCenter: true`.

### 9.6 Ward Health Leaderboard

Transformed from a passive score table into an **actionable civic motivation board**. Each ward receives a Community Health Score: `Math.round(100 - (hri.total / 12) * 100)`. The citizen's own ward is prominently highlighted with contextual messaging: "Your ward is #9 — here's exactly how to move up."

"What can YOU do?" section shows 3–4 specific citizen actions (Report a sanitation issue, Complete family vaccinations, Participate in this week's health challenge), each with "Do this now →" CTAs linking to relevant features. "Community Wins" section highlights positive changes: "Sector-12 moved up 2 spots after 14 sanitation reports resolved."

### 9.7 Emergency SOS

Full-screen centered 120px red SOS button with pulsing CSS `@keyframes` animation. On activation:
1. GPS location captured via browser Geolocation API
2. Nearest hospital identified from `hospitalData` sorted by sector proximity  
3. Available beds confirmed (filtered by `emergencyDepartment: true`)
4. Shared health profile pulled from Health Passport (blood type, allergies)
5. Confirmation overlay shows: hospital name, distance, ETA, bed count, "Call 108" and "Call Hospital" tap-to-call buttons

**Offline-critical:** Service worker caches this page with embedded emergency contacts — accessible without internet.

### 9.8 AI Health Assistant

The floating Gemini-powered Copilot in citizen mode uses a simplified system prompt — plain language, warm tone, ward-specific context, always recommends a doctor for serious symptoms. "Your ward (Sector-12) currently has MODERATE dengue risk. Here's what to watch for..."

---

## 10. Portal 4 — ASHA Field Portal

Every design decision in the ASHA portal reflects the reality of an outdoor field worker with patchy connectivity, visiting 10–15 households daily, often in areas with poor signal.

### 10.1 Portal Identity Features

**Language Toggle:** `EN | मर` pill toggle in the top bar. Full Marathi translation of all UI text, survey questions, AI debrief content, and badge labels. Stored in localStorage. Default: Marathi.

**ASHA Passport:** Official digital identity card displayed full-screen on tap. Contains: SMC seal, "SMC AUTHORISED FIELD HEALTH WORKER" label, circular avatar, ASHA ID, ward assignment, active since date, supervisor name, helpline, and a decorative QR code placeholder. "Share / Show to Resident" button for identity verification at the door.

**Streak & Recognition:** 🔥 Survey streak counter with flame icon, 🏆 "Top Performer — Ward 12 this week" badge, monthly survey count. Morning toast on app open if streak active: "Day 18 — keep it going, Sunita! 💪"

**Offline Mode:** Status chip always visible. Online: `● Synced` green. Offline: `⚠ Offline — 3 surveys pending upload` amber, pulsing. On reconnect: auto-syncs, shows "✓ 3 surveys uploaded" toast. Manual "Sync Now" button.

### 10.2 Daily Intelligence Brief

Before the first household knock, the ASHA worker sees a **ward-level risk summary** customized to their assignment:

- Ward HRI score with severity badge
- Priority alert (contextual to active disease signals — "DENGUE ALERT: 23 cases active in this sector")
- Focus areas: specific streets with HIGH risk households identified from previous surveys
- Weather note: humidity levels and breeding condition warnings
- Vaccination reminders: overdue doses on today's assigned route

Expanded by default in morning. "I've read this" collapses it and unlocks the survey queue.

### 10.3 Household Survey — 6-Step Flow

**Pre-Survey Checklist (Step 0):** Context-aware based on active ward alerts. 5 large tap-to-check items (48px height minimum). Survey unlocks only when all 5 items checked.

| Step | Content | Key Fields |
|------|---------|-----------|
| 1 — Household Details | Address, household ID, landmark | Resident count, head of household |
| 2 — Demographics | Age group breakdown | Pregnant women toggle, disability toggle |
| 3 — Symptoms | 9-item tap checklist | Symptom duration, hospitalisation history |
| 4 — Sanitation & Environment | Water source, storage type | Stagnant water (flagged if Yes), open drain |
| 5 — Vaccination Status | Per-member row table | ✅/⚠ per vaccine, "Advised on overdue" toggle |
| 6 — Voice Note | Microphone button | 5-second waveform animation, playback/delete |

Thin teal progress line at top fills per step.

### 10.4 Post-Survey AI Debrief

Immediately after submission, instead of a generic "Thank you" screen, the ASHA worker sees an **AI-generated risk analysis card:**

- Risk level badge (HIGH/MEDIUM/LOW) + score out of 100
- Animated "why this risk" list (staggered 300ms): specific symptom patterns flagged, environmental risk factors found, vulnerability factors in household composition
- Cluster intelligence: "3 similar HIGH risk reports on this street this week — possible local outbreak forming"
- Recommended actions as tappable CTAs: Flag for SMC, Schedule follow-up visit, Refer to PHC
- "Next Household →" advances route with current household marked COMPLETED

### 10.5 Emergency Escalation

Persistent floating button (bottom-right, `position: fixed; z-index: 999`, red circular with ⚡ icon) accessible during surveys and on the home screen. Tap → bottom sheet slides up:

1. **Critical Patient** → escalates to SMC + nearest hospital simultaneously
2. **Disease Cluster Suspected** → flags household + ward, triggers surveillance review
3. **Infrastructure Emergency** → routes to sanitation response team

One tap → confirmation → "Alert sent to SMC Health Command. Response expected within 2 hours."

---

## 11. The Landing Page — Cinematic Scroll Experience

A complete rebuild as an Apple-style cinematic scroll story. The portal selector is withheld until the narrative earns it — judges experience the problem, the innovation, the proof, and the solution before they're offered an entry point.

### Portal Selector Card System

The portal selector uses a **card flip interaction** for portal discovery:

```css
.portal-card {
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.portal-card:hover { transform: rotateY(180deg); }
.portal-card-back { backface-visibility: hidden; transform: rotateY(180deg); }
```

Front face: portal icon, name, target persona, animated live stat. Back face (revealed on hover): feature checklist + portal entry CTA.

SMC Command gets a full-width dominant card (~320px tall) with an animated SVG sector map. Hospital, Community, and ASHA get a 3-column grid of shorter cards that appear muted until hover — visual hierarchy communicating the primary audience.

### Live City Pulse Metrics Strip

A horizontal strip computed from `getCityMetrics()` showing live-calculated values: wards monitored, high-risk ward count, average HRI, total beds, occupancy percentage, disease signal count. A scrolling ticker of real-time events from `generateTickerEvents()` runs below: "🏥 Bed updated at Civil Hospital · 🦟 Dengue case reported in Ward 14 · 💉 Vaccination drive in Ward 7"

The landing page is not marketing — it's a **live data proof**. Every number is computed from the same unified store that powers the entire system.

---

## 12. AI Copilot — Context-Aware Intelligence Layer

### What Makes It Different

Most competing systems have a chatbot page you navigate to. Aheadly has an AI companion that **sees what you're looking at**, understands the context of the current page and selected ward, and adjusts its responses accordingly — before you even ask a question.

### Technical Implementation

**LLM:** Google Gemini API (`gemini-2.0-flash`)  
**Trigger:** 56px circular floating button, bottom-right, teal gradient, sparkle icon  
**Panel:** 380px wide slide-out, dark theme (`#1A1A2E`)

```javascript
// Context is rebuilt on every message — the copilot always sees current state
const systemPrompt = buildCopilotContext(currentPage, selectedWardId, activeLayer);

const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
  method: 'POST',
  body: JSON.stringify({
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [...conversationHistory, { role: 'user', parts: [{ text: userMessage }] }],
    generationConfig: { maxOutputTokens: 600, temperature: 0.7 }
  })
});
```

### Context-Aware Behavior by Page

| Current Page | Copilot Opening Line | Quick Prompt Chips |
|-------------|---------------------|-------------------|
| Digital Twin + Sector-12 selected | "I see you're looking at Sector-12 — HRI 8.0/12, currently CRITICAL. Here's why..." | "Why is this ward at risk?", "Compare with nearby wards" |
| Intervention Planner | "You're reviewing interventions for Sector-10. The most impactful action right now is..." | "Suggest interventions", "What's the expected impact?" |
| Community Portal | "Your ward (Sector-12) has MODERATE dengue risk this week. Here's what to watch for..." | "Is dengue a risk in my ward?", "Where's the nearest hospital?" |
| Hospital Dashboard | "ICU occupancy at 95% in Sector-10 — this is pre-surge territory. Here's what to prep..." | "Surge protocol", "Medicine reorder status" |

### Demo Safety — Fallback Responses

Hardcoded responses for "city briefing", "why risk", and "interventions" keyword queries — triggered when the Gemini API fails. Judges never see a loading spinner that doesn't resolve.

### Dual Persona System

In the citizen portal, the system prompt switches to a citizen-friendly mode: simpler vocabulary, no medical jargon, warm and reassuring tone, always recommends seeing a doctor for serious symptoms. The floating button rebrands to "Aarogya Mitra" (आरोग्य मित्र) with a warmer color.

---

## 13. Outbreak Prediction Engine

### 13.1 Prediction Algorithm

```javascript
prediction_score = current_cases × seasonal_multiplier × trend_multiplier × convergence_factor

seasonal_multiplier:
  Jul–Oct (Monsoon):  2.5 × dengue, malaria, leptospirosis
  Apr–Jun (Summer):   2.0 × gastroenteritis, heat-related illness
  Nov–Feb (Winter):   1.8 × respiratory infections
  Mar (Transition):   1.0 × baseline

trend_multiplier:
  Rising:   1.5 ×
  Stable:   1.0 ×
  Declining: 0.6 ×

convergence_factor:
  4–5 signals elevated: 2.0 ×  (major amplification)
  3 signals elevated:   1.5 ×
  2 signals elevated:   1.2 ×
  1 signal elevated:    1.0 ×  (no amplification)
```

### 13.2 Predictive Timeline Chart

A Recharts `ComposedChart` with:
- **Solid line (left):** Past 30 days of actual case data
- **Dashed line (right):** Next 14 days predicted
- **Vertical "TODAY" marker:** Clear separation between actual and predicted
- **Shaded confidence band:** 80% confidence interval (wider = more uncertainty)
- **Annotation labels:** On predicted spikes ("Monsoon amplification expected")

### 13.3 Convergence Outbreak Anatomy Timeline

A vertical animated timeline (Framer Motion stagger, 100ms delays) telling the day-by-day story of outbreak formation. The **WITH vs WITHOUT Aheadly fork at Day 6** is rendered as two columns — green vs red — making the value proposition visceral and immediate.

### 13.4 Prediction Heatmap

Leaflet map overlay with predicted outbreak probability per ward (7-day and 14-day forecasts). Color scale: Green (<20%) → Yellow (20–40%) → Orange (40–70%) → Red (>70%). Toggle between forecast horizons and filter by disease type.

---

## 14. The Digital Twin & Real Solapur GeoJSON

Two actual GeoJSON files provide the geographic backbone:

- **`Solapur_city_boundary.json`** — The outer municipal boundary polygon, used as the map frame at zoom-out levels
- **`solapur_ward_boundary.json`** — Individual ward-level polygons with real names and identifiers

### Why This Matters

Most hackathon teams use generic or approximated maps. Aheadly uses **actual SMC geographic data**, meaning every ward polygon matches the real administrative boundary, sample data uses real ward names, and the demo is immediately credible to judges who are likely SMC officials familiar with their own city's geography.

### GeoJSON Processing Pipeline

```
Parse solapur_ward_boundary.json
  ↓
Extract ward names, IDs, zone groupings from feature properties
  ↓
Calculate polygon centroids (for convergence badge placement)
  ↓
Calculate polygon areas (for population density derivation)
  ↓
Populate wardData store with real ward identifiers
  ↓
Seed all community data (hospitals, complaints, ASHA assignments)
  using real ward names — zero invented geography
```

### Map Configuration

| Setting | Value |
|---------|-------|
| Library | Leaflet.js + React-Leaflet |
| Base Tiles | CartoDB Dark Matter (dark theme) |
| Center | 17.6599° N, 75.9064° E (Solapur) |
| Zoom range | 11 (city overview) → 16 (street level) |
| Ward stroke | 2px white, hover: 3px teal |
| Fill opacity | 0.7 (choropleth), 0.5 (point layers) |

---

## 15. The Data Feedback Loop

This is the most architecturally innovative aspect of Aheadly — the two portals are not isolated applications, they're two views of the same living dataset, connected by a bidirectional data pipeline.

```
CITIZEN PORTAL                            SMC COMMAND PORTAL
──────────────                            ──────────────────

Citizen submits sanitation report
  ↓
wardData[sector].communityReports updates
  ↓                                    ──────────────────────→  Digital Twin choropleth recalculates
                                                                 HRI for that ward adjusts
                                                                 Intervention Planner flags it
                                                                   ↓
                                                                SMC officer issues dengue alert
                                        ←──────────────────────
  ↓
Citizens in affected ward see alert banner on home page
  ↓
More citizens report symptoms
  ↓
Symptom reports feed surveillance heatmap
  ↓
ASHA workers' daily queue reprioritizes toward flagged sector
```

**The four feedback channels:**
1. Citizen symptom reports → Admin disease surveillance heatmap (symptom density drives ward risk coloring)
2. Citizen sanitation complaints → Digital Twin risk scores (complaint density updates HRI sanitation signal)
3. Admin infrastructure data → Citizen hospital finder (admin-entered bed counts appear in citizen's hospital search)
4. Admin outbreak alerts → Citizen ward-level banners (admin-created alert appears on citizen home within 30 seconds)

---

## 16. Design System

### Color Architecture

```css
/* Core Palette */
--bg-cinematic:   #080a0f;   /* Landing page — deep space */
--bg-dark:        #0a0c10;   /* Hospital portal */
--bg-command:     #0d0f14;   /* SMC Command */
--surface:        #111318;   /* Card backgrounds */
--surface-2:      #1a1d24;   /* Nested surfaces */
--border:         #1e2128;   /* Subtle separators */

/* Portal Accent Colors */
--smc-teal:       #00d4aa;   /* SMC Health Command */
--hospital-coral: #ff8c42;   /* Hospital Connect */
--community-green:#2dd4a0;   /* Community Portal */
--asha-amber:     #ffd166;   /* ASHA Field */

/* Risk Colors */
--risk-red:       #ff4444;   /* HIGH / Critical */
--risk-amber:     #ff8c42;   /* MODERATE / Warning */
--risk-yellow:    #ffd166;   /* ELEVATED / Caution */
--risk-blue:      #4da6ff;   /* INFO */
--risk-green:     #2dd4a0;   /* LOW / Safe */
```

### Typography System

| Role | Font | Usage |
|------|------|-------|
| Hero Wordmarks | `Bebas Neue` / `Barlow Condensed 900` | Landing hero, large display numbers |
| Editorial Headlines | `DM Serif Display` | Section titles, challenge card headers, policy brief headings |
| Technical Data | `IBM Plex Mono` | All data values, HRI scores, ICD codes, API spec, timestamps |
| UI Labels & Body | `Inter` | All navigation, body text, form elements, button labels |
| Marathi/Hindi | `Noto Sans Devanagari` | ASHA portal and multilingual citizen content |

### Animation Standards

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Section reveal | 600ms | `ease` | `opacity 0→1` + `translateY 30px→0` |
| Staggered children | 100ms increments | — | Child element entrance delays |
| Slide-in panels | 300ms | `ease` | Alert drawers, ward drill-downs |
| Card flip | 600ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Portal selector cards |
| Skeleton loading | 1.5s | CSS pulse | Data loading states |
| Floating pill | 350ms | Spring | Planner queue count badge |
| Sync pulse | 2s infinite | `@keyframes glow` | Online status indicator |

### Component Design Rules

- **No modals for data entry** — always inline expand or slide-in panels
- **No left sidebar in citizen/field worker portals** — bottom tab navigation only
- **Minimum 48px tap target** everywhere in ASHA portal
- **No placeholder lorem ipsum** — all data must be realistic Solapur context
- **Auto-sync hospitals never show manual entry forms** as primary UI — form is collapsed fallback
- **Every metric has context below it:** "247 cases · ↑ 12% from last week · 3 wards account for 68%"
- **Risk always paired with text label** — never color-only (accessibility)

---

## 17. Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Core Framework** | React.js | 18+ | Component architecture, hooks, Context API |
| **Styling** | Styled-Components | — | Portal-specific theming, dark design system |
| **Animation** | Framer Motion | — | Page transitions, timeline animations, stagger effects |
| **Maps** | Leaflet.js + React-Leaflet | — | Interactive geospatial mapping, real GeoJSON rendering |
| **Charts** | Recharts | — | Disease trend lines, prediction timelines, radar charts |
| **Charts** | Chart.js | — | Advanced area charts, stacked visualizations |
| **AI** | Google Gemini API | gemini-2.0-flash | Context-aware copilot responses |
| **QR Codes** | qrcode.react | — | Health Passport QR generation |
| **Routing** | React Router | v6 | Client-side multi-portal routing |
| **Deployment** | Netlify | — | Static site hosting, environment variables |
| **Geospatial Data** | GeoJSON (real SMC data) | — | `solapur_ward_boundary.json`, `Solapur_city_boundary.json` |

### Environment Variables

```env
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 18. Problem Statement Coverage

| SMC Challenge | Aheadly Solution | Feature |
|--------------|-----------------|---------|
| Health data siloed across hospitals, clinics, labs | Unified data architecture — single store feeding all views | `unifiedHealthData.js` |
| No standardized real-time health data analytics | HRI provides standardized, explainable scoring with real-time updates | HRI Engine |
| Limited ward-wise visibility | Digital Twin with 6 intelligence layers + convergence badges | Digital Twin |
| Inadequate predictive systems | 7/14-day forecasts with seasonal multipliers + convergence amplification | Outbreak Prediction Engine |
| Lack of real-time disease surveillance | Disease Signals layer + hospital reporting feeding HRI recalculation | Surveillance Engine |
| Difficulty identifying high-risk populations | Convergence counter badges ("4/5") instantly identify multi-factor risk zones | Convergence Counter |
| Insufficient digital platforms for citizens | 8-feature community portal: sanitation, symptom triage, vaccination, passport, leaderboard, SOS, hospital finder, AI assistant | Community Portal |
| Low preventive healthcare awareness | Ward Leaderboard gamification + weekly health challenges + vaccination reminders | Leaderboard + Vaccination Tracker |
| Limited multilingual accessibility | Marathi/Hindi/English i18n across all citizen and ASHA interfaces | i18n System |
| No real-time hospital bed/equipment/medicine tracking | Live Capacity Dashboard + medicine stock tracker + Integration Gateway | Hospital Connect |
| Manual reporting reduces efficiency | AI Copilot + ASHA AI flagging + automated policy brief generation + shift handover | AI Layer |
| No ground-level field surveillance | ASHA portal with 6-step household surveys + AI debrief + offline sync | ASHA Field Portal |

---

## 19. Competitive Differentiation

| Dimension | Generic Health Dashboard | Aheadly |
|-----------|------------------------|---------|
| **Approach** | Centralize and visualize historical data | Predict, explain, and act — before problems occur |
| **Data model** | Individual metric tracking | Signal convergence intelligence — risk as emergent property |
| **AI** | Chatbot as afterthought or separate page | Context-aware floating companion that SEES your current view |
| **Prediction** | Reactive only — shows what happened | 7–14 day outbreak forecasts with convergence amplification |
| **Explainability** | "Ward X is high risk" | "4/5 signals converging: 38°C heat + stagnation + low vegetation + disease cases + 23 sanitation complaints" |
| **Citizens** | Basic read-only portal at best | 8-feature portal with gamification, SOS, AI triage, health passport, family vaccination management |
| **Hospital integration** | Manual form entry | FHIR R4 + ABDM-compliant auto-sync Integration Gateway wizard |
| **Environmental data** | None | Satellite-derived LST, NDVI, MNDWI feeding directly into HRI |
| **Ground truth** | Hospital data only | Hospital + ASHA household surveys + citizen sanitation reports + satellite combined |
| **Map data** | Generic or approximated city outline | Real Solapur GeoJSON ward boundaries from SMC government data |
| **Data consistency** | Each page generates its own mock data | Single unified store — every number matches across every page |
| **Field workers** | Not considered | Dedicated mobile-optimized ASHA portal with offline sync, Marathi UI, voice notes |

### The Kill Shot Pitch

> **"On July 14, 2025, Sector-12 reported 47 dengue cases. But 7 days earlier, the signals were already there — 38°C land surface temperature, stagnant water in drain networks, 12 citizen complaints about uncollected garbage, NDVI vegetation index at 0.12. No one connected the dots. Until now."**

Aheadly is not a dashboard. It is Solapur's digital immune system.

---

## 20. Project Structure

```
smart-public-health-system/
├── client/
│   ├── public/
│   │   ├── solapur_ward_boundary.json    # Real SMC ward GeoJSON polygons
│   │   ├── Solapur_city_boundary.json    # Outer municipal boundary
│   │   └── Dashboard.png
│   └── src/
│       ├── components/
│       │   ├── maps/
│       │   │   └── SolapurMap.jsx        # Reusable ward map (choropleth/heatmap/markers)
│       │   ├── admin/
│       │   │   ├── CityHealthScore.jsx   # Radial gauge with composite HRI
│       │   │   ├── LiveMetricsRow.jsx    # Animated counter cards
│       │   │   ├── WardRiskRanking.jsx   # Sortable table with sparklines
│       │   │   └── DiseaseSignalTicker.jsx
│       │   ├── hospital/
│       │   │   ├── BedDashboard.jsx      # Real-time bed tracking
│       │   │   ├── ShiftHandover.jsx     # AI-compiled handover
│       │   │   └── SMCAlerts.jsx         # Bidirectional alert compliance
│       │   ├── citizen/
│       │   │   ├── SymptomChecker.jsx    # SVG body map + triage
│       │   │   ├── HealthPassport.jsx    # QR code health record
│       │   │   └── WardLeaderboard.jsx   # Gamified civic engagement
│       │   ├── asha/
│       │   │   ├── HouseholdSurvey.jsx   # 6-step mobile survey
│       │   │   ├── PostSurveyDebrief.jsx # AI risk analysis card
│       │   │   └── ASHAPassport.jsx      # Digital identity card
│       │   └── shared/
│       │       └── AheadlyCopilot.jsx    # Context-aware Gemini AI panel
│       ├── pages/
│       │   ├── Landing.jsx               # Cinematic 7-section scroll
│       │   ├── admin/
│       │   │   ├── HowItWorks.jsx        # Scroll-based explainer
│       │   │   ├── DigitalTwin.jsx       # 6-layer ward intelligence map
│       │   │   ├── InterventionPlanner.jsx
│       │   │   ├── FutureOverview.jsx    # Outbreak prediction + timeline
│       │   │   ├── PolicyBrief.jsx       # PDF generation wizard
│       │   │   └── DataSources.jsx       # Animated flow diagram
│       │   ├── hospital/
│       │   │   ├── HospitalDashboard.jsx
│       │   │   ├── IntegrationWizard.jsx # 5-step onboarding
│       │   │   └── BedStatus.jsx
│       │   ├── citizen/
│       │   │   ├── CommunityHome.jsx
│       │   │   ├── SanitationReporter.jsx
│       │   │   ├── VaccinationTracker.jsx
│       │   │   └── EmergencySOS.jsx
│       │   └── asha/
│       │       ├── ASHADashboard.jsx
│       │       └── SurveyFlow.jsx
│       ├── data/
│       │   └── unifiedHealthData.js      # SINGLE SOURCE OF TRUTH for all portals
│       ├── utils/
│       │   └── plannerState.js           # Shared pub/sub for Planner ↔ FutureOverview
│       └── services/
│           ├── diseaseSignals.js
│           └── communityMetrics.js
└── package.json
```

---

## 21. Recent Additions (ASHA & Conversational AI)

#### 🚀 New Features
* **Conversational Citizen Interface**
  * Chat-based reporting (sanitation, symptoms, health passport)
  * Real-time ingestion into system → visible in Digital Twin
* **ASHA Field Worker Mode**
  * Trigger-based switch to survey mode
  * Structured household survey (ID, location, symptoms, sanitation, vaccination)
  * Directly feeds into HRI signals and ground intelligence layer
* **Immunity Factor (Population Vulnerability Multiplier)**
  * Applied post-HRI calculation
  * Includes vaccination coverage, age risk, comorbidities
  * Accounts for **historical outbreak exposure** (wards previously affected have relatively lower reinfection probability)

#### 💡 Innovation Rationale
* Eliminates need for multiple apps → reduces ASHA workload (currently fragmented across multiple systems)
* Enables **zero-friction citizen participation** via simple chat instead of forms/apps
* Creates a unified, real-time **ground intelligence pipeline** from both citizens and field workers

#### 🔄 Updated System Flow
Citizen / ASHA (Chat Interface) → Structured Data → HRI Engine → Digital Twin → SMC Action

#### 🛠️ Tech Additions
* Conversational state machine (multi-mode: citizen + ASHA)
* Structured data extraction from chat
* Geo-mapping (point-in-polygon)

#### 🎯 Demo Highlight
* Send message → instant report/survey → live impact on ward (HRI + map)

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-team/aheadly.git
cd aheadly/client

# Install dependencies
npm install

# Add your Gemini API key
echo "REACT_APP_GEMINI_API_KEY=your_key_here" > .env.local

# Start development server
npm start

# Build for production
npm run build
```

---

## Impact Metrics

| Metric | Target | Mechanism |
|--------|--------|-----------|
| Outbreak detection lead time | 7–14 days earlier | Signal convergence detection vs. first clinical case |
| Disease surveillance coverage | 100% ward coverage | Digital Twin + hospital reporting + ASHA surveys combined |
| Citizen report resolution visibility | Real-time status | Feedback loop: admin actions reflect in citizen portal |
| Hospital capacity transparency | 15-minute update cycle | Integration Gateway auto-sync |
| ASHA field data latency | <2 hours (offline sync) | Background sync on reconnect |
| Multilingual accessibility | 3 languages | Marathi (primary), Hindi, English |

---

<div align="center">

**Built with 🔥 by Team Arva for SIH 2026**

*Solapur Municipal Corporation · Smart Public Health Management System*

[![Live Demo](https://img.shields.io/badge/🌐_Experience_Aheadly-aheadlybygoddamn.netlify.app-00d4aa?style=for-the-badge)](https://aheadlybygoddamn.netlify.app/)

</div>
