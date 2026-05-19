import { useEffect, useRef, useState } from 'react';
import { resolveYogaNidraSrc, setAudioBlob } from '../../utils/audioStorage.js';

const SKIP_SECONDS = 15;

const formatTime = (s) => {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

/*  Sleep-mode audio player. Mirrors the structure of MeditationPlayer
    (play/pause, ±15s, draggable progress, time, speed pills) so it feels
    identical to the rest of the app — only the surrounding chrome is
    darker via sleep.css.                                                */

export default function YogaNidra({ onEnded, onSkip, onStop }) {
  const audioRef = useRef(null);
  const barRef = useRef(null);
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);

  const [src, setSrc] = useState(null);
  const [isUserUpload, setIsUserUpload] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Resolve the audio source: IndexedDB user upload, or bundled static file.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { src: resolved, isUserUpload } = await resolveYogaNidraSrc();
      if (cancelled) {
        if (isUserUpload) URL.revokeObjectURL(resolved);
        return;
      }
      objectUrlRef.current = isUserUpload ? resolved : null;
      setSrc(resolved);
      setIsUserUpload(isUserUpload);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!src) return;
    const a = audioRef.current;
    if (!a) return;
    a.play().catch(() => {});
  }, [src]);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.playbackRate = playbackRate;
  }, [playbackRate, src]);

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
    // RTL: rightmost edge = start
    return 1 - (clientX - rect.left) / rect.width;
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

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await setAudioBlob('yoga_nidra', file);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setSrc(url);
      setIsUserUpload(true);
      setHasError(false);
    } catch {
      setHasError(true);
    }
  };

  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const canSeek = duration > 0;

  if (loading) {
    return (
      <div className="sleep-page">
        <div className="nidra-stage">
          <p className="sleep-faint">…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sleep-page">
      <button type="button" className="sleep-skip" onClick={onSkip}>דלג</button>
      <button type="button" className="sleep-stop" onClick={onStop}>עצור</button>

      <div className="nidra-stage">
        <h2 className="nidra-title">
          יוגה נידרה{isUserUpload ? '' : ' · 25 דקות'}
        </h2>

        <audio
          ref={audioRef}
          src={src}
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
            ההקלטה לא נטענה. אפשר להעלות קובץ חלופי.
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
            <div className="nidra-progress-thumb" style={{ insetInlineStart: `${pct}%` }} aria-hidden="true" />
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

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          style={{ display: 'none' }}
          onChange={handleUpload}
        />
        <button
          type="button"
          className="nidra-upload"
          onClick={() => fileInputRef.current?.click()}
        >
          החלף הקלטה
        </button>
      </div>
    </div>
  );
}
