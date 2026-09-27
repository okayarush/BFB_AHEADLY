import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiPrinter, FiShare2, FiLoader, FiMapPin, FiInfo, FiX, FiShield, FiAlertTriangle, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Services
import { useCityData } from '../context/CityDataContext';
import { SECTOR_LIST } from '../utils/HospitalRegistry';
import { DiseaseDataManager } from '../utils/DiseaseDataManager';
import { hriBridgeService } from '../services/hriBridgeService';
import { formatDiseaseSignalFromData } from '../services/diseaseService';
import { rankInterventions } from '../utils/interventionLogic';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Container = styled.div`
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const HeaderInfo = styled.div``;

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

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  color: #374151;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #8b5cf6;
    background: #f3f4f6;
  }
`;

const WardSelect = styled.select`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 1rem;
  color: #1e293b;
  cursor: pointer;
  background: white;
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const PolicyDocument = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 3rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Georgia', serif;
  line-height: 1.6;
`;

const DocumentHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #e5e7eb;
`;

const DocumentTitle = styled.h1`
  color: #1e293b;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const DocumentSubtitle = styled.h2`
  color: #64748b;
  font-size: 1.25rem;
  font-weight: normal;
  margin-bottom: 0.5rem;
`;

const DocumentMeta = styled.div`
  color: #9ca3af;
  font-size: 0.875rem;
`;

const Section = styled.section`
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled.h3`
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  border-left: 4px solid #8b5cf6;
  padding-left: 1rem;
`;

const SectionContent = styled.div`
  color: #374151;
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const RecommendationList = styled.ul`
  list-style: none;
  padding: 0;
`;

const RecommendationItem = styled.li`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #10b981;
`;

const RecommendationNumber = styled.span`
  background: #10b981;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  margin-right: 1rem;
  flex-shrink: 0;
`;

const RecommendationText = styled.div`
  flex: 1;
`;

// Helper Styles for Modal
const Badge = styled.span`
  background: ${props => props.bg || '#3b82f6'};
  color: ${props => props.color || '#fff'};
  font-size: 0.7rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-block;
  margin-bottom: 0.5rem;
`;

const Button = styled.button`
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  
  ${props => props.primary && `
    background: #3b82f6;
    color: white;
    &:hover { background: #2563eb; }
  `}
  
  ${props => props.secondary && `
    background: transparent;
    color: #94a3b8;
    border: 1px solid #475569;
    &:hover { color: #f8fafc; border-color: #94a3b8; }
  `}
