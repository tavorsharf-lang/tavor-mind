import BreathingExercise from '../../screens/emergency/components/BreathingExercise.jsx';

/*  Sleep-mode 4-7-8 breathing: inhale 4s → hold 7s → exhale 8s, 4 cycles.
    Total ≈ 1:16. Reuses the canonical BreathingExercise so the hologram,
    rhythm strip with seconds, and countdown stay identical to the rest
    of the app — sleep.css darkens the surrounding chrome.                */

export default function Breathing478({ onComplete, onSkip }) {
  return (
    <div className="sleep-page sleep-page--breathing" role="presentation">
      <button type="button" className="sleep-skip" onClick={onSkip}>דלג</button>

      <div className="sleep-breath-stage">
        <BreathingExercise
          defaultPattern="478"
          defaultPace="normal"
          cycles={4}
          lockPattern
          onComplete={onComplete}
        />
      </div>
    </div>
  );
}
