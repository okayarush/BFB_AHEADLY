import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { motion, useInView } from 'framer-motion';
import { FiActivity, FiUsers, FiHeart } from 'react-icons/fi';

// --- Global Styles for Fonts & Scroll ---
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700&family=Outfit:wght@900&display=swap');

  body {
    margin: 0;
    padding: 0;
    background: #080a0f;
    color: white;
    font-family: 'Inter', sans-serif;
    overflow-x: hidden;
  }
  
  /* Hide scrollbar */
  ::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }
`;

// --- Keyframes ---
const pulseArrow = keyframes`
  0%, 100% { transform: translateY(0); opacity: 0.5; }
  50% { transform: translateY(10px); opacity: 1; }
`;

const particleDrift = keyframes`
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  50% { opacity: 0.3; }
  100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
`;

const streamFlow = keyframes`
  to { stroke-dashoffset: 0; }
`;

const orbPulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(0, 212, 170, 0.4); }
  50% { box-shadow: 0 0 60px rgba(0, 212, 170, 0.8), 0 0 100px rgba(0, 212, 170, 0.2); }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const spinNumbers = keyframes`
  from { transform: translateY(0); }
  to { transform: translateY(-100%); }
`;

// --- Layout Components ---

const ScrollContainer = styled.div`
  height: 100vh;
  width: 100vw;
  overflow-y: scroll;

  /* Hide scrollbar */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ProgressBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background-color: #00d4aa;
  z-index: 100;
  transition: width 0.3s ease-out;
`;

const NavBar = styled(motion.nav)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1.5rem 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 90;
  pointer-events: ${props => props.visible ? 'auto' : 'none'};
  box-sizing: border-box;
`;

const Brandmark = styled.div`
  font-family: 'Outfit', sans-serif;
  font-weight: 900;
  font-size: 1.8rem;
  letter-spacing: -1px;
  background: linear-gradient(to bottom, #FFD700 0%, #D4AF37 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  
  a {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    transition: color 0.2s;
    cursor: pointer;
    
    &:hover {
      color: white;
    }
  }
`;

const Section = styled.section`
  height: 100vh;
  width: 100vw;
  scroll-margin-top: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #080a0f;
  overflow: hidden;
`;

const ScrollPrompt = styled(motion.div)`
  position: absolute;
  bottom: 40px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  
  span {
    animation: ${pulseArrow} 2s infinite;
  }
`;

const ParticleCanvasContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
`;

// --- Typography ---

const HeroOverline = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 8px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 24px;
  text-transform: uppercase;
  z-index: 10;
`;

const HeroWordmark = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-weight: 900;
  font-size: clamp(100px, 15vw, 180px);
  margin: 0;
  line-height: 0.9;
  letter-spacing: -2px;
  z-index: 10;
  background: linear-gradient(
    45deg, 
    #FFD700 0%, 
    #FFFACD 25%, 
    #FFD700 50%, 
    #FFFACD 75%, 
    #FFD700 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${gradientMove} 3s linear infinite;
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.5));
  text-shadow: 0 10px 40px rgba(255, 215, 0, 0.2);
`;

const HeroTeamSubtitle = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 4px;
  color: #FFD700;
  margin-top: 20px;
  margin-bottom: 8px;
  text-transform: uppercase;
  z-index: 10;
`;

const HeroSubline = styled.p`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(24px, 3.5vw, 36px);
  color: rgba(255, 255, 255, 0.8);
  margin-top: 10px;
  z-index: 10;
`;

const HeroStat = styled(motion.div)`
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: #00d4aa;
  font-weight: 500;
  letter-spacing: 1px;
  margin-top: 40px;
  z-index: 10;
  font-family: monospace;
`;

const ProblemText = styled(motion.div)`
  font-family: 'Inter', sans-serif;
  font-size: clamp(32px, 5vw, 64px);
  font-weight: 600;
  line-height: 1.3;
  text-align: center;
  max-width: 900px;
  z-index: 10;
  
  .teal {
    color: #00d4aa;
  }
`;

// --- Split Screen (Section 2) ---

const SplitContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
`;

const SplitSide = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 10%;
  background: ${props => props.right ? '#0d0f14' : '#080a0f'};
  position: relative;
`;

const Divider = styled(motion.div)`
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(-50%);
  z-index: 10;
`;

const SideLabel = styled.div`
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 24px;
`;

const SideBody = styled.p`
  font-size: clamp(24px, 3vw, 36px);
  line-height: 1.4;
  margin-bottom: 40px;
  font-weight: 500;
  color: ${props => props.teal ? '#00d4aa' : 'rgba(255, 255, 255, 0.6)'};
  max-width: 500px;
`;

const TimelineItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  color: ${props => props.muted ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.8)'};
  font-size: 0.95rem;
  
  span {
    font-weight: 600;
    color: ${props => props.highlight ? '#00d4aa' : (props.muted ? 'rgba(255, 100, 100, 0.6)' : 'white')};
  }
