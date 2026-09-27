import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const PORTAL_COLOR = '#FFB347';
const PORTAL_LIGHT = 'rgba(255,179,71,0.1)';
const PORTAL_BORDER = 'rgba(255,179,71,0.3)';

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(-45deg, #0f0f23, #1f150a, #1a1a3e, #1a1208);
  background-size: 400% 400%;
  animation: ${gradientShift} 20s ease infinite;
  color: white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const Hero = styled.div`
  padding: 6rem 2rem 4rem;
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
`;

const Badge = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: ${PORTAL_LIGHT};
  border: 1px solid ${PORTAL_BORDER};
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
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 900;
  letter-spacing: -2px;
  margin: 0 0 1rem;
  color: white;
  span { color: ${PORTAL_COLOR}; }
`;

const HeroRole = styled(motion.p)`
  font-size: 0.8rem;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
`;

const Section = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
`;

const SectionLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${PORTAL_COLOR};
  margin-bottom: 1.2rem;
  text-align: ${props => props.centered ? 'center' : 'left'};
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  color: white;
  margin: 0 0 2rem;
  text-align: ${props => props.centered ? 'center' : 'left'};
`;

// Mission card — emotional, full-width
const MissionCard = styled(motion.div)`
  background: linear-gradient(135deg, rgba(255,179,71,0.12), rgba(255,179,71,0.04));
  border: 1px solid ${PORTAL_BORDER};
  border-radius: 20px;
  padding: 4rem 3rem;
  margin-bottom: 3.5rem;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, transparent, ${PORTAL_COLOR}, transparent);
  }
`;

const MissionText = styled.div`
  font-size: 1.15rem;
  color: rgba(255,255,255,0.8);
  line-height: 1.8;
  max-width: 680px;

  strong { color: white; font-weight: 800; }
  em { 
    color: ${PORTAL_COLOR}; 
    font-style: normal; 
    font-weight: 700;
    background: rgba(255,179,71,0.1);
    padding: 0 4px;
    border-radius: 4px;
  }
`;

const MissionHeading = styled.div`
  font-size: 2.2rem;
  font-weight: 900;
  color: white;
  margin-bottom: 2rem;
  letter-spacing: -1px;
  line-height: 1.2;
`;

// Stepper
const Stepper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin: 0 auto 4rem;
  max-width: 720px;
`;

const Step = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  transition: all 0.2s;

  &:hover {
    background: ${PORTAL_LIGHT};
    border-color: ${PORTAL_BORDER};
  }
`;

const StepIcon = styled.div`
  width: 44px; height: 44px;
  border-radius: 12px;
  background: ${PORTAL_LIGHT};
  border: 1px solid ${PORTAL_BORDER};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
`;

const StepBody = styled.div``;
const StepTitle = styled.div`font-size: 1rem; font-weight: 800; color: white; margin-bottom: 0.3rem;`;
const StepDesc = styled.div`font-size: 0.82rem; color: rgba(255,255,255,0.6); line-height: 1.5;`;
const StepDetail = styled.div`font-size: 0.78rem; color: rgba(255,255,255,0.4); margin-top: 0.25rem; font-style: italic;`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1.25rem;
`;

const FeatureCard = styled(motion.div)`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${PORTAL_COLOR};
    background: ${PORTAL_LIGHT};
    transform: translateY(-3px);
  }
`;

const CardIcon = styled.div`font-size: 2rem; margin-bottom: 0.75rem;`;
const CardTitle = styled.div`font-size: 1rem; font-weight: 800; color: white; margin-bottom: 0.4rem;`;
const CardDesc = styled.div`font-size: 0.82rem; color: rgba(255,255,255,0.6); line-height: 1.5;`;

