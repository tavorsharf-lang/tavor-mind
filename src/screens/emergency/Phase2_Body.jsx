import { useState, useEffect } from 'react';
import BreathingExercise from './components/BreathingExercise.jsx';
import KapalabhatiExercise from './components/KapalabhatiExercise.jsx';
import StandUpHologram from './components/StandUpHologram.jsx';
import JumpHologram from './components/JumpHologram.jsx';
import ShakeHologram from './components/ShakeHologram.jsx';
import HeartBellyHologram from './components/HeartBellyHologram.jsx';
import { PhaseBreath as Phase2BreathingIcon } from '../../components/icons/system.jsx';
import {
  hasSeenOnboarding,
  markOnboardingSeen,
  pushResponse,
} from '../../utils/breathing62Storage.js';

// After Phase 1 picks an activation, iOS opens Shortcuts to start the Watch
// workout — the user is away from Safari for a few seconds. Without gating,
// the breathing exercise auto-advances while they're gone and they miss the
// start of the first breath. Latch on first 'visible' event so the exercise
// only mounts (and timers only begin) after they return. Stays true forever
// after that — we don't want to pause/resume mid-session on incidental blurs.
function useVisibleSinceMount() {
  const [visible, setVisible] = useState(() =>
    typeof document === 'undefined' || document.visibilityState === 'visible'
  );
  useEffect(() => {
    if (visible) return;
    const onVis = () => {
      if (document.visibilityState === 'visible') setVisible(true);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [visible]);
  return visible;
}

function WaitingForReturn() {
  return (
    <div className="ds3-stack-4 ds3-text-center" style={{ marginTop: 24 }}>
      <div style={{
        width: 56, height: 56, borderRadius: 28,
        background: 'radial-gradient(circle at 35% 30%, #FFFFFF, var(--lichen))',
        boxShadow: '0 8px 28px rgba(10, 132, 255, 0.40)',
        margin: '0 auto',
        animation: 'ds3BreathPulse 2.4s ease-in-out infinite',
      }} />
      <p className="ds3-body ds3-text-muted">כשתחזור לכאן — נתחיל.</p>
    </div>
  );
}

const HYPO_STEPS = [
  'קום ועמוד אם אתה יושב או שוכב.',
  '10 קפיצות במקום — עכשיו.',
  'נער ידיים ורגליים בכוח, 10 שניות.',
  'שים יד אחת על הלב, יד אחת על הבטן.',
];

const AFTER_LINE = 'שים לב — הדופק והנשימה שונים עכשיו ממה שהיו לפני שתי דקות.';
const PATTERN_BY_ACTIVATION = { hyper: 'physio_sigh', hypo: 'coherent', mid: 'box' };
const CYCLES_BY_PATTERN = { '478': 4, box: 6, coherent: 6, physio_sigh: 4 };
const DEFAULT_PACE_BY_BRANCH = { hyper: 'normal', hypo: 'slow', mid: 'normal' };

export default function Phase2Body({
  activation,
  breathingNote,
  setBreathingNote,
  breathingFelt62,
  setBreathingFelt62,
  onNext,
  onSkip,
  onExit,
  onRestart,
}) {
  const noteProps = { note: breathingNote, setNote: setBreathingNote };
  const felt62Props = { felt62: breathingFelt62, setFelt62: setBreathingFelt62 };
  const common = { onNext, onSkip, onExit, onRestart };
  if (activation === 'hyper') return <HyperBranch {...common} />;
  if (activation === 'hypo')  return <HypoBranch {...common} {...felt62Props} />;
  return <MidBranch {...common} {...noteProps} />;
}

function Topbar({ onExit }) {
  return (
    <div className="ds3-topbar">
      <span className="ds3-topbar-spacer" />
      <span className="ds3-topbar-label">
        <span className="ds3-topbar-label-icon color-tone-calm" aria-hidden="true"><Phase2BreathingIcon /></span>
        שלב 1 · להירגע
      </span>
      <button type="button" className="ds3-topbar-back" aria-label="צא" onClick={onExit}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

function NoteField({ note, setNote }) {
  return (
    <div style={{ marginTop: 18 }}>
      <p className="ds3-caption ds3-text-muted" style={{ marginBottom: 8 }}>
        אם בא לך לכתוב מה עולה עכשיו — לא חובה
      </p>
      <textarea
        className="ds3-textarea"
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
    </div>
  );
}

function NextButton({ onNext }) {
  return (
    <button type="button" className="ds3-btn ds3-btn-primary" onClick={onNext}>
      הלאה
    </button>
  );
}

function HyperBranch({ onNext, onSkip, onExit, onRestart }) {
  const pattern = PATTERN_BY_ACTIVATION.hyper;
  const [round, setRound] = useState(1);
  const [stage, setStage] = useState('breathe'); // 'breathe' | 'continuation'
  const [currentCycles, setCurrentCycles] = useState(CYCLES_BY_PATTERN[pattern]);
  const ready = useVisibleSinceMount();

  if (stage === 'continuation') {
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} />
        <main className="ds3-screen-content ds3-screen-content-center ds3-text-center ds3-stack-4">
          <h1 className="ds3-h1">נשמת.</h1>
          <p className="ds3-body ds3-text-muted">
            לרצות עוד מחזורים, או להתקדם?
          </p>
          <button type="button" className="ds3-btn-quiet" onClick={onRestart}>
            צריך משהו אחר
          </button>
        </main>
        <footer className="ds3-screen-footer ds3-stack-3">
          <button
            type="button"
            className="ds3-btn ds3-btn-primary"
            onClick={onNext}
          >
            הלאה
          </button>
          <button
            type="button"
            className="ds3-btn ds3-btn-outline-terra"
            onClick={() => { setCurrentCycles(4); setRound(round + 1); setStage('breathe'); }}
          >
            עוד 4 מחזורים
          </button>
          <button
            type="button"
            className="ds3-btn-quiet"
            onClick={() => { setCurrentCycles(8); setRound(round + 1); setStage('breathe'); }}
          >
            עוד 8 מחזורים
          </button>
        </footer>
      </div>
    );
  }

  return (
    <div className="ds3-screen">
      <Topbar onExit={onExit} />
      <main className="ds3-screen-content ds3-screen-content-center ds3-stack-4 ds3-text-center">
        <h1 className="ds3-h1">נשימה — תכניס ותוציא</h1>
        {ready ? (
          <BreathingExercise
            key={`hyper-${round}`}
            defaultPattern={pattern}
            defaultPace={DEFAULT_PACE_BY_BRANCH.hyper}
            cycles={currentCycles}
            lockPattern={true}
            onComplete={() => setStage('continuation')}
          />
        ) : (
          <WaitingForReturn />
        )}
      </main>
      <footer className="ds3-screen-footer">
        <NextButton onNext={onSkip} />
      </footer>
    </div>
  );
}

function HypoBranch({ onNext, onSkip, onExit, felt62, setFelt62 }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [stage, setStage] = useState('activate');
  const [round, setRound] = useState(1);
  const [tooMuch, setTooMuch] = useState(false);
  const [moreCycles, setMoreCycles] = useState(0);

  useEffect(() => {
    if (stage !== 'transition') return;
    const t = setTimeout(() => setStage('breathe55'), 3000);
    return () => clearTimeout(t);
  }, [stage]);

  if (stage === 'activate') {
    const isLast = stepIdx === HYPO_STEPS.length - 1;
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} />
        <main className="ds3-screen-content ds3-stack-5">
          <div className="ds3-stack-2" style={{ marginTop: 12 }}>
            <h1 className="ds3-h1">קודם נעיר את הגוף, ואז ננשום</h1>
          </div>
          <div className="ds3-card-loose">
            <div className="ds3-caption ds3-text-soft" style={{ marginBottom: 8 }}>
              {stepIdx + 1} / {HYPO_STEPS.length}
            </div>
            <p className="ds3-body" style={{ margin: 0, lineHeight: 1.55 }}>{HYPO_STEPS[stepIdx]}</p>
          </div>
          {stepIdx === 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
              <StandUpHologram size={220} />
            </div>
          )}
          {stepIdx === 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
              <JumpHologram size={220} />
            </div>
          )}
          {stepIdx === 2 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
              <ShakeHologram size={220} />
            </div>
          )}
          {stepIdx === 3 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
              <HeartBellyHologram size={220} />
            </div>
          )}
        </main>
        <footer className="ds3-screen-footer">
          <button
            type="button"
            className="ds3-btn ds3-btn-primary"
            onClick={() => {
              if (isLast) setStage(hasSeenOnboarding() ? 'breathe42_initial' : 'onboard42');
              else setStepIdx(stepIdx + 1);
            }}
          >
            הלאה
          </button>
        </footer>
      </div>
    );
  }

  // Onboarding rendered as a MODAL OVERLAY on top of the breathe42 screen.
  const showOnboardingModal = stage === 'onboard42';
  if (showOnboardingModal) {
    return (
      <div className="ds3-screen" style={{ position: 'relative' }}>
        <Topbar onExit={onExit} />
        <main className="ds3-screen-content ds3-screen-content-center ds3-stack-4 ds3-text-center" aria-hidden="true" style={{ filter: 'blur(2px)', opacity: 0.5 }}>
          <div className="ds3-stack-2">
            <div style={{ display: 'inline-flex', padding: '6px 14px', borderRadius: 999, background: 'rgba(10, 132, 255, 0.10)', color: 'var(--lichen)', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', alignSelf: 'center' }}>
              שלב 1 מתוך 2
            </div>
            <h1 className="ds3-h1">נשימה מעוררת</h1>
            <p className="ds3-body ds3-text-muted">שאיפה — נשיפה קצרה</p>
          </div>
        </main>

        <div className="modal-overlay" style={{ position: 'absolute' }}>
          <div
            className="modal-card modal-card-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hypo-onboard-title"
          >
            <div className="modal-accent modal-accent-lichen">
              נשימה לתת-עוררות
            </div>
            <h3 id="hypo-onboard-title" className="modal-title">שאיפה — נשיפה קצרה</h3>
            <p className="modal-body">
              במצב מרוקן, הנשימה הזו עובדת בכיוון שונה ממה שאתה רגיל.
              ננסה 2 מחזורים — ואז נבדוק איך זה הרגיש.
              אחר כך נעבור לנשימה מאזנת.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="ds3-btn ds3-btn-blue"
                onClick={() => { markOnboardingSeen(); setStage('breathe42_initial'); }}
              >
                הבנתי, נתחיל
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'breathe42_initial') {
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} />
        <main className="ds3-screen-content ds3-screen-content-center ds3-stack-4 ds3-text-center">
          <div className="ds3-stack-2">
            <div style={{
              display: 'inline-flex',
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(10, 132, 255, 0.10)',
              color: 'var(--lichen)',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.04em',
              alignSelf: 'center',
            }}>
              שלב 1 מתוך 2
            </div>
            <h1 className="ds3-h1">נשימה מעוררת</h1>
            <p className="ds3-body ds3-text-muted">2 מחזורי בדיקה — שאיפה 4, נשיפה 2</p>
          </div>
          <BreathingExercise
            key={`hypo-42-init-${round}`}
            defaultPattern="42"
            defaultPace="normal"
            cycles={2}
            lockPattern={true}
            onComplete={() => setStage('breathe42_check')}
          />
        </main>
        <footer className="ds3-screen-footer ds3-stack-3">
          <button
            type="button"
            className="ds3-btn ds3-btn-primary"
            onClick={() => setStage('breathe42_check')}
          >
            הלאה
          </button>
          <button
            type="button"
            onClick={() => setStage('kapalabhati')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--heart)', fontFamily: 'inherit',
              fontSize: 13, fontWeight: 600,
              textDecoration: 'underline',
              padding: '6px 8px',
              alignSelf: 'center',
            }}
          >
            דיסוציאציה עמוקה? להחליף ל-Kapalabhati אגרסיבי
          </button>
        </footer>
      </div>
    );
  }

  if (stage === 'kapalabhati') {
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} />
        <main className="ds3-screen-content ds3-screen-content-center ds3-stack-4 ds3-text-center">
          <KapalabhatiExercise
            key={`hypo-kapal-${round}`}
            onComplete={() => setStage('transition')}
            onAbort={() => setStage('breathe42_initial')}
          />
        </main>
        <footer className="ds3-screen-footer">
          <button
            type="button"
            className="ds3-btn ds3-btn-primary"
            onClick={() => setStage('transition')}
          >
            הלאה
          </button>
        </footer>
      </div>
    );
  }

  if (stage === 'breathe42_check') {
    const checkItems = [
      { id: 'more4',   label: 'להמשיך — עוד 4 מחזורים', tint: 'var(--lichen)', sub: 'נשימה מעוררת' },
      { id: 'more8',   label: 'להמשיך — עוד 8 מחזורים', tint: 'var(--lichen)', sub: 'נשימה מעוררת, קצת יותר' },
      { id: 'balance', label: 'לעבור לנשימה המאזנת',     tint: 'var(--orange)', sub: 'מספיק מעורר — הלאה', filled: true },
    ];
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} />
        <main className="ds3-screen-content">
          <div className="ds3-stack-3" style={{ marginTop: 12, padding: '8px 4px' }}>
            <p className="ds3-caption" style={{ color: 'var(--lichen)', fontWeight: 700, margin: 0 }}>
              בדיקה אחרי 2 מחזורים
            </p>
            <h1 className="ds3-h1" style={{ lineHeight: 1.35 }}>
              איך הרגיש?
            </h1>
          </div>
          <div className="ds3-grow" />
          <div className="ds3-stack-3" style={{ padding: '0 4px 4px' }}>
            {checkItems.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setFelt62(opt.id);
                  if (opt.id === 'balance') {
                    pushResponse('right');
                    setStage('transition');
                  } else {
                    pushResponse(opt.id === 'more4' ? 'right' : 'almost');
                    setMoreCycles(opt.id === 'more4' ? 4 : 8);
                    setStage('breathe42_more');
                  }
                }}
                style={{
                  width: '100%', minHeight: 64, borderRadius: 24,
                  background: opt.filled ? opt.tint : 'var(--surface)',
                  color: opt.filled ? '#FFFFFF' : 'var(--ink)',
                  border: `1.5px solid ${opt.tint}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
                  padding: '10px 22px', gap: 2,
                  fontFamily: 'inherit', cursor: 'pointer',
                  transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)',
                  textAlign: 'right',
                }}
              >
                <span style={{ fontSize: 17, fontWeight: 600 }}>{opt.label}</span>
                <span style={{ fontSize: 13, color: opt.filled ? 'rgba(255,255,255,0.85)' : 'var(--ink-muted)', fontWeight: 500 }}>{opt.sub}</span>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (stage === 'breathe42_more') {
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} />
        <main className="ds3-screen-content ds3-screen-content-center ds3-stack-4 ds3-text-center">
          <div className="ds3-stack-2">
            <div style={{
              display: 'inline-flex',
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(10, 132, 255, 0.10)',
              color: 'var(--lichen)',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.04em',
              alignSelf: 'center',
            }}>
              שלב 1 מתוך 2 — ממשיכים
            </div>
            <h1 className="ds3-h1">נשימה מעוררת</h1>
            <p className="ds3-body ds3-text-muted">עוד {moreCycles} מחזורים</p>
          </div>
          <BreathingExercise
            key={`hypo-42-more-${round}`}
            defaultPattern="42"
            defaultPace="normal"
            cycles={moreCycles}
            lockPattern={true}
            onComplete={() => setStage('transition')}
          />
        </main>
        <footer className="ds3-screen-footer ds3-stack-3">
          <button
            type="button"
            className="ds3-btn ds3-btn-primary"
            onClick={() => setStage('transition')}
          >
            הלאה
          </button>
          <button
            type="button"
            onClick={() => { setTooMuch(true); setStage('transition'); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--heart)', fontFamily: 'inherit',
              fontSize: 14, fontWeight: 600, padding: '6px 8px',
              alignSelf: 'center',
            }}
          >
            זה יותר מדי
          </button>
        </footer>
      </div>
    );
  }

  if (stage === 'transition') {
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} />
        <main className="ds3-screen-content ds3-screen-content-center ds3-stack-5 ds3-text-center">
          <div style={{
            width: 56, height: 56, borderRadius: 28,
            background: `radial-gradient(circle at 35% 30%, #FFFFFF, var(--lichen))`,
            boxShadow: `0 8px 28px rgba(10, 132, 255, 0.40)`,
            margin: '0 auto',
            animation: 'ds3BreathPulse 2.4s ease-in-out infinite',
          }} />
          <div className="ds3-stack-3">
            <h1 className="ds3-h1">שים לב לגוף.</h1>
            <p className="ds3-body ds3-text-muted">הנשימה תעבור עכשיו לאיזון.</p>
          </div>
          <div className="ds3-micro ds3-text-soft" style={{ opacity: 0.7, letterSpacing: '0.08em', marginTop: 12 }}>⋯ ⋯ ⋯</div>
        </main>
      </div>
    );
  }

  if (stage === 'breathe55') {
    const cycles55 = tooMuch ? 12 : 6;
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} />
        <main className="ds3-screen-content ds3-screen-content-center ds3-stack-4 ds3-text-center">
          <div className="ds3-stack-2">
            <div style={{
              display: 'inline-flex',
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(10, 132, 255, 0.10)',
              color: 'var(--lichen)',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.04em',
              alignSelf: 'center',
            }}>
              שלב 2 מתוך 2
            </div>
            <h1 className="ds3-h1">נשימה מאזנת</h1>
            <p className="ds3-body ds3-text-muted">5 שאיפה — 5 נשיפה</p>
          </div>
          <BreathingExercise
            key={`hypo-55-${round}`}
            defaultPattern="coherent"
            defaultPace="slow"
            cycles={cycles55}
            lockPattern={true}
            onComplete={onNext}
          />
        </main>
        <footer className="ds3-screen-footer ds3-stack-3">
          <button
            type="button"
            className="ds3-btn ds3-btn-primary"
            onClick={onNext}
          >
            הלאה
          </button>
          {/* "זה יותר מדי" — same escape as stage 1 but smaller/dimmer per design */}
          <button
            type="button"
            onClick={onSkip}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--heart)', fontFamily: 'inherit',
              fontSize: 13, fontWeight: 500,
              opacity: 0.75, padding: '6px 8px',
              alignSelf: 'center',
            }}
          >
            זה יותר מדי
          </button>
        </footer>
      </div>
    );
  }

  // breathe55 completion advances straight to the next phase — no end-of-flow prompt.
  return null;
}

