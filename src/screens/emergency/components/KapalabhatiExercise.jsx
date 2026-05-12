import { useEffect, useRef, useState } from 'react';
import { getBreathingHaptic } from '../../../utils/breathingHaptic.js';

// Kapalabhati — 30s of forceful nasal exhales at ~1Hz.
// Inhale is passive (auto between beats); the user actively pushes air out
// through the nose on each beat. Used as an aggressive alternative to the
// 4-2 stage 1 in the hypo branch (deep dissociation / shutdown).
const DURATION_SEC = 30;
const BEAT_MS = 1000;
const TOTAL_BEATS = DURATION_SEC; // 1 per second

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function KapalabhatiExercise({ onComplete, onAbort }) {
  const [beat, setBeat] = useState(0);
  const [pulse, setPulse] = useState(false);
  const startedAtRef = useRef(null);
  const beatIntervalRef = useRef(null);
  const tickIntervalRef = useRef(null);
  const [remainingSec, setRemainingSec] = useState(DURATION_SEC);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    const haptic = getBreathingHaptic();
    haptic.ensure();

    startedAtRef.current = Date.now();

    const fire = () => {
      const ctx = haptic.ctx;
      if (ctx) haptic.scheduleTap(ctx.currentTime, 0.9);
      setPulse(true);
      setTimeout(() => setPulse(false), 180);
      setBeat((b) => {
        const next = b + 1;
        if (next >= TOTAL_BEATS) {
          clearInterval(beatIntervalRef.current);
          clearInterval(tickIntervalRef.current);
          setTimeout(() => onComplete && onComplete(), 600);
        }
        return next;
      });
    };

    // First beat after a short lead-in so user has time to anchor.
    const lead = setTimeout(() => {
      fire();
      beatIntervalRef.current = setInterval(fire, BEAT_MS);
    }, 800);

    tickIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      setRemainingSec(Math.max(0, DURATION_SEC - elapsed));
    }, 200);

    return () => {
      clearTimeout(lead);
      if (beatIntervalRef.current) clearInterval(beatIntervalRef.current);
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      try { haptic.cancel(); } catch (_) {}
    };
  }, [onComplete]);

  const dotScale = reduced ? 1 : (pulse ? 1.18 : 0.92);

  return (
    <div className="ds3-stack-4 ds3-text-center" style={{ width: '100%' }}>
      <div className="ds3-caption ds3-text-soft" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Kapalabhati · נשיפות מהירות באף
      </div>

      <div style={{
        position: 'relative',
        margin: '12px auto 0',
        width: 200, height: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 200, height: 200, borderRadius: 100,
          background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.6), var(--heart))`,
          opacity: 0.18,
          position: 'absolute', inset: 0,
        }} />
        <div style={{
          width: 140, height: 140, borderRadius: 70,
          background: `radial-gradient(circle at 35% 30%, #FFFFFF, var(--heart))`,
          boxShadow: pulse ? '0 0 0 18px rgba(255, 59, 48, 0.22), 0 12px 36px rgba(255, 59, 48, 0.45)' : '0 6px 22px rgba(255, 59, 48, 0.28)',
          transform: `scale(${dotScale})`,
          transition: reduced ? 'none' : 'transform 140ms ease-out, box-shadow 180ms ease-out',
        }} />
        <div style={{
          position: 'absolute',
          color: '#fff',
          fontSize: 28, fontWeight: 800,
          textShadow: '0 1px 2px rgba(0,0,0,0.25)',
          pointerEvents: 'none',
        }}>
          {beat}
        </div>
      </div>

      <div className="ds3-stack-2" style={{ marginTop: 8 }}>
        <p className="ds3-h2" style={{ margin: 0, color: 'var(--heart)' }}>
          תוציא בכוח דרך האף
        </p>
        <p className="ds3-body ds3-text-muted" style={{ margin: 0 }}>
          שאיפה מתרחשת לבד בין נשיפה לנשיפה
        </p>
      </div>

      <div className="ds3-caption ds3-text-soft" style={{ marginTop: 8 }}>
        {remainingSec}s · {beat}/{TOTAL_BEATS}
      </div>

      {onAbort && (
        <button
          type="button"
          onClick={onAbort}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--ink-muted)', fontFamily: 'inherit',
            fontSize: 13, fontWeight: 500, marginTop: 12,
            textDecoration: 'underline',
          }}
        >
          עצור
        </button>
      )}
    </div>
  );
}
