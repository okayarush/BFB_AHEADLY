import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiGlobe, FiSettings, FiUser } from 'react-icons/fi';

const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2563eb;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;

  &:hover {
    color: #2563eb;
  }
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(37, 99, 235, 0.1);
  }
`;

const Navbar = () => {
  return (
    <NavbarContainer>
      <Logo>
        <FiGlobe />
        NASA Healthy Cities
      </Logo>
      <NavLinks>
        <NavLink to="/dashboard">How It Works</NavLink>
        <NavLink to="/digital-twin">Digital Twin</NavLink>
        <NavLink to="/intervention-planner">Interventions</NavLink>
        <NavLink to="/cost-benefit">Cost-Benefit</NavLink>
        <NavLink to="/data-sources">Data Sources</NavLink>
      </NavLinks>
      <UserActions>
        <IconButton>
          <FiSettings size={20} />
        </IconButton>
        <IconButton>
          <FiUser size={20} />
        </IconButton>
      </UserActions>
    </NavbarContainer>
  );
};

export default Navbar;
