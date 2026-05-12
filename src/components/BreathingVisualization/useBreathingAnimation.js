import { useEffect, useRef, useState } from 'react';

const ROTATION_PERIOD_MS = 30000;
export const SCALE_MIN = 0.15;
export const SCALE_MAX = 1.0;

function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function computeAutonomous(elapsed, inhaleD, holdD, exhaleD, restD) {
  const cycleDuration = inhaleD + holdD + exhaleD + restD;
  if (cycleDuration <= 0) return { phase: 'inhale', scale: SCALE_MIN, cycleDuration };
  const pos = elapsed % cycleDuration;
  let phase;
  let scale;
  if (pos < inhaleD) {
    phase = 'inhale';
    const t = inhaleD > 0 ? pos / inhaleD : 1;
    scale = SCALE_MIN + (SCALE_MAX - SCALE_MIN) * easeInOutSine(t);
  } else if (pos < inhaleD + holdD) {
    phase = 'hold';
    scale = SCALE_MAX;
  } else if (pos < inhaleD + holdD + exhaleD) {
    phase = 'exhale';
    const t = exhaleD > 0 ? (pos - inhaleD - holdD) / exhaleD : 1;
    scale = SCALE_MAX - (SCALE_MAX - SCALE_MIN) * easeInOutSine(t);
  } else {
    phase = 'rest';
    scale = SCALE_MIN;
  }
  return { phase, scale, cycleDuration };
}

function computeSyncedScale(phase, progress, lastNonHoldPhase) {
  const eased = easeInOutSine(clamp01(progress));
  if (phase === 'inhale') return SCALE_MIN + (SCALE_MAX - SCALE_MIN) * eased;
  if (phase === 'exhale') return SCALE_MAX - (SCALE_MAX - SCALE_MIN) * eased;
  // hold / rest — hold the level set by the last directional phase
  return lastNonHoldPhase === 'inhale' ? SCALE_MAX : SCALE_MIN;
}

export function useBreathingAnimation({
  inhaleDuration,
  holdDuration,
  exhaleDuration,
  restDuration,
  syncedPhase,
  syncedProgress,
  isActive,
  onPhaseChange,
  onCycleComplete,
  reduceMotion,
}) {
  const synced = syncedPhase != null && syncedProgress != null;

  const [autoState, setAutoState] = useState({ scale: SCALE_MIN, phase: 'inhale' });
  const [rotation, setRotation] = useState(0);

  const rafRef = useRef(null);
  const lastPhaseRef = useRef(null);
  const lastNonHoldRef = useRef('inhale');
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
      setAutoState({ scale: SCALE_MIN, phase: 'inhale' });
      setRotation(0);
      lastPhaseRef.current = null;
      lastNonHoldRef.current = 'inhale';
      return;
    }

    const startNow = performance.now();
    let cyclesDone = 0;

    const tick = (now) => {
      const elapsed = now - startNow;
      if (!reduceMotion) {
        setRotation(((elapsed) / ROTATION_PERIOD_MS) * 360);
      }
      if (!synced) {
        const { phase: nextPhase, scale: nextScale, cycleDuration } =
          computeAutonomous(elapsed, inhaleDuration, holdDuration, exhaleDuration, restDuration);
        if (cycleDuration > 0) {
          const completed = Math.floor(elapsed / cycleDuration);
          if (completed > cyclesDone) {
            cyclesDone = completed;
            onCycleCompleteRef.current?.();
          }
        }
        setAutoState({ scale: nextScale, phase: nextPhase });
        if (nextPhase !== lastPhaseRef.current) {
          lastPhaseRef.current = nextPhase;
          if (nextPhase !== 'hold' && nextPhase !== 'rest') {
            lastNonHoldRef.current = nextPhase;
          }
          onPhaseChangeRef.current?.(nextPhase);
        }
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
  }, [
    isActive,
    synced,
    inhaleDuration,
    holdDuration,
    exhaleDuration,
    restDuration,
    reduceMotion,
  ]);

  useEffect(() => {
    if (!synced || !isActive) return;
    if (syncedPhase !== 'hold' && syncedPhase !== 'rest') {
      lastNonHoldRef.current = syncedPhase;
    }
    if (syncedPhase !== lastPhaseRef.current) {
      lastPhaseRef.current = syncedPhase;
      onPhaseChangeRef.current?.(syncedPhase);
    }
  }, [synced, syncedPhase, isActive]);

  if (synced) {
    return {
      scale: computeSyncedScale(syncedPhase, syncedProgress, lastNonHoldRef.current),
      rotation,
      phase: syncedPhase,
    };
  }
  return { scale: autoState.scale, rotation, phase: autoState.phase };
}
