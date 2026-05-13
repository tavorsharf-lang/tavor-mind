export default function EnergySlider({ value, onChange, lowLabel, highLabel, ariaLabel = 'בחר ערך מ-1 עד 10' }) {
  return (
    <div className="energy-slider-wrap">
      <div className="energy-display" aria-hidden="true">{value}</div>
      <input
        type="range"
        min="1"
        max="10"
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="score-slider energy-slider"
        dir="ltr"
        aria-label={ariaLabel}
      />
      <div className="energy-labels">
        <span className="energy-label-low">{lowLabel}</span>
        <span className="energy-label-high">{highLabel}</span>
      </div>
    </div>
  );
}
