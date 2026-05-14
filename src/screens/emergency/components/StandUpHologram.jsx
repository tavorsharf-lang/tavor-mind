import { useEffect, useState } from 'react';

// Holographic side-view figure that loops sit -> stand -> sit.
// Used on Phase 2 (hypo branch) step 1: "קום ועמוד אם אתה יושב או שוכב."
// Limb geometry is morphed with SMIL <animate> on path `d` (sit/stand poses
// share segment structure). Honors prefers-reduced-motion: when set, renders
// the standing pose statically with no SMIL and no CSS motion.

// pose values: sit ; stand ; stand(hold) ; sit
const KEY_TIMES = '0;0.42;0.74;1';
const DUR = '4s';

const TORSO = { sit: 'M95,107 L108,168', stand: 'M110,57 L110,140' };
const ARM = { sit: 'M97,120 L122,151', stand: 'M110,72 L107,129' };
const LEG = { sit: 'M108,168 L151,173 L153,236', stand: 'M110,140 L110,189 L113,236' };
const HEAD = { cx: { sit: 92, stand: 110 }, cy: { sit: 92, stand: 42 } };

function vals(p) {
  return `${p.sit};${p.stand};${p.stand};${p.sit}`;
}

export default function StandUpHologram({ size = 200 }) {
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
    <div
      className={animate ? 'holo-wrap holo-float' : 'holo-wrap'}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 220 260" width={size} height={size}>
        <defs>
          <filter id="holoGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="holoStroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5AC8FA" />
            <stop offset="1" stopColor="#0A84FF" />
          </linearGradient>
          <radialGradient id="holoBase" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#5AC8FA" stopOpacity="0.55" />
            <stop offset="1" stopColor="#5AC8FA" stopOpacity="0" />
          </radialGradient>
          <clipPath id="holoClip">
            <rect x="0" y="0" width="220" height="260" />
          </clipPath>
        </defs>

        {/* projector base glow */}
        <ellipse
          cx="120"
          cy="240"
          rx="74"
          ry="13"
          fill="url(#holoBase)"
          className={animate ? 'holo-base' : undefined}
        />

        {/* figure */}
        <g
          filter="url(#holoGlow)"
          stroke="url(#holoStroke)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <circle r="15" fill="#5AC8FA" fillOpacity="0.16">
            <animate
              attributeName="cx"
              values={`${HEAD.cx.sit};${HEAD.cx.stand};${HEAD.cx.stand};${HEAD.cx.sit}`}
              keyTimes={KEY_TIMES}
              dur={DUR}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1"
              begin={animate ? '0s' : 'indefinite'}
            />
            <animate
              attributeName="cy"
              values={`${HEAD.cy.sit};${HEAD.cy.stand};${HEAD.cy.stand};${HEAD.cy.sit}`}
              keyTimes={KEY_TIMES}
              dur={DUR}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1"
              begin={animate ? '0s' : 'indefinite'}
            />
          </circle>
          {!animate && <circle cx={HEAD.cx.stand} cy={HEAD.cy.stand} r="15" fill="#5AC8FA" fillOpacity="0.16" />}

          <path d={animate ? TORSO.sit : TORSO.stand}>
            {animate && (
              <animate
                attributeName="d"
                values={vals(TORSO)}
                keyTimes={KEY_TIMES}
                dur={DUR}
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1"
              />
            )}
          </path>

          <path d={animate ? ARM.sit : ARM.stand} strokeWidth="5">
            {animate && (
              <animate
                attributeName="d"
                values={vals(ARM)}
                keyTimes={KEY_TIMES}
                dur={DUR}
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1"
              />
            )}
          </path>

          <path d={animate ? LEG.sit : LEG.stand}>
            {animate && (
              <animate
                attributeName="d"
                values={vals(LEG)}
                keyTimes={KEY_TIMES}
                dur={DUR}
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1"
              />
            )}
          </path>
        </g>

        {/* scan lines */}
        {animate && (
          <g clipPath="url(#holoClip)" className="holo-scan">
            <rect x="0" y="0" width="220" height="2.5" fill="#5AC8FA" fillOpacity="0.5" />
            <rect x="0" y="0" width="220" height="1" fill="#FFFFFF" fillOpacity="0.35" y="3.5" />
          </g>
        )}
      </svg>
    </div>
  );
}
