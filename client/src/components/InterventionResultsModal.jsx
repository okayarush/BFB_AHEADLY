import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTrendingUp, FiDollarSign, FiCalendar, FiHelpCircle, FiDroplet, FiThermometer, FiDownload } from 'react-icons/fi';
import { MdNature, MdAir, MdWater, MdSolarPower } from 'react-icons/md';
import { formatBDT, formatBDTCompact } from '../utils/currency';
import { generateInterventionPDF } from '../utils/pdfGenerator';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar,
    ComposedChart
} from 'recharts';

// Styled Components
const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
`;

const Modal = styled(motion.div)`
  background: white;
  border-radius: 20px;
  width: 95%;
  max-width: 1200px;
  max-height: 95vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  overflow-x: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px 20px 0 0;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const DownloadButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Content = styled.div`
  padding: 2rem;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 2rem;
  background: #f8fafc;
  border-radius: 12px 12px 0 0;
  padding: 0.5rem;
`;

const Tab = styled.button`
  flex: 1;
  padding: 1rem 2rem;
  border: none;
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'rgba(102, 126, 234, 0.8)'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.95rem;

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(102, 126, 234, 0.1)'};
    color: ${props => props.active ? 'white' : '#667eea'};
  }
`;

const TabContent = styled(motion.div)`
  min-height: 600px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SectionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${props => props.color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color};
`;

const GridLayout = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MetricIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${props => props.color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color};
`;

const HintIcon = styled.div`
  position: relative;
  color: #64748b;
  cursor: help;
  
  &:hover .tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

const HintTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-8px);
  background: #1e293b;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.75rem;
  line-height: 1.4;
  white-space: nowrap;
  max-width: 250px;
  white-space: normal;
  width: max-content;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: #1e293b;
  }
`;

const ComparisonContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ComparisonCard = styled.div`
  padding: 1rem;
  border-radius: 12px;
  background: ${props => props.type === 'before' ? '#fef2f2' : '#f0fdf4'};
  border: 1px solid ${props => props.type === 'before' ? '#fecaca' : '#bbf7d0'};
`;

const ComparisonLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.type === 'before' ? '#991b1b' : '#166534'};
  margin-bottom: 0.5rem;
  text-transform: uppercase;
`;

const ComparisonValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.type === 'before' ? '#dc2626' : '#16a34a'};
`;

const ComparisonUnit = styled.span`
  font-size: 1rem;
  font-weight: normal;
  color: #64748b;
`;

const ImprovementBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  background: #dcfce7;
  color: #166534;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.5rem;
`;

const ProfessionalChart = styled.div`
  height: 400px;
  margin-bottom: 2rem;
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MetricCard = styled.div`
  background: linear-gradient(135deg, ${props => props.color}08, ${props => props.color}15);
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid ${props => props.color}30;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const MetricValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.color};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
`;

const MetricChange = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.positive ? COLORS.success : COLORS.danger};
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const StatValue = styled.div`
  font-size: 1.875rem;
  font-weight: bold;
  color: ${props => props.color || '#1e293b'};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
`;

const StatSubtext = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
`;

const ROISummary = styled.div`
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid #bae6fd;
`;

const ROITitle = styled.h3`
  color: #0c4a6e;
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
`;

const ROIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ROIMetric = styled.div`
  text-align: center;
`;

const ROIValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #0c4a6e;
  margin-bottom: 0.25rem;
`;

const ROILabel = styled.div`
  font-size: 0.875rem;
  color: #475569;
`;

const ChartContainer = styled.div`
  height: 300px;
  margin-bottom: 1rem;
