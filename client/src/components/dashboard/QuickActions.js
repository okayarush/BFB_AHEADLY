import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiPlus, FiMap, FiTrendingUp, FiFileText } from 'react-icons/fi';

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

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const ActionButton = styled(motion.button)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 2px dashed #e5e7eb;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.05);
  }
`;

const IconContainer = styled.div`
  padding: 1rem;
  border-radius: 50%;
  background: ${props => props.color};
  color: white;
`;

const ActionLabel = styled.div`
  color: #374151;
  font-weight: 600;
  text-align: center;
`;

const ActionDescription = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  text-align: center;
`;

const QuickActions = () => {
  const actions = [
    {
      icon: <FiPlus size={24} />,
      label: "Add Intervention",
      description: "Plan new green infrastructure",
      color: "#10b981"
    },
    {
      icon: <FiMap size={24} />,
      label: "View Digital Twin",
      description: "Explore city 3D model",
      color: "#3b82f6"
    },
    {
      icon: <FiTrendingUp size={24} />,
      label: "Run Analysis",
      description: "Cost-benefit simulation",
      color: "#f59e0b"
    },
    {
      icon: <FiFileText size={24} />,
      label: "Generate Report",
      description: "Policy brief export",
      color: "#8b5cf6"
    }
  ];

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Title>Quick Actions</Title>
      <ActionsGrid>
        {actions.map((action, index) => (
          <ActionButton
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconContainer color={action.color}>
              {action.icon}
            </IconContainer>
            <div>
              <ActionLabel>{action.label}</ActionLabel>
              <ActionDescription>{action.description}</ActionDescription>
            </div>
          </ActionButton>
        ))}
      </ActionsGrid>
    </Container>
  );
};

export default QuickActions;