`;

// --- Data Pulse (Section 3) ---

const PulseContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 900px;
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
`;

const PulseContext = styled(motion.div)`
  position: absolute;
  top: -220px;
  left: 0;
  right: 0;
  width: min(760px, calc(100% - 40px));
  margin: 0 auto;
  text-align: center;
  z-index: 25;

  .label {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 2.8px;
    color: #00d4aa;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .headline {
    font-size: clamp(32px, 4vw, 42px);
    line-height: 1.15;
    color: white;
    margin: 0 0 14px 0;
    font-weight: 600;
  }

  .body {
    margin: 0 auto;
    max-width: 600px;
    font-size: clamp(16px, 1.6vw, 18px);
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.68);
  }

  @media (max-width: 1100px) {
    top: -190px;
    width: min(92vw, 720px);
  }
`;

const CentralOrb = styled(motion.div)`
  width: 120px;
  height: 120px;
  background: #00d4aa;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 20;
  box-shadow: 0 0 20px rgba(0, 212, 170, 0.4);
  color: #080a0f;
  text-align: center;
  
  div {
    font-weight: 800;
    font-size: 0.8rem;
    letter-spacing: 1px;
  }
`;

const StreamLine = styled.svg`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
`;

const StreamNode = styled(motion.div)`
  position: absolute;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  cursor: default;
  z-index: 21;
  ${props => props.position};

  .tooltip {
    position: absolute;
    left: 50%;
    top: -42px;
    transform: translateX(-50%) translateY(4px);
    padding: 6px 10px;
    border-radius: 8px;
    background: rgba(9, 14, 22, 0.96);
    border: 1px solid rgba(255, 255, 255, 0.14);
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.72rem;
    line-height: 1.25;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease;
    z-index: 40;
  }

  &:hover .tooltip {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
`;

const OrbLabels = styled(motion.div)`
  position: absolute;
  bottom: -50px;
  display: flex;
  gap: 30px;
  color: #00d4aa;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const ScoreDisplay = styled(motion.div)`
  position: absolute;
  top: 24px;
  left: 0;
  right: 0;
  width: min(340px, 90vw);
  margin: 0 auto;
  z-index: 26;
  color: white;
  text-align: center;
  
  .score {
    font-size: clamp(2rem, 4vw, 2.5rem);
    font-weight: 700;
    color: #00d4aa;
    letter-spacing: 0.5px;
  }
  .label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 1px;
    margin-top: 5px;
  }
  .meta {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.52);
    margin-top: 8px;
    padding-bottom: 20px;
    letter-spacing: 0.3px;
  }

  @media (max-width: 1200px) {
    top: 56px;
  }

  @media (max-width: 900px) {
    top: 88px;
  }
`;

const HRILegend = styled(motion.div)`
  position: absolute;
  bottom: -120px;
  left: 0;
  right: 0;
  width: 400px;
  margin: 0 auto;
  z-index: 22;

  .ticks {
    display: flex;
    justify-content: space-between;
    color: rgba(255, 255, 255, 0.62);
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .bar-wrap {
    position: relative;
    width: 400px;
    height: 6px;
    border-radius: 999px;
    overflow: hidden;
  }

  .bar {
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #27d36b 0%, #f3d55b 50%, #f39b3d 70%, #ef4949 100%);
  }

  .marker {
    position: absolute;
    top: 50%;
    left: calc(73% - 5px);
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid #080a0f;
    background: #ffffff;
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
    transform: translateY(-50%);
  }

  .labels {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    font-size: 0.68rem;
    letter-spacing: 1px;
    color: rgba(255, 255, 255, 0.66);
    text-transform: uppercase;
  }
`;

// --- Proof (Section 4) ---

const ProofLabel = styled.div`
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 80px;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 80px;
  margin-bottom: 100px;
`;

const StatBlock = styled(motion.div)`
  text-align: center;
  
  .value {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 80px;
    font-weight: 900;
    line-height: 1;
    color: #00d4aa;
    margin-bottom: 15px;
  }
  
  .label {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    max-width: 200px;
    margin: 0 auto;
    line-height: 1.4;
  }
`;

const EditorialQuote = styled.div`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(32px, 4vw, 48px);
  color: white;
  max-width: 800px;
  text-align: center;
  font-style: italic;
`;

// --- Invitation (Section 5) ---

const CTAHeadline = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(48px, 6vw, 72px);
  margin: 0 0 20px 0;
`;

const CTASubline = styled.p`
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 50px 0;
`;

const PrimaryButton = styled.button`
  background: #00d4aa;
  color: #080a0f;
  border: none;
  border-radius: 28px;
  padding: 0 40px;
  height: 56px;
  font-size: 1.1rem;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 0 30px rgba(0, 212, 170, 0.4);
    transform: translateY(-2px);
  }
`;

// --- Portal Selector (Section 6) ---

// --- Problems We Solved (Section 4.5) ---

const ProblemsSection = styled.section`
  width: 100vw;
  height: auto;
  min-height: 100vh;
  scroll-margin-top: 0;
  position: relative;
  background: #080a0f;
  padding: 100px 5% 120px;
  box-sizing: border-box;
  overflow: visible;
`;

const ProblemsSectionHeader = styled.div`
  text-align: center;
  margin-bottom: 80px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const ProblemsSmallLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 3px;
  color: #ff4444;
  margin-bottom: 1rem;
  text-transform: uppercase;
`;

const ProblemsTitle = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(36px, 5vw, 60px);
  margin: 0 0 1.25rem;
  color: white;
  line-height: 1.1;
`;

const ProblemsSubtitle = styled.p`
  font-size: 1rem;
  color: rgba(255,255,255,0.55);
  line-height: 1.6;
  max-width: 700px;
  margin: 0 auto;
`;

const ProblemCardsStack = styled.div`
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
  border: 1px solid rgba(255,255,255,0.05);
  position: relative;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1px auto;
  }
