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

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const InfoCard = styled.div`
  padding: 1rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 1px solid #e2e8f0;
`;

const InfoLabel = styled.div`
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
`;

const InfoValue = styled.div`
  color: #111827;
  font-size: 1.125rem;
  font-weight: 600;
`;

const MapPlaceholder = styled.div`
  height: 200px;
  background: linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0277bd;
  font-weight: 600;
  margin-top: 1rem;
  border: 2px dashed #29b6f6;
`;

const CityOverview = () => {
  const cityData = {
    name: "Dhaka",
    country: "Bangladesh",
    population: "9.4M",
    area: "306.4 km²",
    density: "30,700/km²",
    greenSpace: "8.2%",
    avgTemp: "26°C",
    lastUpdated: "2 hours ago"
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Title>City Overview - {cityData.name}</Title>
      
      <InfoGrid>
        <InfoCard>
          <InfoLabel>Population</InfoLabel>
          <InfoValue>{cityData.population}</InfoValue>
        </InfoCard>
        
        <InfoCard>
          <InfoLabel>Area</InfoLabel>
          <InfoValue>{cityData.area}</InfoValue>
        </InfoCard>
        
        <InfoCard>
          <InfoLabel>Density</InfoLabel>
          <InfoValue>{cityData.density}</InfoValue>
        </InfoCard>
        
        <InfoCard>
          <InfoLabel>Green Space</InfoLabel>
          <InfoValue>{cityData.greenSpace}</InfoValue>
        </InfoCard>
        
        <InfoCard>
          <InfoLabel>Avg Temperature</InfoLabel>
          <InfoValue>{cityData.avgTemp}</InfoValue>
        </InfoCard>
        
        <InfoCard>
          <InfoLabel>Last Updated</InfoLabel>
          <InfoValue>{cityData.lastUpdated}</InfoValue>
        </InfoCard>
      </InfoGrid>
      
      <MapPlaceholder>
        🗺️ Interactive City Map (NASA Satellite Data)
      </MapPlaceholder>
    </Container>
  );
};

export default CityOverview;
