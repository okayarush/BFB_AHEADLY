import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiHeart, FiShield, FiAlertTriangle, FiArrowRight } from 'react-icons/fi';
import CommunityLayout from '../components/layout/CommunityLayout';
import { getCityMetrics, wardData } from '../data/unifiedHealthData';

const PORTAL_COLOR = '#00d4aa';
const ACCENT_COLOR = 'rgba(0, 212, 170, 0.1)';

// --- Onboarding Styles ---
const FullScreenContainer = styled(motion.div)`
  position: fixed;
  inset: 0;
  background-color: #0d0f14;
  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  display: flex;
  flex-direction: column;
  z-index: 2000;
  font-family: 'Nunito', sans-serif;
`;

const OnboardCard = styled(motion.div)`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
  backdrop-filter: blur(12px);
`;

const Illustration = styled.div`
  width: 150px;
  height: 150px;
  background: ${ACCENT_COLOR};
  border-radius: 50%;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: ${PORTAL_COLOR};
  box-shadow: 0 10px 30px rgba(58,175,169,0.15);
`;

const OnboardTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.5rem;
`;

const OnboardSub = styled.p`
  font-size: 1.1rem;
  color: #94a3b8;
  margin-bottom: 2rem;
`;

const InputGroup = styled.div`
  width: 100%;
  max-width: 320px;
  text-align: left;
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  color: #cbd5e1;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid #1e2128;
  font-size: 1.1rem;
  font-family: 'Nunito', sans-serif;
  background: #111318;
  color: #e2e8f0;
  &:focus { outline: none; border-color: ${PORTAL_COLOR}; }
`;

const Select = styled.select`
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid #1e2128;
  font-size: 1.1rem;
  font-family: 'Nunito', sans-serif;
  background: #111318;
  color: #e2e8f0;
  &:focus { outline: none; border-color: ${PORTAL_COLOR}; }
`;

const LangOption = styled.div`
  padding: 1rem;
  border: 2px solid ${props => props.$active ? PORTAL_COLOR : '#1e2128'};
  background: ${props => props.$active ? ACCENT_COLOR : '#111318'};
  border-radius: 12px;
  margin-bottom: 0.75rem;
  font-weight: 700;
  color: ${props => props.$active ? '#ffffff' : '#94a3b8'};
  cursor: pointer;
  transition: all 0.2s;
`;

const NextBtn = styled.button`
  background: ${PORTAL_COLOR};
  color: white;
  border: none;
  border-radius: 30px;
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(58,175,169,0.3); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
`;

// --- Dashboard Styles ---
const DashboardContainer = styled.div`
  padding: 2rem 5%;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const Header = styled.div`
  margin-bottom: 1.5rem;
`;

const Greeting = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.2rem;
`;

const SubGreeting = styled.p`
  font-size: 1rem;
  color: #94a3b8;
  font-weight: 600;
`;

const Banner = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
`;

const BannerIcon = styled.div`
  width: 40px; height: 40px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem;
`;

const BannerContent = styled.div`
  flex: 1;
`;

const BannerTitle = styled.div`font-size: 0.95rem; font-weight: 800; color: #ef4444;`;
const BannerText = styled.div`font-size: 0.8rem; color: #fca5a5; line-height: 1.4;`;

const ScoreCard = styled.div`
  background: rgba(30,33,40,0.6);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(255,255,255,0.05);
`;

const ScoreInfo = styled.div`
  flex: 1;
`;

const ScoreTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 800;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.3rem;
`;

const ScoreValue = styled.div`
  font-size: 2.4rem;
  font-weight: 900;
  color: ${PORTAL_COLOR};
  line-height: 1;
  margin-bottom: 0.4rem;
  display: flex;
  align-items:baseline;
  gap: 0.2rem;
  span { font-size: 1rem; color: #94a3b8; font-weight: 700; }
`;

const ScoreDesc = styled.div`
  font-size: 0.85rem;
  color: #94a3b8;
  font-weight: 600;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const ActionCard = styled(motion.div)`
  background: rgba(30,33,40,0.6);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 1.25rem 1rem;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.05);
  transition: all 0.2s;
  
  &:hover {
    border-color: ${PORTAL_COLOR};
    box-shadow: 0 15px 40px rgba(0, 212, 170, 0.2);
    transform: translateY(-4px);
  }
`;

const ActionIcon = styled.div`
  width: 50px;
  height: 50px;
  margin: 0 auto 0.75rem;
  background: ${props => props.$bg || ACCENT_COLOR};
  color: ${props => props.$color || PORTAL_COLOR};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const ActionTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
`;

export default function CommunityOnboarding() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  
  // Onboarding state
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [ward, setWard] = useState('Sector-12');
  const [lang, setLang] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('aheadly_community_user');
    if (saved) {
      setUserProfile(JSON.parse(saved));
    }
  }, []);

  const handleComplete = () => {
    const profile = { name, ward, lang };
    localStorage.setItem('aheadly_community_user', JSON.stringify(profile));
    setUserProfile(profile);
  };

  if (!userProfile) {
    return (
      <FullScreenContainer>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <OnboardCard key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <Illustration>👋</Illustration>
              <OnboardTitle>Welcome to Aheadly.</OnboardTitle>
              <OnboardSub>Your personal health companion for Solapur city.</OnboardSub>
              <InputGroup>
                <Label>What is your name?</Label>
                <Input type="text" placeholder="e.g. Rahul Patil" value={name} onChange={e => setName(e.target.value)} />
              </InputGroup>
              <NextBtn disabled={!name} onClick={() => setStep(2)}>
                Next <FiArrowRight />
              </NextBtn>
            </OnboardCard>
          )}
          {step === 2 && (
            <OnboardCard key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <Illustration>📍</Illustration>
              <OnboardTitle>Where do you live?</OnboardTitle>
              <OnboardSub>We'll personalize health alerts for your neighborhood.</OnboardSub>
              <InputGroup>
                <Label>Select your Ward / Sector</Label>
                <Select value={ward} onChange={e => setWard(e.target.value)}>
                  {Object.values(wardData).map(w => (
                    <option key={w.id} value={w.id}>{w.displayName || w.name}</option>
                  ))}
                </Select>
              </InputGroup>
              <NextBtn onClick={() => setStep(3)}>
                Next <FiArrowRight />
              </NextBtn>
            </OnboardCard>
          )}
          {step === 3 && (
            <OnboardCard key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <Illustration>🗣️</Illustration>
              <OnboardTitle>Choose Language</OnboardTitle>
              <OnboardSub>You can change this anytime later.</OnboardSub>
              <InputGroup>
                <LangOption $active={lang === 'mr'} onClick={() => setLang('mr')}>Marathi (मराठी)</LangOption>
                <LangOption $active={lang === 'hi'} onClick={() => setLang('hi')}>Hindi (हिंदी)</LangOption>
                <LangOption $active={lang === 'en'} onClick={() => setLang('en')}>English</LangOption>
              </InputGroup>
              <NextBtn disabled={!lang} onClick={handleComplete}>
                Get Started <FiArrowRight />
              </NextBtn>
            </OnboardCard>
          )}
        </AnimatePresence>
      </FullScreenContainer>
    );
  }

  // Dashboard View
  const firstName = userProfile.name.split(' ')[0];
  const selectedWard = wardData[userProfile.ward] || wardData['Sector-12'];

  return (
    <CommunityLayout>
      <DashboardContainer>
        <Header>
          <Greeting>Hi, {firstName} 👋</Greeting>
          <SubGreeting>Your health dashboard for {selectedWard.displayName || selectedWard.name}</SubGreeting>
        </Header>

        <Banner>
          <BannerIcon><FiAlertTriangle /></BannerIcon>
          <BannerContent>
            <BannerTitle>Dengue Alert in {userProfile.ward}</BannerTitle>
            <BannerText>3 cases reported near your location. Ensure no stagnant water nearby.</BannerText>
          </BannerContent>
        </Banner>

        <ScoreCard>
          <ScoreInfo>
            <ScoreTitle>Ward Health Score</ScoreTitle>
            <ScoreValue>72<span>/100</span></ScoreValue>
            <ScoreDesc>Your ward is ranking well. Keep reporting issues to improve!</ScoreDesc>
          </ScoreInfo>
          <div style={{ width: 60, height: 60, borderRadius: '50%', border: '6px solid #00d4aa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, color: '#00d4aa' }}>
            #9
          </div>
        </ScoreCard>

        <ActionGrid>
          <ActionCard onClick={() => navigate('/community-sanitation')} whileTap={{ scale: 0.96 }}>
            <ActionIcon $bg="#e0f2fe" $color="#0284c7"><FiMessageSquare /></ActionIcon>
            <ActionTitle>Report Issue</ActionTitle>
          </ActionCard>
          <ActionCard onClick={() => navigate('/community-symptoms')} whileTap={{ scale: 0.96 }}>
            <ActionIcon $bg="#fce7f3" $color="#db2777"><FiHeart /></ActionIcon>
            <ActionTitle>Check Symptoms</ActionTitle>
          </ActionCard>
          <ActionCard onClick={() => navigate('/vaccinations')} whileTap={{ scale: 0.96 }}>
            <ActionIcon $bg="#dcfce7" $color="#16a34a"><FiShield /></ActionIcon>
            <ActionTitle>Vaccinations</ActionTitle>
          </ActionCard>
          <ActionCard onClick={() => navigate('/sos')} whileTap={{ scale: 0.96 }}>
            <ActionIcon $bg="#fee2e2" $color="#dc2626"><FiAlertTriangle /></ActionIcon>
            <ActionTitle>Emergency SOS</ActionTitle>
          </ActionCard>
        </ActionGrid>
        
      </DashboardContainer>
    </CommunityLayout>
  );
}
