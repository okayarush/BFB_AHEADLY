import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiDollarSign, FiTrendingUp, FiCalendar, FiCheckCircle, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Import services
import analysisService from '../services/analysisService';
import interventionService from '../services/interventionService';
import { useCityData } from '../context/CityDataContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Container = styled.div`
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1` 
  color: #1e293b;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 1.125rem;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const MetricHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
`;

const MetricTitle = styled.h3`
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  margin: 0;
`;

const MetricValue = styled.div`
  color: #1e293b;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const MetricChange = styled.div`
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
  font-size: 0.875rem;
  font-weight: 600;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const ChartContainer = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h3`
  color: #1e293b;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
`;

const AnalysisPanel = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  background: #f8fafc;
  border-left: 4px solid #10b981;
`;

const BenefitIcon = styled.div`
  color: #10b981;
`;

const BenefitInfo = styled.div`
  flex: 1;
`;

const BenefitTitle = styled.div`
  color: #1e293b;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const BenefitValue = styled.div`
  color: #64748b;
  font-size: 0.875rem;
`;

const CostBenefitAnalysis = () => {
  const { selectedCity } = useCityData();
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [interventionTypes, setInterventionTypes] = useState([]);
  const [selectedInterventions, setSelectedInterventions] = useState([]);

  useEffect(() => {
    fetchData();
  }, [selectedCity]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch intervention types
      const interventionsResponse = await interventionService.getInterventionTypes();
      const interventions = interventionsResponse.data || [];
      setInterventionTypes(interventions);

      // Use first few interventions as default for cost-benefit analysis
      const defaultInterventions = interventions.slice(0, 3).map(intervention => ({
        id: intervention.id,
        name: intervention.name,
        cost: intervention.averageCost,
        benefit: intervention.averageCost * 2, // Simplified benefit calculation
        category: intervention.category,
        co2Reduction: intervention.co2Reduction || 5
      }));
      
      setSelectedInterventions(defaultInterventions);

      // Run cost-benefit analysis with default interventions
      const analysisResponse = await analysisService.runCostBenefitAnalysis(
        defaultInterventions,
        20, // 20 year timeframe
        0.03 // 3% discount rate
      );
      
      setAnalysisData(analysisResponse.data);
      toast.success('Cost-benefit analysis loaded successfully');
      
    } catch (error) {
      console.error('Error fetching cost-benefit data:', error);
      toast.error('Failed to load cost-benefit analysis data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  if (!analysisData) {
    return (
      <Container>
        <Header>
          <Title>Cost-Benefit Analysis</Title>
          <Subtitle>Unable to load analysis data</Subtitle>
        </Header>
      </Container>
    );
  }

  // Format metrics from API data
  const metrics = [
    {
      title: "Total Investment",
      value: `$${analysisData.totalCost?.toLocaleString() || '0'}`,
      change: `${selectedInterventions.length} interventions`,
      positive: false,
      icon: <FiDollarSign size={24} />
    },
    {
      title: "Annual Savings",
      value: `$${(analysisData.totalBenefit / analysisData.timeframe || 0).toLocaleString()}`,
      change: `${analysisData.impactMetrics?.energySavings || 0} kWh/year`,
      positive: true,
      icon: <FiTrendingUp size={24} />
    },
    {
      title: "Payback Period",
      value: `${analysisData.roi?.paybackPeriod || 'N/A'} years`,
      change: "Based on energy savings",
      positive: true,
      icon: <FiCalendar size={24} />
    },
    {
      title: "ROI",
      value: `${Math.round(analysisData.roi?.internalRateOfReturn * 100 || 0)}%`,
      change: `${analysisData.timeframe}-year projection`,
      positive: true,
      icon: <FiCheckCircle size={24} />
    }
  ];

  // Transform intervention data for charts
  const costData = selectedInterventions.map(intervention => ({
    intervention: intervention.name,
    initial: intervention.cost,
    maintenance: Math.round(intervention.cost * 0.05), // 5% annual maintenance
    savings: Math.round(intervention.cost * 0.15) // 15% annual savings
  }));

  // Transform benefit distribution from API data
  const benefitData = analysisData.benefitDistribution ? [
    { name: 'Energy Savings', value: analysisData.benefitDistribution.energySavings, color: '#10b981' },
    { name: 'Health Benefits', value: analysisData.benefitDistribution.healthBenefits, color: '#3b82f6' },
    { name: 'Property Value', value: analysisData.benefitDistribution.propertyValue, color: '#f59e0b' },
    { name: 'Flood Prevention', value: analysisData.benefitDistribution.floodPrevention, color: '#ef4444' },
    { name: 'Air Quality', value: analysisData.benefitDistribution.airQuality, color: '#8b5cf6' }
  ] : [];

  // Transform benefits data from API response
  const benefits = [
    {
      title: "Energy Cost Reduction",
      value: `$${analysisData.impactMetrics?.energySavings || 0}/year`,
      icon: <FiTrendingUp size={20} />
    },
    {
      title: "CO2 Reduction",
      value: `${analysisData.impactMetrics?.co2Reduction || 0} tons/year`,
      icon: <FiCheckCircle size={20} />
    },
    {
      title: "Temperature Reduction",
      value: `${analysisData.impactMetrics?.temperatureReduction || 0}°C`,
      icon: <FiCalendar size={20} />
    },
    {
      title: "Green Space Increase",
      value: `${analysisData.impactMetrics?.greenSpaceIncrease || 0} hectares`,
      icon: <FiDollarSign size={20} />
    }
  ];

  return (
    <Container>
      <Header>
        <Title>Cost-Benefit Analysis</Title>
        <Subtitle>Economic assessment of nature-based interventions</Subtitle>
      </Header>

      <MetricsGrid>
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <MetricHeader>
              <MetricTitle>{metric.title}</MetricTitle>
              <div style={{ color: '#f59e0b' }}>{metric.icon}</div>
            </MetricHeader>
            <MetricValue>{metric.value}</MetricValue>
            <MetricChange positive={metric.positive}>{metric.change}</MetricChange>
          </MetricCard>
        ))}
      </MetricsGrid>

      <ChartsGrid>
        <ChartContainer
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <ChartTitle>Cost Breakdown by Intervention</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="intervention" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Bar dataKey="initial" fill="#f59e0b" name="Initial Cost" />
              <Bar dataKey="maintenance" fill="#ef4444" name="Annual Maintenance" />
              <Bar dataKey="savings" fill="#10b981" name="Annual Savings" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <ChartTitle>Benefit Distribution</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={benefitData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({name, value}) => `${name}: ${value}%`}
              >
                {benefitData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ChartsGrid>

      <AnalysisPanel
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <ChartTitle>Key Economic Benefits</ChartTitle>
        {benefits.map((benefit, index) => (
          <BenefitItem key={index}>
            <BenefitIcon>{benefit.icon}</BenefitIcon>
            <BenefitInfo>
              <BenefitTitle>{benefit.title}</BenefitTitle>
              <BenefitValue>{benefit.value}</BenefitValue>
            </BenefitInfo>
          </BenefitItem>
        ))}
      </AnalysisPanel>
    </Container>
  );
};

export default CostBenefitAnalysis;
