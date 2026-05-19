import { useEffect, useRef, useState } from 'react';
import { MEDITATIONS_BY_ID } from '../../data/meditations.js';

const SKIP_SECONDS = 15;

/*  Sleep-mode body-scan player. Two stages:
    1. "קצרה / ארוכה" — same short+long pair the emergency 'hyper' flow uses
       (short = activated-short, long = hyper = "סריקת גוף").
    2. Inline audio player with the same nidra-* chrome as YogaNidra, minus
       the upload feature (recordings are bundled).                        */

const VARIANTS = {
  short: { meditation: MEDITATIONS_BY_ID['activated-short'], label: 'קצרה', hint: 'סריקה מהירה' },
  long:  { meditation: MEDITATIONS_BY_ID.hyper,              label: 'ארוכה', hint: 'סריקה ממושכת' },
};

const formatTime = (s) => {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export default function SleepBodyScan({ onComplete, onSkip, onStop }) {
  const [variant, setVariant] = useState(null);

  if (!variant) {
    return (
      <div className="sleep-page">
        <button type="button" className="sleep-skip" onClick={onSkip}>דלג</button>

        <div className="nidra-stage">
          <h2 className="nidra-title">סריקת גוף</h2>
          <div className="nidra-actions">
            <button
              type="button"
              className="nidra-end-btn nidra-end-btn-primary"
              onClick={() => setVariant('short')}
            >
              קצרה
              <span className="sleep-faint" style={{ display: 'block', marginTop: 4 }}>
                {VARIANTS.short.hint}
              </span>
            </button>
            <button
              type="button"
              className="nidra-end-btn"
              onClick={() => setVariant('long')}
            >
              ארוכה
              <span className="sleep-faint" style={{ display: 'block', marginTop: 4 }}>
                {VARIANTS.long.hint}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BodyScanPlayer
      meditation={VARIANTS[variant].meditation}
      onEnded={onComplete}
      onSkip={onSkip}
      onStop={onStop}
    />
  );
}

function BodyScanPlayer({ meditation, onEnded, onSkip, onStop }) {
  const audioRef = useRef(null);
  const barRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.play().catch(() => {});
  }, [meditation.src]);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.playbackRate = playbackRate;
  }, [playbackRate]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
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

  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const canSeek = duration > 0;

  return (
    <div className="sleep-page">
      <button type="button" className="sleep-skip" onClick={onSkip}>דלג</button>
      <button type="button" className="sleep-stop" onClick={onStop}>עצור</button>

      <div className="nidra-stage">
        <h2 className="nidra-title">{meditation.title}</h2>

        <audio
          ref={audioRef}
          src={meditation.src}
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e) => { if (!isDragging) setCurrentTime(e.currentTarget.currentTime); }}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => { setIsPlaying(false); onEnded?.(); }}
          onError={() => { setHasError(true); setIsPlaying(false); }}
        />

        {hasError && (
          <p className="nidra-error" role="status">
            ההקלטה לא נטענה. אפשר לדלג.
          </p>
        )}

        <div className="nidra-player-controls">
          <button
            type="button"
            className="nidra-player-btn"
            onClick={() => seekBy(-SKIP_SECONDS)}
            aria-label="אחורה 15 שניות"
            disabled={!canSeek}
          >
            <span aria-hidden="true">−15</span>
          </button>

          <button
            type="button"
            className="nidra-play"
            onClick={togglePlay}
            aria-label={isPlaying ? 'השהה' : 'נגן'}
          >
            <span aria-hidden="true">{isPlaying ? '❙❙' : '▶'}</span>
          </button>

          <button
            type="button"
            className="nidra-player-btn"
            onClick={() => seekBy(SKIP_SECONDS)}
            aria-label="קדימה 15 שניות"
            disabled={!canSeek}
          >
            <span aria-hidden="true">+15</span>
          </button>
        </div>

        <div
          ref={barRef}
          className={`nidra-progress${isDragging ? ' is-dragging' : ''}${canSeek ? '' : ' is-disabled'}`}
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
        >
          <div className="nidra-progress-track">
            <div className="nidra-progress-bar" style={{ width: `${pct}%` }} />
            <div className="nidra-progress-thumb" style={{ left: `${pct}%` }} aria-hidden="true" />
          </div>
        </div>

        <div className="nidra-time" aria-hidden="true">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="nidra-speed" role="group" aria-label="מהירות נגינה">
          {[1, 1.5, 2].map((rate) => (
            <button
              key={rate}
              type="button"
              className={`nidra-speed-btn${playbackRate === rate ? ' is-active' : ''}`}
              onClick={() => setPlaybackRate(rate)}
              aria-pressed={playbackRate === rate}
            >
              ×{rate}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
