import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getBreathingHaptic } from '../../../utils/breathingHaptic.js';
import BreathingVisualization from '../../../components/BreathingVisualization/BreathingVisualization.jsx';

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
  '42': {
    paces: {
      slow: [
        { label: 'תכניס', from: 0.6, to: 1.5, sec: 5 },
        { label: 'תוציא', from: 1.5, to: 0.6, sec: 2 },
      ],
      normal: [
        { label: 'תכניס', from: 0.6, to: 1.5, sec: 4 },
        { label: 'תוציא', from: 1.5, to: 0.6, sec: 2 },
      ],
      fast: [
        { label: 'תכניס', from: 0.6, to: 1.5, sec: 3 },
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
  morning_hum: {
    paces: {
      normal: [
        { label: 'תכניס', from: 0.55, to: 1.55, sec: 4 },
        { label: 'תחזיק', from: 1.55, to: 1.55, sec: 2 },
        { label: 'תוציא', from: 1.55, to: 0.55, sec: 6 },
      ],
    },
  },
};

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

/* Pattern from/to values are in the legacy CSS-scale space (0.55–1.55).
 * Map to the viz's normalized space (0–1) so consecutive same-phase
 * steps (e.g. physio_sigh's two inhales 0.55→1.30 then 1.30→1.55)
 * chain into a single continuous scale curve in the viz. */
const PATTERN_SCALE_MIN = 0.55;
const PATTERN_SCALE_MAX = 1.55;
const normPatternScale = (v) =>
  Math.max(0, Math.min(1, (v - PATTERN_SCALE_MIN) / (PATTERN_SCALE_MAX - PATTERN_SCALE_MIN)));

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
    const haptic = getBreathingHaptic();
    haptic.cancel();
    if (step.label === 'תכניס' && !reduce) {
      haptic.scheduleInhale(step.sec);
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
  const cycleSec = steps.reduce((sum, s) => sum + s.sec, 0);
  const sessionTotalMs = cycleSec * cycles * 1000;
  const sessionTotal = formatElapsed(sessionTotalMs);

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

      <div className="breathing-elapsed" aria-hidden="true">
        <span>{elapsedTotal}</span>
        <span className="breathing-elapsed-sep"> / </span>
        <span className="breathing-elapsed-total">{sessionTotal}</span>
      </div>

      <div className="breathing-rhythm" aria-label="קצב הסשן הנוכחי">
        {steps.map((s, i) => {
          const isActive = i === stepIndex && !done;
          const sec = Number.isInteger(s.sec) ? s.sec : s.sec.toFixed(1);
          return (
            <div
              key={i}
              className="breathing-rhythm-step"
              data-active={isActive ? 'true' : 'false'}
            >
              <span className="breathing-rhythm-sec">
                {sec}<span className="breathing-rhythm-unit">s</span>
              </span>
              <span className="breathing-rhythm-label">{s.label}</span>
            </div>
          );
        })}
      </div>

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
        <BreathingVisualization
          phase={step.label === 'תכניס' ? 'inhale' : step.label === 'תוציא' ? 'exhale' : 'hold'}
          duration={step.sec}
          progress={Math.min(1, Math.max(0, (renderTime - stepStartedAt) / (step.sec * 1000)))}
          fromScale={normPatternScale(step.from)}
          toScale={normPatternScale(step.to)}
          isActive={!done}
          size={260}
          className="in-stage"
        />
        <div className="breathing-countdown" aria-hidden="true">{remainingSec}</div>
      </div>

      <div className="breathing-label" aria-live="polite">
        <span>{step.label}</span>
      </div>
    </div>
  );
}
