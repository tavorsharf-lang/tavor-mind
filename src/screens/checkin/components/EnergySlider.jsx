import ScoreSlider from '../../../components/ui/ScoreSlider.jsx';
import { colorForScore } from '../../../utils/scoreColor.js';

// Thin wrapper around ScoreSlider so morning/evening check-ins use the same
// canonical slider as every other "how do you feel" surface (Phase 6/7/8,
// SomaticExercise). Keeps the big 64px energy-display number on top for visual
// continuity with the rest of the check-in UI.
export default function EnergySlider({
  value,
  onChange,
  lowLabel,
  highLabel,
  ariaLabel = 'בחר ערך מ-1 עד 10',
}) {
  const tint = colorForScore(value, 'high-good');
  return (
    <div className="energy-slider-wrap">
      <div className="energy-display" aria-hidden="true" style={{ color: tint.main, transition: 'color 200ms ease' }}>
        {value}
      </div>
      <ScoreSlider
        value={value}
        onChange={onChange}
        polarity="high-good"
        showValue={false}
        labels={[lowLabel, highLabel]}
        ariaLabel={ariaLabel}
      />
    </div>
  );
}
