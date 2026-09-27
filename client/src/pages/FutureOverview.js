import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, GeoJSON, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  FiAlertTriangle,
  FiActivity,
  FiMap,
  FiTrendingUp,
  FiDroplet,
  FiWind,
  FiThermometer,
  FiEye,
  FiShield,
  FiCheckCircle,
  FiPlay,
  FiChevronDown,
  FiChevronUp,
  FiArrowRight,
  FiClock,
  FiZap,
  FiInfo,
  FiSend,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import PortalBanner from "../components/common/PortalBanner";
import PlannerPill from "../components/common/PlannerPill";
import { plannerQueue, PREDEFINED_SECTORS } from "../services/plannerState";

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
const T = {
  teal: "#14b8a6", // Bright teal for dark mode
  tealLight: "#2dd4bf",
  coral: "#F4845F",
  dark: "#ffffff", // Inverted for dark mode text titles
  darkMid: "rgba(255, 255, 255, 0.1)",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  orange: "#f97316",
  bg: "#0d0f14",
  card: "rgba(30, 33, 40, 0.6)",
  border: "rgba(255, 255, 255, 0.08)",
  muted: "#94a3b8",
  text: "#f8fafc",
};

// ─────────────────────────────────────────────
// WARD PREDICTION DATA
// ─────────────────────────────────────────────
const WARD_PREDICTIONS = {
  "Sector-01": { dengue: 72, malaria: 45, gastro: 38, respiratory: 25, currentHRI: 8.5 },
  "Sector-02": { dengue: 55, malaria: 30, gastro: 62, respiratory: 40, currentHRI: 6.5 },
  "Sector-03": { dengue: 88, malaria: 55, gastro: 28, respiratory: 20, currentHRI: 10.0 },
  "Sector-04": { dengue: 35, malaria: 22, gastro: 45, respiratory: 55, currentHRI: 4.5 },
  "Sector-05": { dengue: 65, malaria: 40, gastro: 52, respiratory: 30, currentHRI: 7.5 },
  "Sector-06": { dengue: 42, malaria: 28, gastro: 35, respiratory: 48, currentHRI: 5.0 },
  "Sector-07": { dengue: 78, malaria: 60, gastro: 30, respiratory: 22, currentHRI: 9.0 },
  "Sector-08": { dengue: 25, malaria: 18, gastro: 28, respiratory: 35, currentHRI: 3.0 },
  "Sector-09": { dengue: 58, malaria: 35, gastro: 42, respiratory: 40, currentHRI: 6.0 },
  "Sector-10": { dengue: 82, malaria: 52, gastro: 25, respiratory: 18, currentHRI: 9.5 },
  "Sector-11": { dengue: 30, malaria: 20, gastro: 55, respiratory: 60, currentHRI: 3.5 },
  "Sector-12": { dengue: 70, malaria: 48, gastro: 38, respiratory: 28, currentHRI: 8.0 },
  "Sector-13": { dengue: 45, malaria: 30, gastro: 40, respiratory: 45, currentHRI: 5.5 },
  "Sector-14": { dengue: 60, malaria: 42, gastro: 48, respiratory: 35, currentHRI: 7.0 },
  "Sector-15": { dengue: 50, malaria: 32, gastro: 35, respiratory: 42, currentHRI: 5.8 },
  "Sector-16": { dengue: 38, malaria: 25, gastro: 60, respiratory: 50, currentHRI: 4.0 },
};

