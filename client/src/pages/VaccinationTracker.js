import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiArrowRight, FiShield, FiClock, FiCalendar, FiCheckCircle, FiUserPlus, FiMapPin, FiAlertTriangle } from 'react-icons/fi';
import CommunityLayout from '../components/layout/CommunityLayout';
import CommunityHeader from '../components/common/CommunityHeader';

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

const ProgressCard = styled.div`
  background: rgba(30,33,40,0.6);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid rgba(255,255,255,0.05);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${PORTAL_COLOR};
    box-shadow: 0 15px 40px rgba(0, 212, 170, 0.2);
  }
`;

const ProgressInfo = styled.div`
  flex: 1;
`;

const ProgressTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.5rem;
`;

const ProgressSub = styled.div`
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 600;
`;

// Simple SVG circle progress
const CircularProgress = ({ value, max }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / max) * circumference;
  
  return (
    <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="40" cy="40" r={radius} fill="transparent" stroke="#1e2128" strokeWidth="8" />
        <circle 
          cx="40" 
          cy="40" 
          r={radius} 
          fill="transparent" 
          stroke="#00d4aa" 
          strokeWidth="8" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round" 
        />
      </svg>
      <div style={{ position: 'absolute', fontWeight: 800, fontSize: '1.2rem', color: '#ffffff' }}>
        {Math.round((value/max)*100)}%
      </div>
    </div>
  );
};

const SectionLabel = styled.div`
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
`;

const MemberGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const MemberCard = styled.div`
  background: rgba(30,33,40,0.6);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 1.25rem 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid ${props => props.$active ? PORTAL_COLOR : 'rgba(255,255,255,0.05)'};
  box-shadow: ${props => props.$active ? '0 10px 30px rgba(0, 212, 170, 0.2)' : '0 10px 30px rgba(0,0,0,0.5)'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${PORTAL_COLOR};
  }
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.$bg || ACCENT_COLOR};
  color: ${props => props.$color || PORTAL_COLOR};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 800;
  text-transform: uppercase;
`;

const MemberInfo = styled.div`
  flex: 1;
`;

const MemberName = styled.div`
  font-size: 1.05rem;
  font-weight: 800;
  color: #ffffff;
`;

const MemberAge = styled.div`
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 600;
`;

const AddMemberBtn = styled.button`
  width: 100%;
  background: transparent;
  color: ${PORTAL_COLOR};
  border: 2px dashed ${PORTAL_COLOR};
  border-radius: 16px;
  padding: 1.25rem 1rem;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: ${ACCENT_COLOR};
  }
`;

const TimelineGroupContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TimelineGroup = styled.div`
  margin-bottom: 2rem;
`;

const GroupTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 800;
  color: ${props => props.$color};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const VaccineItem = styled(motion.div)`
  background: rgba(30,33,40,0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.05);
  border-left: 4px solid ${props => props.$color};
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const VaccineName = styled.div`
  font-size: 0.95rem;
  font-weight: 800;
  color: #e2e8f0;
`;

const VaccineDate = styled.div`
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 600;
  margin-top: 0.2rem;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  padding: 3px 8px;
  border-radius: 20px;
  margin-top: 0.4rem;
  background: ${props => props.$type === 'verified'
    ? 'rgba(16,185,129,0.12)'
    : props.$type === 'pending'
    ? 'rgba(245,158,11,0.12)'
    : 'rgba(59,130,246,0.12)'};
  color: ${props => props.$type === 'verified'
    ? '#10b981'
    : props.$type === 'pending'
    ? '#f59e0b'
    : '#3b82f6'};
  border: 1px solid ${props => props.$type === 'verified'
    ? 'rgba(16,185,129,0.3)'
    : props.$type === 'pending'
    ? 'rgba(245,158,11,0.3)'
    : 'rgba(59,130,246,0.3)'};
`;

const VaccineSource = styled.div`
  font-size: 0.72rem;
  color: #4b5563;
  font-weight: 500;
  margin-top: 0.15rem;
`;

const FloatingActionButton = styled.button`
  position: fixed;
  bottom: 85px;  // Above the bottom nav
  right: 20px;
  background: #00d4aa;
  color: #0a0c10;
  border: none;
  border-radius: 30px;
  padding: 1rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 10px 25px rgba(0, 212, 170, 0.3);
  z-index: 1000;
  transition: transform 0.2s;

  &:hover { transform: translateY(-3px); }
`;

