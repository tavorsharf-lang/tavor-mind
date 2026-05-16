import { VALENCE_LABELS, VALENCE_COLORS, VALENCE_MIN, VALENCE_MAX } from '../../../data/emotionsCorpus.js';
import { usePointerSlider } from '../../../utils/usePointerSlider.js';

// Right→Left in RTL: 1 (red, unpleasant) on the right, 7 (warm orange,
// pleasant) on the left. We render a manually-positioned handle on top of an
// invisible <input type=range> for keyboard a11y; pointer math uses
// `inverted: true` so left=max, right=min regardless of the input direction.
const STOPS = [1, 2, 3, 4, 5, 6, 7];

export default function MoodPhase2Slider({ scope, value, onChange }) {
  const safeValue = Math.min(VALENCE_MAX, Math.max(VALENCE_MIN, Number(value) || 4));
  const color = VALENCE_COLORS[safeValue];
  const title = scope === 'moment' ? 'איך אתה מרגיש כרגע?' : 'איך הרגשת היום?';

  const { wrapRef, handlers } = usePointerSlider({
    min: VALENCE_MIN,
    max: VALENCE_MAX,
    padding: 18,
    inverted: true,
    onChange,
  });

  // Visual position: value 1 sits at the RIGHT edge (0% from right = 100% from left),
  // value 7 sits at the LEFT edge (100% from right = 0% from left).
  const fracFromLeft = 1 - (safeValue - VALENCE_MIN) / (VALENCE_MAX - VALENCE_MIN);
  const handleLeftPct = fracFromLeft * 100;

  return (
    <>
      <h1 className="phase-title">{title}</h1>
      <div className="mood-bloom-wrap" aria-hidden="true">
        <div
          className="mood-bloom-holo"
          role="img"
          aria-label={VALENCE_LABELS[safeValue]}
          style={{ '--mood-color': color }}
        >
          <span className="mood-bloom-ring mood-bloom-ring-3" />
          <span className="mood-bloom-ring mood-bloom-ring-2" />
          <span className="mood-bloom-ring mood-bloom-ring-1" />
          <span className="mood-bloom-core" />
        </div>
      </div>

      <div className="mood-slider-wrap">
        <div
          ref={wrapRef}
          className="mood-slider-v2"
          {...handlers}
          style={{ touchAction: 'none', cursor: 'pointer' }}
        >
          <div className="mood-slider-v2-track" />
          <div
            className="mood-slider-v2-handle"
            style={{
              left: `calc(${handleLeftPct}% - 18px)`,
              borderColor: color,
              boxShadow: `0 0 0 3px ${color}, 0 6px 18px ${color}66`,
            }}
          />
          <input
            type="range"
            min={VALENCE_MIN}
            max={VALENCE_MAX}
            step="1"
            value={safeValue}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            className="mood-slider-v2-input"
            dir="rtl"
            aria-label={`עוצמת התחושה — 1 ${VALENCE_LABELS[1]} עד 7 ${VALENCE_LABELS[7]}`}
          />
        </div>
        <div className="mood-slider-v2-ticks" aria-hidden="true">
          {STOPS.map((v) => (
            <span
              key={v}
              className={`mood-tick-v2 ${v === safeValue ? 'is-active' : ''}`}
              style={v === safeValue ? { background: color } : undefined}
            />
          ))}
        </div>
        <div className="mood-slider-v2-label" style={{ color }}>
          {VALENCE_LABELS[safeValue]}
        </div>
      </div>
    </>
  );
}
