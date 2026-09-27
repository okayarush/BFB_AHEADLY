import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { buildCopilotContext } from '../data/unifiedHealthData';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.0-flash';

const DEMO_FALLBACKS = {
  briefing: `**Solapur Health Briefing — Today**\n\n3 wards at HIGH risk (HRI > 65/100): Sector-12, Sector-7, Sector-19. Primary driver: **signal convergence** — heat exposure + water stagnation creating vector breeding conditions.\n\nDengue cases up 23% week-over-week. 12 new sanitation reports in 48hrs.\n\n**Recommended:** Deploy fogging to Sector-12 and Sector-7 immediately.`,
  risk: `**4 of 5 risk signals simultaneously elevated** — convergence zone.\n\n• Heat Exposure: 15/20 (LST 38°C+)\n• Water Stagnation: 12/20 (drain capacity exceeded)\n• Vector Density: 10/20 (Aedes breeding confirmed)\n• Disease Burden: 4/20 (early cases emerging)\n\nIt's not any single signal — the **combination** is dangerous.`,
  interventions: `**3-action deployment recommended:**\n\n1. **Drain Desilting** (Priority 1) — Targets root cause: stagnation score 12/20\n2. **Targeted Fogging** (Priority 2) — Disrupts adult mosquito populations\n3. **Community Advisory** (Priority 3) — Alert residents via citizen reporting\n\nProjected: HRI reduction ~30 points over 14 days.`,
};

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content:
    "👋 I'm Aheadly Copilot — your AI health intelligence companion. I can see what you're looking at and help you analyze risks, plan interventions, and generate insights.",
  timestamp: new Date(),
};

// ---------------------------------------------------------------------------
// Page-aware helpers
// ---------------------------------------------------------------------------

function getPageLabel(pathname) {
  if (pathname.startsWith('/digital-twin')) return 'Digital Twin';
  if (pathname.startsWith('/intervention-planner')) return 'Intervention Planner';
  if (pathname.startsWith('/policy-brief')) return 'Policy Brief';
  if (pathname.startsWith('/community-sanitation')) return 'Community Sanitation';
  if (pathname.startsWith('/community')) return 'Community Portal';
  if (pathname.startsWith('/hospital-reporting')) return 'Hospital Reporting';
  if (pathname.startsWith('/hospital')) return 'Hospital Portal';
  if (pathname.startsWith('/health-passport')) return 'Health Passport';
  if (pathname.startsWith('/vaccinations')) return 'Vaccination Tracker';
  if (pathname.startsWith('/leaderboard')) return 'Ward Leaderboard';
  if (pathname.startsWith('/sos')) return 'Emergency SOS';
  if (pathname === '/' || pathname.startsWith('/dashboard')) return 'Dashboard';
  return 'Home';
}

function isCitizenPage(pathname) {
  return [
    '/community-sanitation', '/community', '/health-passport',
    '/vaccinations', '/leaderboard', '/sos',
  ].some(p => pathname.startsWith(p));
}

function getQuickPrompts(pathname) {
  // Citizen mode
  if (isCitizenPage(pathname)) {
    return [
      'Is dengue a risk in my ward?',
      'My child has fever, what should I do?',
      'Where is the nearest hospital with beds?',
      'When is my next vaccination due?',
    ];
  }
  if (pathname === '/' || pathname.startsWith('/dashboard')) {
    return ['City health briefing', 'Top 3 priority wards', 'Weekly trend'];
  }
  if (pathname.startsWith('/digital-twin')) {
    return ["Why is this ward at risk?", "What's driving the HRI?", 'City health status'];
  }
  if (pathname.startsWith('/intervention-planner')) {
    return [
      'What interventions to prioritize?',
      'Explain projected impact',
      'Draft commissioner briefing',
    ];
  }
  if (pathname.startsWith('/policy-brief')) {
    return ['Summarize clinical risk', 'What should policy brief emphasize?'];
  }
  if (pathname.startsWith('/community-sanitation')) {
    return ['Which sectors have most reports?', 'Trending issues?'];
  }
  if (pathname.startsWith('/hospital-reporting')) {
    return ['Which hospitals near capacity?', 'Medicine stock alerts?'];
  }
  return ['City health briefing', 'High risk wards', 'Disease summary'];
}

function getProactiveInsight(pathname) {
  if (pathname.startsWith('/digital-twin')) {
    return '⚡ Sector-12 HRI has increased from 25 to 42. Heat exposure and water stagnation both spiked.';
  }
  if (pathname.startsWith('/intervention-planner')) {
    return "🎯 This ward's risk is primarily environmental. Fogging alone won't help — drain desilting targets the root cause.";
  }
  if (pathname.startsWith('/hospital-reporting')) {
    return '📊 2 hospitals are reporting above 85% bed occupancy. ICU availability tight.';
  }
  return null;
}