const MOCK_FAMILY = [
  {
    id: 'priya',
    name: 'Priya Deshmukh',
    age: '34 yrs',
    avatarBg: '#dcfce7',
    avatarColor: '#16a34a',
    vaccines: {
      completed: [
        { name: 'COVID-19 Booster (3rd Dose)', date: '18 Jan 2025', status: 'verified', source: 'PHC Hadapsar — synced via ABHA' },
        { name: 'Hepatitis B (Series Complete)', date: '04 Mar 2024', status: 'verified', source: 'Sassoon General Hospital' },
        { name: 'MMR (Adult)', date: '11 Aug 2022', status: 'pending', source: 'Self-reported · Awaiting clinic confirmation' },
        { name: 'COVID-19 (2nd Dose)', date: '09 Sep 2021', status: 'verified', source: 'PHC Wanowrie — CoWIN synced' },
      ],
      due: [
        { name: 'Tdap (Tetanus-Diphtheria-Pertussis)', date: 'Due in 14 days', status: 'scheduled', source: 'Reminder set by ASHA worker Sunita Kadam' },
      ],
      upcoming: [
        { name: 'Annual Influenza (Flu) Vaccine', date: 'Oct 2026', status: 'scheduled', source: 'Recommended by NHP seasonal schedule' },
        { name: 'Hepatitis A (Booster)', date: 'Mar 2027', status: 'scheduled', source: 'Recommended · 3-yr cycle' },
      ]
    }
  },
  {
    id: 'ananya',
    name: 'Ananya Deshmukh',
    age: '6 yrs',
    avatarBg: '#fee2e2',
    avatarColor: '#dc2626',
    vaccines: {
      completed: [
        { name: 'BCG (Birth Dose)', date: '02 Sep 2019', status: 'verified', source: 'KEM Hospital — linked to birth record' },
        { name: 'OPV (Pulse Polio)', date: '15 Jan 2020', status: 'verified', source: 'Anganwadi Centre #47, Bibwewadi' },
        { name: 'DPT Primary Series', date: '10 Mar 2020', status: 'verified', source: 'PHC Bibwewadi — HMIS synced' },
        { name: 'MMR (1st Dose)', date: '22 Sep 2020', status: 'verified', source: 'PHC Bibwewadi' },
        { name: 'Typhoid (3yr dose)', date: '05 Dec 2022', status: 'pending', source: 'Self-reported · Parent log · Unverified' },
      ],
      due: [
        { name: 'Typhoid (6yr booster)', date: 'Due in 6 weeks', status: 'scheduled', source: 'ASHA worker follow-up pending' },
        { name: 'DPT Booster (5–6 yr)', date: 'Overdue by 2 yrs', status: 'pending', source: 'Missed — no clinic record found' },
      ],
      upcoming: [
        { name: 'Varicella Booster (2nd Dose)', date: 'Sep 2025', status: 'scheduled', source: 'Recommended — IAP 2025 schedule' },
        { name: 'HPV (11–12 yr, 1st Dose)', date: 'Sep 2031', status: 'scheduled', source: 'NHP adolescent schedule' },
      ]
    }
  }
];

