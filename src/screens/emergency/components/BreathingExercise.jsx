import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { getBreathingHaptic } from '../../../utils/breathingHaptic.js';

const PATTERNS = {
  '478': {
    paces: {
      slow:   [
        { label: 'שאף',  subtitle: 'מלא את הריאות לאט',  from: 0.85, to: 1.55, sec: 5 },
        { label: 'החזק', subtitle: 'החזק. אתה כאן.',       from: 1.55, to: 1.55, sec: 8 },
        { label: 'נשוף', subtitle: 'תן לכל האוויר לצאת',   from: 1.55, to: 0.85, sec: 9 },
      ],
      normal: [
        { label: 'שאף',  subtitle: 'מלא את הריאות לאט',  from: 0.85, to: 1.55, sec: 4 },
        { label: 'החזק', subtitle: 'החזק. אתה כאן.',       from: 1.55, to: 1.55, sec: 7 },
        { label: 'נשוף', subtitle: 'תן לכל האוויר לצאת',   from: 1.55, to: 0.85, sec: 8 },
      ],
      fast:   [
        { label: 'שאף',  subtitle: 'מלא את הריאות לאט',  from: 0.85, to: 1.55, sec: 3 },
        { label: 'החזק', subtitle: 'החזק. אתה כאן.',       from: 1.55, to: 1.55, sec: 5 },
        { label: 'נשוף', subtitle: 'תן לכל האוויר לצאת',   from: 1.55, to: 0.85, sec: 6 },
      ],
    },
  },
  box: {
    paces: {
      slow:   [
        { label: 'שאף',  subtitle: 'מלא את הריאות לאט',    from: 0.9,  to: 1.45, sec: 5 },
        { label: 'החזק', subtitle: 'החזק. אתה כאן.',         from: 1.45, to: 1.45, sec: 5 },
        { label: 'נשוף', subtitle: 'תן לכל האוויר לצאת',     from: 1.45, to: 0.9,  sec: 5 },
        { label: 'החזק', subtitle: 'תן לרווח להתקיים',       from: 0.9,  to: 0.9,  sec: 5 },
      ],
      normal: [
        { label: 'שאף',  subtitle: 'מלא את הריאות לאט',    from: 0.9,  to: 1.45, sec: 4 },
        { label: 'החזק', subtitle: 'החזק. אתה כאן.',         from: 1.45, to: 1.45, sec: 4 },
        { label: 'נשוף', subtitle: 'תן לכל האוויר לצאת',     from: 1.45, to: 0.9,  sec: 4 },
        { label: 'החזק', subtitle: 'תן לרווח להתקיים',       from: 0.9,  to: 0.9,  sec: 4 },
      ],
      fast:   [
        { label: 'שאף',  subtitle: 'מלא את הריאות לאט',    from: 0.9,  to: 1.45, sec: 3 },
        { label: 'החזק', subtitle: 'החזק. אתה כאן.',         from: 1.45, to: 1.45, sec: 3 },
        { label: 'נשוף', subtitle: 'תן לכל האוויר לצאת',     from: 1.45, to: 0.9,  sec: 3 },
        { label: 'החזק', subtitle: 'תן לרווח להתקיים',       from: 0.9,  to: 0.9,  sec: 3 },
      ],
    },
  },
  coherent: {
    paces: {
      slow:   [
        { label: 'שאף',  subtitle: 'מלא את הריאות באוויר', from: 0.9, to: 1.5, sec: 6 },
        { label: 'נשוף', subtitle: 'תן לאוויר לצאת לאט',    from: 1.5, to: 0.9, sec: 6 },
      ],
      normal: [
        { label: 'שאף',  subtitle: 'מלא את הריאות באוויר', from: 0.9, to: 1.5, sec: 5 },
        { label: 'נשוף', subtitle: 'תן לאוויר לצאת לאט',    from: 1.5, to: 0.9, sec: 5 },
      ],
      fast:   [
        { label: 'שאף',  subtitle: 'מלא את הריאות באוויר', from: 0.9, to: 1.5, sec: 4 },
        { label: 'נשוף', subtitle: 'תן לאוויר לצאת לאט',    from: 1.5, to: 0.9, sec: 4 },
      ],
    },
  },
  '62': {
    paces: {
      slow: [
        { label: 'שאף',  subtitle: 'שאיפה רגועה אבל ארוכה — לא גדולה', from: 0.9, to: 1.5, sec: 7 },
        { label: 'נשוף', subtitle: 'שחרור קצר',                         from: 1.5, to: 0.9, sec: 2 },
      ],
      normal: [
        { label: 'שאף',  subtitle: 'שאיפה רגועה אבל ארוכה — לא גדולה', from: 0.9, to: 1.5, sec: 6 },
        { label: 'נשוף', subtitle: 'שחרור קצר',                         from: 1.5, to: 0.9, sec: 2 },
      ],
      fast: [
        { label: 'שאף',  subtitle: 'שאיפה רגועה אבל ארוכה — לא גדולה', from: 0.9, to: 1.5, sec: 5 },
        { label: 'נשוף', subtitle: 'שחרור קצר',                         from: 1.5, to: 0.9, sec: 2 },
      ],
    },
  },
};

