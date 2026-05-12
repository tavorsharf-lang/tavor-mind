const EMBED_URL =
  'https://my.spline.design/lowpolyheartcopy-oYgco19xNITkAjt29SJIncQT/';

export default function HeartHologramButton({ onClick, ariaLabel = 'עכשיו קשה לי' }) {
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
    >
      <iframe
        src={EMBED_URL}
        className="ds3-heart-hologram-iframe"
        title={ariaLabel}
        loading="lazy"
        allow="autoplay; fullscreen"
      />
    </div>
  );
}
