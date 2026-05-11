import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// Each animation owns its own lifecycle. Parent passes durationSec and onComplete;
// the animation autonomously cycles through phases until time runs out, then fires onComplete.
// All animations respect prefers-reduced-motion: under reduced-motion they show a static visual.
//
// Used by SomaticExercise (full-screen) and SomaticPreStep (Phase 2 hyper pre-step).

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}

function useTotalTimer(durationSec, onComplete) {
  useEffect(() => {
    if (!durationSec) return;
    const id = setTimeout(() => onComplete?.(), durationSec * 1000);
    return () => clearTimeout(id);
    // onComplete intentionally omitted from deps so a parent re-render doesn't reset the timer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationSec]);
}

// ─── Physiological Sigh ──────────────────────────────────────────────────────
const PHYSIO_STEPS = [
  { id: 'in1', label: 'שאיפה',         from: 0.85, to: 1.30, sec: 1.5 },
  { id: 'in2', label: 'שאיפה נוספת',   from: 1.30, to: 1.55, sec: 0.7 },
  { id: 'out', label: 'נשיפה ארוכה',   from: 1.55, to: 0.85, sec: 4.0 },
];

export function PhysioSighAnim({ durationSec, onComplete }) {
  const reduced = useReducedMotion();
  const [stepIdx, setStepIdx] = useState(0);
  const circleRef = useRef(null);
  useTotalTimer(durationSec, onComplete);

  useEffect(() => {
    const ms = PHYSIO_STEPS[stepIdx].sec * 1000;
    const id = setTimeout(() => setStepIdx((stepIdx + 1) % PHYSIO_STEPS.length), ms);
    return () => clearTimeout(id);
  }, [stepIdx]);

  useLayoutEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    const step = PHYSIO_STEPS[stepIdx];
    if (reduced) {
      el.style.transition = 'none';
      el.style.transform = 'scale(1.2)';
      return;
    }
    el.style.transition = 'none';
    el.style.transform = `scale(${step.from})`;
    void el.offsetWidth;
    el.style.transition = `transform ${step.sec}s cubic-bezier(0.4, 0, 0.4, 1)`;
    el.style.transform = `scale(${step.to})`;
  }, [stepIdx, reduced]);

  return (
    <div className="somatic-stage">
      <div ref={circleRef} className="somatic-circle" aria-hidden="true" />
      <p className="somatic-phase-label" aria-live="polite">{PHYSIO_STEPS[stepIdx].label}</p>
    </div>
  );
}

// ─── Butterfly Hug ───────────────────────────────────────────────────────────
// Bilateral stimulation: two large pulse points alternate ~every 900ms.
// `direction: ltr` on the stage so visual position is unambiguous regardless
// of RTL ancestors — first child is always visually-left, second is visually-right.
export function ButterflyAnim({ durationSec, onComplete }) {
  const reduced = useReducedMotion();
  const [side, setSide] = useState('right');
  useTotalTimer(durationSec, onComplete);

  useEffect(() => {
    if (reduced) return;
    const id = setTimeout(() => setSide((s) => (s === 'right' ? 'left' : 'right')), 900);
    return () => clearTimeout(id);
  }, [side, reduced]);

  return (
    <div className="somatic-stage">
      <div className="somatic-bfly-stage" aria-hidden="true">
        <div className={`somatic-bfly-hand ${side === 'left' ? 'is-tapping' : ''}`}>
          <span className="somatic-bfly-hand-glow" />
          <span className="somatic-bfly-hand-circle" />
        </div>
        <div className={`somatic-bfly-hand ${side === 'right' ? 'is-tapping' : ''}`}>
          <span className="somatic-bfly-hand-glow" />
          <span className="somatic-bfly-hand-circle" />
        </div>
      </div>
      <p className="somatic-phase-label" aria-live="polite">
        {side === 'right' ? 'ימין' : 'שמאל'}
      </p>
    </div>
  );
}

// ─── Vagal Humming ───────────────────────────────────────────────────────────
const VAGAL_STEPS = [
  { id: 'in',  label: 'שאיפה',          from: 0.9, to: 1.4, sec: 1.5, ripple: false },
  { id: 'hum', label: 'מממ — נשיפה',    from: 1.4, to: 0.9, sec: 4.0, ripple: true },
];

