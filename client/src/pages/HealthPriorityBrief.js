import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import {
    FiActivity,
    FiAlertTriangle,
    FiClipboard,
    FiPrinter,
    FiShield,
    FiClock,
    FiTarget,
    FiTrendingUp,
    FiFileText,
    FiMapPin,
    FiDownload,
    FiDroplet,
    FiTrash2,
    FiThermometer,
    FiCheckCircle,
    FiArrowRight,
    FiEdit3,
    FiInfo,
    FiX,
    FiArrowDown,
    FiSend
} from 'react-icons/fi';
import BoundaryService from '../services/boundaryService';
import { getSectorID } from '../utils/HospitalRegistry';
import { DiseaseDataManager } from '../utils/DiseaseDataManager';
import { formatDiseaseSignalFromData } from '../services/diseaseService';
import { rankInterventions } from '../utils/interventionLogic';
import PortalBanner from '../components/common/PortalBanner';
import { SECTOR_HEALTH_PROFILES } from '../services/plannerState';


// --- STYLED COMPONENTS ---

const Container = styled.div`
  height: 100vh;
  width: 100%;
  background: #0f172a;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
`;

// LANDING HEADER
const LandingHeader = styled.div`
  padding: 1.5rem 2rem;
  background: #0f172a;
  border-bottom: 1px solid #1e293b;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HeaderTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  letter-spacing: -0.02em;
`;

const HeaderSubtitle = styled.div`
  font-size: 1rem;
  color: #94a3b8;
  max-width: 800px;
  line-height: 1.5;
`;

const HeaderBottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const HeaderCTAButton = styled.button`
  background: ${props => props.disabled ? '#1e293b' : '#3b82f6'};
  color: ${props => props.disabled ? '#64748b' : 'white'};
  border: 1px solid ${props => props.disabled ? '#334155' : 'transparent'};
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s;
  box-shadow: ${props => props.disabled ? 'none' : '0 4px 6px -1px rgba(59, 130, 246, 0.4)'};
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover {
    background: ${props => props.disabled ? '#1e293b' : '#2563eb'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 6px 8px -1px rgba(59, 130, 246, 0.5)'};
  }
`;

const ExplainerRow = styled.div`
  display: flex;
  gap: 2rem;
  /* margin-top managed by container */
`;

const ExplainerStep = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: ${props => props.active ? '#3b82f6' : '#64748b'};
  font-weight: ${props => props.active ? '600' : '500'};
  opacity: ${props => props.muted ? 0.5 : 1};
`;

const StepNumber = styled.div`
  width: 24px; 
  height: 24px;
  border-radius: 50%;
  background: ${props => props.active ? '#3b82f6' : '#1e293b'};
  border: 1px solid ${props => props.active ? '#3b82f6' : '#334155'};
  color: ${props => props.active ? '#fff' : '#94a3b8'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
`;

const ContentGrid = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 380px 1fr;
  overflow: hidden;
`;

const MapPanel = styled.div`
  background: #020617;
  border-right: 1px solid #1e293b;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const MainPanel = styled.div`
  background: #0f172a;
  padding: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
`;

const BriefContent = styled.div`
  padding: 2.5rem;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #64748b;
  text-align: center;
  padding: 3rem;
  gap: 1.5rem;
  
  svg { 
    font-size: 4rem; 
    color: #1e293b;
    margin-bottom: 0.5rem;
  }
  
  h3 {
    font-size: 1.25rem;
    color: #e2e8f0;
    margin: 0;
  }
  
  p {
    max-width: 400px;
    font-size: 0.95rem;
    line-height: 1.6;
  }
`;

// --- WIDGETS ---

const Section = styled.div`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid #1e293b;
  padding-bottom: 0.75rem;
  
  svg { color: #3b82f6; }
`;

const SummaryCard = styled.div`
  background: #1e293b;
  border-radius: 12px;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2rem;
  border: 1px solid #334155;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);
`;

const DataPoint = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    font-size: 0.75rem;
    color: #94a3b8;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.05em;
  }
  
  div.value {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  div.sub {
    font-size: 0.85rem;
    color: #cbd5e1;
  }
`;

const DriverRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1.25rem;
  background: ${props => props.isPrimary ? 'rgba(239, 68, 68, 0.1)' : '#1e293b'};
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid ${props => props.isPrimary ? '#ef444440' : '#334155'};
`;

const DriverIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.bg};
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const ActionCard = styled.div`
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  transition: all 0.2s;
  
  &:hover {
    border-color: #3b82f6;
    background: #0f172a;
  }
`;

const ActionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ActionTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
`;

const ActionDept = styled.div`
  font-size: 0.8rem;
  color: #94a3b8;
  background: #0f172a;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  border: 1px solid #334155;
  text-transform: uppercase;
  font-weight: 600;
`;

const ActionDetailRow = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;

  label {
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    padding-top: 3px;
  }

  div {
    color: #cbd5e1;
    line-height: 1.5;
  }
`;

const VerticalGuidancePill = styled(motion.div)`
  position: fixed;
  right: 2rem;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(59, 130, 246, 0.3);
  padding: 1rem 0.5rem;
  border-radius: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  z-index: 50;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.2);
  pointer-events: none;
  
  span {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #cbd5e1;
    transform: rotate(180deg);
  }

  animation: pulse-glow 2s infinite;

  @keyframes pulse-glow {
    0% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.2); }
    50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
    100% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.2); }
  }
