import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiMessageSquare, FiHeart, FiUsers, FiUser } from 'react-icons/fi';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #0a0c10;
  color: #e2e8f0;
  font-family: 'Nunito', 'Inter', system-ui, sans-serif;
  padding-bottom: 70px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #111318;
  border-top: 1px solid #1e2128;
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 0.5rem 0;
  padding-bottom: env(safe-area-inset-bottom, 0.5rem);
  z-index: 1000;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
`;

const NavItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  color: ${props => props.$active ? '#00d4aa' : '#64748b'};
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  svg {
    font-size: 1.6rem;
    stroke-width: ${props => props.$active ? '2.5' : '2'};
  }
`;

export default function CommunityLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', icon: FiHome, path: '/community' },
    { label: 'Report', icon: FiMessageSquare, path: '/community-sanitation' },
    { label: 'Health', icon: FiHeart, path: '/community-symptoms' },
    { label: 'Community', icon: FiUsers, path: '/leaderboard' },
    { label: 'Profile', icon: FiUser, path: '/health-passport' },
  ];

  return (
    <PageWrapper>
      {children}
      <NavContainer>
        {navItems.map(item => {
          const isActuallyActive = item.path === '/community' 
            ? location.pathname === '/community'
            : location.pathname.startsWith(item.path);

          return (
            <NavItem 
              key={item.label} 
              $active={isActuallyActive}
              onClick={() => navigate(item.path)}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavItem>
          );
        })}
      </NavContainer>
    </PageWrapper>
  );
}
