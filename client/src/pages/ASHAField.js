import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiFileText, FiClock, FiChevronDown, FiChevronUp, 
  FiHome, FiBell, FiActivity, FiX, FiCheck, FiMic, FiZap, FiCamera
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// ─── CONSTANTS & DICTIONARY ────────────────────────────────────────────────
const TEAL = '#00d4aa'; 
const TEAL_BG = 'rgba(0, 212, 170, 0.1)';
const RED = '#ef4444';
const YELLOW = '#f59e0b';
const AMBER = '#fbbf24';

const TRANSLATIONS = {
  en: {
    langToggle: "EN | मर",
    online: "● Synced",
    offline: "⚠ Offline — 3 surveys pending upload",
    syncNow: "Sync Now",
    syncSuccess: "✓ 3 surveys uploaded",
    workerName: "Sunita Pawar",
    workerId: "ASHA ID: SMC-ASHA-0142 · Ward 12",
    viewPassport: "🪪 View Passport",
    briefTitle: "📋 Today's Brief — Ward 12",
    briefRead: "I've read this",
    streak: "🔥 18-day survey streak",
    topPerformer: "🏆 Top Performer — Ward 12 this week",
    surveysCompleted: "47 surveys completed this month",
    routeTitle: "TODAY'S ROUTE · 12 Assigned",
    completed: "COMPLETED",
    pending: "PENDING",
    skipped: "SKIPPED",
    startSurvey: "Start Survey →",
    viewSummary: "View Summary",
    progress: "4 / 12 completed",
    escalate: "Escalate",
    escalationTitle: "Emergency Escalation",
    critPatient: "🔴 Critical Patient — Needs Immediate Care",
    diseaseCluster: "🟠 Disease Cluster Suspected",
    infraEmerg: "🟡 Infrastructure Emergency (e.g. open drain)",
    sendAlert: "Send Alert",
    alertSent: "Alert sent to SMC Health Command and Ward Supervisor. Response expected within 2 hours.",
    next: "Next →",
    submit: "Submit Survey →",
    passportHeader: "AHEADLY · Solapur Municipal Corporation",
    passportAuth: "SMC AUTHORISED FIELD HEALTH WORKER",
    passportFooter: "This worker is authorised to conduct household health surveys on behalf of SMC",
    share: "Share / Show to Resident",
    scanQR: "Scan to verify identity",

    // Brief content
    briefHRI: "Ward HRI today: 74 — HIGH",
    briefAlertLabel: "Priority alert:",
    briefAlertDesc: "Dengue signals rising in your sector. Check for fever, joint pain, and stagnant water in every household today.",
    briefFocusLabel: "Focus areas:",
    briefFocusDesc: "Mangalwar Peth and Gandhi Chowk — 3 HIGH risk households flagged from yesterday.",
    briefWeatherLabel: "Weather note:",
    briefWeatherDesc: "Humidity 84% today — prime mosquito breeding conditions. Prioritize stagnation checks.",
    briefVaccineLabel: "Vaccination reminder:",
    briefVaccineDesc: "2 households on your route have overdue polio doses.",

    // Alerts tab
    alertsHeader: "Notifications & Alerts",
    alert1Title: "Dengue Cluster — Mangalwar Peth",
    alert1Time: "2h ago",
    alert1Desc: "SMC Health Command flagged 3 HIGH risk households near your route.",
    alert2Title: "Vaccination Drive — Ward 12",
    alert2Time: "5h ago",
    alert2Desc: "Polio drive scheduled for 22 March. 4 overdue households on your list.",
    alert3Title: "Weather Advisory",
    alert3Time: "Yesterday",
    alert3Desc: "High humidity forecast for next 3 days. Prioritise stagnant water checks.",
    alert4Title: "Sync Complete",
    alert4Time: "Yesterday",
    alert4Desc: "3 surveys uploaded successfully to SMC Health server.",

    // Surveys tab
    surveysMonthHeader: "This Month — March 2026",
    recentSurveys: "Recent Surveys",
    todayPending: "Today — Pending",
    todayLabel: "Today",
    yesterdayLabel: "Yesterday",

    // Profile tab
    workSummary: "Work Summary",
    surveysMonthLabel: "Surveys this month",
    surveyStreakLabel: "Survey streak",
    streakVal: "🔥 18 days",
    hhCoverage: "HH coverage — Ward 12",
    escalationsRaised: "Escalations raised",
    detailsLabel: "Details",
    supervisorLabel: "Supervisor",
    wardAssignLabel: "Ward assignment",
    wardAssignVal: "Ward 12 — Sector-12",
    activeSinceLabel: "Active since",
    helplineLabel: "Helpline",
    signOut: "Sign Out",

    // Passport detail labels
    passportWardLabel: "Ward Assignment:",
    passportSinceLabel: "Active Since:",
    passportSupervisorLabel: "Supervisor:",
    passportHelplineLabel: "Helpline:",
    passportWardVal: "Ward 12 — Sector-12",
    passportSinceVal: "March 2021",
    passportSupervisorVal: "Dr. Meena Kulkarni",
    passportHelplineVal: "1800-XXX-XXXX",

    // Bottom nav
    navHome: "Home",
    navAlerts: "Alerts",
    navSurveys: "Surveys",
    navProfile: "Profile",

    // Survey
    beforeBegin: "Before You Begin",
    contextualAlert: "Contextual alert active. Complete checklist to begin:",
    stepLabel: "Step",
    stepOf: "of",
    step0_1: "Introduce yourself and show your ASHA Passport",
    step0_2: "Ask if any member has had fever in the last 7 days",
    step0_3: "Check surroundings for stagnant water / open containers before entering",
    step0_4: "Note if there are children under 5 or pregnant women (priority)",
    step0_5: "Confirm household ID matches your register",

    step1Title: "Step 1 — Household Details",
    labelSector: "Sector",
    labelHouseNo: "House Number",
    labelHHId: "Household ID (Read-only)",
    labelLandmark: "Landmark",
    labelResidents: "Number of residents",
    labelResName: "Resident name (Head of Household)",
    labelContact: "Contact number",
    sectorOpt1: "Sector-12 (Market Yard)",
    sectorOpt2: "Sector-11",
    step1_sec: "Sector: Sector-12 (Market Yard)",
    step1_hh: "House Number: 14-B",
    step1_id: "Household ID: HH-2024-0847",
    step1_lm: "Landmark: Near Siddheshwar Temple",
    step1_res: "Number of residents: 5",
    step1_head: "Resident name: Ramesh Thorat",
    step1_ph: "Contact: 98XXXXXXXX",

    step2Title: "Step 2 — Demographics",
    labelChildUnder5: "Children under 5",
    labelChild518: "Children 5-18",
    labelAdults: "Adults",
    labelSeniors: "Seniors (60+)",
    pregnantWomen: "Pregnant women in household",
    memberDisability: "Any member with disability",

    step3Title: "Step 3 — Symptoms (last 7 days)",
    symFever: "Fever",
    symJoint: "Joint/muscle pain",
    symHeadache: "Headache",
    symVomit: "Vomiting",
    symDiarrhea: "Diarrhoea",
    symRash: "Rash",
    labelSymDuration: "Symptom duration (days)",
    hospitalisation: "Any hospitalisation in last 30 days?",

    step4Title: "Step 4 — Sanitation & Environment",
    labelDrinkSrc: "Drinking water source",
    labelWaterStorage: "Water storage",
    labelStagnant: "Stagnant water nearby",
    labelToilet: "Toilet facility",
    openDrain: "Open drain visible",
    optMunTap: "Municipal tap",
    optWell: "Well / Borewell",
    optTanker: "Water Tanker",
    optClosed: "Closed containers",
    optOpenFlagged: "Open container (Flagged)",
    optNo: "No",
    optYesFront: "Yes — in front of house (Flagged)",
    optYesBack: "Yes — behind house (Flagged)",
    optIndoor: "Indoor flush",
    optPublic: "Public / Community toilet",

    step5Title: "Step 5 — Vaccination Status",
    child3yr: "Child (3yrs)",
    polio: "Polio",
    overdue: "⚠ OVERDUE",
    bcg: "BCG",
    doneTick: "✅ Done",
    measles: "Measles",
    adult34yr: "Adult (34yrs)",
    covidBooster: "COVID Booster",
    dueSoon: "⚠ Due soon",
    allOthers3: "All Others (3 members)",
    stdSchedule: "Standard schedule",
    upToDate: "✅ Up to date",
    advisedVaccines: "Advised on overdue vaccines",

    step6Title: "Step 6 — Voice Note (Optional)",
    voiceNoteDesc: "Describe anything unusual not captured in the form.",

    aiDebrief: "Aheadly AI Analysis",
    aiSub: "Based on survey data for HH-2024-0847",
    highRisk: "HIGH RISK",
    aiPoint1: "⚠ Fever + joint pain in 2 members — dengue symptom pattern",
    aiPoint2: "⚠ Open water storage + stagnant water outside — breeding site confirmed",
    aiPoint3: "⚠ Open drain visible — environmental risk factor",
    aiPoint4: "ℹ Child with overdue polio vaccination — vulnerability factor",
    clusterIntel: "Cluster Intelligence: 3 similar HIGH risk reports on this street this week. This may indicate an active disease cluster forming.",
    flagAlert: "🚨 Flag for SMC Alert",
    scheduleFollowup: "📅 Schedule follow-up in 3 days",
    close: "Next Household →"
  },
  mr: {
    langToggle: "EN | मर",
    online: "● सिंक झाले",
    offline: "⚠ ऑफलाइन — 3 सर्वेक्षणे प्रलंबित आहेत",
    syncNow: "आता सिंक करा",
    syncSuccess: "✓ 3 सर्वेक्षणे अपलोड केली",
    workerName: "सुनीता पवार",
    workerId: "ASHA ID: SMC-ASHA-0142 · प्रभाग 12",
    viewPassport: "🪪 पासपोर्ट पहा",
    briefTitle: "📋 आजचा गोषवारा — प्रभाग 12",
    briefRead: "मी हे वाचले आहे",
    streak: "🔥 18-दिवस सर्वेक्षण सलग",
    topPerformer: "🏆 सर्वोत्कृष्ट कामगार — या आठवड्यात",
    surveysCompleted: "या महिन्यात 47 सर्वेक्षणे पूर्ण झाली",
    routeTitle: "आजचा मार्ग · 12 नियुक्त",
    completed: "पूर्ण झाले",
    pending: "प्रलंबित",
    skipped: "वगळले",
    startSurvey: "सर्वेक्षण सुरू करा →",
    viewSummary: "सारांश पहा",
    progress: "4 / 12 पूर्ण",
    escalate: "तातडीची सूचना",
    escalationTitle: "आणीबाणी सूचना पाठवा",
    critPatient: "🔴 गंभीर रुग्ण — तातडीची काळजी आवश्यक",
    diseaseCluster: "🟠 आजाराचा समूह संशयित",
    infraEmerg: "🟡 पायाभूत आणीबाणी (उदा. खुली गटार)",
    sendAlert: "सूचना पाठवा",
    alertSent: "SMC आरोग्य विभागाला सूचना पाठवली आहे. 2 तासात प्रतिसाद अपेक्षित.",
    next: "पुढे →",
    submit: "सर्वेक्षण सबमिट करा →",
    passportHeader: "AHEADLY · सोलापूर महानगरपालिका",
    passportAuth: "SMC अधिकृत क्षेत्र आरोग्य कामगार",
    passportFooter: "या कामगाराला SMC च्या वतीने घरगुती आरोग्य सर्वेक्षण करण्यासाठी अधिकृत केले आहे",
    share: "रहिवाशांना दाखवा",
    scanQR: "ओळख सत्यापित करण्यासाठी स्कॅन करा",

    // Brief content
    briefHRI: "वॉर्ड HRI आज: 74 — उच्च",
    briefAlertLabel: "प्राधान्य सतर्कता:",
    briefAlertDesc: "डेंगूचे संकेत वाढत आहेत. आज प्रत्येक घरात ताप, सांधेदुखी आणि साचलेले पाणी तपासा.",
    briefFocusLabel: "लक्ष क्षेत्रे:",
    briefFocusDesc: "मंगळवार पेठ आणि गांधी चौक — कालपासून 3 उच्च धोक्याची घरे चिन्हांकित.",
    briefWeatherLabel: "हवामान नोंद:",
    briefWeatherDesc: "आज आर्द्रता 84% — डासांच्या प्रजननाची मुख्य परिस्थिती. साचलेल्या पाण्याची तपासणी प्राधान्याने करा.",
    briefVaccineLabel: "लसीकरण स्मरण:",
    briefVaccineDesc: "तुमच्या मार्गावरील 2 घरांचे पोलिओ डोस थकीत आहेत.",

    // Alerts tab
    alertsHeader: "सूचना आणि सतर्कता",
    alert1Title: "डेंगू समूह — मंगळवार पेठ",
    alert1Time: "2 तासांपूर्वी",
    alert1Desc: "SMC आरोग्य विभागाने तुमच्या मार्गाजवळ 3 उच्च धोक्याची घरे चिन्हांकित केली.",
    alert2Title: "लसीकरण मोहीम — प्रभाग 12",
    alert2Time: "5 तासांपूर्वी",
    alert2Desc: "22 मार्चला पोलिओ मोहीम नियोजित. तुमच्या यादीत 4 थकीत घरे.",
    alert3Title: "हवामान सल्ला",
    alert3Time: "काल",
    alert3Desc: "पुढील 3 दिवस उच्च आर्द्रतेचा अंदाज. साचलेल्या पाण्याची तपासणी प्राधान्याने करा.",
    alert4Title: "सिंक पूर्ण",
    alert4Time: "काल",
    alert4Desc: "3 सर्वेक्षणे यशस्वीरित्या SMC आरोग्य सर्व्हरवर अपलोड केली.",

    // Surveys tab
    surveysMonthHeader: "या महिन्यात — मार्च 2026",
    recentSurveys: "अलीकडील सर्वेक्षणे",
    todayPending: "आज — प्रलंबित",
    todayLabel: "आज",
    yesterdayLabel: "काल",

    // Profile tab
    workSummary: "कामाचा सारांश",
    surveysMonthLabel: "या महिन्यातील सर्वेक्षणे",
    surveyStreakLabel: "सर्वेक्षण सलग",
    streakVal: "🔥 18 दिवस",
    hhCoverage: "घर व्याप्ती — प्रभाग 12",
    escalationsRaised: "तातडीच्या सूचना पाठवल्या",
    detailsLabel: "तपशील",
    supervisorLabel: "पर्यवेक्षक",
    wardAssignLabel: "प्रभाग नियुक्ती",
    wardAssignVal: "प्रभाग 12 — विभाग-12",
    activeSinceLabel: "पासून सक्रिय",
    helplineLabel: "हेल्पलाइन",
    signOut: "बाहेर पडा",

    // Passport detail labels
    passportWardLabel: "प्रभाग नियुक्ती:",
    passportSinceLabel: "पासून सक्रिय:",
    passportSupervisorLabel: "पर्यवेक्षक:",
    passportHelplineLabel: "हेल्पलाइन:",
    passportWardVal: "प्रभाग 12 — विभाग-12",
    passportSinceVal: "मार्च 2021",
    passportSupervisorVal: "डॉ. मीना कुलकर्णी",
    passportHelplineVal: "1800-XXX-XXXX",

    // Bottom nav
    navHome: "मुखपृष्ठ",
    navAlerts: "सतर्कता",
    navSurveys: "सर्वेक्षणे",
    navProfile: "प्रोफाइल",

    // Survey Translations
    beforeBegin: "सुरू करण्यापूर्वी",
    contextualAlert: "संदर्भात्मक सतर्कता सक्रिय. सुरू करण्यापूर्वी यादी पूर्ण करा:",
    stepLabel: "पायरी",
    stepOf: "पैकी",
    step0_1: "तुमची ओळख करून द्या आणि तुमचा ASHA पासपोर्ट दाखवा",
    step0_2: "गेल्या 7 दिवसात कोणाला ताप आला होता का ते विचारा",
    step0_3: "प्रवेश करण्यापूर्वी साचलेले पाणी / उघडे डबे तपासा",
    step0_4: "5 वर्षांखालील मुले किंवा गर्भवती महिला आहेत का याची नोंद घ्या",
    step0_5: "घरगुती आयडी तुमच्या रजिस्टरशी जुळतो का याची पुष्टी करा",

    step1Title: "पायरी 1 — घराचा तपशील",
    labelSector: "विभाग",
    labelHouseNo: "घर क्रमांक",
    labelHHId: "घर आयडी (फक्त वाचन)",
    labelLandmark: "खूण",
    labelResidents: "रहिवाशांची संख्या",
    labelResName: "रहिवाशाचे नाव (कुटुंब प्रमुख)",
    labelContact: "संपर्क क्रमांक",
    sectorOpt1: "विभाग-12 (मार्केट यार्ड)",
    sectorOpt2: "विभाग-11",
    step1_sec: "विभाग: विभाग-12 (मार्केट यार्ड)",
    step1_hh: "घर क्रमांक: 14-B",
    step1_id: "घर आयडी: HH-2024-0847",
    step1_lm: "खूण: सिद्धेश्वर मंदिराजवळ",
    step1_res: "रहिवाशांची संख्या: 5",
    step1_head: "रहिवाशाचे नाव: रमेश थोरात",
    step1_ph: "संपर्क: 98XXXXXXXX",

    step2Title: "पायरी 2 — लोकसंख्याशास्त्र",
    labelChildUnder5: "5 वर्षांखालील मुले",
    labelChild518: "5-18 वर्षे मुले",
    labelAdults: "प्रौढ",
    labelSeniors: "ज्येष्ठ (60+)",
    pregnantWomen: "घरात गर्भवती महिला",
    memberDisability: "कोणताही अपंग सदस्य",

    step3Title: "पायरी 3 — लक्षणे (गेले 7 दिवस)",
    symFever: "ताप",
    symJoint: "सांधे/स्नायू दुखणे",
    symHeadache: "डोकेदुखी",
    symVomit: "उलटी",
    symDiarrhea: "जुलाब",
    symRash: "पुरळ",
    labelSymDuration: "लक्षणांचा कालावधी (दिवस)",
    hospitalisation: "गेल्या 30 दिवसांत कोणाला रुग्णालयात भरती केले?",

    step4Title: "पायरी 4 — स्वच्छता आणि पर्यावरण",
    labelDrinkSrc: "पिण्याचे पाण्याचे स्त्रोत",
    labelWaterStorage: "पाणीसाठा",
    labelStagnant: "जवळपास साचलेले पाणी",
    labelToilet: "शौचालय सुविधा",
    openDrain: "खुली गटार दृश्यमान",
    optMunTap: "महानगरपालिका नळ",
    optWell: "विहीर / बोअरवेल",
    optTanker: "पाण्याचा टँकर",
    optClosed: "बंद डबे",
    optOpenFlagged: "उघडा डबा (चिन्हांकित)",
    optNo: "नाही",
    optYesFront: "होय — घराच्या समोर (चिन्हांकित)",
    optYesBack: "होय — घराच्या मागे (चिन्हांकित)",
    optIndoor: "आतील फ्लश",
    optPublic: "सार्वजनिक / सामुदायिक शौचालय",

    step5Title: "पायरी 5 — लसीकरण स्थिती",
    child3yr: "मूल (3 वर्षे)",
    polio: "पोलिओ",
    overdue: "⚠ थकीत",
    bcg: "BCG",
    doneTick: "✅ झाले",
    measles: "गोवर",
    adult34yr: "प्रौढ (34 वर्षे)",
    covidBooster: "COVID बूस्टर",
    dueSoon: "⚠ लवकरच येणार",
    allOthers3: "इतर सर्व (3 सदस्य)",
    stdSchedule: "मानक वेळापत्रक",
    upToDate: "✅ अद्ययावत",
    advisedVaccines: "थकीत लसींबाबत सल्ला दिला",

    step6Title: "पायरी 6 — व्हॉइस नोट (पर्यायी)",
    voiceNoteDesc: "फॉर्ममध्ये न नोंदलेली कोणतीही असामान्य गोष्ट सांगा.",

    aiDebrief: "Aheadly AI विश्लेषण",
    aiSub: "HH-2024-0847 च्या सर्वेक्षण डेटावर आधारित",
    highRisk: "उच्च धोका",
    aiPoint1: "⚠ 2 सदस्यांना ताप + सांधेदुखी — डेंगूची लक्षणे",
    aiPoint2: "⚠ उघडा पाणीसाठा + बाहेर साचलेले पाणी — प्रजनन स्थळ निश्चित",
    aiPoint3: "⚠ खुली गटार दृश्यमान — पर्यावरणीय धोका घटक",
    aiPoint4: "ℹ पोलिओ लसीकरण थकीत असलेले मूल — असुरक्षितता घटक",
    clusterIntel: "क्लस्टर माहिती: या आठवड्यात या रस्त्यावर 3 समान उच्च धोक्याचे अहवाल. हे सक्रिय रोग समूह तयार होण्याचे संकेत देऊ शकते.",
    flagAlert: "🚨 SMC सतर्कतेसाठी चिन्हांकित करा",
    scheduleFollowup: "📅 3 दिवसांत फॉलो-अप नियोजित करा",
    close: "पुढचे घर →"
  }
};

