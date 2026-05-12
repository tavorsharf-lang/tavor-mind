import { Suspense, lazy, useState } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

const SCENE_URL = 'https://prod.spline.design/l-7SixbW4a6CMX42/scene.splinecode';

export default function HeartHologramButton({ onClick, ariaLabel = 'עכשיו קשה לי' }) {
  const [loaded, setLoaded] = useState(false);

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
      <Suspense fallback={null}>
        <Spline
          scene={SCENE_URL}
          onLoad={() => setLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            pointerEvents: 'none',
          }}
        />
      </Suspense>
    </div>
  );
}
