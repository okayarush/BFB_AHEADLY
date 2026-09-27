import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMapPin, FiThermometer, FiTrendingUp, FiHelpCircle, FiDownload } from 'react-icons/fi';
import { MdNature } from 'react-icons/md';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { generateAnalysisPDF } from '../utils/pdfGenerator';

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
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
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

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
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

const Content = styled.div`
  padding: 2rem;
`;

// Loading spinner animation
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #10b981;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 2rem;
`;

const LoadingText = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 0.5rem;
`;

const LoadingSubtext = styled.div`
  color: rgba(102, 126, 234, 0.8);
  font-size: 0.875rem;
  max-width: 400px;
  line-height: 1.5;
`;

// Results Components
const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const MetricCard = styled(motion.div)`
  background: ${props => props.gradient || 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'};
  border-radius: 15px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 12px -2px rgba(0, 0, 0, 0.15);
  }
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const HintIcon = styled.div`
  position: relative;
  color: #64748b;
  cursor: help;
  margin-left: auto;
  
  &:hover .tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateX(-80%);
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

const MetricIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.color || '#10b981'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const MetricTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.color || '#1e293b'};
  margin-bottom: 0.5rem;
`;

const MetricUnit = styled.span`
  font-size: 1rem;
  font-weight: normal;
  color: #64748b;
`;

const MetricSubtext = styled.div`
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const MinMaxMeanChart = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1rem;
`;

const StatChart = styled.div`
  text-align: center;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid ${props => props.color}30;
`;

const StatChartValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.color};
  margin-bottom: 0.25rem;
`;

const StatChartLabel = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
`;

const StatChartBar = styled.div`
  height: 3px;
  background: ${props => props.color}20;
  border-radius: 2px;
  margin: 0.5rem 0;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.percentage}%;
    background: ${props => props.color};
    border-radius: 2px;
    transition: width 0.5s ease-out;
  }
`;

const ChartContainer = styled.div`
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
`;

const SummarySection = styled.div`
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 15px;
  padding: 2rem;
  margin-top: 2rem;
  border: 1px solid #bbf7d0;
`;

const SummaryTitle = styled.h3`
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
`;

const SummaryText = styled.p`
  color: #374151;
  line-height: 1.6;
  margin: 0;
