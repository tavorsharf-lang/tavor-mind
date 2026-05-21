import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhaseActivation as Phase1ActivationIcon, ChevronStart } from '../../components/icons/system.jsx';
import { buildStartShortcutUrl, isWearingWatch, setWearingWatch } from '../../utils/liveHr.js';

const OPTIONS = [
  {
    id: 'hyper',
    label: 'הופעלתי',
    subtitle: 'לב פועם מהר, מחשבות רצות, אי-שקט',
    tone: 'coral',
    glyph: 'spark',
  },
  {
    id: 'mid',
    label: 'עוד טריגר אחד - ואני מופעל',
    subtitle: 'מוצף אבל מתפקד, על הסף',
    tone: 'orange',
    glyph: 'edge',
  },
  {
    id: 'hypo',
    label: 'מרוקן',
    subtitle: 'כבדות, ניתוק רגשי, אין כוח לזוז',
    tone: 'blue',
    glyph: 'low',
  },
];

// Defer the React state change so iOS Safari has time to process the
// custom-scheme href on the anchor. Without this, setPhase(2) commits
// almost instantly, the anchor unmounts, and iOS cancels the navigation.
const SHORTCUT_LAUNCH_DELAY_MS = 150;

function ActivationGlyph({ kind, color }) {
  const s = { stroke: color, fill: 'none', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (kind === 'spark') return (
    <svg width="28" height="28" viewBox="0 0 28 28">
      <path d="M14 4v6M14 18v6M4 14h6M18 14h6M7 7l4 4M17 17l4 4M21 7l-4 4M11 17l-4 4" {...s}/>
    </svg>
  );
  if (kind === 'edge') return (
    <svg width="28" height="28" viewBox="0 0 28 28">
      <path d="M4 18 L10 12 L14 16 L24 6" {...s}/>
      <circle cx="24" cy="6" r="1.5" fill={color}/>
    </svg>
  );
  return (
    <svg width="28" height="28" viewBox="0 0 28 28">
      <path d="M4 14h20" {...s}/>
      <path d="M8 18h12" {...s} strokeOpacity="0.6"/>
      <path d="M11 22h6" {...s} strokeOpacity="0.3"/>
    </svg>
  );
}

export default function Phase1Activation({ onPick, onSkip, onExit }) {
  const navigate = useNavigate();
  // Local toggle for "אני עונד שעון" — controls whether the activation
  // cards launch the start-workout Shortcut or behave as plain buttons.
  // Persisted to localStorage; visible regardless of HR-setup status.
  const [wearingWatch, setWearingWatchState] = useState(() => isWearingWatch());

  const toggleWearingWatch = () => {
    const next = !wearingWatch;
    setWearingWatch(next);
    setWearingWatchState(next);
  };

  const handlePick = (id) => {
    if (wearingWatch) {
      setTimeout(() => onPick(id), SHORTCUT_LAUNCH_DELAY_MS);
    } else {
      onPick(id);
    }
  };

  return (
    <div className="ds3-screen">
      {/* Topbar — back arrow on right (RTL = back). History link on left. */}
      <div className="ds3-topbar">
        <button
          type="button"
          className="ds3-topbar-skip"
          onClick={() => navigate('/emergency/history')}
        >
          להיסטוריה
        </button>
        <span className="ds3-topbar-label">
          <span className="ds3-topbar-label-icon color-tone-crisis" aria-hidden="true"><Phase1ActivationIcon /></span>
          שלב 1 · להירגע
        </span>
        <button
          type="button"
          className="ds3-topbar-back"
          aria-label="צא"
          onClick={onExit}
        >
          <ChevronStart size={22} />
        </button>
      </div>

      <main className="ds3-screen-content ds3-stack-5">
        <div className="ds3-stack-3" style={{ marginTop: 12 }}>
          <h1 className="ds3-h1">איפה אני עכשיו?</h1>
          <p className="ds3-body ds3-text-muted">
            תבחר את המצב שהכי קרוב. אין תשובה לא נכונה.
          </p>
        </div>

        <div className="ds3-stack-3">
          {OPTIONS.map((opt) => {
            const inner = (
              <>
                <span className={`ds3-icon-tile ds3-icon-tile-${opt.tone}`} aria-hidden="true">
                  <ActivationGlyph kind={opt.glyph} color={`var(--${opt.tone === 'blue' ? 'lichen' : opt.tone === 'coral' ? 'heart' : 'orange'})`} />
                </span>
                <span className="ds3-activation-card-text">
                  <span className="ds3-activation-card-label">{opt.label}</span>
                  <span className="ds3-activation-card-sub">{opt.subtitle}</span>
                </span>
                <svg width="10" height="16" viewBox="0 0 10 16" className="ds3-chevron-end" aria-hidden="true">
                  <path d="M8 1L2 8l6 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            );
            // When wearing the watch we render an <a href="shortcuts://...">
            // so iOS handles the URL scheme on the user gesture. React then
            // advances to Phase 2 ~150ms later. Without the watch we render
            // a plain button — no Shortcut, no app switch.
            return wearingWatch ? (
              <a
                key={opt.id}
                href={buildStartShortcutUrl()}
                className="ds3-card-button ds3-activation-card"
                onClick={() => handlePick(opt.id)}
                style={{ textDecoration: 'none' }}
              >
                {inner}
              </a>
            ) : (
              <button
                key={opt.id}
                type="button"
                className="ds3-card-button ds3-activation-card"
                onClick={() => handlePick(opt.id)}
              >
                {inner}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={wearingWatch}
          className={`ds3-watch-toggle ${wearingWatch ? 'is-on' : 'is-off'}`}
          onClick={toggleWearingWatch}
        >
          <span className="ds3-watch-toggle-label">אני עונד שעון</span>
          <span className="ds3-watch-toggle-pill" aria-hidden="true">{wearingWatch ? 'כן' : 'לא'}</span>
        </button>
      </main>

      <footer className="ds3-screen-footer">
        <button type="button" className="ds3-btn ds3-btn-primary" onClick={onSkip}>
          הלאה
        </button>
      </footer>
    </div>
  );
}
