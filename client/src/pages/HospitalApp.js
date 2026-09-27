import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiActivity,
  FiBell,
  FiUser,
  FiMonitor,
  FiFileText,
  FiAlertTriangle,
  FiDroplet,
  FiSettings,
  FiCheckCircle,
  FiFlag,
  FiClipboard,
  FiTrendingUp,
  FiAlertCircle,
  FiX,
  FiShield
} from "react-icons/fi";

// --- THEME & ANIMATIONS ---
const BG_DARK = "#0d0f14";
const SURFACE = "rgba(30, 33, 40, 0.6)";
const BORDER = "rgba(255, 255, 255, 0.05)";
const ACCENT = "#00d4aa";

const ANIM_PULSE_RED = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(255, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 68, 68, 0); }
`;
const ANIM_PULSE = keyframes`
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 212, 170, 0.4); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(0, 212, 170, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 212, 170, 0); }
`;

// --- LAYOUT COMPONENTS ---
const AppContainer = styled.div`
  display: flex; height: 100vh; width: 100vw;
  background-color: ${BG_DARK}; color: #e2e8f0;
  font-family: 'Inter', sans-serif; overflow: hidden;
  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
`;

const Sidebar = styled.nav`
  width: 260px; background: ${SURFACE}; border-right: 1px solid ${BORDER};
  backdrop-filter: blur(12px); display: flex; flex-direction: column; padding: 1.5rem 0; z-index: 10;
`;

const NavItem = styled.div`
  padding: 0.8rem 1.5rem; display: flex; align-items: center; gap: 0.75rem;
  color: ${props => props.active ? ACCENT : '#94a3b8'};
  background: ${props => props.active ? 'rgba(0, 212, 170, 0.08)' : 'transparent'};
  border-left: 3px solid ${props => props.active ? ACCENT : 'transparent'};
  cursor: pointer; font-size: 0.9rem; font-weight: 600; transition: all 0.2s;
  &:hover { background: rgba(0, 212, 170, 0.05); color: ${props => props.active ? ACCENT : '#e2e8f0'}; }
`;

const MainArea = styled.main`
  flex: 1; display: flex; flex-direction: column; overflow: hidden;
`;

const TopBar = styled.header`
  height: 70px; background: ${SURFACE}; border-bottom: 1px solid ${BORDER}; backdrop-filter: blur(12px);
  display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; z-index: 10;
`;
const StatusIndicator = styled.div`
  display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #94a3b8;
  font-family: 'IBM Plex Mono', monospace; background: rgba(255,255,255,0.03);
  padding: 0.4rem 0.8rem; border-radius: 6px; border: 1px solid ${BORDER};
`;
const PulsingDot = styled.div` width: 8px; height: 8px; background: ${ACCENT}; border-radius: 50%; animation: ${ANIM_PULSE} 2s infinite; `;
const HandoverLoadingWrapper = styled.div`
  padding: 3rem;
  text-align: center;
  color: ${ACCENT};
  animation: ${ANIM_PULSE} 1s infinite;
`;
const AlertIconWrapper = styled.div`
  background: white;
  border-radius: 50%;
  padding: 0.2rem;
  animation: ${ANIM_PULSE_RED} 1.5s infinite;
`;
const ContentScroll = styled.div` flex: 1; overflow-y: auto; padding: 1.5rem 2rem; position: relative; `;
const SectionTitle = styled.h2` font-size: 1.2rem; font-weight: 800; margin-bottom: 1rem; color: white; display: flex; align-items: center; gap: 0.5rem; `;
const Table = styled.table` width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; `;
const Th = styled.th` padding: 1rem; color: #64748b; font-weight: 700; border-bottom: 1px solid ${BORDER}; `;
const Td = styled.td` padding: 1rem; border-bottom: 1px solid ${BORDER}; color: #e2e8f0; `;

// --- DATA ---
const INITIAL_DEPARTMENTS = [
  { id: 'd1', name: 'General Medicine Wing', general: [45, 60], icu: [0, 0], iso: [0,0], ped: [0,0], mat: [0,0] },
  { id: 'd2', name: 'ICU Block A', general: [0,0], icu: [22, 24], iso: [0,0], ped: [0,0], mat: [0,0] },
  { id: 'd3', name: 'ICU Block B', general: [0,0], icu: [15, 20], iso: [0,0], ped: [0,0], mat: [0,0] },
  { id: 'd4', name: 'Isolation Ward', general: [0,0], icu: [0,0], iso: [8, 15], ped: [0,0], mat: [0,0] },
  { id: 'd5', name: 'Pediatric Ward', general: [0,0], icu: [0,0], iso: [0,0], ped: [25, 30], mat: [0,0] },
  { id: 'd6', name: 'Maternity & Gynecology', general: [0,0], icu: [0,0], iso: [0,0], ped: [0,0], mat: [18, 25] },
  { id: 'd7', name: 'Emergency & Trauma', general: [12, 15], icu: [4, 5], iso: [0,0], ped: [0,0], mat: [0,0] },
  { id: 'd8', name: 'Surgical Ward', general: [28, 40], icu: [0,0], iso: [0,0], ped: [0,0], mat: [0,0] }
];

