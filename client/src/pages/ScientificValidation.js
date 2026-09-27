import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FiExternalLink } from 'react-icons/fi';

// ─────────────────────────────────────────────
// DESIGN TOKENS — matches SMC dark dashboard
// ─────────────────────────────────────────────
const BG      = '#0d0f14';
const CARD    = 'rgba(17, 22, 32, 0.85)';
const BORDER  = 'rgba(255, 255, 255, 0.08)';
const TEAL    = '#14b8a6';
const AMBER   = '#f59e0b';
const MUTED   = '#94a3b8';
const TEXT    = '#cbd5e1';
const HEAD    = '#f8fafc';
const RED     = '#ef4444';
const BLUE    = '#3b82f6';
const PURPLE  = '#a78bfa';

// ─────────────────────────────────────────────
// EVIDENCE CARDS DATA
// ─────────────────────────────────────────────
const EVIDENCE = [
  {
    id: 'E1',
    color: TEAL,
    title: 'Lagged Climate–Dengue Correlation (1–16 Weeks)',
    finding: 'Temperature and rainfall precede dengue incidence by 1–16 weeks with statistically significant lagged effects.',
    mechanism: 'Warm, wet conditions accelerate Aedes larval development and extend adult lifespan before clinical cases appear.',
    source: 'https://www.diva-portal.org/smash/get/diva2:615782/FULLTEXT02.pdf',
    label: 'DIVA Portal — Climate and Dengue Fever',
  },
  {
    id: 'E2',
    color: '#60a5fa',
    title: 'Environmental Drivers of Vector Establishment',
    finding: 'Urban environmental factors — stagnant water, vegetation, heat — directly determine where Aedes mosquitoes establish populations.',
    mechanism: 'Microhabitat suitability precedes vector presence, which in turn precedes disease transmission.',
    source: 'https://www.emro.who.int/emhj-volume-31-2025/volume-31-issue-3/factors-influencing-establishment-of-dengue-fever-vectors-in-urban-areas.html',
    label: 'WHO EMRO — Dengue Vector Establishment',
  },
  {
    id: 'E3',
    color: '#a78bfa',
    title: 'Climate Variability Amplifies Epidemic Potential',
    finding: 'Spatiotemporal climate variability significantly increases dengue epidemic potential beyond baseline transmission models.',
    mechanism: 'Temperature anomalies shift vector competence thresholds, expanding outbreak windows non-linearly.',
    source: 'https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2019GH000186',
    label: 'AGU Publications — Spatial-Temporal Environmental Factors',
  },
  {
    id: 'E4',
    color: '#34d399',
    title: 'Satellite Indices (NDVI, Water) Predict Vector Abundance',
    finding: 'Remotely sensed NDVI and water indices estimate Aedes abundance before ground-level trap data is available.',
    mechanism: 'Vegetation density and surface water retention proxy larval habitat quality weeks ahead of adult emergence.',
    source: 'https://elischolar.library.yale.edu/cgi/viewcontent.cgi?article=2564&context=ysphtdl',
    label: 'Yale EliScholar — Dengue Forecasting via Remote Sensing',
  },
  {
    id: 'E5',
    color: AMBER,
    title: 'Months-Ahead Outbreak Prediction from Climate Signals',
    finding: 'Temperature and precipitation patterns can forecast dengue outbreaks months before clinical surveillance detects them.',
    mechanism: 'Seasonal climate signals provide a predictive horizon unavailable to real-time hospital reporting systems.',
    source: 'https://www.diva-portal.org/smash/get/diva2:615782/FULLTEXT02.pdf',
    label: 'DIVA Portal — Climate-Based Dengue Prediction',
  },
];

const CAUSAL_STEPS = [
  { label: 'ENVIRONMENTAL CHANGE', sub: 'Heat · Rain · Water · Vegetation', color: '#ef4444' },
  { label: 'MOSQUITO BREEDING CONDITIONS ↑', sub: 'Larval habitat expansion', color: '#f97316' },
  { label: 'VECTOR POPULATION ↑', sub: 'Adult Aedes abundance rises', color: AMBER },
  { label: 'DISEASE TRANSMISSION ↑', sub: 'Human-vector contact increases', color: '#a78bfa' },
  { label: 'CLINICAL CASES (DELAYED)', sub: 'Weeks–months after signal onset', color: TEAL },
];