`;

const COLORS = {
    primary: '#667eea',
    secondary: '#764ba2',
    warning: '#f093fb',
    danger: '#2d1b69',
    info: '#1a1a3e',
    success: '#667eea'
};

const AnalysisModal = ({ isOpen, onClose, isLoading, data, coordinates }) => {
    const [displayData, setDisplayData] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (data && !isLoading) {
            console.log('AnalysisModal received data:', data);
            setDisplayData(data);
        }
    }, [data, isLoading]);

    const handleDownloadPDF = async () => {
        if (!displayData) return;
        
        setIsDownloading(true);
        try {
            await generateAnalysisPDF(displayData, coordinates);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const formatValue = (value, unit = '') => {
        if (value === null || value === undefined) return 'N/A';
        if (typeof value === 'number') {
            return value.toFixed(2) + unit;
        }
        return value;
    };

    const getMetricColor = (type, value) => {
        switch (type) {
            case 'temperature':
                if (value === null || value === undefined) return COLORS.info;
                const tempC = value - 273.15; // Convert from Kelvin
                if (tempC > 32) return COLORS.danger;
                if (tempC > 28) return COLORS.warning;
                return COLORS.success;

            case 'vegetation':
                if (value === null || value === undefined) return COLORS.info;
                if (value > 50) return COLORS.success;
                if (value > 25) return COLORS.warning;
                return COLORS.danger;

            case 'elevation':
                return COLORS.secondary;

            default:
                return COLORS.primary;
        }
    };

    const getStatusText = (type, value) => {
        switch (type) {
            case 'temperature':
                if (value === null || value === undefined) return 'No data';
                const tempC = value - 273.15;
                if (tempC > 32) return 'Very Hot';
                if (tempC > 28) return 'Hot';
                if (tempC > 25) return 'Warm';
                return 'Moderate';

            case 'vegetation':
                if (value === null || value === undefined) return 'No data';
                if (value > 50) return 'High Coverage';
                if (value > 25) return 'Moderate Coverage';
                return 'Low Coverage';

            case 'elevation':
                if (value === null || value === undefined) return 'No data';
                if (value > 50) return 'High Elevation';
                if (value > 20) return 'Moderate Elevation';
                return 'Low Elevation';

            default:
                return 'Normal';
        }
    };

    const getTooltipText = (type) => {
        switch (type) {
            case 'area':
                return 'Total area and perimeter of the selected polygon region based on geographic coordinates.';
            case 'temperature':
                return 'Land surface temperature data from NASA satellites, showing thermal characteristics of the area.';
            case 'vegetation':
                return 'NDVI-based vegetation analysis showing green space coverage and vegetation health indicators.';
            case 'elevation':
                return 'Digital elevation model data showing height above sea level and terrain characteristics.';
            default:
                return 'Environmental data analysis';
        }
    };

    const getMinMaxPercentages = (min, max, mean) => {
        if (min === null || max === null || mean === null) return { minP: 0, maxP: 100, meanP: 50 };
        const range = max - min;
        if (range === 0) return { minP: 50, maxP: 50, meanP: 50 };
        return {
            minP: 0,
            maxP: 100,
            meanP: ((mean - min) / range) * 100
        };
    };

    const renderMetrics = () => {
        // Handle multiple possible data structures
        let analysis = null;

        if (displayData?.analysis_results?.[0]?.analysis) {
            analysis = displayData.analysis_results[0].analysis;
        } else if (displayData?.analysis_results?.[0]) {
            analysis = displayData.analysis_results[0];
        } else if (displayData?.data?.analysis_results?.[0]?.analysis) {
            analysis = displayData.data.analysis_results[0].analysis;
        } else if (displayData?.data?.analysis_results?.[0]) {
            analysis = displayData.data.analysis_results[0];
        } else if (displayData?.analysis) {
            analysis = displayData.analysis;
        }

        if (!analysis) return null;

        const geometry = analysis.geometry_info;

        // Calculate colors based on values
        const tempC = analysis.temperature?.mean ? analysis.temperature.mean - 273.15 : null;
        const tempColor = getMetricColor('temperature', analysis.temperature?.mean);
        const vegColor = getMetricColor('vegetation', analysis.vegetation?.green_area_percent);
        const elevColor = getMetricColor('elevation', analysis.elevation?.mean);

        const tempPercentages = getMinMaxPercentages(
            analysis.temperature?.min ? analysis.temperature.min - 273.15 : null,
            analysis.temperature?.max ? analysis.temperature.max - 273.15 : null,
            tempC
        );

        const vegPercentages = getMinMaxPercentages(
            analysis.vegetation?.min,
            analysis.vegetation?.max,
            analysis.vegetation?.mean
        );

        const elevPercentages = getMinMaxPercentages(
            analysis.elevation?.min,
            analysis.elevation?.max,
            analysis.elevation?.mean
        );

        return (
            <ResultsGrid>
                <MetricCard
                    gradient={`linear-gradient(135deg, ${COLORS.info}20 0%, ${COLORS.info}30 100%)`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
                >
                    <MetricHeader>
                        <MetricIcon color={COLORS.info}>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.3 }}
                            >
                                <FiMapPin size={20} />
                            </motion.div>
                        </MetricIcon>
                        <MetricTitle>Area Analysis</MetricTitle>
                        <HintIcon>
                            <FiHelpCircle size={16} />
                            <HintTooltip className="tooltip">
                                {getTooltipText('area')}
                            </HintTooltip>
                        </HintIcon>
                    </MetricHeader>
                    <MetricValue color={COLORS.info}>
                        {formatValue(geometry?.area_km2)} <MetricUnit>km²</MetricUnit>
                    </MetricValue>
                    <MetricSubtext>
                        Total analyzed area with {formatValue(geometry?.perimeter_m / 1000, ' km')} perimeter
                    </MetricSubtext>
                    <MinMaxMeanChart>
                        <StatChart color={COLORS.info}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.3 }}
                            >
                                <StatChartValue color={COLORS.info}>
                                    {formatValue(geometry?.area_m2)}
                                </StatChartValue>
                                <StatChartLabel>Area (m²)</StatChartLabel>
                            </motion.div>
                        </StatChart>
                        <StatChart color={COLORS.info}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.3 }}
                            >
                                <StatChartValue color={COLORS.info}>
                                    {formatValue(geometry?.perimeter_m / 1000, ' km')}
                                </StatChartValue>
                                <StatChartLabel>Perimeter</StatChartLabel>
                            </motion.div>
                        </StatChart>
                        <StatChart color={COLORS.info}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7, duration: 0.3 }}
                            >
                                <StatChartValue color={COLORS.info}>
                                    <div
                                        style={{
                                            width: "24px",
                                            height: "24px",
                                            borderRadius: "4px",
                                            background: COLORS.info,
                                            margin: "0 auto 8px",
                                            opacity: 0.8
                                        }}
                                    />
                                    Polygon
                                </StatChartValue>
                                <StatChartLabel>Shape</StatChartLabel>
                            </motion.div>
                        </StatChart>
                    </MinMaxMeanChart>
                </MetricCard>

                <MetricCard
                    gradient={`linear-gradient(135deg, ${tempColor}20 0%, ${tempColor}30 100%)`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
                >
                    <MetricHeader>
                        <MetricIcon color={tempColor}>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.3 }}
                            >
                                <FiThermometer size={20} />
                            </motion.div>
                        </MetricIcon>
                        <MetricTitle>Temperature</MetricTitle>
                        <HintIcon>
                            <FiHelpCircle size={16} />
                            <HintTooltip className="tooltip">
                                {getTooltipText('temperature')}
                            </HintTooltip>
                        </HintIcon>
                    </MetricHeader>
                    <MetricValue color={tempColor}>
                        {tempC ? formatValue(tempC) : 'N/A'} <MetricUnit>°C</MetricUnit>
                    </MetricValue>
                    <MetricSubtext>
                        Average land surface temperature - {getStatusText('temperature', tempC)}
                    </MetricSubtext>
                    <MinMaxMeanChart>
                        <StatChart color={tempColor}>
                            <StatChartValue color={tempColor}>
                                {analysis.temperature?.min ? formatValue(analysis.temperature.min - 273.15) : 'N/A'}
                            </StatChartValue>
                            <StatChartLabel>Min (°C)</StatChartLabel>
                            <StatChartBar color={tempColor} percentage={tempPercentages.minP} />
                        </StatChart>
                        <StatChart color={tempColor}>
                            <StatChartValue color={tempColor}>
                                {tempC ? formatValue(tempC) : 'N/A'}
                            </StatChartValue>
                            <StatChartLabel>Mean (°C)</StatChartLabel>
                            <StatChartBar color={tempColor} percentage={tempPercentages.meanP} />
                        </StatChart>
                        <StatChart color={tempColor}>
                            <StatChartValue color={tempColor}>
                                {analysis.temperature?.max ? formatValue(analysis.temperature.max - 273.15) : 'N/A'}
                            </StatChartValue>
                            <StatChartLabel>Max (°C)</StatChartLabel>
                            <StatChartBar color={tempColor} percentage={tempPercentages.maxP} />
                        </StatChart>
                    </MinMaxMeanChart>
                </MetricCard>

                <MetricCard
                    gradient={`linear-gradient(135deg, ${vegColor}20 0%, ${vegColor}30 100%)`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
                >
                    <MetricHeader>
                        <MetricIcon color={vegColor}>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.3 }}
                            >
                                <MdNature size={20} />
                            </motion.div>
                        </MetricIcon>
                        <MetricTitle>Vegetation</MetricTitle>
                        <HintIcon>
                            <FiHelpCircle size={16} />
                            <HintTooltip className="tooltip">
                                {getTooltipText('vegetation')}
                            </HintTooltip>
                        </HintIcon>
                    </MetricHeader>
                    <MetricValue color={vegColor}>
                        {formatValue(analysis.vegetation?.green_area_percent)} <MetricUnit>%</MetricUnit>
                    </MetricValue>
                    <MetricSubtext>
                        Green space coverage - {getStatusText('vegetation', analysis.vegetation?.green_area_percent)}
                    </MetricSubtext>
                    <MinMaxMeanChart>
                        <StatChart color={vegColor}>
                            <StatChartValue color={vegColor}>
                                {formatValue(analysis.vegetation?.min)}
                            </StatChartValue>
                            <StatChartLabel>Min NDVI</StatChartLabel>
                            <StatChartBar color={vegColor} percentage={vegPercentages.minP} />
                        </StatChart>
                        <StatChart color={vegColor}>
                            <StatChartValue color={vegColor}>
                                {formatValue(analysis.vegetation?.mean)}
                            </StatChartValue>
                            <StatChartLabel>Mean NDVI</StatChartLabel>
                            <StatChartBar color={vegColor} percentage={vegPercentages.meanP} />
                        </StatChart>
                        <StatChart color={vegColor}>
                            <StatChartValue color={vegColor}>
                                {formatValue(analysis.vegetation?.max)}
                            </StatChartValue>
                            <StatChartLabel>Max NDVI</StatChartLabel>
                            <StatChartBar color={vegColor} percentage={vegPercentages.maxP} />
                        </StatChart>
                    </MinMaxMeanChart>
                </MetricCard>

                <MetricCard
                    gradient={`linear-gradient(135deg, ${elevColor}20 0%, ${elevColor}30 100%)`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
                >
                    <MetricHeader>
                        <MetricIcon color={elevColor}>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.3 }}
                            >
                                <FiTrendingUp size={20} />
                            </motion.div>
                        </MetricIcon>
                        <MetricTitle>Elevation</MetricTitle>
                        <HintIcon>
                            <FiHelpCircle size={16} />
                            <HintTooltip className="tooltip">
                                {getTooltipText('elevation')}
                            </HintTooltip>
                        </HintIcon>
                    </MetricHeader>
                    <MetricValue color={elevColor}>
                        {formatValue(analysis.elevation?.mean)} <MetricUnit>m</MetricUnit>
                    </MetricValue>
                    <MetricSubtext>
                        Average elevation above sea level - {getStatusText('elevation', analysis.elevation?.mean)}
                    </MetricSubtext>
                    <MinMaxMeanChart>
                        <StatChart color={elevColor}>
                            <StatChartValue color={elevColor}>
                                {formatValue(analysis.elevation?.min)}
                            </StatChartValue>
                            <StatChartLabel>Min (m)</StatChartLabel>
                            <StatChartBar color={elevColor} percentage={elevPercentages.minP} />
                        </StatChart>
                        <StatChart color={elevColor}>
                            <StatChartValue color={elevColor}>
                                {formatValue(analysis.elevation?.mean)}
                            </StatChartValue>
                            <StatChartLabel>Mean (m)</StatChartLabel>
                            <StatChartBar color={elevColor} percentage={elevPercentages.meanP} />
                        </StatChart>
                        <StatChart color={elevColor}>
                            <StatChartValue color={elevColor}>
                                {formatValue(analysis.elevation?.max)}
                            </StatChartValue>
                            <StatChartLabel>Max (m)</StatChartLabel>
                            <StatChartBar color={elevColor} percentage={elevPercentages.maxP} />
                        </StatChart>
                    </MinMaxMeanChart>
                </MetricCard>
            </ResultsGrid>
        );
    };

    const renderCharts = () => {
        // Handle multiple possible data structures
        let analysis = null;

        if (displayData?.analysis_results?.[0]?.analysis) {
            analysis = displayData.analysis_results[0].analysis;
        } else if (displayData?.analysis_results?.[0]) {
            analysis = displayData.analysis_results[0];
        } else if (displayData?.data?.analysis_results?.[0]?.analysis) {
            analysis = displayData.data.analysis_results[0].analysis;
        } else if (displayData?.data?.analysis_results?.[0]) {
            analysis = displayData.data.analysis_results[0];
        } else if (displayData?.analysis) {
            analysis = displayData.analysis;
        }

        if (!analysis) return null;

        // Environmental metrics bar chart
        const environmentalData = [
            {
                name: 'Elevation',
                value: analysis.elevation?.mean || 0,
                color: getMetricColor('elevation', analysis.elevation?.mean),
                unit: 'm'
            },
            {
                name: 'Temperature',
                value: analysis.temperature?.mean ? (analysis.temperature.mean - 273.15) : 0,
                color: getMetricColor('temperature', analysis.temperature?.mean),
                unit: '°C'
            },
            {
                name: 'Green Coverage',
                value: analysis.vegetation?.green_area_percent || 0,
                color: getMetricColor('vegetation', analysis.vegetation?.green_area_percent),
                unit: '%'
            }
        ];

        // Green space pie chart
        const greenSpaceData = [
            {
                name: 'Green Area',
                value: analysis.vegetation?.green_area_percent || 0,
                fill: getMetricColor('vegetation', analysis.vegetation?.green_area_percent)
            },
            {
                name: 'Non-Green Area',
                value: 100 - (analysis.vegetation?.green_area_percent || 0),
                fill: '#e5e7eb'
            }
        ];

        return (
            <ResultsGrid>
                <ChartContainer>
                    <ChartTitle>Environmental Metrics Overview</ChartTitle>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={environmentalData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                interval={0}
                            />
                            <YAxis />
                            <Tooltip formatter={(value, name) => [
                                `${value.toFixed(2)} ${environmentalData.find(d => d.name === name)?.unit || ''}`,
                                name
                            ]} />
                            <Bar dataKey="value">
                                {environmentalData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer>
                    <ChartTitle>Green Space Distribution</ChartTitle>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={greenSpaceData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {greenSpaceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, '']} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </ResultsGrid>
        );
    };

    const generateSummary = () => {
        // Handle multiple possible data structures
        let analysis = null;

        if (displayData?.analysis_results?.[0]?.analysis) {
            analysis = displayData.analysis_results[0].analysis;
        } else if (displayData?.analysis_results?.[0]) {
            analysis = displayData.analysis_results[0];
        } else if (displayData?.data?.analysis_results?.[0]?.analysis) {
            analysis = displayData.data.analysis_results[0].analysis;
        } else if (displayData?.data?.analysis_results?.[0]) {
            analysis = displayData.data.analysis_results[0];
        } else if (displayData?.analysis) {
            analysis = displayData.analysis;
        }

        if (!analysis) {
            console.log('Debug: displayData structure:', displayData);
            return "Analysis data not available.";
        }

        const area = analysis.geometry_info?.area_km2 || 0;
        const greenPercent = analysis.vegetation?.green_area_percent || 0;
        const temp = analysis.temperature?.mean ? (analysis.temperature.mean - 273.15).toFixed(1) : 'N/A';
        const elevation = analysis.elevation?.mean || 0;

        let summary = `This ${area.toFixed(2)} km² area analysis shows `;

        // Vegetation assessment
        if (greenPercent > 50) {
            summary += `excellent vegetation coverage at ${greenPercent.toFixed(1)}%, `;
        } else if (greenPercent > 25) {
            summary += `moderate vegetation coverage at ${greenPercent.toFixed(1)}%, `;
        } else {
            summary += `limited vegetation coverage at ${greenPercent.toFixed(1)}%, `;
        }

        // Temperature assessment
        if (temp !== 'N/A') {
            if (parseFloat(temp) > 32) {
                summary += `with concerning high temperatures averaging ${temp}°C, `;
            } else if (parseFloat(temp) > 28) {
                summary += `with elevated temperatures averaging ${temp}°C, `;
            } else {
                summary += `with moderate temperatures averaging ${temp}°C, `;
            }
        }

        // Elevation assessment
        summary += `and an average elevation of ${elevation.toFixed(1)}m above sea level. `;

        // Recommendations based on conditions
        if (greenPercent < 25) {
            summary += "Increasing green spaces would help reduce urban heat effects and improve air quality. ";
        }

        if (elevation < 10) {
            summary += "The low elevation indicates potential flood risk during heavy rainfall events. ";
        }

        if (greenPercent > 50) {
            summary += "The high vegetation coverage contributes positively to air quality and natural cooling. ";
        }

        summary += "Consider implementing targeted environmental improvements based on these findings.";

        return summary;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <Overlay
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={onClose}
                >
                    <Modal
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Header>
                            <Title>
                                {isLoading ? 'Analyzing Current Situation...' : 'Environmental Analysis Results'}
                            </Title>
                            <HeaderActions>
                                {!isLoading && displayData && (
                                    <DownloadButton
                                        onClick={handleDownloadPDF}
                                        disabled={isDownloading}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <FiDownload size={16} />
                                        {isDownloading ? 'Generating...' : 'Download PDF'}
                                    </DownloadButton>
                                )}
                                <CloseButton onClick={onClose}>
                                    <FiX size={20} />
                                </CloseButton>
                            </HeaderActions>
                        </Header>

                        <Content>
                            {isLoading ? (
                                <LoadingContainer>
                                    <Spinner />
                                    <LoadingText>Processing Environmental Data</LoadingText>
                                    <LoadingSubtext>
                                        We're analyzing your selected area using NASA satellite data including
                                        elevation, vegetation indices, and land surface temperature.
                                        This usually takes 10-30 seconds.
                                    </LoadingSubtext>
                                </LoadingContainer>
                            ) : displayData ? (
                                <>
                                    {renderMetrics()}
                                    {renderCharts()}
                                    <SummarySection>
                                        <SummaryTitle>Environmental Assessment Summary</SummaryTitle>
                                        <SummaryText>{generateSummary()}</SummaryText>
                                    </SummarySection>
                                </>
                            ) : (
                                <LoadingContainer>
                                    <LoadingText>No Data Available</LoadingText>
                                    <LoadingSubtext>
                                        Unable to process the analysis. Please try drawing a new area and running the analysis again.
                                    </LoadingSubtext>
                                </LoadingContainer>
                            )}
                        </Content>
                    </Modal>
                </Overlay>
            )}
        </AnimatePresence>
    );
};

export default AnalysisModal;