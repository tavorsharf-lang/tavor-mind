import { useState, useEffect } from 'react';
import BreathingExercise from './components/BreathingExercise.jsx';
import { Phase2BreathingIcon } from '../../components/icons/index.jsx';
import {
  hasSeenOnboarding,
  markOnboardingSeen,
  pushResponse,
  getDefaultCycles,
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
  'נער את הידיים והרגליים בעדינות, 10 שניות.',
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
}) {
  const noteProps = { note: breathingNote, setNote: setBreathingNote };
  const felt62Props = { felt62: breathingFelt62, setFelt62: setBreathingFelt62 };
  if (activation === 'hyper') return <HyperBranch onNext={onNext} onSkip={onSkip} onExit={onExit} />;
  if (activation === 'hypo')  return <HypoBranch onNext={onNext} onSkip={onSkip} onExit={onExit} {...noteProps} {...felt62Props} />;
  return <MidBranch onNext={onNext} onSkip={onSkip} onExit={onExit} {...noteProps} />;
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

function HyperBranch({ onNext, onSkip, onExit }) {
  const pattern = PATTERN_BY_ACTIVATION.hyper;
  const [round, setRound] = useState(1);
  const [done, setDone] = useState(false);
  const cycles = CYCLES_BY_PATTERN[pattern];
  const ready = useVisibleSinceMount();

  if (done) {
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} />
        <main className="ds3-screen-content ds3-screen-content-center ds3-text-center">
          <h1 className="ds3-h1">נשמת.</h1>
        </main>
        <footer className="ds3-screen-footer ds3-stack-3">
          <button type="button" className="ds3-btn ds3-btn-primary" onClick={onNext}>הלאה</button>
          <button
            type="button"
            className="ds3-btn ds3-btn-outline-terra"
            onClick={() => { setDone(false); setRound(round + 1); }}
          >
            המשך לדקה נוספת
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

function HypoBranch({ onNext, onSkip, onExit, note, setNote, felt62, setFelt62 }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [stage, setStage] = useState('activate');
  const [round, setRound] = useState(1);
  const [tooMuch, setTooMuch] = useState(false);
  const [cycles62] = useState(() => getDefaultCycles());

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
            <h1 className="ds3-h1">קודם נעיר את הגוף בעדינות, ואז ננשום</h1>
          </div>
          <div className="ds3-card-loose">
            <div className="ds3-caption ds3-text-soft" style={{ marginBottom: 8 }}>
              {stepIdx + 1} / {HYPO_STEPS.length}
            </div>
            <p className="ds3-body" style={{ margin: 0, lineHeight: 1.55 }}>{HYPO_STEPS[stepIdx]}</p>
          </div>
        </main>
        <footer className="ds3-screen-footer">
          <button
            type="button"
            className="ds3-btn ds3-btn-primary"
            onClick={() => {
              if (isLast) setStage(hasSeenOnboarding() ? 'breathe62' : 'onboard62');
              else setStepIdx(stepIdx + 1);
            }}
          >
            הלאה
          </button>
        </footer>
      </div>
    );
  }

  // Onboarding rendered as a MODAL OVERLAY on top of the breathe62 screen
  // (matches design 0 — backdrop blur, dimmed page behind, centered card).
  // Falls through into breathe62 below; modal renders via showIntro flag.
  const showOnboardingModal = stage === 'onboard62';
  if (showOnboardingModal) {
    return (
      <div className="ds3-screen" style={{ position: 'relative' }}>
        {/* Faux background — the breathe62 chip + title visible behind blur */}
        <Topbar onExit={onExit} />
        <main className="ds3-screen-content ds3-screen-content-center ds3-stack-4 ds3-text-center" aria-hidden="true" style={{ filter: 'blur(2px)', opacity: 0.5 }}>
          <div className="ds3-stack-2">
            <div style={{ display: 'inline-flex', padding: '6px 14px', borderRadius: 999, background: 'rgba(10, 132, 255, 0.10)', color: 'var(--lichen)', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', alignSelf: 'center' }}>
              שלב 1 מתוך 2
            </div>
            <h1 className="ds3-h1">נשימה מעוררת</h1>
            <p className="ds3-body ds3-text-muted">שאיפה ארוכה — נשיפה קצרה</p>
          </div>
        </main>

        {/* Modal overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100,
          background: 'rgba(20, 18, 16, 0.42)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          display: 'grid', placeItems: 'center', padding: 24,
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: 22, padding: '24px 22px',
            maxWidth: 340, width: '100%',
            boxShadow: '0 14px 40px rgba(0, 0, 0, 0.18)',
            border: '1px solid var(--line-soft)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--lichen)' }} />
              <span className="ds3-caption" style={{ color: 'var(--lichen)', fontWeight: 700 }}>
                נשימה לתת-עוררות
              </span>
            </div>
            <p className="ds3-body" style={{ lineHeight: 1.65, marginBottom: 20, marginTop: 0 }}>
              במצב מרוקן, הנשימה הזו עובדת בכיוון שונה ממה שאתה רגיל.
              שאיפה ארוכה — נשיפה קצרה. זו הדרך להעיר את המערכת בצורה רכה.
              אחר כך נעבור לנשימה מאזנת.
            </p>
            <button
              type="button"
              className="ds3-btn ds3-btn-blue"
              onClick={() => { markOnboardingSeen(); setStage('breathe62'); }}
              style={{ height: 52, borderRadius: 26 }}
            >
              הבנתי, נתחיל
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'breathe62') {
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
            <p className="ds3-body ds3-text-muted">שאיפה ארוכה — נשיפה קצרה</p>
          </div>
          <BreathingExercise
            key={`hypo-62-${round}`}
            defaultPattern="62"
            defaultPace="normal"
            cycles={cycles62}
            lockPattern={true}
            onComplete={() => setStage('transition')}
          />
        </main>
        <footer className="ds3-screen-footer" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => { setTooMuch(true); setStage('transition'); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--heart)', fontFamily: 'inherit',
              fontSize: 14, fontWeight: 600, padding: '6px 8px',
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
            onComplete={() => setStage('feedback')}
          />
        </main>
        <footer className="ds3-screen-footer" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          {/* "זה יותר מדי" — same escape as stage 1 but smaller/dimmer per design */}
          <button
            type="button"
            onClick={onSkip}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--heart)', fontFamily: 'inherit',
              fontSize: 13, fontWeight: 500,
              opacity: 0.75, padding: '6px 8px',
            }}
          >
            זה יותר מדי
          </button>
        </footer>
      </div>
    );
  }

  // feedback — after-score (3 pills) per design screen 4
  const items = [
    { id: 'right',    label: 'מעורר נכון',     tint: 'var(--lichen)' },
    { id: 'almost',   label: 'כמעט יותר מדי',  tint: 'var(--orange)' },
    { id: 'too_much', label: 'יותר מדי',        tint: 'var(--heart)' },
  ];
  return (
    <div className="ds3-screen">
      <Topbar onExit={onExit} />
      <main className="ds3-screen-content">
        <div className="ds3-stack-3" style={{ marginTop: 12, padding: '8px 4px' }}>
          <p className="ds3-caption" style={{ color: 'var(--lichen)', fontWeight: 700, margin: 0 }}>
            איך הרגיש השלב הראשון
          </p>
          <h1 className="ds3-h1" style={{ lineHeight: 1.35 }}>
            ה-6-2 הרגיש מעורר נכון,<br/>או יותר מדי?
          </h1>
        </div>

        <div className="ds3-grow" />

        <div className="ds3-stack-3" style={{ padding: '0 4px 4px' }}>
          {items.map((opt) => {
            const isSel = felt62 === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => { setFelt62(opt.id); pushResponse(opt.id); }}
                style={{
                  width: '100%', height: 60, borderRadius: 30,
                  background: isSel ? opt.tint : 'var(--surface)',
                  color: isSel ? '#fff' : 'var(--ink)',
                  border: `1.5px solid ${opt.tint}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0 22px',
                  fontFamily: 'inherit', fontSize: 17, fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: isSel ? `0 8px 22px ${opt.tint}40` : 'none',
                  transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)',
                }}
                aria-pressed={isSel}
              >
                <span style={{ width: 10, height: 10, borderRadius: 5, background: isSel ? '#fff' : opt.tint }} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        <NoteField note={note} setNote={setNote} />
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
          className="ds3-btn-quiet"
          onClick={() => { setRound(round + 1); setStage('breathe55'); }}
        >
          עוד 6 נשימות מאזנות
        </button>
      </footer>
    </div>
  );
}

function MidBranch({ onNext, onSkip, onExit, note, setNote }) {
  const pattern = PATTERN_BY_ACTIVATION.mid;
  const [round, setRound] = useState(1);
  const [done, setDone] = useState(false);
  const cycles = CYCLES_BY_PATTERN[pattern];
  const ready = useVisibleSinceMount();

  if (done) {
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} />
        <main className="ds3-screen-content">
          <div className="ds3-stack-3" style={{ marginTop: 12 }}>
            <h1 className="ds3-h1">נשמת.</h1>
            <p className="ds3-body ds3-text-muted">{AFTER_LINE}</p>
          </div>
          <NoteField note={note} setNote={setNote} />
        </main>
        <footer className="ds3-screen-footer ds3-stack-3">
          <button type="button" className="ds3-btn ds3-btn-primary" onClick={onNext}>הלאה</button>
          <button
            type="button"
            className="ds3-btn ds3-btn-outline-terra"
            onClick={() => { setDone(false); setRound(round + 1); }}
          >
            עוד {cycles} נשימות
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
