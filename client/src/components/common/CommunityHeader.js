import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.div`
  padding: 2rem;
  background: #111318;
  border-bottom: 1px solid #1e2128;
  margin-bottom: 0;
`;

const Title = styled.h1`
  color: #ffffff;
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: #94a3b8;
  font-size: 1rem;
  margin: 0 0 1rem 0;
  line-height: 1.5;
  max-width: 800px;
`;

const TrustLine = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #00d4aa;
  font-size: 0.85rem;
  font-weight: 600;
  background: rgba(0, 212, 170, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  width: fit-content;
`;

export default function CommunityHeader({ title, subtitle, trustLine }) {
  return (
    <HeaderContainer>
      <Title>{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
      {trustLine && <TrustLine>{trustLine}</TrustLine>}
    </HeaderContainer>
  );
}
