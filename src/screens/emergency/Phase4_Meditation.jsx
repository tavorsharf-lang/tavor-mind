import { useState } from 'react';
import PhaseHeader from './components/PhaseHeader.jsx';
import SoftButton from './components/SoftButton.jsx';
import MeditationPlayer from './components/MeditationPlayer.jsx';
import { EMERGENCY_TO_MEDITATION } from '../../data/emergencyMeditationMap.js';

const STAGE_TOTAL = 7;
const STAGE_LABEL = 'שלב 1 — להירגע';

export default function Phase4Meditation({ activation, onNext, onSkip, onExit }) {
  const meditation = activation ? EMERGENCY_TO_MEDITATION[activation] : null;
  const [open, setOpen] = useState(false);

  if (!meditation) {
    // No mapping for this activation — skip silently.
    return (
      <div className="phase phase-meditation-page">
        <PhaseHeader phase={4} total={STAGE_TOTAL} stageLabel={STAGE_LABEL} onExit={onExit} />
        <main className="phase-content phase-content-center">
          <h1 className="phase-title">אין מדיטציה מותאמת כעת</h1>
        </main>
        <footer className="phase-footer">
          <SoftButton onClick={onNext}>הלאה</SoftButton>
        </footer>
      </div>
    );
  }

  return (
    <div className="phase phase-meditation-page">
      <PhaseHeader phase={4} total={STAGE_TOTAL} stageLabel={STAGE_LABEL} onExit={onExit} />
      <main className="phase-content phase-content-center">
        <h1 className="phase-title">רוצה רגע של מדיטציה?</h1>
        <p className="phase-subline">{meditation.title} — {meditation.subtitle}</p>
        <button
          type="button"
          className="phase-meditation-card phase-meditation-cta"
          onClick={() => setOpen(true)}
        >
          <span className="phase-meditation-name">השמע</span>
        </button>
      </main>
      <footer className="phase-footer phase-footer-stack">
        <SoftButton onClick={onNext}>הלאה</SoftButton>
        <button type="button" className="link-btn phase-skip" onClick={onSkip}>
          דלג לשלב הבא
        </button>
      </footer>

      <MeditationPlayer
        open={open}
        src={meditation.src}
        title={meditation.title}
        subtitle={meditation.subtitle}
        onClose={() => setOpen(false)}
        onComplete={() => { setOpen(false); onNext(); }}
      />
    </div>
  );
}
