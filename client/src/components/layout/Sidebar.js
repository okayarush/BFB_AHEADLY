import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiMap,
  FiLayers,
  FiTrendingUp,
  FiFileText,
  FiDatabase,
  FiMenu,
  FiX,
  FiArrowRight,
  FiZap,
  FiTarget,
  FiGlobe,
  FiAward
} from 'react-icons/fi';

const BREAKPOINT = '768px';

const SidebarContainer = styled.aside`
  width: 250px;
  background: #0d0f14;
  padding: 2.5rem 1rem;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 0.3s ease-in-out;
  z-index: 1000;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

  @media (max-width: ${BREAKPOINT}) {
    position: fixed;
    height: 100%;
    transform: translateX(${props => (props.$isOpen ? '0' : '-100%')});
    box-shadow: 10px 0 30px rgba(0,0,0,0.8);
  }
`;

const MenuToggleButton = styled.button`
  display: none;
  @media (max-width: ${BREAKPOINT}) {
    display: block;
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 1001;
    background: #00d4aa;
    color: #000;
    border: none;
    padding: 0.5rem;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    transition: background 0.2s;
  }
`;

const Overlay = styled.div`
  display: none;
  @media (max-width: ${BREAKPOINT}) {
    display: ${props => (props.$isOpen ? 'block' : 'none')};
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: 999;
  }
`;

const BrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 0.5rem 3rem;
`;

const BrandIcon = styled.div`
  width: 24px; height: 24px;
  background: #00d4aa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-weight: 900;
`;

const BrandName = styled.div`
  font-size: 1.15rem;
  font-weight: 900;
  letter-spacing: 2.5px;
  color: white;
`;

const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const NavDivider = styled.div`
  margin: 1.5rem 0.5rem 0.75rem;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #64748b;
`;

const SidebarLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.5rem 0.5rem 1rem;
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
  border-left: 2px solid transparent;

  &:hover {
    color: white;
    background: rgba(255,255,255,0.02);
  }

  &.active {
    background: rgba(0, 212, 170, 0.05);
    color: #00d4aa;
    border-left: 2px solid #00d4aa;
    font-weight: 600;
  }
`;

const ExternalPortalContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 0.5rem;
`;

const ExternalPortalLink = styled(NavLink)`
  display: flex;
  flex-direction: column;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
  background: rgba(255,255,255,0.02);
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.04);
  }

  .portal-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.85rem;
    font-weight: 600;
    color: white;
    margin-bottom: 0.35rem;
  }

  .portal-desc {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: #64748b;
  }
`;

const CopilotPortalLink = styled.button`
  display: flex;
  flex-direction: column;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(0, 212, 170, 0.2);
  border-radius: 8px;
  background: rgba(0, 212, 170, 0.05);
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  text-align: left;
  width: 100%;

  &:hover {
    border-color: rgba(0, 212, 170, 0.4);
    background: rgba(0, 212, 170, 0.1);
  }

  .portal-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.85rem;
    font-weight: 600;
    color: #00d4aa;
    margin-bottom: 0.35rem;
  }

  .portal-desc {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: #64748b;
  }
`;

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const closeSidebar = () => {
    if (window.innerWidth <= parseInt(BREAKPOINT)) setIsOpen(false);
  };

  return (
    <>
      <MenuToggleButton
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </MenuToggleButton>

      <Overlay $isOpen={isOpen} onClick={() => setIsOpen(false)} />

      <SidebarContainer $isOpen={isOpen}>
        <BrandRow>
          <BrandIcon>A</BrandIcon>
          <BrandName>AHEADLY</BrandName>
        </BrandRow>

        <SidebarNav>
          <NavDivider>SMC COMMAND</NavDivider>

          <SidebarLink to="/dashboard" end onClick={closeSidebar}>
            <FiHome size={16} /> How It Works
          </SidebarLink>
          <SidebarLink to="/problem-statement" onClick={closeSidebar}>
            <FiTarget size={16} /> Problem Statement
          </SidebarLink>
          <SidebarLink to="/digital-twin" onClick={closeSidebar}>
            <FiMap size={16} /> Digital Twin
          </SidebarLink>
          <SidebarLink to="/intervention-planner" onClick={closeSidebar}>
            <FiLayers size={16} /> Intervention Planner
          </SidebarLink>
          <SidebarLink to="/FutureOverview" onClick={closeSidebar}>
            <FiTrendingUp size={16} /> Future Overview
          </SidebarLink>
          <SidebarLink to="/policy-brief" onClick={closeSidebar}>
            <FiFileText size={16} /> Policy Brief
          </SidebarLink>
          <SidebarLink to="/data-sources" onClick={closeSidebar}>
            <FiDatabase size={16} /> Data Sources
          </SidebarLink>
          <SidebarLink to="/satellite-intelligence" onClick={closeSidebar}>
            <FiGlobe size={16} /> Satellite Intelligence
          </SidebarLink>
          <SidebarLink to="/scientific-validation" onClick={closeSidebar}>
            <FiAward size={16} /> Scientific Validation
          </SidebarLink>
        </SidebarNav>

        <ExternalPortalContainer>
          <NavDivider style={{ margin: '1rem 0 0 0' }}>PORTALS</NavDivider>

          <ExternalPortalLink to="/hospital" onClick={closeSidebar}>
            <div className="portal-title">
              <span>🏥 Hospital Connect</span>
              <FiArrowRight size={14} color="#64748b" />
            </div>
            <div className="portal-desc">EXTERNAL PORTAL</div>
          </ExternalPortalLink>

          <ExternalPortalLink to="/community" onClick={closeSidebar}>
            <div className="portal-title">
              <span>👥 Community Portal</span>
              <FiArrowRight size={14} color="#64748b" />
            </div>
            <div className="portal-desc">EXTERNAL PORTAL</div>
          </ExternalPortalLink>

          <ExternalPortalLink to="/asha-welcome" onClick={closeSidebar}>
            <div className="portal-title">
              <span>👩‍⚕️ ASHA Field</span>
              <FiArrowRight size={14} color="#64748b" />
            </div>
            <div className="portal-desc">EXTERNAL PORTAL</div>
          </ExternalPortalLink>

          <CopilotPortalLink onClick={() => {
            closeSidebar();
            window.dispatchEvent(new CustomEvent('aheadly-open-copilot'));
          }}>
            <div className="portal-title">
              <span>✦ AI Health Assistant</span>
              <FiArrowRight size={14} color="#00d4aa" />
            </div>
            <div className="portal-desc">EXTERNAL PORTAL</div>
          </CopilotPortalLink>
        </ExternalPortalContainer>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;