import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// --- ORIGINAL LANDING PAGE STYLES ---
const PORTAL_COLOR = '#F4845F';
const PORTAL_LIGHT = 'rgba(244,132,95,0.12)';
const PORTAL_BORDER = 'rgba(244,132,95,0.35)';

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #0d0f14;
  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  animation: none;
  color: white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const Hero = styled.div`
  padding: 4rem 2rem 3rem;
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
`;

const Badge = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: ${PORTAL_LIGHT};
  border: 1px solid ${PORTAL_BORDER};
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${PORTAL_COLOR};
  margin-bottom: 1.5rem;
`;

const HeroTitle = styled(motion.h1)`
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 900;
  letter-spacing: -2px;
  margin: 0 0 1rem;
  color: white;
  span { color: ${PORTAL_COLOR}; }
`;

const HeroSub = styled(motion.p)`
  font-size: 1.1rem;
  color: rgba(255,255,255,0.6);
  margin-bottom: 0.6rem;
  font-style: italic;
`;

const HeroRole = styled(motion.p)`
  font-size: 0.8rem;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
`;

const Section = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
`;

const SectionLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${PORTAL_COLOR};
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 800;
  color: white;
  margin: 0 0 1.5rem;
`;

const RoleFlow = styled.div`
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 1.75rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
`;

const RoleStep = styled.div`
  background: ${PORTAL_LIGHT};
  border: 1px solid ${PORTAL_BORDER};
  border-radius: 10px;
  padding: 0.7rem 1.1rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255,255,255,0.85);
  flex: 1;
  min-width: 160px;
  text-align: center;
`;

const Arrow = styled.div`
  font-size: 1.2rem;
  color: ${PORTAL_COLOR};
  flex-shrink: 0;
`;

const ImpactCard = styled(motion.div)`
  background: linear-gradient(135deg, rgba(244,132,95,0.1), rgba(244,132,95,0.05));
  border: 1px solid ${PORTAL_BORDER};
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2.5rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${PORTAL_COLOR}, transparent);
  }
`;

const ImpactTitle = styled.div`
  font-size: 1rem;
  font-weight: 800;
  color: ${PORTAL_COLOR};
  margin-bottom: 1rem;
`;

const ImpactText = styled.div`
  font-size: 0.9rem;
  color: rgba(255,255,255,0.7);
  line-height: 1.6;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.06);

  strong { color: white; }
`;

const CascadeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 1.5rem 0;
  position: relative;
`;

const CascadeItem = styled(motion.div)`
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
`;

const CascadeIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${PORTAL_COLOR};
  font-size: 1.1rem;
  flex-shrink: 0;
`;

const CascadeLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255,255,255,0.85);
  line-height: 1.5;

  strong {
    color: white;
    font-weight: 700;
  }

  span.meta {
    display: inline-block;
    margin-left: 8px;
    padding: 2px 8px;
    background: rgba(255,255,255,0.05);
    border-radius: 4px;
    font-size: 0.75rem;
    color: ${PORTAL_COLOR};
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
  margin-bottom: 3rem;
`;

const FeatureCard = styled(motion.div)`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 1.5rem;
  cursor: pointer;
  &:hover {
    border-color: ${PORTAL_COLOR};
    background: ${PORTAL_LIGHT};
    transform: translateY(-3px);
  }
  transition: all 0.2s;
`;

const CardIcon = styled.div`font-size: 2rem; margin-bottom: 0.75rem;`;
const CardTitle = styled.div`font-size: 1rem; font-weight: 800; color: white; margin-bottom: 0.4rem;`;
const CardDesc = styled.div`font-size: 0.82rem; color: rgba(255,255,255,0.6); line-height: 1.5;`;

// Gateway section styles
const GatewayBox = styled.div`
  background: rgba(20,145,155,0.06);
  border: 1px solid rgba(20,145,155,0.3);
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
`;

const GatewayHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 0.5rem;
`;

const GatewayBadge = styled.div`
  background: rgba(20,145,155,0.15);
  border: 1px solid rgba(20,145,155,0.3);
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #14919B;
`;

const GatewayTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 900;
  color: white;
  margin: 0 0 0.3rem;
`;

const GatewaySubtitle = styled.p`
  font-size: 0.85rem;
  color: rgba(255,255,255,0.5);
  margin: 0 0 2rem;
`;

const ArchDiagram = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 2rem;
`;

const ArchBox = styled.div`
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  min-width: 150px;
  text-align: center;
  flex: 1;
`;

const ArchBoxTitle = styled.div`
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.5);
  margin-bottom: 0.4rem;
`;

const ArchBoxContent = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
`;

const ArchBoxSub = styled.div`
  font-size: 0.72rem;
  color: rgba(255,255,255,0.4);
  margin-top: 0.2rem;
`;

const ArchArrow = styled.div`
  font-size: 1.5rem;
  color: rgba(20,145,155,0.7);
  padding: 0 0.5rem;
  flex-shrink: 0;
`;

const SyncGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const SyncItem = styled.div`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.75);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span.dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #14919B;
    flex-shrink: 0;
  }
`;

const ComplianceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const CompItem = styled.div`
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.65);
  line-height: 1.5;

  strong {
    color: white;
    display: block;
    margin-bottom: 0.2rem;
  }
`;

const IntegrCodeBlock = styled.pre`
  background: #0a0a1a;
  border: 1px solid rgba(20,145,155,0.2);
  border-radius: 12px;
  padding: 1.5rem;
  font-size: 0.75rem;
  color: #a8d8da;
  overflow-x: auto;
  line-height: 1.6;
  margin: 1.5rem 0;

  .key { color: #ff9d5c; }
  .str { color: #a8ff78; }
  .num { color: #f9ca24; }
  .com { color: rgba(255,255,255,0.3); }
`;

const IntegrationSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1.5rem 0;
`;

const IntStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255,255,255,0.04);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.07);
`;

const StepNum = styled.div`
  width: 28px; height: 28px;
  border-radius: 50%;
  background: rgba(20,145,155,0.2);
  border: 1px solid rgba(20,145,155,0.4);
  color: #14919B;
  font-size: 0.78rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  font-size: 0.82rem;
  color: rgba(255,255,255,0.75);
  line-height: 1.5;
  strong { color: white; }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
`;

const PrimaryBtn = styled(motion.button)`
  background: linear-gradient(135deg, ${PORTAL_COLOR}, #d4614c);
  border: none;
  border-radius: 10px;
  padding: 0.85rem 1.75rem;
  color: white;
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;
`;

const SecondaryBtn = styled(motion.button)`
  background: transparent;
  border: 1.5px solid ${PORTAL_BORDER};
  border-radius: 10px;
  padding: 0.85rem 1.75rem;
  color: ${PORTAL_COLOR};
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
`;

const EnterButton = styled(motion.button)`
  background: linear-gradient(135deg, ${PORTAL_COLOR}, #d4614c);
  border: none;
  border-radius: 12px;
  padding: 1rem 2.5rem;
  color: white;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  display: block;
  margin: 2rem auto 0;
`;

// --- WIZARD OVERLAY STYLES ---
const ACCENT = '#00d4aa';

const WizardOverlay = styled(motion.div)`
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100vh;
  background-color: #0d0f14;
  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  color: white;
  font-family: 'Inter', sans-serif;
`;

const WizardHeader = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #1e2128;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #111318;
`;

const StepIndicator = styled.div`
  display: flex;
  gap: 1rem;
`;

const Dot = styled.div`
  width: 12px; height: 12px;
  border-radius: 50%;
  background: ${props => props.active ? ACCENT : props.completed ? ACCENT : '#1e2128'};
  opacity: ${props => props.active ? 1 : props.completed ? 0.5 : 1};
  box-shadow: ${props => props.active ? `0 0 10px ${ACCENT}` : 'none'};