export function VagalAnim({ durationSec, onComplete }) {
  const reduced = useReducedMotion();
  const [stepIdx, setStepIdx] = useState(0);
  const circleRef = useRef(null);
  useTotalTimer(durationSec, onComplete);

  useEffect(() => {
    const ms = VAGAL_STEPS[stepIdx].sec * 1000;
    const id = setTimeout(() => setStepIdx((stepIdx + 1) % VAGAL_STEPS.length), ms);
    return () => clearTimeout(id);
  }, [stepIdx]);

  useLayoutEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    const step = VAGAL_STEPS[stepIdx];
    if (reduced) {
      el.style.transition = 'none';
      el.style.transform = 'scale(1.15)';
      return;
    }
    el.style.transition = 'none';
    el.style.transform = `scale(${step.from})`;
    void el.offsetWidth;
    el.style.transition = `transform ${step.sec}s cubic-bezier(0.4, 0, 0.4, 1)`;
    el.style.transform = `scale(${step.to})`;
  }, [stepIdx, reduced]);

  const step = VAGAL_STEPS[stepIdx];

  return (
    <div className="somatic-stage">
      <div className="somatic-vagal-wrap">
        {step.ripple && !reduced && (
          <>
            <span className="somatic-vagal-ripple" key={`r1-${stepIdx}`} aria-hidden="true" />
            <span className="somatic-vagal-ripple is-delay" key={`r2-${stepIdx}`} aria-hidden="true" />
          </>
        )}
        <div ref={circleRef} className="somatic-circle" aria-hidden="true" />
      </div>
      <p className="somatic-phase-label" aria-live="polite">{step.label}</p>
    </div>
  );
}

// ─── Body Scan ───────────────────────────────────────────────────────────────
const BODY_PARTS = [
  { id: 'head',      label: 'ראש',     cy: 12 },
  { id: 'jaw',       label: 'לסת',     cy: 22 },
  { id: 'shoulders', label: 'כתפיים',  cy: 32 },
  { id: 'chest',     label: 'חזה',     cy: 44 },
  { id: 'belly',     label: 'בטן',     cy: 58 },
  { id: 'hands',     label: 'ידיים',   cy: 68 },
  { id: 'feet',      label: 'רגליים',  cy: 88 },
];

export function BodyScanAnim({ durationSec, onComplete }) {
  const [idx, setIdx] = useState(0);
  const stepSec = durationSec / BODY_PARTS.length;

  useEffect(() => {
    const id = setTimeout(() => {
      if (idx + 1 < BODY_PARTS.length) setIdx(idx + 1);
      else onComplete?.();
    }, stepSec * 1000);
    return () => clearTimeout(id);
  }, [idx, stepSec, onComplete]);

  const active = BODY_PARTS[idx];

  return (
    <div className="somatic-stage">
      <svg className="somatic-body-svg" viewBox="0 0 60 100" aria-hidden="true">
        {/* head */}
        <circle cx="30" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
        {/* body */}
        <path d="M30 18 L30 60 M22 30 L38 30 M16 60 L30 60 L44 60 M22 60 L22 92 M38 60 L38 92" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.4" strokeLinecap="round" />
        {/* active dot */}
        <circle cx="30" cy={active.cy} r="3.5" fill="currentColor" className="somatic-body-pulse" />
      </svg>
      <p className="somatic-phase-label" aria-live="polite">{active.label}</p>
      <p className="somatic-body-progress" aria-hidden="true">{idx + 1} / {BODY_PARTS.length}</p>
    </div>
  );
}

// ─── Cold Anchor (no animation, just a visual cue) ───────────────────────────
export function ColdAnchorVisual() {
  return (
    <div className="somatic-stage">
      <div className="somatic-cold-icon" aria-hidden="true">
        <svg viewBox="0 0 64 64" width="120" height="120" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 6 L32 58" />
          <path d="M32 16 L24 8 M32 16 L40 8" />
          <path d="M32 48 L24 56 M32 48 L40 56" />
          <path d="M10 20 L54 44" />
          <path d="M16 22 L10 20 L12 14" />
          <path d="M48 42 L54 44 L52 50" />
          <path d="M54 20 L10 44" />
          <path d="M48 22 L54 20 L52 14" />
          <path d="M16 42 L10 44 L12 50" />
        </svg>
      </div>
    </div>
  );
}

// ─── Dispatcher ──────────────────────────────────────────────────────────────
export function SomaticAnimation({ kind, durationSec, onComplete }) {
  switch (kind) {
    case 'physio_sigh': return <PhysioSighAnim durationSec={durationSec} onComplete={onComplete} />;
    case 'butterfly':   return <ButterflyAnim durationSec={durationSec} onComplete={onComplete} />;
    case 'vagal':       return <VagalAnim durationSec={durationSec} onComplete={onComplete} />;
    case 'bodyscan':    return <BodyScanAnim durationSec={durationSec} onComplete={onComplete} />;
    default:            return <ColdAnchorVisual />;
  }
}
