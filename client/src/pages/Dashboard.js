import React, { useEffect, useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiChevronDown, FiChevronUp, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

/* --- THEME & ANIMATIONS --- */
const DARK_BG = '#0d0f14';
const LIGHT_BG = '#111318';
const TEAL = '#00d4aa';
const TECH_BG = '#1a1e28';

const flowAnimation = keyframes`
  from { stroke-dashoffset: 24; }
  to { stroke-dashoffset: 0; }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const pulseRing = keyframes`
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.3); opacity: 0; }
`;

/* --- STYLED COMPONENTS --- */
const PageContainer = styled.div`
  background: ${DARK_BG};
  color: white;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
  position: relative;
`;

const ProgressBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: ${TEAL};
  z-index: 1000;
  width: ${props => props.$progress}%;
`;

const ChapterNav = styled.div`
  position: fixed;
  right: 2vw;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 100;

  @media(max-width: 768px) {
    display: none;
  }
`;

const DotWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  cursor: pointer;

  &:hover .tooltip {
    opacity: 1;
    transform: translateX(0);
  }
`;

const Dot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$active ? TEAL : 'transparent'};
  border: 2px solid ${props => props.$active ? TEAL : 'rgba(255,255,255,0.3)'};
  transition: all 0.3s ease;
`;

const Tooltip = styled.div`
  position: absolute;
  right: 28px;
  background: ${TECH_BG};
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  white-space: nowrap;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;
  pointer-events: none;
  font-family: 'IBM Plex Mono', monospace;
  border: 1px solid rgba(0, 212, 170, 0.2);
`;

const Section = styled.section`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 100px 5%;
  background: ${props => props.$dark ? DARK_BG : LIGHT_BG};
  box-sizing: border-box;
  position: relative;
`;

const FadeUp = styled.div`
  opacity: ${props => props.$visible ? 1 : 0};
  transform: translateY(${props => props.$visible ? '0' : '30px'});
  transition: opacity 600ms ease, transform 600ms ease;
  transition-delay: ${props => props.$delay || '0ms'};
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(32px, 5vw, 56px);
  margin-bottom: 24px;
  color: white;
  line-height: 1.1;
`;

const Subtitle = styled.p`
  font-size: clamp(18px, 2vw, 24px);
  color: #94a3b8;
  max-width: 800px;
  margin-bottom: 40px;
  line-height: 1.5;
`;

const TechPanelContainer = styled.div`
  background: ${TECH_BG};
  border-radius: 8px;
  border: 1px solid rgba(0, 212, 170, 0.2);
  margin-top: 40px;
  overflow: hidden;
  max-width: 1200px;
`;

const TechPanelHeader = styled.div`
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.2);
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const TechTitle = styled.div`
  font-family: 'IBM Plex Mono', monospace;
  color: ${TEAL};
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const TechContent = styled.div`
  padding: ${props => props.$isOpen ? '24px' : '0 24px'};
  max-height: ${props => props.$isOpen ? '1000px' : '0'};
  opacity: ${props => props.$isOpen ? '1' : '0'};
  overflow: hidden;
  transition: all 0.4s ease-in-out;
  color: #a0aec0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  line-height: 1.6;

  pre {
    margin: 0;
    white-space: pre-wrap;
    color: #cbd5e1;
  }
  .highlight { color: ${TEAL}; }
`;

const ScrollPrompt = styled.div`
  margin-top: 80px;
  color: #64748b;
  text-align: center;
  font-size: 14px;
  animation: ${floatAnimation} 3s infinite;
`;

/* --- SPECIFIC SECTION VISUALS --- */

/* Hero */
const HeroPipeline = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 40px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  color: ${TEAL};

  @media(max-width: 768px) {
    flex-direction: column;
  }
`;
const PipelineNode = styled.div`
  padding: 12px 24px;
  border: 1px solid ${TEAL};
  border-radius: 30px;
  background: rgba(0,212,170,0.1);
  animation: ${floatAnimation} 4s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
`;
const PipelineArrow = styled.div`
  font-size: 24px;
  animation: ${floatAnimation} 4s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
  @media(max-width: 768px) {
    transform: rotate(90deg);
  }
`;

/* Section 1 - HRI */
const HRIGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
  @media(max-width: 900px) { grid-template-columns: 1fr; }
`;
const HRICircle = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 8px solid #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 72px;
  font-weight: 800;
  margin: 0 auto;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: -8px; left: -8px; right: -8px; bottom: -8px;
    border-radius: 50%;
    border: 2px solid #ef4444;
    animation: ${pulseRing} 2s infinite;
  }
