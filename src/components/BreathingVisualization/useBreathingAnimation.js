import { useEffect, useRef, useState } from 'react';

const ROTATION_PERIOD_MS = 30000;
export const SCALE_MIN = 0.15;
export const SCALE_MAX = 1.0;

function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

export function useBreathingAnimation({
  inhaleDuration,
  holdDuration,
  exhaleDuration,
  restDuration,
  isActive,
  onPhaseChange,
  onCycleComplete,
  reduceMotion,
}) {
  const [scale, setScale] = useState(SCALE_MIN);
  const [rotation, setRotation] = useState(0);
  const [phase, setPhase] = useState('inhale');

  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const lastPhaseRef = useRef(null);
  const completedCyclesRef = useRef(0);
  const onPhaseChangeRef = useRef(onPhaseChange);
  const onCycleCompleteRef = useRef(onCycleComplete);

  useEffect(() => { onPhaseChangeRef.current = onPhaseChange; }, [onPhaseChange]);
  useEffect(() => { onCycleCompleteRef.current = onCycleComplete; }, [onCycleComplete]);

  useEffect(() => {
    if (!isActive) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setScale(SCALE_MIN);
      setRotation(0);
      setPhase('inhale');
      lastPhaseRef.current = null;
      completedCyclesRef.current = 0;
      startTimeRef.current = null;
      return;
    }

    const cycleDuration =
      inhaleDuration + holdDuration + exhaleDuration + restDuration;
    if (cycleDuration <= 0) return;

    startTimeRef.current = performance.now();
    completedCyclesRef.current = 0;
    lastPhaseRef.current = null;

    const tick = (now) => {
      const elapsed = now - startTimeRef.current;
      const cyclesCompleted = Math.floor(elapsed / cycleDuration);
      if (cyclesCompleted > completedCyclesRef.current) {
        completedCyclesRef.current = cyclesCompleted;
        onCycleCompleteRef.current?.();
      }
      const cyclePos = elapsed % cycleDuration;

      let nextPhase;
      let nextScale;
      if (cyclePos < inhaleDuration) {
        nextPhase = 'inhale';
        const t = inhaleDuration > 0 ? cyclePos / inhaleDuration : 1;
        nextScale = SCALE_MIN + (SCALE_MAX - SCALE_MIN) * easeInOutSine(t);
      } else if (cyclePos < inhaleDuration + holdDuration) {
        nextPhase = 'hold';
        nextScale = SCALE_MAX;
      } else if (cyclePos < inhaleDuration + holdDuration + exhaleDuration) {
        nextPhase = 'exhale';
        const t = exhaleDuration > 0
          ? (cyclePos - inhaleDuration - holdDuration) / exhaleDuration
          : 1;
        nextScale = SCALE_MAX - (SCALE_MAX - SCALE_MIN) * easeInOutSine(t);
      } else {
        nextPhase = 'rest';
        nextScale = SCALE_MIN;
      }

      setScale(nextScale);
      if (!reduceMotion) {
        setRotation((elapsed / ROTATION_PERIOD_MS) * 360);
      }

      if (nextPhase !== lastPhaseRef.current) {
        lastPhaseRef.current = nextPhase;
        setPhase(nextPhase);
        onPhaseChangeRef.current?.(nextPhase);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isActive, inhaleDuration, holdDuration, exhaleDuration, restDuration, reduceMotion]);

  return { scale, rotation, phase };
}
