import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { FiClock, FiArrowLeft, FiRadio } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// Keyframe Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b69 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
`;

const BackButton = styled(motion.button)`
  position: absolute;
  top: 2rem;
  left: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 1rem 1.5rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(102, 126, 234, 0.5);
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
  }
  
  @media (max-width: 768px) {
    top: 1rem;
    left: 1rem;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
`;

const Content = styled.div`
  text-align: center;
  max-width: 1000px;
  z-index: 10;
`;

const IconContainer = styled(motion.div)`
  width: 120px;
  height: 120px;
  margin: 0 auto 3rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  animation: ${float} 3s ease-in-out infinite;
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    inset: -5px;
    border-radius: 50%;
    background: linear-gradient(45deg, #667eea, #764ba2, #f093fb);
    z-index: -1;
    animation: ${rotate} 8s linear infinite;
    opacity: 0.7;
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: -15px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(102, 126, 234, 0.2) 0%, transparent 70%);
    z-index: -2;
    animation: ${pulse} 2s ease-in-out infinite;
  }
`;

const Title = styled(motion.h1)`
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 800;
  color: white;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #fff, #667eea, #f093fb);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${fadeInUp} 1s ease-out;
`;

const Subtitle = styled(motion.p)`
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 3rem;
  line-height: 1.6;
  font-weight: 300;
  animation: ${fadeInUp} 1s ease-out 0.2s both;
`;

const Message = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 3rem;
  animation: ${fadeInUp} 1s ease-out 0.4s both;
`;

const MessageText = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  line-height: 1.7;
  margin: 0;
  font-weight: 400;
`;

const ContactInfo = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: ${fadeInUp} 1s ease-out 0.6s both;
  
  @media (max-width: 768px) {
    gap: 0.75rem;
  }
`;

const ContactItem = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  strong {
    color: white;
    font-weight: 600;
  }
`;

const BackgroundElements = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 1;
`;

const FloatingOrb = styled.div`
  position: absolute;
  width: ${props => props.size || '200px'};
  height: ${props => props.size || '200px'};
  border-radius: 50%;
  background: radial-gradient(circle, ${props => props.color || 'rgba(102, 126, 234, 0.1)'} 0%, transparent 70%);
  filter: blur(40px);
  animation: ${float} ${props => props.duration || '6s'} ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
`;

const GridPattern = styled.div`
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 100px 100px;
  animation: ${float} 20s ease-in-out infinite;
`;

function ComingSoon() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Container>
      <BackgroundElements>
        <GridPattern />
        <FloatingOrb 
          size="300px"
          color="rgba(102, 126, 234, 0.08)"
          duration="8s"
          delay="0s"
          style={{top: '10%', left: '70%'}}
        />
        <FloatingOrb 
          size="200px"
          color="rgba(118, 75, 162, 0.06)"
          duration="10s"
          delay="3s"
          style={{top: '70%', left: '20%'}}
        />
        <FloatingOrb 
          size="150px"
          color="rgba(240, 147, 251, 0.05)"
          duration="12s"
          delay="6s"
          style={{top: '30%', left: '10%'}}
        />
      </BackgroundElements>

      <BackButton
        onClick={() => navigate(-1)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <FiArrowLeft size={18} />
        Back
      </BackButton>

      <Content>
        <IconContainer
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.3
          }}
        >
          <FiClock size={50} color="white" />
        </IconContainer>

        <Title
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Coming Soon
        </Title>

        <Subtitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          This feature is currently under development as part of our NASA Space Apps Challenge project
        </Subtitle>

        <Message
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <MessageText>
            We're working hard to bring you innovative tools for transforming cities with NASA Earth observation data. 
            Our team is crafting amazing features that will help visualize and analyze environmental data for sustainable urban planning.
          </MessageText>
        </Message>

        <ContactInfo
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <ContactItem>
            <FiRadio size={16} />
            <span><strong>NASA Space Apps Challenge 2025</strong></span>
          </ContactItem>
          <ContactItem>
            <span>Data Pathways to Healthy Cities and Human Settlements</span>
          </ContactItem>
        </ContactInfo>
      </Content>
    </Container>
  );
}

export default ComingSoon;