`;

const ActionFooter = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #334155;
  display: flex;
  justify-content: flex-end;
`;

const PrimaryButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4);

  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.5);
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: #94a3b8;
  border: 1px solid #475569;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    color: white;
    border-color: #94a3b8;
    background: rgba(255,255,255,0.05);
  }
`;

const JustificationBox = styled.div`
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  margin-top: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  line-height: 1.5;
`;

// --- PREVIEW MODE STYLES ---
const PreviewPaper = styled.div`
  background: white;
  color: #1e293b;
  padding: 4rem;
  font-family: 'Times New Roman', serif;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  margin-bottom: 2rem;
  border-radius: 4px;
`;

// --- LOGIC HELPERS ---

const getRiskColor = (score) => {
    if (score >= 80) return '#cc2200';
    if (score >= 65) return '#ff4444';
    if (score >= 45) return '#ff8c42';
    return '#2dd48a';
};

// --- COMPONENT ---

const HealthPriorityBrief = () => {
    const [wardsGeo, setWardsGeo] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);
    const [clinicalData, setClinicalData] = useState(null);
    const [priorityInfo, setPriorityInfo] = useState(null);

    // Debug Log to confirm update
    useEffect(() => { console.log("HealthPriorityBrief Loaded - vStrict_Data_Fix"); }, []);
    const [interventions, setInterventions] = useState([]);
    const [viewMode, setViewMode] = useState('landing');
    const [detailsModalItem, setDetailsModalItem] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [advisoryModal, setAdvisoryModal] = useState(false);
    const [advisoryMessage, setAdvisoryMessage] = useState('');
    const [selectedPreset, setSelectedPreset] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);
    const panelRef = useRef(null);

    // Force re-render on global data update (SST Sync)
    useEffect(() => {
        const handleDataUpdate = () => {
            if (selectedWard) handleWardSelect(selectedWard);
        };
        window.addEventListener('urbanome-data-update', handleDataUpdate);
        return () => window.removeEventListener('urbanome-data-update', handleDataUpdate);
    }, [selectedWard]);

    const handleScroll = () => {
        if (panelRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = panelRef.current;
            const progress = scrollTop / (scrollHeight - clientHeight);
            setScrollProgress(progress);
        }
    };

    const handleGenerate = () => {
        if (!selectedWard) return;
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setViewMode('preview');
        }, 3500);
    };

    useEffect(() => {
        async function load() {
            try {
                const geo = await BoundaryService.loadWardData();
                setWardsGeo(geo);
            } catch (e) { console.error(e); }
        }
        load();
    }, []);

    // --- STRICT DATA VALIDATION ---
    const validateDataIntegrity = (signal, sourceData) => {
        if (!sourceData) return false;

        // Match Primary Disease Count
        // Note: signal.primary might be "Dengue" but sourceData has lowercase keys.
        // We map standard keys to check.
        const keyMap = {
            'Dengue': 'dengue', 'Malaria': 'malaria', 'Chikungunya': 'chikungunya',
            'Acute Diarrheal Disease': 'add', 'Cholera': 'cholera', 'Typhoid': 'typhoid',
            'Acute Respiratory Infection': 'ari', 'Influenza-Like Illness': 'ili',
            'Heat Stress': 'heat'
        };

        const dbKey = keyMap[signal.primary.name];
        const sourceCount = sourceData[dbKey] || 0;

        if (signal.primary.activeCases !== sourceCount && signal.primary.name !== 'No Active Signal') {
            console.error(`DATA INTEGRITY FAIL: Policy Brief (${signal.primary.activeCases}) != Digital Twin (${sourceCount}) for ${signal.primary.name}`);
            return false;
        }
        return true;
    };


    const handleWardSelect = async (feature) => {
        setSelectedWard(feature);
        setViewMode('analysis');

        const rawName = feature.properties.Name;
        const sectorId = getSectorID(rawName);

        try {
            // STEP 3 — SINGLE SOURCE OF TRUTH (EXACT)
            const aggregates = DiseaseDataManager.getWardAggregates();
            const wardData = aggregates[sectorId] || { dengue: 0, total: 0 };

            // STEP 4 — DISEASE DISPLAY RULES (ABSOLUTE)
            const signal = formatDiseaseSignalFromData(sectorId, wardData);
            const primary = signal.primary;

            // STEP 5 — HARD VALIDATION GUARD
            if (!validateDataIntegrity(signal, wardData)) {
                alert("CRITICAL ERROR: Data Sync Mismatch. The Policy Brief is out of sync with the Digital Twin. Please refresh.");
                return;
            }

            // STEP 7 — FAIL-SAFE GUARD
            if (!primary || typeof primary.activeCases === 'undefined') {
                console.error("DATA_MISMATCH_DETECTED: Policy Brief is not receiving expected structure from Digital Twin.");
                alert("CRITICAL ERROR: Data Sync Failed. Refresh.");
                return;
            }

            // Use SECTOR_HEALTH_PROFILES (same as DigitalTwin)
            const profile = SECTOR_HEALTH_PROFILES[sectorId];
            const hriScore = profile?.hri ?? 40;
            const hriData = { score: hriScore, contributors: profile?.contributors || {} };
            const ranked = rankInterventions(hriData.contributors, signal);

            // STRICT ACTION FILTERING: Primary Disease Type Only
            const topActions = ranked.filter(action => {
                // Manual Map of ID -> Disease Type Relevance
                // Vector: 'fogging-campaign', 'disease-surveillance'
                // Water: 'sanitation-response', 'drain-desilting'
                // Respiratory: 'mobile-health-camp'

                if (primary.type === 'Vector-Borne') {
                    return ['fogging-campaign', 'disease-surveillance', 'source-reduction'].includes(action.id);
                }
                if (primary.type === 'Water-Borne') {
                    return ['sanitation-response', 'drain-desilting', 'chlorine-distribution'].includes(action.id);
                }
                if (primary.type === 'Respiratory') {
                    return ['mobile-health-camp', 'mask-distribution'].includes(action.id);
                }
                if (primary.type === 'Heat-Related') {
                    return ['cool-roofing', 'hydration-points'].includes(action.id);
                }
                return false;
            }).slice(0, 4);

            setClinicalData({
                ...primary, // Flatten primary for easy access
                type: primary.type,
                name: primary.name,
                activeCases: primary.activeCases,
                trend: primary.trend,
                cluster: primary.cluster,
                transmission: primary.transmission,
                secondary: signal.secondary,
                score: hriData.score, // Already 0-100 scale
                contributors: hriData.contributors
            });

            setInterventions(topActions);

            // Determine Priority Level (Visual only, data uses strict fields)
            let level = 'ROUTINE MONITORING';
            let color = '#2dd48a';
            let reason = 'No active transmission chains detected.';

            if (primary.activeCases > 0) {
                if (primary.trend === 'Rising' || primary.trend === 'Surge') {
                    level = 'URGENT RESPONSE';
                    color = '#cc2200';
                    reason = `Active ${primary.name} transmission (${primary.activeCases} cases) with ${primary.trend} trend requires immediate intervention.`;
                } else {
                    level = 'HIGH PRIORITY';
                    color = '#ff4444';
                    reason = `Active ${primary.name} cases (${primary.activeCases}) present but stable. Containment required.`;
                }
            } else if (hriData.score >= 80) {
                level = 'CRITICAL RISK';
                color = '#cc2200';
                reason = `Critical environmental risk (HRI ${hriData.score.toFixed(1)}) indicates severe health vulnerability.`;
            } else if (hriData.score >= 65) {
                level = 'HIGH RISK';
                color = '#ff4444';
                reason = `High environmental risk (HRI ${hriData.score.toFixed(1)}) supports disease amplification potential.`;
            } else if (hriData.score >= 45) {
                level = 'MODERATE RISK';
                color = '#ff8c42';
                reason = `Moderate environmental risk (HRI ${hriData.score.toFixed(1)}) requires ongoing surveillance.`;
            }

            setPriorityInfo({ level, color, reason });

        } catch (e) {
            console.error(e);
            alert("CRITICAL ERROR: Data Sync Failed. Refresh.");
        }
    };

    const getPresets = () => {
        const ward = selectedWard.properties.Name;
        const urgency = priorityInfo.level;
        const riskEmoji = urgency === 'URGENT RESPONSE' ? '🔴' : urgency === 'HIGH PRIORITY' ? '🟠' : urgency === 'MODERATE RISK' ? '🟡' : '🟢';
        const autoActions = interventions.slice(0, 3).map(a => `• ${a.name}`).join('\n');
        return [
            {
                label: 'Auto-Generated', sublabel: 'Based on live ward data', icon: '🤖',
                message: `🚨 *Public Health Advisory*\n📍 *${ward}* — Solapur\n⚠️ Risk Level: *${urgency}* ${riskEmoji}\n\n🧠 *What's happening:*\n${priorityInfo.reason}\n\n👉 *What you should do:*\n${autoActions || '• Follow standard health precautions'}\n\n🏥 *If symptoms appear:*\nFever, fatigue, or sudden illness → contact your nearest health centre immediately\n\n🔄 Status: Monitoring Active\n📡 Source: Aheadly Health System`
            },
            {
                label: 'Dengue / Vector Alert', sublabel: 'Mosquito breeding risk', icon: '🦟',
                message: `🚨 *Dengue Risk Alert*\n📍 *${ward}* — Solapur\n⚠️ High Risk 🟠\n\n🧠 *What's happening:*\nIncreased mosquito breeding and dengue cases detected nearby.\n\n👉 *What you should do:*\n• Remove stagnant water around home\n• Use mosquito repellent / nets\n• Avoid outdoor exposure during evening\n\n🏥 *If symptoms appear:*\nFever, joint pain → seek medical care immediately\n\n🔄 Status: Control measures ongoing\n📡 Source: Aheadly Health System`
            },
            {
                label: 'Water Contamination', sublabel: 'Drain / pipeline risk', icon: '💧',
                message: `🚨 *Water Contamination Alert*\n📍 *${ward}* — Solapur\n⚠️ High Risk 🔴\n\n🧠 *What's happening:*\nContaminated water detected in your area due to pipeline/drain issues.\n\n👉 *What you should do:*\n• Use only safe/filtered water\n• Avoid tap water for drinking\n• Follow strict hygiene practices\n\n🏥 *If symptoms appear:*\nFever, vomiting, diarrhoea → contact nearest health center immediately\n\n🔄 Status: Mitigation in progress\n📡 Source: Aheadly Health System`
            },
            {
                label: 'Air Quality Alert', sublabel: 'PM2.5 / pollution high', icon: '🌫️',
                message: `🚨 *Air Quality Alert (PM2.5 High)*\n📍 *${ward}* — Solapur\n⚠️ Moderate Risk 🟡\n\n🧠 *What's happening:*\nElevated air pollution levels detected in your area.\n\n👉 *What you should do:*\n• Wear mask outdoors\n• Avoid heavy outdoor activity\n• Keep windows closed during peak hours\n\n🏥 *If symptoms appear:*\nBreathlessness, coughing → consult doctor\n\n🔄 Status: Monitoring active\n📡 Source: Aheadly Health System`
            },
            {
                label: 'Heat Stress Advisory', sublabel: 'High LST / heat index', icon: '🌡️',
                message: `🚨 *Heat Stress Advisory*\n📍 *${ward}* — Solapur\n⚠️ High Risk 🟠\n\n🧠 *What's happening:*\nExtreme heat conditions detected. Risk of heat exhaustion is high.\n\n👉 *What you should do:*\n• Stay indoors during 12pm–4pm\n• Drink water every 30 minutes\n• Wear light, loose-fitting clothing\n\n🏥 *If symptoms appear:*\nDizziness, excessive sweating, weakness → seek immediate medical help\n\n🔄 Status: Heat watch active\n📡 Source: Aheadly Health System`
            },
            {
                label: 'Custom Advisory', sublabel: 'Write your own message', icon: '✏️',
                message: `🚨 *Advisory*\n📍 *${ward}* — Solapur\n⚠️ \n\n🧠 *What's happening:*\n\n\n👉 *What you should do:*\n• \n• \n• \n\n🏥 *If symptoms appear:*\n\n\n🔄 Status: \n📡 Source: Aheadly Health System`
            },
        ];
    };

    const openAdvisoryModal = () => {
        if (!clinicalData || !priorityInfo) return;
        const presets = getPresets();
        setSelectedPreset(0);
        setAdvisoryMessage(presets[0].message);
        setAdvisoryModal(true);
    };

    const handleSendAdvisory = async () => {
        if (!advisoryMessage.trim()) return;
        setIsSending(true);
        try {
            const res = await fetch('http://localhost:3001/api/send-advisory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: advisoryMessage })
            });
            const data = await res.json();
            if (data.success) {
                setAdvisoryModal(false);
            } else {
                alert(data.error || 'Failed to send');
            }
        } catch {
            alert('Bot server unreachable — is the bot running on port 3001?');
        } finally {
            setIsSending(false);
        }
    };

    const wardStyle = (feature) => {
        const isSelected = selectedWard?.properties?.Name === feature.properties.Name;
        return {
            fillColor: isSelected ? '#3b82f6' : '#1e293b',
            weight: isSelected ? 2 : 1,
            color: isSelected ? '#fff' : '#475569',
            fillOpacity: isSelected ? 0.6 : 0.2
        };
    };

    const onEachStartWard = (feature, layer) => {
        layer.on({ click: () => handleWardSelect(feature) });
    };

    return (
        <Container>
            <PortalBanner portal="smc" />
            <LandingHeader>
                <HeaderTitle>
                    <FiShield /> Ward Health Decision & Policy Brief System
                </HeaderTitle>
                <HeaderSubtitle>
                    AI-assisted public health risk assessment and decision documentation. Analyzes disease signals, vector density, and sanitation data to guide municipal response.
                </HeaderSubtitle>

                <HeaderBottomRow>
                    <ExplainerRow>
                        <ExplainerStep active={!selectedWard} muted={selectedWard}>
                            <StepNumber active={!selectedWard}>1</StepNumber> Select a Ward
                        </ExplainerStep>
                        <FiArrowRight style={{ color: '#334155' }} />
                        <ExplainerStep active={selectedWard && viewMode === 'analysis'}>
                            <StepNumber active={selectedWard && viewMode === 'analysis'}>2</StepNumber> Review Clinical Risk
                        </ExplainerStep>
                        <FiArrowRight style={{ color: '#334155' }} />
                        <ExplainerStep active={viewMode === 'preview'}>
                            <StepNumber active={viewMode === 'preview'}>3</StepNumber> Generate Brief
                        </ExplainerStep>
                    </ExplainerRow>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <HeaderCTAButton
                            disabled={!clinicalData}
                            onClick={openAdvisoryModal}
                            style={{
                                background: clinicalData ? '#0ea5e9' : undefined,
                                boxShadow: clinicalData ? '0 4px 6px -1px rgba(14, 165, 233, 0.4)' : undefined
                            }}
                        >
                            <FiSend /> Send Advisory
                        </HeaderCTAButton>
                        <div style={{ position: 'relative' }}>
                        <HeaderCTAButton
                            disabled={!selectedWard || isGenerating}
                            onClick={handleGenerate}
                            title={!selectedWard ? "Select a ward to enable policy generation" : "Generate Official Brief"}
                        >
                            {isGenerating ? (
                                <>
                                    <FiClock className="spin" /> Generating Policy Brief...
                                    <style>{`
    .spin { animation: spin 1s linear infinite; }
@keyframes spin { 100 % { transform: rotate(360deg); } }
`}</style>
                                </>
                            ) : (
                                <><FiFileText /> Generate Ward Policy Brief</>
                            )}
                        </HeaderCTAButton>
                        </div>
                    </div>
                </HeaderBottomRow>
            </LandingHeader>

            <ContentGrid>
                {/* 1. MAP PANEL */}
                <MapPanel>
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 1000, background: 'rgba(2,6,23,0.9)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #334155', fontSize: '0.85rem', color: '#cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                        <FiMapPin style={{ marginRight: '0.5rem', color: '#3b82f6' }} />
                        {selectedWard ? selectedWard.properties.Name : "Select a Ward to begin analysis"}
                    </div>
                    {wardsGeo && (
                        <MapContainer
                            center={[17.6599, 75.9064]}
                            zoom={11}
                            style={{ height: '100%', width: '100%', background: '#020617' }}
                            zoomControl={false}
                            whenCreated={mapInstance => (mapRef.current = mapInstance)}
                        >
                            <GeoJSON data={wardsGeo} style={wardStyle} onEachFeature={onEachStartWard} />
                        </MapContainer>
                    )}
                    {!selectedWard && (
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            background: 'rgba(15, 23, 42, 0.85)', padding: '1rem 2rem', borderRadius: '12px',
                            border: '1px solid #3b82f6', color: '#fff', fontSize: '1.1rem', fontWeight: '600',
                            textAlign: 'center', pointerEvents: 'none', zIndex: 1000
                        }}>
                            Click on a ward to begin clinical review
                        </div>
                    )}
                </MapPanel>

                {/* 2. MAIN CONTENT (Gated) */}
                <MainPanel ref={panelRef} onScroll={handleScroll}>

                    {/* SCROLL GUIDANCE OVERLAYS */}
                    <AnimatePresence>
                        {selectedWard && viewMode === 'analysis' && !isGenerating && scrollProgress < 0.2 && (
                            <VerticalGuidancePill
                                key="review-guidance"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                style={{ top: '50%', transform: 'translateY(-50%)' }}
                            >
                                <div style={{ marginBottom: '0.5rem' }}><FiArrowDown size={20} /></div>
                                <span>Review</span>
                                <span>Clinical</span>
                                <span>Risks</span>
                                <span>&</span>
                                <span>Actions</span>
                            </VerticalGuidancePill>
                        )}
                        {selectedWard && viewMode === 'analysis' && !isGenerating && scrollProgress > 0.5 && (
                            <VerticalGuidancePill
                                key="generate-guidance"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                style={{ top: 'auto', bottom: '120px', borderColor: '#3b82f6', boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}
                            >
                                <div style={{ marginBottom: '0.5rem', color: '#60a5fa' }}><FiFileText size={20} /></div>
                                <span style={{ color: '#93c5fd' }}>Generate</span>
                                <span style={{ color: '#93c5fd' }}>Official</span>
                                <span style={{ color: '#93c5fd' }}>Brief</span>
                            </VerticalGuidancePill>
                        )}
                    </AnimatePresence>

                    {!selectedWard && (
                        <EmptyState>
                            <FiMapPin />
                            <h3>No Ward Selected</h3>
                            <p>Select a ward on the map to begin health risk analysis. The system will integrate live disease findings with environmental data.</p>
                        </EmptyState>
                    )}

                    {selectedWard && clinicalData && priorityInfo && viewMode === 'analysis' && (
                        <BriefContent>
                            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ward Analysis</div>
                                    <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', margin: 0 }}>{selectedWard.properties.Name}</h2>
                                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                                        Sector ID: {getSectorID(selectedWard.properties.Name)} • Digital Twin Live Feed
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: priorityInfo.color }}>
                                        {priorityInfo.level}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>Decision Status</div>
                                </div>
                            </div>

                            <Section>
                                <SectionTitle><FiActivity /> Situation Summary</SectionTitle>
                                <SummaryCard>
                                    <DataPoint>
                                        <label>{clinicalData.name} Cases</label>
                                        <div className="value" style={{ color: clinicalData.activeCases > 0 ? '#ef4444' : '#94a3b8' }}>
                                            {clinicalData.activeCases} Reported
                                        </div>
                                        <div className="sub">{clinicalData.trend} Trend</div>
                                    </DataPoint>
                                    <DataPoint>
                                        <label>Transmission Mode</label>
                                        <div className="value" style={{ fontSize: '1.1rem', color: '#e2e8f0' }}>
                                            {clinicalData.transmission || 'None'}
                                        </div>
                                        <div className="sub">{clinicalData.type || 'N/A'}</div>
                                    </DataPoint>
                                    <DataPoint>
                                        <label>Environmental Risk</label>
                                        <div className="value" style={{ color: getRiskColor(clinicalData.score) }}>
                                            {clinicalData.score.toFixed(1)} HRI
                                        </div>
                                        <div className="sub">Baseline Susceptibility</div>
                                    </DataPoint>
                                </SummaryCard>

                                <JustificationBox>
                                    <FiInfo style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <div>
                                        <strong>Why {priorityInfo.level}?</strong> {priorityInfo.reason}
                                    </div>
                                </JustificationBox>
                            </Section>

                            <Section>
                                <SectionTitle><FiAlertTriangle /> Clinical Risk Drivers</SectionTitle>

                                <DriverRow isPrimary>
                                    <DriverIcon bg={clinicalData.activeCases > 0 ? "rgba(239, 68, 68, 0.2)" : "rgba(148, 163, 184, 0.2)"} color={clinicalData.activeCases > 0 ? "#ef4444" : "#94a3b8"}><FiActivity /></DriverIcon>
                                    <div>
                                        <div style={{ fontWeight: '700', color: clinicalData.activeCases > 0 ? '#fca5a5' : '#cbd5e1', marginBottom: '0.25rem' }}>
                                            Primary: {clinicalData.name} Transmission Risk
                                        </div>
                                        <div style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                            {clinicalData.activeCases > 0
                                                ? `Confirmed ${clinicalData.activeCases} active cases.${clinicalData.cluster === 'Cluster' ? 'Local clustering suggests sustained transmission.' : 'Sporadic cases detected.'} `
                                                : `No active cases reported, but surveillance is required due to environmental favorability.`
                                            }
                                        </div>
                                    </div>
                                </DriverRow>

                                {clinicalData.secondary && clinicalData.secondary.map((signal, idx) => (
                                    <DriverRow key={idx}>
                                        <DriverIcon bg="rgba(249, 115, 22, 0.2)" color="#f97316"><FiActivity /></DriverIcon>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#fdba74', marginBottom: '0.25rem' }}>Secondary: {signal.name}</div>
                                            <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                                                {signal.activeCases} cases reported. {signal.trend} trend indicates emerging risk.
                                            </div>
                                        </div>
                                    </DriverRow>
                                ))}
                            </Section>

                            <Section>
                                <SectionTitle><FiTarget /> Recommended Clinical Actions</SectionTitle>

                                {interventions.map((action, idx) => (
                                    <ActionCard key={idx}>
                                        <ActionHeader>
                                            <div>
                                                <ActionTitle>{action.name}</ActionTitle>
                                                <div style={{ color: '#6ee7b7', fontSize: '0.85rem', marginTop: '4px' }}>
                                                    <FiCheckCircle style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                                    Validated for {clinicalData.name} ({clinicalData.type})
                                                </div>
                                            </div>
                                            <ActionDept>{action.responsibleDepartment}</ActionDept>
                                        </ActionHeader>

                                        <ActionDetailRow>
                                            <label>Target</label>
                                            <div>{action.target || 'General Risk Reduction'}</div>
                                        </ActionDetailRow>

                                        <ActionDetailRow>
                                            <label>How</label>
                                            <div>
                                                {action.executionSteps ? (
                                                    <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                                                        {action.executionSteps.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                                                    </ul>
                                                ) : 'Standard Protocol'}
                                            </div>
                                        </ActionDetailRow>

                                        <ActionDetailRow>
                                            <label>Why</label>
                                            <div style={{ color: '#93c5fd' }}>{action.impactRationale || action.description}</div>
                                        </ActionDetailRow>

                                        <ActionFooter>
                                            <PrimaryButton
                                                onClick={() => setDetailsModalItem(action)}
                                                style={{ width: 'auto', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
                                            >
                                                <FiFileText size={16} /> View Implementation Plan
                                            </PrimaryButton>
                                        </ActionFooter>
                                    </ActionCard>
                                ))}

                                {interventions.length === 0 && (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', background: '#1e293b', borderRadius: '8px' }}>
                                        No specific interventions required. Routine monitoring only.
                                    </div>
                                )}
                            </Section>


                        </BriefContent>
                    )}

                    {selectedWard && clinicalData && priorityInfo && viewMode === 'preview' && (
                        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <SecondaryButton onClick={() => setViewMode('analysis')}>
                                    <FiEdit3 /> Back to Analysis
                                </SecondaryButton>
                                <PrimaryButton onClick={() => window.print()} style={{ width: 'auto' }}>
                                    <FiDownload /> Download Policy Brief (PDF)
                                </PrimaryButton>
                            </div>

                            <PreviewPaper className="print-content">
                                <div style={{ borderBottom: '2px solid black', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <h1 style={{ fontSize: '24px', margin: 0, fontWeight: 'bold' }}>Public Health Policy Brief</h1>
                                        <div style={{ fontSize: '14px', marginTop: '5px', color: '#444' }}>Solapur Municipal Corporation • Ward {selectedWard.properties.Name}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: '12px' }}>
                                        <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                                        <div><strong>Ref:</strong> SMC-{getSectorID(selectedWard.properties.Name).replace('Sector-', 'S')}-2026-001</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ fontSize: '14px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>1. Clinical Assessment</h3>
                                    <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                                        Ward <strong>{selectedWard.properties.Name}</strong> is currently presenting a <strong>{priorityInfo.level}</strong> profile.
                                        Primary concern is <strong>{clinicalData.name}</strong> ({clinicalData.type}).
                                        <strong>{clinicalData.activeCases} active cases</strong> reported with <strong>{clinicalData.trend} trend</strong>.
                                    </p>
                                    <p style={{ fontSize: '14px', lineHeight: '1.6', marginTop: '10px', fontStyle: 'italic' }}>
                                        <strong>Justification:</strong> {priorityInfo.reason}
                                    </p>
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ fontSize: '14px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>2. Risk Factors</h3>
                                    <ul style={{ fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
                                        <li><strong>Transmission Mode:</strong> {clinicalData.transmission}.</li>
                                        <li><strong>Environmental Susceptibility:</strong> HRI Score {clinicalData.score.toFixed(1)} indicates {clinicalData.score >= 80 ? 'critical' : clinicalData.score >= 65 ? 'high' : 'moderate'} favorability for pathogen survival.</li>
                                    </ul>
                                </div>

                                <div style={{ marginBottom: '4rem' }}>
                                    <h3 style={{ fontSize: '14px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>3. Mandated Actions</h3>

                                    <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderLeft: '4px solid #3b82f6', fontSize: '13px' }}>
                                        <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#1e293b' }}>Implementation Timeline</strong>
                                        Current disease severity ({clinicalData.activeCases} active cases) mandates immediate response.
                                        {interventions.length > 0 && interventions[0].specificTimeline && (
                                            <div style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#444' }}>
                                                {interventions[0].specificTimeline}
                                            </div>
                                        )}
                                        {(!interventions.length || !interventions[0].specificTimeline) && (
                                            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem', color: '#475569', lineHeight: '1.5' }}>
                                                <li><strong>Day 0–1:</strong> Rapid field deployment and surveillance initiation</li>
                                                <li><strong>Day 2–4:</strong> Infrastructure correction and sanitation response</li>
                                                <li><strong>Day 5–7:</strong> Monitoring, reassessment, and containment validation</li>
                                            </ul>
                                        )}
                                    </div>

                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '10px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #000' }}>
                                                <th style={{ textAlign: 'left', padding: '8px', width: '25%' }}>Action Item</th>
                                                <th style={{ textAlign: 'left', padding: '8px', width: '30%' }}>Department</th>
                                                <th style={{ textAlign: 'left', padding: '8px', width: '45%' }}>Target</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {interventions.map((action, idx) => (
                                                <tr key={idx}>
                                                    <td style={{ padding: '8px', verticalAlign: 'top' }}>{action.name}</td>
                                                    <td style={{ padding: '8px', verticalAlign: 'top' }}>{action.responsibleDepartment}</td>
                                                    <td style={{ padding: '8px', verticalAlign: 'top', color: '#444' }}>{action.target}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px solid #000', paddingTop: '2rem' }}>
                                    <div>Submitted By: AHEADLY Decision Support</div>
                                    <div>Approved By: __________________________<br /><span style={{ color: '#666' }}>Municipal Health Officer</span></div>
                                </div>
                            </PreviewPaper>
                        </div>
                    )}
                </MainPanel>
            </ContentGrid>

            {/* IMPLEMENTATION DETAILS MODAL */}
            <AnimatePresence>
                {detailsModalItem && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setDetailsModalItem(null)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            style={{
                                width: '600px',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                background: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: '12px',
                                padding: '2rem',
                                color: '#e2e8f0',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                                <div>
                                    <h2 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1.5rem' }}>{detailsModalItem.name}</h2>
                                    <div style={{ background: '#1e293b', color: '#94a3b8', padding: '0.2rem 0.6rem', borderRadius: '4px', display: 'inline-block', fontSize: '0.8rem', fontWeight: 'bold' }}>IMPLEMENTATION PROTOCOL</div>
                                </div>
                                <button onClick={() => setDetailsModalItem(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><FiX size={24} /></button>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <h4 style={{ color: '#cbd5e1', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Step-by-Step Execution</h4>
                                <ul style={{ paddingLeft: '1.25rem', color: '#94a3b8', lineHeight: '1.7', fontSize: '0.95rem' }}>
                                    {detailsModalItem.executionSteps?.map((step, idx) => (
                                        <li key={idx} style={{ marginBottom: '0.5rem' }}>{step}</li>
                                    ))}
                                </ul>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#60a5fa', textTransform: 'uppercase' }}>Required Resources</h4>
                                    <div style={{ fontSize: '0.9rem', color: '#bfdbfe' }}>
                                        <div style={{ marginBottom: '4px' }}><strong>Manpower:</strong> {detailsModalItem.resourceRequirements?.manpower || 'Standard Crew'}</div>
                                        <div style={{ marginBottom: '4px' }}><strong>Vehicles:</strong> {detailsModalItem.resourceRequirements?.vehicles || 'Standard Fleet'}</div>
                                        <div><strong>Equipment:</strong> {detailsModalItem.resourceRequirements?.equipment || 'Standard Kit'}</div>
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#facc15', textTransform: 'uppercase' }}>Deployment Timeline</h4>
                                    <div style={{ fontSize: '0.9rem', color: '#fef08a', fontStyle: 'italic' }}>
                                        {detailsModalItem.specificTimeline || 'Immediate Deployment (Day 0)'}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <h4 style={{ color: '#cbd5e1', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Expected Outcomes & Metrics</h4>
                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                                    <p style={{ margin: '0 0 0.5rem 0', color: '#34d399', fontWeight: 'bold' }}>Impact: {detailsModalItem.expectedHealthImpact}</p>
                                    <p style={{ margin: 0, color: '#6ee7b7', fontSize: '0.9rem' }}><strong>Success Metric:</strong> {detailsModalItem.successMetric || 'Reduction in active cases'}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ADVISORY COMPOSER MODAL */}
            <AnimatePresence>
                {advisoryModal && clinicalData && priorityInfo && (() => {
                    const presets = getPresets();
                    return (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setAdvisoryModal(false)}>
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                                style={{ background: '#0f172a', borderRadius: '16px', width: '860px', maxWidth: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', border: '1px solid #1e293b', boxShadow: '0 25px 50px rgba(0,0,0,0.6)' }}
                            >
                                {/* Header */}
                                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ color: '#fff', fontWeight: '700', fontSize: '1.2rem' }}>📢 Send Advisory</div>
                                        <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>{selectedWard.properties.Name} — Solapur</div>
                                    </div>
                                    <button onClick={() => setAdvisoryModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
                                </div>

                                {/* Body */}
                                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', flex: 1, overflow: 'hidden' }}>
                                    {/* LEFT: Presets */}
                                    <div style={{ borderRight: '1px solid #1e293b', padding: '1.25rem', overflowY: 'auto' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Preset Templates</div>
                                        {presets.map((p, i) => (
                                            <div
                                                key={i}
                                                onClick={() => { setSelectedPreset(i); setAdvisoryMessage(p.message); }}
                                                style={{
                                                    padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', marginBottom: '0.5rem', transition: 'all 0.15s',
                                                    border: `1px solid ${selectedPreset === i ? '#3b82f6' : '#1e293b'}`,
                                                    background: selectedPreset === i ? 'rgba(59,130,246,0.1)' : 'transparent',
                                                }}
                                            >
                                                <div style={{ fontWeight: '600', fontSize: '0.9rem', color: selectedPreset === i ? '#93c5fd' : '#e2e8f0' }}>{p.icon} {p.label}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{p.sublabel}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* RIGHT: Editable Preview */}
                                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Message Preview & Editor</div>
                                        <textarea
                                            value={advisoryMessage}
                                            onChange={e => { setAdvisoryMessage(e.target.value); setSelectedPreset(null); }}
                                            style={{ flex: 1, padding: '1rem', background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.88rem', lineHeight: '1.6', resize: 'none', outline: 'none' }}
                                        />
                                        <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.5rem' }}>*bold*, _italic_ — Telegram Markdown. Edit freely.</div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                    <button onClick={() => setAdvisoryModal(false)} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                                    <button
                                        onClick={handleSendAdvisory}
                                        disabled={isSending || !advisoryMessage.trim()}
                                        style={{ background: isSending ? '#334155' : '#0ea5e9', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', cursor: isSending ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        {isSending ? '⏳ Sending...' : '📤 Send to Telegram'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    );
                })()}
            </AnimatePresence>
        </Container>
    );
};

export default HealthPriorityBrief;
