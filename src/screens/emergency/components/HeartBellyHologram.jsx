import { useEffect, useState } from 'react';

// Holographic front-view figure with one hand on the heart, one on the belly.
// Used on Phase 2 (hypo branch) step 4: "שים יד אחת על הלב, יד אחת על הבטן."
// Body stays in the same blue hologram language as steps 1-3; a red heart
// glyph sits under the chest hand and pulses with a lub-dub beat.
// Honors prefers-reduced-motion: static pose, no motion.

const HEART_PATH = 'M0,3 C-3,-2 -10,-2 -10,4 C-10,10 0,16 0,18 C0,16 10,10 10,4 C10,-2 3,-2 0,3 Z';

export default function HeartBellyHologram({ size = 220 }) {
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
      className={animate ? 'holo-wrap holo-float-slow' : 'holo-wrap'}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 220 260" width={size} height={size}>
        <defs>
          <filter id="hbGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="hbHeartGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="hbStroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5AC8FA" />
            <stop offset="1" stopColor="#0A84FF" />
          </linearGradient>
          <radialGradient id="hbBase" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#5AC8FA" stopOpacity="0.55" />
            <stop offset="1" stopColor="#5AC8FA" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hbHeartFill" cx="0.5" cy="0.4" r="0.6">
            <stop offset="0" stopColor="#FF6B5E" />
            <stop offset="1" stopColor="#FF3B30" />
          </radialGradient>
          <clipPath id="hbClip">
            <rect x="0" y="0" width="220" height="260" />
          </clipPath>
        </defs>

        {/* projector base glow */}
        <ellipse
          cx="110"
          cy="242"
          rx="78"
          ry="13"
          fill="url(#hbBase)"
          className={animate ? 'holo-base holo-base--jump' : undefined}
        />

        {/* figure (blue) */}
        <g
          filter="url(#hbGlow)"
          stroke="url(#hbStroke)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          {/* head */}
          <circle cx="110" cy="45" r="15" fill="#5AC8FA" fillOpacity="0.16" />

          {/* spine */}
          <path d="M110,60 L110,150" />

          {/* legs */}
          <path d="M102,150 L99,234" />
          <path d="M118,150 L121,234" />

          {/* arm to belly (figure's right arm, viewer's left) */}
          <path d="M96,72 L78,108 L106,128" strokeWidth="5" />

          {/* arm to heart (figure's left arm, viewer's right) */}
          <path d="M124,72 L146,100 L122,96" strokeWidth="5" />
        </g>

        {/* red heart under the chest hand */}
        <g
          transform="translate(118 84)"
          filter="url(#hbHeartGlow)"
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          className={animate ? 'hb-heart-pulse' : undefined}
        >
          <path
            d={HEART_PATH}
            fill="url(#hbHeartFill)"
            stroke="#FF3B30"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </g>

        {/* scan lines */}
        {animate && (
          <g clipPath="url(#hbClip)" className="holo-scan">
            <rect x="0" y="0" width="220" height="2.5" fill="#5AC8FA" fillOpacity="0.5" />
            <rect x="0" y="3.5" width="220" height="1" fill="#FFFFFF" fillOpacity="0.35" />
          </g>
        )}
      </svg>
    </div>
  );
}
