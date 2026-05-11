import { useState } from 'react';
import MeditationPlayer from './components/MeditationPlayer.jsx';
import { EMERGENCY_TO_MEDITATION } from '../../data/emergencyMeditationMap.js';
import { Phase4MeditationIcon } from '../../components/icons/index.jsx';

function Topbar({ onExit }) {
  return (
    <div className="ds3-topbar">
      <span className="ds3-topbar-spacer" />
      <span className="ds3-topbar-label">
        <span className="ds3-topbar-label-icon color-tone-calm" aria-hidden="true"><Phase4MeditationIcon /></span>
        שלב 1 · להירגע · מדיטציה
      </span>
      <button type="button" className="ds3-topbar-back" aria-label="צא" onClick={onExit}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

function LengthCard({ length, meditation, onPlay }) {
  const lengthLabel = length === 'short' ? 'קצרה' : 'ארוכה';
  return (
    <button
      type="button"
      onClick={onPlay}
      className="ds3-card"
      aria-label={`נגן: ${meditation.title}, גרסה ${lengthLabel}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        width: '100%', padding: '16px 18px',
        background: 'var(--surface)',
        border: '1px solid var(--line-soft)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-soft)',
        cursor: 'pointer',
        textAlign: 'right',
        fontFamily: 'inherit',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'var(--lichen)',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
          גרסה {lengthLabel} · {meditation.title}
        </span>
        <span style={{ fontSize: 14, color: 'var(--ink-muted)' }}>
          {meditation.subtitle}
        </span>
      </span>
    </button>
  );
}

export default function Phase4Meditation({ activation, onNext, onSkip, onExit }) {
  const pair = activation ? EMERGENCY_TO_MEDITATION[activation] : null;
  const [active, setActive] = useState(null); // null | 'short' | 'long'

  if (!pair) {
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} />
        <main className="ds3-screen-content ds3-screen-content-center ds3-text-center">
          <h1 className="ds3-h1">אין מדיטציה מותאמת כעת</h1>
        </main>
        <footer className="ds3-screen-footer">
          <button type="button" className="ds3-btn ds3-btn-primary" onClick={onNext}>הלאה</button>
        </footer>
      </div>
    );
  }

  const playing = active ? pair[active] : null;

  return (
    <div className="ds3-screen">
      <Topbar onExit={onExit} />
      <main className="ds3-screen-content ds3-stack-5">
        <div className="ds3-stack-2 ds3-text-center">
          <h1 className="ds3-h1">רוצה רגע של מדיטציה?</h1>
          <p className="ds3-body ds3-text-muted">בחר אורך שמתאים לרגע</p>
        </div>
        <div className="ds3-stack-3">
          <LengthCard length="short" meditation={pair.short} onPlay={() => setActive('short')} />
          <LengthCard length="long"  meditation={pair.long}  onPlay={() => setActive('long')} />
        </div>
      </main>
      <footer className="ds3-screen-footer">
        <button type="button" className="ds3-btn ds3-btn-primary" onClick={onNext}>הלאה</button>
      </footer>

      <MeditationPlayer
        open={!!playing}
        src={playing?.src}
        title={playing?.title}
        subtitle={playing?.subtitle}
        onClose={() => setActive(null)}
        onComplete={() => { setActive(null); onNext(); }}
      />
    </div>
  );
}
