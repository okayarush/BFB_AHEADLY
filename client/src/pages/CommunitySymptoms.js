import React, { useState } from "react";
import styled from "styled-components";
import { FiCheckCircle, FiAlertTriangle, FiArrowRight, FiActivity } from "react-icons/fi";
import CommunityLayout from "../components/layout/CommunityLayout";
import CommunityHeader from "../components/common/CommunityHeader";

const PORTAL_COLOR = '#00d4aa';
const ACCENT_COLOR = 'rgba(0, 212, 170, 0.1)';

const PageContainer = styled.div`
  padding: 2rem 5%;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 70px);
  background-color: #0d0f14;
  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const SectionLabel = styled.div`
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
`;

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 2rem;
`;

const CheckboxCard = styled.label`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 1.25rem 1rem;
  background: ${props => props.$checked ? ACCENT_COLOR : '#111318'};
  border: 2px solid ${props => props.$checked ? PORTAL_COLOR : '#1e2128'};
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
  transition: all 0.2s;

  &:hover {
    border-color: ${PORTAL_COLOR};
  }

  input { display: none; }
`;

const Emoji = styled.div`
  font-size: 2rem;
  margin-bottom: 4px;
`;

const CheckLabel = styled.span`
  font-weight: 700;
  font-size: 0.95rem;
  color: ${props => props.$checked ? '#ffffff' : '#94a3b8'};
  text-align: center;
`;

const ContextBanner = styled.div`
  background: rgba(217, 70, 239, 0.1);
  border-left: 4px solid #d946ef;
  padding: 1.25rem;
  border-radius: 0 12px 12px 0;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(217,70,239,0.05);
`;

const ContextTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 800;
  color: #f0abfc;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ContextDesc = styled.div`
  font-size: 0.9rem;
  color: #e879f9;
  line-height: 1.5;
`;

const SubmitBtn = styled.button`
  width: 100%;
  background: ${PORTAL_COLOR};
  color: white;
  border: none;
  border-radius: 16px;
  padding: 1.2rem;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 8px 25px rgba(58,175,169,0.3);
  transition: transform 0.2s;

  &:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(58,175,169,0.4); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
`;

const ResultCard = styled.div`
  background: #111318;
  border: 2px solid ${props => props.$color};
  border-radius: 16px;
  overflow: hidden;
  margin-top: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
`;

const ResultHeader = styled.div`
  background: ${props => props.$bg};
  color: ${props => props.$color};
  padding: 1rem 1.25rem;
  font-weight: 800;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ResultBody = styled.div`
  padding: 1.5rem;
  p { margin: 0 0 1rem; color: #e2e8f0; font-weight: 600; font-size: 1rem; line-height: 1.5;}
  small { color: #94a3b8; font-size: 0.85rem; line-height: 1.5; display: block; }
`;

const SYMPTOMS = [
  { id: 'fever', label: 'Fever', emoji: '🌡️' },
  { id: 'cough', label: 'Cough', emoji: '😷' },
  { id: 'diarrhea', label: 'Diarrhea', emoji: '💧' },
  { id: 'rash', label: 'Rash', emoji: '🔴' },
  { id: 'joint', label: 'Joint Pain', emoji: '🦴' },
  { id: 'breathing', label: 'Breathing Issue', emoji: '💨' }
];

export default function CommunitySymptoms() {
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  
  const toggleSymptom = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    setResult(null);
  };

  const getTriageResult = () => {
    if (selected.includes('breathing') && selected.includes('fever')) {
      return { level: 'Red', color: '#ff4444', bg: 'rgba(255, 68, 68, 0.1)', msg: 'Seek emergency care immediately. Call 108.', desc: 'Your symptoms match severe respiratory infection signs.' };
    }
    if (selected.includes('diarrhea') && selected.includes('fever')) {
      return { level: 'Yellow', color: '#ff8c42', bg: 'rgba(255, 140, 66, 0.1)', msg: 'Possible waterborne infection.', desc: 'Hydrate well. Visit nearest clinic within 24h for a checkup. Common in Sector-12 during monsoon.' };
    }
    if (selected.includes('fever') && selected.includes('joint') && selected.includes('rash')) {
      return { level: 'Yellow', color: '#ff8c42', bg: 'rgba(255, 140, 66, 0.1)', msg: 'Dengue Pattern Match.', desc: 'High risk match for dengue fever. Avoid self-medication and get a blood test today.' };
    }
    return { level: 'Green', color: '#00d4aa', bg: 'rgba(0, 212, 170, 0.1)', msg: 'Mild Symptoms. Self-Monitor.', desc: 'Rest, hydrate, and monitor your symptoms for 24-48 hours. Consult a doctor if they persist.' };
  };

  const handleSubmit = () => {
    setResult(getTriageResult());
  };

  // Mock ward state based on logged in user logic
  const wardName = "Sector-12";

  return (
    <CommunityLayout>
      <PageContainer>
        <CommunityHeader
          title="Symptom Triage"
          subtitle={`Log what you're feeling. Our AI will analyze it against real-time health alerts in ${wardName}.`}
          trustLine="🤖 AI Triage matched 200+ cases this week locally"
        />

        <ContextBanner>
          <ContextTitle><FiAlertTriangle /> Ward Health Context</ContextTitle>
          <ContextDesc>
            There is currently a <strong>High Risk</strong> of water-stagnation related diseases (like Dengue) in <strong>{wardName}</strong> over the past week.
          </ContextDesc>
        </ContextBanner>

        <SectionLabel>Select your symptoms</SectionLabel>
        <CheckboxGrid>
          {SYMPTOMS.map(s => {
            const isChecked = selected.includes(s.id);
            return (
              <CheckboxCard key={s.id} $checked={isChecked}>
                <input type="checkbox" checked={isChecked} onChange={() => toggleSymptom(s.id)} />
                <Emoji>{s.emoji}</Emoji>
                <CheckLabel $checked={isChecked}>{s.label}</CheckLabel>
              </CheckboxCard>
            );
          })}
        </CheckboxGrid>

        <SubmitBtn onClick={handleSubmit} disabled={selected.length === 0}>
           Check Symptoms <FiArrowRight />
        </SubmitBtn>

        {result && (
          <ResultCard $color={result.color}>
            <ResultHeader $bg={result.bg} $color={result.color}>
              {result.level === 'Red' && <FiAlertTriangle />}
              {result.level === 'Yellow' && <FiAlertTriangle />}
              {result.level === 'Green' && <FiCheckCircle />}
               {result.msg}
            </ResultHeader>
            <ResultBody>
              <p>{result.desc}</p>
              <small><b>Disclaimer:</b> This is AI-powered guidance for awareness, not a medical diagnosis. In a medical emergency, please call 108 or go to the nearest hospital immediately.</small>
            </ResultBody>
          </ResultCard>
        )}

      </PageContainer>
    </CommunityLayout>
  );
}