const ALERT_TYPES = {
  OUTBREAK: { color: '#ff4444', icon: '🔴', label: 'OUTBREAK WARNING' },
  AI_PREDICTION: { color: '#ff8c42', icon: '🟠', label: 'AI PREDICTION' },
  STOCK: { color: '#ffd166', icon: '🟡', label: 'STOCK REPLENISHMENT' },
  REPORTING: { color: '#4da6ff', icon: '🔵', label: 'MANDATORY REPORTING' },
  SYMPTOM: { color: '#b48aff', icon: '🟣', label: 'CITIZEN SYMPTOM CLUSTER' }
};
const INITIAL_ALERTS = [
  { id: 1, type: 'OUTBREAK', title: 'Dengue Outbreak Detected', desc: 'A sudden spike of cases reported from Sector-12. Prepare isolation wards.', source: 'SMC Health Command', wards: ['Sector-12'], time: '10 mins ago', status: 'pending' },
  { id: 2, type: 'AI_PREDICTION', title: 'High Typhoid Risk', desc: 'AI engine predicts increased typhoid admissions.', source: 'AI Engine', wards: ['Sector-4', 'Sector-5'], time: '2 hours ago', status: 'pending' }
];

const INC_SURGE = [
  { disease: 'Dengue', code: 'A90', strength: 'STRONG', source: '4 hospital cases + 9 community symptom reports + satellite heat index HIGH', trend: '↑ Rising', color: '#ff4444' },
  { disease: 'Typhoid', code: 'A01.0', strength: 'MODERATE', source: '3 hospital cases + 2 community reports', trend: '→ Stable', color: '#ff8c42' },
  { disease: 'Respiratory', code: 'J12.9', strength: 'WEAK', source: '5 community reports + weather change', trend: '↑ Rising', color: '#22c55e' }
];

const ICD10_LIST = [ "A90 Dengue", "A01.0 Typhoid", "J12.9 Pneumonia", "A09 Diarrhoea", "B54 Malaria", "A97 Dengue Haemorrhagic", "J18.9 Pneumonia unspecified", "A15 Tuberculosis", "B24 HIV", "J11 Influenza", "K29 Gastritis", "A06 Amoebiasis", "B05 Measles", "A36 Diphtheria", "A33 Neonatal Tetanus", "Z23 Vaccination encounter", "J00 Common Cold", "A77 Spotted fever", "B50 Falciparum Malaria", "A92 Other mosquito-borne fever" ];

const MEDICINES = [
  { id: 1, name: 'Paracetamol IV 100ml', cat: 'Antipyretic', stock: 120, unit: 'vials', thresh: 200, status: 'LOW' },
  { id: 2, name: 'Ceftriaxone 1g', cat: 'Antibiotic', stock: 450, unit: 'vials', thresh: 150, status: 'OK' },
  { id: 3, name: 'Oseltamivir 75mg', cat: 'Antiviral', stock: 15, unit: 'strips', thresh: 50, status: 'CRITICAL' },
  { id: 4, name: 'Dengue NS1 Antigen Kits', cat: 'Diagnostic', stock: 8, unit: 'kits', thresh: 20, status: 'CRITICAL' },
  { id: 5, name: 'Ringer Lactate 500ml', cat: 'IV Fluid', stock: 600, unit: 'bags', thresh: 300, status: 'OK' }
];

