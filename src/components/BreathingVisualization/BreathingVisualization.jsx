import { useId, useMemo } from 'react';
import { useBreathingAnimation, SCALE_MIN, SCALE_MAX } from './useBreathingAnimation.js';
import { getPattern } from './breathingPatterns.js';
import './BreathingVisualization.css';

/* Apple Watch "Breathe" style: 6 translucent petal blobs arranged radially,
 * spread outward with the inhale and overlap into a bright orb on the
 * exhale. Continuous rotation (from the hook's clock) keeps the field
 * alive even through hold/rest phases. Overlap brightening is achieved
 * by stacked alpha rather than mix-blend-mode (cross-browser safer). */

const PETAL_COUNT = 6;
const PETAL_RADIUS = 85;
const MAX_OFFSET = 65;
const PETAL_OPACITY = 0.55;

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
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
  duration: _syncedDuration,
  progress: syncedProgress,
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

  const { scale, rotation, phase } = useBreathingAnimation({
    inhaleDuration: durations.inhale,
    holdDuration:   durations.hold,
    exhaleDuration: durations.exhale,
    restDuration:   durations.rest,
    syncedPhase: synced ? syncedPhase : undefined,
    syncedProgress: synced ? syncedProgress : undefined,
    isActive,
    onPhaseChange,
    onCycleComplete,
    reduceMotion,
  });

  const normScale = clamp01((scale - SCALE_MIN) / (SCALE_MAX - SCALE_MIN));
  const offset = normScale * MAX_OFFSET;

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
              r={PETAL_RADIUS}
              fill={`url(#${gradId})`}
              opacity={PETAL_OPACITY}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
