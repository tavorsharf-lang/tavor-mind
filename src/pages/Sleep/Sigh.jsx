import BreathingExercise from '../../screens/emergency/components/BreathingExercise.jsx';

/*  Sleep-mode physiological sigh: reuses the canonical BreathingExercise
    component so the visualization, countdown seconds, and rhythm strip
    look identical to the rest of the app — sleep.css darkens the surrounding
    chrome. 5 cycles ≈ 31 seconds.                                          */

export default function Sigh({ onComplete, onSkip }) {
  return (
    <div className="sleep-page sleep-page--breathing" role="presentation">
      <button type="button" className="sleep-skip" onClick={onSkip}>דלג</button>

      <div className="sleep-breath-stage">
        <BreathingExercise
          defaultPattern="physio_sigh"
          defaultPace="normal"
          cycles={5}
          lockPattern
          onComplete={onComplete}
        />
      </div>
    </div>
  );
}
