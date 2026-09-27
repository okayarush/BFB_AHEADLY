import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

const ChartContainer = styled.div`
  height: 300px;
  width: 100%;
`;

const EnvironmentalTrends = () => {
  const data = [
    { month: 'Jan', temperature: 22, humidity: 65, airQuality: 85 },
    { month: 'Feb', temperature: 24, humidity: 62, airQuality: 82 },
    { month: 'Mar', temperature: 27, humidity: 68, airQuality: 78 },
    { month: 'Apr', temperature: 30, humidity: 70, airQuality: 75 },
    { month: 'May', temperature: 33, humidity: 75, airQuality: 72 },
    { month: 'Jun', temperature: 35, humidity: 80, airQuality: 68 },
    { month: 'Jul', temperature: 36, humidity: 82, airQuality: 65 },
    { month: 'Aug', temperature: 35, humidity: 78, airQuality: 70 },
    { month: 'Sep', temperature: 32, humidity: 73, airQuality: 75 },
    { month: 'Oct', temperature: 28, humidity: 68, airQuality: 80 },
    { month: 'Nov', temperature: 25, humidity: 65, airQuality: 85 },
    { month: 'Dec', temperature: 23, humidity: 63, airQuality: 88 }
  ];

  return (
    <Container
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Title>Environmental Trends</Title>
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="temperature" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Temperature (°C)"
            />
            <Line 
              type="monotone" 
              dataKey="humidity" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Humidity (%)"
            />
            <Line 
              type="monotone" 
              dataKey="airQuality" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Air Quality Index"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Container>
  );
};

export default EnvironmentalTrends;