const ALERTS = [
  {
    ward: "Sector-03",
    disease: "Dengue",
    risk: "CRITICAL",
    probability: 88,
    days: 7,
    actions: ["Deploy fogging within 48h", "Issue boil-water advisory", "Alert ASHA workers"],
  },
  {
    ward: "Sector-10",
    disease: "Dengue",
    risk: "HIGH",
    probability: 82,
    days: 7,
    actions: ["Drain desilting priority", "Targeted fogging", "Community advisory"],
  },
  {
    ward: "Sector-07",
    disease: "Dengue",
    risk: "HIGH",
    probability: 78,
    days: 7,
    actions: ["Source reduction campaign", "Mobile health camp"],
  },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const getProbabilityColor = (prob) => {
  if (prob < 30) return T.success;
  if (prob < 50) return T.warning;
  if (prob < 70) return T.orange;
  return T.danger;
};

const normalizeSectorName = (name) => {
  if (!name) return null;
  if (/Sector-\d+/i.test(name)) {
    const match = name.match(/Sector-(\d+)/i);
    if (match) return `Sector-${String(parseInt(match[1], 10)).padStart(2, "0")}`;
  }
  const numMatch = name.match(/(\d+)/);
  if (numMatch) return `Sector-${String(parseInt(numMatch[1], 10)).padStart(2, "0")}`;
  return null;
};

const generateTimelineData = (disease, sectorId) => {
  const baseValues = { dengue: 12, malaria: 8, gastro: 6, respiratory: 10 };
  const base = baseValues[disease] || 8;
  const ward = WARD_PREDICTIONS[sectorId];
  const riskProb = ward ? ward[disease] / 100 : 0.4;

  const today = new Date();
  const data = [];

  for (let i = -30; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const label = `${d.getDate()}/${d.getMonth() + 1}`;
    const isHistory = i <= 0;
    const seed = Math.sin(i * 0.7 + (sectorId || "").charCodeAt(0) * 0.1) * 0.5 + 0.5;
    const noise = seed * 0.4 - 0.2;

    if (isHistory) {
      const trend = i > -10 ? 1 + (i + 10) * 0.04 * riskProb : 1;
      const val = Math.max(0, Math.round(base * trend * (1 + noise)));
      data.push({ date: label, historical: val, predicted: null, upper: null, lower: null, isToday: i === 0 });
    } else {
      const growth = 1 + i * 0.08 * riskProb;
      const predicted = Math.round(base * growth * (1 + noise * 0.5));
      const upper = Math.round(predicted * 1.25);
      const lower = Math.max(0, Math.round(predicted * 0.75));
      data.push({ date: label, historical: null, predicted, upper, lower, isToday: false });
    }
  }
  return data;
};

// ─────────────────────────────────────────────
// KEYFRAMES
// ─────────────────────────────────────────────
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const slideInLeft = keyframes`
  from { transform: translateX(-30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// ─────────────────────────────────────────────
// GLOBAL STYLED COMPONENTS
// ─────────────────────────────────────────────
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: ${T.bg};
  background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  padding: 2rem;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  color: ${T.text};

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const HeaderBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, ${T.teal}20, ${T.coral}20);
  border: 1px solid ${T.teal}40;
  color: ${T.teal};
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 4px 12px;
  border-radius: 100px;
  margin-bottom: 0.75rem;
`;

const PageTitle = styled.h1`
  font-size: 2.2rem;
  font-weight: 800;
  color: ${T.dark};
  margin: 0 0 0.5rem;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 1rem;
  color: ${T.muted};
  margin: 0 0 1.25rem;
  max-width: 680px;
  line-height: 1.6;
`;

const CollapsiblePanel = styled(motion.div)`
  background: ${T.card};
  border: 1px solid ${T.border};
  backdrop-filter: blur(8px);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
`;

const CollapsibleHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.25rem;
  background: none;
  border: none;
  cursor: pointer;
  color: ${T.teal};
  font-weight: 600;
  font-size: 0.9rem;
  text-align: left;
`;

const CollapsibleBody = styled(motion.div)`
  padding: 0 1.25rem 1.25rem;
  color: ${T.muted};
  font-size: 0.88rem;
  line-height: 1.7;

  ul {
    margin: 0.5rem 0 0 1rem;
    padding: 0;
    li { margin-bottom: 0.4rem; }
  }
`;

const SectionCard = styled.div`
  background: ${T.card};
  border-radius: 16px;
  padding: 1.75rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(12px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid ${T.border};
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${T.dark};
  margin: 0 0 0.35rem;
  display: flex;
  align-items: center;
  gap: 10px;

  svg { color: ${T.teal}; }
`;

const SectionSubtitle = styled.p`
  font-size: 0.85rem;
  color: ${T.muted};
  margin: 0 0 1.25rem;
`;

const TabRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const Tab = styled.button`
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1.5px solid ${({ active }) => (active ? T.teal : T.border)};
  background: ${({ active }) => (active ? T.teal : "transparent")};
  color: ${({ active }) => (active ? "#fff" : T.muted)};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${T.teal};
    color: ${({ active }) => (active ? "#fff" : T.teal)};
  }
`;

const ForecastToggle = styled.div`
  display: flex;
  border: 1.5px solid ${T.border};
  border-radius: 100px;
  overflow: hidden;
  width: fit-content;
  margin-bottom: 1rem;
`;

const ForecastBtn = styled.button`
  padding: 6px 18px;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  background: ${({ active }) => (active ? T.teal : "transparent")};
  color: ${({ active }) => (active ? "#fff" : T.muted)};
  cursor: pointer;
  transition: all 0.2s;
`;

// ─────────────────────────────────────────────
// MAP STYLES
// ─────────────────────────────────────────────
const MapWrapper = styled.div`
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${T.border};
  position: relative;
`;

const MapLegend = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: ${T.bg};
  border-radius: 10px;
  border: 1px solid ${T.border};
`;

const LegendLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${T.muted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-right: 0.5rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: ${T.text};
`;

const LegendDot = styled.span`
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: ${({ color }) => color};
  flex-shrink: 0;
`;

// ─────────────────────────────────────────────
// TIMELINE CHART STYLES
// ─────────────────────────────────────────────
const ChartWrapper = styled.div`
  height: 300px;
  margin-top: 1rem;
`;

// ─────────────────────────────────────────────
// ANATOMY TIMELINE STYLES
// ─────────────────────────────────────────────
const AnatomyWrapper = styled.div`
  position: relative;
`;

const PlayButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  border-radius: 100px;
  border: 1.5px solid ${T.teal};
  background: transparent;
  color: ${T.teal};
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  margin-bottom: 1.75rem;
  transition: all 0.2s;

  &:hover {
    background: ${T.teal};
    color: white;
  }
`;

const TimelineTrack = styled.div`
  position: relative;
  padding-left: 0;

  &::before {
    content: "";
    position: absolute;
    left: 36px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, ${T.teal}40 0%, ${T.danger}40 100%);
  }
`;

const TimelineNode = styled(motion.div)`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  position: relative;
`;

const NodeDay = styled.div`
  flex-shrink: 0;
  width: 72px;
  font-size: 0.7rem;
  font-weight: 700;
  color: ${({ color }) => color || T.muted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding-top: 2px;
  text-align: right;
`;

const NodeIconCircle = styled.div`
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ bg }) => bg || T.teal}22;
  border: 2px solid ${({ bg }) => bg || T.teal};
  color: ${({ bg }) => bg || T.teal};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  position: relative;
  z-index: 1;
`;

const NodeContent = styled.div`
  flex: 1;
  background: ${({ borderColor }) => borderColor || T.teal}10;
  border-left: 3px solid ${({ borderColor }) => borderColor || T.teal};
  border-radius: 0 10px 10px 0;
  padding: 0.75rem 1rem;
  backdrop-filter: blur(4px);
`;

const NodeTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: ${T.dark};
  margin-bottom: 0.3rem;
`;

const NodeDesc = styled.div`
  font-size: 0.8rem;
  color: ${T.muted};
  line-height: 1.55;
`;

const NodeMetric = styled.span`
  display: inline-block;
  background: ${({ bg }) => bg || T.teal}18;
  color: ${({ bg }) => bg || T.teal};
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 100px;
  margin-top: 0.4rem;
  margin-right: 4px;
`;

const ForkContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-left: 5.5rem;
  margin-bottom: 1.5rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ForkCard = styled(motion.div)`
  border-radius: 12px;
  padding: 1rem 1.25rem;
  border: 1.5px solid ${({ color }) => color};
  background: ${({ color }) => color}0a;
`;

const ForkTitle = styled.div`
  font-size: 0.8rem;
  font-weight: 700;
  color: ${({ color }) => color};
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 0.5rem;
`;

const ForkText = styled.div`
  font-size: 0.78rem;
  color: ${T.text};
  line-height: 1.5;
`;

// ─────────────────────────────────────────────
// ALERT CARD STYLES
// ─────────────────────────────────────────────
const AlertsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
`;

const AlertCard = styled(motion.div)`
  border-radius: 14px;
  border: 1px solid ${({ riskcolor }) => riskcolor}80;
  background: ${T.card};
  backdrop-filter: blur(8px);
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
  }
`;

const AlertCardHeader = styled.div`
  padding: 1rem 1.25rem 0.75rem;
  background: ${({ riskcolor }) => riskcolor}0a;
  border-bottom: 1px solid ${({ riskcolor }) => riskcolor}20;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const AlertWard = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: ${T.dark};
`;

const AlertDisease = styled.div`
  font-size: 0.8rem;
  color: ${T.muted};
  margin-top: 2px;
`;

const RiskBadge = styled.span`
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: ${({ riskcolor }) => riskcolor}18;
  color: ${({ riskcolor }) => riskcolor};
  border: 1px solid ${({ riskcolor }) => riskcolor}40;
`;

const AlertCardBody = styled.div`
  padding: 1rem 1.25rem;
`;

const ProbabilityBar = styled.div`
  margin-bottom: 0.75rem;
`;

const ProbLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  font-weight: 600;
  color: ${T.text};
  margin-bottom: 5px;
`;

const BarTrack = styled.div`
  height: 6px;
  background: ${T.border};
  border-radius: 100px;
  overflow: hidden;
`;

const BarFill = styled(motion.div)`
  height: 100%;
  border-radius: 100px;
  background: ${({ riskcolor }) => riskcolor};
`;

const ActionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1rem;
`;

const ActionItem = styled.li`
  font-size: 0.8rem;
  color: ${T.text};
  padding: 4px 0;
  display: flex;
  align-items: flex-start;
  gap: 7px;

  &::before {
    content: "→";
    color: ${T.coral};
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

const AlertActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const PrimaryBtn = styled.button`
  flex: 1;
  min-width: 120px;
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: ${T.teal};
  color: white;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  &:hover {
    background: ${T.tealLight};
    transform: translateY(-1px);
  }
`;

const SecondaryBtn = styled.button`
  flex: 1;
  min-width: 120px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1.5px solid ${T.coral};
  background: transparent;
  color: ${T.coral};
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  &:hover {
    background: ${T.coral};
    color: white;
  }
`;

// ─────────────────────────────────────────────
// CUSTOM TOOLTIP FOR RECHARTS
// ─────────────────────────────────────────────
const CustomTooltipWrapper = styled.div`
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid ${T.border};
  border-radius: 10px;
  padding: 10px 14px;
  color: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  font-size: 0.8rem;
`;

const TooltipTitle = styled.div`
  font-weight: 700;
  color: ${T.dark};
  margin-bottom: 6px;
`;

const TooltipRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${T.muted};
  margin-bottom: 2px;

  span { color: ${T.text}; font-weight: 600; }
`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <CustomTooltipWrapper>
      <TooltipTitle>{label}</TooltipTitle>
      {payload.map((p) => (
        <TooltipRow key={p.dataKey}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
          {p.name}: <span>{p.value}</span>
        </TooltipRow>
      ))}
    </CustomTooltipWrapper>
  );
};

