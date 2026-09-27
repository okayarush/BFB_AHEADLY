import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { hospitalData } from '../data/unifiedHealthData';
import CommunityLayout from '../components/layout/CommunityLayout';
import CommunityHeader from '../components/common/CommunityHeader';

const pulseRed = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.7), 0 0 40px rgba(239,68,68,0.3); }
  50% { box-shadow: 0 0 0 20px rgba(239,68,68,0), 0 0 60px rgba(239,68,68,0.5); }
`;

const PageContainer = styled.div`
  padding: 2rem 5%;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
  background-color: #0d0f14;
  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
`;



const SOSArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 3rem;
`;

const SOSButton = styled(motion.button)`
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: radial-gradient(circle, #EF4444, #dc2626);
  border: 6px solid rgba(239,68,68,0.2);
  color: white;
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: 2px;
  cursor: pointer;
  animation: ${pulseRed} 2.5s ease-in-out infinite;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-shrink: 0;
  box-shadow: 0 10px 30px rgba(239,68,68,0.4);
`;

const SOSLabel = styled.div`
  font-size: 1.1rem;
  font-weight: 800;
  color: #ef4444;
  text-align: center;
`;

const ConfirmModal = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1.5rem;
`;

const ConfirmBox = styled(motion.div)`
  background: rgba(30,33,40,0.9);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
`;

const ConfirmTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 900;
  color: #ffffff;
  margin: 0 0 0.75rem;
`;

const ConfirmSub = styled.p`
  font-size: 1rem;
  color: #94a3b8;
  margin-bottom: 1.75rem;
  line-height: 1.5;
`;

const ConfirmBtnRow = styled.div`
  display: flex;
  gap: 1rem;
`;

const YesBtn = styled.button`
  flex: 1;
  background: #EF4444;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  color: white;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
`;

const NoBtn = styled.button`
  flex: 1;
  background: #1e2128;
  border: 1px solid #2d313a;
  border-radius: 12px;
  padding: 1rem;
  color: #e2e8f0;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
`;

const ResponseCard = styled(motion.div)`
  background: rgba(30,33,40,0.6);
  backdrop-filter: blur(12px);
  border: 2px solid #00d4aa;
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 212, 170, 0.2);
  margin-bottom: 2rem;
`;

const ResponseTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 900;
  color: #00d4aa;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ResponseRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #1e2128;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const RowIcon = styled.div`font-size: 1.5rem; flex-shrink: 0;`;
const RowContent = styled.div``;
const RowLabel = styled.div`font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 0.2rem;`;
const RowValue = styled.div`font-size: 1rem; color: #ffffff; font-weight: 700;`;

const QuickActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const ActionCard = styled(motion.div)`
  background: rgba(30,33,40,0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);

  &:hover {
    border-color: #ef4444;
    box-shadow: 0 15px 40px rgba(239,68,68,0.2);
  }
`;

const ActionIcon = styled.div`font-size: 1.8rem;`;
const ActionBody = styled.div``;
const ActionTitle = styled.div`font-size: 1rem; font-weight: 800; color: #ffffff;`;
const ActionSub = styled.div`font-size: 0.85rem; color: #94a3b8;`;

const nearestHospital = hospitalData['yashwant'] || { name: 'Yashwantrao Chavan Hospital', general: { available: 5 }, pediatric: { available: 2 }, icu: { available: 1 } };
const availableBeds = nearestHospital.general.available + nearestHospital.pediatric.available;
const icuAvailable = nearestHospital.icu.available;

export default function EmergencySOS() {
  const [step, setStep] = useState('idle');

  return (
    <CommunityLayout>
      <PageContainer>
        <CommunityHeader
          title="Emergency SOS"
          subtitle="One tap connects you to the nearest hospital and dispatches help immediately."
        />

        {step === 'idle' && (
          <SOSArea>
            <SOSButton onClick={() => setStep('confirm')} whileTap={{ scale: 0.95 }}>
              <span>SOS</span>
            </SOSButton>
            <SOSLabel>Tap to send emergency alert</SOSLabel>
          </SOSArea>
        )}

        {step === 'sent' && (
          <ResponseCard initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <ResponseTitle>✅ EMERGENCY ALERT SENT</ResponseTitle>

            <ResponseRow>
              <RowIcon>📍</RowIcon>
              <RowContent>
                <RowLabel>Your Location</RowLabel>
                <RowValue>Sector-12, Solapur</RowValue>
              </RowContent>
            </ResponseRow>

            <ResponseRow>
              <RowIcon>🏥</RowIcon>
              <RowContent>
                <RowLabel>Nearest Hospital</RowLabel>
                <RowValue>{nearestHospital.name} — 1.2 km</RowValue>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  Available beds: {availableBeds} | ICU: {icuAvailable}
                </div>
              </RowContent>
            </ResponseRow>

            <ResponseRow>
              <RowIcon>🚑</RowIcon>
              <RowContent>
                <RowLabel>Ambulance Dispatched</RowLabel>
                <RowValue>Unit 07 — ETA: 8 minutes</RowValue>
              </RowContent>
            </ResponseRow>

            <ResponseRow>
              <RowIcon>📞</RowIcon>
              <RowContent>
                <RowLabel>Emergency Helpline</RowLabel>
                <RowValue style={{ color: '#EF4444', fontSize: '1.2rem', fontWeight: 900 }}>108</RowValue>
              </RowContent>
            </ResponseRow>
          </ResponseCard>
        )}

        <QuickActions>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Quick Actions</div>
          <ActionCard whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <ActionIcon>📞</ActionIcon>
            <ActionBody>
              <ActionTitle>Call 108 — National Ambulance</ActionTitle>
              <ActionSub>Free emergency ambulance service, 24/7</ActionSub>
            </ActionBody>
          </ActionCard>
          <ActionCard whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <ActionIcon>🏥</ActionIcon>
            <ActionBody>
              <ActionTitle>Call {nearestHospital.name}</ActionTitle>
              <ActionSub>1.2 km away · {availableBeds} beds available</ActionSub>
            </ActionBody>
          </ActionCard>
        </QuickActions>

        <AnimatePresence>
          {step === 'confirm' && (
            <ConfirmModal initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ConfirmBox initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚨</div>
                <ConfirmTitle>Send Emergency Alert?</ConfirmTitle>
                <ConfirmSub>This will share your location and health profile with {nearestHospital.name} and dispatch an ambulance.</ConfirmSub>
                <ConfirmBtnRow>
                  <NoBtn onClick={() => setStep('idle')}>Cancel</NoBtn>
                  <YesBtn onClick={() => setStep('sent')}>Yes, Send!</YesBtn>
                </ConfirmBtnRow>
              </ConfirmBox>
            </ConfirmModal>
          )}
        </AnimatePresence>
      </PageContainer>
    </CommunityLayout>
  );
}
