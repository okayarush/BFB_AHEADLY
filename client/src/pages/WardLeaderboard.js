import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiAward, FiArrowRight, FiCheckCircle, FiTrendingUp, FiMapPin } from 'react-icons/fi';
import CommunityLayout from '../components/layout/CommunityLayout';
import { wardData } from '../data/unifiedHealthData';
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
  text-align: center;
`;

const WardRankHero = styled.div`
  background: linear-gradient(135deg, ${PORTAL_COLOR}, #065f46);
  border-radius: 20px;
  padding: 2.5rem 1.5rem;
  color: white;
  text-align: center;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(58,175,169,0.3);
  position: relative;
  overflow: hidden;
`;

const HeroBadge = styled.div`
  background: rgba(255,255,255,0.2);
  display: inline-flex;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
`;

const HeroRank = styled.div`
  font-size: 4.5rem;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 0.5rem;
`;

const HeroMessage = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.4;
  margin: 0;
  font-weight: 600;
`;

const SectionLabel = styled.div`
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
`;

const ActionCard = styled(motion.div)`
  background: rgba(30, 33, 40, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${PORTAL_COLOR};
    transform: translateY(-4px);
    box-shadow: 0 15px 40px rgba(58,175,169,0.15);
  }
`;

const ActionIcon = styled.div`
  background: ${props => props.$bg || ACCENT_COLOR};
  color: ${props => props.$color || PORTAL_COLOR};
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const ActionInfo = styled.div`
  flex: 1;
`;

const ActionTitle = styled.div`
  font-size: 1rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.25rem;
`;

const ActionDesc = styled.div`
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 0.75rem;
  line-height: 1.4;
`;

const ActionBtn = styled.div`
  font-size: 0.85rem;
  font-weight: 800;
  color: ${PORTAL_COLOR};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const WinsCard = styled.div`
  background: rgba(219, 39, 119, 0.1);
  border: 1px solid rgba(219, 39, 119, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2.5rem;
`;

const WinItem = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 1rem;
  &:last-child { margin-bottom: 0; }
`;

const Table = styled.div`
  background: rgba(30, 33, 40, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 50px 1fr 60px;
  padding: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  align-items: center;
  background: ${props => props.$isUser ? ACCENT_COLOR : 'transparent'};

  &:last-child { border-bottom: none; }
`;

const RankCell = styled.div`
  font-weight: 800;
  color: ${props => props.$rank <= 3 ? '#f59e0b' : '#9ca3af'};
  font-size: 1.1rem;
`;

const WardCell = styled.div`
  font-weight: 700;
  color: #ffffff;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ScoreCell = styled.div`
  font-weight: 800;
  color: ${PORTAL_COLOR};
  text-align: right;
`;

export default function WardLeaderboard() {
  const navigate = useNavigate();

  // Mock scoring
  const ranked = Object.values(wardData).map((w, idx) => ({
    id: w.id,
    name: w.displayName || w.name,
    score: Math.round(100 - w.hri.total) + Math.floor(Math.random() * 5) // lower HRI => higher leaderboard score
  })).sort((a,b) => b.score - a.score);

  const userWardId = "Sector-12";
  const userRankIndex = ranked.findIndex(w => w.id === userWardId);
  const userRank = userRankIndex + 1;

  return (
    <CommunityLayout>
      <PageContainer>
        <CommunityHeader
          title="Ward Leaderboard"
          subtitle="Compete with other wards to build a healthier city. Track your ward's health score and action impact."
          trustLine={`🏆 ${userWardId} is currently ranked #${userRank}!`}
        />
        <WardRankHero>
          <HeroBadge><FiMapPin /> &nbsp;Sector-12</HeroBadge>
          <HeroRank>#{userRank}</HeroRank>
          <HeroMessage>Your ward is ranking well! Complete vaccinations to crack the Top 5.</HeroMessage>
        </WardRankHero>

        <SectionLabel>What can YOU do to improve your ward's rank?</SectionLabel>
        <ActionGrid>
          <ActionCard onClick={() => navigate('/community-sanitation')} whileTap={{ scale: 0.98 }}>
            <ActionIcon $bg="#fee2e2" $color="#dc2626">🗑️</ActionIcon>
            <ActionInfo>
              <ActionTitle>Report Sanitation Issues</ActionTitle>
              <ActionDesc>Uncollected garbage and stagnant water lower your ward's score. Report them now.</ActionDesc>
              <ActionBtn>Do this now <FiArrowRight /></ActionBtn>
            </ActionInfo>
          </ActionCard>

          <ActionCard onClick={() => navigate('/vaccinations')} whileTap={{ scale: 0.98 }}>
            <ActionIcon $bg="#dcfce7" $color="#16a34a">💉</ActionIcon>
            <ActionInfo>
              <ActionTitle>Complete Vaccinations</ActionTitle>
              <ActionDesc>Ensure 100% vaccination compliance for your family to boost community immunity.</ActionDesc>
              <ActionBtn>Do this now <FiArrowRight /></ActionBtn>
            </ActionInfo>
          </ActionCard>

          <ActionCard onClick={() => navigate('/community-symptoms')} whileTap={{ scale: 0.98 }}>
            <ActionIcon $bg="#fef3c7" $color="#d97706">🩺</ActionIcon>
            <ActionInfo>
              <ActionTitle>Log Health Symptoms</ActionTitle>
              <ActionDesc>Help the city catch disease outbreaks early by reporting any fever or symptoms.</ActionDesc>
              <ActionBtn>Do this now <FiArrowRight /></ActionBtn>
            </ActionInfo>
          </ActionCard>
        </ActionGrid>

        <SectionLabel><FiTrendingUp /> Community Wins This Week</SectionLabel>
        <WinsCard>
          <WinItem>
             <FiCheckCircle color="#db2777" size={24} style={{ flexShrink: 0 }} />
              <div>
               <div style={{ fontWeight: 800, color: '#fbcfe8' }}>Sector-12 moved up 2 spots!</div>
               <div style={{ fontSize: '0.85rem', color: '#f472b6', marginTop: '0.25rem' }}>Thanks to 14 sanitation reports resolved this week.</div>
             </div>
          </WinItem>
          <WinItem>
             <FiCheckCircle color="#f472b6" size={24} style={{ flexShrink: 0 }} />
             <div>
               <div style={{ fontWeight: 800, color: '#fbcfe8' }}>Mosquito hotspots cleared</div>
               <div style={{ fontSize: '0.85rem', color: '#f472b6', marginTop: '0.25rem' }}>3 reports of stagnant water matched with satellite data and cleaned.</div>
             </div>
          </WinItem>
        </WinsCard>

        <SectionLabel><FiAward /> City Leaderboard</SectionLabel>
        <Table>
          {ranked.map((ward, idx) => (
            <TableRow key={ward.id} $isUser={ward.id === userWardId}>
              <RankCell $rank={idx + 1}>#{idx + 1}</RankCell>
              <WardCell>{ward.name} {ward.id === userWardId && <span style={{ fontSize:'1rem' }}>📍</span>}</WardCell>
              <ScoreCell>{ward.score}</ScoreCell>
            </TableRow>
          ))}
        </Table>

      </PageContainer>
    </CommunityLayout>
  );
}