`;

const ChallengeLeft = styled.div`
  background: #1a0f0f;
  padding: 3rem 2.5rem;
  position: relative;
  border-left: 3px solid #ff4444;
  overflow: hidden;
`;

const ProblemNumber = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 120px;
  font-weight: 900;
  color: rgba(255,68,68,0.05);
  line-height: 1;
  user-select: none;
  pointer-events: none;
`;

const ChallengeLabel = styled.div`
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 3px;
  color: #ff4444;
  margin-bottom: 1.25rem;
  text-transform: uppercase;
`;

const ChallengeTitle = styled.h3`
  font-family: 'DM Serif Display', serif;
  font-style: italic;
  font-size: 1.6rem;
  color: white;
  margin: 0 0 1rem;
  line-height: 1.2;
`;

const ChallengeBody = styled.p`
  font-size: 0.9rem;
  color: rgba(255,255,255,0.5);
  line-height: 1.7;
  margin: 0;
`;

const ConnectorDivider = styled.div`
  background: rgba(255,255,255,0.06);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '→';
    position: absolute;
    color: rgba(255,255,255,0.2);
    font-size: 1.2rem;
    background: #080a0f;
    padding: 4px 6px;
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
  position: relative;
`;

const SolutionLabel = styled.div`
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 3px;
  color: #00d4aa;
  margin-bottom: 1.25rem;
  text-transform: uppercase;
`;

const SolutionBullets = styled.ul`
  list-style: none;
  margin: 0 0 1.5rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
`;

const SolutionBullet = styled.li`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.8);
  line-height: 1.5;

  &::before {
    content: '✓';
    color: #00d4aa;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 1px;
  }

  strong { color: white; }
`;

const FeatureTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.05);
`;

const FeatureTag = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  padding: 4px 10px;
  border: 1px solid rgba(0, 212, 170, 0.3);
  border-radius: 4px;
  color: #00d4aa;
  background: rgba(0,212,170,0.05);
`;

// === PROBLEM CARD COMPONENT ===
const PROBLEM_DATA = [
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
      <><strong>Multilingual Support</strong> — full Marathi and English interface across Community Portal and ASHA Field app</>,
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

function ProblemSolvedCard({ data, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <ProblemCard
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: 'easeOut' }}
    >
      <ChallengeLeft>
        <ProblemNumber>{data.num}</ProblemNumber>
        <ChallengeLabel>THE CHALLENGE</ChallengeLabel>
        <ChallengeTitle>{data.title}</ChallengeTitle>
        <ChallengeBody>{data.challenge}</ChallengeBody>
      </ChallengeLeft>
      <ConnectorDivider />
      <SolutionRight>
        <SolutionLabel>HOW AHEADLY SOLVES IT</SolutionLabel>
        <SolutionBullets>
          {data.bullets.map((b, i) => <SolutionBullet key={i}>{b}</SolutionBullet>)}
        </SolutionBullets>
        <FeatureTags>
          {data.tags.map((t, i) => <FeatureTag key={i}>{t}</FeatureTag>)}
        </FeatureTags>
      </SolutionRight>
    </ProblemCard>
  );
}


const PortalSection = styled.section`
  min-height: 100vh;
  width: 100vw;
  background: #0d0f14;
  padding: 120px 5% 60px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PortalHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
  
  .label {
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 2px;
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 20px;
  }
  
  .headline {
    font-family: 'DM Serif Display', serif;
    font-size: 48px;
    margin: 0 0 10px 0;
  }
  
  .subline {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const PortalGrid = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Card = styled.div`
  width: 100%;
  height: ${props => props.height || '340px'};
  border-radius: 20px;
  background: #151821;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    border-color: ${props => props.glowColor};
    box-shadow: 0 10px 40px ${props => props.glowColor}15;
  }
