import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const PORTAL_COLOR = '#0D7377';
const PORTAL_COLOR_LIGHT = 'rgba(13,115,119,0.15)';
const PORTAL_COLOR_BORDER = 'rgba(13,115,119,0.4)';

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(-45deg, #0f0f23, #1a1a3e, #0d2a2c, #0f1f2e);
  background-size: 400% 400%;
  animation: ${gradientShift} 20s ease infinite;
  color: white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow-x: hidden;
`;

const Hero = styled.div`
  padding: 4rem 2rem 3rem;
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
`;

const PortalBadge = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: ${PORTAL_COLOR_LIGHT};
  border: 1px solid ${PORTAL_COLOR_BORDER};
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${PORTAL_COLOR};
  margin-bottom: 1.5rem;
`;

const HeroTitle = styled(motion.h1)`
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  font-weight: 900;
  letter-spacing: -2px;
  margin: 0 0 1rem;
  color: white;

  span {
    color: ${PORTAL_COLOR};
  }
`;

const HeroTagline = styled(motion.p)`
  font-size: 1.15rem;
  color: rgba(255,255,255,0.65);
  margin-bottom: 0.75rem;
  font-style: italic;
`;

const HeroRole = styled(motion.p)`
  font-size: 0.9rem;
  color: rgba(255,255,255,0.45);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-weight: 600;
`;

const Section = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
`;

const SectionLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${PORTAL_COLOR};
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 800;
  color: white;
  margin: 0 0 1.5rem;
`;

const RoleFlow = styled.div`
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
`;

const RoleStep = styled.div`
  background: ${PORTAL_COLOR_LIGHT};
  border: 1px solid ${PORTAL_COLOR_BORDER};
  border-radius: 10px;
  padding: 0.75rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
  flex: 1;
  min-width: 180px;
  text-align: center;
`;

const Arrow = styled.div`
  font-size: 1.3rem;
  color: ${PORTAL_COLOR};
  flex-shrink: 0;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
`;

const FeatureCard = styled(motion.div)`
  background: rgba(255,255,255,0.05);
  border: 1px solid ${props => props.$active ? PORTAL_COLOR_BORDER : 'rgba(255,255,255,0.08)'};
  border-radius: 14px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${PORTAL_COLOR};
    background: ${PORTAL_COLOR_LIGHT};
    transform: translateY(-3px);
  }
`;

const CardIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.75rem;
`;

const CardTitle = styled.div`
  font-size: 1rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.4rem;
`;

const CardDesc = styled.div`
  font-size: 0.82rem;
  color: rgba(255,255,255,0.6);
  line-height: 1.5;
`;



const EnterButton = styled(motion.button)`
  background: linear-gradient(135deg, ${PORTAL_COLOR}, #14919B);
  border: none;
  border-radius: 12px;
  padding: 1rem 2.5rem;
  color: white;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 2rem auto 0;
  letter-spacing: 0.02em;
`;

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } }
};

const fadeSlide = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function SMCOnboarding() {
  const navigate = useNavigate();

  const featureCards = [
    { icon: '🗺️', title: 'Digital Twin', desc: 'Ward-level health map with HRI scoring and 5 intelligence layers', route: '/digital-twin' },
    { icon: '⚙️', title: 'Intervention Planner', desc: 'Select a ward, review risks, apply interventions, see projected impact', route: '/intervention-planner' },
    { icon: '🔮', title: 'Future Overview', desc: 'AI-predicted outbreak probabilities and convergence timelines', route: '/FutureOverview' },
    { icon: '📋', title: 'Policy Brief', desc: 'Generate official ward health policy briefs with clinical risk assessment', route: '/policy-brief' },
    { icon: '🤖', title: 'AI Copilot', desc: 'Context-aware AI companion that sees what you see and recommends actions', action: 'copilot' },
    { icon: '📁', title: 'Data Sources', desc: 'View data provenance, satellite sources, and methodology', route: '/data-sources' },
  ];

  const handleCardClick = (card) => {
    if (card.action === 'copilot') {
      window.dispatchEvent(new CustomEvent('aheadly-open-copilot'));
    } else if (card.route) {
      navigate(card.route);
    }
  };

  return (
    <PageContainer>
      <Hero>
        <PortalBadge
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          🏛️ SMC HEALTH COMMAND CENTER
        </PortalBadge>

        <HeroTitle initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}>
          The nerve center of<br /><span>Solapur's health intelligence</span>
        </HeroTitle>

        <HeroTagline initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          "Detect convergence. Plan interventions. Protect lives."
        </HeroTagline>

        <HeroRole initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          For: Municipal Health Officers · Ward Officers · City Decision Makers
        </HeroRole>
      </Hero>

      <Section>


        <SectionLabel>YOUR ROLE IN AHEADLY</SectionLabel>
        <SectionTitle>How you fit into the system</SectionTitle>

        <RoleFlow>
          <RoleStep>👁️ You monitor ward-level health signals</RoleStep>
          <Arrow>→</Arrow>
          <RoleStep>🎯 Identify convergence zones before outbreaks</RoleStep>
          <Arrow>→</Arrow>
          <RoleStep>⚙️ Plan and deploy interventions</RoleStep>
          <Arrow>→</Arrow>
          <RoleStep>📋 Generate policy briefs for action</RoleStep>
          <Arrow>→</Arrow>
          <RoleStep>🤖 AI Copilot assists at every step</RoleStep>
        </RoleFlow>
      </Section>

      <Section>
        <SectionLabel>COMMAND CENTER MODULES</SectionLabel>
        <SectionTitle>What you can do here</SectionTitle>

        <motion.div variants={stagger} initial="hidden" animate="show">
          <FeatureGrid>
            {featureCards.map((card) => (
              <FeatureCard
                key={card.title}
                variants={fadeSlide}
                onClick={() => handleCardClick(card)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CardIcon>{card.icon}</CardIcon>
                <CardTitle>{card.title}</CardTitle>
                <CardDesc>{card.desc}</CardDesc>
              </FeatureCard>
            ))}
          </FeatureGrid>
        </motion.div>

        <EnterButton
          onClick={() => navigate('/digital-twin')}
          whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(13,115,119,0.5)' }}
          whileTap={{ scale: 0.97 }}
        >
          Enter Command Center →
        </EnterButton>
      </Section>
    </PageContainer>
  );
}