// Physiological easing per breath phase.
// Inhale: symmetric ease-in-out-sine — sigmoid lung-volume curve during relaxed active inhalation.
// Exhale: ease-out-quad — bias toward early release (elastic recoil) with gentle settle, soft enough for guided breathing.
// Hold: linear placeholder (scale doesn't change so curve is irrelevant).
const EASING_INHALE = 'cubic-bezier(0.37, 0, 0.63, 1)';
const EASING_EXHALE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
const EASING_HOLD = 'linear';

function easingFor(label) {
  if (label === 'שאף') return EASING_INHALE;
  if (label === 'נשוף') return EASING_EXHALE;
  return EASING_HOLD;
}

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const PATTERN_LABELS = [
  { id: '478',      label: '4-7-8',   sublabel: 'הרגעה' },
  { id: 'box',      label: 'קופסה',   sublabel: '4×4' },
  { id: 'coherent', label: '5-5',     sublabel: 'איזון' },
];

const PACE_LABELS = [
  { id: 'slow',   label: 'איטי', rhythm: [4, 16, 28] },
  { id: 'normal', label: 'רגיל', rhythm: [7, 16, 25] },
  { id: 'fast',   label: 'מהיר', rhythm: [11, 16, 21] },
];

function PaceRhythm({ rhythm }) {
  return (
    <svg className="pace-rhythm" viewBox="0 0 32 6" width="32" height="6" aria-hidden="true">
      {rhythm.map((cx, i) => (
        <circle key={i} cx={cx} cy={3} r={1.5} fill="currentColor" />
      ))}
    </svg>
  );
}

const CYCLE_AFFIRMATIONS = [
  'התחלנו',
  'הגוף מתחיל להירגע',
  'אתה כאן עם עצמך',
  'הקצב מתייצב',
  'אתה כמעט שם',
];

function cycleAffirmation(cycle, total) {
  if (cycle > total) return null;
  if (cycle === total) return 'נשימה אחרונה — קח אותה איטית';
  return CYCLE_AFFIRMATIONS[cycle - 1] || null;
}

function formatElapsed(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function DirectionIcon({ step }) {
  const ref = useRef(null);
  const isHold = step.label === 'החזק';

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      el.style.transition = 'none';
      el.style.transform = 'translateY(0)';
      return;
    }
    if (step.label === 'שאף') {
      el.style.transition = 'none';
      el.style.transform = 'translateY(4px)';
      void el.offsetWidth;
      el.style.transition = `transform ${step.sec}s ${EASING_INHALE}`;
      el.style.transform = 'translateY(-4px)';
    } else if (step.label === 'נשוף') {
      el.style.transition = 'none';
      el.style.transform = 'translateY(-4px)';
      void el.offsetWidth;
      el.style.transition = `transform ${step.sec}s ${EASING_EXHALE}`;
      el.style.transform = 'translateY(4px)';
    } else {
      el.style.transition = 'transform 200ms ease-out';
      el.style.transform = 'translateY(0)';
    }
  }, [step.label, step.sec]);

  if (step.label === 'שאף') {
    return (
      <svg ref={ref} className="breathing-direction" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="6 11 12 5 18 11" />
      </svg>
    );
  }
  if (step.label === 'נשוף') {
    return (
      <svg ref={ref} className="breathing-direction" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" y1="5" x2="12" y2="19" />
        <polyline points="6 13 12 19 18 13" />
      </svg>
    );
  }
  return (
    <svg ref={ref} className="breathing-direction is-holding" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
    </svg>
  );
}

