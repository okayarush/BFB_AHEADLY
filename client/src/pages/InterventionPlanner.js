import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiInfo,
  FiLayers,
  FiArrowRight,
  FiCheck,
  FiAlertTriangle,
  FiClipboard,
  FiMapPin,
  FiActivity,
  FiDroplet,
  FiTrash2,
  FiSun,
  FiTrendingDown,
  FiShield,
  FiX
} from "react-icons/fi";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import PortalBanner from "../components/common/PortalBanner";

const CARTO_KEY = process.env.REACT_APP_CARTO_API_KEY || "cb1_3hlv_1_982b84f1e84c5c6d42d8bd17";



// Services & Data
import SolapurBoundary from "../components/SolapurBoundary";
import SolapurWards from "../components/SolapurWards";
import BoundaryService from "../services/boundaryService";
import { INTERVENTION_IMPACT_MAP } from "../constants/interventionImpactMap";
import AnalysisModal from "../components/AnalysisModal";
import {
  plannerQueue,
  SECTOR_SELECTOR_OPTIONS,
  getSectorDataByName,
  mapSectorInterventions,
  calculateImpact
} from '../services/plannerState';
import toast, { Toaster } from "react-hot-toast";

// --- GLOBAL STYLES & LAYOUT ---

const PageContainer = styled.div`
  height: 100vh;
  width: 100%;
  background: #0f172a; /* Slate 900 */
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overflow-x: hidden;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.header`
  height: auto; /* Dynamic height for instructions */
  min-height: 60px;
  flex-shrink: 0;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #1e293b;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  background: #0f172a;
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem; /* Better spacing control */
`;

const Title = styled.h1`
  font-size: 1.25rem; /* Slightly larger */
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
  letter-spacing: -0.01em;
  line-height: 1.2;
`;



// --- MAIN LAYOUT GRID ---

const MainContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

// LEFT SIDEBAR: BASELINE CONTEXT (Fixed Width)
const Sidebar = styled.div`
  width: 380px;
  flex-shrink: 0;
  background: #0f172a;
  border-right: 1px solid #1e293b;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  
  /* Scrollbar */
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
`;

// RIGHT AREA: INTERVENTIONS + MAP
const RightArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #1e293b; /* Slightly lighter for map area context */
  overflow: hidden;
  min-width: 0; /* CRITICAL for flex overflow */
`;

// RIGHT TOP: INTERVENTION LIBRARY + PROJECTED OUTCOME
const ToolsPanel = styled.div`
  height: 480px; /* Increased height for richer content */
  flex-shrink: 0;
  display: flex;
  width: 100%;
  border-bottom: 1px solid #1e293b;
  background: #0f172a;
`;

const InterventionColumn = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  border-right: 1px solid #1e293b;
  min-width: 0;
  
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
`;

const OutcomeColumn = styled.div`
  width: 360px; /* Wider for explanations */
  padding: 1rem;
  background: #0f172a;
  overflow-y: auto;
  border-left: 1px solid #1e293b;
  min-width: 0;
`;

// RIGHT BOTTOM: MAP (Fixed Anchor)
const MapPanel = styled.div`
  flex: 1;
  position: relative;
  background: #020617;
  display: flex;
  flex-direction: column;
`;

// --- UI COMPONENTS ---

// Section Headers
const PanelHeader = styled.div`
  font-size: 0.85rem; /* Slightly larger */
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700; /* Bold */
  color: #cbd5e1; /* Higher contrast */
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg { color: ${props => props.iconColor || '#cbd5e1'}; }
`;

// HRI Score Card - Visual Anchor
const HriScoreCard = styled.div`
  background: #1e293b;
  border: 1px solid ${props => props.borderColor};
  border-left: 4px solid ${props => props.borderColor};
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  /* Glossy sheen effect */
  &::before {
    content: '';
    position: absolute;
    top: -50%; right: -50%;
    width: 200%; height: 200%;
    background: radial-gradient(circle, ${props => props.glowColor}10 0%, transparent 60%);
    pointer-events: none;
  }
