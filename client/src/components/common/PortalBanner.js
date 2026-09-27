import React from 'react';
import styled, { keyframes } from 'styled-components';

// ── PORTAL IDENTITY BANNER ─────────────────────────────────────────────────────
// Thin colored top banner that orients judges/users to which persona they're in.
// Usage: <PortalBanner portal="smc" /> | "hospital" | "community"

const PORTALS = {
  smc: {
    icon: '🏛️',
    label: 'SMC HEALTH COMMAND CENTER',
    sublabel: 'Ward-level intelligence for municipal decision-makers',
    bg: 'linear-gradient(90deg, #0d7377 0%, #14919b 100%)',
    border: '#0d7377',
    glow: 'rgba(13, 115, 119, 0.35)',
  },
  hospital: {
    icon: '🏥',
    label: 'HOSPITAL CONNECT',
    sublabel: 'Hospital reporting and capacity management portal',
    bg: 'linear-gradient(90deg, #4f46e5 0%, #6366f1 100%)',
    border: '#4f46e5',
    glow: 'rgba(79, 70, 229, 0.35)',
  },
  community: {
    icon: '👥',
    label: 'COMMUNITY PORTAL',
    sublabel: 'Citizen services for health reporting and wellness',
    bg: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
    border: '#059669',
    glow: 'rgba(5, 150, 105, 0.35)',
  },
};

const slidePulse = keyframes`
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const BannerWrap = styled.div`
  width: 100%;
  background: ${({ $bg }) => $bg};
  background-size: 200% 200%;
  animation: ${slidePulse} 6s ease infinite;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
  z-index: 10;
  box-shadow: 0 2px 12px ${({ $glow }) => $glow};
  flex-shrink: 0;
`;

const Icon = styled.span`
  font-size: 14px;
  line-height: 1;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const Label = styled.span`
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const Separator = styled.span`
  font-size: 11px;
  color: rgba(255,255,255,0.5);
`;

const Sublabel = styled.span`
  font-size: 11px;
  color: rgba(255,255,255,0.8);
  font-weight: 400;

  @media (max-width: 600px) {
    display: none;
  }
`;

export default function PortalBanner({ portal = 'smc' }) {
  const config = PORTALS[portal] || PORTALS.smc;

  return (
    <BannerWrap $bg={config.bg} $glow={config.glow}>
      <Icon>{config.icon}</Icon>
      <LabelRow>
        <Label>{config.label}</Label>
        <Separator>—</Separator>
        <Sublabel>{config.sublabel}</Sublabel>
      </LabelRow>
    </BannerWrap>
  );
}
