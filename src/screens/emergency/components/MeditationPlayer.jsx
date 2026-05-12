import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal.jsx';

const SKIP_SECONDS = 15;

const formatTime = (s) => {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export default function MeditationPlayer({ open, src, title, subtitle, onClose, onComplete }) {
  const audioRef = useRef(null);
  const barRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset + stop when closed/unmounted, so audio doesn't bleed into Home.
  useEffect(() => {
    if (!open) {
      const a = audioRef.current;
      if (a) { a.pause(); a.currentTime = 0; }
      setIsPlaying(false);
      setCurrentTime(0);
      setIsDragging(false);
      setHasError(false);
    }
  }, [open]);

  // Reset error flag when src swaps (user picked a different track).
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().catch(() => {});
    } else {
      a.pause();
    }
  };

  const seekBy = (delta) => {
    const a = audioRef.current;
    if (!a || !Number.isFinite(a.duration)) return;
    const next = Math.max(0, Math.min(a.duration, a.currentTime + delta));
    a.currentTime = next;
    setCurrentTime(next);
  };

  const seekToRatio = (ratio) => {
    const a = audioRef.current;
    if (!a || !Number.isFinite(a.duration) || a.duration <= 0) return;
    const clamped = Math.max(0, Math.min(1, ratio));
    const next = clamped * a.duration;
    a.currentTime = next;
    setCurrentTime(next);
  };

  const ratioFromClientX = (clientX) => {
    const bar = barRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    return (clientX - rect.left) / rect.width;
  };

  const handlePointerDown = (e) => {
    if (duration <= 0) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    setIsDragging(true);
    seekToRatio(ratioFromClientX(e.clientX));
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    seekToRatio(ratioFromClientX(e.clientX));
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  };

  const handleKeyDown = (e) => {
    if (duration <= 0) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); seekBy(SKIP_SECONDS); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); seekBy(-SKIP_SECONDS); }
    else if (e.key === 'Home') { e.preventDefault(); seekToRatio(0); }
    else if (e.key === 'End') { e.preventDefault(); seekToRatio(1); }
  };

  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const canSeek = duration > 0;

  const titleId = 'meditation-player-title';

  return (
    <Modal open={open} onClose={onClose} ariaLabel="נגן מדיטציה">
      <div className="modal-meditation modal-card-center" aria-labelledby={titleId}>
        <h3 id={titleId} className="modal-title">{title}</h3>
        {subtitle && <p className="modal-body">{subtitle}</p>}

        <audio
          ref={audioRef}
          src={src}
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e) => { if (!isDragging) setCurrentTime(e.currentTarget.currentTime); }}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => { setIsPlaying(false); onComplete(); }}
          onError={() => { setHasError(true); setIsPlaying(false); }}
        />

        {hasError && (
          <p className="modal-error" role="status">
            המדיטציה לא זמינה כרגע. אפשר לסגור ולהמשיך.
          </p>
        )}

        <div className="modal-player-controls">
          <button
            type="button"
            className="modal-player-btn"
            onClick={() => seekBy(-SKIP_SECONDS)}
            aria-label="אחורה 15 שניות"
            disabled={!canSeek}
          >
            <span aria-hidden="true">−15</span>
          </button>

          <button
            type="button"
            className="modal-player-btn modal-player-btn-primary"
            onClick={togglePlay}
            aria-label={isPlaying ? 'השהה' : 'נגן'}
          >
            <span className="meditation-play-glyph" aria-hidden="true">
              {isPlaying ? '◼' : '▶'}
            </span>
          </button>

          <button
            type="button"
            className="modal-player-btn"
            onClick={() => seekBy(SKIP_SECONDS)}
            aria-label="קדימה 15 שניות"
            disabled={!canSeek}
          >
            <span aria-hidden="true">+15</span>
          </button>
        </div>

        <div
          ref={barRef}
          className={`meditation-progress${isDragging ? ' is-dragging' : ''}${canSeek ? '' : ' is-disabled'}`}
          role="slider"
          aria-label="מיקום בהקלטה"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration) || 0}
          aria-valuenow={Math.round(currentTime)}
          aria-valuetext={`${formatTime(currentTime)} מתוך ${formatTime(duration)}`}
          tabIndex={canSeek ? 0 : -1}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
        >
          <div className="meditation-progress-track">
            <div className="meditation-progress-bar" style={{ width: `${pct}%` }} />
            <div className="meditation-progress-thumb" style={{ left: `${pct}%` }} aria-hidden="true" />
          </div>
        </div>

        <div className="meditation-time" aria-hidden="true">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="ds3-btn ds3-btn-cream"
            onClick={onClose}
            aria-label="סגור"
          >
            סגור
          </button>
        </div>
      </div>
    </Modal>
  );
}