`;

const ScoreValue = styled.div`
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
  color: ${props => props.color};
  letter-spacing: -0.03em;
  margin-bottom: 0.25rem;
`;

const ScoreLabel = styled.div`
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
  text-transform: uppercase;
`;

const Badge = styled.span`
  background: ${props => props.bg};
  color: ${props => props.color || '#fff'};
  font-size: 0.7rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-block;
  margin-bottom: 0.5rem;
`;

// Contributor Bars
const ContributorRow = styled.div`
  margin-bottom: 0.75rem;
`;

const ContributorLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
  color: #cbd5e1;
`;

const ProgressBarBg = styled.div`
  height: 6px;
  background: #334155;
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  width: ${props => props.width}%;
  background: ${props => props.color};
`;

// Intervention Cards (FULL TEXT)
const InterventionCard = styled(motion.div)`
  background: ${props => props.recommended ? 'linear-gradient(to right, #1e293b, #0f172a)' : '#1e293b'};
  border: 1px solid ${props => props.recommended ? '#3b82f640' : '#334155'};
  border-left: 3px solid ${props => props.recommended ? '#3b82f6' : 'transparent'};
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  &:hover {
    border-color: ${props => props.recommended ? '#3b82f6' : '#64748b'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
`;

const Button = styled.button`
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  white-space: nowrap;

  ${props => props.primary && `
    background: #3b82f6;
    color: white;
    &:hover { background: #2563eb; }
  `}
  
  ${props => props.secondary && `
    background: transparent;
    color: #94a3b8;
    border: 1px solid #475569;
    &:hover { color: #f8fafc; border-color: #94a3b8; }
  `}

  ${props => props.applied && `
    background: #10b981;
    color: #022c22;
    &:hover { background: #059669; }
  `}
    
    ${props => props.link && `
    background: transparent;
    color: #3b82f6;
    padding: 0;
    &:hover { text-decoration: underline; }
    `}
`;

// --- DYNAMIC GUIDANCE COMPONENT ---

const GuidanceStrip = styled.div`
  width: 100%;
  background: #0f172a;
  border-bottom: 1px solid #1e293b;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  z-index: 100;
`;

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: ${props => props.active ? 1 : props.completed ? 0.6 : 0.4};
  transition: all 0.3s;
  color: ${props => props.active ? '#3b82f6' : props.completed ? '#10b981' : '#94a3b8'};
  font-weight: ${props => props.active ? '700' : '500'};
`;

const StepNumber = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.active ? '#3b82f6' : props.completed ? '#10b981' : '#334155'};
  color: #fff;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
`;

// --- LOGIC HELPERS ---

const getSeverityColor = (score) => {
  if (score >= 80) return '#ef4444';
  if (score >= 65) return '#f97316';
  if (score >= 45) return '#eab308';
  return '#10b981';
};

const getCategoryColor = (category) => {
  switch (category) {
    case 'CRITICAL': return '#ef4444';
    case 'HIGH': return '#f97316';
    case 'MODERATE': return '#eab308';
    case 'GOOD': case 'LOW': return '#10b981';
    default: return '#94a3b8';
  }
};

const getContributorColor = (val) => {
  if (val >= 2.5) return '#ef4444';
  if (val >= 1.5) return '#f97316';
  if (val >= 0.5) return '#eab308';
  return '#10b981';
};

// 1. Dynamic Primary Drivers Logic
const getPrimaryDrivers = (contributors) => {
  const drivers = [];
  const sorted = Object.entries(contributors).sort(([, a], [, b]) => b - a);

  sorted.slice(0, 3).forEach(([key, val]) => {
    if (val < 0.5) return;

    let text = "";
    switch (key) {
      case 'vectorDensity':
        text = `High vector density (${val.toFixed(1)}) observed near water bodies, creating immediate breeding grounds for Aedes/Anopheles.`;
        break;
      case 'sanitationStress':
        text = `Sanitation stress score of ${val.toFixed(1)} indicates uncleared waste piles, directly contributing to pathogen spread.`;
        break;
      case 'waterStagnation':
        text = `Water stagnation (${val.toFixed(1)}) detected in drain networks, acting as a primary larval habitat.`;
        break;
      case 'heatExposure':
        text = `Elevated heat exposure (${val.toFixed(1)}) exacerbates vulnerability, especially when combined with other risk factors.`;
        break;
      case 'diseaseBurden':
        text = `Active disease reporting (${val.toFixed(1)}) suggests ongoing local transmission requiring containment.`;
        break;
      default:
        text = `Elevated ${key} levels contributing to overall environmental stress.`;
    }
    drivers.push(text);
  });

  if (drivers.length === 0) drivers.push("No critical environmental risk drivers currently identified.");
  return drivers;
};

// 2. Projected Explanation Logic
const getProjectedExplanation = (baseline, projection, interventionIds) => {
  if (!baseline || !projection || interventionIds.length === 0) return null;

  const delta = (baseline.score - projection.score).toFixed(1);
  const interventionNames = interventionIds.map(id => INTERVENTION_IMPACT_MAP[id]?.name).join(", ");

  let impactText = `Deployment of ${interventionIds.length} intervention(s) targets core risk drivers. `;
  if (delta > 2) impactText += "Projected impact is substantial, breaking major disease transmission chains.";
  else if (delta > 0.5) impactText += "Projected impact offers moderate relief, reducing immediate exposure.";
  else impactText += "Projected impact is marginal; consider more aggressive interventions.";

  return {
    recap: `Current Baseline HRI is ${baseline.score.toFixed(1)} (${baseline.category}).`,
    action: `Applying: ${interventionNames}.`,
    impact: `Total Risk Reduction: -${delta} points.`,
    narrative: impactText
  };
};

// --- MAIN COMPONENT ---

const InterventionPlanner = () => {
  const [selectedWard, setSelectedWard] = useState(null);
  const [baselineData, setBaselineData] = useState(null);
  const [selectedInterventions, setSelectedInterventions] = useState([]);
  const [currentImpact, setCurrentImpact] = useState(null); // State for impact panel
  const [availableInterventions, setAvailableInterventions] = useState([]);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [detailsModalId, setDetailsModalId] = useState(null);
  const [primaryDrivers, setPrimaryDrivers] = useState([]);
  
  const [queuedItems, setQueuedItems] = useState([]);
  const [activeTabs, setActiveTabs] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    setQueuedItems(plannerQueue.getUnconsumed());
    const unsub = plannerQueue.subscribe(() => {
      setQueuedItems(plannerQueue.getUnconsumed());
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (selectedWard) return;
    if (queuedItems.length > 0) {
      const rankedQueue = [...queuedItems].sort((a, b) => (b.hri || 0) - (a.hri || 0));
      handleWardSelect({ properties: { Name: rankedQueue[0].sector } });
      return;
    }
    // Do not select a default ward if the queue is empty
  }, [queuedItems, selectedWard]);

  // Map Controller
  const MapController = () => {
    const map = useMap();
    useEffect(() => {
      const fitSoloBounds = async () => {
        try {
          const bounds = await BoundaryService.getBounds();
          if (bounds) map.fitBounds(bounds, { padding: [30, 30] });
        } catch (err) { }
      };
      fitSoloBounds();
    }, [map]);
    return null;
  };

  const handleWardSelect = (feature) => {
    if (!feature?.properties) return;
    const name = feature.properties.Name;
    const sectorData = getSectorDataByName(name);

    setSelectedWard(feature);
    setSelectedInterventions([]);
    setCurrentImpact(null); // Reset impact on new ward selection

    setBaselineData({
      score: sectorData.hri,
      category: sectorData.severity,
      disease: sectorData.disease,
      contributors: sectorData.contributors
    });
    setPrimaryDrivers(sectorData.primaryRiskDrivers || []);
    setAvailableInterventions(mapSectorInterventions(sectorData.name));
  };

  const handleLoadPlanner = () => {
    const newTabs = [...activeTabs];
    const rankMap = SECTOR_SELECTOR_OPTIONS.reduce((acc, item, index) => {
      acc[item.name] = index;
      return acc;
    }, {});
    
    queuedItems.forEach(item => {
      if (!newTabs.some(t => t.sector === item.sector)) newTabs.push(item);
      plannerQueue.markConsumed(item.sector);
      toast.success(`${item.sector} ${item.disease} alert loaded into planner`, {
        duration: 3000,
        style: { borderRadius: "8px", fontSize: "14px", background: '#1e293b', color: '#fff', border: '1px solid #14b8a6' }
      });
    });

    newTabs.sort((a, b) => {
      const aRank = rankMap[a.sector] ?? Number.MAX_SAFE_INTEGER;
      const bRank = rankMap[b.sector] ?? Number.MAX_SAFE_INTEGER;
      return aRank - bRank;
    });
    
    setActiveTabs(newTabs);
    if (newTabs.length > 0) handleWardSelect({ properties: { Name: newTabs[0].sector } });
  };

  // Recalculate impact whenever applied interventions change
  useEffect(() => {
    if (!selectedWard || selectedInterventions.length === 0) {
      setCurrentImpact(null);
      return;
    }

    const sectorData = getSectorDataByName(selectedWard.properties.Name);
    const selectedNames = availableInterventions
      .filter((item) => selectedInterventions.includes(item.id))
      .map((item) => item.name);

    const impactResult = calculateImpact(sectorData.name, selectedNames);
    
    if (impactResult) {
      let narrative = 'Initial action underway. Partial HRI reduction projected.';
      if (impactResult.appliedCount === 2) {
        narrative = `Combined approach projects ${impactResult.reduction}-point HRI reduction within ${impactResult.timelineDays} days. ${impactResult.caseReduction}% case reduction likely.`;
      }
      if (impactResult.appliedCount >= 3) {
        narrative = `Comprehensive ${impactResult.appliedCount}-action deployment projects HRI reduction from ${impactResult.baseHRI} → ${impactResult.projectedHRI} within ${impactResult.timelineDays} days. ${impactResult.caseReduction}% case reduction. Outbreak containment probability elevated.`;
      }

      setCurrentImpact({
        score: impactResult.projectedHRI,
        category: impactResult.projectedSeverity,
        explanation: {
          action: `Applying: ${selectedNames.join(', ')}.`,
          narrative,
          impact: `Projected effect within ${impactResult.timelineDays} days`,
          appliedSummary: `Applied interventions: ${impactResult.appliedCount} of ${impactResult.totalInterventions}`,
          reduction: impactResult.reduction
        }
      });
    } else {
      setCurrentImpact(null);
    }
  }, [selectedInterventions, selectedWard, availableInterventions]);

  const toggleIntervention = (id) => {
    setSelectedInterventions(prev => {
      const isSel = prev.includes(id);
      if (!isSel && selectedWard) {
        const item = availableInterventions.find(i => i.id === id);
        const logMsg = `[${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}] ${item.name} — ${selectedWard.properties.Name} — Initiated by SMC Admin`;
        setLogs(l => [...l, logMsg]);
      }
      return isSel ? prev.filter(x => x !== id) : [...prev, id];
    });
  };

  // Guidance Logic
  const getStepStatus = (step) => {
    // 1: Select Ward, 2: Review Risks, 3: Implement, 4: Impact
    let currentStep = 1;
    if (selectedWard) currentStep = 2; // Default after selection

    // If interventions are applied, we are in implementation
    if (selectedWard && selectedInterventions.length > 0) currentStep = 3;

    // If impact is being shown (conceptually redundant with 3, but emphasizes the right panel)
    if (selectedWard && selectedInterventions.length > 0 && currentImpact) currentStep = 4;

    if (currentStep === step) return 'active';
    if (currentStep > step) return 'completed';
    return 'pending';
  };

  const currentStep = selectedWard && selectedInterventions.length > 0 ? 4 : selectedWard ? 2 : 1;

  return (
    <PageContainer>
      <Toaster position="top-right" />
      <PortalBanner portal="smc" />
      <Header>
        <TitleGroup>
          <Title>Intervention Planning Command</Title>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.5rem', maxWidth: '650px', lineHeight: '1.5', whiteSpace: 'normal', fontWeight: '400' }}>
            This workspace helps the Solapur Municipal Corporation reduce ward-level public health risk before outbreaks escalate.
          </div>
        </TitleGroup>
      </Header>
      
      {queuedItems.length > 0 && (
        <div style={{ background: '#1a2820', borderTop: '1px solid #14b8a6', borderBottom: '1px solid #14b8a6', borderLeft: '4px solid #14b8a6', width: '100%', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 600 }}>
            {queuedItems.length === 1 
              ? `📋 1 alert from Future Overview loaded — ${queuedItems[0].sector} (${queuedItems[0].disease} · ${queuedItems[0].severity} · HRI ${queuedItems[0].hri.toFixed(1)})`
              : `📋 ${queuedItems.length} alerts from Future Overview — ${queuedItems.map(i => i.sector).join(', ')}`
            }
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button primary style={{background: '#14b8a6', color: '#000'}} onClick={handleLoadPlanner}>Load into Planner →</Button>
            <Button secondary onClick={() => queuedItems.forEach(i => plannerQueue.markConsumed(i.sector))}>Dismiss</Button>
          </div>
        </div>
      )}
      
      {activeTabs.length > 0 && (
        <div style={{ background: '#0f172a', padding: '10px 20px', display: 'flex', gap: '10px', borderBottom: '1px solid #1e293b' }}>
          {activeTabs.map(tab => {
            const isCritical = tab.severity === 'CRITICAL';
            const color = isCritical ? '#ef4444' : '#f97316';
            const bg = (selectedWard?.properties?.Name === tab.sector) ? `${color}22` : 'transparent';
            
            return (
              <button key={tab.sector} onClick={() => handleWardSelect({ properties: { Name: tab.sector } })} style={{ 
                padding: '6px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                background: bg,
                color: color,
                border: `1.5px solid ${color}`
              }}>
                {tab.sector} {isCritical ? '⚡' : '⚠'}
              </button>
            );
          })}
        </div>
      )}

      <MainContent>
        {/* --- LEFT SIDEBAR: BASELINE --- */}
        <Sidebar>
          <div style={{ padding: '1.5rem' }}>
            <PanelHeader iconColor="#3b82f6"><FiInfo /> Baseline Health Context</PanelHeader>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.5', whiteSpace: 'normal' }}>
              This panel summarizes the current public health risk in the selected ward using live Digital Twin data.
            </div>

            {selectedWard && baselineData ? (
              <>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem', color: '#fff' }}>
                  {selectedWard.properties.Name}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                  Ward Analysis • Live Digital Twin Feed
                </div>

                <HriScoreCard
                  borderColor={getCategoryColor(baselineData.category)}
                  glowColor={getCategoryColor(baselineData.category)}
                >
                  <Badge bg={getCategoryColor(baselineData.category)}>
                    {baselineData.category} RISK
                  </Badge>
                  <ScoreValue color={getCategoryColor(baselineData.category)}>
                    {baselineData.score.toFixed(1)}
                    <span style={{ fontSize: '1.5rem', color: '#64748b', fontWeight: '400' }}>/100</span>
                  </ScoreValue>
                  <ScoreLabel>Current Health Risk Index</ScoreLabel>
                </HriScoreCard>

                <div style={{ marginBottom: '2rem' }}>
                  <PanelHeader><FiActivity /> Risk Contributors</PanelHeader>
                  {[...(baselineData.contributors || [])]
                    .sort((a, b) => (b.score || 0) - (a.score || 0))
                    .map((item) => (
                      <ContributorRow key={item.source}>
                        <ContributorLabel>
                          <span>{item.icon} {item.source}</span>
                          <strong style={{ color: item.color || getContributorColor(item.score || 0) }}>{(item.score || 0).toFixed(1)} / {(item.max || 0).toFixed(1)}</strong>
                        </ContributorLabel>
                        <ProgressBarBg>
                          <ProgressBarFill
                            width={item.max ? ((item.score || 0) / item.max) * 100 : 0}
                            color={item.color || getContributorColor(item.score || 0)}
                          />
                        </ProgressBarBg>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem' }}>{item.note}</div>
                      </ContributorRow>
                    ))
                  }
                </div>

                <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
                  <PanelHeader iconColor="#eab308"><FiAlertTriangle /> Primary Risk Drivers</PanelHeader>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.85rem', lineHeight: '1.6', color: '#cbd5e1' }}>
                    {primaryDrivers.map((text, i) => (
                      <li key={i} style={{ marginBottom: '0.75rem' }}>{text}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
                <FiMapPin size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>Select a ward to view baseline data.</p>
              </div>
            )}
          </div>
        </Sidebar>

        {/* --- RIGHT AREA --- */}
        <RightArea>
          <ToolsPanel>
            {/* CENTER: INTERVENTIONS */}
            <InterventionColumn>
              <PanelHeader iconColor="#10b981"><FiLayers /> SMC Intervention Library</PanelHeader>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.5', whiteSpace: 'normal' }}>
                Based on ward conditions, AHEADLY recommends specific actions the Solapur Municipal Corporation can take to reduce health risk.
              </div>

              {!selectedWard ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                  <FiMapPin size={40} style={{ marginBottom: '1rem', color: '#334155' }} />
                  <h3 style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '600' }}>Select a Ward to View AI-Actionable Interventions</h3>
                  <p style={{ fontSize: '0.85rem', lineHeight: '1.5', maxWidth: '300px', margin: '0 auto' }}>
                    Click on any ward on the map to analyze public health risk. Once selected, AHEADLY will recommend targeted actions.
                  </p>
                </div>
              ) : (
                <div style={{ opacity: selectedWard ? 1 : 0.5 }}>
                  {availableInterventions.map(item => {
                    const isRec = Boolean(item.tag);
                    const isSel = selectedInterventions.includes(item.id);

                    return (
                      <InterventionCard key={item.id} recommended={isRec}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '1rem', color: '#f8fafc', marginBottom: '0.25rem' }}>
                              {item.name}
                            </div>
                            {isRec && <Badge bg="#14b8a6" style={{ marginBottom: '0.5rem', fontSize: '0.65rem', color: '#000' }}>⚡ RECOMMENDED FROM ALERT</Badge>}
                          </div>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '0.5rem', whiteSpace: 'normal' }}>
                          {item.description}
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                          <Button
                            applied={isSel}
                            primary={!isSel}
                            onClick={() => toggleIntervention(item.id)}
                            style={{ flex: 1 }}
                          >
                            {isSel ? <><FiCheck /> Applied</> : "Implement Action"}
                          </Button>
                          <Button
                            secondary
                            onClick={() => setDetailsModalId(item.id)}
                            style={{ flex: 1 }}
                          >
                            <FiInfo /> View Details
                          </Button>
                        </div>
                      </InterventionCard>
                    );
                  })}
                </div>
              )}
            </InterventionColumn>

            {/* DETAILS MODAL OVERLAY */}
            <AnimatePresence>
              {detailsModalId && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setDetailsModalId(null)}>
                  <motion.div
                    initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
                    style={{
                      width: '550px',
                      maxHeight: '90vh',
                      overflowY: 'auto',
                      background: '#0f172a',
                      borderRadius: '12px',
                      padding: '2rem',
                      border: '1px solid #334155',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    {(() => {
                      const item = availableInterventions.find(i => i.id === detailsModalId);
                      if (!item) return null;
                      return (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                            <div>
                              <h2 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1.5rem' }}>{item.name}</h2>
                              <Badge bg="#1e293b" color="#94a3b8">Municipal Action Brief</Badge>
                            </div>
                            <Button secondary onClick={() => setDetailsModalId(null)} style={{ padding: '0.5rem' }}><FiX size={18} /></Button>
                          </div>

                          <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ color: '#fff', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>1. Intervention Overview</h4>
                            <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.9rem', whiteSpace: 'normal' }}>{item.description}</p>
                          </div>

                          <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ color: '#fff', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>2. Recommended for Ward Context</h4>
                            <div style={{ background: '#3b82f610', border: '1px solid #3b82f640', padding: '1rem', borderRadius: '8px' }}>
                              <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                This intervention specifically addresses <strong>{item.riskDrivers.join(' & ')}</strong>.
                                In the current ward, these factors are contributing significantly to the HRI score.
                              </p>
                            </div>
                          </div>

                          <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ color: '#fff', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>3. Implementation Steps (SMC)</h4>
                            <ul style={{ paddingLeft: '1.25rem', color: '#cbd5e1', lineHeight: '1.7', fontSize: '0.9rem' }}>
                              {item.executionSteps?.map((step, idx) => (
                                <li key={idx} style={{ marginBottom: '0.5rem' }}>{step}</li>
                              ))}
                            </ul>
                          </div>

                          <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ color: '#fff', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>4. Expected Public Health Impact</h4>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#064e3b', padding: '1rem', borderRadius: '8px' }}>
                              <FiShield size={24} color="#34d399" />
                              <p style={{ margin: 0, color: '#ecfdf5', fontSize: '0.9rem', fontWeight: '500', lineHeight: '1.5' }}>{item.expectedHealthImpact}</p>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Effort Required</div>
                              <div style={{ color: '#fff', fontWeight: '600' }}>{item.effort}</div>
                            </div>
                            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Cost Category</div>
                              <div style={{ color: '#fff', fontWeight: '600' }}>{item.costCategory}</div>
                            </div>
                          </div>

                          <Button primary onClick={() => setDetailsModalId(null)} style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
                            Acknowledge Brief
                          </Button>
                        </>
                      );
                    })()}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* RIGHT: OUTCOME */}
            <OutcomeColumn>
              <PanelHeader iconColor="#eab308"><FiArrowRight /> Expected Health Impact</PanelHeader>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.5', whiteSpace: 'normal' }}>
                This panel shows how selected actions could improve health conditions in the ward.
              </div>

              {selectedWard && currentImpact ? (
                <>
                  <HriScoreCard
                    borderColor={getCategoryColor(currentImpact.category)}
                    glowColor={getCategoryColor(currentImpact.category)}
                  >
                    <Badge bg={getCategoryColor(currentImpact.category)}>
                      PROJECTED RISK
                    </Badge>
                    <ScoreValue color={getCategoryColor(currentImpact.category)}>
                      {currentImpact.score.toFixed(1)}
                      <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500', marginLeft: '0.5rem' }}>
                        (↓ {currentImpact.explanation.reduction.toFixed(1)} pts)
                      </span>
                    </ScoreValue>
                    <ScoreLabel>Projected Health Risk Index</ScoreLabel>
                  </HriScoreCard>

                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.6' }}>
                    <p style={{ marginBottom: '0.75rem' }}>
                      <strong>Applied Interventions:</strong> {currentImpact.explanation.appliedSummary}
                    </p>
                    <p style={{ marginBottom: '0.75rem' }}>
                      <strong>Action Strategy:</strong> {currentImpact.explanation.action}
                    </p>
                    <p style={{ marginBottom: '1.5rem', color: '#e2e8f0', background: '#1e293b', padding: '0.75rem', borderRadius: '4px' }}>
                      {currentImpact.explanation.narrative}
                    </p>
                    <p style={{ fontWeight: '600', color: '#a7f3d0' }}>
                      {currentImpact.explanation.impact}
                    </p>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}
                >
                  <FiShield size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p>Implement actions to see detailed health impact projections.</p>
                </motion.div>
              )}
              
              {logs.length > 0 && (
                <div style={{ marginTop: 'auto', borderTop: '1px solid #1e293b', paddingTop: '1.5rem' }}>
                  <PanelHeader>Activity Log</PanelHeader>
                  <div style={{maxHeight: 120, overflowY: 'auto'}}>
                    {logs.map((log, i) => (
                      <div key={i} style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px', lineHeight: 1.4 }}>{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </OutcomeColumn>
          </ToolsPanel>

          {/* BOTTOM HALF: MAP */}
          <MapPanel>
            <GuidanceStrip>
              <StepIndicator active={!selectedWard} completed={selectedWard}>
                <StepNumber active={!selectedWard} completed={selectedWard}>{selectedWard ? <FiCheck size={12} /> : '1'}</StepNumber>
                Select Ward
              </StepIndicator>
              <div style={{ width: '40px', height: '1px', background: '#334155' }} />

              <StepIndicator active={selectedWard && selectedInterventions.length === 0} completed={selectedInterventions.length > 0}>
                <StepNumber active={selectedWard && selectedInterventions.length === 0} completed={selectedInterventions.length > 0}>{selectedInterventions.length > 0 ? <FiCheck size={12} /> : '2'}</StepNumber>
                Review Risks
              </StepIndicator>
              <div style={{ width: '40px', height: '1px', background: '#334155' }} />

              <StepIndicator active={selectedInterventions.length > 0 && selectedInterventions.length < 2} completed={selectedInterventions.length >= 2}> {/* Arbitrary completion for step 3 */}
                <StepNumber active={selectedInterventions.length > 0} completed={selectedInterventions.length >= 2}>3</StepNumber>
                Implement Actions
              </StepIndicator>
              <div style={{ width: '40px', height: '1px', background: '#334155' }} />

              <StepIndicator active={selectedInterventions.length > 0} completed={false}>
                <StepNumber active={selectedInterventions.length > 0} completed={false}>4</StepNumber>
                See Impact
              </StepIndicator>
            </GuidanceStrip>

            <MapContainer
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%", background: '#020617' }}
            >
              <MapController />
              <TileLayer
                url={CARTO_KEY
                  ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`
                  : "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"}
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                maxZoom={16}
              />
              <SolapurBoundary showGlow={true} />
              <SolapurWards
                onWardSelect={handleWardSelect}
                selectedWardId={selectedWard?.properties?.Name}
              />
            </MapContainer>

            {!selectedWard && (
              <div style={{
                position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
                zIndex: 1000, background: '#0f172aee', padding: '0.75rem 1.5rem',
                borderRadius: '9999px', border: '1px solid #3b82f6', color: '#fff', fontSize: '0.9rem',
                display: 'flex', gap: '0.5rem', alignItems: 'center', backdropFilter: 'blur(4px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)', fontWeight: '600'
              }}>
                <FiMapPin /> Step 1: Select a ward on the map to begin public health planning
              </div>
            )}
          </MapPanel>
        </RightArea>
      </MainContent>

      <AnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        data={{
          ward: selectedWard,
          baselineHRI: baselineData,
          environmentalData: null
        }}
      />
    </PageContainer>
  );
};

export default InterventionPlanner;
