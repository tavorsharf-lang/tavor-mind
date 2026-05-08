import { VALENCE_LABELS, VALENCE_COLORS } from '../../../data/emotionsCorpus.js';

export default function MoodPhase2Slider({ scope, value, onChange }) {
  const color = VALENCE_COLORS[value];
  const title = scope === 'moment' ? 'איך אתה מרגיש כרגע?' : 'איך הרגשת היום?';

  return (
    <>
      <h1 className="phase-title">{title}</h1>
      <div className="mood-bloom-wrap" aria-hidden="true">
        <svg viewBox="0 0 200 200" className="mood-bloom" role="img" aria-label={VALENCE_LABELS[value]}>
          <circle cx="100" cy="100" r="78" fill={color} fillOpacity="0.18" />
          <circle cx="100" cy="100" r="56" fill={color} fillOpacity="0.32" />
          <circle cx="100" cy="100" r="34" fill={color} fillOpacity="0.85" />
        </svg>
      </div>
      <div className="mood-slider-wrap">
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="mood-slider"
          aria-label="עוצמת התחושה — 1 רע מאוד עד 5 מעולה"
          style={{ '--mood-color': color }}
        />
        <div className="mood-slider-ticks" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((v) => (
            <span key={v} className={`mood-tick ${v === value ? 'is-active' : ''}`} />
          ))}
        </div>
        <div className="mood-slider-label" style={{ color }}>
          {VALENCE_LABELS[value]}
        </div>
      </div>
    </>
  );
}