// ─── STYLED COMPONENTS ─────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  background: #000;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  font-family: 'Inter', system-ui, sans-serif;
  color: white;
  user-select: none;
`;

const MobileShell = styled.div`
  width: 100%;
  max-width: 480px;
  background: #0f111a;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 0 40px rgba(0,0,0,0.5);
  padding-bottom: 70px;
  overflow-x: hidden;
`;

const TopBarContainer = styled.div`
  background: #151821;
  padding: 16px 20px;
  border-bottom: 1px solid #1e212b;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: sticky;
  top: 0;
  z-index: 50;
`;

const WorkerDetails = styled.div`
  .name {
    font-size: 1.1rem;
    font-weight: 800;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .sub {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.5);
    font-weight: 600;
  }
`;

const PassportBtn = styled.button`
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  color: ${TEAL};
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 6px;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
`;

const LangToggle = styled.button`
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
`;

const SyncChip = styled.div`
  background: ${p => p.$offline ? 'rgba(251, 191, 36, 0.15)' : 'rgba(16, 185, 129, 0.15)'};
  color: ${p => p.$offline ? AMBER : '#10b981'};
  border: 1px solid ${p => p.$offline ? 'rgba(251, 191, 36, 0.4)' : 'rgba(16, 185, 129, 0.4)'};
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: ${p => p.$offline ? 'pulse 2s infinite' : 'none'};

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.6; }
    100% { opacity: 1; }
  }