function buildSystemPrompt(pathname, selectedWardId = null) {
  // Citizen mode — friendly, jargon-free
  if (isCitizenPage(pathname)) {
    const dataContext = buildCopilotContext('Community Portal', null, null);
    return `You are Aheadly Health Assistant — a friendly, simple health advisor for citizens of Solapur.

LIVE CITY DATA:
${dataContext}

RULES:
- Use simple, warm language. No medical jargon. No acronyms without explanation.
- Be reassuring. Always recommend seeing a doctor for serious symptoms.
- Can answer: "Is there dengue in my area?", "Where can I get vaccinated?", "My child has fever what should I do?"
- Reference ward-specific data: "Your ward (Sector-12) currently has MODERATE dengue risk"
- NEVER diagnose — only provide general health guidance and encourage professional consultation.
- Respond in Hindi or Marathi if the user writes in those languages.
- Keep responses brief and friendly — 2-4 sentences for simple questions.
- Bold the most important piece of advice.`;
  }

  const page = getPageLabel(pathname);
  const dataContext = buildCopilotContext(page, selectedWardId, null);
  const wardNote = selectedWardId
    ? `The user has selected ${selectedWardId} on the map — answer questions in the context of that ward unless the user asks about the full city.`
    : `No ward is currently selected — answer using city-wide data.`;
  return `You are Aheadly Copilot — AI health intelligence for Solapur Municipal Corporation.
Deep knowledge of: Ward-level HRI (scored out of 100), HRI components (Heat Exposure, Water Stagnation, Vector Density, Disease Burden, Sanitation Stress — each scored 0-20), disease surveillance (Dengue, Respiratory, Gastro, Cholera, Malaria, Typhoid, Diarrhoea), community sanitation reports, hospital capacity and medicine stock, vaccination and child immunization coverage.
Core thesis: Cities fail when multiple risk signals CONVERGE simultaneously — single signals are noise, overlapping signals are danger.

LIVE SYSTEM DATA (as of now):
${dataContext}
CONTEXT: ${wardNote}
PERSONALITY: Confident, data-driven, action-oriented. Connect dots between signals. Keep responses 2-4 sentences for simple questions. Use specific ward names, HRI values, and numbers from the data above. Bold the most important insight. Frame risk as CONVERGENCE. Never make up numbers — use only what's in the data above.`;
}

function pickDemoFallback(message) {

  const lower = message.toLowerCase();
  if (
    lower.includes('briefing') ||
    lower.includes('summary') ||
    lower.includes('status') ||
    lower.includes('priority') ||
    lower.includes('trend')
  ) {
    return DEMO_FALLBACKS.briefing;
  }
  if (
    lower.includes('risk') ||
    lower.includes('hri') ||
    lower.includes('driving') ||
    lower.includes('why')
  ) {
    return DEMO_FALLBACKS.risk;
  }
  if (
    lower.includes('intervention') ||
    lower.includes('prioritize') ||
    lower.includes('impact') ||
    lower.includes('desilting') ||
    lower.includes('fogging')
  ) {
    return DEMO_FALLBACKS.interventions;
  }
  return DEMO_FALLBACKS.briefing;
}

// ---------------------------------------------------------------------------
// Gemini API
// ---------------------------------------------------------------------------

async function askGemini(userMessage, conversationHistory, systemPrompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [
          ...conversationHistory.map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          })),
          { role: 'user', parts: [{ text: userMessage }] },
        ],
        generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
      }),
    }
  );
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

// ---------------------------------------------------------------------------
// Markdown-lite renderer (bold + line breaks, no external deps)
// ---------------------------------------------------------------------------

function renderMarkdown(text) {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const segments = [];
    const boldRegex = /\*\*(.+?)\*\*/g;
    let lastIdx = 0;
    let match;
    while ((match = boldRegex.exec(line)) !== null) {
      if (match.index > lastIdx) {
        segments.push(line.slice(lastIdx, match.index));
      }
      segments.push(<strong key={`b-${lineIdx}-${match.index}`}>{match[1]}</strong>);
      lastIdx = match.index + match[0].length;
    }
    if (lastIdx < line.length) {
      segments.push(line.slice(lastIdx));
    }
    return (
      <React.Fragment key={lineIdx}>
        {segments.length > 0 ? segments : line}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

// ---------------------------------------------------------------------------
// Animations
// ---------------------------------------------------------------------------

const pulseGlow = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(20, 145, 155, 0.6), 0 4px 20px rgba(13, 115, 119, 0.4); }
  50%  { box-shadow: 0 0 0 12px rgba(20, 145, 155, 0.0), 0 4px 28px rgba(13, 115, 119, 0.6); }
  100% { box-shadow: 0 0 0 0 rgba(20, 145, 155, 0.6), 0 4px 20px rgba(13, 115, 119, 0.4); }
`;

const dotsAnimation = keyframes`
  0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
  40%            { opacity: 1;   transform: scale(1); }
`;

// ---------------------------------------------------------------------------
// Styled components
// ---------------------------------------------------------------------------

const TriggerButton = styled.button`
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #0d7377 0%, #14919b 100%);
  color: #fff;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
  animation: ${pulseGlow} 3s ease-in-out infinite;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.08);
  }

  &:active {
    transform: scale(0.96);
  }