// ─────────────────────────────────────────────
// ANIMATIONS
// ─────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─────────────────────────────────────────────
// STYLED COMPONENTS
// ─────────────────────────────────────────────
const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${BG};
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(20, 184, 166, 0.05) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(245, 158, 11, 0.05) 0%, transparent 40%),
    radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 30px 30px;
  color: ${TEXT};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const Page = styled.div`
  padding: 4rem 2rem 8rem;
  max-width: 1400px;
  margin: 0 auto;
  @media (max-width: 768px) { padding: 2rem 1rem 4rem; }
`;

const Hero = styled.div`
  text-align: center;
  margin-bottom: 6rem;
  animation: ${fadeUp} 0.6s ease-out;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 6vw, 4.2rem);
  font-weight: 900;
  color: ${HEAD};
  text-transform: uppercase;
  letter-spacing: -0.04em;
  line-height: 0.95;
  margin-bottom: 1.5rem;
  
  span {
    display: block;
    background: linear-gradient(135deg, ${HEAD} 0%, ${MUTED} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const ProofSubtitle = styled.div`
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: ${TEAL};
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;

  &::before, &::after {
    content: '';
    height: 2px;
    width: 60px;
    background: linear-gradient(to var(--dir, right), ${TEAL}, transparent);
  }
  &::before { --dir: left; }
`;

const IntroStatement = styled.p`
  font-size: 1.25rem;
  color: ${TEXT};
  line-height: 1.6;
  max-width: 850px;
  margin: 2.5rem auto 0;
  opacity: 0.8;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  border-bottom: 1px solid ${BORDER};
  padding-bottom: 1rem;
`;

const SectionLabel = styled.div`
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${MUTED};
`;

const EvidenceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 6rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const EvidenceCard = styled.div`
  background: ${CARD};
  border: 1px solid ${BORDER};
  border-radius: 20px;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);

  &::after {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 100px; height: 100px;
    background: radial-gradient(circle at top right, ${p => p.$accent}15, transparent 70%);
  }

  &:hover {
    transform: translateY(-8px);
    border-color: ${p => p.$accent}40;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  }
`;

const CardId = styled.div`
  font-size: 3rem;
  font-weight: 900;
  color: ${p => p.$color}15;
  position: absolute;
  top: 1rem;
  left: 2rem;
  line-height: 1;
`;

const CardTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 800;
  color: ${HEAD};
  line-height: 1.2;
  margin-top: 1rem;
  z-index: 1;
`;

const DataPoint = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const DataLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${p => p.$color || MUTED};
`;

const DataValue = styled.div`
  font-size: 1.05rem;
  color: ${TEXT};
  line-height: 1.6;
`;

const ExternalLink = styled.a`
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  color: ${p => p.$color};
  text-decoration: none;
  padding: 0.75rem 1.25rem;
  background: ${p => p.$color}10;
  border-radius: 12px;
  width: fit-content;
  transition: all 0.2s;

  &:hover {
    background: ${p => p.$color}20;
    transform: scale(1.02);
  }
`;

const CausalFlow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto 6rem;
`;

const FlowStep = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 2rem;
  align-items: center;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    text-align: center;
  }
`;

const FlowIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${p => p.$color}15;
  border: 4px solid ${p => p.$color}40;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: ${p => p.$color};
  font-weight: 900;
  box-shadow: 0 0 30px ${p => p.$color}20;
`;

const FlowContent = styled.div`
  background: ${CARD};
  padding: 2rem 2.5rem;
  border-radius: 24px;
  border: 1px solid ${BORDER};
  border-left: 6px solid ${p => p.$color};
  
  h4 {
    font-size: 1.3rem;
    font-weight: 800;
    color: ${HEAD};
    margin: 0 0 0.5rem 0;
    letter-spacing: -0.01em;
  }
  
  p {
    font-size: 1.1rem;
    color: ${MUTED};
    margin: 0;
  }
`;

const VisualConnector = styled.div`
  height: 60px;
  width: 4px;
  background: linear-gradient(to bottom, ${p => p.$start}, ${p => p.$end});
  margin: -1rem 0 -1rem 38px;
  opacity: 0.4;

  @media (max-width: 600px) {
    margin: -1rem auto;
  }
`;