`;

const ManualSyncBtn = styled.button`
  background: ${AMBER};
  color: #000;
  border: none;
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 0.7rem;
  font-weight: 800;
  cursor: pointer;
`;

const ScrollContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  padding-bottom: 100px;
`;

// Brief Card
const BriefCard = styled(motion.div)`
  background: #1a1d26;
  border: 1px solid #2a2e39;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
`;

const BriefContent = styled(motion.div)`
  overflow: hidden;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.7);
  line-height: 1.6;

  .hri {
    display: inline-block;
    background: rgba(239,68,68,0.15);
    color: ${RED};
    font-weight: 800;
    padding: 4px 8px;
    border-radius: 6px;
    margin: 8px 0;
  }
  
  ul {
    padding-left: 20px;
    margin: 10px 0;
    li { margin-bottom: 8px; }
  }
`;

const CollapseBtn = styled.button`
  background: transparent;
  color: ${TEAL};
  border: 1px solid ${TEAL};
  border-radius: 8px;
  width: 100%;
  padding: 10px;
  font-weight: 700;
  margin-top: 10px;
  cursor: pointer;
`;

// Streak Strip
const StreakStrip = styled.div`
  background: linear-gradient(90deg, #151821, #1a1d26);
  border: 1px solid #2a2e39;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255,255,255,0.7);

  div { 
    display: flex; align-items: center; gap: 8px; 
    color: white; 
  }
`;