`;

const BadgeDot = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #f4845f;
  border: 2px solid #0d7377;
`;

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 9998;
`;

const Panel = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  width: 380px;
  height: 100vh;
  background: #1a1a2e;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 32px rgba(0, 0, 0, 0.5);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  @media (max-width: 420px) {
    width: 100vw;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  flex-shrink: 0;
`;

const HeaderTitle = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.01em;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
  font-size: 20px;
  line-height: 1;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.15s ease, background 0.15s ease;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.08);
  }
`;

const ContextPill = styled.div`
  margin: 12px 20px 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(13, 115, 119, 0.18);
  border: 1px solid rgba(20, 145, 155, 0.35);
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 11.5px;
  color: #14919b;
  font-weight: 500;
  width: fit-content;
  flex-shrink: 0;
`;

const ChatArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.12);
    border-radius: 4px;
  }
`;

const BubbleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isUser }) => ($isUser ? 'flex-end' : 'flex-start')};
`;

const Bubble = styled.div`
  max-width: 88%;
  padding: 10px 14px;
  border-radius: ${({ $isUser }) =>
    $isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};
  font-size: 13.5px;
  line-height: 1.55;
  color: #fff;
  word-break: break-word;

  ${({ $isUser }) =>
    $isUser
      ? css`
          background: #0d7377;
        `
      : css`
          background: #1e293b;
          border-left: 3px solid #0d7377;
        `}
`;

const ProactiveBubble = styled(Bubble)`
  background: rgba(244, 132, 95, 0.12);
  border-left: 3px solid #f4845f;
  font-size: 13px;
`;

const TimestampLabel = styled.span`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 4px;
  padding: 0 4px;
`;

const LoadingBubble = styled(Bubble)`
  display: flex;
  gap: 5px;
  align-items: center;
  padding: 12px 18px;
`;

const Dot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(20, 145, 155, 0.8);
  display: inline-block;
  animation: ${dotsAnimation} 1.2s ease-in-out infinite;
  animation-delay: ${({ $i }) => $i * 0.2}s;
`;

const QuickPromptsWrapper = styled.div`
  padding: 8px 16px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  flex-shrink: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const Chip = styled.button`
  background: rgba(13, 115, 119, 0.14);
  border: 1px solid rgba(20, 145, 155, 0.3);
  border-radius: 14px;
  color: #14919b;
  font-size: 11.5px;
  font-weight: 500;
  padding: 5px 11px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(13, 115, 119, 0.28);
    border-color: rgba(20, 145, 155, 0.6);
    color: #fff;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  flex-shrink: 0;
`;

const ChatInput = styled.textarea`
  flex: 1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 13.5px;
  font-family: inherit;
  padding: 9px 12px;
  resize: none;
  outline: none;
  min-height: 38px;
  max-height: 110px;
  line-height: 1.45;
  transition: border-color 0.15s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.28);
  }

  &:focus {
    border-color: rgba(20, 145, 155, 0.55);
  }
`;

const SendBtn = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #0d7377, #14919b);
  color: #fff;
  font-size: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.15s ease, transform 0.15s ease;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    opacity: 0.9;
    transform: scale(1.05);
  }
`;

// ---------------------------------------------------------------------------
// Panel animation variants
// ---------------------------------------------------------------------------

const panelVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 340, damping: 34 },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.22, ease: 'easeIn' },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function AheadlyCopilot() {
  const location = useLocation();
  const pathname = location.pathname;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [proactiveShown, setProactiveShown] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [selectedWardId, setSelectedWardId] = useState(null);

  const chatBottomRef = useRef(null);
  const inputRef = useRef(null);
  const prevPathnameRef = useRef(pathname);

  const proactiveInsight = getProactiveInsight(pathname);

  // Show badge dot when there's a proactive insight and panel is closed
  useEffect(() => {
    if (proactiveInsight && !isOpen) {
      setHasUnread(true);
    }
  }, [proactiveInsight, isOpen]);

  // Reset proactive flag on page change
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      setProactiveShown(false);
    }
  }, [pathname]);

  // Inject proactive message when panel opens (once per page)
  useEffect(() => {
    if (isOpen && proactiveInsight && !proactiveShown) {
      setProactiveShown(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `proactive-${Date.now()}`,
          role: 'proactive',
          content: proactiveInsight,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, proactiveInsight, proactiveShown]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Listen for sidebar "✦ AI Copilot" button to open panel
  useEffect(() => {
    const handle = () => setIsOpen(true);
    window.addEventListener('aheadly-open-copilot', handle);
    return () => window.removeEventListener('aheadly-open-copilot', handle);
  }, []);

  // Track which ward is selected on the map
  useEffect(() => {
    const onSelect = (e) => setSelectedWardId(e.detail?.wardId || null);
    const onDeselect = () => setSelectedWardId(null);
    window.addEventListener('aheadly-ward-selected', onSelect);
    window.addEventListener('aheadly-ward-deselected', onDeselect);
    return () => {
      window.removeEventListener('aheadly-ward-selected', onSelect);
      window.removeEventListener('aheadly-ward-deselected', onDeselect);
    };
  }, []);


  const handleOpen = () => {
    setIsOpen(true);
    setHasUnread(false);
  };

  const handleClose = () => setIsOpen(false);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue('');
      setIsLoading(true);

      // Build conversation history (exclude proactive & welcome for API)
      const history = messages.filter(
        (m) => m.role === 'user' || m.role === 'assistant'
      );

      let responseText = null;

      if (GEMINI_API_KEY) {
        try {
          responseText = await askGemini(trimmed, history, buildSystemPrompt(pathname, selectedWardId));
        } catch (err) {
          console.warn('[AheadlyCopilot] Gemini API error, using fallback:', err);
        }
      }

      if (!responseText) {
        responseText = pickDemoFallback(trimmed);
      }

      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: responseText,
          timestamp: new Date(),
        },
      ]);
    },
    [isLoading, messages, pathname, selectedWardId]
  );

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleSendClick = () => sendMessage(inputValue);

  const handleChipClick = (prompt) => {
    sendMessage(prompt);
  };

  const quickPrompts = getQuickPrompts(pathname);
  const pageLabel = getPageLabel(pathname);

  return (
    <>
      {/* Floating trigger */}
      <TriggerButton
        onClick={handleOpen}
        aria-label="Open Aheadly Copilot"
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        ✦
        {hasUnread && <BadgeDot />}
      </TriggerButton>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dim overlay */}
            <Overlay
              key="overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={handleClose}
            />

            {/* Slide-out panel */}
            <Panel
              key="panel"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Header */}
              <PanelHeader>
                <HeaderTitle>✦ Aheadly Copilot</HeaderTitle>
                <CloseBtn onClick={handleClose} aria-label="Close copilot">
                  ✕
                </CloseBtn>
              </PanelHeader>

              {/* Context pill */}
              <ContextPill>
                📍 Viewing: {pageLabel}{selectedWardId ? ` · ${selectedWardId}` : ''}
              </ContextPill>

              {/* Messages */}
              <ChatArea>
                {messages.map((msg) => {
                  if (msg.role === 'proactive') {
                    return (
                      <BubbleWrapper key={msg.id} $isUser={false}>
                        <ProactiveBubble $isUser={false}>
                          {renderMarkdown(msg.content)}
                        </ProactiveBubble>
                        <TimestampLabel>{formatTime(msg.timestamp)}</TimestampLabel>
                      </BubbleWrapper>
                    );
                  }
                  const isUser = msg.role === 'user';
                  return (
                    <BubbleWrapper key={msg.id} $isUser={isUser}>
                      <Bubble $isUser={isUser}>
                        {renderMarkdown(msg.content)}
                      </Bubble>
                      <TimestampLabel>{formatTime(msg.timestamp)}</TimestampLabel>
                    </BubbleWrapper>
                  );
                })}

                {/* Loading dots */}
                {isLoading && (
                  <BubbleWrapper $isUser={false}>
                    <LoadingBubble $isUser={false}>
                      <Dot $i={0} />
                      <Dot $i={1} />
                      <Dot $i={2} />
                    </LoadingBubble>
                  </BubbleWrapper>
                )}

                <div ref={chatBottomRef} />
              </ChatArea>

              {/* Quick prompts */}
              <QuickPromptsWrapper>
                {quickPrompts.map((prompt) => (
                  <Chip
                    key={prompt}
                    onClick={() => handleChipClick(prompt)}
                    disabled={isLoading}
                  >
                    {prompt}
                  </Chip>
                ))}
              </QuickPromptsWrapper>

              {/* Input row */}
              <InputRow>
                <ChatInput
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Ask about wards, risks, interventions…"
                  rows={1}
                  disabled={isLoading}
                />
                <SendBtn
                  onClick={handleSendClick}
                  disabled={isLoading || !inputValue.trim()}
                  aria-label="Send message"
                >
                  ➤
                </SendBtn>
              </InputRow>
            </Panel>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default AheadlyCopilot;
