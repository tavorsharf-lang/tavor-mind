import { useEffect, useState } from 'react';

// Holographic front-view figure doing jumping jacks (closed -> open -> closed).
// Used on Phase 2 (hypo branch) step 2: "10 קפיצות במקום — עכשיו."
// Limb geometry morphed with SMIL <animate> on path `d`; the "open" pose also
// sits higher, so the pose swap itself reads as the jump. Honors
// prefers-reduced-motion: renders the open pose statically, no motion.

const KEY_TIMES = '0;0.5;1';
const DUR = '1.15s';
const SPLINES = '0.45 0 0.25 1;0.45 0 0.25 1';

const TORSO = { closed: 'M110,60 L110,150', open: 'M110,48 L110,138' };
const ARM_L = { closed: 'M110,72 L94,142', open: 'M110,60 L68,32' };
const ARM_R = { closed: 'M110,72 L126,142', open: 'M110,60 L152,32' };
const LEG_L = { closed: 'M110,150 L101,236', open: 'M110,138 L74,232' };
const LEG_R = { closed: 'M110,150 L119,236', open: 'M110,138 L146,232' };
const HEAD_CY = { closed: 45, open: 33 };

function vals(p) {
  return `${p.closed};${p.open};${p.closed}`;
}

function MorphPath({ pair, animate, strokeWidth }) {
  return (
    <path d={animate ? pair.closed : pair.open} strokeWidth={strokeWidth}>
      {animate && (
        <animate
          attributeName="d"
          values={vals(pair)}
          keyTimes={KEY_TIMES}
          dur={DUR}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines={SPLINES}
        />
      )}
    </path>
  );
}

export default function JumpHologram({ size = 220 }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const animate = !reduced;

  return (
    <div className="holo-wrap" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 220 260" width={size} height={size}>
        <defs>
          <filter id="jumpGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="jumpStroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5AC8FA" />
            <stop offset="1" stopColor="#0A84FF" />
          </linearGradient>
          <radialGradient id="jumpBase" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#5AC8FA" stopOpacity="0.55" />
            <stop offset="1" stopColor="#5AC8FA" stopOpacity="0" />
          </radialGradient>
          <clipPath id="jumpClip">
            <rect x="0" y="0" width="220" height="260" />
          </clipPath>
        </defs>

        {/* projector base glow */}
        <ellipse
          cx="110"
          cy="242"
          rx="78"
          ry="13"
          fill="url(#jumpBase)"
          className={animate ? 'holo-base holo-base--jump' : undefined}
        />

        {/* figure */}
        <g
          filter="url(#jumpGlow)"
          stroke="url(#jumpStroke)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <circle cx="110" r="15" fill="#5AC8FA" fillOpacity="0.16" cy={animate ? HEAD_CY.closed : HEAD_CY.open}>
            {animate && (
              <animate
                attributeName="cy"
                values={`${HEAD_CY.closed};${HEAD_CY.open};${HEAD_CY.closed}`}
                keyTimes={KEY_TIMES}
                dur={DUR}
                repeatCount="indefinite"
                calcMode="spline"
                keySplines={SPLINES}
              />
            )}
          </circle>

          <MorphPath pair={TORSO} animate={animate} strokeWidth={6} />
          <MorphPath pair={ARM_L} animate={animate} strokeWidth={5} />
          <MorphPath pair={ARM_R} animate={animate} strokeWidth={5} />
          <MorphPath pair={LEG_L} animate={animate} strokeWidth={6} />
          <MorphPath pair={LEG_R} animate={animate} strokeWidth={6} />
        </g>

        {/* scan lines */}
        {animate && (
          <g clipPath="url(#jumpClip)" className="holo-scan">
            <rect x="0" y="0" width="220" height="2.5" fill="#5AC8FA" fillOpacity="0.5" />
            <rect x="0" y="3.5" width="220" height="1" fill="#FFFFFF" fillOpacity="0.35" />
          </g>
        )}
      </svg>
    </div>
  );
}