`;

const SMCCardLeft = styled.div`
  flex: 0 0 55%;
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const SMCCardRight = styled.div`
  flex: 0 0 45%;
  position: relative;
  overflow: hidden;
  background: #0a0c12;
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PillContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
  padding-bottom: 5px;
`;

const Pill = styled.span`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
`;

const LiveStat = styled.div`
  margin-top: auto;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 8px;
  
  span {
    color: #00d4aa;
    animation: ${pulseArrow} 2s infinite;
  }
`;

const SecondaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
`;

const SecondaryCardPadding = styled.div`
  padding: 30px;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const IconWrapper = styled.div`
  font-size: 24px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  color: ${props => props.color || 'white'};
`;

const FooterStrip = styled.footer`
  margin-top: 80px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  width: 100%;
  max-width: 1200px;
  padding: 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
  
  .live {
    display: flex;
    align-items: center;
    gap: 8px;
    
    span {
      color: #00d4aa;
      animation: ${pulseArrow} 2s infinite;
    }
  }
`;

// --- Components ---

const ParticleField = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5,
      vy: -Math.random() * 0.5 - 0.1,
      opacity: Math.random() * 0.3
    }));

    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y += p.vy;
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

const TypewriterText = ({ text, delay = 0 }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let timeout;
    let currentIndex = 0;
    
    const startTyping = () => {
      timeout = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(timeout);
        }
      }, 30);
    };

    const initialDelay = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(timeout);
    };
  }, [text, delay]);

  return <span>{displayText}</span>;
};

// Main Component
const TOTAL_SECTIONS = 7; // 0–4: cinematic, 5: Problems, 6: Invitation