export default function HospitalApp() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [syncMins, setSyncMins] = useState(0);
  const [depts, setDepts] = useState(INITIAL_DEPARTMENTS);
  const [lastSynced, setLastSynced] = useState("Just now");
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [dismissSurgeBanner, setDismissSurgeBanner] = useState(false);
  const [showSurgePlan, setShowSurgePlan] = useState(false);
  
  const [meds, setMeds] = useState(MEDICINES);
  
  // Handover state
  const [handoverShift, setHandoverShift] = useState('Morning (6am–2pm)');
  const [handoverLoading, setHandoverLoading] = useState(false);
  const [handoverData, setHandoverData] = useState(null);

  // Case Feed
  const [cases, setCases] = useState([
    { id: 101, time: '10:45 AM', code: 'A90 Dengue', dept: 'Isolation Ward', type: 'Adult', visit: 'Admission', severity: 'Severe', source: 'auto' },
    { id: 102, time: '10:12 AM', code: 'J12.9 Pneumonia', dept: 'Pediatric Ward', type: 'Child', visit: 'Admission', severity: 'Moderate', source: 'auto' },
    { id: 103, time: '09:30 AM', code: 'A01.0 Typhoid', dept: 'General Medicine Wing', type: 'Senior', visit: 'OPD', severity: 'Mild', source: 'auto' }
  ]);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState({ code: '', dept: '', ptype: 'Adult', visit: 'Admission', sdate: '', severity: 'Mild', notes: '' });

  // Fluctuate Beds
  useEffect(() => {
    const bedInt = setInterval(() => {
      setDepts(prev => prev.map(d => {
        const mod = d;
        ['general', 'icu', 'iso', 'ped', 'mat'].forEach(k => {
          if (mod[k][1] > 0) {
            const change = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
            mod[k][0] = Math.max(0, Math.min(mod[k][1], mod[k][0] + change));
          }
        });
        return { ...mod };
      }));
      setLastSynced("Just now");
    }, 30000);
    const syncInt = setInterval(() => setSyncMins(p => p >= 15 ? 0 : p + 1), 60000);
    return () => { clearInterval(bedInt); clearInterval(syncInt); };
  }, []);

  // Recalculate Totals
  const getTotals = () => {
    const t = { gen: [0,0], icu: [0,0], iso: [0,0], ped: [0,0] };
    depts.forEach(d => {
      t.gen[0]+=d.general[0]; t.gen[1]+=d.general[1];
      t.icu[0]+=d.icu[0]; t.icu[1]+=d.icu[1];
      t.iso[0]+=d.iso[0]; t.iso[1]+=d.iso[1];
      t.ped[0]+=d.ped[0]+d.mat[0]; t.ped[1]+=d.ped[1]+d.mat[1];
    });
    return t;
  };
  const totals = getTotals();

  const isICUCritical = (totals.icu[0] / totals.icu[1]) > 0.85;
  const hasOutbreak = alerts.some(a => a.type === 'OUTBREAK' && a.status === 'pending');
  const showBanner = (isICUCritical || hasOutbreak) && !dismissSurgeBanner;

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualForm.code || !manualForm.dept) return;
    setCases([{ id: Date.now(), time: 'Just now', code: manualForm.code, dept: manualForm.dept, type: manualForm.ptype, visit: manualForm.visit, severity: manualForm.severity, source: 'manual' }, ...cases]);
    setShowManualForm(false);
  };

  const generateHandover = () => {
    setHandoverLoading(true); setHandoverData(null);
    setTimeout(() => {
      setHandoverLoading(false);
      setHandoverData({
        beds: `${totals.gen[0]+totals.icu[0]+totals.iso[0]+totals.ped[0]} occupied`,
        critical: isICUCritical ? 'ICU Block A at CRITICAL' : 'Stable',
        cases: cases.length,
        severe: cases.filter(c => c.severity === 'Severe').length,
        alerts: alerts.filter(a => a.status === 'pending').length
      });
    }, 1500);
  };

  const renderMeds = () => (
    <motion.div initial={{opacity:0}} animate={{opacity:1}}>
      <SectionTitle><FiDroplet/> Medicine & Stock</SectionTitle>
      <div style={{background:SURFACE, border:`1px solid ${BORDER}`, borderRadius:'8px', overflow:'hidden', marginTop:'2rem'}}>
        <Table>
          <thead>
            <tr style={{background:'#0f1115', borderBottom:`1px solid ${BORDER}`}}>
              <Th>ITEM</Th><Th>CATEGORY</Th><Th>CURRENT STOCK</Th><Th>THRESHOLD</Th><Th>STATUS</Th><Th>ACTION</Th>
            </tr>
          </thead>
          <tbody>
            {meds.map(m => (
              <tr key={m.id} style={{borderBottom:`1px solid ${BORDER}`}}>
                <Td style={{fontWeight:'bold'}}>{m.name}</Td>
                <Td style={{color:'#94a3b8'}}>{m.cat}</Td>
                <Td style={{fontFamily:'IBM Plex Mono'}}>{m.stock} {m.unit}</Td>
                <Td style={{fontFamily:'IBM Plex Mono', color:'#64748b'}}>{m.thresh}</Td>
                <Td>
                  <span style={{
                    background: m.status === 'OK' ? '#22c55e20' : m.status === 'LOW' ? '#f9731620' : '#ef444420',
                    color: m.status === 'OK' ? '#22c55e' : m.status === 'LOW' ? '#f97316' : '#ef4444',
                    padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold'
                  }}>
                    {m.status}
                  </span>
                </Td>
                <Td>
                  {m.status !== 'OK' && (
                    <button style={{background:'transparent', border:`1px solid ${ACCENT}`, color:ACCENT, padding:'0.4rem 0.8rem', borderRadius:'4px', fontSize:'0.8rem', cursor:'pointer'}}>Request Order</button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </motion.div>
  );

  const renderAlerts = () => (
    <motion.div initial={{opacity:0}} animate={{opacity:1}}>
      <SectionTitle style={{marginBottom:'2rem'}}><FiAlertTriangle/> SMC Health Command Alerts</SectionTitle>
      <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
        {alerts.map(alert => {
          const t = ALERT_TYPES[alert.type];
          return (
            <div key={alert.id} style={{
              background: alert.status === 'acknowledged' ? 'rgba(255,255,255,0.02)' : `${t.color}10`,
              border: `1px solid ${alert.status === 'acknowledged' ? BORDER : `${t.color}40`}`,
              borderRadius: '8px', padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start'
            }}>
              <div style={{fontSize:'2rem'}}>{t.icon}</div>
              <div style={{flex: 1}}>
                <div style={{display:'flex', alignItems:'center', gap:'1rem', marginBottom:'0.5rem'}}>
                  <span style={{background: `${t.color}20`, color: t.color, padding:'0.2rem 0.6rem', borderRadius:'4px', fontSize:'0.7rem', fontWeight:'bold'}}>{t.label}</span>
                  <span style={{fontSize:'0.7rem', color:'#64748b', fontFamily:'IBM Plex Mono'}}>{alert.time}</span>
                  {alert.status === 'acknowledged' && <span style={{color: '#00d4aa', fontSize:'0.8rem', fontWeight:'bold', marginLeft:'auto'}}><FiCheckCircle/> Acknowledged</span>}
                </div>
                <h3 style={{fontSize:'1.1rem', margin:'0 0 0.5rem', color: alert.status === 'acknowledged' ? '#94a3b8' : 'white'}}>{alert.title}</h3>
                <p style={{fontSize:'0.85rem', color:'#94a3b8', margin:'0 0 1rem', lineHeight:1.5}}>{alert.desc}</p>
                <div style={{fontSize:'0.75rem', color:'#64748b'}}><strong>Source:</strong> {alert.source} &nbsp;|&nbsp; <strong>Affected Wards:</strong> {alert.wards.join(', ')}</div>
              </div>
              {alert.status === 'pending' && (
                <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>

                  <button onClick={() => setAlerts(alerts.map(a => a.id === alert.id ? { ...a, status: 'acknowledged' } : a))} style={{background:'transparent', border:`1px solid ${t.color}`, color:t.color, padding:'0.6rem 1rem', borderRadius:'4px', fontWeight:'bold', cursor:'pointer'}}>Acknowledge Quick</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </motion.div>
  );

  const renderOverview = () => (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{display:'flex', flexDirection:'column', gap:'2rem'}}>
      <div style={{display:'flex', gap:'1.5rem'}}>
        {/* Your Facility at a Glance */}
        <div style={{flex: 1, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '1.5rem'}}>
          <SectionTitle>Your Facility at a Glance</SectionTitle>
          <div style={{fontSize:'0.8rem', color:'#94a3b8', marginBottom:'1rem'}}>Bed Breakdown by Department</div>
          <div style={{display:'flex', height:'24px', borderRadius:'12px', overflow:'hidden', marginBottom:'1rem'}}>
            <div style={{flex: totals.gen[1], background:'#4da6ff', borderRight:'1px solid #111'}} title="General"></div>
            <div style={{flex: totals.icu[1], background:'#ff8c42', borderRight:'1px solid #111'}} title="ICU"></div>
            <div style={{flex: totals.iso[1], background:'#b48aff', borderRight:'1px solid #111'}} title="Isolation"></div>
            <div style={{flex: totals.ped[1], background:'#22c55e'}} title="Pediatric/Maternity"></div>
          </div>
          <div style={{display:'flex', gap:'1rem', fontSize:'0.75rem', color:'#aaa', marginBottom:'2rem'}}>
            <span style={{color:'#4da6ff'}}>■ General</span> <span style={{color:'#ff8c42'}}>■ ICU</span> <span style={{color:'#b48aff'}}>■ Isolation</span> <span style={{color:'#22c55e'}}>■ Ped/Mat</span>
          </div>

          <div style={{fontSize:'0.8rem', color:'#94a3b8', marginBottom:'1rem'}}>Today's Admission Velocity</div>
          <div style={{display:'flex', alignItems:'flex-end', gap:'4px', height:'60px', borderBottom:`1px solid ${BORDER}`}}>
            {[2,4,3,6,8,12,15,10,8,14,18,22,25,20,15,10,12].map((v, i) => (
              <div key={i} style={{flex:1, background: i === 12 ? ACCENT : '#1e2128', height:`${(v/25)*100}%`, borderRadius:'2px 2px 0 0'}}></div>
            ))}
          </div>
          <div style={{background: 'rgba(255, 68, 68, 0.1)', border: '1px solid #ff4444', borderRadius:'8px', padding:'1rem', marginTop:'1.5rem', display:'flex', alignItems:'center', gap:'1rem'}}>
            <FiAlertTriangle color="#ff4444" size={24}/>
            <div>
              <div style={{color:'#ff4444', fontWeight:'bold', fontSize:'0.9rem'}}>Projected full capacity</div>
              <div style={{color:'#e2e8f0', fontSize:'0.85rem'}}>ICU Block A in ~4 hrs</div>
            </div>
          </div>
        </div>

        {/* Expected Incoming Surge */}
        <div style={{flex: 1.5, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '1.5rem', display:'flex', flexDirection:'column'}}>
          <SectionTitle>Expected Incoming Surge</SectionTitle>
          <p style={{fontSize:'0.85rem', color:'#94a3b8', margin:'0 0 1rem'}}>Intelligence feed of disease signals from nearby wards likely to route here.</p>
          <div style={{display:'flex', gap:'1rem', overflowX:'auto', scrollbarWidth:'none', flex:1, paddingBottom:'0.5rem'}}>
            {INC_SURGE.map((s,i) => (
              <div key={i} style={{minWidth:'280px', background: `${s.color}10`, border: `1px solid ${s.color}40`, borderLeft: `4px solid ${s.color}`, borderRadius: '8px', padding:'1.2rem'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                  <strong style={{color:'white', fontSize:'1.1rem'}}>{s.disease} <span style={{color:'#94a3b8', fontSize:'0.8rem'}}>{s.code}</span></strong>
                  <span style={{color:s.color, fontSize:'0.75rem', fontWeight:'bold', background:`${s.color}20`, padding:'2px 6px', borderRadius:'4px'}}>{s.strength}</span>
                </div>
                <div style={{fontSize:'0.8rem', color:'#aaa', marginBottom:'1rem', height:'40px'}}>{s.source}</div>
                <div style={{fontSize:'0.8rem', color: s.trend.includes('Rising') ? '#ff4444' : '#22c55e', fontWeight:'bold', marginBottom:'1rem'}}>{s.trend}</div>
                <button style={{width:'100%', background:'transparent', border:`1px solid ${s.color}`, color:s.color, padding:'0.5rem', borderRadius:'6px', cursor:'pointer', fontSize:'0.8rem'}}>
                  Pre-stock Meds →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderBeds = () => (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>
      {/* 4 Stat Pills */}
      <div style={{display:'flex', gap:'1rem'}}>
        {[
          {l: 'General Beds', o: totals.gen[0], t: totals.gen[1]},
          {l: 'ICU Beds', o: totals.icu[0], t: totals.icu[1]},
          {l: 'Isolation Beds', o: totals.iso[0], t: totals.iso[1]},
          {l: 'Pediatric + Maternity', o: totals.ped[0], t: totals.ped[1]}
        ].map(p => {
          const pct = p.o/p.t; 
          const color = pct > 0.85 ? '#ff4444' : pct > 0.7 ? '#ff8c42' : '#22c55e';
          return (
            <div key={p.l} style={{flex:1, background:SURFACE, border:`1px solid ${BORDER}`, borderRadius:'8px', padding:'1rem', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <span style={{fontSize:'0.8rem', fontWeight:'bold', color:'#94a3b8', textTransform:'uppercase'}}>{p.l}</span>
              <div style={{fontFamily:'IBM Plex Mono', fontSize:'1.2rem', color: color}}>{p.o} <span style={{color:'#64748b', fontSize:'0.8rem'}}>/ {p.t}</span></div>
            </div>
          )
        })}
      </div>

      {/* Main Table */}
      <div style={{background:SURFACE, border:`1px solid ${BORDER}`, borderRadius:'8px'}}>
        <div style={{padding:'1rem 1.5rem', borderBottom:`1px solid ${BORDER}`, display:'flex', justifyContent:'space-between'}}>
          <SectionTitle style={{margin:0}}>This Hospital's Department Breakdown</SectionTitle>
          <div style={{fontSize:'0.8rem', color:'#00d4aa', background:'rgba(0,212,170,0.1)', padding:'0.3rem 0.8rem', borderRadius:'20px', display:'flex', alignItems:'center', gap:'0.5rem'}}>
            <FiActivity/> Live Sync Active
          </div>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>DEPARTMENT</Th>
              <Th>GENERAL</Th><Th>ICU</Th><Th>ISOLATION</Th><Th>PED/MAT</Th>
              <Th>OCCUPANCY %</Th><Th>STATUS</Th><Th>LAST SYNCED</Th>
            </tr>
          </thead>
          <tbody>
            {depts.map(d => {
              const occ = d.general[0]+d.icu[0]+d.iso[0]+d.ped[0]+d.mat[0];
              const tot = d.general[1]+d.icu[1]+d.iso[1]+d.ped[1]+d.mat[1];
              const pct = tot === 0 ? 0 : occ/tot;
              const color = pct > 0.85 ? '#ff4444' : pct > 0.70 ? '#ff8c42' : '#22c55e';
              const status = pct > 0.85 ? 'CRITICAL' : pct > 0.70 ? 'HIGH LOAD' : 'AVAILABLE';
              return (
                <tr key={d.id}>
                  <Td style={{fontWeight:'bold'}}>{d.name}</Td>
                  <Td style={{fontFamily:'IBM Plex Mono'}}>{d.general[1]>0 ? `${d.general[0]}/${d.general[1]}` : '-'}</Td>
                  <Td style={{fontFamily:'IBM Plex Mono'}}>{d.icu[1]>0 ? `${d.icu[0]}/${d.icu[1]}` : '-'}</Td>
                  <Td style={{fontFamily:'IBM Plex Mono'}}>{d.iso[1]>0 ? `${d.iso[0]}/${d.iso[1]}` : '-'}</Td>
                  <Td style={{fontFamily:'IBM Plex Mono'}}>{(d.ped[1]+d.mat[1])>0 ? `${d.ped[0]+d.mat[0]}/${d.ped[1]+d.mat[1]}` : '-'}</Td>
                  <Td>
                    <div style={{width:'100px', height:'4px', background:BORDER, borderRadius:'2px'}}>
                      <div style={{width:`${pct*100}%`, height:'100%', background:color, borderRadius:'2px'}}></div>
                    </div>
                  </Td>
                  <Td><span style={{fontSize:'0.7rem', fontWeight:'bold', padding:'0.2rem 0.5rem', borderRadius:'4px', background:`${color}20`, color:color}}>{status}</span></Td>
                  <Td style={{fontSize:'0.75rem', color:'#64748b'}}>
                    <div style={{color:ACCENT, marginBottom:'2px'}}>Synced from HMS</div>
                    {lastSynced}
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </div>

      <div style={{display:'flex', gap:'1.5rem'}}>
        <div style={{flex:1, background:SURFACE, border:`1px solid ${BORDER}`, borderRadius:'8px', padding:'1.5rem', display:'flex', flexDirection:'column', justifyContent:'center'}}>
          <SectionTitle>Capacity Forecast</SectionTitle>
          <p style={{color:'#aaa', fontSize:'0.9rem', lineHeight:1.6}}>Based on your current admission velocity, your <strong style={{color:'white'}}>ICU Block A</strong> is projected to reach full capacity in <strong style={{color:'#ff4444'}}>~4 hours</strong>.</p>
        </div>
        <div style={{flex:1.5, background:SURFACE, border:`1px solid ${BORDER}`, borderRadius:'8px', padding:'1.5rem'}}>
          <SectionTitle>Pending Inter-Facility Transfers</SectionTitle>
          <div style={{display:'flex', flexDirection:'column', gap:'0.8rem', marginTop:'1rem'}}>
            <div style={{background:BG_DARK, border:`1px solid ${BORDER}`, padding:'1rem', borderRadius:'6px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div style={{color:'white', fontWeight:'bold', fontSize:'0.9rem'}}>Senior (60-70) <span style={{color:'#ff8c42'}}>→ Receiving</span></div>
                <div style={{fontSize:'0.8rem', color:'#94a3b8', marginTop:'4px'}}>From: District Hospital | Reason: Requires ICU</div>
              </div>
              <div style={{display:'flex', gap:'0.5rem'}}>
                <button style={{background:'#22c55e', color:'#000', border:'none', padding:'0.4rem 1rem', borderRadius:'4px', fontWeight:'bold', cursor:'pointer'}}>Approve</button>
                <button style={{background:'transparent', color:'#ff4444', border:'1px solid #ff4444', padding:'0.4rem 1rem', borderRadius:'4px', fontWeight:'bold', cursor:'pointer'}}>Decline</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderDisease = () => (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>
      <div style={{background: 'rgba(0, 212, 170, 0.1)', border: `1px solid ${ACCENT}`, borderRadius:'8px', padding:'1rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{color:ACCENT, fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>
          <FiCheckCircle/> Cases are auto-reported from your HMS. Data syncs every 15 minutes.
        </div>
        <button onClick={() => setShowManualForm(!showManualForm)} style={{background:'transparent', color:ACCENT, border:'none', fontWeight:'bold', cursor:'pointer', fontSize:'0.9rem'}}>
          Report a Missing Case Manually +
        </button>
      </div>

      <AnimatePresence>
        {showManualForm && (
          <motion.div initial={{height:0, opacity:0}} animate={{height:'auto', opacity:1}} exit={{height:0, opacity:0}} style={{overflow:'hidden'}}>
            <form onSubmit={handleManualSubmit} style={{background:SURFACE, border:`1px solid ${BORDER}`, borderRadius:'8px', padding:'1.5rem'}}>
              <h3 style={{marginTop:0, color:'white', fontSize:'1rem'}}>Manual Entry Form</h3>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem', marginBottom:'1rem'}}>
                <div>
                  <label style={{display:'block', fontSize:'0.75rem', color:'#aaa', marginBottom:'0.4rem'}}>ICD-10 Code *</label>
                  <select required value={manualForm.code} onChange={e=>setManualForm({...manualForm, code:e.target.value})} style={{width:'100%', padding:'0.8rem', background:BG_DARK, border:`1px solid ${BORDER}`, color:'white', borderRadius:'4px'}}>
                    <option value="">Select Code...</option>
                    {ICD10_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{display:'block', fontSize:'0.75rem', color:'#aaa', marginBottom:'0.4rem'}}>Department *</label>
                  <select required value={manualForm.dept} onChange={e=>setManualForm({...manualForm, dept:e.target.value})} style={{width:'100%', padding:'0.8rem', background:BG_DARK, border:`1px solid ${BORDER}`, color:'white', borderRadius:'4px'}}>
                    <option value="">Select Department...</option>
                    {INITIAL_DEPARTMENTS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{display:'block', fontSize:'0.75rem', color:'#aaa', marginBottom:'0.4rem'}}>Onset Date</label>
                  <input type="date" value={manualForm.sdate} onChange={e=>setManualForm({...manualForm, sdate:e.target.value})} style={{width:'100%', padding:'0.8rem', background:BG_DARK, border:`1px solid ${BORDER}`, color:'white', borderRadius:'4px'}}/>
                </div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem', marginBottom:'1.5rem'}}>
                <div>
                  <label style={{display:'block', fontSize:'0.75rem', color:'#aaa', marginBottom:'0.4rem'}}>Patient Type</label>
                  <select value={manualForm.ptype} onChange={e=>setManualForm({...manualForm, ptype:e.target.value})} style={{width:'100%', padding:'0.8rem', background:BG_DARK, border:`1px solid ${BORDER}`, color:'white', borderRadius:'4px'}}>
                    <option>Infant</option><option>Child</option><option>Adult</option><option>Senior</option>
                  </select>
                </div>
                <div>
                  <label style={{display:'block', fontSize:'0.75rem', color:'#aaa', marginBottom:'0.4rem'}}>Visit Type</label>
                  <select value={manualForm.visit} onChange={e=>setManualForm({...manualForm, visit:e.target.value})} style={{width:'100%', padding:'0.8rem', background:BG_DARK, border:`1px solid ${BORDER}`, color:'white', borderRadius:'4px'}}>
                    <option>Admission</option><option>OPD</option><option>Emergency</option>
                  </select>
                </div>
                <div>
                  <label style={{display:'block', fontSize:'0.75rem', color:'#aaa', marginBottom:'0.4rem'}}>Severity</label>
                  <select value={manualForm.severity} onChange={e=>setManualForm({...manualForm, severity:e.target.value})} style={{width:'100%', padding:'0.8rem', background:BG_DARK, border:`1px solid ${BORDER}`, color:'white', borderRadius:'4px'}}>
                    <option>Mild</option><option>Moderate</option><option>Severe</option>
                  </select>
                </div>
              </div>
              <button type="submit" style={{background:ACCENT, color:'#000', border:'none', padding:'0.8rem 2rem', borderRadius:'4px', fontWeight:'bold', cursor:'pointer'}}>Submit Case</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{background:SURFACE, border:`1px solid ${BORDER}`, borderRadius:'8px'}}>
        <div style={{padding:'1.5rem', borderBottom:`1px solid ${BORDER}`}}>
          <SectionTitle style={{margin:0}}>Disease Case Feed</SectionTitle>
        </div>
        <Table>
          <thead>
            <tr><Th>TIME</Th><Th>ICD-10 CODE</Th><Th>DEPARTMENT</Th><Th>PATIENT</Th><Th>VISIT TYPE</Th><Th>SEVERITY</Th><Th>SOURCE</Th><Th>ACTIONS</Th></tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {cases.map(c => {
                const sevColor = c.severity==='Severe'?'#ff4444':c.severity==='Moderate'?'#ff8c42':'#22c55e';
                return (
                  <motion.tr key={c.id} initial={{backgroundColor:'rgba(0,212,170,0.3)'}} animate={{backgroundColor:'transparent'}} transition={{duration:1}} style={{borderBottom:`1px solid ${BORDER}`}}>
                    <Td style={{fontFamily:'IBM Plex Mono', color:'#94a3b8'}}>{c.time}</Td>
                    <Td style={{fontWeight:'bold', color:'white'}}>{c.code}</Td>
                    <Td>{c.dept}</Td>
                    <Td>{c.type}</Td>
                    <Td>{c.visit}</Td>
                    <Td><span style={{color:sevColor, background:`${sevColor}20`, padding:'2px 8px', borderRadius:'10px', fontSize:'0.75rem', fontWeight:'bold'}}>{c.severity}</span></Td>
                    <Td>
                      {c.source === 'auto' ? 
                        <span style={{color:ACCENT, background:'rgba(0,212,170,0.1)', padding:'2px 8px', borderRadius:'4px', fontSize:'0.75rem', fontWeight:'bold'}}>HMS Auto-sync</span> : 
                        <span style={{color:'#ff8c42', background:'rgba(255,140,66,0.1)', padding:'2px 8px', borderRadius:'4px', fontSize:'0.75rem', fontWeight:'bold'}}>Manually Reported</span>
                      }
                    </Td>
                    <Td>
                      <button title="Flag for SMC" style={{background:'transparent', border:'none', color:'#ff4444', cursor:'pointer', fontSize:'1.1rem'}}><FiFlag/></button>
                    </Td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </tbody>
        </Table>
      </div>

      <div style={{background:SURFACE, border:`1px solid ${BORDER}`, borderRadius:'8px', padding:'1.5rem'}}>
        <SectionTitle>This Week's Disease Signal</SectionTitle>
        <div style={{display:'flex', alignItems:'flex-end', gap:'2rem', height:'120px', marginTop:'1rem', borderBottom:`1px solid ${BORDER}`, paddingBottom:'0.5rem'}}>
          {[{l:'Dengue',v:45,c:'#ff4444'}, {l:'Typhoid',v:20,c:'#ff8c42'}, {l:'Respiratory',v:65,c:'#4da6ff'}, {l:'Other',v:30,c:'#94a3b8'}].map(b => (
            <div key={b.l} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end'}}>
              <div style={{color:'white', fontFamily:'IBM Plex Mono', fontSize:'0.8rem', marginBottom:'4px'}}>{b.v}</div>
              <div style={{width:'40px', background:b.c, height:`${b.v}px`, borderRadius:'4px 4px 0 0'}}></div>
              <div style={{fontSize:'0.75rem', color:'#aaa', marginTop:'8px'}}>{b.l}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderHandover = () => (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{maxWidth:'600px', margin:'0 auto'}}>
      <SectionTitle style={{fontSize:'1.5rem', marginBottom:'2rem'}}><FiClipboard/> Shift Handover</SectionTitle>
      
      <div style={{display:'flex', gap:'1rem', marginBottom:'2rem'}}>
        <select value={handoverShift} onChange={e=>setHandoverShift(e.target.value)} style={{flex:1, padding:'1rem', background:SURFACE, border:`1px solid ${BORDER}`, color:'white', borderRadius:'8px'}}>
          <option>Morning (6am–2pm)</option>
          <option>Afternoon (2pm–10pm)</option>
          <option>Night (10pm–6am)</option>
        </select>
        <button onClick={generateHandover} style={{background:ACCENT, color:'#000', border:'none', padding:'0 2rem', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}}>Generate Summary</button>
      </div>

      {handoverLoading && (
        <HandoverLoadingWrapper>
          Compiling handover from live data...
        </HandoverLoadingWrapper>
      )}

      {handoverData && !handoverLoading && (
        <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} style={{background:SURFACE, border:`1px solid ${BORDER}`, borderRadius:'8px', padding:'2rem'}}>
          <h3 style={{marginTop:0, borderBottom:`1px solid ${BORDER}`, paddingBottom:'1rem'}}>Handover Summary: {handoverShift}</h3>
          
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginBottom:'2rem'}}>
            <div>
              <div style={{fontSize:'0.8rem', color:'#94a3b8', textTransform:'uppercase', marginBottom:'0.5rem'}}>Bed Status</div>
              <div style={{fontWeight:'bold', color:'white'}}>{handoverData.beds}</div>
              <div style={{fontSize:'0.9rem', color: isICUCritical ? '#ff4444' : '#22c55e'}}>{handoverData.critical}</div>
            </div>
            <div>
              <div style={{fontSize:'0.8rem', color:'#94a3b8', textTransform:'uppercase', marginBottom:'0.5rem'}}>Cases This Shift</div>
              <div style={{fontWeight:'bold', color:'white'}}>{handoverData.cases} Auto-Ingested</div>
              <div style={{fontSize:'0.9rem', color:'#ff8c42'}}>{handoverData.severe} Severe</div>
            </div>
            <div>
              <div style={{fontSize:'0.8rem', color:'#94a3b8', textTransform:'uppercase', marginBottom:'0.5rem'}}>Active SMC Alerts</div>
              <div style={{fontWeight:'bold', color: handoverData.alerts > 0 ? '#ff4444' : '#22c55e'}}>{handoverData.alerts} Pending</div>
            </div>
          </div>

          <div style={{marginBottom:'2rem'}}>
            <label style={{display:'block', fontSize:'0.8rem', color:'#94a3b8', textTransform:'uppercase', marginBottom:'0.5rem'}}>Notes for Incoming Shift</label>
            <textarea rows="3" placeholder="Add custom notes..." style={{width:'100%', padding:'1rem', background:BG_DARK, border:`1px solid ${BORDER}`, color:'white', borderRadius:'8px'}}></textarea>
          </div>

          <button style={{width:'100%', background:'#4da6ff', color:'#000', border:'none', padding:'1rem', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}}>
            Mark Handover Complete →
          </button>
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <AppContainer>
      <Sidebar>
        <div style={{padding:'0 1.5rem 2rem', fontWeight:'900', fontSize:'1.2rem', letterSpacing:'1px', color:'white', display:'flex', alignItems:'center', gap:'0.5rem'}}>
          <div style={{width:'24px', height:'24px', background:ACCENT, borderRadius:'4px'}}></div>
          AHEADLY<span style={{color:ACCENT}}>.HOS</span>
        </div>
        
        <NavItem active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')}><FiActivity/> Overview</NavItem>
        <NavItem active={activeTab === 'Beds'} onClick={() => setActiveTab('Beds')}><FiMonitor/> Bed & ICU Status</NavItem>
        <NavItem active={activeTab === 'Disease'} onClick={() => setActiveTab('Disease')}><FiFileText/> Disease Case Reporting</NavItem>
        <NavItem active={activeTab === 'Stock'} onClick={() => setActiveTab('Stock')}><FiDroplet/> Medicine & Stock</NavItem>
        <NavItem active={activeTab === 'Handover'} onClick={() => setActiveTab('Handover')}><FiClipboard/> Shift Handover</NavItem>
        
        <div style={{margin:'2rem 1.5rem 0.5rem', fontSize:'0.7rem', fontWeight:'700', color:'#64748b', letterSpacing:'0.05em'}}>SYSTEM</div>
        <NavItem active={activeTab === 'Alerts'} onClick={() => setActiveTab('Alerts')}>
          <FiAlertTriangle/> SMC Alerts 
          {alerts.filter(a => a.status === 'pending').length > 0 && <span style={{background:'#ff4444', color:'white', padding:'2px 6px', borderRadius:'10px', fontSize:'0.65rem', marginLeft:'auto'}}>{alerts.filter(a => a.status === 'pending').length}</span>}
        </NavItem>
        <NavItem><FiSettings/> Integration Settings</NavItem>

        <div style={{ marginTop: "auto", borderTop: `1px solid ${BORDER}`, paddingTop: "1rem" }}>
          <NavItem onClick={() => navigate("/dashboard")}>
            <FiShield color={ACCENT} /> SMC Admin Portal
          </NavItem>
        </div>
      </Sidebar>

      <MainArea>
        <TopBar>
          <div style={{display:'flex', alignItems:'center', gap:'1.5rem'}}>
            <div style={{display:'flex', flexDirection:'column'}}>
              <span style={{fontWeight:'700', color:'white', fontSize:'1.1rem'}}>Solapur Civil Hospital</span>
              <span style={{fontFamily:'IBM Plex Mono', fontSize:'0.75rem', color:'#64748b'}}>FACILITY_ID: SMC-HOS-0047</span>
            </div>
            <StatusIndicator>
              <PulsingDot /> Live Sync Active (Last sync {syncMins === 0 ? 'just now' : `${syncMins} min ago`})
            </StatusIndicator>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'1.5rem'}}>
            <FiBell size={20} color="#94a3b8" />
            <div style={{display:'flex', alignItems:'center', gap:'0.75rem', background:'rgba(255,255,255,0.05)', padding:'0.4rem 1rem', borderRadius:'50px', border:`1px solid ${BORDER}`}}>
              <FiUser size={16} color={ACCENT} />
              <div style={{display:'flex', flexDirection:'column'}}>
                <span style={{fontSize:'0.8rem', fontWeight:'600'}}>Dr. R. Sharma</span>
                <span style={{fontSize:'0.65rem', color:'#64748b'}}>Hospital Admin</span>
              </div>
            </div>
          </div>
        </TopBar>

        <ContentScroll>
          <AnimatePresence>
            {activeTab === 'Overview' && showBanner && (
              <motion.div initial={{y:-20, opacity:0}} animate={{y:0, opacity:1}} exit={{opacity:0, height:0}} style={{background:'linear-gradient(90deg, #ff8c42 0%, #ff4444 100%)', borderRadius:'8px', padding:'1rem 1.5rem', marginBottom:'2rem', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 10px 20px rgba(255,68,68,0.2)'}}>
                <div style={{display:'flex', alignItems:'center', gap:'1rem', color:'white'}}>
                  <AlertIconWrapper><FiAlertCircle color="#ff4444" size={24}/></AlertIconWrapper>
                  <strong>Surge Alert — ICU Block A at 95% capacity + Active Dengue Outbreak Warning from SMC. Recommended: Activate surge protocol.</strong>
                </div>
                <div style={{display:'flex', gap:'1rem'}}>
                  <button onClick={()=>setShowSurgePlan(true)} style={{background:'white', color:'#ff4444', border:'none', padding:'0.6rem 1rem', borderRadius:'4px', fontWeight:'bold', cursor:'pointer'}}>View Surge Plan →</button>
                  <button onClick={(e)=>{e.stopPropagation(); setDismissSurgeBanner(true)}} style={{background:'transparent', color:'white', border:'1px solid rgba(255,255,255,0.5)', padding:'0.6rem 1rem', borderRadius:'4px', cursor:'pointer'}}>Dismiss for 2 hours</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === 'Overview' && renderOverview()}
          {activeTab === 'Beds' && renderBeds()}
          {activeTab === 'Disease' && renderDisease()}
          {activeTab === 'Handover' && renderHandover()}
          {activeTab === 'Stock' && renderMeds()}
          {activeTab === 'Alerts' && renderAlerts()}
          
        </ContentScroll>
      </MainArea>

      <AnimatePresence>
        {showSurgePlan && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.8)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center'}}>
            <motion.div initial={{scale:0.95}} animate={{scale:1}} style={{background:SURFACE, padding:'2.5rem', borderRadius:'12px', border:`1px solid ${BORDER}`, maxWidth:'500px', width:'100%'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem'}}>
                <h2 style={{margin:0, color:'white'}}>Surge Protocol Checklist</h2>
                <FiX size={24} color="#94a3b8" cursor="pointer" onClick={()=>setShowSurgePlan(false)}/>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:'1rem', marginBottom:'2rem'}}>
                {['Convert Isolation Wing to ICU overflow', 'Halt elective surgeries', 'Notify on-call pulmonologists', 'Request NS1 kits from SMC'].map((item, i) => (
                  <label key={i} style={{display:'flex', gap:'1rem', color:'#e2e8f0', cursor:'pointer'}}><input type="checkbox"/> {item}</label>
                ))}
              </div>
              <button onClick={()=>{setShowSurgePlan(false); setDismissSurgeBanner(true);}} style={{width:'100%', padding:'1rem', background:ACCENT, border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}}>Activate Protocol & Dismiss</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppContainer>
  );
}