`;
const WeightBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  cursor: pointer;
`;
const WeightLabel = styled.div`
  width: 180px;
  font-size: 14px;
  color: #cbd5e1;
`;
const WeightTrack = styled.div`
  flex: 1;
  height: 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  overflow: hidden;
  margin: 0 16px;
`;
const WeightFill = styled.div`
  height: 100%;
  width: ${props => props.$active ? props.$pct : (props.$visible ? props.$pct : '0')}%;
  background: ${props => props.$active ? TEAL : '#64748b'};
  transition: width 1s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s;
`;
const WeightValue = styled.div`
  width: 40px;
  font-family: 'IBM Plex Mono', monospace;
  color: ${TEAL};
`;

/* Section 2 - HMS */
const HMSGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 40px;
  text-align: center;
  @media(max-width: 768px) { grid-template-columns: 1fr; }
`;
const HMSBox = styled.div`
  padding: 30px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  position: relative;
`;
const ChecklistItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  color: #cbd5e1;
  font-size: 15px;
  opacity: ${props => props.$visible ? 1 : 0};
  transform: translateX(${props => props.$visible ? '0' : '-20px'});
  transition: all 0.5s ease;
  transition-delay: ${props => props.$delay}ms;
`;

/* Section 3 - Satellite */
const MapGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
  @media(max-width: 900px) { grid-template-columns: 1fr; }
`;
const MapMockup = styled.div`
  aspect-ratio: 16/9;
  background: #1a1e28;
  border-radius: 12px;
  border: 1px solid rgba(0, 212, 170, 0.3);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const HeatPolygon = styled.div`
  position: absolute;
  width: ${props => props.$size};
  height: ${props => props.$size};
  top: ${props => props.$top};
  left: ${props => props.$left};
  background: ${props => props.$color};
  border-radius: 40%;
  filter: blur(20px);
  opacity: ${props => props.$visible ? 0.6 : 0};
  transition: opacity 1.5s ease;
  transition-delay: ${props => props.$delay}ms;
`;
const SignalCard = styled.div`
  padding: 20px;
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
  margin-bottom: 16px;
  border-left: 4px solid ${props => props.$color};
`;

/* Section 4 - Citizen Reports */
const ChainReaction = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 40px;
`;
const ChainStep = styled.div`
  padding: 20px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
  opacity: ${props => props.$visible ? 1 : 0};
  transform: translateY(${props => props.$visible ? '0' : '20px'});
  transition: all 0.5s ease;
  transition-delay: ${props => props.$delay}ms;
  display: flex;
  align-items: center;
  gap: 16px;
`;

/* Section 5 - ASHA */
const MobileMockupContainer = styled.div`
  display: flex;
  gap: 40px;
  align-items: center;
  @media(max-width: 900px) { flex-direction: column; }
`;
const Phone = styled.div`
  width: 300px;
  height: 600px;
  border: 12px solid #222;
  border-radius: 36px;
  background: #111;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;
const PhoneHeader = styled.div`
  padding: 40px 20px 20px;
  background: #00d4aa;
  color: #000;
  font-weight: bold;
  font-size: 18px;
`;
const PhoneBody = styled.div`
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const FormField = styled.div`
  height: 40px;
  background: rgba(255,255,255,0.1);
  border-radius: 6px;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.5s;
  transition-delay: ${props => props.$delay}ms;
`;
const FlagCard = styled.div`
  margin-top: auto;
  padding: 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  color: #ef4444;
  border-radius: 8px;
  font-size: 14px;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.5s;
  transition-delay: 1500ms;
`;

/* Section 6 - Prediction */
const ChartContainer = styled.div`
  height: 300px;
  width: 100%;
  border-bottom: 2px solid rgba(255,255,255,0.1);
  border-left: 2px solid rgba(255,255,255,0.1);
  position: relative;
  margin-top: 40px;
  display: flex;
  align-items: flex-end;
  padding: 0 20px;
  gap: 10px;
`;
const ChartBar = styled.div`
  flex: 1;
  background: ${props => props.$predict ? 'rgba(0, 212, 170, 0.3)' : 'rgba(255,255,255,0.1)'};
  height: ${props => props.$visible ? props.$h : '0'}%;
  transition: height 1s ease;
  transition-delay: ${props => props.$delay}ms;
  border-top: 2px solid ${props => props.$predict ? TEAL : '#fff'};