// ─────────────────────────────────────────────
// MAP WARD POPUP CONTENT
// ─────────────────────────────────────────────
const PopupContent = styled.div`
  min-width: 200px;
  font-family: "Inter", sans-serif;
`;

const PopupWardName = styled.div`
  font-weight: 700;
  font-size: 0.95rem;
  color: ${T.dark};
  margin-bottom: 0.5rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid ${T.border};
`;

const PopupRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  margin-bottom: 4px;
  color: ${T.text};

  strong { color: ${({ valueColor }) => valueColor || T.teal}; }
`;

const PopupActionsLabel = styled.div`
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${T.muted};
  margin-top: 0.6rem;
  margin-bottom: 0.3rem;
`;

const PopupAction = styled.div`
  font-size: 0.75rem;
  color: ${T.text};
  padding: 2px 0;
  display: flex;
  gap: 5px;
  align-items: center;

  &::before {
    content: "•";
    color: ${T.coral};
    font-weight: 700;
  }
`;

// ─────────────────────────────────────────────
// ANATOMY DATA
// ─────────────────────────────────────────────
const ANATOMY_NODES = [
  {
    day: "Day 0",
    color: T.teal,
    icon: <FiThermometer />,
    title: "SATELLITE SIGNAL DETECTED",
    desc: "Land Surface Temperature spikes to 38.2°C. Normalized Difference Vegetation Index drops to 0.12 — well below seasonal baseline. Aheadly flags anomaly.",
    metrics: ["LST: 38.2°C", "NDVI: 0.12", "Δ from baseline: −34%"],
  },
  {
    day: "Day 3",
    color: T.warning,
    icon: <FiDroplet />,
    title: "WATER STAGNATION DETECTED",
    desc: "Standing water index increases 28% above normal. Drain network capacity at 94%. Mosquito breeding grounds forming in 3 ward clusters.",
    metrics: ["Stagnation index: +28%", "Drain capacity: 94%", "Risk zones: 3"],
  },
  {
    day: "Day 5",
    color: T.orange,
    icon: <FiActivity />,
    title: "COMMUNITY GROUND TRUTH",
    desc: "12 citizen reports received via Aheadly field app: stagnant water accumulation, uncollected garbage, and open drains in residential lanes.",
    metrics: ["Reports: 12", "Unique hotspots: 5", "Signal confidence: 87%"],
  },
  {
    day: "Day 6",
    color: T.danger,
    icon: <FiZap />,
    title: "HRI CONVERGENCE THRESHOLD CROSSED",
    desc: "Health Risk Index surges from 3.0 to 8.0 out of 12. Four of five primary signals simultaneously elevated. System-generated CRITICAL ALERT triggered.",
    metrics: ["HRI: 3.0 → 8.0", "Signals elevated: 4/5", "Alert: CRITICAL"],
    isTrigger: true,
  },
];

// ─────────────────────────────────────────────
// SECTION: OUTBREAK PREDICTION MAP
// ─────────────────────────────────────────────
const OutbreakMap = ({ selectedDisease, forecastWindow }) => {
  const [geoData, setGeoData] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);


  useEffect(() => {
    fetch("/solapur_wards.geojson")
      .then((r) => r.json())
      .then(setGeoData)
      .catch((e) => console.error("Failed to load wards GeoJSON:", e));
  }, []);

  const getWardProbability = useCallback(
    (sectorKey, disease) => {
      if (!WARD_PREDICTIONS[sectorKey]) return 40;
      const base = WARD_PREDICTIONS[sectorKey][disease] || 40;
      if (forecastWindow === "14") return Math.min(95, Math.round(base * 1.3));
      return base;
    },
    [forecastWindow]
  );

  const styleFeature = useCallback(
    (feature) => {
      const raw = feature.properties?.Name || feature.properties?.name || "";
      const sector = normalizeSectorName(raw);
      const prob =
        selectedDisease === "all"
          ? sector && WARD_PREDICTIONS[sector]
            ? Math.max(
                WARD_PREDICTIONS[sector].dengue,
                WARD_PREDICTIONS[sector].malaria,
                WARD_PREDICTIONS[sector].gastro,
                WARD_PREDICTIONS[sector].respiratory
              ) *
              (forecastWindow === "14" ? 1.3 : 1)
            : 40
          : getWardProbability(sector, selectedDisease);

      return {
        fillColor: getProbabilityColor(Math.min(95, prob)),
        fillOpacity: 0.65,
        color: "#fff",
        weight: 1.5,
      };
    },
    [selectedDisease, forecastWindow, getWardProbability]
  );

  const onEachFeature = useCallback(
    (feature, layer) => {
      const raw = feature.properties?.Name || feature.properties?.name || "";
      const sector = normalizeSectorName(raw);
      const wardData = sector ? WARD_PREDICTIONS[sector] : null;

      layer.on("click", () => {
        setSelectedWard({ raw, sector, wardData });
      });

      layer.bindPopup(() => {
        const container = document.createElement("div");
        if (!wardData) {
          container.innerHTML = `<div style="font-family:Inter,sans-serif;padding:6px;font-size:13px;color:#64748b"><strong>${raw || "Unknown Ward"}</strong><br/>No prediction data</div>`;
          return container;
        }
        const prob =
          selectedDisease === "all"
            ? Math.max(wardData.dengue, wardData.malaria, wardData.gastro, wardData.respiratory)
            : wardData[selectedDisease] || 0;
        const adjProb = forecastWindow === "14" ? Math.min(95, Math.round(prob * 1.3)) : prob;
        const riskDrivers = ["LST elevation", "NDVI deficit", "Water stagnation", "Drain capacity"].slice(0, 3);
        const preemptiveActions = ["Targeted fogging", "ASHA worker alert", "Community advisory"];

        container.innerHTML = `
          <div style="min-width:240px; font-family:'Inter',sans-serif; background:#0f172a; border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:16px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.5); color:#f8fafc;">
            <div style="font-weight:800; font-size:0.9rem; color:#fff; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.1); text-transform:uppercase; letter-spacing:0.05em;">${sector || raw}</div>
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:6px; color:#94a3b8;"><span>Current HRI:</span><strong style="color:#2dd4bf">${((wardData.currentHRI / 12) * 100).toFixed(1)}/100</strong></div>
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:6px; color:#94a3b8;"><span>Outbreak probability:</span><strong style="color:${getProbabilityColor(adjProb)}">${adjProb}%</strong></div>
            <div style="font-size:0.7rem; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:#6366f1; margin-top:14px; margin-bottom:6px;">Key Risk Drivers</div>
            ${riskDrivers.map((d) => `<div style="font-size:0.8rem; color:#f1f5f9; padding:2px 0; display:flex; align-items:center; gap:6px;"><span style="color:#6366f1;">•</span> ${d}</div>`).join("")}
            <div style="font-size:0.7rem; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:#f97316; margin-top:14px; margin-bottom:6px;">Preemptive Actions</div>
            ${preemptiveActions.map((a) => `<div style="font-size:0.8rem; color:#f1f5f9; padding:2px 0; display:flex; align-items:center; gap:6px;"><span style="color:#f97316;">→</span> ${a}</div>`).join("")}
          </div>
        `;
        return container;
      });
    },
    [selectedDisease, forecastWindow]
  );

  return (
    <>
      <MapWrapper>
        <MapContainer
          center={[17.686, 75.91]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          {geoData && geoData.features && (
            <GeoJSON
              key={`${selectedDisease}-${forecastWindow}`}
              data={geoData}
              style={styleFeature}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>
      </MapWrapper>
      <MapLegend>
        <LegendLabel>Risk Level</LegendLabel>
        <LegendItem><LegendDot color={T.success} /> Low (&lt;30%)</LegendItem>
        <LegendItem><LegendDot color={T.warning} /> Moderate (30–50%)</LegendItem>
        <LegendItem><LegendDot color={T.orange} /> High (50–70%)</LegendItem>
        <LegendItem><LegendDot color={T.danger} /> Critical (&gt;70%)</LegendItem>
      </MapLegend>
    </>
  );
};

// ─────────────────────────────────────────────
// SECTION: PREDICTIVE TIMELINE CHART
// ─────────────────────────────────────────────
const TimelineChart = ({ selectedDisease, selectedSector }) => {
  const data = useMemo(
    () => generateTimelineData(selectedDisease, selectedSector),
    [selectedDisease, selectedSector]
  );

  const todayIndex = data.findIndex((d) => d.isToday);
  const todayLabel = todayIndex >= 0 ? data[todayIndex].date : "";

  const hasPredictedSpike = useMemo(() => {
    const ward = WARD_PREDICTIONS[selectedSector];
    if (!ward) return false;
    return ward[selectedDisease] > 60;
  }, [selectedDisease, selectedSector]);

  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={T.teal} stopOpacity={0.3} />
              <stop offset="95%" stopColor={T.teal} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={T.danger} stopOpacity={0.25} />
              <stop offset="95%" stopColor={T.danger} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={T.warning} stopOpacity={0.12} />
              <stop offset="95%" stopColor={T.warning} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: T.muted }}
            interval={4}
            tickLine={false}
            axisLine={{ stroke: T.border }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: T.muted }}
            tickLine={false}
            axisLine={false}
            label={{ value: "Cases", angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 10, fill: T.muted } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            x={todayLabel}
            stroke={T.dark}
            strokeDasharray="4 3"
            strokeWidth={2}
            label={{ value: "TODAY", position: "top", fontSize: 10, fill: T.dark, fontWeight: 700 }}
          />
          {hasPredictedSpike && (
            <ReferenceLine
              x={data[todayIndex + 7]?.date}
              stroke={T.danger}
              strokeDasharray="3 3"
              strokeWidth={1.5}
              label={{ value: "⚠ Spike", position: "top", fontSize: 10, fill: T.danger, fontWeight: 700 }}
            />
          )}
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="url(#confGrad)"
            name="Upper bound"
            legendType="none"
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="#fff"
            name="Lower bound"
            legendType="none"
          />
          <Area
            type="monotone"
            dataKey="historical"
            stroke={T.teal}
            strokeWidth={2}
            fill="url(#histGrad)"
            name="Historical"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="predicted"
            stroke={T.danger}
            strokeWidth={2}
            strokeDasharray="5 4"
            fill="url(#predGrad)"
            name="Predicted"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

// ─────────────────────────────────────────────
// SECTION: OUTBREAK ANATOMY
// ─────────────────────────────────────────────
const OutbreakAnatomy = () => {
  const [playing, setPlaying] = useState(true);
  const [animKey, setAnimKey] = useState(0);
  const [addedTimeline, setAddedTimeline] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdded = () => setAddedTimeline(plannerQueue.items.some(i => i.sector === "Sector-03"));
    checkAdded();
    const unsub = plannerQueue.subscribe(checkAdded);
    return unsub;
  }, []);

  const handlePlay = () => {
    setPlaying(false);
    setTimeout(() => {
      setAnimKey((k) => k + 1);
      setPlaying(true);
    }, 50);
  };
  
  const handleTimelineAdd = () => {
    plannerQueue.add(PREDEFINED_SECTORS["Sector-03"]);
  };

  const renderActionForNode = (i) => {
    if (i === 0) {
      return (
        <PrimaryBtn style={{ marginTop: 12, width: 'fit-content' }} onClick={() => navigate("/digital-twin")}>
          <FiArrowRight size={14} /> View in Digital Twin
        </PrimaryBtn>
      );
    }
    if (i === 1) {
      return (
        <SecondaryBtn style={{ marginTop: 12, width: 'fit-content', borderColor: T.muted, color: T.text }}>
          + Add Sanitation Response to Planner
        </SecondaryBtn>
      );
    }
    if (i === 2) {
      return (
        <SecondaryBtn style={{ marginTop: 12, width: 'fit-content', borderColor: T.orange, color: T.orange }} onClick={() => toast.success("Alert broadcast to Ward-12 ASHA team and Hospital Connect")}>
          + Alert ASHA Workers
        </SecondaryBtn>
      );
    }
    if (i === 3) {
      if (addedTimeline) {
        return (
          <PrimaryBtn style={{ marginTop: 12, width: 'fit-content', background: T.teal, cursor: 'default' }}>
            <FiCheckCircle size={14} /> ✓ Added — Sector-03 to Planner
          </PrimaryBtn>
        );
      }
      return (
        <PrimaryBtn style={{ marginTop: 12, width: 'fit-content', background: T.danger }} onClick={handleTimelineAdd}>
          <FiZap size={14} /> ⚡ Add Full Intervention to Planner
        </PrimaryBtn>
      );
    }
    return null;
  };

  const nodeVariants = {
    hidden: { opacity: 0, x: -24 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.6, duration: 0.5, ease: "easeOut" },
    }),
  };

  const forkVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 4 * 0.6 + i * 0.35, duration: 0.5, ease: "easeOut" },
    }),
  };

  return (
    <AnatomyWrapper>
      <PlayButton onClick={handlePlay}>
        <FiPlay size={13} /> Re-play Animation
      </PlayButton>

      {playing && (
        <TimelineTrack key={animKey}>
          {ANATOMY_NODES.map((node, i) => (
            <TimelineNode
              key={i}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={nodeVariants}
            >
              <NodeDay color={node.color}>
                {node.day}
              </NodeDay>
              <NodeIconCircle bg={node.color}>{node.icon}</NodeIconCircle>
              <NodeContent borderColor={node.color}>
                <NodeTitle>{node.title}</NodeTitle>
                <NodeDesc>{node.desc}</NodeDesc>
                <div style={{ marginTop: "0.5rem" }}>
                  {node.metrics.map((m) => (
                    <NodeMetric key={m} bg={node.color}>{m}</NodeMetric>
                  ))}
                </div>
                {renderActionForNode(i)}
              </NodeContent>
            </TimelineNode>
          ))}

          {/* Fork */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { delay: 4 * 0.6, duration: 0.4 } },
            }}
          >
            <div style={{ marginLeft: "5.5rem", marginBottom: "0.75rem", fontSize: "0.78rem", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Day 7+ — What happens next?
            </div>
          </motion.div>

          <ForkContainer>
            <ForkCard
              color={T.success}
              custom={0}
              initial="hidden"
              animate="visible"
              variants={forkVariants}
            >
              <ForkTitle color={T.success}>
                <FiShield size={13} /> WITH AHEADLY
              </ForkTitle>
              <ForkText>
                <strong style={{ color: T.success }}>Day 7:</strong> Fogging teams deployed within 18 hours of alert.
                Targeted drain desilting completed. ASHA workers briefed in 3 sub-wards.<br /><br />
                <strong style={{ color: T.success }}>Day 14:</strong> Case count — <strong>8 confirmed</strong>.
                60% reduction in projected outbreak. Zero hospitalizations. Community advisory issued proactively.
              </ForkText>
            </ForkCard>

            <ForkCard
              color={T.danger}
              custom={1}
              initial="hidden"
              animate="visible"
              variants={forkVariants}
            >
              <ForkTitle color={T.danger}>
                <FiAlertTriangle size={13} /> WITHOUT AHEADLY
              </ForkTitle>
              <ForkText>
                <strong style={{ color: T.danger }}>Day 9:</strong> First hospital reports arrive — 47 confirmed dengue cases.
                Response teams mobilized reactively, resources already strained.<br /><br />
                <strong style={{ color: T.danger }}>Day 14:</strong> 140+ cases across 3 wards.
                Hospital ED at 112% capacity. Local media coverage triggers panic.
                Emergency budget allocation required.
              </ForkText>
            </ForkCard>
          </ForkContainer>
        </TimelineTrack>
      )}
    </AnatomyWrapper>
  );
};

// ─────────────────────────────────────────────
// SECTION: ALERT CARDS
// ─────────────────────────────────────────────
const getRiskColor = (risk) => {
  if (risk === "CRITICAL") return T.danger;
  if (risk === "HIGH") return T.orange;
  if (risk === "MODERATE") return T.warning;
  return T.success;
};

const AlertCardComponent = ({ alert }) => {
  const navigate = useNavigate();
  const riskColor = getRiskColor(alert.risk);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const checkAdded = () => {
      setAdded(plannerQueue.items.some(i => i.sector === alert.ward));
    };
    checkAdded();
    const unsub = plannerQueue.subscribe(checkAdded);
    return unsub;
  }, [alert.ward]);

  const handleSendToPlanner = () => {
    if (added) return;
    const defaultData = PREDEFINED_SECTORS[alert.ward] || PREDEFINED_SECTORS["Sector-03"]; // fallback just in case
    plannerQueue.add(defaultData);
  };

  const handleBroadcast = () => {
    toast.success(
      `Alert broadcast to Ward-12 ASHA team and Hospital Connect`,
      { duration: 4000, style: { borderRadius: "10px", fontSize: "13px" } }
    );
  };

  return (
    <AlertCard
      riskcolor={riskColor}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <AlertCardHeader riskcolor={riskColor}>
        <div>
          <AlertWard>{alert.ward}</AlertWard>
          <AlertDisease>{alert.disease} · {alert.days}-day forecast</AlertDisease>
        </div>
        <RiskBadge riskcolor={riskColor}>{alert.risk}</RiskBadge>
      </AlertCardHeader>
      <AlertCardBody>
        <ProbabilityBar>
          <ProbLabel>
            <span>Outbreak Probability</span>
            <span style={{ color: riskColor }}>{alert.probability}%</span>
          </ProbLabel>
          <BarTrack>
            <BarFill
              riskcolor={riskColor}
              initial={{ width: 0 }}
              animate={{ width: `${alert.probability}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </BarTrack>
        </ProbabilityBar>

        <ActionsList>
          {alert.actions.map((a) => (
            <ActionItem key={a}>{a}</ActionItem>
          ))}
        </ActionsList>

        <AlertActions>
          {added ? (
            <PrimaryBtn style={{ background: T.teal, cursor: 'default' }}>
              <FiCheckCircle size={14} /> ✓ Added
            </PrimaryBtn>
          ) : (
            <PrimaryBtn onClick={handleSendToPlanner} style={{ background: riskColor }}>
              <FiArrowRight size={14} /> Send to Planner
            </PrimaryBtn>
          )}
          <SecondaryBtn onClick={handleBroadcast}>
            <FiSend size={12} /> Approve &amp; Broadcast
          </SecondaryBtn>
        </AlertActions>
      </AlertCardBody>
    </AlertCard>
  );
};

