import styled from 'styled-components';

export const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #0f1923; /* Dark background standard */
  color: #e2e8f0;
  font-family: 'Inter', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
`;

export const MainContent = styled.main`
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease-in-out;

  &:hover {
    border-color: ${props => props.accent || 'rgba(255, 255, 255, 0.2)'};
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
`;

export const SectionHeader = styled.h3`
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${props => props.accent || '#94a3b8'};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin-left: 0.5rem;
  }
`;

export const PrimaryButton = styled.button`
  background: ${props => props.accent || '#6366f1'};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const SecondaryButton = styled.button`
  background: transparent;
  color: ${props => props.accent || '#e2e8f0'};
  border: 1px solid ${props => props.accent || 'rgba(255, 255, 255, 0.2)'};
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.accent ? `${props.accent}15` : 'rgba(255, 255, 255, 0.05)'};
    border-color: ${props => props.accent || 'rgba(255, 255, 255, 0.3)'};
  }
`;

export const StatCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem;

  .stat-label {
    font-size: 0.8rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 800;
    color: #e2e8f0;
    line-height: 1;
  }

  .stat-context {
    font-size: 0.8rem;
    color: #64748b;
    margin-top: 0.25rem;
  }
`;

export const PortalBanner = styled.div`
  width: 100%;
  background: ${props => props.accent || '#1e293b'};
  color: white;
  padding: 0.5rem 1rem;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  z-index: 100;
`;

export const PORTAL_COLORS = {
  smc: '#0D7377',
  hospital: '#F4845F',
  community: '#45B7A0',
  asha: '#FFB347'
};
