import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiMinus, FiHelpCircle } from 'react-icons/fi';
import { MdNature, MdBusiness, MdWater, MdSolarPower } from 'react-icons/md';

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
  max-width: 800px;
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

const Content = styled.div`
  padding: 2rem;
`;

const InterventionTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
`;

const InterventionTypeCard = styled(motion.div)`
  border: 2px solid ${props => props.selected ? '#667eea' : 'rgba(102, 126, 234, 0.2)'};
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  background: ${props => props.selected ? 'rgba(102, 126, 234, 0.1)' : 'white'};
  transition: all 0.2s ease;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }
`;

const TypeIcon = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: ${props => props.color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color};
`;

const TypeTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const ConfigSection = styled.div`
  margin-top: 2rem;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const HintTooltip = styled.div`
  position: relative;
  color: #64748b;
  cursor: help;
  
  &:hover .tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%);
  }
`;

const Tooltip = styled.div`
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
`;

const Button = styled(motion.button)`
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
`;

const CancelButton = styled(Button)`
  background: #f3f4f6;
  color: #374151;

  &:hover {
    background: #e5e7eb;
  }
`;

const ApplyButton = styled(Button)`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;

  &:hover {
    background: linear-gradient(135deg, #5a67d8, #6b46c1);
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }
`;

const INTERVENTION_TYPES = {
    'urban-forestry': {
        name: 'Urban Forestry',
        icon: MdNature,
        color: '#22c55e',
        description: 'Plant trees and create green corridors'
    },
    'green-roofs': {
        name: 'Green Roofs',
        icon: MdBusiness,
        color: '#10b981',
        description: 'Install vegetation on building rooftops'
    },
    'urban-wetlands': {
        name: 'Urban Wetlands',
        icon: MdWater,
        color: '#06b6d4',
        description: 'Create water bodies for ecosystem services'
    },
    'rooftop-solar': {
        name: 'Rooftop Solar + Reflective Coatings',
        icon: MdSolarPower,
        color: '#f59e0b',
        description: 'Solar panels with heat-reflective surfaces'
    }
};

const InterventionConfigModal = ({ isOpen, onClose, onApply, polygonArea }) => {
    const [selectedType, setSelectedType] = useState(null);
    const [config, setConfig] = useState({});

    const handleTypeSelect = (type) => {
        setSelectedType(type);
        setConfig(getDefaultConfig(type));
    };

    const getDefaultConfig = (type) => {
        const baseArea = polygonArea || 10000; // 10,000 m² default

        switch (type) {
            case 'urban-forestry':
                return {
                    numTrees: Math.floor(baseArea / 100), // 1 tree per 100 m²
                    treeType: 'native-mixed',
                    treeSize: 'medium',
                    costPerTree: 150,
                    maintenanceCostPerYear: 25,
                    plantingDensity: 100 // m² per tree
                };
            case 'green-roofs':
                return {
                    coverageArea: Math.floor(baseArea * 0.7), // 70% coverage
                    roofType: 'extensive',
                    plantType: 'sedum-mix',
                    costPerSqm: 120,
                    maintenanceCostPerSqm: 15,
                    soilDepth: 10 // cm
                };
            case 'urban-wetlands':
                return {
                    wetlandArea: Math.floor(baseArea * 0.3), // 30% of total area
                    waterDepth: 1.5, // meters
                    wetlandType: 'constructed',
                    costPerSqm: 200,
                    maintenanceCostPerSqm: 20,
                    waterSource: 'stormwater'
                };
            case 'rooftop-solar':
                return {
                    solarArea: Math.floor(baseArea * 0.6), // 60% coverage
                    panelEfficiency: 20, // %
                    reflectiveArea: Math.floor(baseArea * 0.3), // 30% reflective coating
                    costPerSqmSolar: 300,
                    costPerSqmReflective: 50,
                    maintenanceCostPerSqm: 10
                };
            default:
                return {};
        }
    };

    const updateConfig = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleApply = () => {
        if (selectedType && config) {
            onApply({
                type: selectedType,
                config: config,
                metadata: {
                    name: INTERVENTION_TYPES[selectedType].name,
                    description: INTERVENTION_TYPES[selectedType].description,
                    area: polygonArea
                }
            });
            onClose();
        }
    };

    const renderConfigForm = () => {
        if (!selectedType) return null;

        switch (selectedType) {
            case 'urban-forestry':
                return (
                    <ConfigSection>
                        <SectionTitle>Urban Forestry Configuration</SectionTitle>
                        <FormGrid>
                            <FormGroup>
                                <Label>
                                    Number of Trees
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Total number of trees to be planted in the selected area
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Input
                                    type="number"
                                    value={config.numTrees}
                                    onChange={(e) => updateConfig('numTrees', parseInt(e.target.value))}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>
                                    Tree Type
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Type of trees affects growth rate, carbon sequestration, and maintenance
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Select
                                    value={config.treeType}
                                    onChange={(e) => updateConfig('treeType', e.target.value)}
                                >
                                    <option value="native-mixed">Native Mixed Species</option>
                                    <option value="fruit-trees">Fruit Trees</option>
                                    <option value="shade-trees">Shade Trees</option>
                                    <option value="ornamental">Ornamental Trees</option>
                                </Select>
                            </FormGroup>
                            <FormGroup>
                                <Label>
                                    Tree Size at Planting
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Larger trees cost more but provide immediate benefits
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Select
                                    value={config.treeSize}
                                    onChange={(e) => updateConfig('treeSize', e.target.value)}
                                >
                                    <option value="sapling">Sapling (0.5-1m)</option>
                                    <option value="small">Small Tree (1-2m)</option>
                                    <option value="medium">Medium Tree (2-3m)</option>
                                    <option value="large">Large Tree (3m+)</option>
                                </Select>
                            </FormGroup>
                            <FormGroup>
                                <Label>
                                    Cost per Tree (৳)
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Includes tree cost, planting, and initial setup
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Input
                                    type="number"
                                    value={config.costPerTree}
                                    onChange={(e) => updateConfig('costPerTree', parseFloat(e.target.value))}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>
                                    Annual Maintenance Cost per Tree (৳)
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Yearly cost for watering, pruning, and tree care
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Input
                                    type="number"
                                    value={config.maintenanceCostPerYear}
                                    onChange={(e) => updateConfig('maintenanceCostPerYear', parseFloat(e.target.value))}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>
                                    Planting Density (m² per tree)
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Space allocated per tree - affects total number and growth
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Input
                                    type="number"
                                    value={config.plantingDensity}
                                    onChange={(e) => updateConfig('plantingDensity', parseFloat(e.target.value))}
                                />
                            </FormGroup>
                        </FormGrid>
                    </ConfigSection>
                );

            case 'green-roofs':
                return (
                    <ConfigSection>
                        <SectionTitle>Green Roof Configuration</SectionTitle>
                        <FormGrid>
                            <FormGroup>
                                <Label>
                                    Coverage Area (m²)
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Total roof area to be covered with vegetation
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Input
                                    type="number"
                                    value={config.coverageArea}
                                    onChange={(e) => updateConfig('coverageArea', parseFloat(e.target.value))}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>
                                    Roof Type
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Extensive roofs are lighter, intensive roofs support more vegetation
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Select
                                    value={config.roofType}
                                    onChange={(e) => updateConfig('roofType', e.target.value)}
                                >
                                    <option value="extensive">Extensive (Low maintenance)</option>
                                    <option value="intensive">Intensive (Garden-like)</option>
                                    <option value="semi-intensive">Semi-intensive (Mixed)</option>
                                </Select>
                            </FormGroup>
                            <FormGroup>
                                <Label>
                                    Plant Type
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Different plants provide different benefits and maintenance needs
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Select
                                    value={config.plantType}
                                    onChange={(e) => updateConfig('plantType', e.target.value)}
                                >
                                    <option value="sedum-mix">Sedum Mix (Drought resistant)</option>
                                    <option value="native-grasses">Native Grasses</option>
                                    <option value="wildflower-mix">Wildflower Mix</option>
                                    <option value="vegetable-garden">Vegetable Garden</option>
                                </Select>
                            </FormGroup>
                            <FormGroup>
                                <Label>
                                    Cost per m² (৳)
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Installation cost including substrate, plants, and waterproofing
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Input
                                    type="number"
                                    value={config.costPerSqm}
                                    onChange={(e) => updateConfig('costPerSqm', parseFloat(e.target.value))}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>
                                    Annual Maintenance Cost per m² (৳)
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Yearly maintenance including irrigation, fertilization, and plant replacement
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Input
                                    type="number"
                                    value={config.maintenanceCostPerSqm}
                                    onChange={(e) => updateConfig('maintenanceCostPerSqm', parseFloat(e.target.value))}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>
                                    Soil Depth (cm)
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Deeper soil supports more vegetation but increases weight and cost
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Input
                                    type="number"
                                    value={config.soilDepth}
                                    onChange={(e) => updateConfig('soilDepth', parseFloat(e.target.value))}
                                />
                            </FormGroup>
                        </FormGrid>
                    </ConfigSection>
                );

            case 'urban-wetlands':
                return (
                    <ConfigSection>
                        <SectionTitle>Urban Wetland Configuration</SectionTitle>
                        <FormGrid>
                            <FormGroup>
                                <Label>
                                    Wetland Area (m²)
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Total area dedicated to wetland ecosystem
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Input
                                    type="number"
                                    value={config.wetlandArea}
                                    onChange={(e) => updateConfig('wetlandArea', parseFloat(e.target.value))}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>
                                    Average Water Depth (m)
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Deeper wetlands support different species and provide more water storage
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={config.waterDepth}
                                    onChange={(e) => updateConfig('waterDepth', parseFloat(e.target.value))}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>
                                    Wetland Type
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Different types provide varying levels of water treatment and habitat
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Select
                                    value={config.wetlandType}
                                    onChange={(e) => updateConfig('wetlandType', e.target.value)}
                                >
                                    <option value="constructed">Constructed Wetland</option>
                                    <option value="retention-pond">Retention Pond</option>
                                    <option value="bioswale">Bioswale</option>
                                    <option value="living-shoreline">Living Shoreline</option>
                                </Select>
                            </FormGroup>
                            <FormGroup>
                                <Label>
                                    Cost per m² (৳)
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Construction cost including excavation, lining, and planting
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Input
                                    type="number"
                                    value={config.costPerSqm}
                                    onChange={(e) => updateConfig('costPerSqm', parseFloat(e.target.value))}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>
                                    Annual Maintenance Cost per m² (৳)
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Yearly maintenance including sediment removal and vegetation management
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Input
                                    type="number"
                                    value={config.maintenanceCostPerSqm}
                                    onChange={(e) => updateConfig('maintenanceCostPerSqm', parseFloat(e.target.value))}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>
                                    Water Source
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Water source affects sustainability and operational costs
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Select
                                    value={config.waterSource}
                                    onChange={(e) => updateConfig('waterSource', e.target.value)}
                                >
                                    <option value="stormwater">Stormwater Runoff</option>
                                    <option value="treated-wastewater">Treated Wastewater</option>
                                    <option value="groundwater">Groundwater</option>
                                    <option value="rainwater">Rainwater Harvesting</option>
                                </Select>
                            </FormGroup>
                        </FormGrid>
                    </ConfigSection>
                );

            case 'rooftop-solar':
                return (
                    <ConfigSection>
                        <SectionTitle>Rooftop Solar + Reflective Coating Configuration</SectionTitle>
                        <FormGrid>
                            <FormGroup>
                                <Label>
                                    Solar Panel Area (m²)
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Total roof area covered by solar panels
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Input
                                    type="number"
                                    value={config.solarArea}
                                    onChange={(e) => updateConfig('solarArea', parseFloat(e.target.value))}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>
                                    Panel Efficiency (%)
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Higher efficiency panels generate more electricity per unit area
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={config.panelEfficiency}
                                    onChange={(e) => updateConfig('panelEfficiency', parseFloat(e.target.value))}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>
                                    Reflective Coating Area (m²)
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Roof area covered with heat-reflective coating to reduce cooling costs
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Input
                                    type="number"
                                    value={config.reflectiveArea}
                                    onChange={(e) => updateConfig('reflectiveArea', parseFloat(e.target.value))}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>
                                    Solar Cost per m² (৳)
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Installation cost including panels, inverters, and electrical work
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Input
                                    type="number"
                                    value={config.costPerSqmSolar}
                                    onChange={(e) => updateConfig('costPerSqmSolar', parseFloat(e.target.value))}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>
                                    Reflective Coating Cost per m² (৳)
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Cost of heat-reflective coating application
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Input
                                    type="number"
                                    value={config.costPerSqmReflective}
                                    onChange={(e) => updateConfig('costPerSqmReflective', parseFloat(e.target.value))}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>
                                    Annual Maintenance Cost per m² (৳)
                                    <HintTooltip>
                                        <FiHelpCircle size={14} />
                                        <Tooltip className="tooltip">
                                            Yearly maintenance including cleaning and inspection
                                        </Tooltip>
                                    </HintTooltip>
                                </Label>
                                <Input
                                    type="number"
                                    value={config.maintenanceCostPerSqm}
                                    onChange={(e) => updateConfig('maintenanceCostPerSqm', parseFloat(e.target.value))}
                                />
                            </FormGroup>
                        </FormGrid>
                    </ConfigSection>
                );

            default:
                return null;
        }
    };

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
                            <Title>Configure Intervention</Title>
                            <CloseButton onClick={onClose}>
                                <FiX size={20} />
                            </CloseButton>
                        </Header>

                        <Content>
                            <InterventionTypeGrid>
                                {Object.entries(INTERVENTION_TYPES).map(([key, type]) => {
                                    const IconComponent = type.icon;
                                    return (
                                        <InterventionTypeCard
                                            key={key}
                                            selected={selectedType === key}
                                            onClick={() => handleTypeSelect(key)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <TypeIcon color={type.color}>
                                                <IconComponent size={28} />
                                            </TypeIcon>
                                            <TypeTitle>{type.name}</TypeTitle>
                                        </InterventionTypeCard>
                                    );
                                })}
                            </InterventionTypeGrid>

                            {renderConfigForm()}

                            <ButtonGroup>
                                <CancelButton
                                    onClick={onClose}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Cancel
                                </CancelButton>
                                <ApplyButton
                                    disabled={!selectedType}
                                    onClick={handleApply}
                                    whileHover={selectedType ? { scale: 1.02 } : {}}
                                    whileTap={selectedType ? { scale: 0.98 } : {}}
                                >
                                    Apply Intervention
                                </ApplyButton>
                            </ButtonGroup>
                        </Content>
                    </Modal>
                </Overlay>
            )}
        </AnimatePresence>
    );
};

export default InterventionConfigModal;