`;
const PredictionBand = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 30%;
  background: linear-gradient(90deg, transparent, rgba(0,212,170,0.05));
  border-left: 2px dashed ${TEAL};
`;

/* Section 7 - Timeline */
const TimelineLine = styled.div`
  position: absolute;
  left: 40px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(0, 212, 170, 0.2);
`;
const TimelineProgress = styled.div`
  position: absolute;
  left: -1px;
  top: 0;
  width: 4px;
  background: ${TEAL};
  height: ${props => props.$height}%;
  transition: height 0.5s ease-out;
`;
const TimelineItem = styled.div`
  position: relative;
  padding-left: 80px;
  margin-bottom: 40px;
  opacity: ${props => props.$visible ? 1 : 0};
  transform: translateX(${props => props.$visible ? '0' : '-20px'});
  transition: all 0.5s ease;
  
  &::before {
    content: '';
    position: absolute;
    left: 36px;
    top: 5px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${TEAL};
    box-shadow: 0 0 10px ${TEAL};
  }
`;

const CTAContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 60px;
  @media(max-width: 600px){ flex-direction: column; }
`;
const CTAButton = styled(Link)`
  padding: 16px 32px;
  border: 1px solid ${TEAL};
  background: ${props => props.$primary ? TEAL : 'transparent'};
  color: ${props => props.$primary ? '#000' : TEAL};
  text-decoration: none;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s;
  text-align: center;
  
  &:hover {
    background: ${props => props.$primary ? '#00e6b8' : 'rgba(0, 212, 170, 0.1)'};
    color: ${props => props.$primary ? '#000' : TEAL};
  }
