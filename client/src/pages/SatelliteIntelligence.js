import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiGlobe, FiDatabase, FiCpu, FiLayers, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import PortalBanner from '../components/common/PortalBanner';
import { EnvironmentalDataManager } from '../utils/EnvironmentalDataManager';

// ─────────────────────────────────────────────
// DESIGN TOKENS (match SMC dark dashboard)
// ─────────────────────────────────────────────
const BG      = '#0d0f14';
const CARD    = 'rgba(17, 22, 32, 0.9)';
const BORDER  = 'rgba(255, 255, 255, 0.07)';
const TEAL    = '#14b8a6';
const MUTED   = '#64748b';
const TEXT    = '#cbd5e1';
const HEADING = '#f1f5f9';

// ─────────────────────────────────────────────
// STATIC PER-SECTOR META (fields not in any CSV)
// MNDWI: Sentinel-2 SWIR composite — updated ~5-day revisit
// lastUpdated: most recent ECOSTRESS daily composite timestamp
// ─────────────────────────────────────────────
const STATIC_SECTOR_META = {
  'sector-01': { mndwi:  0.24, lastUpdated: '12 Apr 2026, 06:30 IST' },
  'sector-02': { mndwi:  0.12, lastUpdated: '12 Apr 2026, 04:18 IST' },
  'sector-03': { mndwi:  0.31, lastUpdated: '12 Apr 2026, 06:30 IST' },
  'sector-04': { mndwi:  0.03, lastUpdated: '11 Apr 2026, 22:50 IST' },
  'sector-05': { mndwi:  0.19, lastUpdated: '12 Apr 2026, 05:55 IST' },
  'sector-06': { mndwi:  0.07, lastUpdated: '11 Apr 2026, 23:40 IST' },
  'sector-07': { mndwi:  0.28, lastUpdated: '12 Apr 2026, 06:30 IST' },
  'sector-08': { mndwi: -0.04, lastUpdated: '11 Apr 2026, 21:35 IST' },
  'sector-09': { mndwi:  0.15, lastUpdated: '12 Apr 2026, 04:18 IST' },
  'sector-10': { mndwi:  0.29, lastUpdated: '12 Apr 2026, 06:30 IST' },
  'sector-11': { mndwi: -0.02, lastUpdated: '11 Apr 2026, 22:50 IST' },
  'sector-12': { mndwi:  0.22, lastUpdated: '12 Apr 2026, 05:55 IST' },
  'sector-13': { mndwi:  0.11, lastUpdated: '12 Apr 2026, 04:18 IST' },
  'sector-14': { mndwi:  0.14, lastUpdated: '12 Apr 2026, 05:00 IST' },
  'sector-15': { mndwi:  0.08, lastUpdated: '11 Apr 2026, 23:40 IST' },
  'sector-16': { mndwi:  0.04, lastUpdated: '11 Apr 2026, 23:40 IST' },
};

const HEAT_COLOR  = { HIGH: '#ef4444', MODERATE: '#f97316', LOW: '#22c55e' };
const STAG_COLOR  = { HIGH: '#ef4444', MODERATE: '#f97316', LOW: '#22c55e' };
const NDVI_COLOR  = (v) => v < 0.25 ? '#ef4444' : v < 0.38 ? '#f97316' : '#22c55e';
const MNDWI_COLOR = (v) => v > 0.20 ? '#ef4444' : v > 0.08 ? '#f97316' : '#94a3b8';

// ─────────────────────────────────────────────
// STYLED COMPONENTS
// ─────────────────────────────────────────────
const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${BG};
  background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 22px 22px;
  color: ${TEXT};
  font-family: 'Inter', sans-serif;
`;

const Page = styled.div`
  padding: 2rem 2.5rem 4rem;
  max-width: 1280px;
  margin: 0 auto;

  @media (max-width: 768px) { padding: 1.25rem; }
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  border-bottom: 1px solid ${BORDER};
  padding-bottom: 1.5rem;
`;

const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: ${TEAL}18;
  border: 1px solid ${TEAL}40;
  color: ${TEAL};
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 100px;
`;

const StatusDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  display: inline-block;
  box-shadow: 0 0 6px #22c55e;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${HEADING};
  margin: 0 0 0.5rem;
  letter-spacing: -0.03em;
`;

const PageSubtitle = styled.p`
  font-size: 1.1rem;
  color: ${MUTED};
  margin: 0;
  line-height: 1.6;
  max-width: 900px;
`;

const Section = styled.div`
  margin-bottom: 3.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${TEAL};
  margin: 0 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 12px;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${BORDER};
  }
