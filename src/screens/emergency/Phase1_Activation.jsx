import { useNavigate } from 'react-router-dom';
import { Phase1ActivationIcon } from '../../components/icons/index.jsx';
import { buildStartShortcutUrl } from '../../utils/liveHr.js';

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
    label: 'עוד טריגר אחד — ואני מופעל',
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

  const handlePick = (id) => {
    setTimeout(() => onPick(id), SHORTCUT_LAUNCH_DELAY_MS);
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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
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
          {OPTIONS.map((opt) => (
            // Anchor with href to the Start Shortcut + delayed state change
            // on click. iOS handles the URL scheme first; React advances to
            // Phase 2 ~150ms later (after iOS already opened Shortcuts).
            <a
              key={opt.id}
              href={buildStartShortcutUrl()}
              className="ds3-card-button ds3-activation-card"
              onClick={() => handlePick(opt.id)}
              style={{ textDecoration: 'none' }}
            >
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
            </a>
          ))}
        </div>
      </main>

      <footer className="ds3-screen-footer">
        <button type="button" className="ds3-btn ds3-btn-primary" onClick={onSkip}>
          הלאה
        </button>
      </footer>
    </div>
  );
}