const EnterButton = styled(motion.button)`
  background: linear-gradient(135deg, ${PORTAL_COLOR}, #e8993a);
  border: none;
  border-radius: 12px;
  padding: 1rem 2.5rem;
  color: #1a1208;
  font-size: 1rem;
  font-weight: 900;
  cursor: pointer;
  display: block;
  margin: 2.5rem auto 0;
`;

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeSlide = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const workflowSteps = [
  {
    icon: '📋',
    title: 'Step 1: Check your Task Queue',
    desc: '20 households assigned to you today',
    detail: 'Auto-assigned based on your ward zone and priority flags from previous visits',
  },
  {
    icon: '🚪',
    title: 'Step 2: Visit each household',
    desc: 'Complete the health survey form — record symptoms, vaccination status, sanitation conditions',
    detail: 'Works offline — syncs when you reconnect',
  },
  {
    icon: '🤖',
    title: 'Step 3: AI reviews your data',
    desc: 'If patterns match outbreak indicators, AI flags the household automatically',
    detail: '"3 family members with fever + diarrhea → possible waterborne cluster"',
  },
  {
    icon: '🚨',
    title: 'Step 4: Escalate flagged cases',
    desc: 'One tap sends the flag to your Ward Health Officer',
    detail: 'They can deploy an intervention within hours',
  },
  {
    icon: '📊',
    title: 'Step 5: Track your coverage',
    desc: 'See your completion rate, flagged households, and ward coverage map',
    detail: 'Your stats contribute to ASHA performance reporting',
  },
];

const featureCards = [
  { icon: '📋', title: 'Household Surveys', desc: 'Your daily task queue — visit, survey, submit. Works offline.' },
  { icon: '🤖', title: 'AI Risk Flagging', desc: 'AI analyzes your survey entries for outbreak patterns automatically.' },
  { icon: '🗺️', title: 'Ward Coverage Map', desc: 'See visited vs pending vs flagged households on your ward map.' },
  { icon: '📊', title: 'My Performance', desc: 'Completion rate, flags raised, households covered this month.' },
];

export default function ASHAOnboarding() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <Hero>
        <Badge initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          👩‍⚕️ AHEADLY FIELD
        </Badge>
        <HeroTitle initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}>
          You are the eyes and ears of<br /><span>Solapur's health system</span>
        </HeroTitle>
        <HeroRole initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          For: ASHA (Accredited Social Health Activist) Field Workers
        </HeroRole>
      </Hero>

      <Section>
        <SectionLabel centered>YOUR MISSION</SectionLabel>

        <MissionCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <MissionHeading>Every door you knock on matters.</MissionHeading>
          <MissionText>
            YOUR household surveys capture what satellites can't see —<br />
            <em>fever in a family, a child missing vaccinations,</em><br />
            <em>stagnant water behind a house.</em><br /><br />

            <strong>YOUR data becomes disease signals</strong> in the Digital Twin.<br />
            <strong>YOUR flags trigger ward-level alerts.</strong><br />
            YOUR work gives health officers the ground truth<br />
            they need to <strong>protect your community.</strong><br /><br />

            You are not just collecting data.<br />
            <strong><em>You are Solapur's first line of defense.</em></strong>
          </MissionText>
        </MissionCard>

        <SectionLabel centered>HOW YOUR DAY WORKS</SectionLabel>
        <SectionTitle centered>A day in Aheadly Field</SectionTitle>

        <motion.div variants={stagger} initial="hidden" animate="show">
          <Stepper>
            {workflowSteps.map((step) => (
              <Step key={step.title} variants={fadeSlide}>
                <StepIcon>{step.icon}</StepIcon>
                <StepBody>
                  <StepTitle>{step.title}</StepTitle>
                  <StepDesc>{step.desc}</StepDesc>
                  <StepDetail>→ {step.detail}</StepDetail>
                </StepBody>
              </Step>
            ))}
          </Stepper>
        </motion.div>

        <SectionLabel centered>FIELD APP MODULES</SectionLabel>
        <SectionTitle centered>Your tools</SectionTitle>

        <motion.div variants={stagger} initial="hidden" animate="show">
          <FeatureGrid>
            {featureCards.map((card) => (
              <FeatureCard
                key={card.title}
                variants={fadeSlide}
                onClick={() => navigate('/asha')}
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
          onClick={() => navigate('/asha')}
          whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(255,179,71,0.4)' }}
          whileTap={{ scale: 0.97 }}
        >
          Start Today's Surveys →
        </EnterButton>
      </Section>
    </PageContainer>
  );
}
