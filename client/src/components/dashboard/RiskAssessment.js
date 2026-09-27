import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Container = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Title = styled.h3`
  color: #374151;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
`;

const RiskItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  background: ${props => props.level === 'high' ? '#fef2f2' : 
                       props.level === 'medium' ? '#fffbeb' : '#f0fdf4'};
  border-left: 4px solid ${props => props.level === 'high' ? '#ef4444' : 
                                   props.level === 'medium' ? '#f59e0b' : '#10b981'};
`;

const RiskInfo = styled.div`
  flex: 1;
`;

const RiskTitle = styled.h4`
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
`;

const RiskDescription = styled.p`
  color: #6b7280;
  font-size: 0.75rem;
  margin: 0;
`;

const RiskLevel = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => props.level === 'high' ? '#ef4444' : 
                       props.level === 'medium' ? '#f59e0b' : '#10b981'};
  color: white;
`;

const RiskAssessment = () => {
  const risks = [
    {
      title: "Heat Island Effect",
      description: "Urban temperature 3-5°C higher than rural areas",
      level: "high"
    },
    {
      title: "Flood Risk",
      description: "Heavy rainfall events increasing by 20%",
      level: "medium"
    },
    {
      title: "Air Quality",
      description: "PM2.5 levels within acceptable range",
      level: "low"
    },
    {
      title: "Green Coverage",
      description: "Below recommended 30% green space target",
      level: "medium"
    }
  ];

  return (
    <Container
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Title>Risk Assessment</Title>
      {risks.map((risk, index) => (
        <RiskItem key={index} level={risk.level}>
          <RiskInfo>
            <RiskTitle>{risk.title}</RiskTitle>
            <RiskDescription>{risk.description}</RiskDescription>
          </RiskInfo>
          <RiskLevel level={risk.level}>{risk.level}</RiskLevel>
        </RiskItem>
      ))}
    </Container>
  );
};

export default RiskAssessment;