`;

const COLORS = {
    primary: '#667eea',
    success: '#764ba2',
    warning: '#f093fb',
    danger: '#2d1b69',
    info: '#1a1a3e',
    purple: '#667eea'
};

const InterventionResultsModal = ({ isOpen, onClose, results, interventionName = 'Intervention' }) => {
    const [activeTab, setActiveTab] = useState('summary');
    const [isDownloading, setIsDownloading] = useState(false);

    if (!results) return null;

    // Debug log to see data structure
    console.log('Modal received results:', results);

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            await generateInterventionPDF(results, interventionName);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const formatCurrency = (value) => {
        return formatBDTCompact(value, true); // Use compact format for better display in cards
    };

    const formatNumber = (value, decimals = 2) => {
        return parseFloat(value).toFixed(decimals);
    };

    const formatPercent = (value) => {
        return `${formatNumber(value, 2)}%`;
    };

    // Scientific notation formatter for large numbers
    const formatScientific = (value) => {
        if (Math.abs(value) >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        } else if (Math.abs(value) >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
        }
        return formatNumber(value);
    };

    // Calculate proper ROI and cash flow with NPV
    const calculateFinancialMetrics = () => {
        const discountRate = 0.06; // 6% discount rate
        const initialInvestment = results.costs?.implementation || 100000;

        let cumulativeCashFlow = -initialInvestment; // Start with negative investment
        let paybackYear = null;

        const years = [0, 5, 10, 15];
        return years.map(year => {
            if (year === 0) {
                return {
                    year: 0,
                    temperature: 0,
                    vegetation: 0,
                    carbonSequestration: 0,
                    waterManaged: 0,
                    costs: initialInvestment,
                    benefits: 0,
                    annualCashFlow: -initialInvestment,
                    cumulativeCashFlow: -initialInvestment,
                    npvCashFlow: -initialInvestment,
                    roi: 0,
                    breakEvenLine: 0
                };
            }

            // Extract data for each year from the results structure
            const tempData = results.projections?.temperature?.[year] || {};
            const vegData = results.projections?.vegetation?.[year] || {};
            const carbonData = results.projections?.carbonSequestration?.[year] || {};
            const waterData = results.projections?.waterManagement?.[year] || {};

            // Use progressive scaling for missing data
            const progressiveFactor = year / 15;

            // Annual costs and benefits
            const annualMaintenance = (results.costs?.maintenance?.[year] || initialInvestment * 0.02); // 2% of initial investment
            const annualBenefits = results.benefits?.total?.[year] || (progressiveFactor * 30000); // Progressive benefits

            // Annual cash flow (benefits - maintenance)
            const annualCashFlow = annualBenefits - annualMaintenance;

            // Cumulative cash flow
            cumulativeCashFlow += annualCashFlow;

            // NPV calculation
            const npvCashFlow = annualCashFlow / Math.pow(1 + discountRate, year);

            // Check for payback period
            if (!paybackYear && cumulativeCashFlow >= 0) {
                paybackYear = year;
            }

            // ROI calculation: (Total benefits - Total costs) / Total costs * 100
            const totalInvestment = initialInvestment + (annualMaintenance * year);
            const roi = ((cumulativeCashFlow + initialInvestment) / totalInvestment) * 100;

            return {
                year,
                temperature: tempData.reduction || (progressiveFactor * 2.5),
                vegetation: vegData.improvement || (progressiveFactor * 15),
                carbonSequestration: carbonData.annualSequestration || (progressiveFactor * 25),
                waterManaged: (waterData.totalStormwaterManaged || (progressiveFactor * 50000)) / 1000,
                costs: totalInvestment,
                benefits: annualBenefits * year, // Cumulative benefits
                annualCashFlow: annualCashFlow,
                cumulativeCashFlow: cumulativeCashFlow,
                npvCashFlow: npvCashFlow,
                roi: roi,
                breakEvenLine: 0, // Break even line at 0
                paybackPeriod: paybackYear
            };
        });
    };

    const timeSeriesData = calculateFinancialMetrics();

    // Get current year data for metrics with proper ROI calculation
    const getCurrentMetrics = () => {
        const projections = results.projections || {};
        const costs = results.costs || {};
        const benefits = results.benefits || {};

        // Get 15-year data from time series
        const finalYearData = timeSeriesData.find(d => d.year === 15) || timeSeriesData[timeSeriesData.length - 1];

        // Calculate proper payback period
        const paybackPeriod = timeSeriesData.find(d => d.cumulativeCashFlow >= 0)?.year || null;

        // Use 15-year data as primary, fallback to calculated values
        const temp15 = projections.temperature?.[15] || {};
        const veg15 = projections.vegetation?.[15] || {};
        const carbon15 = projections.carbonSequestration?.[15] || {};
        const water15 = projections.waterManagement?.[15] || {};

        return {
            temperatureReduction: temp15.reduction || finalYearData.temperature,
            vegetationIncrease: veg15.improvement || finalYearData.vegetation,
            carbonSequestration: carbon15.annualSequestration || finalYearData.carbonSequestration,
            waterManagement: water15.totalStormwaterManaged || (finalYearData.waterManaged * 1000),
            totalBenefits: finalYearData.benefits,
            totalCosts: finalYearData.costs,
            roiPercentage: finalYearData.roi,
            paybackPeriod: paybackPeriod || "No payback within 15 years"
        };
    };

    const metrics = getCurrentMetrics();



    // Prepare benefits breakdown data
    const prepareBenefitsData = () => {
        const benefits = results.benefits || {};
        const totalBenefit = benefits.total?.[15] || 150000; // Default total benefit

        return [
            { name: 'Energy Savings', value: benefits.energySavings?.[15] || totalBenefit * 0.3, color: COLORS.warning },
            { name: 'Carbon Credits', value: benefits.carbonSequestration?.[15] || totalBenefit * 0.25, color: COLORS.success },
            { name: 'Water Management', value: benefits.waterManagement?.[15] || totalBenefit * 0.2, color: COLORS.info },
            { name: 'Air Quality', value: benefits.airQuality?.[15] || totalBenefit * 0.15, color: COLORS.purple },
            { name: 'Property Value', value: benefits.propertyValue?.[15] || totalBenefit * 0.1, color: COLORS.primary }
        ].filter(item => item.value > 0);
    };

    const benefitsData = prepareBenefitsData();

    // Tab render functions
    const renderSummaryTab = () => (
        <TabContent
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Summary Overview */}
            <ROISummary>
                <ROITitle>Intervention Summary - 15 Year Projection</ROITitle>
                <ROIGrid>
                    <ROIMetric>
                        <ROIValue>{formatCurrency(metrics.totalCosts)}</ROIValue>
                        <ROILabel>Total Investment</ROILabel>
                    </ROIMetric>
                    <ROIMetric>
                        <ROIValue>{formatCurrency(metrics.totalBenefits)}</ROIValue>
                        <ROILabel>Total Benefits</ROILabel>
                    </ROIMetric>
                    <ROIMetric>
                        <ROIValue style={{ color: metrics.roiPercentage > 0 ? COLORS.success : COLORS.danger }}>
                            {formatPercent(metrics.roiPercentage)}
                        </ROIValue>
                        <ROILabel>Return on Investment</ROILabel>
                    </ROIMetric>
                    <ROIMetric>
                        <ROIValue>
                            {typeof metrics.paybackPeriod === 'number'
                                ? `${formatNumber(metrics.paybackPeriod)} years`
                                : 'No payback'
                            }
                        </ROIValue>
                        <ROILabel>Payback Period</ROILabel>
                    </ROIMetric>
                </ROIGrid>
            </ROISummary>

            {/* Key Impact Metrics */}
            <SectionTitle>
                <SectionIcon color={COLORS.primary}>
                    <FiTrendingUp size={24} />
                </SectionIcon>
                Key Impact Metrics
            </SectionTitle>
            <GridLayout>
                <MetricCard color={COLORS.danger}>
                    <MetricValue color={COLORS.danger}>
                        <FiThermometer size={32} />
                        {formatNumber(metrics.temperatureReduction)}°C
                    </MetricValue>
                    <MetricLabel>Temperature Reduction</MetricLabel>
                    <MetricChange positive={metrics.temperatureReduction > 0}>
                        ↓ {formatPercent((metrics.temperatureReduction / 32.5) * 100)} improvement
                    </MetricChange>
                </MetricCard>

                <MetricCard color={COLORS.success}>
                    <MetricValue color={COLORS.success}>
                        <MdNature size={32} />
                        +{formatNumber(metrics.vegetationIncrease)}%
                    </MetricValue>
                    <MetricLabel>Vegetation Coverage</MetricLabel>
                    <MetricChange positive={true}>
                        ↗ Additional green space
                    </MetricChange>
                </MetricCard>

                <MetricCard color={COLORS.info}>
                    <MetricValue color={COLORS.info}>
                        <MdAir size={32} />
                        {formatNumber(metrics.carbonSequestration)} t/yr
                    </MetricValue>
                    <MetricLabel>CO2 Sequestration</MetricLabel>
                    <MetricChange positive={true}>
                        ↗ {formatCurrency(metrics.carbonSequestration * 50)}/year value
                    </MetricChange>
                </MetricCard>

                <MetricCard color={COLORS.purple}>
                    <MetricValue color={COLORS.purple}>
                        <FiDroplet size={32} />
                        {formatNumber(metrics.waterManagement / 1000)} k m³/yr
                    </MetricValue>
                    <MetricLabel>Water Management</MetricLabel>
                    <MetricChange positive={true}>
                        ↗ Stormwater capacity
                    </MetricChange>
                </MetricCard>
            </GridLayout>

            {/* Overall Performance Chart */}
            <ProfessionalChart>
                <ChartTitle>Overall Performance Over Time</ChartTitle>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="year"
                            tick={{ fontSize: 12 }}
                            label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis 
                            tick={{ fontSize: 12 }}
                            tickFormatter={formatNumber}
                            label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                            labelFormatter={(value) => `Year ${value}`}
                            formatter={(value, name) => [
                                name.includes('ROI') ? `${formatNumber(value)}%` : formatNumber(value),
                                name
                            ]}
                        />
                        <Line
                            type="monotone"
                            dataKey="roi"
                            stroke={COLORS.primary}
                            name="ROI %"
                            strokeWidth={3}
                            dot={{ fill: COLORS.primary, strokeWidth: 2, r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </ProfessionalChart>
        </TabContent>
    );

    const renderEnvironmentalTab = () => (
        <TabContent
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Environmental Metrics Grid */}
            <GridLayout style={{ marginBottom: '2rem' }}>
                <StatCard>
                    <StatValue color={COLORS.danger}>{formatNumber(metrics.temperatureReduction)}°C</StatValue>
                    <StatLabel>Temperature Reduction</StatLabel>
                    <StatSubtext>Compared to baseline conditions</StatSubtext>
                </StatCard>
                <StatCard>
                    <StatValue color={COLORS.success}>+{formatNumber(metrics.vegetationIncrease)}%</StatValue>
                    <StatLabel>Vegetation Increase</StatLabel>
                    <StatSubtext>Additional green coverage</StatSubtext>
                </StatCard>
                <StatCard>
                    <StatValue color={COLORS.info}>{formatNumber(metrics.carbonSequestration * 15)} tons</StatValue>
                    <StatLabel>Total CO2 Sequestered</StatLabel>
                    <StatSubtext>Over 15 years</StatSubtext>
                </StatCard>
                <StatCard>
                    <StatValue color={COLORS.purple}>{formatNumber(metrics.waterManagement / 1000)} k m³</StatValue>
                    <StatLabel>Annual Water Management</StatLabel>
                    <StatSubtext>Stormwater handling capacity</StatSubtext>
                </StatCard>
            </GridLayout>

            {/* Temperature & Vegetation Chart */}
            <ProfessionalChart>
                <ChartTitle>
                    <FiThermometer size={20} />
                    Temperature and Vegetation Changes Over Time
                </ChartTitle>
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="year"
                            tick={{ fontSize: 12 }}
                            label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis 
                            yAxisId="temp" 
                            orientation="left" 
                            tick={{ fontSize: 12 }}
                            tickFormatter={formatNumber}
                            label={{ value: 'Temperature Reduction (°C)', angle: -90, position: 'insideLeft' }}
                        />
                        <YAxis 
                            yAxisId="veg" 
                            orientation="right" 
                            tick={{ fontSize: 12 }}
                            tickFormatter={formatNumber}
                            label={{ value: 'Vegetation Increase (%)', angle: 90, position: 'insideRight' }}
                        />
                        <Tooltip
                            labelFormatter={(value) => `Year ${value}`}
                            formatter={(value, name) => [
                                name.includes('Temperature') ? `${formatNumber(value)}°C` :
                                    name.includes('Vegetation') ? `${formatNumber(value)}%` : formatNumber(value),
                                name
                            ]}
                        />
                        <Area
                            yAxisId="temp"
                            type="monotone"
                            dataKey="temperature"
                            stroke={COLORS.danger}
                            fill={COLORS.danger}
                            fillOpacity={0.2}
                            name="Temperature Reduction"
                            strokeWidth={3}
                        />
                        <Line
                            yAxisId="veg"
                            type="monotone"
                            dataKey="vegetation"
                            stroke={COLORS.success}
                            name="Vegetation Increase"
                            strokeWidth={3}
                            dot={{ fill: COLORS.success, strokeWidth: 2, r: 6 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </ProfessionalChart>

            {/* Carbon & Water Management Chart */}
            <ProfessionalChart>
                <ChartTitle>
                    <MdNature size={20} />
                    Carbon Sequestration and Water Management
                </ChartTitle>
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="year"
                            tick={{ fontSize: 12 }}
                            label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis 
                            yAxisId="carbon" 
                            orientation="left" 
                            tick={{ fontSize: 12 }}
                            tickFormatter={formatNumber}
                            label={{ value: 'Carbon Sequestration (t/yr)', angle: -90, position: 'insideLeft' }}
                        />
                        <YAxis 
                            yAxisId="water" 
                            orientation="right" 
                            tick={{ fontSize: 12 }}
                            tickFormatter={formatScientific}
                            label={{ value: 'Water Management (k m³/yr)', angle: 90, position: 'insideRight' }}
                        />
                        <Tooltip
                            labelFormatter={(value) => `Year ${value}`}
                            formatter={(value, name) => [
                                name.includes('Carbon') ? `${formatNumber(value)} t/yr` :
                                    name.includes('Water') ? `${formatNumber(value)} k m³/yr` : formatNumber(value),
                                name
                            ]}
                        />
                        <Line
                            yAxisId="carbon"
                            type="monotone"
                            dataKey="carbonSequestration"
                            stroke={COLORS.info}
                            name="Carbon Sequestration"
                            strokeWidth={3}
                            dot={{ fill: COLORS.info, strokeWidth: 2, r: 6 }}
                        />
                        <Line
                            yAxisId="water"
                            type="monotone"
                            dataKey="waterManaged"
                            stroke={COLORS.purple}
                            name="Water Management"
                            strokeWidth={3}
                            dot={{ fill: COLORS.purple, strokeWidth: 2, r: 6 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </ProfessionalChart>
        </TabContent>
    );

    const renderROITab = () => (
        <TabContent
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Financial Summary Grid */}
            <GridLayout style={{ marginBottom: '2rem' }}>
                <StatCard>
                    <StatValue color={COLORS.danger}>{formatCurrency(metrics.totalCosts)}</StatValue>
                    <StatLabel>Total Investment</StatLabel>
                    <StatSubtext>Implementation + maintenance costs</StatSubtext>
                </StatCard>
                <StatCard>
                    <StatValue color={COLORS.success}>{formatCurrency(metrics.totalBenefits)}</StatValue>
                    <StatLabel>Total Benefits</StatLabel>
                    <StatSubtext>Cumulative economic value</StatSubtext>
                </StatCard>
                <StatCard>
                    <StatValue color={metrics.roiPercentage > 0 ? COLORS.success : COLORS.danger}>
                        {formatPercent(metrics.roiPercentage)}
                    </StatValue>
                    <StatLabel>Return on Investment</StatLabel>
                    <StatSubtext>15-year ROI percentage</StatSubtext>
                </StatCard>
                <StatCard>
                    <StatValue color={COLORS.primary}>
                        {typeof metrics.paybackPeriod === 'number'
                            ? `${formatNumber(metrics.paybackPeriod)} years`
                            : 'No payback'
                        }
                    </StatValue>
                    <StatLabel>Payback Period</StatLabel>
                    <StatSubtext>Time to break even</StatSubtext>
                </StatCard>
            </GridLayout>

            {/* Cost-Benefit Analysis Chart */}
            <ProfessionalChart>
                <ChartTitle>
                    <FiDollarSign size={20} />
                    Cost-Benefit Analysis Over Time
                </ChartTitle>
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="year"
                            tick={{ fontSize: 12 }}
                            label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis 
                            tick={{ fontSize: 12 }}
                            tickFormatter={formatScientific}
                            label={{ value: 'Amount (BDT)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                            formatter={(value, name) => [formatCurrency(value), name]}
                            labelFormatter={(value) => `Year ${value}`}
                        />
                        <Bar dataKey="costs" fill={COLORS.danger} name="Total Costs" opacity={0.7} />
                        <Bar dataKey="benefits" fill={COLORS.success} name="Total Benefits" opacity={0.7} />
                        <Line
                            type="monotone"
                            dataKey="netBenefit"
                            stroke={COLORS.primary}
                            name="Net Benefit"
                            strokeWidth={4}
                            dot={{ fill: COLORS.primary, strokeWidth: 2, r: 6 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </ProfessionalChart>

            {/* Benefits Breakdown */}
            {benefitsData.length > 0 && (
                <ProfessionalChart>
                    <ChartTitle>
                        <FiTrendingUp size={20} />
                        Benefits Distribution
                    </ChartTitle>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={benefitsData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${formatNumber(percent * 100)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {benefitsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value, name) => [formatCurrency(value), name]}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ProfessionalChart>
            )}

            {/* Cash Flow Analysis */}
            <ProfessionalChart>
                <ChartTitle>
                    <FiCalendar size={20} />
                    Cumulative Cash Flow Analysis
                </ChartTitle>
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="year"
                            tick={{ fontSize: 12 }}
                            label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis 
                            tick={{ fontSize: 12 }}
                            tickFormatter={formatScientific}
                            label={{ value: 'Cash Flow (BDT)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                            labelFormatter={(value) => `Year ${value}`}
                            formatter={(value, name) => [formatCurrency(value), name]}
                        />
                        <Bar
                            dataKey="cumulativeCashFlow"
                            fill={COLORS.primary}
                            name="Cumulative Cash Flow"
                            opacity={0.8}
                        />
                        <Line
                            type="monotone"
                            dataKey="breakEvenLine"
                            stroke={COLORS.danger}
                            strokeDasharray="5 5"
                            name="Break Even Line"
                            strokeWidth={2}
                            dot={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </ProfessionalChart>
        </TabContent>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <Overlay
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <Modal
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Header>
                            <Title>Intervention Analysis Results</Title>
                            <HeaderActions>
                                <DownloadButton
                                    onClick={handleDownloadPDF}
                                    disabled={isDownloading}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FiDownload size={16} />
                                    {isDownloading ? 'Generating...' : 'Download PDF'}
                                </DownloadButton>
                                <CloseButton onClick={onClose}>
                                    <FiX size={20} />
                                </CloseButton>
                            </HeaderActions>
                        </Header>

                        <Content>
                            <TabContainer>
                                <Tab
                                    active={activeTab === 'summary'}
                                    onClick={() => setActiveTab('summary')}
                                >
                                    <FiTrendingUp size={18} />
                                    Summary
                                </Tab>
                                <Tab
                                    active={activeTab === 'environmental'}
                                    onClick={() => setActiveTab('environmental')}
                                >
                                    <MdNature size={18} />
                                    Environmental Impact
                                </Tab>
                                <Tab
                                    active={activeTab === 'roi'}
                                    onClick={() => setActiveTab('roi')}
                                >
                                    <FiDollarSign size={18} />
                                    Return on Investment
                                </Tab>
                            </TabContainer>

                            {activeTab === 'summary' && renderSummaryTab()}
                            {activeTab === 'environmental' && renderEnvironmentalTab()}
                            {activeTab === 'roi' && renderROITab()}
                        </Content>
                    </Modal>
                </Overlay>
            )}
        </AnimatePresence>
    );
};

export default InterventionResultsModal;