import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { plannerQueue } from "../../services/plannerState";
import { FiX } from "react-icons/fi";

const PillContainer = styled(motion.div)`
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%) !important; /* Framer Motion overrides this sometimes, so we use margin or flex instead */
  background: #14b8a6;
  color: white;
  padding: 10px 16px 10px 20px;
  border-radius: 100px;
  box-shadow: 0 10px 25px rgba(20, 184, 166, 0.4);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 9999;
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  
  &:hover {
    background: #0f9d8f;
  }
`;

const DismissBtn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const PlannerPill = () => {
  const [unconsumed, setUnconsumed] = useState([]);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial fetch
    setUnconsumed(plannerQueue.getUnconsumed());
    
    // Subscribe to changes
    const unsub = plannerQueue.subscribe(() => {
      setUnconsumed(plannerQueue.getUnconsumed());
      setDismissed(false); // Reshow if new items added
    });
    
    return unsub;
  }, []);

  if (unconsumed.length === 0 || dismissed) return null;

  const handleGo = (e) => {
    if (e.target.closest("#dismiss-pill")) return;
    navigate("/intervention-planner");
  };

  const str = unconsumed.length === 1 ? "1 alert queued" : `${unconsumed.length} alerts queued`;

  return (
    <div style={{ position: "fixed", bottom: 32, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 9999, pointerEvents: "none" }}>
    <AnimatePresence>
      <PillContainer
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        onClick={handleGo}
        style={{ pointerEvents: "auto", position: "relative", bottom: "auto", left: "auto", transform: "none" }}
      >
        <span>⚡ {str} → Go to Intervention Planner</span>
        <DismissBtn id="dismiss-pill" onClick={(e) => { e.stopPropagation(); setDismissed(true); }}>
          <FiX size={14} />
        </DismissBtn>
      </PillContainer>
    </AnimatePresence>
    </div>
  );
};

export default PlannerPill;
