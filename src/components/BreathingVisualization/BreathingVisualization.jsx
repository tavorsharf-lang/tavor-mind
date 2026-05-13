import { useId, useMemo, useRef } from 'react';
import { useBreathingAnimation, SCALE_MIN, SCALE_MAX } from './useBreathingAnimation.js';
import { getPattern } from './breathingPatterns.js';
import './BreathingVisualization.css';

/* Apple Watch "Breathe" style: 6 translucent petal blobs arranged radially,
 * spread outward with the inhale and overlap into a bright orb on the
 * exhale. Continuous rotation (from the hook's clock) keeps the field
 * alive even through hold/rest phases. Overlap brightening is achieved
 * by stacked alpha rather than mix-blend-mode (cross-browser safer). */

const PETAL_COUNT = 6;
const MIN_PETAL_RADIUS = 10;   /* tight bright dot at full exhale */
const MAX_PETAL_RADIUS = 105;  /* big flower at full inhale */
const MAX_OFFSET = 90;
const PETAL_OPACITY = 0.55;

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function BreathingVisualization({
  pattern = 'simple',
  inhaleDuration = 4000,
  holdDuration = 0,
  exhaleDuration = 6000,
  restDuration = 0,
  phase: syncedPhase,
  duration: syncedDuration,
  progress: syncedProgress,
  fromScale,
  toScale,
  isActive = true,
  onPhaseChange,
  onCycleComplete,
  size = 400,
  color = '#06B6D4',
  darkBackground = false,
  className = '',
}) {
  const synced = syncedPhase != null && syncedProgress != null;

  const durations = useMemo(() => {
    if (synced) return { inhale: 0, hold: 0, exhale: 0, rest: 0 };
    if (pattern === 'custom') {
      return {
        inhale: inhaleDuration,
        hold: holdDuration,
        exhale: exhaleDuration,
        rest: restDuration,
      };
    }
    return getPattern(pattern);
  }, [synced, pattern, inhaleDuration, holdDuration, exhaleDuration, restDuration]);

  const reduceMotion = useMemo(prefersReducedMotion, []);

  /* Smooth progress derived from a local clock — the parent
   * (BreathingExercise) only re-renders every 250ms (its tick interval),
   * so progress prop ticks in 250ms quanta. Scale derived from that prop
   * stayed flat for 250ms then jumped, which read as 'pulses'. We
   * recompute progress on every render (the hook's rAF triggers re-renders
   * already), so scale animates smoothly between phase boundaries. */
  const phaseStartRef = useRef(typeof performance !== 'undefined' ? performance.now() : 0);
  const phaseKeyRef = useRef(synced ? `${syncedPhase}|${syncedDuration}` : '');
  if (synced) {
    const key = `${syncedPhase}|${syncedDuration}`;
    if (key !== phaseKeyRef.current) {
      phaseKeyRef.current = key;
      phaseStartRef.current = performance.now();
    }
  }
  const smoothProgress =
    synced && syncedDuration && typeof performance !== 'undefined'
      ? clamp01((performance.now() - phaseStartRef.current) / (syncedDuration * 1000))
      : syncedProgress;

  const { scale, rotation, phase } = useBreathingAnimation({
    inhaleDuration: durations.inhale,
    holdDuration:   durations.hold,
    exhaleDuration: durations.exhale,
    restDuration:   durations.rest,
    syncedPhase: synced ? syncedPhase : undefined,
    syncedProgress: synced ? smoothProgress : undefined,
    isActive,
    onPhaseChange,
    onCycleComplete,
    reduceMotion,
  });

  /* Prefer fromScale/toScale when supplied — they let consecutive same-phase
   * steps (e.g. physio_sigh's two inhales) chain into a single continuous
   * scale curve. Falling back to the hook's scale keeps autonomous mode and
   * older callers working. */
  const normScale = (fromScale != null && toScale != null)
    ? clamp01(fromScale + (toScale - fromScale) * easeInOutSine(clamp01(smoothProgress)))
    : clamp01((scale - SCALE_MIN) / (SCALE_MAX - SCALE_MIN));
  const offset = normScale * MAX_OFFSET;
  const petalRadius = MIN_PETAL_RADIUS + normScale * (MAX_PETAL_RADIUS - MIN_PETAL_RADIUS);

  const petals = useMemo(() => {
    const list = [];
    for (let i = 0; i < PETAL_COUNT; i++) {
      const rad = ((360 / PETAL_COUNT) * i + rotation) * (Math.PI / 180);
      list.push({
        id: i,
        x: offset * Math.cos(rad),
        y: offset * Math.sin(rad),
      });
    }
    return list;
  }, [offset, rotation]);

  const rawId = useId();
  const safeId = rawId.replace(/[^a-z0-9]/gi, '');
  const glowId = `bv-glow-${safeId}`;
  const gradId = `bv-grad-${safeId}`;

  const petalColor = color || '#0891B2';

  const wrapperClass = [
    'breathing-viz',
    darkBackground ? 'is-dark' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={wrapperClass}
      style={{ maxWidth: size }}
      data-phase={phase}
    >
      <svg
        viewBox="-200 -200 400 400"
        role="img"
        aria-label="ויזואליזציית נשימה"
        className="breathing-viz-svg"
      >
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id={gradId}>
            <stop offset="0%"   stopColor={petalColor} stopOpacity="0.85" />
            <stop offset="60%"  stopColor={petalColor} stopOpacity="0.45" />
            <stop offset="100%" stopColor={petalColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        <g filter={`url(#${glowId})`}>
          {petals.map((p) => (
            <circle
              key={p.id}
              cx={p.x.toFixed(2)}
              cy={p.y.toFixed(2)}
              r={petalRadius.toFixed(2)}
              fill={`url(#${gradId})`}
              opacity={PETAL_OPACITY}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
