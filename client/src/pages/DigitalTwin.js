import React, { useEffect, useState, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import styled from "styled-components";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  ImageOverlay,
  Marker,
  Popup
} from "react-leaflet";
import L from "leaflet";
import { FiMap, FiActivity, FiLayers, FiSun, FiAlertCircle, FiUsers, FiTrash2, FiDroplet, FiAlertTriangle, FiX, FiCalendar, FiInfo } from "react-icons/fi";
import { BsTelegram } from "react-icons/bs";
import { DiseaseDataManager } from "../utils/DiseaseDataManager";
import { CommunitySanitationManager } from "../utils/CommunitySanitationManager";
import { CommunityIntelligenceManager } from "../utils/CommunityIntelligenceManager";
import { TelegramReportsManager } from "../utils/TelegramReportsManager";
import { getSectorID } from "../utils/HospitalRegistry"; // Import Sector Mapper
import { wardVulnerabilityData, wardData } from "../data/unifiedHealthData";
import { generateDiseaseSignal, generateDiseaseTimeline, getWardDiseaseProfile, formatDiseaseSignalFromData } from "../services/diseaseService";
import "leaflet/dist/leaflet.css";
import {
  getNDVIStatus, getNDVIReason, getNDVIColor,
  getWaterStagnationSusceptibility, getStagnationReason, getStagnationColor,
  getHeatRiskColor, getHeatRiskReason, calculateHeatRisk,
  getTrendArrow, getDiseaseColor, getDiseaseReason,
  getHRIScore, getHRIColor
} from "../utils/RiskCalculator";
import PortalBanner from "../components/common/PortalBanner";
import { SECTOR_HEALTH_PROFILES, plannerQueue } from "../services/plannerState";

const CARTO_KEY = process.env.REACT_APP_CARTO_API_KEY || "cb1_3hlv_1_982b84f1e84c5c6d42d8bd17";


/* ===================== ICONS ===================== */

const createIcon = (iconComponent, color) => {
  const markup = renderToStaticMarkup(
    <div style={{
      backgroundColor: "white",
      border: `2px solid ${color}`,
      borderRadius: "50%",
      padding: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 5px rgba(0,0,0,0.3)"
    }}>
      {React.cloneElement(iconComponent, { size: 14, color: color })}
    </div>
  );

  return L.divIcon({
    html: markup,
    className: "custom-leaflet-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const SANITATION_ICONS = {
  "Uncollected Garbage": createIcon(<FiTrash2 />, "#8B4513"), // Brown
  "Open Drain / Sewage": createIcon(<FiAlertCircle />, "#f97316"), // Orange (Warning)
  "Stagnant Water": createIcon(<FiDroplet />, "#0891b2"), // Cyan
  "Overflowing Public Bin": createIcon(<FiTrash2 />, "#d97706"), // Amber
  "Broken Public Toilet": createIcon(<FiAlertTriangle />, "#dc2626") // Red
};

const HEALTH_CONTEXT = {
  "Uncollected Garbage": "Prolonged garbage accumulation can increase exposure to disease vectors such as flies and rodents, which may elevate local infection risk if persistent.",
  "Open Drain / Sewage": "Open drains can facilitate pathogen spread and increase the likelihood of water-borne and vector-related illnesses during warm or wet periods.",
  "Stagnant Water": "Stagnant water creates favorable conditions for mosquito breeding, which can amplify vector-related disease risk if not addressed.",
  "Overflowing Public Bin": "Overflowing bins attract pests and animals, potentially spreading waste and pathogens to the surrounding area.",
  "Broken Public Toilet": "Lack of functional sanitation facilities increases open defecation risks and hygiene-related exposure pathogens."
};

// Helper: Select representative reports (Max 4 per sector)
const getRepresentativeReports = (allReports) => {
  if (!allReports || allReports.length === 0) return [];

  const sectorGroups = {};
  allReports.forEach(r => {
    if (!sectorGroups[r.sector]) sectorGroups[r.sector] = [];
    sectorGroups[r.sector].push(r);
  });

  let selected = [];

  Object.keys(sectorGroups).forEach(sector => {
    let reports = sectorGroups[sector];
    // Sort by Date (newest first)
    reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pick unique issue types first
    const uniqueIssues = [];
    const seenIssues = new Set();

    // Pass 1: One of each type
    reports.forEach(r => {
      if (!seenIssues.has(r.issue_type) && uniqueIssues.length < 4) {
        uniqueIssues.push(r);
        seenIssues.add(r.issue_type);
      }
    });

    // Pass 2: Fill remaining slots with newest reports if needed (up to 4)
    if (uniqueIssues.length < 4) {
      const remaining = reports.filter(r => !selected.includes(r) && !uniqueIssues.includes(r)); // Logic check: 'selected' is global list, 'uniqueIssues' is local.
      // Actually just take top N from sorted 'reports' that are not already in uniqueIssues?
      // Simpler: Just take uniqueIssues, and if < 4, fill from remaining sorted list

      const needed = 4 - uniqueIssues.length;
      let added = 0;
      for (let r of reports) {
        if (added >= needed) break;
        if (!uniqueIssues.find(u => u.id === r.id)) {
          uniqueIssues.push(r);
          added++;
        }
      }
    }

    selected = selected.concat(uniqueIssues);
  });

  return selected;
};

/* ===================== UI ===================== */

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #0d0f14;
  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  color: white;
  font-family: 'Inter', sans-serif;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1rem;
  padding: 0 2rem 2rem;
  flex: 1;
`;

const MapWrapper = styled.div`
  background: rgba(30, 33, 40, 0.6);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  overflow: hidden;
  height: calc(100vh - 180px);
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
`;

const ControlPanel = styled.div`
  background: rgba(30, 33, 40, 0.6);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 1.5rem;
  height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
`;

/* ===================== LAYER EXPLANATIONS ===================== */

const LAYER_EXPLANATIONS = {
  hri: {
    title: "HEALTH RISK INDEX (HRI)",
    desc: "A composite risk score identifying sectors with the highest public health vulnerability.",
    insight: "High-score sectors require immediate municipal intervention to prevent disease outbreaks.",
    uses: ["Disease Burden", "Heat Stress", "Sanitation & Environment"],
    legend: [
      { color: "#2dd48a", label: "Low (0-44)" },
      { color: "#ff8c42", label: "Moderate (45-64)" },
      { color: "#ff4444", label: "High (65-79)" },
      { color: "#cc2200", label: "Critical (80-100)" }
    ]
  },
  disease: {
    title: "Disease Signals (Mock)",
    desc: "Early warning system tracking reported symptom patterns before they become epidemics.",
    insight: "Rising signals indicate environmental triggers or sanitation failures needing action.",
    uses: ["Fever Trends", "Respiratory Spikes", "Diarrhea Clusters"],
    legend: [
      { color: "#cc2200", label: "Outbreak (Critical)" },
      { color: "#ff4444", label: "Rising (High)" },
      { color: "#ff8c42", label: "Moderate (Stable)" },
      { color: "#2dd48a", label: "Low (Stable)" }
    ]
  },
  community: {
    title: "Community Sanitation Reports",
    desc: "Citizen-reported issues that directly amplify disease risk (e.g., stagnant water, garbage).",
    insight: "Clusters of reports often precede visible health outcomes by 1-2 weeks.",
    uses: ["Vector Breeding Sites", "Contamination Risks", "Public Feedback"],
    legend: [
      { color: "#3b82f6", label: "Validated Report" }
    ]
  },
  heat: {
    title: "Urban Heat Health",
    desc: "Surface temperature analysis identifying areas of dangerous heat stress for residents.",
    insight: "High heat worsens chronic conditions (heart/lung) and risks heat stroke in vulnerable groups.",
    uses: ["Heat Retention", "Thermal Comfort"],
    legend: [
      { color: "#31a354", label: "Comfortable" },
      { color: "#fd8d3c", label: "Caution" },
      { color: "#e31a1c", label: "Dangerous Heat" }
    ]
  },
  stagnation: {
    title: "Water Stagnation Risk",
    desc: "Predictive model for water accumulation sites, the primary driver of mosquito-borne diseases.",
    insight: "Stagnant water sites are direct precursors to Dengue and Malaria outbreaks.",
    uses: ["Terrain Drainage", "Mosquito Risk"],
    legend: [
      { color: "#2ecc71", label: "Good Drainage" },
      { color: "#f97316", label: "Possible Stagnation" },
      { color: "#e74c3c", label: "High Vector Risk" }
    ]
  },
  ndvi: {
    title: "Vegetation Cover (NDVI)",
    desc: "Green cover analysis linking environmental health to long-term resident well-being.",
    insight: "Low vegetation correlates with higher heat stress and poorer air quality.",
    uses: ["Cooling Effect", "Air Filtration"],
    legend: [
      { color: "#dc2626", label: "Very Low (Stress)" },
      { color: "#f59e0b", label: "Moderate" },
      { color: "#16a34a", label: "Healthy Cover" }
    ]
  }
};

const DISEASE_PRIORITY_COLORS = {
  CRITICAL: "#cc2200",
  HIGH: "#ff4444",
  MODERATE: "#ff8c42",
  LOW: "#2dd48a"
};

const TREND_LABELS = {
  Outbreak: "⚠ Outbreak Alert",
  Rising: "Rising ↑",
  Stable: "Stable →"
};

const ACTION_INSIGHTS = {
  Outbreak: "Immediate larviciding, fogging, and case isolation recommended.",
  Rising: "Targeted surveillance and source reduction within 48 hours.",
  Stable: "Continue monitoring. No immediate intervention required."
};

const normalizeDiseaseTrend = (trend) => {
  if (!trend) return "Stable";
  const cleaned = trend.toLowerCase();
  if (cleaned.includes("outbreak") || cleaned === "surge") return "Outbreak";
  if (cleaned.includes("rising")) return "Rising";
  return "Stable";
};

/* ===================== RECOMMENDATION ENGINE ===================== */

function getWardRecommendations(ward) {
  if (!ward) return ["Maintain surveillance — no immediate intervention required"];
  
  const actions = [];
  const diseases = ward.diseases || {};
  const dengue = diseases.dengue || {};
  const malaria = diseases.malaria || {};
  const gastro = diseases.gastro || diseases.diarrhoea || {};
  const reports = ward.communityReports || {};
  const asha = ward.ashaData || {};
  const heat = ward.hri?.breakdown?.heatExposure || 0;

  // Disease-based logic (Priority)
  if (dengue.cases >= 15 && dengue.trend === "rising") {
    actions.push("Dengue fogging in high-risk zones");
  }

  if (malaria.cases >= 5) {
    actions.push("Larvicide treatment in stagnant water areas");
  }

  if (gastro.cases >= 5) {
    actions.push("Water chlorination and contamination inspection");
  }

  // Sanitation signals
  if (reports.stagnantWater >= 3) {
    actions.push("Drain cleanup and water removal");
  }

  if (reports.garbage >= 4) {
    actions.push("Garbage clearance drive");
  }

  // ASHA signals
  if (asha.flagged >= 3) {
    actions.push("Focused ASHA household visits");
  }

  // Heat signals
  if (heat >= 18) {
    actions.push("Heat advisory and hydration alerts");
  }

  // Fallback
  if (actions.length === 0) {
    actions.push("Maintain surveillance — no immediate intervention required");
  }

  // Max 3 actions, sorted implicitly by push order (Diseases first)
  return actions.slice(0, 3);
}

const LayerGuidePanel = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 300px;
  background: rgba(30, 33, 40, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.25rem;
  color: white;
  z-index: 1000;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  font-family: 'Inter', sans-serif;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const DetailPanel = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 400px;
  max-height: calc(100vh - 220px);
  background: rgba(30, 33, 40, 0.9);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
  overflow-y: auto;
  z-index: 2000;
  box-shadow: -10px 20px 40px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;

const PanelHeader = styled.div`
  padding: 1.25rem;
  background: rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const DetailSection = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
`;

const TimelineTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  margin-top: 10px;

  th {
    text-align: left;
    padding: 6px;
    color: #94a3b8;
    font-size: 0.75rem;
    text-transform: uppercase;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  
  td {
    padding: 6px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    color: #f8fafc;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
`;

const GuideTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
`;

const GuideDesc = styled.p`
  font-size: 0.85rem;
  color: #cbd5e1;
  line-height: 1.5;
  margin: 0 0 1rem 0;
`;

const GuideSection = styled.div`
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const GuideLabel = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const LegendRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #e2e8f0;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.color};
  }
`;

const SectionTitle = styled.h4`
  color: #94a3b8;
  margin: 1.5rem 0 0.75rem 0;
  text-transform: uppercase;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  display: flex;
  align-items: center;
  gap: 8px;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, rgba(255,255,255,0.1), transparent);
  }
