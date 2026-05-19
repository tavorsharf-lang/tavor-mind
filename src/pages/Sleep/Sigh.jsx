import { useEffect, useRef, useState } from 'react';

/*  Physiological sigh × 5.
    Each cycle: inhale 1.6s → second short inhale 0.7s → exhale 5.0s → hold 0.7s.
    Single circle scales between 0.45 and 1.0 to mirror breath. No sound,
    no haptics, no audio. Auto-advances to onComplete after the 5th exhale.  */

const TOTAL = 5;

const STEPS = [
  { label: 'שאיפה',       scale: 0.85, dur: 1.6 },
  { label: 'עוד מעט',     scale: 1.00, dur: 0.7 },
  { label: 'נשיפה ארוכה', scale: 0.45, dur: 5.0 },
  { label: '',            scale: 0.45, dur: 0.7 },
];

export default function Sigh({ onComplete, onSkip }) {
  const [cycle, setCycle] = useState(1);
  const [stepIdx, setStepIdx] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const step = STEPS[stepIdx];
    timerRef.current = setTimeout(() => {
      if (stepIdx < STEPS.length - 1) {
        setStepIdx(stepIdx + 1);
      } else if (cycle < TOTAL) {
        setCycle(cycle + 1);
        setStepIdx(0);
      } else {
        onComplete?.();
      }
    }, step.dur * 1000);
    return () => clearTimeout(timerRef.current);
  }, [cycle, stepIdx, onComplete]);

  const step = STEPS[stepIdx];

  return (
    <div className="sleep-page" role="presentation">
      <button type="button" className="sleep-skip" onClick={onSkip}>דלג</button>

      <div className="sigh-stage">
        <p className="sigh-counter">{cycle} / {TOTAL}</p>

        <div className="sigh-circle-wrap" aria-hidden="true">
          <div
            className="sigh-circle"
            style={{
              transform: `scale(${step.scale})`,
              transitionDuration: `${step.dur}s`,
            }}
          />
          <span className="sigh-label">{step.label}</span>
        </div>

        <p className="sigh-instruction">
          שאיפה דרך האף · עוד שאיפה קצרה מעליה · נשיפה ארוכה דרך הפה
        </p>
      </div>
    </div>
  );
}
