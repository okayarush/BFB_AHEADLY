import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiActivity, FiGlobe, FiUsers, FiPlus, FiMessageSquare, FiShield, FiCloudRain, FiDatabase } from 'react-icons/fi';

// --- ANIMATIONS ---
const pulseGlow = (color) => keyframes`
  0% { box-shadow: 0 0 0 0 ${color}40; }
  70% { box-shadow: 0 0 0 10px ${color}00; }
  100% { box-shadow: 0 0 0 0 ${color}00; }
`;

const flowAnimation = keyframes`
  to { stroke-dashoffset: -40; }
`;

const ringsAnimation = keyframes`
  0% { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0; }
`;

// --- STYLED COMPONENTS ---
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #0d0f14;
  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  color: white;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
  position: relative;
`;

const HeaderContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto 2rem auto;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #94a3b8;
  max-width: 800px;
  margin: 0 auto 1.5rem auto;
  line-height: 1.6;
`;

const StatBar = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-size: 0.9rem;
  color: #cbd5e1;
  font-family: 'IBM Plex Mono', monospace;
`;

const DiagramContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  background: #111318;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 2rem;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 600px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  overflow: hidden;
`;

const SVGOverlay = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
`;

const AnimatedPath = styled.path`
  fill: none;
  stroke: ${props => props.color || '#334155'};
  stroke-width: 2;
  stroke-dasharray: 8 8;
  animation: ${flowAnimation} ${props => props.speed || '2s'} linear infinite;
  opacity: 0.6;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 550px;
  z-index: 2;
`;

const InputNodeCard = styled(motion.div)`
  background: rgba(30, 33, 40, 0.8);
  border: 1px solid ${props => props.color}40;
  border-left: 4px solid ${props => props.color};
  padding: 1rem;
  border-radius: 8px;
  width: 280px;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  position: relative;
  backdrop-filter: blur(8px);
  transition: all 0.2s;

  &:hover {
    transform: translateX(5px);
    background: rgba(40, 44, 52, 0.9);
    border-color: ${props => props.color};
  }
`;

const NodeIconWrapper = styled.div`
  background: ${props => props.color}20;
  color: ${props => props.color};
  padding: 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${props => pulseGlow(props.color)} ${props => props.pulseRate} infinite;
`;

const NodeContent = styled.div`
  flex: 1;
`;

const NodeTitle = styled.h3`
  font-size: 0.95rem;
  margin: 0 0 0.25rem 0;
  color: #f8fafc;
`;

const NodeDesc = styled.p`
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.4;
`;

const EngineNode = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2.5rem;
  border-radius: 50%;
  width: 280px;
  height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  box-shadow: 0 0 40px rgba(255,255,255,0.05);

  &::before, &::after {
    content: '';
    position: absolute;
    inset: -20px;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 50%;
    animation: ${ringsAnimation} 3s linear infinite;
  }
  &::after {
    inset: -40px;
    animation-delay: 1.5s;
    border: 1px dotted rgba(255,255,255,0.1);
  }
`;

const EngineTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 0.25rem 0;
  color: #fff;
  text-shadow: 0 0 10px rgba(255,255,255,0.5);
`;

const EngineSub = styled.p`
  font-size: 0.9rem;
  color: #60a5fa;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const EngineTags = styled.div`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-top: 1rem;
`;

const OutputNodeCard = styled.div`
  background: rgba(30, 33, 40, 0.6);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 1rem;
  border-radius: 8px;
  width: 240px;
  display: flex;
  align-items: center;
  gap: 1rem;
  backdrop-filter: blur(8px);
`;

// --- DRAWER COMPONENTS ---
const DrawerOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  z-index: 100;
`;

const DrawerContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  width: 480px;
  max-width: 100vw;
  height: 100vh;
  background: #1a1d24;
  box-shadow: -10px 0 30px rgba(0,0,0,0.5);
  z-index: 101;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const DrawerHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.color}10;
  border-left: 4px solid ${props => props.color};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  &:hover { background: rgba(255,255,255,0.1); color: white; }
`;

const TabsContainer = styled.div`
  display: flex;
  padding: 1rem 1.5rem 0;
  gap: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