function MidBranch({ onNext, onSkip, onExit, onRestart, note, setNote }) {
  const pattern = PATTERN_BY_ACTIVATION.mid;
  const [round, setRound] = useState(1);
  const [done, setDone] = useState(false);
  const cycles = CYCLES_BY_PATTERN[pattern];
  const ready = useVisibleSinceMount();

  if (done) {
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} />
        <main className="ds3-screen-content ds3-screen-content-center ds3-stack-4 ds3-text-center">
          <h1 className="ds3-h1">הנשימה הספיקה?</h1>
          <p className="ds3-body ds3-text-muted">{AFTER_LINE}</p>
          <button type="button" className="ds3-btn-quiet" onClick={onRestart}>
            צריך משהו אחר
          </button>
          <NoteField note={note} setNote={setNote} />
        </main>
        <footer className="ds3-screen-footer">
          <button type="button" className="ds3-btn ds3-btn-primary" onClick={onNext}>
            הלאה
          </button>
        </footer>
      </div>
    );
  }

  return (
    <div className="ds3-screen">
      <Topbar onExit={onExit} />
      <main className="ds3-screen-content ds3-screen-content-center ds3-stack-4 ds3-text-center">
        <h1 className="ds3-h1">נשימה — תכניס ותוציא</h1>
        {ready ? (
          <BreathingExercise
            key={`mid-${round}`}
            defaultPattern={pattern}
            defaultPace={DEFAULT_PACE_BY_BRANCH.mid}
            cycles={cycles}
            lockPattern={true}
            onComplete={() => setDone(true)}
          />
        ) : (
          <WaitingForReturn />
        )}
      </main>
      <footer className="ds3-screen-footer">
        <NextButton onNext={onSkip} />
      </footer>
    </div>
  );
}