const ConnectionCard = styled.div`
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
  border: 1px solid ${TEAL}40;
  border-radius: 32px;
  padding: 4rem;
  text-align: center;
  margin-top: 4rem;
  box-shadow: 0 40px 100px -20px rgba(0,0,0,0.6);

  h2 {
    font-size: 2.2rem;
    font-weight: 900;
    color: ${HEAD};
    margin-bottom: 2rem;
    letter-spacing: -0.02em;
  }

  p {
    font-size: 1.4rem;
    color: ${TEXT};
    line-height: 1.6;
    max-width: 900px;
    margin: 0 auto 3rem;
    opacity: 0.9;
  }
`;

const ChipContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const TechnicalChip = styled.span`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0.75rem 1.5rem;
  border-radius: 100px;
  font-size: 1rem;
  font-weight: 700;
  color: ${TEAL};
  letter-spacing: 0.05em;
  font-family: 'IBM Plex Mono', monospace;
`;

const ScientificValidation = () => (
  <PageWrapper>
    <Page>
      <Hero>
        <HeroTitle>
          <span>Environmental Stress</span>
          <span>Always Precedes</span>
          <span style={{ color: RED }}>Disease Outbreak</span>
        </HeroTitle>
        <ProofSubtitle>PROOF</ProofSubtitle>
        <IntroStatement>
          Multi-decadal epidemiological research confirms that climatic disruptions are the primary 
          lead indicators for infectious disease surges, providing a critical window for intervention.
        </IntroStatement>
      </Hero>

      <SectionHeader>
        <SectionLabel>Evidence Base — Peer-Reviewed Foundations</SectionLabel>
      </SectionHeader>

      <EvidenceGrid>
        {EVIDENCE.map((e, i) => (
          <EvidenceCard key={e.id} $accent={e.color} $i={i}>
            <CardId $color={e.color}>{e.id}</CardId>
            <CardTitle>{e.title}</CardTitle>
            
            <DataPoint>
              <DataLabel $color={e.color}>Finding</DataLabel>
              <DataValue>{e.finding}</DataValue>
            </DataPoint>

            <DataPoint>
              <DataLabel $color={e.color}>Biological Mechanism</DataLabel>
              <DataValue>{e.mechanism}</DataValue>
            </DataPoint>
            
            <ExternalLink 
              href={e.source} 
              target="_blank" 
              rel="noopener noreferrer"
              $color={e.color}
            >
              <FiExternalLink /> {e.label}
            </ExternalLink>
          </EvidenceCard>
        ))}
      </EvidenceGrid>

      <SectionHeader>
        <SectionLabel>The Causal Anatomy of an Outbreak</SectionLabel>
      </SectionHeader>

      <CausalFlow>
        {CAUSAL_STEPS.map((step, i) => (
          <React.Fragment key={step.label}>
            <FlowStep>
              <FlowIcon $color={step.color}>0{i + 1}</FlowIcon>
              <FlowContent $color={step.color}>
                <h4>{step.label}</h4>
                <p>{step.sub}</p>
              </FlowContent>
            </FlowStep>
            {i < CAUSAL_STEPS.length - 1 && (
              <VisualConnector 
                $start={step.color} 
                $end={CAUSAL_STEPS[i + 1].color} 
              />
            )}
          </React.Fragment>
        ))}
      </CausalFlow>

      <ConnectionCard>
        <h2>The Aheadly Intelligence Loop</h2>
        <p>
          By capturing these precursor signals through high-resolution satellite arrays, Aheadly 
          bypasses the lag of clinical reporting, granting municipal leaders <strong>2 to 6 weeks 
          of tactical lead time</strong>.
        </p>
        <ChipContainer>
          <TechnicalChip>NASA ECOSTRESS LST</TechnicalChip>
          <TechnicalChip>SENTINEL-2 NDVI</TechnicalChip>
          <TechnicalChip>MNDWI WATER DYNAMICS</TechnicalChip>
          <TechnicalChip>AI LEAD-TIME ENGINE</TechnicalChip>
        </ChipContainer>
      </ConnectionCard>
    </Page>
  </PageWrapper>
);

export default ScientificValidation;