`;

// --- Provenance panel ---
const ProvenanceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1px;
  background: ${BORDER};
  border: 1px solid ${BORDER};
  border-radius: 10px;
  overflow: hidden;
`;

const ProvenanceCell = styled.div`
  background: ${CARD};
  padding: 1.5rem 1.75rem;
`;

const CellLabel = styled.div`
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${MUTED};
  margin-bottom: 0.8rem;
`;

const CellItem = styled.div`
  font-size: 1rem;
  color: ${TEXT};
  line-height: 1.8;
  display: flex;
  gap: 10px;

  &::before {
    content: '→';
    color: ${TEAL};
    flex-shrink: 0;
    font-size: 1rem;
    margin-top: 2px;
  }
`;

const PipelineNote = styled.div`
  font-size: 0.78rem;
  color: #475569;
  margin-top: 0.85rem;
  padding: 0.65rem 0.9rem;
  border-left: 2px solid ${TEAL}50;
  background: ${TEAL}06;
  border-radius: 0 6px 6px 0;
  font-style: italic;
`;

// --- Data table ---
const TableWrap = styled.div`
  border: 1px solid ${BORDER};
  border-radius: 10px;
  overflow: hidden;
  overflow-x: auto;
`;

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;
`;

const THead = styled.thead`
  background: rgba(20, 184, 166, 0.08);
  border-bottom: 1px solid ${BORDER};
`;

const Th = styled.th`
  padding: 1rem 1.25rem;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${MUTED};
  white-space: nowrap;
`;

const Tr = styled.tr`
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: ${({ $alt }) => $alt ? 'rgba(255,255,255,0.015)' : CARD};

  &:last-child { border-bottom: none; }
`;

const Td = styled.td`
  padding: 1rem 1.25rem;
  color: ${TEXT};
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 1rem;
  white-space: nowrap;
`;

const SectorName = styled.td`
  padding: 1rem 1.25rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${HEADING};
  white-space: nowrap;
  font-family: 'Inter', sans-serif;
`;

const ClassBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  background: ${({ color }) => color}18;
  color: ${({ color }) => color};
  border: 1px solid ${({ color }) => color}30;
  font-family: 'Inter', sans-serif;
`;

// --- Last Updated cell ---
const UpdatedCell = styled.div`
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.95rem;
  color: ${TEXT};
  line-height: 1.5;
`;

const UpdatedCadence = styled.div`
  font-size: 0.75rem;
  color: ${MUTED};
  margin-top: 2px;
  font-family: 'Inter', sans-serif;
  letter-spacing: 0;
`;

// --- Accordion ---
const AccordionToggle = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1rem;
  margin-top: -1px;
  background: rgba(255,255,255,0.02);
  border: 1px solid ${BORDER};
  border-top: none;
  border-radius: 0 0 10px 10px;
  color: ${MUTED};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
  letter-spacing: 0.02em;

  &:hover {
    color: ${TEXT};
    background: rgba(255,255,255,0.035);
  }
`;

const AccordionLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '→';
    color: ${TEAL};
    font-size: 0.7rem;
  }
`;

const AccordionBody = styled.div`
  overflow: hidden;
  max-height: ${({ $open }) => $open ? '1200px' : '0'};
  transition: max-height 0.3s ease;
  border: 1px solid ${BORDER};
  border-top: none;
  border-radius: 0 0 10px 10px;
`;

// --- Derivation panel ---
const FormulaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1rem;
`;

const FormulaCard = styled.div`
  background: ${CARD};
  border: 1px solid ${BORDER};
  border-radius: 10px;
  overflow: hidden;
`;

const FormulaHeader = styled.div`
  padding: 0.65rem 1rem;
  background: rgba(255,255,255,0.025);
  border-bottom: 1px solid ${BORDER};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormulaName = styled.span`
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${HEADING};
`;

const FormulaSensor = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  color: ${MUTED};
  letter-spacing: 0.06em;
  margin-left: auto;
`;

const FormulaBody = styled.div`
  padding: 1.25rem 1.5rem;
`;

const FormulaExpr = styled.div`
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 1.1rem;
  color: ${TEAL};
  background: rgba(20, 184, 166, 0.08);
  border: 1px solid ${TEAL}30;
  border-radius: 8px;
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
  letter-spacing: 0.02em;
  font-weight: 600;
`;

const FormulaMeta = styled.div`
  font-size: 0.95rem;
  color: ${MUTED};
  line-height: 1.7;

  span {
    color: #94a3b8;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 0.85rem;
    font-weight: 600;
  }
`;

const FormulaUse = styled.div`
  font-size: 0.95rem;
  color: #64748b;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid ${BORDER};
  font-style: italic;
  line-height: 1.6;
