import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sigh from './Sigh.jsx';
import YogaNidra from './YogaNidra.jsx';
import SleepBodyScan from './SleepBodyScan.jsx';
import SleepGoodnight from './SleepGoodnight.jsx';
import './sleep.css';

/*  Sleep session orchestrator.

    Stages:
      sigh      — physiological sigh × 5
      nidra     — yoga nidra recording (auto-plays)
      choice    — at end of nidra: "לילה טוב" or "עוד ער — סריקת גוף"
      bodyscan  — optional body scan
      goodnight — final dark screen, auto-dismiss to /

    No persistence. No Firebase. Stop button at any point exits straight home.
*/

const STAGES = {
  SIGH: 'sigh',
  NIDRA: 'nidra',
  CHOICE: 'choice',
  BODYSCAN: 'bodyscan',
  GOODNIGHT: 'goodnight',
};

export default function SleepFlow() {
  const navigate = useNavigate();
  const [stage, setStage] = useState(STAGES.SIGH);

  // Always restore body scroll lock + class on unmount, just in case.
  useEffect(() => {
    document.body.classList.add('sleep-mode');
    return () => document.body.classList.remove('sleep-mode');
  }, []);

  const exitHome = () => navigate('/', { replace: true });

  if (stage === STAGES.SIGH) {
    return (
      <Sigh
        onComplete={() => setStage(STAGES.NIDRA)}
        onSkip={() => setStage(STAGES.NIDRA)}
      />
    );
  }

  if (stage === STAGES.NIDRA) {
    return (
      <YogaNidra
        onEnded={() => setStage(STAGES.CHOICE)}
        onStop={exitHome}
      />
    );
  }

  if (stage === STAGES.CHOICE) {
    return (
      <div className="sleep-page">
        <div className="nidra-stage">
          <h2 className="nidra-title">הסשן הסתיים</h2>
          <div className="nidra-actions">
            <button
              type="button"
              className="nidra-end-btn nidra-end-btn-primary"
              onClick={exitHome}
            >
              לילה טוב
            </button>
            <button
              type="button"
              className="nidra-end-btn"
              onClick={() => setStage(STAGES.BODYSCAN)}
            >
              עוד ער · סריקת גוף
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === STAGES.BODYSCAN) {
    return (
      <SleepBodyScan
        onComplete={() => setStage(STAGES.GOODNIGHT)}
        onStop={exitHome}
      />
    );
  }

  return <SleepGoodnight onExit={exitHome} />;
}
