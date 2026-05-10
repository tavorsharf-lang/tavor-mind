import { useNavigate } from 'react-router-dom';
import { Phase1ActivationIcon } from '../../components/icons/index.jsx';
import { buildStartShortcutUrl, isHrSetupDone } from '../../utils/liveHr.js';

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
  // Only render the cards as Shortcut-launching <a> when HR is configured.
  // On non-iOS / not-set-up, falling through to a plain <button> avoids opening
  // a broken `shortcuts://` URL during a crisis.
  const hrSetupDone = isHrSetupDone();
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
          {OPTIONS.map((opt) => {
            // When HR is configured, activation cards are <a> elements: tapping
            // picks the activation AND launches the Start Workout Shortcut.
            // Otherwise render a plain <button> so non-iOS / unset-up users
            // don't get a broken `shortcuts://` navigation mid-crisis.
            const cardInner = (
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
            if (hrSetupDone) {
              return (
                <a
                  key={opt.id}
                  href={buildStartShortcutUrl()}
                  className="ds3-card-button ds3-activation-card"
                  onClick={() => onPick(opt.id)}
                  style={{ textDecoration: 'none' }}
                >
                  {cardInner}
                </a>
              );
            }
            return (
              <button
                key={opt.id}
                type="button"
                className="ds3-card-button ds3-activation-card"
                onClick={() => onPick(opt.id)}
              >
                {cardInner}
              </button>
            );
          })}
        </div>
      </main>

      <footer className="ds3-screen-footer">
        <button type="button" className="ds3-btn-quiet" onClick={onSkip}>
          דלג לשלב הבא
        </button>
      </footer>
    </div>
  );
}
