import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getBreathingHaptic } from '../../../utils/breathingHaptic.js';

const PATTERNS = {
  '478': {
    paces: {
      slow:   [
        { label: 'תכניס', from: 0.55, to: 1.55, sec: 5 },
        { label: 'תחזיק', from: 1.55, to: 1.55, sec: 8 },
        { label: 'תוציא', from: 1.55, to: 0.55, sec: 9 },
      ],
      normal: [
        { label: 'תכניס', from: 0.55, to: 1.55, sec: 4 },
        { label: 'תחזיק', from: 1.55, to: 1.55, sec: 7 },
        { label: 'תוציא', from: 1.55, to: 0.55, sec: 8 },
      ],
      fast:   [
        { label: 'תכניס', from: 0.55, to: 1.55, sec: 3 },
        { label: 'תחזיק', from: 1.55, to: 1.55, sec: 5 },
        { label: 'תוציא', from: 1.55, to: 0.55, sec: 6 },
      ],
    },
  },
  box: {
    paces: {
      slow:   [
        { label: 'תכניס', from: 0.6, to: 1.45, sec: 5 },
        { label: 'תחזיק', from: 1.45, to: 1.45, sec: 5 },
        { label: 'תוציא', from: 1.45, to: 0.6, sec: 5 },
        { label: 'תחזיק', from: 0.6, to: 0.6, sec: 5 },
      ],
      normal: [
        { label: 'תכניס', from: 0.6, to: 1.45, sec: 4 },
        { label: 'תחזיק', from: 1.45, to: 1.45, sec: 4 },
        { label: 'תוציא', from: 1.45, to: 0.6, sec: 4 },
        { label: 'תחזיק', from: 0.6, to: 0.6, sec: 4 },
      ],
      fast:   [
        { label: 'תכניס', from: 0.6, to: 1.45, sec: 3 },
        { label: 'תחזיק', from: 1.45, to: 1.45, sec: 3 },
        { label: 'תוציא', from: 1.45, to: 0.6, sec: 3 },
        { label: 'תחזיק', from: 0.6, to: 0.6, sec: 3 },
      ],
    },
  },
  coherent: {
    paces: {
      slow:   [
        { label: 'תכניס', from: 0.6, to: 1.5, sec: 6 },
        { label: 'תוציא', from: 1.5, to: 0.6, sec: 6 },
      ],
      normal: [
        { label: 'תכניס', from: 0.6, to: 1.5, sec: 5 },
        { label: 'תוציא', from: 1.5, to: 0.6, sec: 5 },
      ],
      fast:   [
        { label: 'תכניס', from: 0.6, to: 1.5, sec: 4 },
        { label: 'תוציא', from: 1.5, to: 0.6, sec: 4 },
      ],
    },
  },
  '62': {
    paces: {
      slow: [
        { label: 'תכניס', from: 0.6, to: 1.5, sec: 7 },
        { label: 'תוציא', from: 1.5, to: 0.6, sec: 2 },
      ],
      normal: [
        { label: 'תכניס', from: 0.6, to: 1.5, sec: 6 },
        { label: 'תוציא', from: 1.5, to: 0.6, sec: 2 },
      ],
      fast: [
        { label: 'תכניס', from: 0.6, to: 1.5, sec: 5 },
        { label: 'תוציא', from: 1.5, to: 0.6, sec: 2 },
      ],
    },
  },
  physio_sigh: {
    paces: {
      normal: [
        { label: 'תכניס', from: 0.55, to: 1.30, sec: 1.5 },
        { label: 'תכניס', from: 1.30, to: 1.55, sec: 0.7 },
        { label: 'תוציא', from: 1.55, to: 0.55, sec: 4.0 },
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
  if (label === 'תכניס') return EASING_INHALE;
  if (label === 'תוציא') return EASING_EXHALE;
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

function formatElapsed(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
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

  // Timestamps — refs (not memo). React may evict useMemo for memory pressure,
  // which would reset the timestamp mid-breath and cause the countdown to glitch.
  // Reset synchronously here so the deps-change frame already reads the new value.
  const exerciseStartedAtRef = useRef(Date.now());
  const stepStartedAtRef = useRef(Date.now());
  const lastPatternRef = useRef(pattern);
  if (lastPatternRef.current !== pattern) {
    lastPatternRef.current = pattern;
    exerciseStartedAtRef.current = Date.now();
    stepStartedAtRef.current = Date.now();
  }
  const lastStepKeyRef = useRef(`${stepIndex}|${cycle}|${pace}|${pattern}`);
  const stepKey = `${stepIndex}|${cycle}|${pace}|${pattern}`;
  if (lastStepKeyRef.current !== stepKey) {
    lastStepKeyRef.current = stepKey;
    stepStartedAtRef.current = Date.now();
  }
  const exerciseStartedAt = exerciseStartedAtRef.current;
  const stepStartedAt = stepStartedAtRef.current;

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
    if (step.label === 'תכניס' && !reduce) {
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

  const renderTime = Date.now();
  const remainingMs = Math.max(0, step.sec * 1000 - (renderTime - stepStartedAt));
  const remainingSec = Math.max(1, Math.ceil(remainingMs / 1000));
  const elapsedTotal = formatElapsed(renderTime - exerciseStartedAt);

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
        <span>{step.label}</span>
      </div>
    </div>
  );
}