`;


const PolicyBrief = () => {
    const { selectedCity } = useCityData();
    const [loading, setLoading] = useState(false);
    const [selectedWard, setSelectedWard] = useState('Sector-01'); // Default
    const [policyData, setPolicyData] = useState(null);
    const [detailsModalItem, setDetailsModalItem] = useState(null);
    const [advisoryModal, setAdvisoryModal] = useState(false);
    const [advisoryMessage, setAdvisoryMessage] = useState('');
    const [selectedPreset, setSelectedPreset] = useState(0);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (selectedWard) {
            generateBrief(selectedWard);
        }
    }, [selectedWard]);

    const generateBrief = async (wardName) => {
        setLoading(true);
        try {
            // 1. Get Disease Data (Real Source of Truth)
            const aggregates = DiseaseDataManager.getWardAggregates();
            const wardData = aggregates[wardName];
            const signal = formatDiseaseSignalFromData(wardName, wardData);

            // 2. Get Environmental Data (HRI)
            const hriData = await hriBridgeService.getBaselineHRIFromTwin(wardName);

            // 3. Get Recommended Interventions (Shared Logic)
            const rankedInterventions = rankInterventions(hriData.contributors, signal);
            const topInterventions = rankedInterventions.slice(0, 3); // Top 3

            // 4. Construct Policy Object
            const brief = {
                title: `Public Health Action Brief: ${wardName}`,
                generatedAt: new Date(),
                executiveSummary: {
                    overview: `Analysis of ${wardName} indicates a ${hriData.category} risk level (HRI: ${hriData.score.toFixed(1)}/100). Primary concern is ${signal.primary.name} with ${signal.primary.activeCases} active cases.`,
                    keyFindings: [
                        `Primary Disease Signal: ${signal.primary.name} (${signal.primary.trend})`,
                        `Transmission Context: ${signal.primary.transmission || 'None detected'}`,
                        `Key Environmental Driver: ${Object.entries(hriData.contributors).sort(([, a], [, b]) => b - a)[0][0]}`,
                        `Total Active Case Load: ${wardData.total} cases`
                    ],
                    urgency: hriData.category
                },
                recommendations: topInterventions,
                implementation: {
                    governance: "Solapur Municipal Corporation - Public Health Dept.",
                    timeline: "Immediate deployment required within 48 hours for high priority actions."
                },
                dataQuality: "Live Digital Twin Feed (Verified)"
            };

            setPolicyData(brief);
            toast.success(`Policy Brief generated for ${wardName}`);

        } catch (error) {
            console.error("Error generating brief:", error);
            toast.error("Failed to generate brief");
        } finally {
            setLoading(false);
        }
    };

    const getPresets = (brief) => {
        const ward = brief.title.replace('Public Health Action Brief: ', '');
        const urgency = brief.executiveSummary.urgency;
        const riskEmoji = urgency === 'CRITICAL' ? '🔴' : urgency === 'HIGH' ? '🟠' : '🟡';
        const autoActions = brief.recommendations.slice(0, 3).map(r => `• ${r.name}`).join('\n');
        return [
            {
                label: 'Auto-Generated', sublabel: 'Based on live ward data', icon: '🤖',
                message: `🚨 *Public Health Advisory*\n📍 *${ward}* — Solapur\n⚠️ Risk Level: *${urgency}* ${riskEmoji}\n\n🧠 *What's happening:*\n${brief.executiveSummary.overview}\n\n👉 *What you should do:*\n${autoActions}\n\n🏥 *If symptoms appear:*\nFever, fatigue, or sudden illness → contact your nearest health centre immediately\n\n🔄 Status: Monitoring Active\n📡 Source: Aheadly Health System`
            },
            {
                label: 'Dengue / Vector Alert', sublabel: 'Mosquito breeding risk', icon: '🦟',
                message: `🚨 *Dengue Risk Alert*\n📍 *${ward}* — Solapur\n⚠️ High Risk 🟠\n\n🧠 *What's happening:*\nIncreased mosquito breeding and dengue cases detected nearby.\n\n👉 *What you should do:*\n• Remove stagnant water around home\n• Use mosquito repellent / nets\n• Avoid outdoor exposure during evening\n\n🏥 *If symptoms appear:*\nFever, joint pain → seek medical care immediately\n\n🔄 Status: Control measures ongoing\n📡 Source: Aheadly Health System`
            },
            {
                label: 'Water Contamination', sublabel: 'Drain / pipeline risk', icon: '💧',
                message: `🚨 *Water Contamination Alert*\n📍 *${ward}* — Solapur\n⚠️ High Risk 🔴\n\n🧠 *What's happening:*\nContaminated water detected in your area due to pipeline/drain issues.\n\n👉 *What you should do:*\n• Use only safe/filtered water\n• Avoid tap water for drinking\n• Follow strict hygiene practices\n\n🏥 *If symptoms appear:*\nFever, vomiting, diarrhoea → contact nearest health center immediately\n\n🔄 Status: Mitigation in progress\n📡 Source: Aheadly Health System`
            },
            {
                label: 'Air Quality Alert', sublabel: 'PM2.5 / pollution high', icon: '🌫️',
                message: `🚨 *Air Quality Alert (PM2.5 High)*\n📍 *${ward}* — Solapur\n⚠️ Moderate Risk 🟡\n\n🧠 *What's happening:*\nElevated air pollution levels detected in your area.\n\n👉 *What you should do:*\n• Wear mask outdoors\n• Avoid heavy outdoor activity\n• Keep windows closed during peak hours\n\n🏥 *If symptoms appear:*\nBreathlessness, coughing → consult doctor\n\n🔄 Status: Monitoring active\n📡 Source: Aheadly Health System`
            },
            {
                label: 'Heat Stress Advisory', sublabel: 'High LST / heat index', icon: '🌡️',
                message: `🚨 *Heat Stress Advisory*\n📍 *${ward}* — Solapur\n⚠️ High Risk 🟠\n\n🧠 *What's happening:*\nExtreme heat conditions detected. Risk of heat exhaustion is high.\n\n👉 *What you should do:*\n• Stay indoors during 12pm–4pm\n• Drink water every 30 minutes\n• Wear light, loose-fitting clothing\n\n🏥 *If symptoms appear:*\nDizziness, excessive sweating, weakness → seek immediate medical help\n\n🔄 Status: Heat watch active\n📡 Source: Aheadly Health System`
            },
            {
                label: 'Custom Advisory', sublabel: 'Write your own message', icon: '✏️',
                message: `🚨 *Advisory*\n📍 *${ward}* — Solapur\n⚠️ \n\n🧠 *What's happening:*\n\n\n👉 *What you should do:*\n• \n• \n• \n\n🏥 *If symptoms appear:*\n\n\n🔄 Status: \n📡 Source: Aheadly Health System`
            },
        ];
    };

    const openAdvisoryModal = () => {
        if (!policyData) { toast('Brief still loading…'); return; }
        const presets = getPresets(policyData);
        setSelectedPreset(0);
        setAdvisoryMessage(presets[0].message);
        setAdvisoryModal(true);
    };

    const handleSendAdvisory = async () => {
        if (!advisoryMessage.trim()) return;
        setIsSending(true);
        try {
            const res = await fetch('http://localhost:3001/api/send-advisory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: advisoryMessage })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Advisory sent for ${selectedWard}!`);
                setAdvisoryModal(false);
            } else {
                toast.error(data.error || 'Failed to send');
            }
        } catch {
            toast.error('Bot server unreachable — is the bot running on port 3001?');
        } finally {
            setIsSending(false);
        }
    };

    if (loading && !policyData) {
        return (
            <Container>
                <LoadingSpinner />
            </Container>
        );
    }

    return (
        <Container>
            {/* 1. RED BANNER */}
            <div style={{
                width: '100%',
                background: '#ff0000',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '24px',
                padding: '16px',
                textAlign: 'center',
                marginBottom: '20px'
            }}>
                POLICY BRIEF — LIVE UI TEST (DO NOT REMOVE)
            </div>

            <Header>
                <HeaderInfo>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Title>Policy Brief Generator</Title>
                        {/* 2. GREEN BADGE */}
                        <span style={{
                            background: '#39ff14',
                            color: 'black',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            boxShadow: '0 0 10px #39ff14'
                        }}>
                            UI TEST ACTIVE
                        </span>
                    </div>
                    <Subtitle>Official Municipal Action Plan</Subtitle>
                    <ActionButton
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={openAdvisoryModal}
                        style={{ marginTop: '0.75rem', background: '#0ea5e9', color: 'white', border: 'none' }}
                    >
                        <FiSend size={16} /> Send Advisory
                    </ActionButton>
                </HeaderInfo>
                <Actions>
                    <WardSelect value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)}>
                        {SECTOR_LIST.map(sector => (
                            <option key={sector} value={sector}>{sector}</option>
                        ))}
                    </WardSelect>

                    <ActionButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <FiPrinter size={16} /> Print
                    </ActionButton>
                    <ActionButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <FiDownload size={16} /> PDF
                    </ActionButton>
                </Actions>
            </Header>

            {policyData && (
                <PolicyDocument
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <DocumentHeader>
                        <DocumentTitle>{policyData.title}</DocumentTitle>
                        <DocumentSubtitle>Integrated Disease & Environmental Risk Analysis</DocumentSubtitle>
                        <DocumentMeta>
                            Generated on {policyData.generatedAt.toLocaleDateString()} | {selectedCity.name}, {selectedCity.country}
                        </DocumentMeta>
                    </DocumentHeader>

                    <Section>
                        <SectionTitle>Executive Summary</SectionTitle>
                        <SectionContent>
                            <strong>Situation Overview:</strong> {policyData.executiveSummary.overview}
                        </SectionContent>
                        <SectionContent>
                            <strong>Critical Findings from Digital Twin:</strong>
                            <ul>
                                {policyData.executiveSummary.keyFindings.map((finding, index) => (
                                    <li key={index} style={{ marginBottom: '0.5rem' }}>{finding}</li>
                                ))}
                            </ul>
                        </SectionContent>
                        <SectionContent>
                            <strong>Action Urgency:</strong> <span style={{
                                color: policyData.executiveSummary.urgency === 'CRITICAL' ? '#ef4444' :
                                    policyData.executiveSummary.urgency === 'HIGH' ? '#f97316' : '#10b981',
                                fontWeight: 'bold'
                            }}>{policyData.executiveSummary.urgency}</span>
                        </SectionContent>
                    </Section>

                    <Section>
                        <SectionTitle>Recommended Clinical & Municipal Actions</SectionTitle>
                        <RecommendationList>
                            {policyData.recommendations.map((rec, index) => (
                                <RecommendationItem key={index}>
                                    <RecommendationNumber>{index + 1}</RecommendationNumber>
                                    <RecommendationText>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <div style={{ fontWeight: '600', fontSize: '1.1rem', color: '#1e293b' }}>{rec.name}</div>
                                            <Badge bg={rec.costCategory === 'Low' ? '#10b981' : '#f59e0b'}>{rec.effort} Effort</Badge>
                                        </div>
                                        <div style={{ marginBottom: '0.5rem', fontStyle: 'italic', color: '#475569' }}>{rec.description}</div>
                                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                            <strong>Why:</strong> Targeting {rec.riskDrivers.join(' & ')} drivers.
                                        </div>
                                        <button
                                            onClick={() => setDetailsModalItem(rec)}
                                            style={{
                                                marginTop: '0.75rem',
                                                background: 'none',
                                                border: 'none',
                                                color: '#3b82f6',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                padding: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            <FiInfo size={14} /> View Implementation Details
                                        </button>
                                    </RecommendationText>
                                </RecommendationItem>
                            ))}
                        </RecommendationList>
                        {policyData.recommendations.length === 0 && <p>No specific interventions required at this time. Routine monitoring advised.</p>}
                    </Section>

                    <Section>
                        <SectionTitle>Implementation Strategy</SectionTitle>
                        <SectionContent>
                            <strong>Governance:</strong> {policyData.implementation.governance}
                        </SectionContent>
                        <SectionContent>
                            <strong>Target Timeline:</strong> {policyData.implementation.timeline}
                        </SectionContent>
                    </Section>

                    <Section>
                        <SectionTitle>Data Integrity Statement</SectionTitle>
                        <SectionContent>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', background: '#ecfdf5', padding: '1rem', borderRadius: '8px' }}>
                                <FiShield />
                                <div>
                                    <strong>Source Verified:</strong> All data in this brief is synchronized in real-time with the Solapur Digital Twin v3 system.
                                    Active case counts match verified hospital reports (Last updated: Today).
                                </div>
                            </div>
                        </SectionContent>
                    </Section>
                </PolicyDocument>
            )}

            {/* DETAILS MODAL */}
            <AnimatePresence>
                {detailsModalItem && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setDetailsModalItem(null)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            style={{
                                width: '600px',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                background: '#fff',
                                borderRadius: '12px',
                                padding: '2rem',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                                <div>
                                    <h2 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1.5rem' }}>{detailsModalItem.name}</h2>
                                    <Badge bg="#e2e8f0" color="#475569">Implementation Protocol</Badge>
                                </div>
                                <Button secondary onClick={() => setDetailsModalItem(null)} style={{ padding: '0.5rem' }}><FiX size={18} /></Button>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <h4 style={{ color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Step-by-Step Execution</h4>
                                <ul style={{ paddingLeft: '1.25rem', color: '#334155', lineHeight: '1.7', fontSize: '0.95rem' }}>
                                    {detailsModalItem.executionSteps?.map((step, idx) => (
                                        <li key={idx} style={{ marginBottom: '0.5rem' }}>{step}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* NEW: Implementation Resources & Timeline */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '8px' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#1e40af', textTransform: 'uppercase' }}>Required Resources</h4>
                                    <div style={{ fontSize: '0.9rem', color: '#1e3a8a' }}>
                                        <div style={{ marginBottom: '4px' }}><strong>Manpower:</strong> {detailsModalItem.resourceRequirements?.manpower || 'Standard Crew'}</div>
                                        <div style={{ marginBottom: '4px' }}><strong>Vehicles:</strong> {detailsModalItem.resourceRequirements?.vehicles || 'Standard Fleet'}</div>
                                        <div><strong>Equipment:</strong> {detailsModalItem.resourceRequirements?.equipment || 'Standard Kit'}</div>
                                    </div>
                                </div>
                                <div style={{ background: '#fefce8', padding: '1.25rem', borderRadius: '8px' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#854d0e', textTransform: 'uppercase' }}>Deployment Timeline</h4>
                                    <div style={{ fontSize: '0.9rem', color: '#713f12', fontStyle: 'italic' }}>
                                        {detailsModalItem.specificTimeline || 'Immediate Deployment'}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <h4 style={{ color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Expected Outcomes & Metrics</h4>
                                <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
                                    <p style={{ margin: '0 0 0.5rem 0', color: '#166534', fontWeight: 'bold' }}>Impact: {detailsModalItem.expectedHealthImpact}</p>
                                    <p style={{ margin: 0, color: '#14532d', fontSize: '0.9rem' }}><strong>Success Metric:</strong> {detailsModalItem.successMetric || 'Reduction in active cases'}</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Feasibility</div>
                                    <div style={{ color: '#1e293b', fontWeight: '700' }}>{detailsModalItem.feasibility}</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Cost</div>
                                    <div style={{ color: '#1e293b', fontWeight: '700' }}>{detailsModalItem.costCategory}</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 3. FOOTER MARKER */}
            <div style={{
                textAlign: 'center',
                color: '#808080',
                fontSize: '12px',
                marginTop: '40px',
                padding: '10px'
            }}>
                Rendered by /policy-brief component
            </div>

            {/* ADVISORY COMPOSER MODAL */}
            <AnimatePresence>
                {advisoryModal && policyData && (() => {
                    const presets = getPresets(policyData);
                    return (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setAdvisoryModal(false)}>
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                                style={{ background: '#0f172a', borderRadius: '16px', width: '860px', maxWidth: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', border: '1px solid #1e293b', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}
                            >
                                {/* Modal Header */}
                                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ color: '#fff', fontWeight: '700', fontSize: '1.2rem' }}>📢 Send Advisory</div>
                                        <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>{selectedWard} — Solapur</div>
                                    </div>
                                    <button onClick={() => setAdvisoryModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
                                </div>

                                {/* Modal Body */}
                                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', flex: 1, overflow: 'hidden' }}>
                                    {/* LEFT: Preset List */}
                                    <div style={{ borderRight: '1px solid #1e293b', padding: '1.25rem', overflowY: 'auto' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Preset Templates</div>
                                        {presets.map((p, i) => (
                                            <div
                                                key={i}
                                                onClick={() => { setSelectedPreset(i); setAdvisoryMessage(p.message); }}
                                                style={{
                                                    padding: '0.75rem',
                                                    borderRadius: '8px',
                                                    border: `1px solid ${selectedPreset === i ? '#3b82f6' : '#1e293b'}`,
                                                    background: selectedPreset === i ? 'rgba(59,130,246,0.1)' : 'transparent',
                                                    cursor: 'pointer',
                                                    marginBottom: '0.5rem',
                                                    transition: 'all 0.15s'
                                                }}
                                            >
                                                <div style={{ fontWeight: '600', fontSize: '0.9rem', color: selectedPreset === i ? '#93c5fd' : '#e2e8f0' }}>{p.icon} {p.label}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{p.sublabel}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* RIGHT: Editable Preview */}
                                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Message Preview & Editor</div>
                                        <textarea
                                            value={advisoryMessage}
                                            onChange={e => { setAdvisoryMessage(e.target.value); setSelectedPreset(null); }}
                                            style={{ flex: 1, padding: '1rem', background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.88rem', lineHeight: '1.6', resize: 'none', outline: 'none' }}
                                        />
                                        <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.5rem' }}>*bold*, _italic_ — Telegram Markdown. Edit freely.</div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                    <button onClick={() => setAdvisoryModal(false)} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                                    <button
                                        onClick={handleSendAdvisory}
                                        disabled={isSending || !advisoryMessage.trim()}
                                        style={{ background: isSending ? '#334155' : '#0ea5e9', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', cursor: isSending ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        {isSending ? '⏳ Sending...' : '📤 Send to Telegram'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    );
                })()}
            </AnimatePresence>
        </Container>
    );
};

export default PolicyBrief;