// Route Section
const SectionHeader = styled.div`
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.5);
  margin-bottom: 12px;
  text-transform: uppercase;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #2a2e39;
  border-radius: 4px;
  margin-bottom: 20px;
  overflow: hidden;
  
  .fill {
    height: 100%;
    width: 33%;
    background: ${TEAL};
  }
`;

const HHCard = styled.div`
  background: ${p => p.$completed ? '#11131a' : '#1a1d26'};
  border: 1px solid ${p => p.$completed ? '#1e212b' : '#2a2e39'};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  opacity: ${p => p.$completed ? 0.6 : 1};
  transition: opacity 0.2s;
`;

const HHAddress = styled.div`
  font-size: 1.1rem;
  font-weight: 800;
  color: white;
  margin-bottom: 4px;
  text-decoration: ${p => p.$completed ? 'line-through' : 'none'};
`;

const HHMeta = styled.div`
  font-size: 0.8rem;
  color: rgba(255,255,255,0.5);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const HHStatus = styled.div`
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 6px;
  background: ${p => p.$bg};
  color: ${p => p.$color};
`;

const PrimaryBtn = styled.button`
  background: ${TEAL};
  color: #000;
  border: none;
  border-radius: 10px;
  padding: 12px;
  width: 100%;
  font-weight: 800;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 16px;
`;

// Floating Escalation
const EscalateBtn = styled(motion.button)`
  position: absolute;
  bottom: 90px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${RED};
  color: white;
  border: none;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  
  svg { font-size: 1.5rem; }
  span { font-size: 0.6rem; font-weight: 800; margin-top: 2px;}
`;

// Bottom Nav
const BottomNav = styled.div`
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: #151821;
  border-top: 1px solid #1e212b;
  display: flex;
  justify-content: space-around;
  padding: 12px 0 20px;
  z-index: 50;
`;

const NavItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: ${p => p.$active ? TEAL : '#64748b'};
  font-size: 0.65rem;
  font-weight: 700;
  cursor: pointer;

  svg { font-size: 1.3rem; }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.7);
  margin-bottom: 6px;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  background: #11131a;
  border: 1px solid #2a2e39;
  padding: 14px 16px;
  border-radius: 10px;
  color: white;
  font-family: inherit;
  font-size: 0.95rem;
  box-sizing: border-box;

  &:focus { outline: none; border-color: ${TEAL}; }
  &:disabled { color: rgba(255,255,255,0.4); background: #0f111a; }
`;

const Select = styled.select`
  width: 100%;
  background: #11131a;
  border: 1px solid #2a2e39;
  padding: 14px 16px;
  border-radius: 10px;
  color: white;
  font-family: inherit;
  font-size: 0.95rem;
  box-sizing: border-box;

  &:focus { outline: none; border-color: ${TEAL}; }
`;

const CheckRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #11131a;
  padding: 16px;
  border-radius: 10px;
  border: 1px solid ${p => p.$checked ? TEAL : '#2a2e39'};
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;

  .text {
    color: white;
    font-size: 0.95rem;
    font-weight: 600;
  }
  .box {
    width: 24px; height: 24px;
    border-radius: 6px;
    border: 2px solid ${p => p.$checked ? TEAL : '#4a4e59'};
    background: ${p => p.$checked ? TEAL : 'transparent'};
    display: flex; align-items: center; justify-content: center;
  }