`;

const Tab = styled.button`
  background: ${props => props.active ? props.color : 'transparent'};
  color: ${props => props.active ? '#fff' : '#94a3b8'};
  border: ${props => props.active ? 'none' : '1px solid rgba(255,255,255,0.1)'};
  padding: 0.5rem 1rem;
  border-radius: 20px 20px 0 0;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    color: ${props => props.active ? '#fff' : '#e2e8f0'};
  }
`;

const DrawerContent = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  font-family: 'Inter', sans-serif;

  h4 { color: white; margin-top: 0; margin-bottom: 1rem; font-size: 1.1rem; }
  p { color: #cbd5e1; line-height: 1.6; font-size: 0.95rem; margin-bottom: 1rem; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-family: 'IBM Plex Mono', monospace; font-size: 0.85rem; }
  th { text-align: left; padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: #94a3b8; font-weight: 600; }
  td { padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.05); color: #e2e8f0; }
  tr:hover td { background: rgba(255,255,255,0.02); }
  .highlight { color: ${props => props.color}; }
`;

const DataCard = styled.div`
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

// --- DATA DEFINITIONS ---

const sources = [
  {
    id: 'nasa',
    title: 'NASA Satellite Data',
    desc: 'Land surface temp, vegetation index, stagnation',
    icon: <FiGlobe />,
    color: '#14b8a6', // teal
    pulse: '2s',
    methodology: {
      source: 'NASA ECOSTRESS (Land Surface Temp) + ESA Sentinel-2 (NDVI)',
      usage: 'High LST combined with low NDVI in a ward indicates urban heat stress and potential stagnant water — both primary dengue and cholera risk factors. This signal contributes 22% weight to the ward\'s HRI score.',
      freq: 'Every 16 days (Sentinel-2) / 3-day revisit (ECOSTRESS)',
      pipeline: 'Raw GeoTIFF → Ward boundary clipping → Normalization → HRI fusion'
    },
    sample: (
      <>
        <h4>Live Sector Telemetry</h4>
        <div style={{display:'flex', gap:'0.5rem', marginBottom:'1rem'}}>
          <div style={{width:'33%', height:'40px', background:'linear-gradient(90deg, #3b82f6, #eab308, #ef4444)', borderRadius:'4px'}} />
          <span style={{fontSize:'0.8rem', color:'#94a3b8', lineHeight:'40px'}}>LST Heatmap Context</span>
        </div>
        <table>
          <thead><tr><th>Sector</th><th>LST (°C)</th><th>NDVI</th><th>Stagnation</th></tr></thead>
          <tbody>
            <tr><td>Sector-03</td><td>41.2°C</td><td>0.18</td><td style={{color:'#ef4444'}}>HIGH</td></tr>
            <tr><td>Sector-12</td><td>38.7°C</td><td>0.31</td><td style={{color:'#eab308'}}>MODERATE</td></tr>
            <tr><td>Sector-08</td><td>43.1°C</td><td>0.09</td><td style={{color:'#ef4444', fontWeight:'bold'}}>CRITICAL</td></tr>
          </tbody>
        </table>
        <DataCard>
          <p style={{margin:0, fontSize:'0.85rem', color:'#94a3b8'}}><FiActivity style={{verticalAlign:'middle', marginRight:'5px'}}/> Last satellite pass: 2 hours ago</p>
        </DataCard>
      </>
    )
  },
  {
    id: 'asha',
    title: 'ASHA Field Surveys',
    desc: 'Household symptoms, risk flags, escalations',
    icon: <FiUsers />,
    color: '#f97316', // orange
    pulse: '3s',
    methodology: {
      source: 'ASHA field workers using Aheadly Field App — household surveys submitted daily',
      usage: 'Symptom patterns reported by ASHA workers are the earliest ground-level signal for disease clusters. A cluster of 3+ HIGH risk households in the same ward within 48 hours triggers an AI alert. Contributes 31% weight to HRI — highest of all signals.',
      freq: 'Real-time on submission',
      pipeline: 'ASHA app submission → Anonymization → Ward clustering → HRI fusion'
    },
    sample: (
      <>
        <h4>Recent Field Submissions</h4>
        <table>
          <thead><tr><th>ID</th><th>Ward</th><th>Symptoms</th><th>Risk</th></tr></thead>
          <tbody>
            <tr><td>#8921</td><td>North</td><td>Fever, Rash</td><td style={{color:'#ef4444'}}>HIGH</td></tr>
            <tr><td>#8922</td><td>South</td><td>Cough, Fatigue</td><td style={{color:'#eab308'}}>MED</td></tr>
            <tr><td>#8923</td><td>West</td><td>None</td><td style={{color:'#22c55e'}}>LOW</td></tr>
            <tr><td>#8924</td><td>North</td><td>High Fever</td><td style={{color:'#ef4444'}}>HIGH</td></tr>
            <tr><td>#8925</td><td>East</td><td>Nausea</td><td style={{color:'#eab308'}}>MED</td></tr>
            <tr><td>#8926</td><td>North</td><td>Joint Pain</td><td style={{color:'#ef4444'}}>HIGH</td></tr>
          </tbody>
        </table>
        <DataCard>
          <h5 style={{margin:'0 0 0.5rem 0', color:'white'}}>Weekly Summary</h5>
          <p style={{margin:0, color:'#94a3b8', fontSize:'0.9rem'}}>342 households surveyed this week · <span style={{color:'#ef4444'}}>28 flagged as HIGH risk</span></p>
        </DataCard>
      </>
    )
  },
  {
    id: 'hms',
    title: 'Hospital HMS',
    desc: 'Bed occupancy, ICD-10 cases, medicine stock',
    icon: <FiPlus />,
    color: '#3b82f6', // blue
    pulse: '2s',
    methodology: {
      source: 'Aheadly HMS Adapter installed on hospital systems — FHIR R4, ABDM & DPDPA 2023 compliant',
      usage: 'Hospital admission data confirms what field and satellite signals predict. A spike in ICD-coded cases for a disease already flagged by ASHA surveys elevates the HRI immediately. Contributes 24% weight to HRI.',
      freq: 'Bed counts every 15 min, disease cases per admission',
      pipeline: 'HMS → Aheadly Adapter → Anonymization → FHIR R4 formatting → HRI fusion'
    },
    sample: (
      <>
        <h4>Live HMS Feed</h4>
        <table>
          <thead><tr><th>ICD-10</th><th>Condition</th><th>Severity</th><th>Ward</th></tr></thead>
          <tbody>
            <tr><td>A90</td><td>Dengue Fever</td><td style={{color:'#ef4444'}}>Severe</td><td>North</td></tr>
            <tr><td>J06.9</td><td>Acute URI</td><td style={{color:'#eab308'}}>Mod</td><td>East</td></tr>
            <tr><td>A09</td><td>Gastroenteritis</td><td style={{color:'#eab308'}}>Mod</td><td>South</td></tr>
          </tbody>
        </table>
        <div style={{display:'flex', gap:'1rem', marginTop:'1rem'}}>
          <DataCard style={{flex:1, textAlign:'center'}}>
            <div style={{fontSize:'1.5rem', color:'white', fontWeight:'bold'}}>142</div>
            <div style={{fontSize:'0.75rem', color:'#94a3b8'}}>Admissions Today</div>
          </DataCard>
          <DataCard style={{flex:1, textAlign:'center'}}>
            <div style={{fontSize:'1.5rem', color:'#ef4444', fontWeight:'bold'}}>89%</div>
            <div style={{fontSize:'0.75rem', color:'#94a3b8'}}>ICU Occupancy</div>
          </DataCard>
        </div>
      </>
    )
  },
  {
    id: 'community',
    title: 'Community Reports',
    desc: 'Citizen sanitation reports, symptom checker',
    icon: <FiMessageSquare />,
    color: '#22c55e', // green
    pulse: '4s',
    methodology: {
      source: 'Community Portal — citizen sanitation reports + symptom checker AI triage submissions',
      usage: 'Stagnant water reports from citizens serve as a direct environmental risk signal. Symptom checker submissions create a real-time syndromic surveillance layer. Together they contribute 14% weight to HRI.',
      freq: 'Real-time on submission',
      pipeline: 'Citizen app → Ward geolocation tagging → Severity classification → HRI fusion'
    },
    sample: (
      <>
        <h4>Recent Issue Reports</h4>
        <table>
          <thead><tr><th>Type</th><th>Issue</th><th>Ward</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>Sanitation</td><td>Stagnant Water</td><td>North</td><td style={{color:'#eab308'}}>Pending</td></tr>
            <tr><td>Sanitation</td><td>Open Drain</td><td>South</td><td style={{color:'#22c55e'}}>Ack</td></tr>
            <tr><td>Symptom</td><td>Fever, Chills</td><td>West</td><td style={{color:'#ef4444'}}>Triage</td></tr>
          </tbody>
        </table>
        <DataCard>
          <p style={{margin:0, color:'#94a3b8', fontSize:'0.9rem'}}>147 sanitation reports this month · 89 symptom checker submissions this week</p>
          <div style={{marginTop:'0.5rem', fontSize:'0.8rem'}}>
            <span style={{color:'white'}}>Top:</span> Uncollected Garbage (34), Stagnant Water (28)
          </div>
        </DataCard>
      </>
    )
  },
  {
    id: 'govt',
    title: 'Govt. Health Programs',
    desc: 'NRHM immunization data, ABDM health records',
    icon: <FiShield />,
    color: '#a855f7', // purple
    pulse: '5s',
    methodology: {
      source: 'NRHM immunization registry, ABDM Health Information Exchange, PMJAY claims data',
      usage: 'Low vaccination coverage in a ward increases HRI baseline. PMJAY claims data reveals disease burden patterns not captured by hospital reporting. Contributes 6% weight to HRI.',
      freq: 'Daily sync via ABDM HIE-CM',
      pipeline: 'NRHM/ABDM APIs → Ward-level aggregation → Coverage gap analysis → HRI fusion'
    },
    sample: (
      <>
        <h4>Vaccination Coverage</h4>
        <table>
          <thead><tr><th>Ward</th><th>BCG %</th><th>DPT %</th><th>Measles %</th></tr></thead>
          <tbody>
            <tr><td>North</td><td>94%</td><td>91%</td><td>88%</td></tr>
            <tr><td>South</td><td>89%</td><td>85%</td><td style={{color:'#ef4444'}}>76%</td></tr>
            <tr><td>West</td><td>98%</td><td>95%</td><td>92%</td></tr>
          </tbody>
        </table>
        <DataCard>
          <h5 style={{margin:'0 0 0.5rem 0', color:'white'}}>ABDM Integration</h5>
          <p style={{margin:0, color:'#10b981', fontSize:'0.9rem'}}>1,247 ABHA IDs linked in Solapur this month</p>
        </DataCard>
      </>
    )
  },
  {
    id: 'weather',
    title: 'Weather & Environment',
    desc: 'Rainfall, humidity, air quality, flood index',
    icon: <FiCloudRain />,
    color: '#eab308', // yellow
    pulse: '3s',
    methodology: {
      source: 'IMD weather data, OpenAQ air quality, CWC flood monitoring',
      usage: 'High humidity + rainfall + high LST is the classic dengue breeding condition. PM2.5 spikes correlate with respiratory disease surges. Flood risk index feeds directly into cholera and leptospirosis predictions. Contributes 3% weight to HRI.',
      freq: 'Hourly (weather), daily (air quality), real-time (flood)',
      pipeline: 'IMD/OpenAQ APIs → Ward interpolation → Seasonal risk modulation → HRI fusion'
    },
    sample: (
      <>
        <h4>Live Ward Conditions</h4>
        <table>
          <thead><tr><th>Ward</th><th>Temp</th><th>RH %</th><th>PM2.5</th><th>Flood</th></tr></thead>
          <tbody>
            <tr><td>North</td><td>36°C</td><td>85%</td><td style={{color:'#ef4444'}}>142</td><td>Low</td></tr>
            <tr><td>South</td><td>35°C</td><td>88%</td><td style={{color:'#eab308'}}>85</td><td style={{color:'#eab308'}}>Med</td></tr>
            <tr><td>West</td><td>36°C</td><td>82%</td><td style={{color:'#22c55e'}}>45</td><td>Low</td></tr>
          </tbody>
        </table>
        <DataCard>
          <h5 style={{margin:'0 0 0.5rem 0', color:'white'}}>Current AQI Status</h5>
          <div style={{fontSize:'1.2rem', color:'#ef4444', fontWeight:'bold', marginTop:'0.25rem'}}>POOR (142)</div>
        </DataCard>
      </>
    )
  }
];

const outputs = [
  { title: 'Ward HRI Score', desc: 'Risk score per ward, updated 15m', icon: '🗺' },
  { title: 'Outbreak Alerts', desc: 'Early warnings to hospitals & SMC', icon: '🚨' },
  { title: 'Policy Briefs', desc: 'AI-generated recommendations', icon: '📋' },
  { title: 'Disease Forecasts', desc: '7-day and 30-day predictions', icon: '🔮' },
  { title: 'Citizen Notifs', desc: 'Ward-specific health advisories', icon: '📱' },
];

export default function DataSources() {
  const [activeSourceId, setActiveSourceId] = useState(null);
  const [activeTab, setActiveTab] = useState('sample');
  const [engineState, setEngineState] = useState(0);
  
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const inputRefs = useRef([]);
  const outputRefs = useRef([]);
  
  const [lines, setLines] = useState({ inputs: [], outputs: [] });

  const activeSource = sources.find(s => s.id === activeSourceId);

  // Cycle engine text
  useEffect(() => {
    const states = ["Normalizing signals...", "Cross-referencing ward data...", "Generating HRI scores..."];
    const interval = setInterval(() => {
      setEngineState(prev => (prev + 1) % states.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Calculate SVG Lines on mount and resize
  useEffect(() => {
    const calcLines = () => {
      if (!containerRef.current || !engineRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const engineRect = engineRef.current.getBoundingClientRect();
      
      // Engine center relative to container
      const eX = engineRect.left - containerRect.left + engineRect.width / 2;
      const eY = engineRect.top - containerRect.top + engineRect.height / 2;

      const inputLines = inputRefs.current.map((el, i) => {
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const startX = rect.right - containerRect.left;
        const startY = rect.top - containerRect.top + rect.height / 2;
        // SVG cubic bezier path
        const cp1x = startX + 100;
        const cp1y = startY;
        const cp2x = eX - 100;
        const cp2y = eY;
        return { path: `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${eX - engineRect.width/2 + 10} ${eY}`, color: sources[i].color };
      });

      const outputLines = outputRefs.current.map((el, i) => {
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const endX = rect.left - containerRect.left;
        const endY = rect.top - containerRect.top + rect.height / 2;
        const startX = eX + engineRect.width / 2 - 10;
        const startY = eY;
        const cp1x = startX + 100;
        const cp1y = startY;
        const cp2x = endX - 100;
        const cp2y = endY;
        return { path: `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`, color: '#60a5fa' };
      });

      setLines({ inputs: inputLines.filter(Boolean), outputs: outputLines.filter(Boolean) });
    };

    calcLines();
    window.addEventListener('resize', calcLines);
    return () => window.removeEventListener('resize', calcLines);
  }, []);

  const engineStates = ["Normalizing signals...", "Cross-referencing ward data...", "Generating HRI scores..."];

  return (
    <PageContainer>
      <HeaderContainer>
        <Title>Aheadly's Data Intelligence Engine</Title>
        <Subtitle>
          Every prediction, alert, and HRI score is powered by 6 live data streams — satellite signals, 
          ground-level field surveys, hospital operations, citizen reports, government health programs, 
          and environmental sensors — fused into one unified health intelligence layer.
        </Subtitle>
        <StatBar>
          <span>📡 6 data streams active</span>
          <span>·</span>
          <span>🔄 Last full sync: 4 minutes ago</span>
          <span>·</span>
          <span>📊 2.4M data points processed today</span>
        </StatBar>
      </HeaderContainer>

      <DiagramContainer ref={containerRef}>
        <SVGOverlay>
          {lines.inputs.map((line, i) => (
            <AnimatedPath key={`in-${i}`} d={line.path} color={line.color} speed={sources[i].pulse} />
          ))}
          {lines.outputs.map((line, i) => (
            <AnimatedPath key={`out-${i}`} d={line.path} color={line.color} speed="1.5s" />
          ))}
        </SVGOverlay>

        <Column>
          {sources.map((src, i) => (
            <InputNodeCard 
              key={src.id}
              color={src.color}
              onClick={() => { setActiveSourceId(src.id); setActiveTab('sample'); }}
              ref={el => inputRefs.current[i] = el}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <NodeIconWrapper color={src.color} pulseRate={src.pulse}>
                {src.icon}
              </NodeIconWrapper>
              <NodeContent>
                <NodeTitle>{src.title}</NodeTitle>
                <NodeDesc>{src.desc}</NodeDesc>
              </NodeContent>
            </InputNodeCard>
          ))}
        </Column>

        <Column style={{ justifyContent: 'center', zIndex: 10 }}>
          <EngineNode ref={engineRef}>
            <EngineSub>AI Fusion Layer</EngineSub>
            <EngineTitle>Aheadly HRI Engine</EngineTitle>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
              <FiActivity style={{verticalAlign:'middle', marginRight:'4px'}}/>
              Processing 847 signals right now
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={engineState}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <EngineTags>{engineStates[engineState]}</EngineTags>
              </motion.div>
            </AnimatePresence>
          </EngineNode>
        </Column>

        <Column style={{ justifyContent: 'space-around', height: '480px' }}>
          {outputs.map((out, i) => (
            <OutputNodeCard key={i} ref={el => outputRefs.current[i] = el}>
              <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{out.icon}</div>
              <div>
                <NodeTitle>{out.title}</NodeTitle>
                <NodeDesc>{out.desc}</NodeDesc>
              </div>
            </OutputNodeCard>
          ))}
        </Column>
      </DiagramContainer>

      <AnimatePresence>
        {activeSourceId && activeSource && createPortal(
          <DrawerOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveSourceId(null)}
          >
            <DrawerContainer
              color={activeSource.color}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
            >
              <DrawerHeader color={activeSource.color}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <NodeIconWrapper color={activeSource.color} style={{ animation: 'none' }}>
                    {activeSource.icon}
                  </NodeIconWrapper>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'white' }}>{activeSource.title}</h2>
                </div>
                <CloseButton onClick={() => setActiveSourceId(null)}>
                  <FiX size={24} />
                </CloseButton>
              </DrawerHeader>

              <TabsContainer>
                <Tab 
                  active={activeTab === 'sample'} 
                  color={activeSource.color}
                  onClick={() => setActiveTab('sample')}
                >
                  Sample Data
                </Tab>
                <Tab 
                  active={activeTab === 'method'}
                  color={activeSource.color} 
                  onClick={() => setActiveTab('method')}
                >
                  Methodology
                </Tab>
              </TabsContainer>

              <DrawerContent color={activeSource.color}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'sample' ? (
                      activeSource.sample
                    ) : (
                      <>
                        <DataCard>
                          <h4 style={{marginBottom:'0.5rem', color:activeSource.color}}>Data Source(s)</h4>
                          <p style={{margin:0}}>{activeSource.methodology.source}</p>
                        </DataCard>
                        
                        <DataCard>
                          <h4 style={{marginBottom:'0.5rem', color:activeSource.color}}>How it contributes to HRI</h4>
                          <p style={{margin:0}}>{activeSource.methodology.usage}</p>
                        </DataCard>
                        
                        <DataCard>
                          <h4 style={{marginBottom:'0.5rem', color:activeSource.color}}>Update Frequency</h4>
                          <p style={{margin:0}}>{activeSource.methodology.freq}</p>
                        </DataCard>
                        
                        <DataCard>
                          <h4 style={{marginBottom:'0.5rem', color:activeSource.color}}>Processing Pipeline</h4>
                          <p style={{margin:0, fontFamily:'IBM Plex Mono', fontSize:'0.85rem', color:'#60a5fa'}}>
                            {activeSource.methodology.pipeline}
                          </p>
                        </DataCard>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </DrawerContent>
            </DrawerContainer>
          </DrawerOverlay>,
          document.body
        )}
      </AnimatePresence>
    </PageContainer>
  );
}