export default function BreathingExercise({ defaultPattern = '478', defaultPace = 'normal', cycles, onComplete, onPatternChange, lockPattern = false }) {
  const [pattern, setPattern] = useState(defaultPattern);
  const [pace, setPace] = useState(defaultPace);
  const [cycle, setCycle] = useState(1);
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [, setTick] = useState(0);

  const steps = PATTERNS[pattern].paces[pace];
  const stepCount = steps.length;
  const step = steps[Math.min(stepIndex, stepCount - 1)];
  const isBox = pattern === 'box';

  const circleRef = useRef(null);
  const auraRef = useRef(null);
  const traceRef = useRef(null);

  // Timestamps — useMemo so reset is synchronous with the deps change (no stale-render frame).
  // exerciseStartedAt resets when pattern changes so the elapsed counter reflects the active pattern.
  const exerciseStartedAt = useMemo(() => Date.now(), [pattern]);
  const stepStartedAt = useMemo(() => Date.now(), [stepIndex, cycle, pace, pattern]);

  // Reset cycle/step when pattern changes mid-exercise (different step counts per pattern).
  useEffect(() => {
    setStepIndex(0);
    setCycle(1);
    setDone(false);
  }, [pattern]);

  function handlePatternChange(next) {
    if (next === pattern) return;
    setPattern(next);
    onPatternChange?.(next);
  }

  // Re-render every 250ms to update countdown + total elapsed.
  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setTick((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [done]);

  useLayoutEffect(() => {
    if (done) return;
    const reduce = prefersReducedMotion();
    const ease = easingFor(step.label);
    const haptic = getBreathingHaptic();
    // Cancel anything scheduled from the previous step, then schedule taps only for inhale.
    // Same effect that wires the visual transition → audio fires in the same frame as the visual.
    haptic.cancel();
    if (step.label === 'שאף' && !reduce) {
      haptic.scheduleInhale(step.sec);
    }
    const el = circleRef.current;
    if (el) {
      if (reduce) {
        el.style.transition = 'none';
        el.style.transform = `scale(${(step.from + step.to) / 2})`;
      } else {
        el.style.transition = 'none';
        el.style.transform = `scale(${step.from})`;
        void el.offsetWidth;
        el.style.transition = `transform ${step.sec}s ${ease}`;
        el.style.transform = `scale(${step.to})`;
      }
    }
    // Aura tracks the breath at a softer amplitude — anchored at 1.0, expands ~10% on inhale peak.
    // This makes the surrounding halo feel like it's breathing with the body, not just the orb.
    const aura = auraRef.current;
    if (aura) {
      const auraFrom = 1 + (step.from - 1) * 0.18;
      const auraTo = 1 + (step.to - 1) * 0.18;
      if (reduce) {
        aura.style.transition = 'none';
        aura.style.transform = `scale(${(auraFrom + auraTo) / 2})`;
      } else {
        aura.style.transition = 'none';
        aura.style.transform = `scale(${auraFrom})`;
        void aura.offsetWidth;
        aura.style.transition = `transform ${step.sec}s ${ease}`;
        aura.style.transform = `scale(${auraTo})`;
      }
    }
    if (isBox && traceRef.current) {
      const t = traceRef.current;
      const startOffset = 1 - stepIndex / stepCount;
      const endOffset = 1 - (stepIndex + 1) / stepCount;
      t.style.transition = 'none';
      t.style.strokeDashoffset = String(startOffset);
      void t.getBoundingClientRect();
      t.style.transition = `stroke-dashoffset ${step.sec}s linear`;
      t.style.strokeDashoffset = String(endOffset);
    }
  }, [stepIndex, cycle, pace, done, isBox, stepCount, step]);

  useEffect(() => {
    if (done) return;
    if (cycle > cycles) {
      setDone(true);
      return;
    }
    const ms = step.sec * 1000;
    const t = setTimeout(() => {
      if (stepIndex + 1 < stepCount) {
        setStepIndex(stepIndex + 1);
      } else {
        setStepIndex(0);
        setCycle(cycle + 1);
      }
    }, ms);
    return () => clearTimeout(t);
  }, [stepIndex, cycle, pace, done, cycles, stepCount, step]);

  useEffect(() => {
    if (done) onComplete?.();
  }, [done, onComplete]);

  // iOS Safari requires a user gesture to unlock the AudioContext. Most paths into the breathing
  // screen include a click that already unlocked it, but if the user landed here via a refresh,
  // the context starts suspended. Resume on the first pointerdown anywhere in the page.
  useEffect(() => {
    const haptic = getBreathingHaptic();
    const onInteract = () => haptic.resumeIfNeeded();
    window.addEventListener('pointerdown', onInteract);
    return () => {
      window.removeEventListener('pointerdown', onInteract);
      haptic.cancel();
    };
  }, []);

  const displayCycle = Math.min(cycle, cycles);
  const renderTime = Date.now();
  const remainingMs = Math.max(0, step.sec * 1000 - (renderTime - stepStartedAt));
  const remainingSec = Math.max(1, Math.ceil(remainingMs / 1000));
  const elapsedTotal = formatElapsed(renderTime - exerciseStartedAt);
  const affirmation = cycleAffirmation(displayCycle, cycles);

  return (
    <div className="breathing">
      {!lockPattern && (
        <>
          <div className="pattern-selector" role="radiogroup" aria-label="תבנית נשימה">
            {PATTERN_LABELS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={pattern === p.id}
                className={`pattern-pill ${pattern === p.id ? 'is-active' : ''}`}
                onClick={() => handlePatternChange(p.id)}
              >
                <span className="pattern-pill-label">{p.label}</span>
                <span className="pattern-pill-sub">{p.sublabel}</span>
              </button>
            ))}
          </div>

          <div className="pace-selector" role="radiogroup" aria-label="קצב נשימה">
            {PACE_LABELS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={pace === p.id}
                className={`pace-pill ${pace === p.id ? 'is-active' : ''}`}
                onClick={() => setPace(p.id)}
              >
                <PaceRhythm rhythm={p.rhythm} />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
          <p className="pace-hint">אם הקצב או התבנית לא נוחים — שנה כל רגע</p>
        </>
      )}

      <div className="breathing-elapsed" aria-hidden="true">{elapsedTotal}</div>

      <div className="breathing-stage">
        {isBox && (
          <svg className="breathing-square" viewBox="0 0 240 240" aria-hidden="true">
            <rect
              x="6" y="6" width="228" height="228" rx="14"
              fill="none"
              stroke="var(--accent-soft)"
              strokeWidth="1.5"
              opacity="0.35"
            />
            <rect
              ref={traceRef}
              x="6" y="6" width="228" height="228" rx="14"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.5"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="1"
              strokeLinecap="round"
            />
          </svg>
        )}
        <div ref={auraRef} className="breathing-aura" aria-hidden="true" />
        <div ref={circleRef} className="breathing-circle" aria-hidden="true" />
        <div className="breathing-countdown" aria-hidden="true">{remainingSec}</div>
      </div>

      <div className="breathing-label" aria-live="polite">
        <DirectionIcon step={step} />
        <span>{step.label}</span>
      </div>
      <p className="breathing-subline">{step.subtitle}</p>
      <div className="breathing-counter">{displayCycle} / {cycles}</div>
      {affirmation && <p className="breathing-cycle-affirm">{affirmation}</p>}
    </div>
  );
}
