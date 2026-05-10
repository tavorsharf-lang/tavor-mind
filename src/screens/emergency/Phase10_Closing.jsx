import { useState } from 'react';
import LetterModal from './components/LetterModal.jsx';
import CallSomeoneModal from '../../components/ui/CallSomeoneModal.jsx';
import { Phase10ClosingIcon } from '../../components/icons/index.jsx';
import { LETTER_COPY_BY_ZONE } from '../../data/emergencyLetterMap.js';
import { PhysioSighAnim } from '../tools/components/somatic/SomaticAnimations.jsx';
import { colorForScore } from '../../utils/scoreColor.js';
import { buildRunShortcutUrl } from '../../utils/liveHr.js';

function deriveZone(touched, score) {
  if (!touched) return 'unrated';
  if (score >= 7) return 'high';
  if (score <= 3) return 'low';
  return 'mid';
}

const QUICK_RATE_TO_SCORE = {
  better: 8,
  same: 5,
  worse: 2,
};

export default function Phase10Closing({
  analyzed,
  score,
  setScore,
  note,
  setNote,
  onFinish,
  onContinueWithClaude,
  onExit,
  savingState,
  hrSessionId = null,
}) {
  const [showCallModal, setShowCallModal] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [scoreTouched, setScoreTouched] = useState(false);
  const [letterDeclined, setLetterDeclined] = useState(false);
  const [breathingMode, setBreathingMode] = useState(false);
  const saving = savingState === 'saving';
  const saved = savingState === 'saved';
  const inFlight = saving || saved;

  const handleScoreChange = (raw) => {
    // direction:ltr on the input maps native left→right to value 1→10;
    // labels read right→left in RTL with "10·בסדר" first → on the right,
    // matching score=10 at the right end. No mirror needed.
    const newScore = parseInt(raw, 10);
    setScore(newScore);
    if (!scoreTouched) setScoreTouched(true);
    if (letterDeclined) setLetterDeclined(false);
  };

  const handleQuickRate = (key) => {
    setScore(QUICK_RATE_TO_SCORE[key]);
    setScoreTouched(true);
  };

  const zone = deriveZone(scoreTouched, score);
  const handlePos = ((score - 1) / 9) * 100;
  const tint = colorForScore(score, 'high-good');

  if (breathingMode) {
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} />
        <main className="ds3-screen-content ds3-screen-content-center ds3-stack-4">
          <p className="ds3-body ds3-text-muted ds3-text-center">רק לנשום. בלי דרישה.</p>
          <div className="ds3-center">
            <PhysioSighAnim durationSec={30} onComplete={() => setBreathingMode(false)} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="ds3-screen">
      {/* Top — X close + label */}
      <div className="ds3-topbar">
        <button type="button" className="ds3-x-btn" aria-label="סגור" onClick={onExit}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
        </button>
        <span className="ds3-topbar-label">
        <span className="ds3-topbar-label-icon color-tone-reflect" aria-hidden="true"><Phase10ClosingIcon /></span>
        סגירה
      </span>
        <span className="ds3-topbar-spacer" />
      </div>

      <main className="ds3-screen-content">
        {/* Title block */}
        <div style={{ padding: '8px 0 4px', textAlign: 'center' }}>
          <div className="ds3-display" style={{ fontSize: 34, fontWeight: 800 }}>
            ההרגשה עכשיו
          </div>
          <p className="ds3-body ds3-text-muted" style={{ marginTop: 8 }}>
            סמן איפה אתה עכשיו, בלי לחשוב יותר מדי.
          </p>
        </div>

        {/* Slider */}
        <div style={{ padding: '24px 0 6px' }}>
          <div className="ds3-slider-wrap" style={{ height: 44 }}>
            {/* Track */}
            <div style={{
              position: 'absolute', inset: '50% 0 auto', height: 12,
              transform: 'translateY(-50%)',
              background: 'var(--surface-alt)',
              borderRadius: 99,
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
            }}/>
            {scoreTouched && (
              <div style={{
                position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                left: 0, width: `${handlePos}%`, height: 12,
                background: `linear-gradient(90deg, ${tint.soft}, ${tint.main})`,
                borderRadius: 99, opacity: 0.9,
                transition: 'background 200ms ease, width 150ms ease',
              }}/>
            )}
            {scoreTouched && (
              <div style={{
                position: 'absolute', top: '50%',
                left: `calc(${handlePos}% - 16px)`, transform: 'translateY(-50%)',
                width: 32, height: 32, borderRadius: '50%',
                background: tint.main,
                boxShadow: `0 4px 14px ${tint.glow}, 0 0 0 4px var(--surface)`,
                border: '2px solid var(--surface)',
                transition: 'background 200ms ease, box-shadow 200ms ease, left 150ms ease',
              }}/>
            )}
            <input
              type="range" min="1" max="10" step="1"
              value={score}
              onChange={(e) => handleScoreChange(e.target.value)}
              className="ds3-slider-input"
              aria-label="דירוג ההרגשה עכשיו"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }} className="ds3-caption ds3-text-muted">
            <span>10 · בסדר</span>
            <span>1 · קשה לי</span>
          </div>

          {scoreTouched && (
            <div className="ds3-text-center" style={{ marginTop: 14 }}>
              <span className="ds3-h2" style={{ fontWeight: 700, color: tint.main, transition: 'color 200ms ease' }}>{score}</span>
            </div>
          )}
        </div>

        {/* Note input */}
        <div style={{ padding: '12px 0 0' }}>
          <textarea
            className="ds3-textarea"
            rows={3}
            placeholder="הערה קצרה לעצמך (לא חובה)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </main>

      <footer className="ds3-screen-footer">
        {/* Edge variant — no rating yet, show 3 quick pills */}
        {!analyzed && zone === 'unrated' && (
          <>
            <p className="ds3-body ds3-text-muted ds3-text-center" style={{ marginBottom: 12 }}>
              או, אם קשה לסמן מספר —
            </p>
            <div className="ds3-stack-3">
              <QuickPill label="טוב לי עכשיו" tint="var(--green)" onClick={() => handleQuickRate('better')} />
              <QuickPill label="בערך" tint="var(--terra)" onClick={() => handleQuickRate('same')} />
              <QuickPill label="עדיין קשה" tint="var(--heart)" onClick={() => handleQuickRate('worse')} />
            </div>
          </>
        )}

        {/* Variant A — high (≥7) */}
        {!analyzed && zone === 'high' && (
          <>
            <div className="ds3-card-bordered-terra" style={{ marginBottom: 14 }}>
              <div className="ds3-stack-2">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--terra)' }} />
                  <span className="ds3-caption" style={{ color: 'var(--terra)', fontWeight: 700 }}>{LETTER_COPY_BY_ZONE.high.tag || 'טוב יותר'}</span>
                </div>
                <h2 className="ds3-h2">{LETTER_COPY_BY_ZONE.high.lead}</h2>
              </div>
            </div>
            <button
              type="button"
              className="ds3-btn ds3-btn-primary"
              onClick={() => setShowLetter(true)}
              disabled={inFlight}
              style={{ marginBottom: 8 }}
            >
              {LETTER_COPY_BY_ZONE.high.cta}
            </button>
            <div className="ds3-text-center">
              <button
                type="button"
                className="ds3-btn-quiet"
                style={{ height: 'auto', textDecoration: 'underline', textUnderlineOffset: 4, fontSize: 15 }}
                onClick={() => setShowCallModal(true)}
              >
                אני רוצה לדבר עם מישהו
              </button>
            </div>
          </>
        )}

        {/* Variant B — mid (4-6) */}
        {!analyzed && zone === 'mid' && !letterDeclined && (
          <>
            <p className="ds3-body ds3-text-center" style={{ marginBottom: 12, lineHeight: 1.5 }}>
              עוד קצת מטלטל.<br/>
              <span className="ds3-text-muted">{LETTER_COPY_BY_ZONE.mid.lead}</span>
            </p>
            <div className="ds3-stack-3">
              <button
                type="button"
                className="ds3-btn ds3-btn-outline-terra"
                onClick={() => setShowLetter(true)}
                disabled={inFlight}
              >
                {LETTER_COPY_BY_ZONE.mid.cta}
              </button>
              <button
                type="button"
                className="ds3-btn-quiet"
                style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}
                onClick={() => setLetterDeclined(true)}
                disabled={inFlight}
              >
                {LETTER_COPY_BY_ZONE.mid.declineCta}
              </button>
            </div>
          </>
        )}
        {!analyzed && zone === 'mid' && letterDeclined && (
          <p className="ds3-caption ds3-text-soft ds3-text-center">
            {LETTER_COPY_BY_ZONE.mid.afterDeclineHint}
          </p>
        )}

        {/* Variant C — low (≤3) */}
        {!analyzed && zone === 'low' && (
          <>
            <p className="ds3-body-lg ds3-text-center" style={{ marginBottom: 14, fontWeight: 500, lineHeight: 1.55 }}>
              קשה. ויש רגעים שצריך<br/>
              לא להיות איתם לבד.
            </p>
            <p className="ds3-body ds3-text-muted ds3-text-center" style={{ marginTop: -8, marginBottom: 14 }}>
              תמיד יש מישהי בצד השני של הקו.
            </p>
            <div className="ds3-stack-3">
              <button
                type="button"
                className="ds3-btn ds3-btn-coral"
                onClick={() => setShowCallModal(true)}
                disabled={inFlight}
              >
                לפנות למישהי עכשיו
              </button>
              <button
                type="button"
                className="ds3-btn ds3-btn-outline-terra"
                onClick={() => setBreathingMode(true)}
                disabled={inFlight}
              >
                להישאר עוד רגע ולנשום
              </button>
            </div>
          </>
        )}

        {/* Analyzed branch — Claude handoff */}
        {analyzed && onContinueWithClaude && (
          <button
            type="button"
            className="ds3-btn ds3-btn-primary"
            onClick={onContinueWithClaude}
            disabled={inFlight}
            style={{ marginBottom: 10 }}
          >
            המשך לעבוד עם זה
          </button>
        )}

        {/* Universal "סיימתי" — anchor to the Read Shortcut. iOS opens Shortcuts
            (which ends workout, reads HR samples, posts them); onFinish runs
            in parallel to save the session and advance to PhaseSummary. When
            the user returns to Safari, the chart auto-loads from polling. */}
        {hrSessionId ? (
          <a
            href={buildRunShortcutUrl(hrSessionId)}
            className="ds3-btn ds3-btn-cream"
            onClick={(e) => {
              if (inFlight) { e.preventDefault(); return; }
              onFinish();
            }}
            style={{
              marginTop: 10, textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: inFlight ? 0.6 : 1,
              pointerEvents: inFlight ? 'none' : 'auto',
            }}
          >
            {saving ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: 'currentColor', animation: 'ds3BreathDot 1.4s ease-in-out infinite' }} />
                <span>שומר…</span>
              </span>
            ) : saved ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="5 12 10 17 19 7" />
                </svg>
                <span>נשמר</span>
              </span>
            ) : 'סיימתי'}
          </a>
        ) : (
          <button
            type="button"
            className="ds3-btn ds3-btn-cream"
            onClick={onFinish}
            disabled={inFlight}
            style={{ marginTop: 10 }}
          >
            {saving ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: 'currentColor', animation: 'ds3BreathDot 1.4s ease-in-out infinite' }} />
                <span>שומר…</span>
              </span>
            ) : saved ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="5 12 10 17 19 7" />
                </svg>
                <span>נשמר</span>
              </span>
            ) : 'סיימתי'}
          </button>
        )}
      </footer>

      <CallSomeoneModal open={showCallModal} onClose={() => setShowCallModal(false)} />
      <LetterModal open={showLetter} onClose={() => setShowLetter(false)} />
    </div>
  );
}

function QuickPill({ label, tint, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%', height: 64, borderRadius: 32,
        background: 'var(--surface)', color: 'var(--ink)',
        border: `1.5px solid ${tint}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 22px',
        fontFamily: 'inherit', fontSize: 17, fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      <span style={{ width: 10, height: 10, borderRadius: 5, background: tint }} />
      <span>{label}</span>
    </button>
  );
}

function Topbar({ onExit }) {
  return (
    <div className="ds3-topbar">
      <span className="ds3-topbar-spacer" />
      <span className="ds3-topbar-label">
        <span className="ds3-topbar-label-icon color-tone-reflect" aria-hidden="true"><Phase10ClosingIcon /></span>
        סגירה
      </span>
      <button type="button" className="ds3-topbar-back" aria-label="צא" onClick={onExit}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
