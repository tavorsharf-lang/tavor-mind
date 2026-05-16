import { usePointerSlider } from '../../utils/usePointerSlider.js';
import { colorForScore } from '../../utils/scoreColor.js';

// One canonical 1-N rating slider for every "how do you feel / how activated"
// surface in the app. Wraps the .ds3-slider-* visuals + usePointerSlider so
// the same drag mechanics, RTL handling, sizing, and Apple-gradient coloring
// are used everywhere.
//
// Props:
//   value, onChange     — controlled state (onChange receives a number)
//   min, max            — defaults 1..10
//   polarity            — 'high-good' (10 = best, default), 'high-bad' (1 = best), 'static'
//   staticTint          — CSS color when polarity='static' (default --lichen)
//   labels              — array of string OR { text, className }; rendered under the track
//   showValue           — show {value}/{max} below the labels (default true)
//   ariaLabel           — accessibility label for the underlying <input type=range>
//   touched             — when explicitly false, hide fill + value, neutral handle ring
export default function ScoreSlider({
  value,
  onChange,
  min = 1,
  max = 10,
  polarity = 'high-good',
  staticTint,
  labels,
  showValue = true,
  ariaLabel,
  touched = true,
}) {
  const { wrapRef, handlers } = usePointerSlider({
    min,
    max,
    padding: 4,
    onChange,
  });

  const handlePos = ((value - min) / (max - min)) * 100;

  const tint = polarity === 'static'
    ? {
        main: staticTint || 'var(--lichen)',
        soft: 'rgba(10, 132, 255, 0.18)',
        glow: 'rgba(10, 132, 255, 0.40)',
      }
    : colorForScore(value, polarity);

  return (
    <div className="ds3-score-slider">
      <div
        className="ds3-slider-wrap"
        ref={wrapRef}
        {...handlers}
        style={{ touchAction: 'none', cursor: 'pointer' }}
      >
        <div className="ds3-slider-track" />
        {touched && (
          <div
            className="ds3-slider-fill"
            style={{
              left: 4,
              right: 'auto',
              width: `calc(${handlePos}% - 8px)`,
              background: `linear-gradient(90deg, ${tint.soft}, ${tint.main})`,
              transition: 'background 200ms ease, width 150ms ease',
            }}
          />
        )}
        <div
          className="ds3-slider-handle"
          style={{
            left: `calc(${handlePos}% - 22px)`,
            right: 'auto',
            boxShadow: touched
              ? `0 0 0 3px ${tint.main}, 0 6px 18px ${tint.glow}`
              : '0 0 0 1.5px var(--line), 0 2px 8px rgba(0, 0, 0, 0.08)',
            transition: 'left 150ms ease, box-shadow 200ms ease',
          }}
        >
          <div
            className="ds3-slider-handle-dot"
            style={{
              background: touched ? tint.main : 'var(--ink-muted)',
              transition: 'background 200ms ease',
            }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="ds3-slider-input"
          dir="ltr"
          aria-label={ariaLabel}
        />
      </div>

      {labels && labels.length > 0 && (
        <div className="ds3-slider-labels">
          {labels.map((l, i) => {
            if (typeof l === 'string') return <span key={i}>{l}</span>;
            return <span key={i} className={l.className}>{l.text}</span>;
          })}
        </div>
      )}

      {showValue && touched && (
        <div
          className="ds3-slider-value"
          style={{ color: tint.main, transition: 'color 200ms ease' }}
        >
          {value}/{max}
        </div>
      )}
    </div>
  );
}
