import React, { useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, useInView } from 'framer-motion';

const FontImport = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');
`;

// --- STYLED COMPONENTS ---

const PageWrap = styled.div`
  min-height: 100vh;
  background: #0d0f14;
  background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 20px 20px;
  color: white;
  font-family: 'Inter', sans-serif;
  padding: 4rem 5% 6rem;
  box-sizing: border-box;
`;

const PageHeader = styled.div`
  text-align: center;
  max-width: 760px;
  margin: 0 auto 5rem;
`;

const Eyebrow = styled.div`
  display: inline-block;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #ff4444;
  background: rgba(255,68,68,0.08);
  border: 1px solid rgba(255,68,68,0.2);
  padding: 5px 14px;
  border-radius: 4px;
  margin-bottom: 1.5rem;
`;

const PageTitle = styled.h1`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
  margin: 0 0 1.25rem;
  color: white;
  line-height: 1.1;
`;

const PageSubtitle = styled.p`
  font-size: 1rem;
  color: rgba(255,255,255,0.5);
  line-height: 1.7;
  margin: 0;
`;

const CardsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const ProblemCard = styled(motion.div)`
  display: grid;
  grid-template-columns: 2fr 1px 3fr;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.06);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChallengeLeft = styled.div`
  background: #1a0f0f;
  padding: 3rem 2.5rem;
  position: relative;
  border-left: 3px solid #ff4444;
  overflow: hidden;
`;

const GhostNumber = styled.div`
  position: absolute;
  top: -10px;
  right: -8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 130px;
  font-weight: 900;
  color: rgba(255,68,68,0.05);
  line-height: 1;
  user-select: none;
  pointer-events: none;
`;

const ChallengeLabel = styled.div`
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 3px;
  color: #ff4444;
  text-transform: uppercase;
  margin-bottom: 1rem;
`;

const ChallengeTitle = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-style: italic;
  font-size: 1.5rem;
  color: white;
  margin: 0 0 1rem;
  line-height: 1.25;
`;

const ChallengeBody = styled.p`
  font-size: 0.88rem;
  color: rgba(255,255,255,0.48);
  line-height: 1.75;
  margin: 0;
`;

const Divider = styled.div`
  background: rgba(255,255,255,0.06);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '→';
    position: absolute;
    color: rgba(255,255,255,0.18);
    font-size: 1rem;
    background: #0d0f14;
    padding: 5px 7px;
    border-radius: 50%;
  }

  @media (max-width: 768px) {
    height: 1px;
    width: 100%;
    &::after { content: '↓'; }
  }
`;

const SolutionRight = styled.div`
  background: #0a1a14;
  padding: 3rem 2.5rem;
  border-left: 3px solid #00d4aa;
`;

const SolutionLabel = styled.div`
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 3px;
  color: #00d4aa;
  text-transform: uppercase;
  margin-bottom: 1.25rem;
`;

const BulletList = styled.ul`
  list-style: none;
  margin: 0 0 1.5rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const Bullet = styled.li`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  font-size: 0.88rem;
  color: rgba(255,255,255,0.78);
  line-height: 1.55;

  &::before {
    content: '✓';
    color: #00d4aa;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 1px;
  }

  strong { color: white; }
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.05);
`;

const Tag = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.68rem;
  padding: 4px 10px;
  border: 1px solid rgba(0,212,170,0.28);
  border-radius: 4px;
  color: #00d4aa;
  background: rgba(0,212,170,0.05);
