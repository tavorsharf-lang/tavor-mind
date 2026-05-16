import { useEffect, useState } from 'react';

// Holographic front-view figure vigorously shaking arms and legs.
// Used on Phase 2 (hypo branch) step 3: "נער ידיים ורגליים בכוח, 10 שניות."
// Spine + shoulders + hips stay put; hands and feet wobble between 4 jitter
// targets at ~0.6s/loop with linear interpolation to read as a fast shake.
// Honors prefers-reduced-motion: renders a static neutral pose with no motion.

const KEY_TIMES = '0;0.25;0.5;0.75;1';
const DUR = '0.6s';

// Each path: M <shoulder/hip> L <hand/foot>. Shoulder/hip stay anchored.
const ARM_L = [
  'M96,72 L72,140',
  'M96,72 L108,142',
  'M96,72 L82,148',
  'M96,72 L100,138',
  'M96,72 L72,140',
];
const ARM_R = [
  'M124,72 L142,144',
  'M124,72 L116,138',
  'M124,72 L150,138',
  'M124,72 L120,146',
  'M124,72 L142,144',
];
const LEG_L = [
  'M102,150 L90,232',
  'M102,150 L108,234',
  'M102,150 L96,230',
  'M102,150 L104,235',
  'M102,150 L90,232',
];
const LEG_R = [
  'M118,150 L130,234',
  'M118,150 L112,232',
  'M118,150 L124,230',
  'M118,150 L116,235',
  'M118,150 L130,234',
];
const HEAD_CX = '110;108;112;109;110';
const HEAD_CY = '45;46;44;46;45';
const NEUTRAL = {
  armL: 'M96,72 L86,142',
  armR: 'M124,72 L134,142',
  legL: 'M102,150 L99,234',
  legR: 'M118,150 L121,234',
};

function ShakePath({ frames, animate, strokeWidth }) {
  return (
    <path d={frames[0]} strokeWidth={strokeWidth}>
      {animate && (
        <animate
          attributeName="d"
          values={frames.join(';')}
          keyTimes={KEY_TIMES}
          dur={DUR}
          repeatCount="indefinite"
          calcMode="linear"
        />
      )}
    </path>
  );
}

export default function ShakeHologram({ size = 220 }) {
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
          <filter id="shakeGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="shakeStroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5AC8FA" />
            <stop offset="1" stopColor="#0A84FF" />
          </linearGradient>
          <radialGradient id="shakeBase" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#5AC8FA" stopOpacity="0.55" />
            <stop offset="1" stopColor="#5AC8FA" stopOpacity="0" />
          </radialGradient>
          <clipPath id="shakeClip">
            <rect x="0" y="0" width="220" height="260" />
          </clipPath>
        </defs>

        {/* projector base glow */}
        <ellipse
          cx="110"
          cy="242"
          rx="78"
          ry="13"
          fill="url(#shakeBase)"
          className={animate ? 'holo-base holo-base--jump' : undefined}
        />

        {/* figure */}
        <g
          filter="url(#shakeGlow)"
          stroke="url(#shakeStroke)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <circle r="15" fill="#5AC8FA" fillOpacity="0.16" cx="110" cy="45">
            {animate && (
              <>
                <animate
                  attributeName="cx"
                  values={HEAD_CX}
                  keyTimes={KEY_TIMES}
                  dur={DUR}
                  repeatCount="indefinite"
                  calcMode="linear"
                />
                <animate
                  attributeName="cy"
                  values={HEAD_CY}
                  keyTimes={KEY_TIMES}
                  dur={DUR}
                  repeatCount="indefinite"
                  calcMode="linear"
                />
              </>
            )}
          </circle>

          {/* spine — static */}
          <path d="M110,60 L110,150" strokeWidth={6} />

          {animate ? (
            <>
              <ShakePath frames={ARM_L} animate={animate} strokeWidth={5} />
              <ShakePath frames={ARM_R} animate={animate} strokeWidth={5} />
              <ShakePath frames={LEG_L} animate={animate} strokeWidth={6} />
              <ShakePath frames={LEG_R} animate={animate} strokeWidth={6} />
            </>
          ) : (
            <>
              <path d={NEUTRAL.armL} strokeWidth={5} />
              <path d={NEUTRAL.armR} strokeWidth={5} />
              <path d={NEUTRAL.legL} strokeWidth={6} />
              <path d={NEUTRAL.legR} strokeWidth={6} />
            </>
          )}
        </g>

        {/* motion-blur ghost limbs (subtle echo of previous frame) */}
        {animate && (
          <g
            stroke="#5AC8FA"
            strokeOpacity="0.22"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            filter="url(#shakeGlow)"
          >
            <ShakePath frames={[ARM_L[2], ARM_L[3], ARM_L[4], ARM_L[0], ARM_L[1]]} animate={animate} strokeWidth={5} />
            <ShakePath frames={[ARM_R[2], ARM_R[3], ARM_R[4], ARM_R[0], ARM_R[1]]} animate={animate} strokeWidth={5} />
            <ShakePath frames={[LEG_L[2], LEG_L[3], LEG_L[4], LEG_L[0], LEG_L[1]]} animate={animate} strokeWidth={5} />
            <ShakePath frames={[LEG_R[2], LEG_R[3], LEG_R[4], LEG_R[0], LEG_R[1]]} animate={animate} strokeWidth={5} />
          </g>
        )}

        {/* scan lines */}
        {animate && (
          <g clipPath="url(#shakeClip)" className="holo-scan">
            <rect x="0" y="0" width="220" height="2.5" fill="#5AC8FA" fillOpacity="0.5" />
            <rect x="0" y="3.5" width="220" height="1" fill="#FFFFFF" fillOpacity="0.35" />
          </g>
        )}
      </svg>
    </div>
  );
}
