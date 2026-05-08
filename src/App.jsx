import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ensureAuth } from './firebase.js';
import HomeScreen from './screens/HomeScreen.jsx';
import EmergencyFlow from './screens/emergency/EmergencyFlow.jsx';
import EmergencyHistory from './screens/emergency/EmergencyHistory.jsx';
import EmergencySessionDetail from './screens/emergency/EmergencySessionDetail.jsx';
import ToolboxHub from './screens/toolbox/ToolboxHub.jsx';
import SchemaProfile from './screens/toolbox/SchemaProfile.jsx';
import AttachmentProfile from './screens/toolbox/AttachmentProfile.jsx';
import ModesMap from './screens/toolbox/ModesMap.jsx';
import SelfLetter from './screens/toolbox/SelfLetter.jsx';
import CheckinHub from './screens/checkin/CheckinHub.jsx';
import MoodCheckin from './screens/checkin/MoodCheckin.jsx';
import CheckinHistory from './screens/checkin/CheckinHistory.jsx';
import ToolsHub from './screens/tools/ToolsHub.jsx';
import TriggerTracker from './screens/tools/TriggerTracker.jsx';
import ModeCheck from './screens/tools/ModeCheck.jsx';
import CatastropheCheck from './screens/tools/CatastropheCheck.jsx';
import SomaticHub from './screens/tools/SomaticHub.jsx';
import SomaticExercise from './screens/tools/SomaticExercise.jsx';
import ToolHistory from './screens/tools/ToolHistory.jsx';
import RepositoryHub from './screens/repository/RepositoryHub.jsx';
import ImportScreen from './screens/repository/ImportScreen.jsx';
import AnalysisDetail from './screens/repository/AnalysisDetail.jsx';
import RecycleBin from './screens/repository/RecycleBin.jsx';
import ReviewScreen from './screens/review/ReviewScreen.jsx';
import MindfulnessHub from './screens/mindfulness/MindfulnessHub.jsx';
import TherapyFrameScreen from './screens/therapy/TherapyFrameScreen.jsx';
import TherapyDaySettings from './screens/therapy/TherapyDaySettings.jsx';
import NavRail from './components/ui/NavRail.jsx';
import SyncStatusBadge from './components/ui/SyncStatusBadge.jsx';
import { flushPendingSessions } from './utils/emergencyLog.js';
import { flushPendingCheckins } from './utils/checkinStorage.js';
import { flushPendingTools } from './utils/toolsStorage.js';
import { flushPendingAnalyses } from './utils/analysisStorage.js';
import { flushPendingFrames } from './utils/therapyStorage.js';

function computeTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 21 || h < 5) return 'night';
  if (h >= 17) return 'evening';
  if (h < 8) return 'dawn';
  return 'day';
}

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    ensureAuth()
      .then(() => setAuthReady(true))
      .catch((err) => {
        console.warn('Auth failed:', err);
        setAuthError(err.message || 'auth failed');
        setAuthReady(true);
      });
  }, []);

  useEffect(() => {
    const update = () => {
      document.documentElement.dataset.timeOfDay = computeTimeOfDay();
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!authReady) return;
    const flushAll = () => {
      flushPendingSessions().catch(() => {});
      flushPendingCheckins().catch(() => {});
      flushPendingTools().catch(() => {});
      flushPendingAnalyses().catch(() => {});
      flushPendingFrames().catch(() => {});
    };
    flushAll();
    window.addEventListener('online', flushAll);
    return () => window.removeEventListener('online', flushAll);
  }, [authReady]);

  if (!authReady) {
    return (
      <div className="boot-screen" aria-live="polite">
        <div className="boot-pulse" />
      </div>
    );
  }

  return (
    <BrowserRouter basename="/tavor-mind">
      <a href="#main-content" className="ds2-skip-link">דלג לתוכן הראשי</a>
      <SyncStatusBadge />
      <NavRail />
      <Routes>
        <Route path="/" element={<HomeScreen authError={authError} />} />
        <Route path="/emergency" element={<EmergencyFlow />} />
        <Route path="/emergency/history" element={<EmergencyHistory />} />
        <Route path="/emergency/history/:sessionId" element={<EmergencySessionDetail />} />
        <Route path="/toolbox" element={<ToolboxHub />} />
        <Route path="/toolbox/schemas" element={<SchemaProfile />} />
        <Route path="/toolbox/attachment" element={<AttachmentProfile />} />
        <Route path="/toolbox/modes" element={<ModesMap />} />
        <Route path="/toolbox/letter" element={<SelfLetter />} />
        <Route path="/checkin" element={<CheckinHub />} />
        <Route path="/checkin/mood" element={<MoodCheckin />} />
        <Route path="/checkin/history" element={<CheckinHistory />} />
        <Route path="/tools" element={<ToolsHub />} />
        <Route path="/tools/triggers" element={<TriggerTracker />} />
        <Route path="/tools/mode-check" element={<ModeCheck />} />
        <Route path="/tools/catastrophe" element={<CatastropheCheck />} />
        <Route path="/tools/somatic" element={<SomaticHub />} />
        <Route path="/tools/somatic/:id" element={<SomaticExercise />} />
        <Route path="/tools/history" element={<ToolHistory />} />
        <Route path="/repository" element={<RepositoryHub />} />
        <Route path="/repository/import" element={<ImportScreen />} />
        <Route path="/repository/trash" element={<RecycleBin />} />
        <Route path="/repository/:id" element={<AnalysisDetail />} />
        <Route path="/review" element={<ReviewScreen />} />
        <Route path="/mindfulness" element={<MindfulnessHub />} />
        <Route path="/therapy/frame" element={<TherapyFrameScreen />} />
        <Route path="/settings/therapy-day" element={<TherapyDaySettings />} />
      </Routes>
    </BrowserRouter>
  );
}
