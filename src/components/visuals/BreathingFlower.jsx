import { useEffect, useRef } from 'react';
import './BreathingFlower.css';

const PETAL_COUNT = 7;
const ROTATION_PERIOD = 45; // seconds for one full rotation

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * BreathingFlower — Apple Watch Breathe-style petal flower.
 *
 * Syncs to BreathingExercise when `phase`/`duration`/`progress` are provided.
 * Runs a standalone 8s cycle otherwise.
 *
 * @param {{ phase?: 'inhale'|'hold'|'exhale', duration?: number, progress?: number,
 *           cycleDuration?: number, size?: number, className?: string }} props
 */
export default function BreathingFlower({
  phase,
  duration,
  progress,
  cycleDuration = 8,
  size = 220,
  className = '',
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(performance.now());

  const synced = phase != null && duration != null && progress != null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = size;
    const h = size;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const reduced = prefersReducedMotion();
    const cx = w / 2;
    const cy = h / 2;

    // Petal geometry
    const petalRx = w * 0.18;  // horizontal radius
    const petalRy = w * 0.32;  // vertical radius (elongated)
    const petalOffset = w * 0.12; // how far petal center is from flower center

    // Colors — translucent teal/blue/indigo petals
    const petalColors = [
      'rgba(10, 132, 255, 0.28)',   // blue (--lichen)
      'rgba(31, 182, 166, 0.26)',   // teal
      'rgba(94, 92, 230, 0.24)',    // indigo
      'rgba(10, 132, 255, 0.28)',
      'rgba(31, 182, 166, 0.26)',
      'rgba(94, 92, 230, 0.24)',
      'rgba(10, 132, 255, 0.26)',
    ];

    function getBreathT(now) {
      if (synced) return progress;
      const elapsed = (now - startRef.current) / 1000;
      const cyclePos = (elapsed % cycleDuration) / cycleDuration;
      // 0-0.4 inhale, 0.4-0.5 hold, 0.5-0.9 exhale, 0.9-1.0 hold
      if (cyclePos < 0.4) return cyclePos / 0.4;
      if (cyclePos < 0.5) return 1;
      if (cyclePos < 0.9) return 1 - (cyclePos - 0.5) / 0.4;
      return 0;
    }

    function getBreathPhase(now) {
      if (synced) return phase;
      const elapsed = (now - startRef.current) / 1000;
      const cyclePos = (elapsed % cycleDuration) / cycleDuration;
      if (cyclePos < 0.4) return 'inhale';
      if (cyclePos < 0.5) return 'hold';
      if (cyclePos < 0.9) return 'exhale';
      return 'hold';
    }

    // Easing: sine ease-in-out for organic feel
    function easeInOutSine(t) {
      return -(Math.cos(Math.PI * t) - 1) / 2;
    }

    function draw(now) {
      ctx.clearRect(0, 0, w, h);

      const rawT = getBreathT(now);
      const currentPhase = getBreathPhase(now);
      const t = easeInOutSine(rawT);

      // Scale: 0.55 (contracted) to 1.0 (expanded)
      const scale = 0.55 + t * 0.45;
      // Spread: petals move outward on inhale
      const spread = petalOffset * (0.4 + t * 0.6);
      // Rotation: slow continuous + slight breath-linked wobble
      const elapsed = (now - startRef.current) / 1000;
      const baseRotation = reduced ? 0 : (elapsed / ROTATION_PERIOD) * Math.PI * 2;
      const breathWobble = reduced ? 0 : Math.sin(rawT * Math.PI) * 0.04;
      const rotation = baseRotation + breathWobble;

      // Glow intensity follows breath
      const glowAlpha = 0.08 + t * 0.18;

      // Background aura glow
      const auraRadius = w * 0.42 * scale;
      const auraGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, auraRadius);
      auraGrad.addColorStop(0, `rgba(10, 132, 255, ${glowAlpha * 1.2})`);
      auraGrad.addColorStop(0.5, `rgba(31, 182, 166, ${glowAlpha * 0.6})`);
      auraGrad.addColorStop(1, 'rgba(10, 132, 255, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, auraRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw petals
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.globalCompositeOperation = 'screen';

      for (let i = 0; i < PETAL_COUNT; i++) {
        const angle = (Math.PI * 2 / PETAL_COUNT) * i;
        // Each petal has a micro phase offset for organic feel
        const microOffset = reduced ? 0 : Math.sin(elapsed * 0.3 + i * 1.2) * 0.015;
        const petalScale = scale + microOffset;

        ctx.save();
        ctx.rotate(angle);
        ctx.translate(0, -spread);
        ctx.scale(petalScale, petalScale);

        // Petal shape: ellipse
        ctx.beginPath();
        ctx.ellipse(0, 0, petalRx, petalRy, 0, 0, Math.PI * 2);

        // Gradient fill per petal
        const grad = ctx.createRadialGradient(0, -petalRy * 0.3, 0, 0, 0, petalRy);
        const baseColor = petalColors[i % petalColors.length];
        // Brighten center
        const brightColor = baseColor.replace(/[\d.]+\)$/, `${0.35 + t * 0.15})`);
        grad.addColorStop(0, 'rgba(255, 255, 255, ' + (0.4 + t * 0.25) + ')');
        grad.addColorStop(0.35, brightColor);
        grad.addColorStop(1, baseColor.replace(/[\d.]+\)$/, '0.04)'));
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.restore();
      }

      ctx.globalCompositeOperation = 'source-over';

      // Center highlight — bright white core that pulses
      const coreRadius = w * 0.06 * (0.7 + t * 0.3);
      const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius * 2.5);
      coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.7 + t * 0.25})`);
      coreGrad.addColorStop(0.4, `rgba(217, 232, 250, ${0.3 + t * 0.15})`);
      coreGrad.addColorStop(1, 'rgba(10, 132, 255, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, coreRadius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      if (!reduced) {
        rafRef.current = requestAnimationFrame(draw);
      }
    }

    if (reduced) {
      // Single static draw at midpoint
      draw(startRef.current + (cycleDuration * 500));
    } else {
      rafRef.current = requestAnimationFrame(draw);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [size, synced, phase, duration, progress, cycleDuration]);

  return (
    <canvas
      ref={canvasRef}
      className={`breathing-flower ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
