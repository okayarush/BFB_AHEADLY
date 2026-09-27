import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiShield, FiUser, FiAlertTriangle, FiCheckCircle, FiClock, FiToggleLeft, FiToggleRight, FiPhone, FiLock, FiDroplet, FiAward
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import CommunityLayout from '../components/layout/CommunityLayout';
import CommunityHeader from '../components/common/CommunityHeader';

const PORTAL_COLOR = '#00d4aa';
const ACCENT_COLOR = 'rgba(0, 212, 170, 0.1)';
const TEAL = '#3aafa9';
const GREEN = '#10b981';
const AMBER = '#f59e0b';

const PageContainer = styled.div`
  padding: 2rem 5%;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 70px);
  background-color: #0d0f14;
  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
`;



const Card = styled(motion.div)`
  background: rgba(30, 33, 40, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
`;

const CardHeader = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.02);
`;

const CardIconBox = styled.div`
  width: 36px;
  height: 36px;
  background: ${ACCENT_COLOR};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${PORTAL_COLOR};
  font-size: 1.2rem;
`;

const CardTitle = styled.h2`
  font-size: 1rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
`;

const CardBody = styled.div`
  padding: 1.25rem;
`;

const ProfileHero = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const AvatarCircle = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: ${PORTAL_COLOR};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.8rem;
  font-weight: 800;
  flex-shrink: 0;
  border: 4px solid ${ACCENT_COLOR};
`;

const ProfileName = styled.h3`
  font-size: 1.3rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.25rem;
`;

const ProfileSub = styled.p`
  font-size: 0.9rem;
  color: #94a3b8;
  margin: 0 0 0.5rem;
  font-weight: 600;
`;

const BloodBadge = styled.span`
  background: #fee2e2;
  color: #ef4444;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid #fca5a5;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const ProfileField = styled.div`
  background: #0a0c10;
  border: 1px solid #1e2128;
  border-radius: 12px;
  padding: 1rem;
`;

const FieldKey = styled.p`
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #9ca3af;
  margin: 0 0 0.4rem;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const FieldVal = styled.p`
  font-size: 0.95rem;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
`;

const VaccList = styled.div`
  display: flex;
  flex-direction: column;
`;

const VaccItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #1e2128;
  &:last-child { border-bottom: none; }
`;

const VaccDot = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${(p) => p.$done ? '#dcfce7' : '#fef3c7'};
  color: ${(p) => p.$done ? GREEN : AMBER};
  font-size: 1.2rem;
`;

const VaccName = styled.p`
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.2rem;
`;

const VaccDate = styled.p`
  font-size: 0.85rem;
  color: ${(p) => p.$due ? AMBER : '#6b7280'};
  font-weight: ${(p) => p.$due ? 700 : 500};
  margin: 0;
`;

const PrivacyRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1.5px solid ${(p) => p.$on ? PORTAL_COLOR : '#1e2128'};
  border-radius: 12px;
  background: ${(p) => p.$on ? ACCENT_COLOR : '#0a0c10'};
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
`;

const PrivacyInfo = styled.div`
  flex: 1;
`;

const PrivacyLabel = styled.p`
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.25rem;
`;

const PrivacyHint = styled.p`
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0;
`;

const QrCenter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
`;

const QrFrame = styled.div`
  border: 4px solid ${PORTAL_COLOR};
  border-radius: 16px;
  padding: 1rem;
  background: #fff;
`;

const DEMO_PROFILE = {
  name: 'Rahul Patil',
  age: 38,
  gender: 'Male',
  bloodGroup: 'B+',
  ward: 'Sector-12',
  allergies: 'None',
  conditions: 'Hypertension',
  emergency: 'Aditi Patil · 98765-XXXXX',
};

const VACCINATIONS = [
  { name: 'COVID-19 (Booster)', status: 'done', date: 'Dec 2024' },
  { name: 'Hepatitis B', status: 'done', date: 'Complete' },
  { name: 'Influenza', status: 'due',  date: 'Due Apr 2026'},
];

