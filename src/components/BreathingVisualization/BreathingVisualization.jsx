import { useId, useMemo } from 'react';
import { useBreathingAnimation, SCALE_MIN } from './useBreathingAnimation.js';
import { getPattern } from './breathingPatterns.js';
import './BreathingVisualization.css';

const PETAL_COUNT = 5;
const RINGS = [
  { radius: 0,  count: 1  },
  { radius: 30, count: 6  },
  { radius: 60, count: 12 },
];
const CIRCLE_RADIUS = 14;
const RENDER_SCALE = 2.5;

const SCALE_OUTER_FULL = 0.30;
const SCALE_MID_FULL   = 0.20;

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
  isActive = true,
  onPhaseChange,
  onCycleComplete,
  size = 400,
  color = '#06B6D4',
  darkBackground = true,
}) {
  const durations = useMemo(() => {
    if (pattern === 'custom') {
      return {
        inhale: inhaleDuration,
        hold: holdDuration,
        exhale: exhaleDuration,
        rest: restDuration,
      };
    }
    return getPattern(pattern);
  }, [pattern, inhaleDuration, holdDuration, exhaleDuration, restDuration]);

  const reduceMotion = useMemo(prefersReducedMotion, []);

  const { scale, rotation, phase } = useBreathingAnimation({
    inhaleDuration: durations.inhale,
    holdDuration:   durations.hold,
    exhaleDuration: durations.exhale,
    restDuration:   durations.rest,
    isActive,
    onPhaseChange,
    onCycleComplete,
    reduceMotion,
  });

  const circles = useMemo(() => {
    const result = [];
    for (let p = 0; p < PETAL_COUNT; p++) {
      const petalAngle = (360 / PETAL_COUNT) * p;
      RINGS.forEach((ring, ringIdx) => {
        for (let c = 0; c < ring.count; c++) {
          const angleOffset = ring.count > 1 ? (360 / ring.count) * c : 0;
          const angle = petalAngle + angleOffset;
          const rad = (angle * Math.PI) / 180;
          result.push({
            id: `${p}-${ringIdx}-${c}`,
            x: ring.radius * Math.cos(rad),
            y: ring.radius * Math.sin(rad),
            ringIdx,
          });
        }
      });
    }
    return result;
  }, []);

  const outerOpacity = clamp01((scale - SCALE_MIN) / (SCALE_OUTER_FULL - SCALE_MIN));
  const midOpacity   = clamp01((scale - SCALE_MIN) / (SCALE_MID_FULL   - SCALE_MIN));

  const rawId = useId();
  const safeId = rawId.replace(/[^a-z0-9]/gi, '');
  const glowId = `bv-glow-${safeId}`;
  const gradId = `bv-grad-${safeId}`;

  const gradStart = '#A5F3FC';
  const gradEnd   = color || '#0891B2';

  return (
    <div
      className={`breathing-viz${darkBackground ? ' is-dark' : ''}`}
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
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id={gradId}>
            <stop offset="0%"   stopColor={gradStart} />
            <stop offset="100%" stopColor={gradEnd} />
          </radialGradient>
        </defs>

        <g
          transform={`scale(${(scale * RENDER_SCALE).toFixed(4)}) rotate(${rotation.toFixed(2)})`}
          filter={`url(#${glowId})`}
        >
          {circles.map((c) => {
            const opacity =
              c.ringIdx === 2 ? outerOpacity :
              c.ringIdx === 1 ? midOpacity   : 1;
            if (opacity <= 0) return null;
            return (
              <circle
                key={c.id}
                cx={c.x}
                cy={c.y}
                r={CIRCLE_RADIUS}
                fill={`url(#${gradId})`}
                opacity={opacity}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
