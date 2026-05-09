import { useState } from 'react';

// Apple Health "State of Mind" mood scale: 0 (very unpleasant) → 8 (very pleasant).
// Each step has a tint pair (gradient bg) and a bloom color.
const MOOD_SCALE = [
  { key: 'vu', label: 'מאוד לא נעים', bg: ['#A78AC8', '#C9B5DD'], bloom: '#7B49C7', tone: 'unpleasant' },
  { key: 'u',  label: 'לא נעים',       bg: ['#9BA9CC', '#C0CADD'], bloom: '#5E5CE6', tone: 'unpleasant' },
  { key: 'su', label: 'מעט לא נעים',   bg: ['#B7C4D6', '#D4DCE8'], bloom: '#7E96B5', tone: 'sub' },
  { key: 'n-', label: 'ניטרלי',        bg: ['#CFD9E0', '#E2E8EC'], bloom: '#8FA9BD', tone: 'neutral' },
  { key: 'n',  label: 'ניטרלי',        bg: ['#D4E0E2', '#E6EBEC'], bloom: '#6FB7B0', tone: 'neutral' },
  { key: 'sn', label: 'מעט נעים',      bg: ['#B6E1C9', '#D6EFDD'], bloom: '#34A86A', tone: 'pleasant' },
  { key: 'p',  label: 'נעים',          bg: ['#FFD9A8', '#FFE8C7'], bloom: '#FF8A2A', tone: 'pleasant' },
  { key: 'sp', label: 'מאוד נעים',     bg: ['#FFC9A0', '#FFDFC0'], bloom: '#FF8550', tone: 'pleasant' },
  { key: 'vp', label: 'נפלא',          bg: ['#FFB590', '#FFD0B5'], bloom: '#FF6A4F', tone: 'pleasant' },
];

function lighten(hex, amt = 0.55) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const mix = (v) => Math.round(v + (255 - v) * amt);
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}

function MoodBloom({ mood, size = 240 }) {
  const m = MOOD_SCALE[mood] || MOOD_SCALE[4];
  const petals = m.tone === 'unpleasant' ? 8 : m.tone === 'sub' ? 6 : m.tone === 'neutral' ? 1 : 5;
  const c = m.bloom;
  const cLight = lighten(c, 0.55);
  const cMid = lighten(c, 0.25);
  const ringId = `bloom-${mood}-r`;
  const petalId = `bloom-${mood}-p`;
  const coreId = `bloom-${mood}-c`;
  const petal = (rx, ry) => `M0,-${ry} C${rx*0.8},-${ry*0.9} ${rx},-${ry*0.3} 0,${ry*0.1} C-${rx},-${ry*0.3} -${rx*0.8},-${ry*0.9} 0,-${ry}Z`;

  return (
    <svg width={size} height={size} viewBox="-120 -120 240 240" style={{ filter: `drop-shadow(0 18px 32px ${c}55)` }}>
      <defs>
        <radialGradient id={ringId} cx="50%" cy="40%" r="65%">
          <stop offset="0%"  stopColor="#FFFFFF" stopOpacity="0.95"/>
          <stop offset="55%" stopColor={cLight}  stopOpacity="0.85"/>
          <stop offset="100%" stopColor={cMid}   stopOpacity="0.55"/>
        </radialGradient>
        <radialGradient id={petalId} cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95"/>
          <stop offset="45%" stopColor={c} stopOpacity="0.95"/>
          <stop offset="100%" stopColor={c} stopOpacity="0.7"/>
        </radialGradient>
        <radialGradient id={coreId} cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF"/>
          <stop offset="100%" stopColor={c}/>
        </radialGradient>
      </defs>
      {Array.from({ length: petals }).map((_, i) => {
        const angle = (360 / petals) * i;
        return (
          <g key={`o-${i}`} transform={`rotate(${angle})`} opacity="0.55">
            <path d={petal(58, 100)} fill={`url(#${ringId})`} />
          </g>
        );
      })}
      {Array.from({ length: petals }).map((_, i) => {
        const angle = (360 / petals) * i + (petals % 2 ? 0 : 18);
        return (
          <g key={`i-${i}`} transform={`rotate(${angle})`}>
            <path d={petal(40, 70)} fill={`url(#${petalId})`} />
          </g>
        );
      })}
      <circle cx="0" cy="0" r="14" fill={`url(#${coreId})`}/>
      <circle cx="-3" cy="-4" r="4" fill="#FFFFFF" opacity="0.85"/>
    </svg>
  );
}