`;

// --- DATA ---

const PROBLEMS = [
  {
    num: '01',
    title: 'Fragmented Health Data',
    challenge: 'Health data is siloed across hospitals, clinics, laboratories, and government programs. No standardized real-time analytics. Limited ward-wise visibility of health indicators.',
    bullets: [
      <><strong>Unified Data Fusion Layer</strong> — Aheadly's FHIR R4 adapter pulls from every hospital HMS automatically, merging with satellite, community, and ASHA data into one real-time intelligence layer</>,
      <><strong>Ward-level HRI Dashboard</strong> — every ward gets a live Health Risk Index updated every 15 minutes — visible to SMC at a glance</>,
      <><strong>Data Sources page</strong> — complete transparency into every signal feeding the system</>,
    ],
    tags: ['FHIR R4 Integration', 'Live HRI Scoring', '16 Ward Visibility'],
  },
  {
    num: '02',
    title: 'Delayed Disease Detection',
    challenge: 'Inadequate predictive systems for early outbreak detection. No real-time surveillance for communicable and non-communicable diseases. Difficulty identifying high-risk populations.',
    bullets: [
      <><strong>Outbreak Prediction Engine</strong> — ensemble AI model (LSTM + XGBoost) predicts outbreaks 5–8 days before hospital confirmation with 84% accuracy</>,
      <><strong>Real-time Syndromic Surveillance</strong> — ASHA symptom reports + community checker submissions create a live disease signal layer updated on every submission</>,
      <><strong>HRI Risk Clustering</strong> — spatial-temporal clustering identifies high-risk households and vulnerable zones automatically</>,
    ],
    tags: ['84% Prediction Accuracy', '5-Day Early Warning', 'Real-time Surveillance'],
  },
  {
    num: '03',
    title: 'Limited Citizen-Centric Services',
    challenge: 'Insufficient digital platforms for appointments, telemedicine, vaccination alerts, and emergency services. Low preventive healthcare awareness. Limited accessibility for multilingual populations.',
    bullets: [
      <><strong>Community Portal</strong> — Sanitation Reporter, Symptom Checker, Family Vaccination Insights, Emergency SOS, and Hospital Finder</>,
      <><strong>Multilingual Support</strong> — full Marathi and English interface across the Community Portal and ASHA Field app</>,
      <><strong>AI Health Assistant</strong> — answers health questions in plain language with ward-specific disease context</>,
      <><strong>Emergency SOS</strong> — one-tap emergency that shares location and health profile with the nearest hospital instantly</>,
    ],
    tags: ['Marathi + English', 'Emergency SOS', 'AI Symptom Triage', 'Family Vaccination Tracker'],
  },
  {
    num: '04',
    title: 'Inefficient Infrastructure Monitoring',
    challenge: 'No real-time tracking of hospital bed availability, equipment condition, and medicine stocks. Manual processes reduce efficiency, transparency, and accountability.',
    bullets: [
      <><strong>Hospital Connect Portal</strong> — live bed occupancy, ICU status, medicine stock levels — auto-synced from HMS every 15 minutes, zero manual entry</>,
      <><strong>Critical Stock Alerts</strong> — medicines crossing LOW or CRITICAL threshold trigger automatic alerts to hospital admin and SMC simultaneously</>,
      <><strong>Shift Handover System</strong> — AI-compiled digital handover summaries eliminate paper-based processes entirely</>,
      <><strong>SMC Alert Broadcast</strong> — SMC can push replenishment orders and compliance deadlines directly to hospitals with acknowledgement tracking</>,
    ],
    tags: ['15-min Auto-sync', 'Zero Manual Entry', 'Live Bed Tracking', 'Stock Alert Engine'],
  },
];

function Card({ data, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <ProblemCard
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.65, delay: index * 0.1, ease: 'easeOut' }}
    >
      <ChallengeLeft>
        <GhostNumber>{data.num}</GhostNumber>
        <ChallengeLabel>The Challenge</ChallengeLabel>
        <ChallengeTitle>{data.title}</ChallengeTitle>
        <ChallengeBody>{data.challenge}</ChallengeBody>
      </ChallengeLeft>

      <Divider />

      <SolutionRight>
        <SolutionLabel>How Aheadly Solves It</SolutionLabel>
        <BulletList>
          {data.bullets.map((b, i) => <Bullet key={i}>{b}</Bullet>)}
        </BulletList>
        <TagRow>
          {data.tags.map((t, i) => <Tag key={i}>{t}</Tag>)}
        </TagRow>
      </SolutionRight>
    </ProblemCard>
  );
}

export default function ProblemStatement() {
  return (
    <>
      <FontImport />
      <PageWrap>
        <PageHeader>
          <Eyebrow>SIH 2026 · Problem Statement</Eyebrow>
          <PageTitle>Every problem.<br />A precise solution.</PageTitle>
          <PageSubtitle>
            Solapur Municipal Corporation identified 4 critical public health failures.
            Here's exactly how Aheadly addresses each one.
          </PageSubtitle>
        </PageHeader>

        <CardsStack>
          {PROBLEMS.map((d, i) => (
            <Card key={d.num} data={d} index={i} />
          ))}
        </CardsStack>
      </PageWrap>
    </>
  );
}