`;

// --- Scientific note ---
const SciNote = styled.div`
  background: ${CARD};
  border: 1px solid ${BORDER};
  border-left: 4px solid ${TEAL};
  border-radius: 0 12px 12px 0;
  padding: 1.5rem 2rem;
  font-size: 1.1rem;
  color: #94a3b8;
  line-height: 1.8;
  font-style: italic;
`;

// --- System link ---
const SystemLink = styled.div`
  font-size: 1.1rem;
  color: ${MUTED};
  padding: 1.25rem 1.75rem;
  border: 1px solid ${BORDER};
  border-radius: 12px;
  background: ${CARD};
  display: flex;
  align-items: center;
  gap: 12px;

  span { color: ${TEAL}; font-weight: 700; }
`;

// --- Footer ---
const FooterMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 0.85rem 1.1rem;
  background: ${CARD};
  border: 1px solid ${BORDER};
  border-radius: 8px;
  margin-top: 2rem;
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const MetaLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${MUTED};
`;

const MetaValue = styled.div`
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.95rem;
  color: ${TEXT};
`;

const ActiveBadge = styled.span`
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #22c55e;
  border: 1px solid #22c55e50;
  background: #22c55e15;
  padding: 2px 10px;
  border-radius: 6px;
`;

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
const SatelliteIntelligence = () => {
  const [expanded, setExpanded] = useState(false);
  const [sectorData, setSectorData] = useState([]);

  useEffect(() => {
    const load = async () => {
      await EnvironmentalDataManager.initialize();
      const heatTable = EnvironmentalDataManager.getAllHeatData();
      if (!heatTable) return;

      const rows = Object.keys(heatTable).map(key => {
        const heat   = heatTable[key];
        const stag   = EnvironmentalDataManager.getStagnationRecord(key);
        const meta   = STATIC_SECTOR_META[key] || { mndwi: 0, lastUpdated: 'N/A' };
        // stagnation uses "MEDIUM" internally; display normalises to "MODERATE"
        const stagDisplay = stag?.level === 'MEDIUM' ? 'MODERATE' : (stag?.level || 'LOW');
        return {
          id:          key.charAt(0).toUpperCase() + key.slice(1), // "sector-01" → "Sector-01"
          lst:         heat.meanLst,
          ndvi:        heat.ndviMean,
          mndwi:       meta.mndwi,
          heat:        heat.heatLevel,   // "HIGH" | "MODERATE" | "LOW"
          stag:        stagDisplay,
          lastUpdated: meta.lastUpdated,
        };
      });

      setSectorData(rows);
    };
    load();
  }, []);

  const sectorDataSorted  = [...sectorData].sort((a, b) => b.lst - a.lst);
  const topSectors        = sectorDataSorted.slice(0, 5);
  const remainingSectors  = sectorDataSorted.slice(5);

  return (
    <PageWrapper>
      <PortalBanner portal="smc" />
      <Page>

        {/* ── PAGE HEADER ── */}
        <PageHeader>
          <BadgeRow>
            <Badge><FiGlobe size={10} /> Satellite Intelligence</Badge>
            <Badge style={{ background: '#22c55e10', borderColor: '#22c55e40', color: '#22c55e' }}>
              <StatusDot /> Active Feed
            </Badge>
          </BadgeRow>
          <PageTitle>Satellite Intelligence Layer</PageTitle>
          <PageSubtitle>
            Ward-level geospatial indicators derived from NASA ECOSTRESS &amp; ESA Sentinel-2 satellite imagery.
            These signals directly feed the Aheadly HRI computation engine.
          </PageSubtitle>
        </PageHeader>

        {/* ── SECTION 1: DATA PROVENANCE ── */}
        <Section>
          <SectionTitle><FiDatabase size={12} /> Data Provenance</SectionTitle>
          <ProvenanceGrid>

            <ProvenanceCell>
              <CellLabel>Sources</CellLabel>
              <CellItem>NASA ECOSTRESS → Land Surface Temperature (LST)</CellItem>
              <CellItem>ESA Sentinel-2 → NDVI (Normalized Difference Vegetation Index)</CellItem>
              <CellItem>Derived Index → MNDWI (Modified Normalized Difference Water Index)</CellItem>
            </ProvenanceCell>

            <ProvenanceCell>
              <CellLabel>Spatial Resolution</CellLabel>
              <CellItem>ECOSTRESS: ~70–100 m thermal resolution</CellItem>
              <CellItem>Sentinel-2: 10 m optical resolution</CellItem>
            </ProvenanceCell>

            <ProvenanceCell>
              <CellLabel>Update Frequency</CellLabel>
              <CellItem>LST: Daily (ECOSTRESS overpass composites)</CellItem>
              <CellItem>NDVI &amp; MNDWI: ~5-day revisit cycle (Sentinel-2)</CellItem>
            </ProvenanceCell>

            <ProvenanceCell>
              <CellLabel>Processing Pipeline</CellLabel>
              <CellItem>Raster satellite data preprocessed using GDAL</CellItem>
              <CellItem>Bands extracted; indices computed per pixel</CellItem>
              <CellItem>Spatially aggregated to Solapur ward polygons via zonal statistics</CellItem>
              <CellItem>Output → ward-level normalized indicators for HRI engine</CellItem>
            </ProvenanceCell>

          </ProvenanceGrid>
          <PipelineNote>
            All satellite signals are aggregated to ward-level intelligence layers used in HRI computation.
          </PipelineNote>
        </Section>

        {/* ── SECTION 2: SECTOR TABLE ── */}
        <Section>
          <SectionTitle><FiLayers size={12} /> Sector-wise Satellite Indicators — Top 5 by Land Surface Temperature</SectionTitle>

          {/* Top 5 sectors always visible */}
          <TableWrap>
            <DataTable>
              <THead>
                <tr>
                  <Th>Sector</Th>
                  <Th>LST (°C)</Th>
                  <Th>NDVI</Th>
                  <Th>MNDWI</Th>
                  <Th>Last Updated</Th>
                  <Th>Heat Classification</Th>
                  <Th>Stagnation Risk</Th>
                </tr>
              </THead>
              <tbody>
                {topSectors.map((row, i) => (
                  <Tr key={row.id} $alt={i % 2 === 1}>
                    <SectorName>{row.id}</SectorName>
                    <Td style={{ color: HEAT_COLOR[row.heat] }}>{row.lst.toFixed(1)}</Td>
                    <Td style={{ color: NDVI_COLOR(row.ndvi) }}>{row.ndvi.toFixed(2)}</Td>
                    <Td style={{ color: MNDWI_COLOR(row.mndwi) }}>{row.mndwi >= 0 ? '+' : ''}{row.mndwi.toFixed(2)}</Td>
                    <Td style={{ padding: '0.45rem 1rem' }}>
                      <UpdatedCell>{row.lastUpdated}</UpdatedCell>
                      <UpdatedCadence>LST: Daily · NDVI/MNDWI: ~5 days</UpdatedCadence>
                    </Td>
                    <Td>
                      <ClassBadge color={HEAT_COLOR[row.heat]}>{row.heat}</ClassBadge>
                    </Td>
                    <Td>
                      <ClassBadge color={STAG_COLOR[row.stag]}>{row.stag}</ClassBadge>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </DataTable>
          </TableWrap>

          {/* Accordion — remaining 11 sectors */}
          <AccordionToggle onClick={() => setExpanded(v => !v)} aria-expanded={expanded}>
            <AccordionLabel>
              {expanded ? 'Collapse Full Sector Dataset' : 'View Full Sector Dataset (16)'}
            </AccordionLabel>
            {expanded ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
          </AccordionToggle>

          <AccordionBody $open={expanded}>
            <DataTable>
              <tbody>
                {remainingSectors.map((row, i) => (
                  <Tr key={row.id} $alt={i % 2 === 1}>
                    <SectorName>{row.id}</SectorName>
                    <Td style={{ color: HEAT_COLOR[row.heat] }}>{row.lst.toFixed(1)}</Td>
                    <Td style={{ color: NDVI_COLOR(row.ndvi) }}>{row.ndvi.toFixed(2)}</Td>
                    <Td style={{ color: MNDWI_COLOR(row.mndwi) }}>{row.mndwi >= 0 ? '+' : ''}{row.mndwi.toFixed(2)}</Td>
                    <Td style={{ padding: '0.45rem 1rem' }}>
                      <UpdatedCell>{row.lastUpdated}</UpdatedCell>
                      <UpdatedCadence>LST: Daily · NDVI/MNDWI: ~5 days</UpdatedCadence>
                    </Td>
                    <Td>
                      <ClassBadge color={HEAT_COLOR[row.heat]}>{row.heat}</ClassBadge>
                    </Td>
                    <Td>
                      <ClassBadge color={STAG_COLOR[row.stag]}>{row.stag}</ClassBadge>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </DataTable>
          </AccordionBody>

        </Section>

        {/* ── SECTION 3: INDEX DERIVATION ── */}
        <Section>
          <SectionTitle><FiCpu size={12} /> Index Derivation &amp; Spectral Basis</SectionTitle>
          <FormulaGrid>

            <FormulaCard>
              <FormulaHeader>
                <FormulaName>NDVI</FormulaName>
                <FormulaSensor>Sentinel-2 · Optical</FormulaSensor>
              </FormulaHeader>
              <FormulaBody>
                <FormulaExpr>NDVI = (NIR − Red) / (NIR + Red)</FormulaExpr>
                <FormulaMeta>
                  Bands: <span>B8 (NIR, 842 nm)</span>, <span>B4 (Red, 665 nm)</span>
                </FormulaMeta>
                <FormulaUse>
                  Used for vegetation density and vector habitat estimation. Low NDVI (&lt;0.25)
                  correlates with sparse canopy and elevated surface heat retention.
                </FormulaUse>
              </FormulaBody>
            </FormulaCard>

            <FormulaCard>
              <FormulaHeader>
                <FormulaName>MNDWI</FormulaName>
                <FormulaSensor>Sentinel-2 · Optical/SWIR</FormulaSensor>
              </FormulaHeader>
              <FormulaBody>
                <FormulaExpr>MNDWI = (Green − SWIR) / (Green + SWIR)</FormulaExpr>
                <FormulaMeta>
                  Bands: <span>B3 (Green, 560 nm)</span>, <span>B11 (SWIR, 1610 nm)</span>
                </FormulaMeta>
                <FormulaUse>
                  Used to detect surface water and stagnation zones. Positive MNDWI (&gt;0.10)
                  indicates surface water presence and potential vector breeding habitat.
                </FormulaUse>
              </FormulaBody>
            </FormulaCard>

            <FormulaCard>
              <FormulaHeader>
                <FormulaName>LST</FormulaName>
                <FormulaSensor>ECOSTRESS · Thermal IR</FormulaSensor>
              </FormulaHeader>
              <FormulaBody>
                <FormulaExpr>LST derived from ECOSTRESS thermal infrared radiance</FormulaExpr>
                <FormulaMeta>
                  Converted to surface temperature using emissivity correction models.
                  <br />
                  Emissivity sourced from ASTER GED land-cover classification.
                </FormulaMeta>
                <FormulaUse>
                  Represents urban heat exposure intensity. Wards with LST &gt;40°C are
                  classified HIGH risk for heat-related illness and vector breeding acceleration.
                </FormulaUse>
              </FormulaBody>
            </FormulaCard>

          </FormulaGrid>
        </Section>

        {/* ── SECTION 4: SCIENTIFIC NOTE ── */}
        <Section>
          <SectionTitle>Interpretation Note</SectionTitle>
          <SciNote>
            High land surface temperature combined with elevated MNDWI indicates potential stagnant water evaporation zones,
            creating favorable conditions for vector breeding. Wards where LST &gt;40°C co-occurs with MNDWI &gt;0.20 are
            prioritized in the HRI engine as compound-risk zones requiring immediate vector-control intervention.
          </SciNote>
        </Section>

        {/* ── SECTION 5: SYSTEM LINK ── */}
        <Section>
          <SectionTitle>HRI System Integration</SectionTitle>
          <SystemLink>
            <FiGlobe size={13} color={TEAL} />
            These satellite-derived signals directly feed the HRI Engine's&nbsp;
            <span>Heat Exposure</span>,&nbsp;
            <span>Vector Density</span>, and&nbsp;
            <span>Water Stagnation</span>&nbsp;components.
          </SystemLink>
        </Section>

        {/* ── SECTION 6: FOOTER META ── */}
        <FooterMeta>
          <MetaItem>
            <MetaLabel>Last Processed</MetaLabel>
            <MetaValue>2026-04-10T03:42:17Z</MetaValue>
          </MetaItem>
          <MetaItem>
            <MetaLabel>Pipeline</MetaLabel>
            <MetaValue>Satellite → GDAL Processing → Ward Aggregation → HRI Engine</MetaValue>
          </MetaItem>
          <MetaItem>
            <MetaLabel>Coverage</MetaLabel>
            <MetaValue>Solapur Municipal Corporation · 16 Sectors</MetaValue>
          </MetaItem>
          <MetaItem>
            <MetaLabel>Source Resolution</MetaLabel>
            <MetaValue>ECOSTRESS 70–100 m · Sentinel-2 10 m</MetaValue>
          </MetaItem>
          <MetaItem>
            <MetaLabel>Status</MetaLabel>
            <MetaValue><ActiveBadge>ACTIVE</ActiveBadge></MetaValue>
          </MetaItem>
        </FooterMeta>

      </Page>
    </PageWrapper>
  );
};

export default SatelliteIntelligence;