export default function PhaseMoodScale({ moodIndex, setMoodIndex, onNext, onSkip, onExit }) {
  const initial = typeof moodIndex === 'number' ? moodIndex : 4;
  const [mood, setMood] = useState(initial);
  const m = MOOD_SCALE[mood];
  // Input has direction:ltr → drag right = mood index increases.
  // Visual handle is positioned with `left:` (physical) so handle visually
  // moves right when mood increases, matching the drag direction.
  const trackPct = (mood / (MOOD_SCALE.length - 1)) * 100;

  const commit = () => {
    setMoodIndex(mood);
    onNext();
  };

  return (
    <div
      className="ds3-screen"
      style={{
        background: `radial-gradient(120% 80% at 50% 35%, ${m.bg[0]} 0%, ${m.bg[1]} 55%, ${m.bg[1]} 100%)`,
      }}
    >
      <div className="ds3-topbar">
        <button type="button" className="ds3-topbar-skip" onClick={onSkip}>דלג</button>
        <span className="ds3-topbar-label" />
        <button type="button" className="ds3-topbar-back" aria-label="צא" onClick={onExit}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <main className="ds3-screen-content">
        <div className="ds3-text-center" style={{ marginTop: 8 }}>
          <h1 style={{
            fontSize: 32, fontWeight: 800, color: 'var(--ink)',
            letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0,
          }}>
            איך הרגשת היום<br/>באופן כללי?
          </h1>
        </div>

        <div className="ds3-center" style={{ flex: 1, minHeight: 240 }}>
          <MoodBloom mood={mood} size={260}/>
        </div>

        <div className="ds3-text-center" style={{ marginBottom: 18 }}>
          <span style={{
            fontSize: 28, fontWeight: 700, color: 'var(--ink)',
            letterSpacing: '-0.015em',
          }}>
            {m.label}
          </span>
        </div>

        {/* Slider — white track, white circle thumb */}
        <div style={{ position: 'relative', height: 44, marginBottom: 6 }}>
          <div style={{
            position: 'absolute', inset: '50% 0 auto', height: 8,
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.55)', borderRadius: 99,
          }}/>
          <div style={{
            position: 'absolute', top: '50%',
            transform: 'translate(-50%, -50%)',
            left: `${trackPct}%`,
            width: 28, height: 28, borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          }}/>
          <input
            type="range" min="0" max={MOOD_SCALE.length - 1} step="1"
            value={mood}
            onChange={(e) => setMood(parseInt(e.target.value, 10))}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              opacity: 0, cursor: 'pointer', direction: 'ltr',
            }}
            aria-label="דירוג מצב רוח"
          />
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 13, color: 'var(--ink-muted)', marginBottom: 6,
        }}>
          <span>מאוד נעים</span>
          <span>מאוד לא נעים</span>
        </div>
      </main>

      <footer className="ds3-screen-footer">
        <button
          type="button"
          onClick={commit}
          style={{
            width: '100%', height: 56, borderRadius: 28, border: 'none',
            background: m.bloom, color: '#fff',
            fontFamily: 'inherit', fontSize: 17, fontWeight: 700,
            cursor: 'pointer', boxShadow: `0 8px 22px ${m.bloom}55`,
          }}
        >
          הבא
        </button>
      </footer>
    </div>
  );
}
