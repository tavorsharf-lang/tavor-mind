import { useEffect, useState } from 'react';

// Holographic figure for the vagal-humming exercise:
// inhale → chest halo expands; exhale → "מממממ" rises out of the mouth and
// vibration ripples radiate from the chest. Same blue figure DNA as the
// Phase 2 holograms. Honors prefers-reduced-motion: static neutral pose.

const BREATH_DUR = '8s';

export default function VagalHummingHologram({ size = 240 }) {
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
          <filter id="vhGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="vhTextGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="vhStroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5AC8FA" />
            <stop offset="1" stopColor="#0A84FF" />
          </linearGradient>
          <radialGradient id="vhBase" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#5AC8FA" stopOpacity="0.55" />
            <stop offset="1" stopColor="#5AC8FA" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="vhBreath" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#5AC8FA" stopOpacity="0.55" />
            <stop offset="1" stopColor="#5AC8FA" stopOpacity="0" />
          </radialGradient>
          <clipPath id="vhClip">
            <rect x="0" y="0" width="220" height="260" />
          </clipPath>
        </defs>

        {/* projector base glow */}
        <ellipse
          cx="110"
          cy="242"
          rx="78"
          ry="13"
          fill="url(#vhBase)"
          className={animate ? 'holo-base holo-base--jump' : undefined}
        />

        {/* breath halo around chest — expands during inhale */}
        <circle cx="110" cy="98" r="14" fill="url(#vhBreath)" opacity={animate ? 0 : 0.35}>
          {animate && (
            <>
              <animate
                attributeName="r"
                values="12;30;26;12"
                keyTimes="0;0.40;0.55;1"
                dur={BREATH_DUR}
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1"
              />
              <animate
                attributeName="opacity"
                values="0;0.55;0.30;0"
                keyTimes="0;0.40;0.55;1"
                dur={BREATH_DUR}
                repeatCount="indefinite"
              />
            </>
          )}
        </circle>

        {/* vibration ripples from chest — only during exhale */}
        {animate && (
          <>
            <circle cx="110" cy="98" r="6" fill="none" stroke="#5AC8FA" strokeWidth="1.6">
              <animate
                attributeName="r"
                values="8;8;34;34;8"
                keyTimes="0;0.42;0.58;0.95;1"
                dur={BREATH_DUR}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;0;0.6;0;0"
                keyTimes="0;0.42;0.48;0.60;1"
                dur={BREATH_DUR}
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="110" cy="98" r="6" fill="none" stroke="#5AC8FA" strokeWidth="1.6">
              <animate
                attributeName="r"
                values="8;8;36;36;8"
                keyTimes="0;0.55;0.75;0.95;1"
                dur={BREATH_DUR}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;0;0.55;0;0"
                keyTimes="0;0.55;0.62;0.78;1"
                dur={BREATH_DUR}
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="110" cy="98" r="6" fill="none" stroke="#5AC8FA" strokeWidth="1.6">
              <animate
                attributeName="r"
                values="8;8;38;38;8"
                keyTimes="0;0.68;0.88;0.95;1"
                dur={BREATH_DUR}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;0;0.5;0;0"
                keyTimes="0;0.68;0.75;0.90;1"
                dur={BREATH_DUR}
                repeatCount="indefinite"
              />
            </circle>
          </>
        )}

        {/* figure (blue) */}
        <g
          filter="url(#vhGlow)"
          stroke="url(#vhStroke)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <circle cx="110" cy="45" r="15" fill="#5AC8FA" fillOpacity="0.16" />
          {/* spine */}
          <path d="M110,60 L110,150" />
          {/* legs */}
          <path d="M102,150 L99,234" />
          <path d="M118,150 L121,234" />
          {/* arm to chest (figure right, viewer left) */}
          <path d="M96,72 L80,95 L104,100" strokeWidth="5" />
          {/* arm to throat (figure left, viewer right) */}
          <path d="M124,72 L140,80 L116,67" strokeWidth="5" />
        </g>

        {/* humming text "מממממ" — fades in during exhale, drifts up */}
        <g>
          <text
            x="110"
            y="26"
            textAnchor="middle"
            direction="rtl"
            fontFamily="Heebo, Assistant, system-ui, sans-serif"
            fontSize="22"
            fontWeight="700"
            fill="#0A84FF"
            filter="url(#vhTextGlow)"
            opacity={animate ? 0 : 0.85}
          >
            מממממ
            {animate && (
              <>
                <animate
                  attributeName="opacity"
                  values="0;0;0.95;0.95;0"
                  keyTimes="0;0.40;0.50;0.92;1"
                  dur={BREATH_DUR}
                  repeatCount="indefinite"
                />
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0 6; 0 6; 0 -2; 0 -10"
                  keyTimes="0;0.40;0.65;1"
                  dur={BREATH_DUR}
                  repeatCount="indefinite"
                />
              </>
            )}
          </text>
        </g>

        {/* scan lines */}
        {animate && (
          <g clipPath="url(#vhClip)" className="holo-scan">
            <rect x="0" y="0" width="220" height="2.5" fill="#5AC8FA" fillOpacity="0.5" />
            <rect x="0" y="3.5" width="220" height="1" fill="#FFFFFF" fillOpacity="0.35" />
          </g>
        )}
      </svg>
    </div>
  );
}