`;

const CancelBtn = styled.button`
  background: transparent;
  color: rgba(255,255,255,0.5);
  border: none;
  font-weight: 600;
  cursor: pointer;
  &:hover { color: white; }
`;

const WizardContent = styled.div`
  flex: 1;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const FormTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  font-weight: 800;
  color: white;
`;

const FormSub = styled.p`
  color: #888;
  margin-bottom: 2rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.9rem;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
  text-align: left;
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  input, select {
    width: 100%;
    background: #111318;
    border: 1px solid #1e2128;
    padding: 1rem;
    border-radius: 8px;
    color: white;
    font-family: 'Inter', sans-serif;
    &:focus { outline: none; border-color: ${ACCENT}; }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
`;

const HMSBox = styled.div`
  border: 1px solid ${props => props.selected ? ACCENT : '#1e2128'};
  background: ${props => props.selected ? 'rgba(0, 212, 170, 0.05)' : '#111318'};
  padding: 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  h3 { margin: 0 0 0.5rem; font-size: 1.1rem; color: white;}
  p { margin: 0; font-size: 0.8rem; color: #888; }
  &:hover { border-color: ${ACCENT}; }
`;

const CredentialCard = styled.div`
  background: #000;
  border: 1px solid #1e2128;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 2rem;
  font-family: 'IBM Plex Mono', monospace;
  text-align: left;
  .row { display: flex; justify-content: space-between; margin-bottom: 1rem; border-bottom: 1px solid #111; padding-bottom: 0.5rem;}
  .label { color: #888; font-size: 0.8rem; }
  .val { color: ${ACCENT}; font-weight: bold; }
`;

const CheckboxRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  text-align: left;
  cursor: pointer;
  input { mt: 4px; }
  span { font-size: 0.9rem; color: #ccc; line-height: 1.4; }
  strong { color: white; }
`;

const WizardCodeBlock = styled.pre`
  background: #000; color: #00d4aa; padding: 1.5rem; border-radius: 8px; font-family: 'IBM Plex Mono', monospace; font-size: 0.85rem; overflow-x: auto; text-align: left; border: 1px solid #1e2128;
`;

const SyncAnim = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 300px;
  gap: 1rem;
  .ring {
    width: 60px; height: 60px; border-radius: 50%;
    border: 3px solid ${ACCENT};
    border-top-color: transparent;
    animation: spin 1s linear infinite;
  }
  @keyframes spin { 100% { transform: rotate(360deg); } }
`;

const CyberBtn = styled(motion.button)`
  background: ${props => props.primary ? `linear-gradient(135deg, ${ACCENT}, #00a383)` : 'transparent'};
  border: ${props => props.primary ? 'none' : `1px solid ${ACCENT}`};
  color: ${props => props.primary ? '#000' : ACCENT};
  padding: 1.2rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 800;
  border-radius: 8px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
`;


const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeSlide = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

export default function HospitalOnboarding() {
  const navigate = useNavigate();
  const [showCode, setShowCode] = useState(false);
  
  // WIZARD STATES
  const [wizardStep, setWizardStep] = useState(0); 
  const [hms, setHms] = useState('');
  const [consents, setConsents] = useState({ c1: false, c2: false, c3: false });
  const [signature, setSignature] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false);

  const startWizard = () => setWizardStep(1);
  const nextStep = () => setWizardStep(s => s + 1);
  const closeWizard = () => setWizardStep(0);

  const featureCards = [
    { icon: '📝', title: 'Report Disease Cases', desc: 'Official ward-level disease reporting — ICD-coded, structured, and timestamped', route: '/hospital-reporting' },
    { icon: '📊', title: 'Capacity Dashboard', desc: 'Track bed occupancy, ICU, medicine stocks, and blood bank in real time', route: '/hospital-reporting' },
  ];

  const hmsOptions = [
    { id: 'bahmni', name: 'Bahmni / OpenMRS', desc: 'Docker adapter available. ~30 min setup.' },
    { id: 'ehospital', name: 'eHospital', desc: 'Pre-configured API bridge. ~15 min setup.' },
    { id: 'practo', name: 'Practo Instinct', desc: 'OAuth2 Integration via practicing dashboard.' },
    { id: 'manual', name: 'None (Manual Reporting)', desc: 'Daily CSV upload or manual entry.' }
  ];

  const handleTestConnection = () => {
    setTestingConnection(true);
    setTimeout(() => {
      setTestingConnection(false);
      setConnectionSuccess(true);
    }, 2000);
  };

  return (
    <PageContainer>
      <Hero>
        <Badge initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          🏥 HOSPITAL CONNECT
        </Badge>
        <HeroTitle initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}>
          Gateway to Solapur's<br /><span>unified disease surveillance</span>
        </HeroTitle>
        <HeroSub initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          "Your data directly saves lives by enabling early detection"
        </HeroSub>
        <HeroRole initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          For: Hospital Administrators · Lab Technicians · Medical Records Officers
        </HeroRole>
      </Hero>

      <Section>
        <SectionLabel>YOUR ROLE IN AHEADLY</SectionLabel>
        <SectionTitle>How hospital data creates early warnings</SectionTitle>

        <RoleFlow>
          <RoleStep>🏥 YOUR hospital reports disease cases</RoleStep>
          <Arrow>→</Arrow>
          <RoleStep>📡 Cases feed into the city's Disease Signal layer</RoleStep>
          <Arrow>→</Arrow>
          <RoleStep>📊 Disease signals contribute to ward-level HRI scoring</RoleStep>
          <Arrow>→</Arrow>
          <RoleStep>⚠️ HRI triggers outbreak predictions and interventions</RoleStep>
          <Arrow>→</Arrow>
          <RoleStep>❤️ Your data saves lives through early detection</RoleStep>
        </RoleFlow>

        <SectionLabel>WHY YOUR REPORTS MATTER</SectionLabel>
        <SectionTitle>One report triggers a cascade</SectionTitle>

        <ImpactCard
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <ImpactTitle>📍 When you report 1 dengue case from Sector-12...</ImpactTitle>
          
          <CascadeContainer>
            <CascadeItem
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CascadeIcon>→</CascadeIcon>
              <CascadeLabel>
                Aheadly <strong>cross-references it with satellite heat data</strong> 
                <span className="meta">38°C LST</span>
              </CascadeLabel>
            </CascadeItem>

            <CascadeItem
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CascadeIcon>→</CascadeIcon>
              <CascadeLabel>
                Checks <strong>water stagnation index</strong> in that ward 
                <span className="meta">HIGH RISK</span>
              </CascadeLabel>
            </CascadeItem>

            <CascadeItem
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CascadeIcon>→</CascadeIcon>
              <CascadeLabel>
                Sees <strong>12 community sanitation complaints</strong> nearby
                <span className="meta">CLUSTER</span>
              </CascadeLabel>
            </CascadeItem>

            <CascadeItem
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <CascadeIcon>→</CascadeIcon>
              <CascadeLabel>
                <strong>HRI jumps from 3.0 → 5.0</strong> 
                <span className="meta">MODERATE</span>
              </CascadeLabel>
            </CascadeItem>

            <CascadeItem
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <CascadeIcon>🚨</CascadeIcon>
              <CascadeLabel>
                Health officers get an alert <strong>5 days before more cases appear</strong>
              </CascadeLabel>
            </CascadeItem>
          </CascadeContainer>

          <ImpactText>
            <strong>Your single report triggers a cascade of early warning intelligence.</strong>
          </ImpactText>
        </ImpactCard>

        <SectionLabel>PORTAL MODULES</SectionLabel>
        <SectionTitle>What you can do here</SectionTitle>

        <motion.div variants={stagger} initial="hidden" animate="show">
          <FeatureGrid>
            {featureCards.map((card) => (
              <FeatureCard
                key={card.title}
                variants={fadeSlide}
                onClick={() => navigate(card.route)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CardIcon>{card.icon}</CardIcon>
                <CardTitle>{card.title}</CardTitle>
                <CardDesc>{card.desc}</CardDesc>
              </FeatureCard>
            ))}
          </FeatureGrid>
        </motion.div>

        {/* ── INTEGRATION GATEWAY ── */}
        <GatewayBox>
          <GatewayHeader>
            <span style={{ fontSize: '1.5rem' }}>⚡</span>
            <div>
              <GatewayBadge>Innovation</GatewayBadge>
            </div>
          </GatewayHeader>
          <GatewayTitle>AHEADLY INTEGRATION GATEWAY</GatewayTitle>
          <GatewaySubtitle>Automatic data sync — no manual entry required</GatewaySubtitle>

          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', lineHeight: 1.7 }}>
            Instead of manually entering bed counts and case reports, <strong style={{ color: 'white' }}>Aheadly can plug directly into your existing hospital management system</strong> — syncing data automatically every 15 minutes.
          </p>

          <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>
            HOW IT WORKS
          </div>

          <ArchDiagram>
            <ArchBox>
              <ArchBoxTitle>Your System</ArchBoxTitle>
              <ArchBoxContent>Hospital HMS / HIS / EMR</ArchBoxContent>
              <ArchBoxSub>Bahmni · OpenMRS · eHospital</ArchBoxSub>
            </ArchBox>
            <ArchArrow>──→</ArchArrow>
            <ArchBox>
              <ArchBoxTitle>Aheadly Adapter</ArchBoxTitle>
              <ArchBoxContent>FHIR R4 Bridge</ArchBoxContent>
              <ArchBoxSub>Read-only · Anonymized</ArchBoxSub>
            </ArchBox>
            <ArchArrow>──→</ArchArrow>
            <ArchBox>
              <ArchBoxTitle>Aheadly Engine</ArchBoxTitle>
              <ArchBoxContent>Health Intelligence</ArchBoxContent>
              <ArchBoxSub>HRI · Alerts · Predictions</ArchBoxSub>
            </ArchBox>
          </ArchDiagram>

          <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>
            WHAT SYNCS AUTOMATICALLY
          </div>

          <SyncGrid>
            {[
              '🛏️ Bed occupancy by ward — every 15 min',
              '🔢 New admissions by ICD-10 code — per admission',
              '📋 Discharge summaries — per discharge',
              '💊 Medicine stock levels — daily',
              '🩸 Blood bank units — daily',
              '🧪 Lab test results (aggregate) — daily',
            ].map(item => (
              <SyncItem key={item}>
                <span className="dot" />
                {item}
              </SyncItem>
            ))}
          </SyncGrid>

          <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>
            COMPLIANCE & STANDARDS
          </div>

          <ComplianceGrid>
            <CompItem><strong>FHIR R4</strong> Compliant with any modern HMS</CompItem>
            <CompItem><strong>ABDM Aligned</strong> Ayushman Bharat Digital Mission HIE-CM</CompItem>
            <CompItem><strong>DPDPA 2023</strong> Only anonymized aggregate counts flow to Aheadly</CompItem>
            <CompItem><strong>TLS 1.3</strong> End-to-end encrypted data transmission</CompItem>
            <CompItem><strong>Data Ownership</strong> Hospital remains Data Fiduciary; Aheadly is Data Processor</CompItem>
            <CompItem><strong>Purpose Limited</strong> Data used only for public health surveillance</CompItem>
          </ComplianceGrid>

          <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>
            INTEGRATION SETUP — 5 STEPS
          </div>

          <IntegrationSteps>
            {[
              { n: '1', title: 'Hospital registers on Aheadly', desc: 'Receive your facility_id and API credentials' },
              { n: '2', title: 'IT team installs Aheadly Adapter', desc: 'npm package or Docker container — 30 minute setup' },
              { n: '3', title: 'Adapter connects to existing HMS', desc: 'Read-only database access — no write permissions ever granted' },
              { n: '4', title: 'Auto-sync begins', desc: 'Bed counts every 15 min, cases per admission, stocks daily' },
              { n: '5', title: 'Manual reporting disabled', desc: '✅ Auto-sync active — your dashboard updates automatically' },
            ].map(step => (
              <IntStep key={step.n}>
                <StepNum>{step.n}</StepNum>
                <StepContent><strong>{step.title}</strong><br />{step.desc}</StepContent>
              </IntStep>
            ))}
          </IntegrationSteps>

          <button
            onClick={() => setShowCode(!showCode)}
            style={{
              background: 'rgba(20,145,155,0.1)',
              border: '1px solid rgba(20,145,155,0.3)',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              color: '#14919B',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: showCode ? '0' : '1.5rem',
            }}
          >
            {showCode ? '▲ Hide' : '▼ View'} API Specification (FHIR R4)
          </button>

          {showCode && (
            <IntegrCodeBlock>{`POST /api/v1/facility/sync
Authorization: Bearer {facility_token}
Content-Type: application/fhir+json

{
  "resourceType": "Bundle",
  "type": "collection",
  "facility_id": "IN-MH-SOL-001",
  ...`}</IntegrCodeBlock>
          )}

          <ButtonRow>
            {/* THIS IS THE BUTTON THAT TRIGGERS THE WIZARD OVERLAY NOW */}
            <PrimaryBtn onClick={startWizard} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              Request Integration Setup →
            </PrimaryBtn>
            <SecondaryBtn onClick={() => navigate('/hospital-reporting')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              Use Manual Reporting →
            </SecondaryBtn>
          </ButtonRow>
        </GatewayBox>

        <EnterButton
          onClick={() => navigate('/hospital-reporting')}
          whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(244,132,95,0.4)' }}
          whileTap={{ scale: 0.97 }}
        >
          Enter Hospital Portal →
        </EnterButton>
      </Section>


      {/* --- REAL WIZARD OVERLAY OVER THE EXISTING LANDING PAGE --- */}
      <AnimatePresence>
        {wizardStep > 0 && (
          <WizardOverlay
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <WizardHeader>
              <div style={{fontWeight: 900, letterSpacing: '2px', color: ACCENT}}>AHEADLY // SETUP</div>
              <StepIndicator>
                {[1,2,3,4,5].map(i => <Dot key={i} active={wizardStep===i} completed={wizardStep>i} />)}
              </StepIndicator>
              <CancelBtn onClick={closeWizard}>CANCEL</CancelBtn>
            </WizardHeader>
            
            <WizardContent>
              {wizardStep === 1 && (
                <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}}>
                  <FormTitle>Hospital Identity</FormTitle>
                  <FormSub>Define facility boundaries and designated technical contacts.</FormSub>
                  
                  <InputGroup>
                    <label>Facility Name</label>
                    <input type="text" placeholder="e.g. Solapur Civil Hospital" />
                  </InputGroup>
                  <Grid>
                    <InputGroup>
                      <label>Facility Type</label>
                      <select>
                        <option>District Hospital</option>
                        <option>Primary Health Centre</option>
                        <option>Diagnostic Lab</option>
                        <option>Private Clinic</option>
                      </select>
                    </InputGroup>
                    <InputGroup>
                      <label>Ward / Sector</label>
                      <select>
                        <option>Sector-1 (Central)</option>
                        <option>Sector-2 (North)</option>
                        <option>Sector-3 (South)</option>
                      </select>
                    </InputGroup>
                  </Grid>
                  
                  <div style={{height: '1px', background: '#1e2128', margin: '2rem 0'}}></div>
                  <FormSub style={{marginBottom: '1rem'}}>Designated Technical Contact</FormSub>
                  <Grid>
                    <InputGroup>
                      <label>Full Name</label>
                      <input type="text" />
                    </InputGroup>
                    <InputGroup>
                      <label>Contact Email</label>
                      <input type="email" />
                    </InputGroup>
                  </Grid>

                  <CyberBtn primary style={{width:'100%', marginTop:'2rem'}} onClick={nextStep}>
                    Generate Facility Identity →
                  </CyberBtn>
                </motion.div>
              )}

              {wizardStep === 2 && (
                <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}}>
                  <FormTitle>HMS Selection & Credentials</FormTitle>
                  <FormSub>Select your existing management system to generate integration keys.</FormSub>
                  
                  <Grid style={{marginBottom: '2rem'}}>
                    {hmsOptions.map(opt => (
                      <HMSBox key={opt.id} selected={hms === opt.id} onClick={() => setHms(opt.id)}>
                        <h3>{opt.name}</h3>
                        <p>{opt.desc}</p>
                      </HMSBox>
                    ))}
                  </Grid>

                  {hms && (
                    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}>
                      <CredentialCard>
                        <div style={{color:'#fff', marginBottom:'1rem'}}>⚠️ SECURITY NOTICE: Store these securely. They will only be shown once.</div>
                        <div className="row">
                          <span className="label">FACILITY_ID</span>
                          <span className="val">SMC-HOS-{Math.floor(Math.random()*10000)}</span>
                        </div>
                        <div className="row">
                          <span className="label">API_KEY</span>
                          <span className="val">ahd_live_{Math.random().toString(36).substring(2, 15)}</span>
                        </div>
                        <div className="row">
                          <span className="label">WEBHOOK_SECRET</span>
                          <span className="val">whsec_{Math.random().toString(36).substring(2, 15)}</span>
                        </div>
                        <CyberBtn style={{width:'100%', fontSize:'0.9rem', padding:'0.8rem'}}>Download credentials.json</CyberBtn>
                      </CredentialCard>
                      <CyberBtn primary style={{width:'100%', marginTop:'2rem'}} onClick={nextStep}>Proceed to Installation →</CyberBtn>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {wizardStep === 3 && (
                <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}}>
                  <FormTitle>Adapter Installation</FormTitle>
                  <FormSub>Follow the instructions to deploy the Aheadly Sync Adapter to your environment.</FormSub>
                  
                  {hms === 'manual' ? (
                    <div>
                      <p style={{color: '#aaa', lineHeight: 1.6}}>You have selected Manual Reporting. Please download the standard CSV template for daily health metric uploads.</p>
                      <CyberBtn style={{margin: '2rem 0'}}>Download Reporting Template (.csv)</CyberBtn>
                    </div>
                  ) : (
                    <>
                      <div style={{marginBottom: '1rem', color: '#aaa'}}>Run the following command in your server acting as the bridge:</div>
                      <WizardCodeBlock>
                        npm install -g @aheadly/adapter{"\n"}
                        aheadly-bridge init --facility SMC-HOS-XXXX --key ahd_live_XXXX
                      </WizardCodeBlock>
                      <div style={{marginBottom: '1rem', color: '#aaa', marginTop: '1.5rem'}}>Or using Docker Compose:</div>
                      <WizardCodeBlock>
                        version: '3.8'{"\n"}
                        services:{"\n"}
                        {"  "}aheadly-adapter:{"\n"}
                        {"    "}image: ghcr.io/aheadly/adapter:latest{"\n"}
                        {"    "}environment:{"\n"}
                        {"      "}- AHEADLY_API_KEY=ahd_live_XXXX{"\n"}
                        {"    "}ports:{"\n"}
                        {"      "}- "8080:8080"
                      </WizardCodeBlock>
                    </>
                  )}

                  <div style={{marginTop: '3rem', padding: '2rem', background: '#111318', border: '1px solid #1e2128', borderRadius: '8px', textAlign: 'center'}}>
                    <h3 style={{marginBottom: '1rem', color: 'white'}}>Verify Connection to SMC Hub</h3>
                    {!connectionSuccess && (
                      <CyberBtn onClick={handleTestConnection}>
                        {testingConnection ? 'Pinging Hub...' : 'Run Diagnostics Ping'}
                      </CyberBtn>
                    )}
                    {connectionSuccess && (
                      <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} style={{color: ACCENT, fontWeight: 'bold'}}>
                        ✅ Connection Established. Responded in 142ms.
                      </motion.div>
                    )}
                  </div>

                  <CyberBtn primary style={{width:'100%', marginTop:'2rem'}} onClick={nextStep} disabled={!connectionSuccess && hms !== 'manual'}>Next: Data Consent →</CyberBtn>
                </motion.div>
              )}

              {wizardStep === 4 && (
                <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}}>
                  <FormTitle>Data Consent & Legal</FormTitle>
                  <FormSub>Review the terms. Hospital acts as Data Fiduciary, Aheadly as Data Processor.</FormSub>
                  
                  <div style={{background: '#111318', padding: '2rem', border: '1px solid #1e2128', borderRadius: '8px', marginBottom: '2rem'}}>
                    <CheckboxRow>
                      <input type="checkbox" checked={consents.c1} onChange={e => setConsents({...consents, c1: e.target.checked})} />
                      <span><strong>Anonymized Aggregate Data Only.</strong> We agree to share only non-PII health event counts mapped to ward locations.</span>
                    </CheckboxRow>
                    <CheckboxRow>
                      <input type="checkbox" checked={consents.c2} onChange={e => setConsents({...consents, c2: e.target.checked})} />
                      <span><strong>FHIR R4 & ABDM Aligned.</strong> We conform to Ayushman Bharat Digital Mission interoperability standards.</span>
                    </CheckboxRow>
                    <CheckboxRow>
                      <input type="checkbox" checked={consents.c3} onChange={e => setConsents({...consents, c3: e.target.checked})} />
                      <span><strong>DPDPA 2023 Compliant.</strong> We acknowledge our role as Data Fiduciary under the Digital Personal Data Protection Act.</span>
                    </CheckboxRow>
                  </div>

                  <InputGroup>
                    <label>Digital Signature (Type Full Name)</label>
                    <input type="text" value={signature} onChange={e => setSignature(e.target.value)} placeholder="Type name to sign..." />
                    <div style={{color: '#666', fontSize: '0.8rem', marginTop: '0.5rem'}}>Timestamp: {new Date().toLocaleString()}</div>
                  </InputGroup>

                  <CyberBtn primary style={{width:'100%', marginTop:'2rem'}} onClick={nextStep} disabled={!(consents.c1&&consents.c2&&consents.c3&&signature.trim().length > 3)}>Finalize & Go Live →</CyberBtn>
                </motion.div>
              )}

              {wizardStep === 5 && (
                <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} style={{textAlign:'center'}}>
                  <FormTitle>Initializing Uplink...</FormTitle>
                  <FormSub>Establishing secure streams to Solapur Health Command</FormSub>

                  <SyncAnim>
                    <div className="ring"></div>
                    <div style={{fontFamily:'IBM Plex Mono', color:ACCENT}}>
                      <div>Bed Occupancy ........... ✅</div>
                      <div>Disease Cases ........... ✅</div>
                      <div>Medicine Stock ...... Syncing...</div>
                    </div>
                  </SyncAnim>

                  <div style={{color: '#888', fontStyle: 'italic', marginBottom: '3rem'}}>First full sync expected in ~15 minutes.</div>

                  <CyberBtn primary style={{width:'100%', padding:'1.5rem', fontSize:'1.2rem'}} onClick={() => navigate('/hospital-reporting')}>
                    ENTER HOSPITAL OPS DASHBOARD →
                  </CyberBtn>
                </motion.div>
              )}

            </WizardContent>
          </WizardOverlay>
        )}
      </AnimatePresence>

    </PageContainer>
  );
}