export default function Home() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [showPortal, setShowPortal] = useState(false);
  const showPortalRef = useRef(false);
  useEffect(() => { showPortalRef.current = showPortal; }, [showPortal]);

  // JS-controlled section navigation
  const [currentSection, setCurrentSection] = useState(0);
  const currentSectionRef = useRef(0);
  const isScrollingRef = useRef(false);
  const sectionRefs = useRef([]);

  const goToSection = useCallback((index) => {
    if (index < 0 || index >= TOTAL_SECTIONS) return;
    const container = containerRef.current;
    const target = sectionRefs.current[index];
    if (!container || !target) return;

    isScrollingRef.current = true;
    currentSectionRef.current = index;
    setCurrentSection(index);

    // Reset any internal scroll within the target section before navigating to it
    target.scrollTop = 0;

    // Calculate exact top position relative to the container's scroll space
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const targetTop = container.scrollTop + (targetRect.top - containerRect.top);

    container.scrollTo({ top: targetTop, behavior: 'smooth' });
    setTimeout(() => { isScrollingRef.current = false; }, 900);
  }, []);

  useEffect(() => {
    let touchStartY = 0;

    const handleWheel = (e) => {
      if (showPortalRef.current) return;

      const currentEl = sectionRefs.current[currentSectionRef.current];
      if (!currentEl) return;

      const isScrollable = currentEl.scrollHeight > currentEl.clientHeight + 5
        && !currentEl.dataset.noInternalScroll;

      if (isScrollable) {
        const atBottom = currentEl.scrollTop + currentEl.clientHeight >= currentEl.scrollHeight - 5;
        const atTop = currentEl.scrollTop <= 5;
        if ((e.deltaY > 30 && atBottom) || (e.deltaY < -30 && atTop)) {
          e.preventDefault();
          if (isScrollingRef.current) return;
          if (e.deltaY > 30) goToSection(currentSectionRef.current + 1);
          else goToSection(currentSectionRef.current - 1);
        }
        return;
      }

      e.preventDefault();
      if (isScrollingRef.current) return;
      if (e.deltaY > 30) goToSection(currentSectionRef.current + 1);
      else if (e.deltaY < -30) goToSection(currentSectionRef.current - 1);
    };

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (isScrollingRef.current || showPortalRef.current) return;
      const delta = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(delta) < 50) return;

      const currentEl = sectionRefs.current[currentSectionRef.current];
      if (currentEl && currentEl.scrollHeight > currentEl.clientHeight + 5 && !currentEl.dataset.noInternalScroll) {
        const atBottom = currentEl.scrollTop + currentEl.clientHeight >= currentEl.scrollHeight - 5;
        const atTop = currentEl.scrollTop <= 5;
        if ((delta > 0 && !atBottom) || (delta < 0 && !atTop)) return;
      }

      if (delta > 0) goToSection(currentSectionRef.current + 1);
      else goToSection(currentSectionRef.current - 1);
    };

    const handleKeyDown = (e) => {
      if (isScrollingRef.current || showPortalRef.current) return;
      if (e.key === 'ArrowDown') goToSection(currentSectionRef.current + 1);
      if (e.key === 'ArrowUp') goToSection(currentSectionRef.current - 1);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToSection]);

  const scrollProgress = TOTAL_SECTIONS > 1 ? (currentSection / (TOTAL_SECTIONS - 1)) * 100 : 0;
  const showNav = currentSection >= TOTAL_SECTIONS - 1;

  // Section visibility hooks for animations
  const probRef = useRef(null);
  const isProbInView = useInView(probRef, { once: false, amount: 0.5 });
  
  const splitRef = useRef(null);
  const isSplitInView = useInView(splitRef, { once: false, amount: 0.5 });
  
  const pulseRef = useRef(null);
  const isPulseInView = useInView(pulseRef, { once: false, amount: 0.5 });
  
  const proofRef = useRef(null);
  const isProofInView = useInView(proofRef, { once: false, amount: 0.5 });

  return (
    <>
      <GlobalStyle />
      <div style={{ opacity: showPortal ? 0 : 1, transition: 'opacity 0.5s', pointerEvents: 'none' }}>
        <ProgressBar style={{ width: `${scrollProgress}%` }} />
      </div>
      
      <NavBar 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: showPortal || showNav ? 1 : 0, y: showPortal || showNav ? 0 : -20 }}
        visible={showPortal || showNav}
      >
        <Brandmark>AHEADLY</Brandmark>
        <NavLinks>
          <a>How It Works</a>
          <a>Data Sources</a>
        </NavLinks>
      </NavBar>

      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: showPortal ? 0 : 1 }}
        transition={{ duration: 0.8 }}
        style={{ position: showPortal ? 'absolute' : 'relative', top: 0, left: 0, width: '100%', height: '100vh', pointerEvents: showPortal ? 'none' : 'auto', zIndex: 1 }}
      >
        <ScrollContainer ref={containerRef}>
        
        {/* SECTION 0 — COLD OPEN */}
          <Section ref={el => { sectionRefs.current[0] = el; }}>
            <ParticleCanvasContainer>
              <ParticleField />
            </ParticleCanvasContainer>
            <HeroOverline>SIH 2026 | MIT-VPU | SMC</HeroOverline>
            <HeroWordmark>AHEADLY</HeroWordmark>
            <HeroTeamSubtitle>TEAM ARVA</HeroTeamSubtitle>
            <HeroSubline>Urban Health Intelligence for Solapur</HeroSubline>
            <HeroStat>
              <TypewriterText text="847 disease signals processed in the last hour" delay={1500} />
            </HeroStat>
          
          <ScrollPrompt>
            <span>↓</span> scroll
          </ScrollPrompt>
        </Section>

        {/* SECTION 1 — THE PROBLEM */}
        <Section ref={el => { sectionRefs.current[1] = el; probRef.current = el; }}>
          <ProblemText>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isProbInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8 }}
            >
              Solapur has 1.2 million people.
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isProbInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              style={{ marginTop: '20px' }}
            >
              And no way to see a disease outbreak coming.
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isProbInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 2.0 }}
              style={{ marginTop: '40px' }}
              className="teal"
            >
              Until now.
            </motion.div>
          </ProblemText>
          <ScrollPrompt>
            <span>↓</span> scroll
          </ScrollPrompt>
        </Section>

        {/* SECTION 2 — THE SIGNAL MOMENT */}
        <Section ref={el => { sectionRefs.current[2] = el; splitRef.current = el; }}>
          <SplitContainer>
            <Divider 
              initial={{ scaleY: 0 }}
              animate={isSplitInView ? { scaleY: 1 } : { scaleY: 0 }}
              transition={{ duration: 0.5 }}
            />
            
            <SplitSide>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={isSplitInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.8 }}
              >
                <SideLabel>THE OLD WAY</SideLabel>
                <SideBody>A dengue outbreak is reported. Health officers respond. 200 people are already sick.</SideBody>
                
                <TimelineItem muted>
                  <span>Day 0:</span> Outbreak begins
                </TimelineItem>
                <TimelineItem muted>
                  <span>Day 7:</span> First cases reported
                </TimelineItem>
                <TimelineItem muted>
                  <span>Day 14:</span> SMC responds
                </TimelineItem>
              </motion.div>
            </SplitSide>

            <SplitSide right>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={isSplitInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <SideLabel style={{ color: '#00d4aa' }}>THE AHEADLY WAY</SideLabel>
                <SideBody teal>Satellite detects stagnant water. ASHA surveys flag symptoms. HRI crosses 70. SMC acts.</SideBody>
                
                <TimelineItem>
                  <span highlight>Day 0:</span> Signals detected
                </TimelineItem>
                <TimelineItem>
                  <span highlight>Day 1:</span> HRI alert
                </TimelineItem>
                <TimelineItem>
                  <span highlight>Day 3:</span> SMC intervenes
                </TimelineItem>
                <TimelineItem>
                  <span highlight>Day 8:</span> Outbreak prevented
                </TimelineItem>
              </motion.div>
            </SplitSide>
          </SplitContainer>
          <ScrollPrompt style={{ bottom: '20px' }}>
            <span>↓</span> scroll
          </ScrollPrompt>
        </Section>

        {/* SECTION 3 — THE DATA PULSE */}
        <Section ref={el => { sectionRefs.current[3] = el; pulseRef.current = el; }}>
          <PulseContainer>
            <PulseContext
              initial={{ opacity: 0, y: 18 }}
              animate={isPulseInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              transition={{ duration: 0.7, delay: 0.05 }}
            >
              <div className="label">THE HEALTH RISK INDEX</div>
              <h3 className="headline">One number that tells you everything about a ward&apos;s health risk</h3>
              <p className="body">
                Aheadly&apos;s HRI Engine fuses 6 live data streams into a single score &mdash; 0 to 100 &mdash; for every ward in Solapur.
                Updated every 15 minutes. When a ward crosses 70, SMC gets an automatic alert.
              </p>
            </PulseContext>

            {/* Streams SVG */}
            <StreamLine viewBox="0 0 800 600">
              {isPulseInView && (
                <>
                  <motion.path d="M 100 150 Q 250 150 400 300" stroke="#fff" strokeWidth="2" fill="none" strokeDasharray="10 10" opacity="0.3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.3 }} />
                  <motion.path d="M 50 300 L 400 300" stroke="#fff" strokeWidth="2" fill="none" strokeDasharray="10 10" opacity="0.3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.6 }} />
                  <motion.path d="M 150 500 Q 250 400 400 300" stroke="#fff" strokeWidth="2" fill="none" strokeDasharray="10 10" opacity="0.3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.9 }} />
                  <motion.path d="M 650 500 Q 550 400 400 300" stroke="#fff" strokeWidth="2" fill="none" strokeDasharray="10 10" opacity="0.3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.2 }} />
                  <motion.path d="M 750 300 L 400 300" stroke="#fff" strokeWidth="2" fill="none" strokeDasharray="10 10" opacity="0.3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.5 }} />
                  <motion.path d="M 700 100 Q 550 150 400 300" stroke="#fff" strokeWidth="2" fill="none" strokeDasharray="10 10" opacity="0.3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.8 }} />
                </>
              )}
            </StreamLine>

            {/* Nodes */}
            <StreamNode position="top: 130px; left: 20px" initial={{opacity:0}} animate={isPulseInView ? {opacity:1}:{}} transition={{delay:0.3}}>
              🛰 NASA Satellite
              <span className="tooltip">22% of HRI score</span>
            </StreamNode>
            <StreamNode position="top: 280px; left: -10px" initial={{opacity:0}} animate={isPulseInView ? {opacity:1}:{}} transition={{delay:0.6}}>
              👩‍⚕️ ASHA Surveys
              <span className="tooltip">31% of HRI score &mdash; highest weight</span>
            </StreamNode>
            <StreamNode position="top: 500px; left: 60px" initial={{opacity:0}} animate={isPulseInView ? {opacity:1}:{}} transition={{delay:0.9}}>
              🏥 Hospital HMS
              <span className="tooltip">24% of HRI score</span>
            </StreamNode>
            
            <StreamNode position="top: 500px; right: 40px" initial={{opacity:0}} animate={isPulseInView ? {opacity:1}:{}} transition={{delay:1.2}}>
              👥 Community Reports
              <span className="tooltip">14% of HRI score</span>
            </StreamNode>
            <StreamNode position="top: 280px; right: -30px" initial={{opacity:0}} animate={isPulseInView ? {opacity:1}:{}} transition={{delay:1.5}}>
              🏛 Govt. Programs
              <span className="tooltip">6% of HRI score</span>
            </StreamNode>
            <StreamNode position="top: 80px; right: 40px" initial={{opacity:0}} animate={isPulseInView ? {opacity:1}:{}} transition={{delay:1.8}}>
              🌦 Weather Data
              <span className="tooltip">3% of HRI score</span>
            </StreamNode>

            {/* Central Orb */}
            <CentralOrb
              initial={{ scale: 0.5, opacity: 0 }}
              animate={isPulseInView ? { scale: 1, opacity: 1, boxShadow: "0 0 60px rgba(0,212,170,0.8)" } : { scale: 0.5, opacity: 0 }}
              transition={{ delay: 2.1, duration: 0.5 }}
            >
              <div>HRI ENGINE</div>
            </CentralOrb>

            {/* Output */}
            {isPulseInView && (
              <ScoreDisplay initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 2.3}}>
                <div className="score">73 / 100</div>
                <div className="label">HIGH RISK · SECTOR-12</div>
                <div className="meta">Health Risk Index &mdash; updated 2 min ago</div>
              </ScoreDisplay>
            )}

            <HRILegend
              initial={{ opacity: 0, y: 12 }}
              animate={isPulseInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.5, delay: 2.85 }}
            >
              <div className="ticks">
                <span>0</span>
                <span>50</span>
                <span>70</span>
                <span>100</span>
              </div>
              <div className="bar-wrap">
                <div className="bar" />
                <div className="marker" />
              </div>
              <div className="labels">
                <span>LOW RISK</span>
                <span>MODERATE</span>
                <span>HIGH</span>
                <span>CRITICAL</span>
              </div>
            </HRILegend>

            <OrbLabels initial={{opacity:0}} animate={isPulseInView ? {opacity:1}:{}} transition={{delay: 2.6}}>
              <span>Outbreak Alert Sent</span>
              <span>·</span>
              <span>Hospital Notified</span>
              <span>·</span>
              <span>Intervention Dispatched</span>
            </OrbLabels>
          </PulseContainer>
          <ScrollPrompt>
            <span>↓</span> scroll
          </ScrollPrompt>
        </Section>

        {/* SECTION 4 — THE PROOF */}
        <Section ref={el => { sectionRefs.current[4] = el; proofRef.current = el; }}>
          <ProofLabel>WHAT AHEADLY HAS ALREADY DONE</ProofLabel>
          
          <StatsContainer>
            <StatBlock initial={{opacity:0, y:30}} animate={isProofInView ? {opacity:1, y:0}:{}} transition={{duration:0.6, delay:0.2}}>
              <div className="value">5 days</div>
              <div className="label">Average early warning lead time before outbreak confirmation</div>
            </StatBlock>
            <StatBlock initial={{opacity:0, y:30}} animate={isProofInView ? {opacity:1, y:0}:{}} transition={{duration:0.6, delay:0.4}}>
              <div className="value">84%</div>
              <div className="label">Outbreak prediction accuracy</div>
            </StatBlock>
            <StatBlock initial={{opacity:0, y:30}} animate={isProofInView ? {opacity:1, y:0}:{}} transition={{duration:0.6, delay:0.6}}>
              <div className="value">2.4M</div>
              <div className="label">Health data points processed daily across Solapur</div>
            </StatBlock>
          </StatsContainer>
          
          <motion.div initial={{opacity:0}} animate={isProofInView ? {opacity:1}:{}} transition={{duration:1, delay: 1}}>
            <EditorialQuote>
              "This is not a dashboard. It is Solapur's immune system."
            </EditorialQuote>
          </motion.div>
          
          <ScrollPrompt>
            <span>↓</span> scroll
          </ScrollPrompt>
        </Section>

        {/* SECTION 4.5 — PROBLEMS WE SOLVED */}
        <ProblemsSection ref={el => { sectionRefs.current[5] = el; }} data-no-internal-scroll="true">
          <ProblemsSectionHeader>
            <ProblemsSmallLabel>SIH 2026 · PROBLEM STATEMENT</ProblemsSmallLabel>
            <ProblemsTitle>Every problem.<br />A precise solution.</ProblemsTitle>
            <ProblemsSubtitle>Solapur Municipal Corporation identified 4 critical public health failures. Here's exactly how Aheadly addresses each one.</ProblemsSubtitle>
          </ProblemsSectionHeader>
          <ProblemCardsStack>
            {PROBLEM_DATA.map((d, i) => (
              <ProblemSolvedCard key={d.num} data={d} index={i} />
            ))}
          </ProblemCardsStack>
        </ProblemsSection>

        {/* SECTION 5 — THE INVITATION */}
        <Section ref={el => { sectionRefs.current[6] = el; }}>
          <CTAHeadline>Ready to see inside the system?</CTAHeadline>
          <CTASubline>Choose your role. Enter Aheadly.</CTASubline>
          
          <PrimaryButton onClick={() => setShowPortal(true)}>
            ◉ Experience Aheadly
          </PrimaryButton>
        </Section>

        {/* SECTION 6 — PORTAL SELECTOR */}
      </ScrollContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showPortal ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        style={{ position: showPortal ? 'relative' : 'absolute', top: 0, left: 0, width: '100%', minHeight: '100vh', pointerEvents: showPortal ? 'auto' : 'none', zIndex: 2, background: '#0d0f14' }}
      >
        <PortalSection>
          <PortalHeader>
            <div className="label">4 PORTALS. ONE CITY.</div>
            <h2 className="headline">Every Stakeholder. One System.</h2>
            <p className="subline">Select your role to enter Aheadly.</p>
          </PortalHeader>
          
          <PortalGrid>
            {/* SMC COMMAND CARD */}
            <Card height="320px" glowColor="#00d4aa" onClick={() => navigate('/smc')}>
              <div style={{ display: 'flex', height: '100%' }}>
                <SMCCardLeft>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>SMC HEALTH COMMAND</div>
                  <div style={{ color: '#00d4aa', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '20px' }}>FOR MUNICIPAL DECISION MAKERS</div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.5, margin: 0 }}>
                    The command center for Solapur's health officers. Real-time HRI maps, outbreak alerts, intervention planning, AI policy briefs, and city-wide surveillance — all in one view.
                  </p>
                  <PillContainer>
                    <Pill>Digital Twin Ward Map</Pill>
                    <Pill>HRI Risk Scoring</Pill>
                    <Pill>Intervention Planner</Pill>
                    <Pill>AI Policy Brief</Pill>
                    <Pill>Future Overview</Pill>
                    <Pill>Data Sources</Pill>
                  </PillContainer>
                  <LiveStat>
                    <span>●</span> Live — 16 active alerts across Solapur right now
                  </LiveStat>
                </SMCCardLeft>
                <SMCCardRight>
                  {/* Abstract Grid Visual */}
                  <svg width="220" height="220" viewBox="0 0 100 100">
                    <rect x="15" y="15" width="30" height="30" fill="rgba(0, 212, 170, 0.15)" stroke="#00d4aa" strokeWidth="1.5" rx="4"/>
                    <rect x="55" y="15" width="30" height="30" fill="rgba(255, 140, 66, 0.15)" stroke="#ff8c42" strokeWidth="1.5" rx="4"/>
                    <rect x="15" y="55" width="30" height="30" fill="rgba(255, 60, 60, 0.15)" stroke="#ff3c3c" strokeWidth="1.5" rx="4"/>
                    <rect x="55" y="55" width="30" height="30" fill="rgba(0, 212, 170, 0.05)" stroke="#00d4aa" strokeWidth="1.5" rx="4"/>
                  </svg>
                </SMCCardRight>
              </div>
            </Card>

            {/* 3 SECONDARY CARDS */}
            <SecondaryGrid>
              {/* HOSPITAL */}
              <Card height="340px" glowColor="#ff8c42" onClick={() => navigate('/hospital')}>
                <SecondaryCardPadding>
                  <IconWrapper color="#ff8c42"><FiHeart /></IconWrapper>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>Hospital Connect</div>
                  <div style={{ color: '#ff8c42', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px' }}>FOR HOSPITAL ADMINISTRATORS</div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', lineHeight: 1.4, margin: 0 }}>
                    Bed capacity, disease case reporting, medicine stock, and live SMC alerts — built for hospital ops teams.
                  </p>
                  <PillContainer style={{ marginTop: 'auto' }}>
                    <Pill>Bed & ICU Status</Pill>
                    <Pill>Disease Reporting</Pill>
                    <Pill>SMC Alerts</Pill>
                  </PillContainer>
                </SecondaryCardPadding>
              </Card>

              {/* COMMUNITY */}
              <Card height="340px" glowColor="#2dd4a0" onClick={() => navigate('/community')}>
                <SecondaryCardPadding>
                  <IconWrapper color="#2dd4a0"><FiUsers /></IconWrapper>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>Community Portal</div>
                  <div style={{ color: '#2dd4a0', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px' }}>FOR CITIZENS & RESIDENTS</div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', lineHeight: 1.4, margin: 0 }}>
                    Report sanitation issues, check symptoms, track family vaccinations, and access emergency services.
                  </p>
                  <PillContainer style={{ marginTop: 'auto' }}>
                    <Pill>Sanitation Reporter</Pill>
                    <Pill>Symptom Checker</Pill>
                    <Pill>Emergency SOS</Pill>
                  </PillContainer>
                </SecondaryCardPadding>
              </Card>

              {/* ASHA */}
              <Card height="340px" glowColor="#ffd166" onClick={() => navigate('/asha-welcome')}>
                <SecondaryCardPadding>
                  <IconWrapper color="#ffd166"><FiActivity /></IconWrapper>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>ASHA Field</div>
                  <div style={{ color: '#ffd166', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px' }}>FOR ASHA FIELD WORKERS</div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', lineHeight: 1.4, margin: 0 }}>
                    Daily household surveys, AI risk flagging, symptom recording, and escalation alerts.
                  </p>
                  <PillContainer style={{ marginTop: 'auto' }}>
                    <Pill>Household Survey</Pill>
                    <Pill>AI Risk Flag</Pill>
                    <Pill>Escalation Alerts</Pill>
                  </PillContainer>
                </SecondaryCardPadding>
              </Card>
            </SecondaryGrid>
          </PortalGrid>
          
          <FooterStrip>
            <div>AHEADLY · Built for Solapur Municipal Corporation · Powered by satellite + field + community intelligence</div>
            <div className="live"><span>●</span> System live</div>
          </FooterStrip>
        </PortalSection>
      </motion.div>
    </>
  );
}
