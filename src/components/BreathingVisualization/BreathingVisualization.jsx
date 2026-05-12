import { useId, useMemo } from 'react';
import { useBreathingAnimation, SCALE_MIN, SCALE_MAX } from './useBreathingAnimation.js';
import { getPattern } from './breathingPatterns.js';
import './BreathingVisualization.css';

const RIPPLE_COUNT = 5;
const RIPPLE_LIFETIME_MS = 8000;
const RIPPLE_MIN_RADIUS = 16;
const RIPPLE_MAX_RADIUS = 175;
const CORE_RADIUS = 18;

/* Hook exposes elapsed time indirectly via rotation =
 * (elapsed / 30000ms) * 360deg, so multiply rotation by this to recover ms.
 * Avoids a second rAF loop in this component. */
const ROTATION_TO_MS = 30000 / 360;

function bell(x) {
  return Math.sin(Math.PI * x);
}

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
  darkBackground = true,
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

  const elapsedMs = rotation * ROTATION_TO_MS;

  const normScale = clamp01((scale - SCALE_MIN) / (SCALE_MAX - SCALE_MIN));
  const breathBrightness = 0.4 + 0.6 * normScale;
  const groupScale = 0.85 + 0.20 * normScale;
  const coreOpacity = 0.55 + 0.45 * normScale;

  const ripples = useMemo(() => {
    const list = [];
    for (let i = 0; i < RIPPLE_COUNT; i++) {
      const lifecyclePos =
        ((elapsedMs / RIPPLE_LIFETIME_MS) + i / RIPPLE_COUNT) % 1;
      const radius =
        RIPPLE_MIN_RADIUS +
        lifecyclePos * (RIPPLE_MAX_RADIUS - RIPPLE_MIN_RADIUS);
      const opacity = bell(lifecyclePos) * breathBrightness * 0.85;
      list.push({ id: i, radius, opacity });
    }
    return list;
  }, [elapsedMs, breathBrightness]);

  const rawId = useId();
  const safeId = rawId.replace(/[^a-z0-9]/gi, '');
  const glowId = `bv-glow-${safeId}`;
  const gradId = `bv-grad-${safeId}`;

  const gradStart = '#A5F3FC';
  const gradEnd   = color || '#0891B2';

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
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id={gradId}>
            <stop offset="0%"   stopColor={gradStart} stopOpacity="1" />
            <stop offset="70%"  stopColor={gradEnd}   stopOpacity="0.6" />
            <stop offset="100%" stopColor={gradEnd}   stopOpacity="0" />
          </radialGradient>
        </defs>

        <g
          transform={`scale(${groupScale.toFixed(4)})`}
          filter={`url(#${glowId})`}
        >
          {ripples.map((r) => (
            <circle
              key={r.id}
              cx={0}
              cy={0}
              r={r.radius.toFixed(2)}
              fill="none"
              stroke={gradEnd}
              strokeWidth={2.5}
              opacity={r.opacity.toFixed(3)}
            />
          ))}
          <circle
            cx={0}
            cy={0}
            r={CORE_RADIUS}
            fill={`url(#${gradId})`}
            opacity={coreOpacity.toFixed(3)}
          />
        </g>
      </svg>
    </div>
  );
}