export default function HealthPassport() {
  const [shareConditions, setShareConditions] = useState(true);
  const [shareVaccinations, setShareVaccinations] = useState(true);
  const [shareEmergency, setShareEmergency] = useState(false);

  const handleToggle = (label, val, setter) => {
    setter(!val);
    toast(!val ? `${label} sharing enabled` : `${label} sharing disabled`, {
      icon: !val ? '🔓' : '🔒',
    });
  };

  return (
    <CommunityLayout>
      <PageContainer>
        <CommunityHeader
          title="Digital Health Passport"
          subtitle="Your portable, privacy-controlled health record."
          trustLine="🔒 Secured with End-to-End Encryption"
        />

        <Card>
          <CardHeader>
            <CardIconBox><FiUser /></CardIconBox>
            <CardTitle>Personal Profile</CardTitle>
          </CardHeader>
          <CardBody>
            <ProfileHero>
              <AvatarCircle>RP</AvatarCircle>
              <div>
                <ProfileName>{DEMO_PROFILE.name}</ProfileName>
                <ProfileSub>{DEMO_PROFILE.age} yrs · {DEMO_PROFILE.gender} · {DEMO_PROFILE.ward}</ProfileSub>
                <BloodBadge><FiDroplet size={14} /> {DEMO_PROFILE.bloodGroup}</BloodBadge>
              </div>
            </ProfileHero>
            <ProfileGrid>
              <ProfileField style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                <FieldKey><FiAlertTriangle /> Allergies</FieldKey>
                <FieldVal style={{ color: AMBER }}>{DEMO_PROFILE.allergies}</FieldVal>
              </ProfileField>
              <ProfileField>
                <FieldKey>Conditions</FieldKey>
                <FieldVal>{DEMO_PROFILE.conditions}</FieldVal>
              </ProfileField>
              <ProfileField style={{ gridColumn: '1 / -1', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                <FieldKey><FiPhone /> Emergency Contact</FieldKey>
                <FieldVal>{DEMO_PROFILE.emergency}</FieldVal>
              </ProfileField>
            </ProfileGrid>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardIconBox><FiAward /></CardIconBox>
            <CardTitle>Vaccinations</CardTitle>
          </CardHeader>
          <CardBody>
            <VaccList>
              {VACCINATIONS.map(v => (
                <VaccItem key={v.name}>
                  <VaccDot $done={v.status === 'done'}>
                    {v.status === 'done' ? <FiCheckCircle /> : <FiClock />}
                  </VaccDot>
                  <div style={{ flex: 1 }}>
                    <VaccName>{v.name}</VaccName>
                    <VaccDate $due={v.status === 'due'}>{v.date}</VaccDate>
                  </div>
                </VaccItem>
              ))}
            </VaccList>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardIconBox><FiLock /></CardIconBox>
            <CardTitle>Privacy Controls</CardTitle>
          </CardHeader>
          <CardBody>
            {[
              { label: 'Conditions & History', hint: 'Visible to treating physicians', val: shareConditions, setter: setShareConditions },
              { label: 'Vaccination Records', hint: 'Visible to health facilities', val: shareVaccinations, setter: setShareVaccinations },
              { label: 'Emergency Contact', hint: 'Visible only in emergency mode', val: shareEmergency, setter: setShareEmergency },
            ].map(({ label, hint, val, setter }) => (
              <PrivacyRow key={label} $on={val} onClick={() => handleToggle(label, val, setter)}>
                <PrivacyInfo>
                  <PrivacyLabel>{label}</PrivacyLabel>
                  <PrivacyHint>{hint}</PrivacyHint>
                </PrivacyInfo>
                <div style={{ color: val ? PORTAL_COLOR : '#9ca3af', fontSize: '2rem' }}>
                  {val ? <FiToggleRight /> : <FiToggleLeft />}
                </div>
              </PrivacyRow>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardIconBox><FiShield /></CardIconBox>
            <CardTitle>Your QR Code</CardTitle>
          </CardHeader>
          <CardBody>
            <QrCenter>
              <QrFrame>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=HP_RAHUL&color=0D7377&bgcolor=ffffff`} alt="QR" width="150" height="150" />
              </QrFrame>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '1rem', textAlign: 'center' }}>Present this at clinics and hospitals for instant verified access.</p>
            </QrCenter>
          </CardBody>
        </Card>

      </PageContainer>
    </CommunityLayout>
  );
}