`;

/* --- COMPONENT HELPERS --- */
const TechPanel = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <TechPanelContainer>
      <TechPanelHeader onClick={() => setIsOpen(!isOpen)}>
        <TechTitle>{title}</TechTitle>
        {isOpen ? <FiChevronUp color={TEAL} /> : <FiChevronDown color={TEAL} />}
      </TechPanelHeader>
      <TechContent $isOpen={isOpen}>
        {content}
      </TechContent>
    </TechPanelContainer>
  );
};

/* --- MAIN COMPONENT --- */
const HowItWorks = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  
  const sectionsRef = useRef([]);
  // Observe sections
  const [visibilities, setVisibilities] = useState({});

  useEffect(() => {
    // Scroll progress handler
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setScrollProgress(scroll * 100);
    };
    window.addEventListener('scroll', handleScroll);

    // Intersection Observer for sections
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = entry.target.dataset.index;
          setActiveSection(parseInt(index));
          setVisibilities(prev => ({ ...prev, [index]: true }));
        }
      });
    }, { threshold: 0.2 });

    sectionsRef.current.forEach(section => {
      if (section) observer.observe(section);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const chapters = [
    { title: "Hero" },
    { title: "The HRI Score" },
    { title: "HMS Integration" },
    { title: "Satellite Data" },
    { title: "Community Reports" },
    { title: "ASHA Engine" },
    { title: "Outbreak Prediction" },
    { title: "End-to-End Action" }
  ];

  const scrollToSection = (index) => {
    sectionsRef.current[index]?.scrollIntoView({ behavior: 'smooth' });
  };

  const [activeWeight, setActiveWeight] = useState(null);

  const weightages = [
    { label: "Hospital HMS Data", pct: 35, tip: "Clinical case velocity — the most direct signal of active disease burden." },
    { label: "NASA Satellite Signals", pct: 27, subtitle: "We measure environmental stress over a ward — environmental stress precedes disease outbreak.", tip: "Identify disease-breeding environmental conditions before they turn into cases." },
    { label: "ASHA Field Surveys", pct: 25, tip: "Real-time ground-truth signal from field workers." },
    { label: "Community Reports", pct: 13, tip: "Citizen-driven problem spotting." },
  ];

  const checks = [
    "Bed occupancy by department — every 15 minutes",
    "New admissions by ICD-10 code — per admission",
    "Discharge summaries — per discharge",
    "Medicine stock levels — daily",
    "Blood bank units — daily",
    "Lab results (aggregate) — daily"
  ];

  return (
    <PageContainer>
      <ProgressBar $progress={scrollProgress} />
      
      <ChapterNav>
        {chapters.map((ch, i) => (
          <DotWrapper key={i} onClick={() => scrollToSection(i)}>
            <Dot $active={activeSection === i} />
            <Tooltip className="tooltip">{ch.title}</Tooltip>
          </DotWrapper>
        ))}
      </ChapterNav>

      {/* SECTION 0 - HERO */}
      <Section $dark data-index="0" ref={el => sectionsRef.current[0] = el}>
        <FadeUp $visible={visibilities[0]}>
          <Title>How Aheadly Works</Title>
          <Subtitle>Solapur's public health intelligence engine — from raw signal to city-level action in under 15 minutes.</Subtitle>
          
          <HeroPipeline>
            <PipelineNode $delay={0}>Raw Signals</PipelineNode>
            <PipelineArrow $delay={0.5}><FiArrowRight /></PipelineArrow>
            <PipelineNode $delay={1}>Fusion Engine</PipelineNode>
            <PipelineArrow $delay={1.5}><FiArrowRight /></PipelineArrow>
            <PipelineNode $delay={2}>HRI Score</PipelineNode>
            <PipelineArrow $delay={2.5}><FiArrowRight /></PipelineArrow>
            <PipelineNode $delay={3}>Alerts</PipelineNode>
            <PipelineArrow $delay={3.5}><FiArrowRight /></PipelineArrow>
            <PipelineNode $delay={4}>Action</PipelineNode>
          </HeroPipeline>

          <ScrollPrompt>
            Scroll to explore the full system ↓
          </ScrollPrompt>
        </FadeUp>
      </Section>

      {/* SECTION 1 - HRI */}
      <Section data-index="1" ref={el => sectionsRef.current[1] = el}>
        <FadeUp $visible={visibilities[1]}>
          <Title>One number — the <span style={{ color: '#00d4aa', fontStyle: 'italic' }}>HRI (Health Risk Index)</span> — tells you everything about a ward's health risk</Title>
          <Subtitle>Every ward in Solapur gets an HRI score from 0–100. Higher means higher risk. It's calculated every 15 minutes by fusing 4 data streams. When a ward crosses 70, SMC gets an automatic alert.</Subtitle>
          
          <HRIGrid>
            <HRICircle>73</HRICircle>
            <div>
              {weightages.map((w, i) => (
                <div key={i}>
                  <WeightBar onMouseEnter={() => setActiveWeight(i)} onMouseLeave={() => setActiveWeight(null)}>
                    <WeightLabel>{w.label}</WeightLabel>
                    <WeightTrack>
                      <WeightFill $visible={visibilities[1]} $pct={w.pct} $active={activeWeight === i || activeWeight === null} />
                    </WeightTrack>
                    <WeightValue>{w.pct}%</WeightValue>
                  </WeightBar>
                  {w.subtitle && (
                    <div style={{ fontSize: '12px', color: 'rgba(0,212,170,0.6)', marginBottom: '10px', marginTop: '-8px', paddingLeft: '180px', fontStyle: 'italic' }}>
                      {w.subtitle}
                    </div>
                  )}
                </div>
              ))}
              {activeWeight !== null && (
                <div style={{ fontSize: '13px', color: TEAL, marginTop: '16px', fontStyle: 'italic' }}>
                  Why this weight? {weightages[activeWeight].tip}
                </div>
              )}
            </div>
          </HRIGrid>

          <TechPanel 
            title="Technical Deep Dive: HRI Formula" 
            content={
              <pre>
                HRI(w) = Σ(wᵢ × Sᵢ(w)) × seasonalMultiplier(w)<br/><br/>
                Where:<br/>
                - w = ward identifier<br/>
                - wᵢ = <span className="highlight">weight of signal i</span> (HMS=0.35, NASA=0.27, ASHA=0.25, Community=0.13)<br/>
                - Sᵢ(w) = normalized score [0-100] for signal i in ward w<br/>
                - seasonalMultiplier = 1.0–1.4 (elevated during monsoon/summer)<br/><br/>
                Normalization: Min-max scaling per signal type<br/>
                Update frequency: Every 15 minutes<br/>
                Threshold triggers: HRI &gt;50 = MODERATE, &gt;70 = HIGH, &gt;85 = CRITICAL
              </pre>
            } 
          />
        </FadeUp>
      </Section>

      {/* SECTION 2 - HMS */}
      <Section $dark data-index="2" ref={el => sectionsRef.current[2] = el}>
        <FadeUp $visible={visibilities[2]}>
          <Title>How hospital data flows into Aheadly without any manual work</Title>
          <Subtitle>Every hospital in Solapur runs its own Hospital Management System (HMS). Aheadly installs a lightweight software adapter — called the Aheadly FHIR Patch — that reads data from the HMS automatically. No manual entry. No disruption to hospital workflows.</Subtitle>
          
          <HMSGrid>
            <HMSBox>
              <div style={{ fontSize: '24px', marginBottom: '16px' }}>🏥</div>
              <h3>Hospital HMS</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8' }}>(Bahmni / OpenMRS / eHospital)</p>
            </HMSBox>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
               <span style={{ fontSize: '12px', color: TEAL }}>Read-only · Anonymized · Encrypted</span>
               <div style={{ padding: '10px 20px', background: 'rgba(0,212,170,0.1)', border: `1px solid ${TEAL}`, borderRadius: '20px', margin: '16px 0' }}>
                 Aheadly FHIR R4 Adapter
               </div>
               <span style={{ fontSize: '12px', color: TEAL }}>Every 15 min</span>
            </div>
            <HMSBox>
              <div style={{ fontSize: '24px', marginBottom: '16px' }}>⚙️</div>
              <h3>Aheadly HRI Engine</h3>
            </HMSBox>
          </HMSGrid>

          <div style={{ marginTop: '40px' }}>
            {checks.map((c, i) => (
              <ChecklistItem key={i} $visible={visibilities[2]} $delay={i * 200}>
                <span style={{ color: TEAL }}>✅</span> {c}
              </ChecklistItem>
            ))}
          </div>

          <TechPanel 
            title="Technical Deep Dive: FHIR Integration" 
            content={
              <pre>
                Standards: FHIR R4, ABDM HIE-CM aligned, DPDPA 2023 compliant<br/>
                Adapter type: npm package or Docker container (30-minute setup)<br/>
                Access level: Read-only database views — zero write permissions ever granted<br/>
                Anonymization: Patient identifiers stripped at adapter level — only age group + ward + ICD code transmitted<br/>
                Transport: TLS 1.3 encrypted, facility_id authenticated<br/><br/>
                <span className="highlight">
{`{
  "resourceType": "Condition",
  "code": { "coding": [{ "system": "http://hl7.org/fhir/sid/icd-10", "code": "A90", "display": "Dengue fever" }] },
  "subject": { "reference": "AnonPatient/123", "extension": [{ "url": "ward", "valueString": "Sector-08" }] }
}`}             </span>
              </pre>
            } 
          />
        </FadeUp>
      </Section>

      {/* SECTION 3 - Satellite */}
      <Section data-index="3" ref={el => sectionsRef.current[3] = el}>
        <FadeUp $visible={visibilities[3]}>
          <Title>Eyes in the sky watching for conditions that breed disease</Title>
          <Subtitle>NASA and ESA satellites pass over Solapur every few days. Aheadly reads three signals from these passes: surface temperature (hot spots breed mosquitoes), vegetation index (low greenery = urban heat stress), and stagnation risk (waterlogged areas = dengue, cholera).</Subtitle>
          
          <MapGrid>
            <MapMockup>
              <HeatPolygon $visible={visibilities[3]} $delay={500} $size="150px" $top="20%" $left="30%" $color="rgba(239, 68, 68, 0.4)" />
              <HeatPolygon $visible={visibilities[3]} $delay={800} $size="200px" $top="50%" $left="60%" $color="rgba(245, 158, 11, 0.4)" />
              <HeatPolygon $visible={visibilities[3]} $delay={1100} $size="100px" $top="70%" $left="20%" $color="rgba(16, 185, 129, 0.4)" />
              <div style={{ position: 'absolute', color: 'rgba(255,255,255,0.2)', fontSize: '24px', letterSpacing: '10px' }}>SOLAPUR SECTORS</div>
            </MapMockup>
            <div>
              <SignalCard $color="#ef4444">
                <strong>🌡 Land Surface Temperature</strong><br/>
                <span style={{ fontSize: '14px', color: '#94a3b8' }}>Sector-08 currently 43.1°C — CRITICAL heat stress</span>
              </SignalCard>
              <SignalCard $color="#f59e0b">
                <strong>🌿 NDVI Vegetation Index</strong><br/>
                <span style={{ fontSize: '14px', color: '#94a3b8' }}>Sector-03 NDVI: 0.18 — Very low. Urban heat island confirmed.</span>
              </SignalCard>
              <SignalCard $color="#3b82f6">
                <strong>💧 Stagnation Risk Index</strong><br/>
                <span style={{ fontSize: '14px', color: '#94a3b8' }}>Sector-12: HIGH. Cross-referenced with 28 citizen stagnant water reports.</span>
              </SignalCard>
            </div>
          </MapGrid>

          <TechPanel 
            title="Technical Deep Dive: Geospatial Pipeline" 
            content={
              <pre>
                Sources: NASA ECOSTRESS (70m resolution, 3-day revisit), ESA Sentinel-2 (30m, 16-day), SRTM elevation for flood modeling<br/>
                Processing pipeline: Raw GeoTIFF → GDAL clipping to ward boundaries → Band math for indices → Min-max normalization → Ward-level aggregate → HRI fusion<br/>
                Stagnation index formula: SI = f(LST, NDVI, elevation, rainfall_cumulative_7d)<br/>
                Latency: ~2 hours from satellite pass to HRI update
              </pre>
            } 
          />
        </FadeUp>
      </Section>

      {/* SECTION 4 - Community */}
      <Section $dark data-index="4" ref={el => sectionsRef.current[4] = el}>
        <FadeUp $visible={visibilities[4]}>
          <Title>Every citizen report is a data point that sharpens our predictions</Title>
          <Subtitle>When a citizen reports stagnant water in their ward, it's not just a complaint — it's a disease risk signal. When another citizen runs the symptom checker and reports fever + joint pain, that's a potential dengue flag. Aheadly aggregates these into ward-level signal clusters.</Subtitle>

          <ChainReaction>
            <ChainStep $visible={visibilities[4]} $delay={200}>
              <div style={{ fontSize: '24px' }}>📱</div> Citizen reports stagnant water in Sector-12
            </ChainStep>
            <ChainStep $visible={visibilities[4]} $delay={600}>
              <div style={{ fontSize: '24px' }}>📍</div> 14 similar reports in Sector-12 this week → <span style={{ color: '#f59e0b' }}>cluster forms</span>
            </ChainStep>
            <ChainStep $visible={visibilities[4]} $delay={1000}>
              <div style={{ fontSize: '24px' }}>🛰️</div> Satellite confirms stagnation in same area → <span style={{ color: TEAL }}>signal strengthens</span>
            </ChainStep>
            <ChainStep $visible={visibilities[4]} $delay={1400}>
              <div style={{ fontSize: '24px' }}>🏥</div> 3 hospital dengue cases from Sector-12 this week → <span style={{ color: '#ef4444' }}>HRI jumps</span>
            </ChainStep>
            <ChainStep $visible={visibilities[4]} $delay={1800} style={{ borderLeft: `4px solid #ef4444` }}>
              <div style={{ fontSize: '24px' }}>🚨</div> HRI crosses 70 → SMC Alert triggered
            </ChainStep>
            <ChainStep $visible={visibilities[4]} $delay={2200} style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: '#10b981' }}>
              <div style={{ fontSize: '24px' }}>✅</div> Municipal team dispatched 5 days before outbreak confirmed
            </ChainStep>
          </ChainReaction>

          <TechPanel 
            title="Technical Deep Dive: Signal Clustering Engine" 
            content={
              <pre>
                Signal clustering: DBSCAN spatial clustering on report coordinates (ε=500m, minPts=3)<br/>
                Symptom triage: NLP classification of free-text symptoms → ICD-10 probability mapping<br/>
                Syndromic surveillance: Ward-level symptom frequency compared against 52-week baseline — <span className="highlight">z-score &gt;2 triggers alert</span><br/>
                Community signal weight in HRI: 14% baseline, elevated to 22% during active cluster detection
              </pre>
            } 
          />
        </FadeUp>
      </Section>

      {/* SECTION 5 - ASHA */}
      <Section data-index="5" ref={el => sectionsRef.current[5] = el}>
        <FadeUp $visible={visibilities[5]}>
          <Title>The most powerful signal comes from a health worker knocking on your door</Title>
          <Subtitle>Aheadly's 200+ ASHA field workers conduct daily household surveys using the Aheadly Field App. Each survey asks about symptoms, sanitation, and living conditions. The AI Risk Flag Engine processes each submission in real time and assigns a risk level to every household.</Subtitle>

          <MobileMockupContainer>
            <Phone>
              <PhoneHeader>Aheadly Field Check</PhoneHeader>
              <PhoneBody>
                <FormField $visible={visibilities[5]} $delay={300} />
                <FormField $visible={visibilities[5]} $delay={600} style={{ height: '80px' }} />
                <FormField $visible={visibilities[5]} $delay={900} />
                <FlagCard $visible={visibilities[5]}>
                  <strong>HIGH RISK</strong><br/>
                  Fever + joint pain + stagnant water nearby + unvaccinated child. Recommended: Escalate to SMC.
                </FlagCard>
              </PhoneBody>
            </Phone>
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: '16px', color: TEAL }}>How a cluster triggers an alert</h3>
              <div style={{ paddingLeft: '16px', borderLeft: `2px solid rgba(255,255,255,0.1)` }}>
                <p style={{ margin: '12px 0' }}><strong>Day 1:</strong> 2 HIGH risk households in Sector-08</p>
                <p style={{ margin: '12px 0', color: '#f59e0b' }}><strong>Day 2:</strong> 5 HIGH risk households in Sector-08 — AI flags cluster</p>
                <p style={{ margin: '12px 0', color: '#ef4444' }}><strong>Day 3:</strong> SMC alert sent — "Potential dengue cluster forming in Sector-08"</p>
                <p style={{ margin: '12px 0', opacity: 0.5 }}><strong>Day 5 (without Aheadly):</strong> First hospital cases confirmed</p>
                <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(0,212,170,0.1)', border: `1px solid ${TEAL}`, borderRadius: '6px', display: 'inline-block' }}>
                  Aheadly gave SMC a 5-day head start
                </div>
              </div>
            </div>
          </MobileMockupContainer>

          <TechPanel 
            title="Technical Deep Dive: AI Risk Flag Engine" 
            content={
              <pre>
                Survey model: 47-field household assessment — demographics, 12-symptom checklist, 8-point sanitation score, vaccination status<br/>
                Risk scoring: Gradient boosted decision tree trained on 3 years of Solapur health data<br/>
                Features: symptom combination score, sanitation index, proximity to known hotspots, seasonal risk multiplier, household vaccination coverage<br/>
                Cluster detection: Temporal-spatial clustering — <span className="highlight">3+ HIGH risk households within 500m within 72 hours = automatic SMC alert</span><br/>
                Model accuracy: 84% sensitivity for outbreak prediction 5+ days in advance
              </pre>
            } 
          />
        </FadeUp>
      </Section>

      {/* SECTION 6 - Prediction */}
      <Section $dark data-index="6" ref={el => sectionsRef.current[6] = el}>
        <FadeUp $visible={visibilities[6]}>
          <Title>Predicting outbreaks before they happen</Title>
          <Subtitle>Aheadly's outbreak prediction model combines all 4 data streams to forecast disease surges 7–30 days in advance. It doesn't just react — it predicts.</Subtitle>

          <ChartContainer>
            <PredictionBand />
            {[40, 30, 45, 25, 60, 50, 80, 70, 90, 100].map((h, i) => (
              <ChartBar 
                key={i} 
                $h={h} 
                $visible={visibilities[6]} 
                $delay={i * 100} 
                $predict={i > 6} 
              />
            ))}
            <div style={{ position: 'absolute', right: '15%', top: '-20px', background: TEAL, color: '#000', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
              Predicted 8 days early 📍
            </div>
          </ChartContainer>

          <div style={{ display: 'flex', gap: '20px', marginTop: '40px', flexWrap: 'wrap' }}>
            <SignalCard $color="#ef4444" style={{ flex: 1, minWidth: '250px' }}>
              <strong>🔴 7-day forecast</strong><br/>
              Dengue HIGH risk — Sector-08, Sector-12
            </SignalCard>
            <SignalCard $color="#f59e0b" style={{ flex: 1, minWidth: '250px' }}>
              <strong>🟠 14-day forecast</strong><br/>
              Typhoid MODERATE risk — Sector-03
            </SignalCard>
            <SignalCard $color="#eab308" style={{ flex: 1, minWidth: '250px' }}>
              <strong>🟡 30-day forecast</strong><br/>
              Respiratory surge expected — city-wide (monsoon pattern)
            </SignalCard>
          </div>

          <TechPanel 
            title="Technical Deep Dive: Predictive Modeling" 
            content={
              <pre>
                Model type: Ensemble — LSTM (temporal patterns) + XGBoost (feature importance) + SARIMA (seasonal baseline)<br/>
                Training data: 5 years of Solapur disease surveillance data + satellite + weather<br/>
                Input features: 23 features including HRI trajectory, satellite stagnation trend, ASHA cluster velocity, hospital admission rate change, humidity/rainfall forecast<br/>
                Output: Disease-specific risk probability per ward per week<br/>
                Validation: Leave-one-season-out cross-validation, AUC-ROC: <span className="highlight">0.87</span>
              </pre>
            } 
          />
        </FadeUp>
      </Section>

      {/* SECTION 7 - Timeline */}
      <Section data-index="7" ref={el => sectionsRef.current[7] = el}>
        <FadeUp $visible={visibilities[7]}>
          <Title>From a mosquito breeding in a drain to a municipal intervention — in under 15 minutes</Title>
          
          <div style={{ position: 'relative', marginTop: '60px', paddingBottom: '40px' }}>
            <TimelineLine />
            <TimelineProgress $height={visibilities[7] ? 100 : 0} />
            
            <TimelineItem $visible={visibilities[7]}>
              <strong style={{ color: '#94a3b8' }}>T+0:00</strong> — Citizen reports stagnant water in Sector-12 via Community Portal
            </TimelineItem>
            <TimelineItem $visible={visibilities[7]}>
              <strong style={{ color: '#94a3b8' }}>T+0:02</strong> — Satellite stagnation index for Sector-12 cross-referenced: HIGH
            </TimelineItem>
             <TimelineItem $visible={visibilities[7]}>
              <strong style={{ color: '#94a3b8' }}>T+0:15</strong> — Hospital HMS syncs: 2 new dengue admissions from Sector-12
            </TimelineItem>
            <TimelineItem $visible={visibilities[7]}>
              <strong style={{ color: '#94a3b8' }}>T+0:18</strong> — ASHA survey flagged: 4 HIGH risk households in Sector-12 this week
            </TimelineItem>
            <TimelineItem $visible={visibilities[7]}>
              <strong style={{ color: '#ef4444' }}>T+0:19</strong> — HRI Engine recalculates: Sector-12 HRI jumps from 54 → 79 (HIGH)
            </TimelineItem>
            <TimelineItem $visible={visibilities[7]}>
              <strong style={{ color: TEAL }}>T+0:19</strong> — Outbreak alert generated: "Dengue cluster forming — Sector-12"
            </TimelineItem>
            <TimelineItem $visible={visibilities[7]}>
              <strong style={{ color: '#94a3b8' }}>T+0:20</strong> — SMC Command receives alert + AI-generated intervention recommendation
            </TimelineItem>
            <TimelineItem $visible={visibilities[7]}>
              <strong style={{ color: '#94a3b8' }}>T+0:35</strong> — Hospital Connect notified: "Expect dengue surge — pre-stock NS1 kits"
            </TimelineItem>
            <TimelineItem $visible={visibilities[7]}>
              <strong style={{ color: '#10b981' }}>T+4:00</strong> — Municipal fogging team dispatched to Sector-12
            </TimelineItem>
            <TimelineItem $visible={visibilities[7]} style={{ opacity: 0.5 }}>
              <strong style={{ color: '#94a3b8' }}>T+5 days</strong> — First confirmed outbreak cases appear in hospital data
            </TimelineItem>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '60px', padding: '30px', background: 'rgba(0,212,170,0.1)', borderRadius: '12px' }}>
            <h3 style={{ margin: 0, color: TEAL, fontSize: '24px' }}>Aheadly gave Solapur a 5-day head start on this outbreak.</h3>
          </div>

          <div style={{ textAlign: 'center', marginTop: '80px' }}>
            <h2 style={{ fontFamily: 'DM Serif Display', fontSize: '48px' }}>This is not a dashboard. It is Solapur's immune system.</h2>
            <CTAContainer>
              <CTAButton to="/data-sources">Explore the Data Sources →</CTAButton>
              <CTAButton to="/digital-twin" $primary>View Live HRI Map →</CTAButton>
            </CTAContainer>
          </div>
        </FadeUp>
      </Section>

    </PageContainer>
  );
};

export default HowItWorks;