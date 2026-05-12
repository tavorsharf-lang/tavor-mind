import { Suspense, lazy, useEffect, useRef, useState } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

const SCENE_URL = 'https://prod.spline.design/l-7SixbW4a6CMX42/scene.splinecode';

export default function HeartHologramButton({ onClick, ariaLabel = 'עכשיו קשה לי' }) {
  const [loaded, setLoaded] = useState(false);
  const rafRef = useRef(null);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const handleLoad = (spline) => {
    try {
      spline.setBackgroundColor?.('transparent');
    } catch {}

    let target = null;
    try {
      target = spline.findObjectByName?.('heartlowpoly') ?? null;
    } catch {}

    if (!target) {
      try {
        const scene =
          spline?.runtime?.scene ??
          spline?._scene ??
          spline?.scene ??
          spline?.app?.scene;
        target = scene?.children?.find(
          (c) => c && !c.isCamera && !c.isLight && c.rotation,
        );
      } catch {}
    }

    if (target) {
      try { spline.setZoom?.(0.5); } catch {}

      const baseRotX = target.rotation?.x ?? 0;
      const start = performance.now();
      const tick = (t) => {
        const s = (t - start) / 1000;
        target.rotation.y = s * 0.6;
        target.rotation.x = baseRotX + Math.sin(s * 0.7) * 0.12;
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }

    setLoaded(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(e);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className="ds3-heart-hologram"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      data-loaded={loaded ? 'true' : 'false'}
    >
      {!loaded && <span className="ds3-heart-hologram-fallback" aria-hidden="true" />}
      <div className="ds3-heart-hologram-stage">
        <Suspense fallback={null}>
          <Spline
            scene={SCENE_URL}
            onLoad={handleLoad}
            style={{ width: '100%', height: '100%' }}
          />
        </Suspense>
      </div>
    </div>
  );
}
