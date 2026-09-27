import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Card = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
`;

const IconContainer = styled.div`
  padding: 0.5rem;
  border-radius: 10px;
  background: ${props => props.color || '#f3f4f6'};
  color: white;
`;

const Value = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 0.5rem;
`;

const Change = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
`;

const Unit = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
  margin-left: 0.5rem;
`;

const KPICard = ({ 
  title, 
  value, 
  unit, 
  change, 
  icon, 
  color = '#3b82f6',
  positive = true 
}) => {
  return (
    <Card
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <IconContainer color={color}>
          {icon}
        </IconContainer>
      </CardHeader>
      <Value>
        {value}
        <Unit>{unit}</Unit>
      </Value>
      {change && (
        <Change positive={positive}>
          {positive ? '↗' : '↘'} {change}
        </Change>
      )}
    </Card>
  );
};

export default KPICard;