// ─────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────
const FutureOverview = () => {
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState("dengue");
  const [forecastWindow, setForecastWindow] = useState("7");
  const [selectedSector, setSelectedSector] = useState("Sector-03");

  const diseaseTabs = [
    { key: "all", label: "All" },
    { key: "dengue", label: "Dengue" },
    { key: "malaria", label: "Malaria" },
    { key: "gastro", label: "Gastro" },
    { key: "respiratory", label: "Respiratory" },
  ];

  const sectorOptions = Object.keys(WARD_PREDICTIONS);

  return (
    <PageContainer>
      <PortalBanner portal="smc" />
      <Toaster position="top-right" />

      {/* ── HEADER ── */}
      <PageHeader>
        <HeaderBadge>
          <FiEye size={11} /> Predictive Intelligence
        </HeaderBadge>
        <PageTitle>Future Overview — Predictive Health Intelligence</PageTitle>
        <PageSubtitle>
          AI-projected disease risks and outbreak timelines. Aheadly sees what's coming before hospitals report it.
        </PageSubtitle>

        <CollapsiblePanel>
          <CollapsibleHeader onClick={() => setHowItWorksOpen((v) => !v)}>
            <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <FiInfo size={14} /> How does this work?
            </span>
            {howItWorksOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </CollapsibleHeader>
          <AnimatePresence initial={false}>
            {howItWorksOpen && (
              <CollapsibleBody
                key="body"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                Aheadly's predictive engine fuses four data streams to generate ward-level outbreak forecasts 7–14 days ahead of clinical reporting:
                <ul>
                  <li><strong>Satellite signals</strong> — NASA MODIS Land Surface Temperature and Sentinel-2 NDVI are ingested daily to detect heat anomalies and vegetation stress.</li>
                  <li><strong>Environmental sensing</strong> — Rainfall accumulation, drain network capacity, and water stagnation indices from IoT sensors.</li>
                  <li><strong>Community ground truth</strong> — Citizen reports from Aheadly's field app, geotagged and weighted by historical accuracy.</li>
                  <li><strong>HRI convergence model</strong> — When 4+ signals cross their threshold simultaneously, the Health Risk Index triggers a predictive alert.</li>
                </ul>
                Forecasts are updated every 6 hours. Confidence intervals widen beyond Day 10 due to atmospheric uncertainty.
              </CollapsibleBody>
            )}
          </AnimatePresence>
        </CollapsiblePanel>
      </PageHeader>

      {/* ── SECTION 1: OUTBREAK MAP ── */}
      <SectionCard>
        <SectionTitle>
          <FiMap size={18} /> Outbreak Prediction Map
        </SectionTitle>
        <SectionSubtitle>
          Ward-level disease outbreak probability. Click any ward for details and recommended actions.
        </SectionSubtitle>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <TabRow style={{ margin: 0 }}>
            {diseaseTabs.map((t) => (
              <Tab key={t.key} active={selectedDisease === t.key} onClick={() => setSelectedDisease(t.key)}>
                {t.label}
              </Tab>
            ))}
          </TabRow>
          <ForecastToggle>
            <ForecastBtn active={forecastWindow === "7"} onClick={() => setForecastWindow("7")}>
              7-day forecast
            </ForecastBtn>
            <ForecastBtn active={forecastWindow === "14"} onClick={() => setForecastWindow("14")}>
              14-day forecast
            </ForecastBtn>
          </ForecastToggle>
        </div>

        <OutbreakMap selectedDisease={selectedDisease} forecastWindow={forecastWindow} />
      </SectionCard>

      {/* ── SECTION 2: PREDICTIVE TIMELINE CHART ── */}
      <SectionCard>
        <SectionTitle>
          <FiTrendingUp size={18} /> Predictive Timeline
        </SectionTitle>
        <SectionSubtitle>
          30-day historical cases + 14-day AI forecast for selected ward and disease. Dashed line = prediction; shaded band = confidence interval.
        </SectionSubtitle>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
          <TabRow style={{ margin: 0 }}>
            {diseaseTabs.filter((t) => t.key !== "all").map((t) => (
              <Tab
                key={t.key}
                active={selectedDisease === t.key || (selectedDisease === "all" && t.key === "dengue")}
                onClick={() => setSelectedDisease(t.key)}
              >
                {t.label}
              </Tab>
            ))}
          </TabRow>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: T.muted, fontWeight: 600 }}>Ward:</span>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              style={{
                padding: "5px 10px",
                borderRadius: "8px",
                border: `1.5px solid ${T.border}`,
                fontSize: "0.8rem",
                color: T.text,
                background: "white",
                cursor: "pointer",
              }}
            >
              {sectorOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: T.muted }}>
            <div style={{ width: 24, height: 2, background: T.teal, borderRadius: 2 }} /> Historical
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: T.muted }}>
            <div style={{ width: 24, height: 2, background: T.danger, borderRadius: 2, borderTop: `2px dashed ${T.danger}` }} /> Predicted
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: T.muted }}>
            <div style={{ width: 12, height: 12, background: `${T.warning}22`, border: `1px solid ${T.warning}40`, borderRadius: 2 }} /> Confidence band
          </div>
        </div>

        <TimelineChart
          selectedDisease={selectedDisease === "all" ? "dengue" : selectedDisease}
          selectedSector={selectedSector}
        />
      </SectionCard>

      {/* ── SECTION 3: OUTBREAK ANATOMY ── */}
      <SectionCard>
        <SectionTitle>
          <FiZap size={18} /> Convergence Outbreak Anatomy — "How Aheadly Sees the Future"
        </SectionTitle>
        <SectionSubtitle>
          A real-time reconstruction of how multi-signal convergence triggers a predictive alert — days before any hospital sees a case.
        </SectionSubtitle>
        <OutbreakAnatomy />
      </SectionCard>

      {/* ── SECTION 4: ALERT CARDS ── */}
      <SectionCard>
        <SectionTitle>
          <FiAlertTriangle size={18} /> Active Predictive Alerts
        </SectionTitle>
        <SectionSubtitle>
          Auto-generated alerts for high-risk wards. Approve and broadcast to field teams, or route to the Intervention Planner.
        </SectionSubtitle>
        <AlertsGrid>
          {ALERTS.map((alert) => (
            <AlertCardComponent key={`${alert.ward}-${alert.disease}`} alert={alert} />
          ))}
        </AlertsGrid>
      </SectionCard>
      
      <PlannerPill />
    </PageContainer>
  );
};

export default FutureOverview;