`;

const PillSelector = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const PillBtn = styled.div`
  background: ${p => p.$active ? TEAL_BG : '#11131a'};
  color: ${p => p.$active ? TEAL : '#94a3b8'};
  border: 1px solid ${p => p.$active ? TEAL : '#2a2e39'};
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
`;


export default function ASHAField() {
  const [lang, setLang] = useState('mr');
  const [offline, setOffline] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [briefOpen, setBriefOpen] = useState(true);
  const [showPassport, setShowPassport] = useState(false);
  const [showEscalation, setShowEscalation] = useState(false);
  const [surveyStep, setSurveyStep] = useState(null); // null = not in survey
  const [activeTab, setActiveTab] = useState('home');
  
  // Checklist State
  const [checks, setChecks] = useState([false, false, false, false, false]);
  
  // Interactive Survey Form State
  const [demoState, setDemoState] = useState({
    fever: true, joint: true, headache: false, vomit: false, diarrhea: false, rash: false,
    stagnantWater: 'yes_front', drinkingSource: 'mun_tap', drain: true, advised: true
  });
  
  const toggleDemo = (key) => setDemoState(s => ({...s, [key]: !s[key]}));

  useEffect(() => {
    const saved = localStorage.getItem('asha_lang');
    if (saved) setLang(saved);
    toast("Day 18 — keep it going, Sunita! 💪", { icon: '🔥', duration: 4000 });
  }, []);

  const t = (key) => TRANSLATIONS[lang][key] || TRANSLATIONS.en[key];

  const handleLangToggle = () => {
    const next = lang === 'en' ? 'mr' : 'en';
    setLang(next);
    localStorage.setItem('asha_lang', next);
  };

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setOffline(false);
      toast.success(t('syncSuccess'));
    }, 1500);
  };

  const handleEscalation = () => {
    setShowEscalation(false);
    toast.success(t('alertSent'), { duration: 5000 });
  };
  
  const allChecked = checks.every(c => c);

  return (
    <PageWrapper>
      <MobileShell>
        {/* TOP BAR */}
        <TopBarContainer>
          <WorkerDetails>
            <div className="name">{t('workerName')}</div>
            <div className="sub">{t('workerId')}</div>
            <PassportBtn onClick={() => setShowPassport(true)}>{t('viewPassport')}</PassportBtn>
          </WorkerDetails>
          <Controls>
            <LangToggle onClick={handleLangToggle}>{t('langToggle')}</LangToggle>
            <SyncChip $offline={offline} onClick={() => setOffline(!offline)}>
              {offline ? t('offline') : t('online')}
            </SyncChip>
            {offline && <ManualSyncBtn onClick={handleSync}>{t('syncNow')}</ManualSyncBtn>}
          </Controls>
        </TopBarContainer>

        {/* HOME SCROLL VIEW */}
        {surveyStep === null && activeTab === 'home' && (
          <ScrollContent>
            {/* Brief */}
            <BriefCard layout>
              <div style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 12, color: 'white' }} onClick={() => setBriefOpen(!briefOpen)}>
                {t('briefTitle')} {briefOpen ? <FiChevronUp style={{float:'right'}}/> : <FiChevronDown style={{float:'right'}}/>}
              </div>
              <AnimatePresence>
                {briefOpen && (
                  <BriefContent initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <div className="hri">{t('briefHRI')}</div>
                    <ul>
                      <li><b>{t('briefAlertLabel')}</b> {t('briefAlertDesc')}</li>
                      <li><b>{t('briefFocusLabel')}</b> {t('briefFocusDesc')}</li>
                      <li><b>{t('briefWeatherLabel')}</b> {t('briefWeatherDesc')}</li>
                      <li><b>{t('briefVaccineLabel')}</b> {t('briefVaccineDesc')}</li>
                    </ul>
                    <CollapseBtn onClick={() => setBriefOpen(false)}>{t('briefRead')}</CollapseBtn>
                  </BriefContent>
                )}
              </AnimatePresence>
            </BriefCard>

            {/* Streak */}
            <StreakStrip>
              <div>{t('streak')}</div>
              <div>{t('topPerformer')}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)' }}>{t('surveysCompleted')}</div>
            </StreakStrip>

            {/* Route List */}
            <SectionHeader>{t('routeTitle')}</SectionHeader>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>{t('progress')}</div>
            <ProgressBar><div className="fill" /></ProgressBar>

            <HHCard>
              <HHAddress>14-B Mangalwar Peth</HHAddress>
              <HHMeta>HH-2024-0847 · 👥 5 members · <span style={{ color: RED }}>● Last visit flag</span></HHMeta>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <HHStatus $bg="rgba(251, 191, 36, 0.15)" $color={AMBER}>{t('pending')}</HHStatus>
              </div>
              <PrimaryBtn onClick={() => setSurveyStep(0)}>{t('startSurvey')}</PrimaryBtn>
            </HHCard>

            <HHCard $completed>
              <HHAddress $completed>7 Rajiv Nagar Colony</HHAddress>
              <HHMeta>HH-2024-0842 · 👥 3 members</HHMeta>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <HHStatus $bg="rgba(16, 185, 129, 0.15)" $color="#10b981">{t('completed')}</HHStatus>
                <span style={{ color: TEAL, fontSize: '0.8rem', fontWeight: 600 }}>{t('viewSummary')}</span>
              </div>
            </HHCard>

          </ScrollContent>
        )}

        {/* ALERTS TAB */}
        {surveyStep === null && activeTab === 'alerts' && (
          <ScrollContent>
            <SectionHeader>{t('alertsHeader')}</SectionHeader>
            {[
              { icon: '🔴', title: t('alert1Title'), time: t('alert1Time'), desc: t('alert1Desc'), color: RED },
              { icon: '🟠', title: t('alert2Title'), time: t('alert2Time'), desc: t('alert2Desc'), color: AMBER },
              { icon: '🟡', title: t('alert3Title'), time: t('alert3Time'), desc: t('alert3Desc'), color: YELLOW },
              { icon: '✅', title: t('alert4Title'), time: t('alert4Time'), desc: t('alert4Desc'), color: '#10b981' },
            ].map((alert, i) => (
              <div key={i} style={{ background: '#1a1d26', border: '1px solid #2a2e39', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{alert.icon} {alert.title}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', marginLeft: 8 }}>{alert.time}</div>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{alert.desc}</div>
              </div>
            ))}
          </ScrollContent>
        )}

        {/* SURVEYS TAB */}
        {surveyStep === null && activeTab === 'surveys' && (
          <ScrollContent>
            <SectionHeader>{t('surveysMonthHeader')}</SectionHeader>
            <div style={{ background: '#1a1d26', border: '1px solid #2a2e39', borderRadius: 16, padding: 20, marginBottom: 24, display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div><div style={{ fontSize: '2rem', fontWeight: 900, color: TEAL }}>47</div><div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>{t('completed')}</div></div>
              <div style={{ width: 1, background: '#2a2e39' }} />
              <div><div style={{ fontSize: '2rem', fontWeight: 900, color: AMBER }}>8</div><div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>{t('pending')}</div></div>
              <div style={{ width: 1, background: '#2a2e39' }} />
              <div><div style={{ fontSize: '2rem', fontWeight: 900, color: '#64748b' }}>2</div><div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>{t('skipped')}</div></div>
            </div>

            <SectionHeader>{t('recentSurveys')}</SectionHeader>
            {[
              { hh: 'HH-2024-0847', addr: '14-B Mangalwar Peth', date: t('todayPending'), status: t('pending'), bg: 'rgba(251,191,36,0.15)', color: AMBER },
              { hh: 'HH-2024-0842', addr: '7 Rajiv Nagar Colony', date: t('todayLabel'), status: t('completed'), bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
              { hh: 'HH-2024-0831', addr: '3 Gandhi Chowk', date: t('yesterdayLabel'), status: t('completed'), bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
              { hh: 'HH-2024-0819', addr: '22 Siddheshwar Road', date: '18 Mar', status: t('completed'), bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
              { hh: 'HH-2024-0805', addr: '8 New Colony', date: '18 Mar', status: t('skipped'), bg: 'rgba(100,116,139,0.15)', color: '#64748b' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#1a1d26', border: '1px solid #2a2e39', borderRadius: 14, padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 4 }}>{s.addr}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{s.hh} · {s.date}</div>
                </div>
                <HHStatus $bg={s.bg} $color={s.color}>{s.status}</HHStatus>
              </div>
            ))}
          </ScrollContent>
        )}

        {/* PROFILE TAB */}
        {surveyStep === null && activeTab === 'profile' && (
          <ScrollContent>
            <div style={{ textAlign: 'center', paddingTop: 20, marginBottom: 32 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: TEAL_BG, border: `2px solid ${TEAL}`, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                <FiUser color={TEAL} />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{t('workerName')}</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{t('workerId')}</div>
              <PassportBtn style={{ marginTop: 12 }} onClick={() => setShowPassport(true)}>{t('viewPassport')}</PassportBtn>
            </div>

            <SectionHeader>{t('workSummary')}</SectionHeader>
            <div style={{ background: '#1a1d26', border: '1px solid #2a2e39', borderRadius: 16, padding: 20, marginBottom: 20 }}>
              {[
                { label: t('surveysMonthLabel'), value: '47' },
                { label: t('surveyStreakLabel'), value: t('streakVal') },
                { label: t('hhCoverage'), value: '78%' },
                { label: t('escalationsRaised'), value: '3' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 3 ? '1px solid #2a2e39' : 'none', fontSize: '0.88rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>{row.label}</span>
                  <span style={{ fontWeight: 800, color: 'white' }}>{row.value}</span>
                </div>
              ))}
            </div>

            <SectionHeader>{t('detailsLabel')}</SectionHeader>
            <div style={{ background: '#1a1d26', border: '1px solid #2a2e39', borderRadius: 16, padding: 20, marginBottom: 20 }}>
              {[
                { label: t('supervisorLabel'), value: t('passportSupervisorVal') },
                { label: t('wardAssignLabel'), value: t('wardAssignVal') },
                { label: t('activeSinceLabel'), value: t('passportSinceVal') },
                { label: t('helplineLabel'), value: t('passportHelplineVal') },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 3 ? '1px solid #2a2e39' : 'none', fontSize: '0.88rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>{row.label}</span>
                  <span style={{ fontWeight: 700, color: 'white', textAlign: 'right' }}>{row.value}</span>
                </div>
              ))}
            </div>

            <button style={{ width: '100%', background: '#1a1d26', border: '1px solid #2a2e39', color: RED, borderRadius: 12, padding: 14, fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}>
              {t('signOut')}
            </button>
          </ScrollContent>
        )}

        {/* SURVEY FLOW (FULL PAGE) */}
        {surveyStep !== null && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#0f111a', zIndex: 150, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #1e212b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{surveyStep === 0 ? t('beforeBegin') : surveyStep === 7 ? t('aiDebrief') : `${t('stepLabel')} ${surveyStep} ${t('stepOf')} 6`}</div>
              <FiX style={{ fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setSurveyStep(null)} />
            </div>

            <ScrollContent style={{ padding: '24px 20px', paddingBottom: 100 }}>
              {/* STEP 0: Pre-Survey Checklist */}
              {surveyStep === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: 10 }}>{t('contextualAlert')}</p>
                  {[t('step0_1'), t('step0_2'), t('step0_3'), t('step0_4'), t('step0_5')].map((text, i) => (
                    <div 
                      key={i} 
                      onClick={() => { const nc = [...checks]; nc[i] = !nc[i]; setChecks(nc); }}
                      style={{ background: checks[i] ? TEAL_BG : '#1a1d26', border: `1px solid ${checks[i] ? TEAL : '#2a2e39'}`, padding: 16, borderRadius: 12, display: 'flex', gap: 16, alignItems: 'flex-start' }}
                    >
                      <div style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${checks[i] ? TEAL : '#4a4e59'}`, background: checks[i] ? TEAL : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {checks[i] && <FiCheck color="#000" />}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: checks[i] ? 'white' : 'rgba(255,255,255,0.7)', fontWeight: checks[i] ? 700 : 500 }}>{text}</div>
                    </div>
                  ))}
                  <PrimaryBtn disabled={!allChecked} style={{ opacity: allChecked ? 1 : 0.5 }} onClick={() => setSurveyStep(1)}>{t('startSurvey')}</PrimaryBtn>
                </div>
              )}

              {/* STEP 1: Details */}
              {surveyStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: TEAL, marginBottom: 10 }}>{t('step1Title')}</div>
                  
                  <FormGroup>
                    <Label>{t('labelSector')}</Label>
                    <Select defaultValue="Sector-12">
                      <option value="Sector-12">{t('sectorOpt1')}</option>
                      <option value="Sector-11">{t('sectorOpt2')}</option>
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>{t('labelHouseNo')}</Label>
                    <Input defaultValue="14-B" />
                  </FormGroup>

                  <FormGroup>
                    <Label>{t('labelHHId')}</Label>
                    <Input disabled value="HH-2024-0847" />
                  </FormGroup>

                  <FormGroup>
                    <Label>{t('labelLandmark')}</Label>
                    <Input defaultValue="Near Siddheshwar Temple" />
                  </FormGroup>

                  <div style={{ height: 1, background: '#1e212b', margin: '20px 0' }} />

                  <FormGroup>
                    <Label>{t('labelResidents')}</Label>
                    <Input type="number" defaultValue="5" />
                  </FormGroup>

                  <FormGroup>
                    <Label>{t('labelResName')}</Label>
                    <Input defaultValue="Ramesh Thorat" />
                  </FormGroup>

                  <FormGroup>
                    <Label>{t('labelContact')}</Label>
                    <Input defaultValue="98XXXXXXXX" />
                  </FormGroup>

                  <PrimaryBtn style={{ marginTop: 20 }} onClick={() => setSurveyStep(2)}>{t('next')}</PrimaryBtn>
                </div>
              )}

              {/* STEP 2: Demographics */}
              {surveyStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: TEAL, marginBottom: 10 }}>{t('step2Title')}</div>
                  
                  <FormGroup>
                    <Label>{t('labelChildUnder5')}</Label>
                    <PillSelector>
                      <PillBtn>0</PillBtn><PillBtn $active>1</PillBtn><PillBtn>2</PillBtn><PillBtn>3+</PillBtn>
                    </PillSelector>
                  </FormGroup>
                  <FormGroup>
                    <Label>{t('labelChild518')}</Label>
                    <PillSelector>
                      <PillBtn>0</PillBtn><PillBtn $active>1</PillBtn><PillBtn>2</PillBtn><PillBtn>3+</PillBtn>
                    </PillSelector>
                  </FormGroup>
                  <FormGroup>
                    <Label>{t('labelAdults')}</Label>
                    <PillSelector>
                      <PillBtn>0</PillBtn><PillBtn>1</PillBtn><PillBtn $active>2</PillBtn><PillBtn>3+</PillBtn>
                    </PillSelector>
                  </FormGroup>
                  <FormGroup>
                    <Label>{t('labelSeniors')}</Label>
                    <PillSelector>
                      <PillBtn>0</PillBtn><PillBtn $active>1</PillBtn><PillBtn>2</PillBtn><PillBtn>3+</PillBtn>
                    </PillSelector>
                  </FormGroup>

                  <div style={{ height: 1, background: '#1e212b', margin: '20px 0' }} />

                  <CheckRow $checked={false}><div className="text">{t('pregnantWomen')}</div><div className="box" /></CheckRow>
                  <CheckRow $checked={false}><div className="text">{t('memberDisability')}</div><div className="box" /></CheckRow>

                  <PrimaryBtn style={{ marginTop: 20 }} onClick={() => setSurveyStep(3)}>{t('next')}</PrimaryBtn>
                </div>
              )}

              {/* STEP 3: Symptoms */}
              {surveyStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: TEAL, marginBottom: 10 }}>{t('step3Title')}</div>
                  
                  <CheckRow $checked={demoState.fever} onClick={() => toggleDemo('fever')}>
                    <div className="text">{t('symFever')}</div><div className="box">{demoState.fever && <FiCheck color="#000" />}</div>
                  </CheckRow>
                  <CheckRow $checked={demoState.joint} onClick={() => toggleDemo('joint')}>
                    <div className="text">{t('symJoint')}</div><div className="box">{demoState.joint && <FiCheck color="#000" />}</div>
                  </CheckRow>
                  <CheckRow $checked={demoState.headache} onClick={() => toggleDemo('headache')}>
                    <div className="text">{t('symHeadache')}</div><div className="box">{demoState.headache && <FiCheck color="#000" />}</div>
                  </CheckRow>
                  <CheckRow $checked={demoState.vomit} onClick={() => toggleDemo('vomit')}>
                    <div className="text">{t('symVomit')}</div><div className="box">{demoState.vomit && <FiCheck color="#000" />}</div>
                  </CheckRow>
                  <CheckRow $checked={demoState.diarrhea} onClick={() => toggleDemo('diarrhea')}>
                    <div className="text">{t('symDiarrhea')}</div><div className="box">{demoState.diarrhea && <FiCheck color="#000" />}</div>
                  </CheckRow>
                  <CheckRow $checked={demoState.rash} onClick={() => toggleDemo('rash')}>
                    <div className="text">{t('symRash')}</div><div className="box">{demoState.rash && <FiCheck color="#000" />}</div>
                  </CheckRow>

                  <FormGroup style={{marginTop: 20}}>
                    <Label>{t('labelSymDuration')}</Label>
                    <Input type="number" defaultValue="3" />
                  </FormGroup>
                  <CheckRow $checked={false}><div className="text">{t('hospitalisation')}</div><div className="box" /></CheckRow>

                  <PrimaryBtn style={{ marginTop: 20 }} onClick={() => setSurveyStep(4)}>{t('next')}</PrimaryBtn>
                </div>
              )}

              {/* STEP 4: Sanitation */}
              {surveyStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: TEAL, marginBottom: 10 }}>{t('step4Title')}</div>
                  
                  <FormGroup>
                    <Label>{t('labelDrinkSrc')}</Label>
                    <Select value={demoState.drinkingSource} onChange={e => setDemoState(s => ({...s, drinkingSource: e.target.value}))}>
                      <option value="mun_tap">{t('optMunTap')}</option>
                      <option value="well">{t('optWell')}</option>
                      <option value="tanker">{t('optTanker')}</option>
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>{t('labelWaterStorage')}</Label>
                    <Select defaultValue="open">
                      <option value="closed">{t('optClosed')}</option>
                      <option value="open">{t('optOpenFlagged')}</option>
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>{t('labelStagnant')}</Label>
                    <Select value={demoState.stagnantWater} onChange={e => setDemoState(s => ({...s, stagnantWater: e.target.value}))} style={{ color: demoState.stagnantWater === 'yes_front' ? RED : 'white' }}>
                      <option value="none">{t('optNo')}</option>
                      <option value="yes_front">{t('optYesFront')}</option>
                      <option value="yes_back">{t('optYesBack')}</option>
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>{t('labelToilet')}</Label>
                    <Select defaultValue="indoor">
                      <option value="indoor">{t('optIndoor')}</option>
                      <option value="public">{t('optPublic')}</option>
                    </Select>
                  </FormGroup>

                  <CheckRow $checked={demoState.drain} onClick={() => toggleDemo('drain')}>
                    <div className="text">{t('openDrain')}</div>
                    <div className="box">{demoState.drain && <FiCheck color="#000" />}</div>
                  </CheckRow>

                  <PrimaryBtn style={{ marginTop: 20 }} onClick={() => setSurveyStep(5)}>{t('next')}</PrimaryBtn>
                </div>
              )}

              {/* STEP 5: Vaccination */}
              {surveyStep === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: TEAL, marginBottom: 10 }}>{t('step5Title')}</div>
                  
                  <div style={{ background: '#1a1d26', padding: 16, borderRadius: 12 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 10 }}>{t('child3yr')}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
                      <span>{t('polio')}</span> <strong style={{color: AMBER}}>{t('overdue')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
                      <span>{t('bcg')}</span> <strong style={{color: TEAL}}>{t('doneTick')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>{t('measles')}</span> <strong style={{color: TEAL}}>{t('doneTick')}</strong>
                    </div>
                  </div>

                  <div style={{ background: '#1a1d26', padding: 16, borderRadius: 12 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 10 }}>{t('adult34yr')}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>{t('covidBooster')}</span> <strong style={{color: AMBER}}>{t('dueSoon')}</strong>
                    </div>
                  </div>

                  <div style={{ background: '#1a1d26', padding: 16, borderRadius: 12 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 10 }}>{t('allOthers3')}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>{t('stdSchedule')}</span> <strong style={{color: TEAL}}>{t('upToDate')}</strong>
                    </div>
                  </div>

                  <CheckRow $checked={demoState.advised} onClick={() => toggleDemo('advised')} style={{marginTop: 20}}>
                    <div className="text">{t('advisedVaccines')}</div>
                    <div className="box">{demoState.advised && <FiCheck color="#000" />}</div>
                  </CheckRow>

                  <PrimaryBtn style={{ marginTop: 20 }} onClick={() => setSurveyStep(6)}>{t('next')}</PrimaryBtn>
                </div>
              )}

              {/* STEP 6: Voice Note */}
              {surveyStep === 6 && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', marginTop: 40 }}>
                   <div style={{ fontSize: '1.2rem', fontWeight: 800, color: TEAL }}>{t('step6Title')}</div>
                   <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontSize: '0.85rem' }}>{t('voiceNoteDesc')}</div>
                   
                   <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: `2px solid ${RED}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 40, cursor: 'pointer' }}>
                     <FiMic style={{ fontSize: '3rem', color: RED }} />
                   </div>
                   
                   <PrimaryBtn style={{ marginTop: 60 }} onClick={() => setSurveyStep(7)}>{t('submit')}</PrimaryBtn>
                 </div>
              )}

              {/* STEP 7: POST SURVEY DEBRIEF */}
              {surveyStep === 7 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('aiSub')}</div>
                  
                  <div style={{ background: 'rgba(239,68,68,0.15)', border: `1px solid ${RED}`, padding: 24, borderRadius: 16, textAlign: 'center' }}>
                     <div style={{ fontSize: '1.5rem', fontWeight: 900, color: RED, marginBottom: 8 }}>{t('highRisk')}</div>
                     <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white' }}>82 <span style={{fontSize: '1rem', color: 'rgba(255,255,255,0.5)'}}>/ 100</span></div>
                  </div>

                  <div style={{ background: '#1a1d26', padding: 20, borderRadius: 16 }}>
                    <ul style={{ paddingLeft: 16, margin: 0, fontSize: '0.85rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' }}>
                      <li style={{marginBottom: 10}}>{t('aiPoint1')}</li>
                      <li style={{marginBottom: 10}}>{t('aiPoint2')}</li>
                      <li style={{marginBottom: 10}}>{t('aiPoint3')}</li>
                      <li>{t('aiPoint4')}</li>
                    </ul>
                  </div>

                  <div style={{ background: 'rgba(251,191,36,0.1)', padding: 16, borderRadius: 12, border: `1px solid ${AMBER}`, fontSize: '0.85rem', color: AMBER, fontWeight: 700 }}>
                    {t('clusterIntel')}
                  </div>

                  <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                    <button style={{ background: RED, color: 'white', border: 'none', padding: 14, borderRadius: 10, fontWeight: 800, fontSize: '0.9rem' }} onClick={handleEscalation}>{t('flagAlert')}</button>
                    <button style={{ background: '#2a2e39', color: 'white', border: 'none', padding: 14, borderRadius: 10, fontWeight: 700, fontSize: '0.9rem' }}>{t('scheduleFollowup')}</button>
                  </div>

                  <PrimaryBtn style={{ marginTop: 30 }} onClick={() => setSurveyStep(null)}>{t('close')}</PrimaryBtn>
                </div>
              )}
            </ScrollContent>
          </div>
        )}

        {/* FLOATING ESCALATION BTN */}
        {surveyStep === null && activeTab === 'home' && (
          <EscalateBtn onClick={() => setShowEscalation(true)} whileTap={{ scale: 0.9 }}>
            <FiZap />
            <span>{t('escalate')}</span>
          </EscalateBtn>
        )}

        {/* ESCALATION BOTTOM SHEET */}
        <AnimatePresence>
          {showEscalation && (
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#1e212b', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, zIndex: 300, boxShadow: '0 -10px 40px rgba(0,0,0,0.5)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{t('escalationTitle')}</div>
                <FiX style={{ fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setShowEscalation(false)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button onClick={handleEscalation} style={{ background: '#2a2e39', border: `1px solid ${RED}`, padding: 16, borderRadius: 12, color: 'white', fontWeight: 700, textAlign: 'left' }}>{t('critPatient')}</button>
                <button onClick={handleEscalation} style={{ background: '#2a2e39', border: `1px solid ${AMBER}`, padding: 16, borderRadius: 12, color: 'white', fontWeight: 700, textAlign: 'left' }}>{t('diseaseCluster')}</button>
                <button onClick={handleEscalation} style={{ background: '#2a2e39', border: `1px solid ${YELLOW}`, padding: 16, borderRadius: 12, color: 'white', fontWeight: 700, textAlign: 'left' }}>{t('infraEmerg')}</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PASSPORT MODAL */}
        <AnimatePresence>
          {showPassport && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
              onClick={() => setShowPassport(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                style={{ background: '#f8fafc', borderRadius: 20, width: '100%', overflow: 'hidden', color: '#0f111a' }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ background: '#0f111a', color: 'white', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', opacity: 0.7 }}>{t('passportHeader')}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, marginTop: 8, color: TEAL }}>{t('passportAuth')}</div>
                </div>
                <div style={{ padding: 24, textAlign: 'center' }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#e2e8f0', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#64748b' }}><FiUser /></div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 4 }}>{t('workerName')}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: 24 }}>{t('workerId')}</div>
                  
                  <div style={{ textAlign: 'left', fontSize: '0.8rem', background: '#f1f5f9', padding: 16, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div><strong>{t('passportWardLabel')}</strong> {t('passportWardVal')}</div>
                    <div><strong>{t('passportSinceLabel')}</strong> {t('passportSinceVal')}</div>
                    <div><strong>{t('passportSupervisorLabel')}</strong> {t('passportSupervisorVal')}</div>
                    <div><strong>{t('passportHelplineLabel')}</strong> {t('passportHelplineVal')}</div>
                  </div>
                </div>
                <div style={{ background: TEAL, color: '#000', padding: 12, textAlign: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                  {t('passportFooter')}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM NAV */}
        <BottomNav>
          <NavItem $active={activeTab === 'home'} onClick={() => { setSurveyStep(null); setActiveTab('home'); }}><FiHome /><span>{t('navHome')}</span></NavItem>
          <NavItem $active={activeTab === 'alerts'} onClick={() => { setSurveyStep(null); setActiveTab('alerts'); }}><FiBell /><span>{t('navAlerts')}</span></NavItem>
          <NavItem $active={activeTab === 'surveys'} onClick={() => { setSurveyStep(null); setActiveTab('surveys'); }}><FiFileText /><span>{t('navSurveys')}</span></NavItem>
          <NavItem $active={activeTab === 'profile'} onClick={() => { setSurveyStep(null); setActiveTab('profile'); }}><FiUser /><span>{t('navProfile')}</span></NavItem>
        </BottomNav>

      </MobileShell>
    </PageWrapper>
  );
}