`;

const ToggleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ToggleItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  background: ${({ active }) =>
    active ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.03)"};
  border: 1px solid
    ${({ active }) => (active ? "#6366f1" : "rgba(255,255,255,0.1)")};
  color: ${({ active }) => (active ? "#fff" : "rgba(255,255,255,0.7)")};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ active }) =>
    active ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.08)"};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ScientificCard = styled.div`
  background: #0d0f14;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
  color: white;
  animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const FormulaBlock = styled.div`
  background: rgba(20, 184, 166, 0.05);
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 2px;
    height: 100%;
    background: #14b8a6;
  }
`;

const Formula = styled.code`
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  color: #2dd4bf;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.5;
`;

const ScientificBadge = styled.span`
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;




/* ===================== COMPONENT ===================== */

const DigitalTwin = () => {
  // Data States
  const [wards, setWards] = useState(null);
  const [cityBoundary, setCityBoundary] = useState(null);
  const [ndviTable, setNdviTable] = useState({});
  const [stagnationTable, setStagnationTable] = useState({});
  const [heatTable, setHeatTable] = useState({});
  const [diseaseTable, setDiseaseTable] = useState({});
  const [communityReports, setCommunityReports] = useState([]);
  const [telegramReports, setTelegramReports] = useState([]);
  const [showRecentModal, setShowRecentModal] = useState(false);
  const [activeScientificModal, setActiveScientificModal] = useState(null);

  // Detailed Case Log State
  const [selectedWardDetail, setSelectedWardDetail] = useState(null);

  // HRI needs access to Sanitation Risk per ward, which is calculated per sector
  // We can fetch it live or use the Manager directly in the render loop.
  // Ideally we load it into state to trigger re-renders if it changes.
  const [sanitationRiskTable, setSanitationRiskTable] = useState({});

  // UI States
  // activeLayer: "ndvi" | "stagnation" | "heat" | "disease" | "hri" | null (default)
  const [activeLayer, setActiveLayer] = useState(null);
  const [showNDVI, setShowNDVI] = useState(false); // Raster defaults to off
  const [showCommunityReports, setShowCommunityReports] = useState(false); // New Overlay
  const [showWards, setShowWards] = useState(true);
  const [showCityBoundary, setShowCityBoundary] = useState(true);
  const [plannerPill, setPlannerPill] = useState(null);

  // References for imperative Leaflet updates
  const geoJsonRef = useRef(null);
  const selectedLayerRef = useRef(null);
  const [map, setMap] = useState(null);

  // FIX: Track Community Report markers to programmatically close popups
  const markerRefs = useRef({});

  const solapurCenter = [17.6599, 75.9064];

  /* ===================== CONVERGENCE HELPERS ===================== */
  const computeCentroid = (feature) => {
    try {
      const coords = feature.geometry.type === 'MultiPolygon'
        ? feature.geometry.coordinates[0][0]
        : feature.geometry.coordinates[0];
      const lats = coords.map(c => c[1]);
      const lngs = coords.map(c => c[0]);
      return [
        lats.reduce((a, b) => a + b, 0) / lats.length,
        lngs.reduce((a, b) => a + b, 0) / lngs.length
      ];
    } catch { return null; }
  };

  const getConvergenceCount = (nameKey, sectorId) => {
    const dData = diseaseTable[sectorId] || { level: "LOW" };
    const hData = heatTable[nameKey] || { risk: "LOW" };
    const sData = stagnationTable[nameKey] || { level: "LOW" };
    const nData = ndviTable[nameKey] || { mean: 0.6 };
    const cData = sanitationRiskTable[sectorId] || { level: "LOW" };
    let count = 0;
    if (dData.level === "MEDIUM" || dData.level === "HIGH") count++;
    if (hData.risk === "HIGH" || hData.risk === "EXTREME") count++;
    if (sData.level === "HIGH" || sData.level === "MEDIUM") count++;
    if (nData.mean < 0.3) count++;
    if (cData.level === "MEDIUM" || cData.level === "HIGH") count++;
    return count;
  };

  const createConvergenceBadgeIcon = (count) => {
    const bg = count >= 4 ? '#ef4444' : count >= 3 ? '#f97316' : '#6366f1';
    return L.divIcon({
      html: `<div style="background:${bg};color:white;font-size:11px;font-weight:800;border-radius:20px;padding:2px 7px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.4);border:2px solid rgba(255,255,255,0.8);line-height:1.4;">${count}/5</div>`,
      className: '',
      iconSize: null,
      iconAnchor: [20, 10]
    });
  };

  // NDVI overlay bounds
  const ndviBounds = [
    [17.579895034149004, 75.81045030614305], // SW
    [17.73157117798467, 75.96217773858825]   // NE
  ];

  /* ===================== POPUP CLEANUP ===================== */
  // MANDATORY: Force close Community Reports popups when switching layers
  useEffect(() => {
    if (activeLayer) {
      // If we switched TO a layer (HRI, Heat, etc.), close all community popups
      Object.values(markerRefs.current).forEach(marker => {
        if (marker) marker.closePopup();
      });
    }
  }, [activeLayer]);

  /* ===================== LOAD DATA ===================== */

  useEffect(() => {
    fetch("/solapur_wards.geojson").then(res => res.json()).then(data => {
      setWards(data);
    });

    // Load Real Disease Data (calculated from LocalStorage)
    const realData = DiseaseDataManager.getWardAggregates();
    setDiseaseTable(realData);

    // Initialize/Load Community Reports (Mock Data)
    CommunitySanitationManager.initializeData();
    setCommunityReports(CommunitySanitationManager.getAllReports());
    setSanitationRiskTable(CommunityIntelligenceManager.getRiskTable());

    fetch("/solapur_city_boundary.geojson").then(res => res.json()).then(setCityBoundary);

    // 1. Load NDVI Table (Foundation)
    const ndviPromise = fetch("/Solapur_Wardwise_NDVI_2023.csv").then(res => res.text()).then(text => {
      const lines = text.trim().split(/\r?\n/);
      const headers = lines[0].split(",");
      const nameIdx = headers.indexOf("Name");
      const meanIdx = headers.indexOf("NDVI_mean");
      const map = {};
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        const name = cols[nameIdx]?.trim().toLowerCase();
        const mean = parseFloat(cols[meanIdx]);
        if (name) map[name] = { mean };
      }
      setNdviTable(map);
      return map;
    });

    // 2. Load Stagnation Table
    fetch("/Solapur_Ward_Water_Stagnation_Risk.csv").then(res => res.text()).then(text => {
      const lines = text.trim().split(/\r?\n/);
      const headers = lines[0].split(",");
      const nameIdx = headers.indexOf("Name");
      const areaIdx = headers.indexOf("Total_Area");
      const ndviIdx = headers.indexOf("mean");
      const slopeIdx = headers.indexOf("mean_slope_deg");
      const map = {};
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        const name = cols[nameIdx]?.trim().toLowerCase();
        if (name) {
          const totalArea = parseFloat(cols[areaIdx]);
          const ndviMean = parseFloat(cols[ndviIdx]);
          const slope = parseFloat(cols[slopeIdx]);
          const level = getWaterStagnationSusceptibility(ndviMean, totalArea);
          map[name] = { totalArea, ndviMean, slope, level };
        }
      }
      setStagnationTable(map);
    });

    // Telegram reports — fetch once, then poll every 30 s
    TelegramReportsManager.fetchAndSync().then(all => {
      setTelegramReports(all.filter(r => r.type === 'sanitation' && r.latitude && r.longitude));
    });

    // 3. Load & Process Heat Table (Dependent on NDVI logic for Final Risk)
    Promise.all([ndviPromise, fetch("/Solapur_Ward_Heat_Stress_LST.csv").then(res => res.text())]).then(([ndviMap, lstText]) => {
      const lines = lstText.trim().split(/\r?\n/);
      const headers = lines[0].split(",");
      const nameIdx = headers.indexOf("Name");
      const lstIdx = headers.indexOf("mean_lst_c");

      const wardLSTs = [];
      const tempMap = {};

      // First pass: collect valid LSTs
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        const name = cols[nameIdx]?.trim().toLowerCase();
        const meanLst = parseFloat(cols[lstIdx]);
        if (name && !isNaN(meanLst)) {
          wardLSTs.push(meanLst);
          tempMap[name] = { meanLst };
        }
      }

      // Calculate Percentiles
      wardLSTs.sort((a, b) => a - b);
      const p25 = wardLSTs[Math.floor(wardLSTs.length * 0.25)];
      const p75 = wardLSTs[Math.floor(wardLSTs.length * 0.75)];

      // Second pass: Classify Risk
      const finalMap = {};
      Object.keys(tempMap).forEach(key => {
        const wardData = tempMap[key];
        const ndviVal = ndviMap[key]?.mean || 0; // fallback if missing, though typically matched

        // Step A & B & C: Combined Risk calculation refactored to Utility
        const risk = calculateHeatRisk(wardData.meanLst, ndviVal, p25, p75);

        let heatLevel = "MODERATE"; // Fallback for debug/display if needed separately
        if (wardData.meanLst > p75) heatLevel = "HIGH";
        else if (wardData.meanLst < p25) heatLevel = "LOW";

        finalMap[key] = {
          ...wardData,
          ndviMean: ndviVal,
          heatLevel, // Internal debug use mostly
          risk // Final Public Health Risk
        };
      });
      setHeatTable(finalMap);
    });

  }, []);

  // Poll telegram_reports.json every 30 s for live bot updates
  useEffect(() => {
    const interval = setInterval(() => {
      TelegramReportsManager.fetchAndSync().then(all => {
        setTelegramReports(all.filter(r => r.type === 'sanitation' && r.latitude && r.longitude));
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  /* ===================== CENTRALIZED STYLING ===================== */

  /* ===================== CENTRALIZED STYLING ===================== */

  /* ===================== CENTRALIZED STYLING ===================== */

  /* ===================== CENTRALIZED STYLING ===================== */

  const getWardStyle = (feature) => {
    // 1. Resolve Sector ID
    const rawName = feature.properties.Name;
    const nameKey = rawName?.toLowerCase();
    const sectorId = getSectorID(rawName);

    // 2. Disease Layer Logic
    if (activeLayer === "disease") {
      const dData = diseaseTable[sectorId] || {};
      const diseaseSignal = formatDiseaseSignalFromData(sectorId, dData);
      const primary = diseaseSignal.primary;
      const priority = primary.priority || "LOW";
      const color = DISEASE_PRIORITY_COLORS[priority] || DISEASE_PRIORITY_COLORS.LOW;
      const opacity = priority === "CRITICAL"
        ? 0.9
        : priority === "HIGH"
          ? 0.8
          : priority === "MODERATE"
            ? 0.7
            : 0.55;

      return {
        fillColor: color,
        weight: 2,
        color: "#1f2937",
        fillOpacity: opacity,
        dashArray: null
      };
    }

    // 3. Health Rate Index (HRI) - VISUAL EMPHASIS
    if (activeLayer === "hri") {
      const profile = SECTOR_HEALTH_PROFILES[sectorId];
      const hriScore = profile?.hri ?? 40;
      let color = "#2dd48a";
      if (hriScore >= 80) color = "#cc2200";
      else if (hriScore >= 65) color = "#ff4444";
      else if (hriScore >= 45) color = "#ff8c42";

      const convergenceCount = getConvergenceCount(nameKey, sectorId);
      const isConvergenceZone = convergenceCount >= 4;

      return {
        fillColor: color,
        weight: isConvergenceZone ? 4 : 2,
        color: isConvergenceZone ? "#ef4444" : "#1f2937",
        fillOpacity: 0.7,
        dashArray: isConvergenceZone ? null : null,
      };
    }

    // 4. Other Layers
    if (activeLayer === "heat") {
      const data = heatTable[nameKey];
      return {
        fillColor: getHeatRiskColor(data?.risk),
        weight: 1.4,
        color: "#1f2937",
        fillOpacity: 0.75
      };
    }

    if (activeLayer === "stagnation") {
      const data = stagnationTable[nameKey];
      return {
        fillColor: getStagnationColor(data?.level),
        weight: 1.4,
        color: "#1f2937",
        fillOpacity: 0.75
      };
    }

    if (activeLayer === "ndvi") {
      const mean = ndviTable[nameKey]?.mean;
      return {
        fillColor: getNDVIColor(mean),
        weight: 1.4,
        color: "#1f2937",
        fillOpacity: 0.75
      };
    }

    // Default Neutral (No Layer Active)
    return {
      fillColor: "rgba(59,130,246,0.1)",
      weight: 1.4,
      color: "#93c5fd",
      fillOpacity: 0.4
    };
  };

  /* ===================== FORCE UPDATES & EVENTS ===================== */

  // Listen for live updates from Hospital App
  useEffect(() => {
    const handleDataUpdate = () => {
      // Reload from storage when event fires
      const freshData = DiseaseDataManager.getWardAggregates();
      setDiseaseTable(freshData);
    };

    // BRIDGE for Popup Button Click
    window.handleWardDetail = (wardName) => {
      // Find data from tables
      const sectorId = getSectorID(wardName);
      const nameKey = wardName.toLowerCase();

      // Reconstruct signal logic (Same as map layer)
      const dData = DiseaseDataManager.getWardAggregates()[sectorId] || { level: "LOW" }; // Use direct manager access or state if available
      const hData = heatTable[nameKey] || { risk: "LOW" }; // Use state refs or lookups. Note: state might be stale in window fn closure?
      // Actually, we need access to the CURRENT state. 
      // Better: Dispatch a custom event or use a ref that holds current data tables.
      // Simplified: Just use the passed wardName and re-fetch static data or assume state is accessible via closure if defined inside useEffect?
      // NO, window function defined inside useEffect has closure access to initial state only unless ref used.
      // FIX: Define window function inside a useEffect that depends on the data tables.
    };

    window.addEventListener('urbanome-data-update', handleDataUpdate);
    return () => {
      window.removeEventListener('urbanome-data-update', handleDataUpdate);
      delete window.handleWardDetail;
    };
  }, []); // Initial mount only - this usage of window.handleWardDetail is buggy if it needs fresh state.

  // FIX: Separate Effect to bind the window function with fresh data access
  useEffect(() => {
    window.handleWardDetail = (wardName) => {
      const sectorId = getSectorID(wardName);
      const nameKey = wardName.toLowerCase();

      const dData = diseaseTable[sectorId] || { level: "LOW" };
      const hData = heatTable[nameKey] || { risk: "LOW" };
      const sData = stagnationTable[nameKey] || { level: "LOW" };
      const nData = ndviTable[nameKey] || { mean: 0.6 };
      const cData = sanitationRiskTable[sectorId] || { level: "LOW" }; // Need to ensure this is in scope

      const { score } = getHRIScore(dData.level, hData.risk, sData.level, nData.mean, cData.level);



      const signal = formatDiseaseSignalFromData(wardName, dData);

      setSelectedWardDetail({
        wardName,
        sectorId,
        signal,
        profile: signal.profile, // STRICT MAPPING: Use the same profile as the signal
        score
      });
      window.dispatchEvent(new CustomEvent('aheadly-ward-selected', { detail: { wardId: sectorId } }));
    };
  }, [diseaseTable, heatTable, stagnationTable, ndviTable, sanitationRiskTable]); // Re-bind when data changes

  useEffect(() => {
    window.addToPlanner = (sectorId) => {
      const profile = SECTOR_HEALTH_PROFILES[sectorId];
      if (!profile) return;
      plannerQueue.add(profile);
      setPlannerPill({ sector: sectorId, label: profile.sectorLabel });
      const btn = document.getElementById(`queue-${sectorId}`);
      if (btn) {
        btn.innerText = "✓ Added to Planner";
        btn.style.background = "#10b981";
        btn.style.color = "#0b1120";
      }
    };
    window.showScientificBasis = (topic) => {
      setActiveScientificModal(topic);
    };

    return () => { 
      delete window.addToPlanner; 
      delete window.showScientificBasis;
    };
  }, []);

  // Track previous layer to detect switches
  const prevLayerRef = useRef(activeLayer);

  // Effect: When activeLayer or Data changes, update Map
  useEffect(() => {
    if (!geoJsonRef.current) return;

    if (prevLayerRef.current !== activeLayer) {
      if (map) map.closePopup();
      prevLayerRef.current = activeLayer;
    }

    geoJsonRef.current.setStyle(getWardStyle);

    geoJsonRef.current.eachLayer((layer) => {
      layer.unbindPopup();
      const feature = layer.feature;
      const rawName = feature.properties.Name;
      const sectorId = getSectorID(rawName);
      const nameKey = rawName?.toLowerCase();

      let content = null;

      const wrapperStyle = "font-family:'Inter',sans-serif; min-width:340px; color:#f8fafc; background:#0f172a; border-radius:12px; overflow:hidden; border:1px solid rgba(255,255,255,0.1); box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);";
      const headerStyle = "padding:16px 18px; background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-bottom:1px solid rgba(255,255,255,0.1);";
      const bodyStyle = "padding:16px 18px; background:rgba(255,255,255,0.02);";
      const sectionTitleStyle = "font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase; color:#64748b; font-weight:800; margin-bottom:12px; display:flex; align-items:center; gap:8px;";

      if (activeLayer === "hri") {
        const profile = SECTOR_HEALTH_PROFILES[sectorId];
        if (profile) {
          const vData = wardVulnerabilityData[sectorId];
          const dData = diseaseTable[sectorId] || {};
          const hData = heatTable[nameKey] || {};
          const sData = stagnationTable[nameKey] || {};
          const wData = wardData[sectorId] || {};

          const hriColor = profile.hri >= 80 ? '#ef4444' : profile.hri >= 65 ? '#f97316' : profile.hri >= 45 ? '#f59e0b' : '#10b981';
          const trendArrow = (profile.trend === 'outbreak' || profile.trend === 'rising') ? '↑' : (profile.trend === 'declining' ? '↓' : '→');
          const trendDisplay = profile.trend === 'outbreak' ? 'Outbreak' : profile.trend === 'rising' ? 'Rising' : 'Stable';

          const dengueCases = wData.diseases?.dengue?.cases ?? profile.cases;
          const hospitalAdmissions = dData.total != null ? dData.total : profile.cases;
          const lstTemp = hData.meanLst != null ? hData.meanLst.toFixed(1) : 'N/A';
          const stagnationLvl = sData.level || 'N/A';
          const ashaFlagged = wData.ashaData?.flagged ?? 0;
          const interventions = getWardRecommendations(wData);
          
          const vm = vData?.vulnerability_multiplier ?? 1.0;
          const vc = vData?.vaccination_coverage ?? 100;
          const ep = vData?.elderly_percent ?? 5;
          const cb = vData?.comorbidity_burden ?? 10;

          content = `
            <div style="${wrapperStyle}">
              <div style="${headerStyle}">
                <div style="font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; color:#94a3b8; font-weight:800; margin-bottom:8px;">${profile.sector} — WARD INTELLIGENCE</div>
                <div style="display:flex; align-items:baseline; gap:10px; margin-bottom:6px;">
                  <span style="font-size:2.2rem; line-height:1; font-weight:900; color:${hriColor}; letter-spacing:-0.03em;">HRI: ${profile.hri}</span>
                  <span style="font-size:1rem; font-weight:700; color:${hriColor}80;">/100</span>
                </div>
                <div style="display:inline-flex; align-items:center; gap:6px; background:${hriColor}20; color:${hriColor}; padding:4px 10px; border-radius:6px; font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; border:1px solid ${hriColor}40;">
                  ${profile.severity} RISK
                </div>
              </div>
              <div style="${bodyStyle}">
                <div style="${sectionTitleStyle}"><span style="width:4px; height:4px; border-radius:50%; background:#3b82f6;"></span> RISK ATTRIBUTION</div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:18px;">
                  <div>
                    <div style="font-size:0.6rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:4px;">Clinical Signals</div>
                    <div style="font-size:0.9rem; font-weight:700; color:#f8fafc;">${dengueCases} Cases</div>
                    <div style="font-size:0.7rem; color:#64748b; margin-top:2px;">Trend: <span style="color:${profile.trend === 'rising' || profile.trend === 'outbreak' ? '#ef4444' : '#10b981'}; font-weight:700;">${trendDisplay} ${trendArrow}</span></div>
                  </div>
                  <div>
                    <div style="font-size:0.6rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:4px;">Hospital Load</div>
                    <div style="font-size:0.9rem; font-weight:700; color:#f8fafc;">${hospitalAdmissions} Admits</div>
                  </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                  <div>
                    <div style="font-size:0.6rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:4px;">Environment</div>
                    <div style="font-size:0.9rem; font-weight:700; color:#f8fafc;">${lstTemp}°C / ${stagnationLvl}</div>
                  </div>
                  <div>
                    <div style="font-size:0.6rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:4px;">Ground Intel</div>
                    <div style="font-size:0.9rem; font-weight:700; color:#f8fafc;">${ashaFlagged} Flags</div>
                  </div>
                </div>
              </div>

              ${vData ? `
              <div style="padding:16px 18px; border-top:1px solid rgba(255,255,255,0.05); background:rgba(255,255,255,0.01);">
                <div style="font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase; color:#64748b; font-weight:800; margin-bottom:12px;">POPULATION VULNERABILITY</div>
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; background:rgba(255,255,255,0.03); padding:8px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
                  <span style="font-size:0.75rem; color:#cbd5e1;">Vulnerability Multiplier</span>
                  <span style="font-size:1.1rem; font-weight:900; color:${vm >= 1.25 ? '#ef4444' : vm >= 1.15 ? '#f59e0b' : '#94a3b8'};">${vm.toFixed(2)}&times;</span>
                </div>
                <div style="display:flex; flex-direction:column; gap:6px;">
                  <div style="display:flex; justify-content:space-between; font-size:0.7rem;">
                    <span style="color:#94a3b8;">Immunization Coverage</span><span style="font-weight:700; color:#f1f5f9;">${vc}%</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; font-size:0.7rem;">
                    <span style="color:#94a3b8;">Elderly / Comorbidity</span><span style="font-weight:700; color:#f1f5f9;">${ep}% / ${cb}</span>
                  </div>
                </div>
              </div>` : ''}

              <div style="padding:16px 18px; border-top:1px solid rgba(255,255,255,0.05); background:rgba(59, 130, 246, 0.05);">
                <div style="font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase; color:#3b82f6; font-weight:800; margin-bottom:10px;">ACTIONABLE INTERVENTIONS</div>
                <ul style="margin:0; padding-left:0; list-style:none; font-size:0.82rem; color:#f1f5f9; font-weight:600; line-height:1.5;">
                  ${interventions.map(a => `<li style="margin-bottom:6px; display:flex; align-items:flex-start; gap:8px;"><span style="color:#3b82f6;">•</span><span>${a}</span></li>`).join('')}
                </ul>
              </div>
              <div style="padding:18px;">
                <button id="queue-${sectorId}" onclick="window.addToPlanner && window.addToPlanner('${sectorId}')" style="width:100%; background:#0ea5e9; color:#0f172a; border:none; border-radius:10px; padding:14px; font-weight:900; font-size:0.9rem; cursor:pointer; letter-spacing:0.05em; text-align:center; box-shadow:0 10px 15px -3px rgba(14, 165, 233, 0.3);">INITIATE INTERVENTION PLAN →</button>
              </div>
            </div>`;
        }
      } else if (activeLayer === "disease") {
        const dData = diseaseTable[sectorId] || {};
        const signal = formatDiseaseSignalFromData(sectorId, dData);
        const primary = signal.primary;
        const priority = primary.priority || "LOW";
        const trendKey = normalizeDiseaseTrend(primary.trend);
        const trendLabel = TREND_LABELS[trendKey] || TREND_LABELS.Stable;
        const insight = ACTION_INSIGHTS[trendKey] || ACTION_INSIGHTS.Stable;
        const diseaseName = primary.displayName || primary.name;
        const color = DISEASE_PRIORITY_COLORS[priority] || DISEASE_PRIORITY_COLORS.LOW;

        content = `
          <div style="${wrapperStyle}">
            <div style="${headerStyle}">
              <div style="font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; color:#94a3b8; font-weight:800; margin-bottom:8px;">${rawName} — DISEASE SIGNAL</div>
              <div style="font-size:1.5rem; font-weight:900; color:#f8fafc; margin-bottom:8px;">${diseaseName}</div>
              <div style="display:inline-flex; align-items:center; gap:6px; background:${color}20; color:${color}; padding:4px 10px; border-radius:6px; font-size:0.75rem; font-weight:800; border:1px solid ${color}40;">
                ${priority} PRIORITY
              </div>
            </div>
            <div style="${bodyStyle}">
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                <div>
                  <div style="font-size:0.6rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:4px;">Case Load</div>
                  <div style="font-size:1rem; font-weight:800; color:#f8fafc;">${primary.activeCases || 0} Active</div>
                </div>
                <div>
                  <div style="font-size:0.6rem; text-transform:uppercase; color:#94a3b8; font-weight:700; margin-bottom:4px;">Trend</div>
                  <div style="font-size:1rem; font-weight:800; color:${color};">${trendLabel}</div>
                </div>
              </div>
              <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
                <div style="font-size:0.6rem; text-transform:uppercase; color:#64748b; font-weight:700; margin-bottom:6px;">MUNICIPAL INSIGHT</div>
                <div style="font-size:0.85rem; line-height:1.5; color:#cbd5e1; font-style:italic;">"${insight}"</div>
              </div>
              <div style="margin-top:16px; border-top:1px solid rgba(255,255,255,0.05); padding-top:12px;">
                <button 
                  onclick="window.handleWardDetail && window.handleWardDetail('${rawName}')"
                  style="width:100%; background:rgba(99, 102, 241, 0.1); color:#a5b4fc; border:1px solid rgba(99, 102, 241, 0.3); border-radius:8px; padding:10px; font-size:0.75rem; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:all 0.2s; text-transform:uppercase; letter-spacing:0.05em;"
                  onmouseover="this.style.background='rgba(99, 102, 241, 0.2)'"
                  onmouseout="this.style.background='rgba(99, 102, 241, 0.1)'"
                >
                  <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="14" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  Detailed Case Log
                </button>
              </div>
            </div>
          </div>`;
      } else if (activeLayer === "heat") {
        const data = heatTable[nameKey];
        if (data) {
          const riskColor = getHeatRiskColor(data.risk);
          content = `
            <div style="${wrapperStyle}">
              <div style="${headerStyle}">
                <div style="font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; color:#94a3b8; font-weight:800; margin-bottom:8px;">${rawName} — THERMAL STRESS</div>
                <div style="font-size:2rem; font-weight:900; color:#f8fafc; margin-bottom:8px;">${data.meanLst?.toFixed(1)}°C</div>
                <div style="display:inline-flex; align-items:center; gap:6px; background:${riskColor}20; color:${riskColor}; padding:4px 10px; border-radius:6px; font-size:0.75rem; font-weight:800; border:1px solid ${riskColor}40;">
                  ${data.risk} RISK
                </div>
              </div>
              <div style="${bodyStyle}">
                <div style="margin-bottom:12px; font-size:0.85rem; line-height:1.5; color:#cbd5e1;">${getHeatRiskReason(data.risk)}</div>
                <div style="display:flex; gap:20px; border-top:1px solid rgba(255,255,255,0.05); pt:12px;">
                  <div><div style="font-size:0.6rem; color:#64748b; text-transform:uppercase;">NDVI Mean</div><div style="font-weight:700;">${data.ndviMean?.toFixed(2)}</div></div>
                </div>
              </div>
            </div>`;
        }
      } else if (activeLayer === "stagnation") {
        const data = stagnationTable[nameKey];
        if (data) {
          const riskColor = getStagnationColor(data.level);
          content = `
            <div style="${wrapperStyle}">
              <div style="${headerStyle}">
                <div style="font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; color:#94a3b8; font-weight:800; margin-bottom:8px;">${rawName} — VECTOR RISK</div>
                <div style="font-size:1.4rem; font-weight:900; color:#f8fafc; margin-bottom:8px;">${data.level} Susceptibility</div>
                <div style="display:inline-flex; align-items:center; gap:6px; background:${riskColor}20; color:${riskColor}; padding:4px 10px; border-radius:6px; font-size:0.75rem; font-weight:800; border:1px solid ${riskColor}40;">STAGNATION POTENTIAL</div>
              </div>
              <div style="${bodyStyle}">
                <div style="margin-bottom:12px; font-size:0.85rem; line-height:1.5; color:#cbd5e1;">${getStagnationReason(data.level)}</div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; border-top:1px solid rgba(255,255,255,0.05); pt:12px;">
                  <div><div style="font-size:0.6rem; color:#64748b; text-transform:uppercase;">Slope</div><div style="font-weight:700;">${data.slope}°</div></div>
                  <div><div style="font-size:0.6rem; color:#64748b; text-transform:uppercase;">Area</div><div style="font-weight:700;">${data.totalArea?.toFixed(1)} km²</div></div>
                </div>
                <div style="margin-top:16px; border-top:1px solid rgba(255,255,255,0.05); padding-top:12px;">
                  <button 
                    onclick="window.showScientificBasis && window.showScientificBasis('mndwi')"
                    style="width:100%; background:rgba(20, 184, 166, 0.1); color:#2dd4bf; border:1px solid rgba(20, 184, 166, 0.3); border-radius:8px; padding:8px; font-size:0.75rem; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:all 0.2s;"
                    onmouseover="this.style.background='rgba(20, 184, 166, 0.2)'"
                    onmouseout="this.style.background='rgba(20, 184, 166, 0.1)'"
                  >
                    <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="14" width="14" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    VIEW SCIENTIFIC BASIS
                  </button>
                </div>
              </div>
            </div>`;
        }
       } else if (activeLayer === "ndvi") {
        const mean = ndviTable[nameKey]?.mean;
        const status = getNDVIStatus(mean);
        if (mean != null) {
          const riskColor = getNDVIColor(mean);
          content = `
            <div style="${wrapperStyle}">
              <div style="${headerStyle}">
                <div style="font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; color:#94a3b8; font-weight:800; margin-bottom:8px;">${rawName} — VEGETATION HEALTH</div>
                <div style="font-size:2rem; font-weight:900; color:#f8fafc; margin-bottom:8px;">${mean.toFixed(3)}</div>
                <div style="display:inline-flex; align-items:center; gap:6px; background:${riskColor}20; color:${riskColor}; padding:4px 10px; border-radius:6px; font-size:0.75rem; font-weight:800; border:1px solid ${riskColor}40;">${status}</div>
              </div>
              <div style="${bodyStyle}">
                <div style="font-size:0.85rem; line-height:1.5; color:#cbd5e1;">${getNDVIReason(status)}</div>
                <div style="margin-top:16px; border-top:1px solid rgba(255,255,255,0.05); padding-top:12px;">
                  <button 
                    onclick="window.showScientificBasis && window.showScientificBasis('ndvi')"
                    style="width:100%; background:rgba(20, 184, 166, 0.1); color:#2dd4bf; border:1px solid rgba(20, 184, 166, 0.3); border-radius:8px; padding:8px; font-size:0.75rem; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:all 0.2s;"
                    onmouseover="this.style.background='rgba(20, 184, 166, 0.2)'"
                    onmouseout="this.style.background='rgba(20, 184, 166, 0.1)'"
                  >
                    <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="14" width="14" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    VIEW SCIENTIFIC BASIS
                  </button>
                </div>
              </div>
            </div>`;
        }
      } else if (!activeLayer && showCommunityReports) {
        const risk = CommunityIntelligenceManager.getSectorRisk(sectorId);
        const riskColor = risk.count > 3 ? '#ef4444' : '#10b981';
        content = `
          <div style="${wrapperStyle}">
            <div style="${headerStyle}">
              <div style="font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; color:#94a3b8; font-weight:800; margin-bottom:8px;">${sectorId} — COMMUNITY FEEDBACK</div>
              <div style="font-size:1.8rem; font-weight:900; color:#f8fafc; margin-bottom:8px;">${risk.count} Valid Reports</div>
              <div style="display:inline-flex; align-items:center; gap:6px; background:${riskColor}20; color:${riskColor}; padding:4px 10px; border-radius:6px; font-size:0.75rem; font-weight:800; border:1px solid ${riskColor}40;">SITUATIONAL AWARENESS</div>
            </div>
            <div style="${bodyStyle}">
              <div style="margin-bottom:12px;">
                <div style="font-size:0.6rem; color:#64748b; text-transform:uppercase; margin-bottom:4px;">Primary Issue Reported</div>
                <div style="font-size:1.1rem; font-weight:700; color:#f8fafc;">${risk.dominantIssue}</div>
              </div>
              <div style="background:rgba(255,255,255,0.03); padding:10px; border-radius:8px; border-left:4px solid ${riskColor};">
                <div style="font-size:0.85rem; line-height:1.5; color:#cbd5e1;">${risk.count >= 3 ? "Immediate inspection of sanitation infrastructure recommended due to report clustering." : "Conditions currently stable. No immediate field deployment required."}</div>
              </div>
            </div>
          </div>`;
      }

      if (content) layer.bindPopup(content);
    });
  }, [activeLayer, ndviTable, stagnationTable, heatTable, diseaseTable, map, showCommunityReports, communityReports]);

  // Click Handler (Interaction-Only)
  const onWardClick = (e) => {
    if (!activeLayer) return; // Ignore clicks if no layer active

    const layer = e.target;
    if (selectedLayerRef.current) {
      selectedLayerRef.current.setStyle(getWardStyle(selectedLayerRef.current.feature));
    }
    layer.setStyle({ weight: 3, color: "#6366f1", fillOpacity: 0.9 });
    selectedLayerRef.current = layer;

    // Notify Aheadly Copilot of the selected ward
    const rawName = layer.feature?.properties?.Name;
    const sectorId = getSectorID(rawName);
    if (sectorId) {
      window.dispatchEvent(new CustomEvent('aheadly-ward-selected', { detail: { wardId: sectorId } }));
    }

    // Popup is already bound by useEffect, just let it open
    layer.openPopup();
  };

  /* ===================== RENDER ===================== */

  // Merge community + telegram sanitation reports for map markers
  const allCommunityReports = [...communityReports, ...telegramReports];

  return (
    <Container>
      <PortalBanner portal="smc" />
      <div style={{ padding: "2rem 2.5rem 1.5rem", color: "white" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.04em", margin: 0, background: "linear-gradient(to right, #fff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Solapur Digital Twin
        </h1>
        <p style={{ opacity: 1, color: "#3b82f6", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.75rem", marginTop: "0.5rem" }}>
          Ward-level Intelligence Command Center
        </p>
      </div>

      <ContentGrid>
        <MapWrapper>
          <MapContainer
            center={solapurCenter}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            ref={setMap}
          >
            <TileLayer
              url={CARTO_KEY
                ? `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            {showNDVI && (
              <ImageOverlay
                url="/SOLAPURNDVI.png"
                bounds={ndviBounds}
                opacity={0.85}
              />
            )}

            {showWards && wards && (
              <GeoJSON
                data={wards}
                ref={geoJsonRef} // Capture ref for imperative updates
                style={getWardStyle} // Initial render
                onEachFeature={(feature, layer) => {
                  layer.on("click", onWardClick);
                }}
              />
            )}

            {showCityBoundary && cityBoundary && (
              <GeoJSON data={cityBoundary} style={{ fillOpacity: 0, color: "#ef4444", weight: 3 }} interactive={false} />
            )}

            {/* CONVERGENCE BADGES: Show X/5 signal count on each ward when HRI layer is active */}
            {activeLayer === "hri" && wards && wards.features && wards.features.map((feature, idx) => {
              const rawName = feature.properties.Name;
              const nameKey = rawName?.toLowerCase();
              const sectorId = getSectorID(rawName);
              const count = getConvergenceCount(nameKey, sectorId);
              if (count === 0) return null;
              const centroid = computeCentroid(feature);
              if (!centroid) return null;
              return (
                <Marker
                  key={`badge-${idx}`}
                  position={centroid}
                  icon={createConvergenceBadgeIcon(count)}
                  interactive={false}
                />
              );
            })}

            {/* Community Report Markers (Overlay) — includes Telegram-sourced reports */}
            {showCommunityReports && !activeLayer && allCommunityReports.length > 0 && getRepresentativeReports(allCommunityReports).map((report) => (
              <Marker
                key={report.id}
                position={[report.latitude, report.longitude]}
                icon={SANITATION_ICONS[report.issue_type] || SANITATION_ICONS["Uncollected Garbage"]}
                ref={el => markerRefs.current[report.id] = el}
              >
                <Popup>
                  <div style={{ fontFamily: "'Inter', sans-serif", minWidth: '240px', color: '#f8fafc', background: '#0f172a', borderRadius: '10px', padding: '14px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}>
                    {report.source === 'telegram' && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(44,165,224,0.15)', color: '#7dd3f0', fontSize: '0.65rem', fontWeight: '800', padding: '3px 10px', borderRadius: '999px', marginBottom: '10px', border: '1px solid rgba(44,165,224,0.3)' }}>
                        <BsTelegram /> TELEGRAM REPORT
                      </div>
                    )}
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: '800', color: '#f8fafc' }}>Community Report</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', marginBottom: '2px' }}>Issue</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f1f5f9' }}>{report.issue_type}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', marginBottom: '2px' }}>Ward</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f1f5f9' }}>{report.sector}</div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(99,102,241,0.1)', padding: '10px', borderRadius: '8px', marginBottom: '10px', borderLeft: '3px solid #6366f1' }}>
                      <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: '800', color: '#a5b4fc', marginBottom: '4px' }}>
                        Public Health Context
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                        {HEALTH_CONTEXT[report.issue_type] || "This issue requires municipal attention to mitigate localized disease risk."}
                      </div>
                    </div>

                    {report.has_proof && (
                      <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: '600', marginTop: '5px' }}>
                        📸 Evidence Available
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {plannerPill && (
            <div style={{ position: 'absolute', top: 16, right: 16, background: '#0ea5e9', color: '#0b1120', padding: '10px 14px', borderRadius: '999px', fontWeight: 800, boxShadow: '0 10px 30px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => { window.location.href = '/intervention-planner'; }}>
              → Go to Intervention Planner
              <span style={{ fontWeight: 700, color: '#022c22' }}>{plannerPill.sector}</span>
            </div>
          )}

          {/* LAYER EXPLANATION PANEL */}
          {(() => {
            let activeKey = null;
            if (activeLayer) activeKey = activeLayer;
            else if (showCommunityReports) activeKey = "community";

            if (activeKey && LAYER_EXPLANATIONS[activeKey]) {
              const info = LAYER_EXPLANATIONS[activeKey];
              return (
                <LayerGuidePanel>
                  <GuideTitle>
                    <FiActivity /> {info.title}
                  </GuideTitle>
                  <GuideDesc>{info.desc}</GuideDesc>

                  <GuideSection>
                    <GuideLabel>Public Health Insight</GuideLabel>
                    <div style={{ fontSize: '0.85rem', color: '#fff', fontStyle: 'italic' }}>
                      "{info.insight}"
                    </div>
                  </GuideSection>

                  <GuideSection>
                    <GuideLabel>How to Read</GuideLabel>
                    <LegendRow>
                      {info.legend.map((l, i) => (
                        <LegendItem key={i} color={l.color}>{l.label}</LegendItem>
                      ))}
                    </LegendRow>
                  </GuideSection>
                </LayerGuidePanel>
              );
            }
            return null;
          })()}

          {/* SIDE PANEL: DETAILED CASE LOG */}
          {selectedWardDetail && (
            <DetailPanel>
              <PanelHeader>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Detailed Disease Case Log</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>{selectedWardDetail.sectorId}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <FiCalendar /> Last 30 Days
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedWardDetail(null); window.dispatchEvent(new CustomEvent('aheadly-ward-deselected')); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <FiX size={20} />
                </button>
              </PanelHeader>

              {/* GENERATE LIST OF DISEASES - ALL DISEASES (Profile) */}
              {selectedWardDetail.profile && selectedWardDetail.profile.map((disease, idx) => {
                // Use cached timeline from profile (Single Source of Truth)
                const history = disease.timeline || [];
                const isZero = disease.activeCases === 0;

                return (
                  <DetailSection key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '1rem', fontWeight: '800', color: isZero ? '#64748b' : '#f8fafc' }}>{disease.name}</div>
                      <div style={{
                        background: isZero ? 'rgba(255,255,255,0.05)' : 'rgba(239, 68, 68, 0.1)',
                        color: isZero ? '#94a3b8' : '#fca5a5',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        border: isZero ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(239, 68, 68, 0.2)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {disease.activeCases} Active Cases
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '12px', fontWeight: '500' }}>
                      Trend: <b style={{ color: !isZero && disease.trend.includes('Rising') ? '#f87171' : (isZero ? '#64748b' : '#fbbf24') }}>{disease.trend}</b> • Transmission: <b style={{ color: '#cbd5e1' }}>{disease.type}</b>
                    </div>

                    {!isZero && (
                      <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
                        <TimelineTable>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Cases</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {history.map((row, i) => (
                              <tr key={i}>
                                <td style={{ fontFamily: 'monospace' }}>{row.date}</td>
                                <td style={{ fontWeight: 'bold' }}>{row.cases}</td>
                                <td>
                                  <span style={{
                                    fontSize: '0.65rem',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    background: row.status === 'Confirmed' ? 'rgba(34, 197, 94, 0.15)' : (row.cases > 0 ? 'rgba(249, 115, 22, 0.15)' : 'transparent'),
                                    color: row.status === 'Confirmed' ? '#4ade80' : (row.cases > 0 ? '#fb923c' : '#64748b'),
                                    border: `1px solid ${row.status === 'Confirmed' ? 'rgba(34, 197, 94, 0.3)' : (row.cases > 0 ? 'rgba(249, 115, 22, 0.3)' : 'transparent')}`,
                                    fontWeight: '700',
                                    textTransform: 'uppercase'
                                  }}>
                                    {row.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </TimelineTable>
                      </div>
                    )}
                    {isZero && (
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', padding: '10px 0', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                        No cases reported in the last 30 days.
                      </div>
                    )}
                  </DetailSection>
                );
              })}

              {selectedWardDetail.signal.primary?.activeCases > 0 && (
                <DetailSection style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                    Public Health Interpretation
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6', fontStyle: 'italic' }}>
                    "This ward shows sustained {selectedWardDetail.signal.primary?.name.toLowerCase()} transmission over the last 30 days,
                    indicating active {selectedWardDetail.signal.primary?.type === 'Vector-Borne' ? 'vector breeding' : 'environmental exposure'} and local transmission.
                    Immediate containment and surveillance escalation are advised."
                  </div>
                </DetailSection>
              )}

            </DetailPanel>
          )}

          {/* ── RECENT REPORTS button — visible when Community Reports layer is on ── */}
          {showCommunityReports && (
            <div
              onClick={() => setShowRecentModal(true)}
              style={{
                position: 'absolute', top: 16, right: 16, zIndex: 1500,
                background: '#6366f1',
                color: 'white',
                padding: '9px 18px',
                borderRadius: '999px',
                fontWeight: '800',
                fontSize: '0.78rem',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(99,102,241,0.45)',
                display: 'flex', alignItems: 'center', gap: '8px',
                border: '1px solid rgba(255,255,255,0.15)',
                userSelect: 'none',
              }}
            >
              <FiUsers size={13} />
              RECENT REPORTS
              {allCommunityReports.filter(r => !r.isMock).length > 0 && (
                <span style={{ background: 'rgba(255,255,255,0.22)', borderRadius: '999px', padding: '1px 7px', fontSize: '0.72rem', fontWeight: '700' }}>
                  {allCommunityReports.filter(r => !r.isMock).length}
                </span>
              )}
            </div>
          )}

        </MapWrapper>

        <ControlPanel>
          <div>
            <SectionTitle>Intelligence Layers</SectionTitle>
            <ToggleGroup>
              {/* FINAL LAYER: Health Rate Index */}
              <ToggleItem
                active={activeLayer === "hri"}
                onClick={() => {
                  const isActive = activeLayer === "hri";
                  setActiveLayer(isActive ? null : "hri");
                  setShowNDVI(false);
                  if (!isActive) setShowCommunityReports(false); // Valid Mutual Exclusivity
                }}
                style={{
                  border: activeLayer === "hri" ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                  background: activeLayer === "hri" ? "rgba(239, 68, 68, 0.15)" : "rgba(255,255,255,0.03)"
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: activeLayer === "hri" ? '#fca5a5' : 'inherit' }}>
                  <FiActivity color={activeLayer === "hri" ? '#fca5a5' : 'inherit'} />
                  HEALTH RISK INDEX (HRI)
                </div>
              </ToggleItem>

              <ToggleItem
                active={activeLayer === "disease"}
                onClick={() => {
                  if (activeLayer === "disease") {
                    setActiveLayer(null);
                  } else {
                    setActiveLayer("disease");
                    setShowNDVI(false);
                    setShowCommunityReports(false);
                  }
                }}
              >
                Disease Signals (Mock) <FiAlertCircle />
              </ToggleItem>

              {/* NEW: Community Reports Overlay */}
              <ToggleItem
                active={showCommunityReports}
                onClick={() => {
                  const newState = !showCommunityReports;
                  setShowCommunityReports(newState);
                  if (newState) setActiveLayer(null); // Valid Mutual Exclusivity
                }}
                style={{ borderLeft: showCommunityReports ? "4px solid #3b82f6" : "1px solid rgba(255,255,255,0.1)" }}
              >
                Community Reports <FiUsers />
              </ToggleItem>

              <ToggleItem
                active={activeLayer === "heat"}
                onClick={() => {
                  if (activeLayer === "heat") {
                    setActiveLayer(null);
                  } else {
                    setActiveLayer("heat");
                    setShowNDVI(false);
                    setShowCommunityReports(false);
                  }
                }}
              >
                Urban Heat Health <FiSun />
              </ToggleItem>
              <ToggleItem
                active={activeLayer === "stagnation"}
                onClick={() => {
                  if (activeLayer === "stagnation") {
                    setActiveLayer(null);
                  } else {
                    setActiveLayer("stagnation");
                    setShowNDVI(false);
                    setShowCommunityReports(false);
                  }
                }}
              >
                Water Stagnation Risk <FiActivity />
              </ToggleItem>
              <ToggleItem
                active={activeLayer === "ndvi"}
                onClick={() => {
                  if (activeLayer === "ndvi") {
                    setActiveLayer(null);
                    setShowNDVI(false);
                  } else {
                    setActiveLayer("ndvi");
                    setShowNDVI(true);
                    setShowCommunityReports(false);
                  }
                }}
              >
                NDVI Vegetation Index <FiActivity />
              </ToggleItem>
            </ToggleGroup>
          </div>
          <div>
            <SectionTitle>Boundaries</SectionTitle>
            <ToggleGroup>
              <ToggleItem active={showWards} onClick={() => setShowWards(!showWards)}>
                Ward Boundaries <FiMap />
              </ToggleItem>
              <ToggleItem active={showCityBoundary} onClick={() => setShowCityBoundary(!showCityBoundary)}>
                City Outline <FiMap />
              </ToggleItem>
            </ToggleGroup>
          </div>

        </ControlPanel>
      </ContentGrid>
      {/* ══════════════ RECENT REPORTS FULL-SCREEN MODAL ══════════════ */}
      {showRecentModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.88)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999,
          display: 'flex', flexDirection: 'column',
          fontFamily: "'Inter', sans-serif",
        }}>

          {/* Header */}
          <div style={{
            padding: '1.25rem 2rem',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(13,15,20,0.98)',
            flexShrink: 0,
          }}>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.01em' }}>
                Recent Reports
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px' }}>
                {(() => {
                  const real = allCommunityReports.filter(r => !r.isMock);
                  const tg   = real.filter(r => r.source === 'telegram');
                  return `${real.length} reports · ${tg.length} via Telegram`;
                })()}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Filter pills */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {['All','Telegram','Portal'].map(f => (
                  <span
                    key={f}
                    style={{
                      padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer',
                      background: 'rgba(255,255,255,0.07)', color: '#94a3b8',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >{f}</span>
                ))}
              </div>
              {/* Clear reports button */}
              {telegramReports.length > 0 && (
                <button
                  onClick={() => setTelegramReports([])}
                  title="Clear all Telegram reports"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: '#ef4444',
                    padding: '6px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s',
                    opacity: 0.6,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.background = 'rgba(239,68,68,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.6';
                    e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                  }}
                >
                  <FiTrash2 size={16} />
                </button>
              )}
              <button
                onClick={() => setShowRecentModal(false)}
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8', padding: '6px 10px', display: 'flex', alignItems: 'center' }}
              >
                <FiX size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable grid */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
            {allCommunityReports.filter(r => !r.isMock).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem', color: '#475569' }}>
                <FiUsers size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#64748b' }}>No real reports yet</div>
                <div style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                  Submit a report via the Community Portal or Telegram bot.
                </div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1rem',
              }}>
                {[...allCommunityReports]
                  .filter(r => !r.isMock)
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map((report, idx) => {
                    const isTg = report.source === 'telegram';
                    return (
                      <div key={report.id || idx} style={{
                        background: 'rgba(22,26,35,0.95)',
                        border: `1px solid ${isTg ? 'rgba(44,165,224,0.25)' : 'rgba(99,102,241,0.2)'}`,
                        borderRadius: '14px',
                        overflow: 'hidden',
                        display: 'flex', flexDirection: 'column',
                      }}>

                        {/* Photo */}
                        {report.photo_path ? (
                          <div style={{ height: '190px', overflow: 'hidden', background: '#0d0f14', flexShrink: 0 }}>
                            <img
                              src={report.photo_path}
                              alt="evidence"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              onError={e => { e.target.style.display = 'none'; }}
                            />
                          </div>
                        ) : report.has_proof ? (
                          <div style={{ height: '70px', background: 'rgba(52,211,153,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(52,211,153,0.1)', flexShrink: 0 }}>
                            <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: '600' }}>📸 Evidence on file</div>
                          </div>
                        ) : null}

                        {/* Body */}
                        <div style={{ padding: '0.9rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {/* Title row */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f1f5f9', flex: 1, marginRight: '8px', lineHeight: '1.3' }}>
                              {report.issue_type || report.classification || 'Report'}
                            </div>
                            <span style={{
                              background: isTg ? 'rgba(44,165,224,0.15)' : 'rgba(99,102,241,0.15)',
                              color: isTg ? '#7dd3f0' : '#a5b4fc',
                              fontSize: '0.62rem', fontWeight: '800',
                              padding: '2px 7px', borderRadius: '999px',
                              border: `1px solid ${isTg ? 'rgba(44,165,224,0.3)' : 'rgba(99,102,241,0.3)'}`,
                              whiteSpace: 'nowrap', flexShrink: 0,
                              letterSpacing: '0.05em',
                            }}>
                              {isTg ? 'TELEGRAM' : 'PORTAL'}
                            </span>
                          </div>

                          {/* Meta grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div>
                              <div style={{ fontSize: '0.62rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Ward</div>
                              <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#cbd5e1' }}>{report.sector}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.62rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Reported</div>
                              <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#cbd5e1' }}>
                                {new Date(report.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>

                          {/* Note / caption */}
                          {report.note && !report.note.toLowerCase().includes('mock') && !report.note.toLowerCase().includes('automated') && (
                            <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', lineHeight: '1.5', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                              "{report.note}"
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeScientificModal && (
        <ModalOverlay onClick={() => setActiveScientificModal(null)}>
          <ScientificCard onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <ScientificBadge>
                  {activeScientificModal === 'mndwi' ? 'Sentinel-2 • Optical/SWIR' : 'Sentinel-2 • Optical'}
                </ScientificBadge>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: '8px', color: '#fff' }}>
                  {activeScientificModal === 'mndwi' ? 'MNDWI Methodology' : 'NDVI Methodology'}
                </div>
              </div>
              <button 
                onClick={() => setActiveScientificModal(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <FiX size={24} />
              </button>
            </ModalHeader>
            <ModalBody>
              {activeScientificModal === 'mndwi' ? (
                <>
                  <div style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                    The Modified Normalized Difference Water Index (MNDWI) is utilized to distinguish surface water and identify areas prone to stagnation with high precision.
                  </div>
                  
                  <FormulaBlock>
                    <div style={{ fontSize: '0.65rem', color: '#14b8a6', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Modified Normalized Difference Water Index</div>
                    <Formula>MNDWI = (Green - SWIR) / (Green + SWIR)</Formula>
                    <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#5eead4', fontWeight: '600' }}>
                      Bands: B3 (Green, 560 nm), B11 (SWIR, 1610 nm)
                    </div>
                  </FormulaBlock>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ color: '#14b8a6', marginTop: '2px' }}><FiInfo size={16} /></div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
                        <strong style={{ color: '#f8fafc' }}>Threshold Analysis:</strong> Positive MNDWI values (<strong style={{ color: '#2dd4bf' }}>&gt;0.10</strong>) indicate reliable surface water presence and potential vector breeding habitats.
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                    The Normalized Difference Vegetation Index (NDVI) is used to estimate vegetation density and health, crucial for cooling effects and habitat analysis.
                  </div>
                  
                  <FormulaBlock>
                    <div style={{ fontSize: '0.65rem', color: '#14b8a6', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Normalized Difference Vegetation Index</div>
                    <Formula>NDVI = (NIR - Red) / (NIR + Red)</Formula>
                    <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#5eead4', fontWeight: '600' }}>
                      Bands: B8 (NIR, 842 nm), B4 (Red, 665 nm)
                    </div>
                  </FormulaBlock>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ color: '#14b8a6', marginTop: '2px' }}><FiInfo size={16} /></div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
                        <strong style={{ color: '#f8fafc' }}>Threshold Analysis:</strong> Low NDVI (<strong style={{ color: '#ef4444' }}>&lt;0.25</strong>) correlates with sparse canopy and elevated surface heat retention.
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ color: '#14b8a6', marginTop: '2px' }}><FiActivity size={16} /></div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
                    <strong style={{ color: '#f8fafc' }}>Urban Context:</strong> This data allows us to identify "Heat Islands" where lack of vegetation amplifies thermal stress and disease risk.
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setActiveScientificModal(null)}
                style={{ 
                  width: '100%', 
                  background: '#14b8a6', 
                  color: '#0d0f14', 
                  border: 'none', 
                  borderRadius: '10px', 
                  padding: '12px', 
                  fontWeight: '800', 
                  fontSize: '0.9rem', 
                  marginTop: '1.5rem', 
                  cursor: 'pointer',
                  boxShadow: '0 10px 15px -3px rgba(20, 184, 166, 0.3)'
                }}
              >
                UNDERSTOOD
              </button>
            </ModalBody>
          </ScientificCard>
        </ModalOverlay>
      )}

    </Container >
  );
};

export default DigitalTwin;