export default function VaccinationTracker() {
  const [view, setView] = useState('landing');
  const [selectedMember, setSelectedMember] = useState(MOCK_FAMILY[0]);

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
    setView('timeline');
  };

  return (
    <CommunityLayout>
      <PageContainer>
        <CommunityHeader
          title="Family Vaccination Insights"
          subtitle="Keep track of your family's immunization schedule and never miss a dose."
          trustLine="🛡️ ASHA-verified records synced directly from local clinics"
        />

        {view === 'landing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ProgressCard onClick={() => setView('members')}>
              <ProgressInfo>
                <ProgressTitle>Your Family's Vaccination Health</ProgressTitle>
                <ProgressSub>4 of 6 recommended vaccines up to date</ProgressSub>
              </ProgressInfo>
              <CircularProgress value={4} max={6} />
            </ProgressCard>

            <SectionLabel>Actions</SectionLabel>
            <AddMemberBtn onClick={() => setView('members')}>
              View Family Members <FiArrowRight />
            </AddMemberBtn>
          </motion.div>
        )}

        {view === 'members' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
             <SectionLabel>Your Family</SectionLabel>
             <MemberGrid>
                {MOCK_FAMILY.map(m => (
                  <MemberCard key={m.id} onClick={() => handleMemberSelect(m)}>
                    <Avatar $bg={m.avatarBg} $color={m.avatarColor}>{m.name.charAt(0)}</Avatar>
                    <MemberInfo>
                      <MemberName>{m.name}</MemberName>
                      <MemberAge>{m.age}</MemberAge>
                    </MemberInfo>
                    <FiArrowRight color="#9ca3af" />
                  </MemberCard>
                ))}
                <AddMemberBtn>
                  <FiUserPlus /> Add Family Member
                </AddMemberBtn>
             </MemberGrid>
          </motion.div>
        )}

        {view === 'timeline' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
             <button onClick={() => setView('members')} style={{ background: 'none', border:'none', color:PORTAL_COLOR, fontWeight:800, marginBottom:'1rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.2rem' }}>&larr; Back to Family</button>
             
             <MemberCard style={{ marginBottom: '2rem', cursor:'default' }}>
                <Avatar $bg={selectedMember.avatarBg} $color={selectedMember.avatarColor}>{selectedMember.name.charAt(0)}</Avatar>
                <MemberInfo>
                  <MemberName>{selectedMember.name}'s Timeline</MemberName>
                  <MemberAge>{selectedMember.age}</MemberAge>
                </MemberInfo>
             </MemberCard>

             <TimelineGroupContainer>
             {selectedMember.vaccines.due.length > 0 && (
               <TimelineGroup>
                 <GroupTitle $color="#f59e0b"><FiAlertTriangle /> Due Soon / Overdue</GroupTitle>
                 {selectedMember.vaccines.due.map(v => (
                   <VaccineItem key={v.name} $color={v.date.startsWith('Overdue') ? '#ef4444' : '#f59e0b'} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}>
                     <div>
                       <VaccineName>{v.name}</VaccineName>
                       <VaccineDate style={{ color: v.date.startsWith('Overdue') ? '#ef4444' : '#b45309'}}>{v.date}</VaccineDate>
                       {v.source && <VaccineSource>{v.source}</VaccineSource>}
                       <div>
                         <StatusBadge $type={v.status === 'verified' ? 'verified' : v.status === 'pending' ? 'pending' : 'scheduled'}>
                           {v.status === 'verified' ? '✓ VERIFIED' : v.status === 'pending' ? '⏳ PENDING' : '📅 SCHEDULED'}
                         </StatusBadge>
                       </div>
                     </div>
                   </VaccineItem>
                 ))}
               </TimelineGroup>
             )}

             {selectedMember.vaccines.upcoming.length > 0 && (
               <TimelineGroup>
                 <GroupTitle $color="#3b82f6"><FiCalendar /> Upcoming</GroupTitle>
                 {selectedMember.vaccines.upcoming.map(v => (
                   <VaccineItem key={v.name} $color="#3b82f6" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}>
                     <div>
                       <VaccineName>{v.name}</VaccineName>
                       <VaccineDate>{v.date}</VaccineDate>
                       {v.source && <VaccineSource>{v.source}</VaccineSource>}
                       <div>
                         <StatusBadge $type="scheduled">📅 SCHEDULED</StatusBadge>
                       </div>
                     </div>
                   </VaccineItem>
                 ))}
               </TimelineGroup>
             )}

             {selectedMember.vaccines.completed.length > 0 && (
               <TimelineGroup>
                 <GroupTitle $color="#10b981"><FiCheckCircle /> Completed</GroupTitle>
                 {selectedMember.vaccines.completed.map(v => (
                   <VaccineItem key={v.name} $color={v.status === 'verified' ? '#10b981' : '#f59e0b'} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}>
                     <div style={{ flex: 1 }}>
                       <VaccineName>{v.name}</VaccineName>
                       <VaccineDate>{v.date}</VaccineDate>
                       {v.source && <VaccineSource>{v.source}</VaccineSource>}
                       <div>
                         <StatusBadge $type={v.status}>
                           {v.status === 'verified' ? '✓ VERIFIED' : '⏳ PENDING'}
                         </StatusBadge>
                       </div>
                     </div>
                     {v.status === 'verified'
                       ? <FiCheckCircle color="#10b981" size={20} style={{ flexShrink: 0 }} />
                       : <FiClock color="#f59e0b" size={20} style={{ flexShrink: 0 }} />
                     }
                   </VaccineItem>
                 ))}
               </TimelineGroup>
             )}
             </TimelineGroupContainer>

          </motion.div>
        )}

        <FloatingActionButton>
          <FiMapPin /> Find Nearest Vaccination Centre
        </FloatingActionButton>

      </PageContainer>
    </CommunityLayout>
  );
}
