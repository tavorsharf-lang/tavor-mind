import { useEffect, useRef, useState } from 'react';
import { resolveYogaNidraSrc, setAudioBlob } from '../../utils/audioStorage.js';

const formatTime = (s) => {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export default function YogaNidra({ onEnded, onStop }) {
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);
  const [src, setSrc] = useState(null);
  const [isUserUpload, setIsUserUpload] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.playbackRate = playbackRate;
  }, [playbackRate, src]);

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

  // Autoplay once src is set (best-effort; user clicked "לפני שינה" so should be allowed)
  useEffect(() => {
    if (!src) return;
    const a = audioRef.current;
    if (!a) return;
    a.play().catch(() => { /* user can press play manually */ });
  }, [src]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
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
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onEnded={() => { setIsPlaying(false); onEnded?.(); }}
          onError={() => { setHasError(true); setIsPlaying(false); }}
        />

        <div className="nidra-time" aria-hidden="true">{formatTime(currentTime)}</div>

        <button
          type="button"
          className="nidra-play"
          onClick={togglePlay}
          aria-label={isPlaying ? 'השהה' : 'נגן'}
        >
          <span aria-hidden="true">{isPlaying ? '❙❙' : '▶'}</span>
        </button>

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

        {hasError && (
          <p className="nidra-error" role="status">
            ההקלטה לא נטענה. אפשר להעלות קובץ חלופי.
          </p>
        )}

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
