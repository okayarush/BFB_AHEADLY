import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import styled from 'styled-components';

// Context Providers
import { CityDataProvider } from './context/CityDataContext';
import { InterventionProvider } from './context/InterventionContext';

// Components
import Sidebar from './components/layout/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import DigitalTwin from './pages/DigitalTwin';
import InterventionPlanner from './pages/InterventionPlanner';
import FutureOverview from './pages/FutureOverview';
import HealthPriorityBrief from './pages/HealthPriorityBrief';
import DataSources from './pages/DataSources';
import ProblemStatement from './pages/ProblemStatement';
import GlobalStyles from './styles/GlobalStyles';
import Home from './pages/Home';
import ComingSoon from './pages/ComingSoon';
import HospitalApp from './pages/HospitalApp';
import CommunitySanitation from './pages/CommunitySanitation';
import CommunitySymptoms from './pages/CommunitySymptoms';
import ASHAField from './pages/ASHAField';
import HealthPassport from './pages/HealthPassport';

// Onboarding Pages
import SMCOnboarding from './pages/SMCOnboarding';
import HospitalOnboarding from './pages/HospitalOnboarding';
import CommunityOnboarding from './pages/CommunityOnboarding';
import ASHAOnboarding from './pages/ASHAOnboarding';

// New Citizen Feature Pages
import SatelliteIntelligence from './pages/SatelliteIntelligence';
import ScientificValidation from './pages/ScientificValidation';
import VaccinationTracker from './pages/VaccinationTracker';
import WardLeaderboard from './pages/WardLeaderboard';
import EmergencySOS from './pages/EmergencySOS';

// Global Copilot
import AheadlyCopilot from './components/AheadlyCopilot';

// Pages that render without sidebar (full-screen experiences)
const FULLSCREEN_ROUTES = [
  '/', 
  '/smc', 
  '/hospital', 
  '/hospital-reporting',
  '/community', 
  '/community-sanitation',
  '/community-symptoms',
  '/health-passport',
  '/vaccinations',
  '/leaderboard',
  '/sos',
  '/asha-welcome',
  '/asha'
];

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ContentArea = styled.main`
  flex: 1;
  overflow-y: auto;
  background: ${props => props.$isFullscreen ? 'transparent' : 'rgba(255, 255, 255, 0.95)'};
  box-shadow: ${props => props.$isFullscreen ? 'none' : '0 20px 40px rgba(0, 0, 0, 0.1)'};
  backdrop-filter: ${props => props.$isFullscreen ? 'none' : 'blur(10px)'};
`;

function AppLayout() {
  const location = useLocation();
  const isFullscreen = FULLSCREEN_ROUTES.includes(location.pathname);

  return (
    <AppContainer>
      <MainContent>
        {!isFullscreen && <Sidebar />}
        <ContentArea $isFullscreen={isFullscreen}>
          <Routes>
            {/* Landing */}
            <Route path="/" element={<Home />} />

            {/* Portal Onboarding Pages (full-screen, no sidebar) */}
            <Route path="/smc" element={<SMCOnboarding />} />
            <Route path="/hospital" element={<HospitalOnboarding />} />
            <Route path="/community" element={<CommunityOnboarding />} />
            <Route path="/asha-welcome" element={<ASHAOnboarding />} />

            {/* SMC Command Center */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/digital-twin" element={<DigitalTwin />} />
            <Route path="/intervention-planner" element={<InterventionPlanner />} />
            <Route path="/FutureOverview" element={<FutureOverview />} />
            <Route path="/policy-brief" element={<HealthPriorityBrief />} />
            <Route path="/health-priority" element={<HealthPriorityBrief />} />
            <Route path="/data-sources" element={<DataSources />} />
            <Route path="/satellite-intelligence" element={<SatelliteIntelligence />} />
            <Route path="/scientific-validation" element={<ScientificValidation />} />
            <Route path="/problem-statement" element={<ProblemStatement />} />

            {/* Hospital */}
            <Route path='/hospital-reporting' element={<HospitalApp />} />

            {/* Community / Citizens */}
            <Route path='/community-sanitation' element={<CommunitySanitation />} />
            <Route path='/community-symptoms' element={<CommunitySymptoms />} />
            <Route path='/health-passport' element={<HealthPassport />} />
            <Route path='/vaccinations' element={<VaccinationTracker />} />
            <Route path='/leaderboard' element={<WardLeaderboard />} />
            <Route path='/sos' element={<EmergencySOS />} />

            {/* ASHA Field */}
            <Route path='/asha' element={<ASHAField />} />

            {/* Other */}
            <Route path='/ngo' element={<ComingSoon />} />
            <Route path='/govt' element={<ComingSoon />} />
          </Routes>
        </ContentArea>
      </MainContent>
      {!isFullscreen && <AheadlyCopilot />}
    </AppContainer>
  );
}

function App() {
  return (
    <CityDataProvider>
      <InterventionProvider>
        <Router>
          <GlobalStyles />
          <AppLayout />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                iconTheme: { primary: '#10B981', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#fff' },
              },
            }}
          />
        </Router>
      </InterventionProvider>
    </CityDataProvider>
  );
}

export default App;
