import { useEffect, useMemo, useRef, useState } from 'react';
import {
  subscribeLiveHrSamples,
  launchShortcut,
} from '../../../utils/liveHr.js';

// Sample is stale if no update arrived for this long. The Shortcut polls every
// ~5s, so 30s gives plenty of slack for one missed read before flagging.
const STALE_AFTER_MS = 30000;
const SPARKLINE_WINDOW_MS = 60000;

export default function LiveHrPanel({ sessionId, autoStart = false }) {
  const [samples, setSamples] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [shortcutLaunched, setShortcutLaunched] = useState(autoStart);
  const startSampleRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return undefined;
    return subscribeLiveHrSamples(sessionId, ({ samples: next }) => {
      setSamples(next);
      if (next.length && !startSampleRef.current) {
        startSampleRef.current = next[0];
      }
    });
  }, [sessionId]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const last = samples[samples.length - 1] || null;
  const isStale = !last || (now - last.ts > STALE_AFTER_MS);
  const startHr = startSampleRef.current?.hr ?? null;
  const delta = (last && startHr != null) ? Math.round(last.hr - startHr) : null;

  const recent = useMemo(() => {
    const cutoff = now - SPARKLINE_WINDOW_MS;
    return samples.filter((s) => s.ts >= cutoff);
  }, [samples, now]);

  const handleLaunchShortcut = () => {
    if (!sessionId) return;
    setShortcutLaunched(true);
    launchShortcut(sessionId);
  };

  if (!sessionId) return null;

  if (!shortcutLaunched) {
    return (
      <div className="live-hr-panel live-hr-panel--idle">
        <button
          type="button"
          className="ds3-btn ds3-btn-blue live-hr-launch"
          onClick={handleLaunchShortcut}
        >
          התחל מעקב דופק
        </button>
        <p className="live-hr-hint">
          ייפתח Shortcut באייפון. השאר אותו פתוח לאורך הסשן.
        </p>
      </div>
    );
  }

  return (
    <div className="live-hr-panel">
      <div className="live-hr-row">
        <div className="live-hr-main">
          <div className={`live-hr-number ${isStale ? 'is-stale' : ''}`}>
            {last ? last.hr : '—'}
          </div>
          <div className="live-hr-unit">BPM</div>
        </div>
        <div className="live-hr-meta">
          {delta != null ? (
            <div className={`live-hr-delta ${delta < 0 ? 'is-down' : delta > 0 ? 'is-up' : ''}`}>
              {delta > 0 ? '+' : ''}{delta}
              <span className="live-hr-delta-label">מההתחלה</span>
            </div>
          ) : (
            <div className="live-hr-delta is-pending">ממתין…</div>
          )}
          <div className="live-hr-status">
            {samples.length === 0 && 'ממתין לדגימה…'}
            {samples.length > 0 && isStale && 'דגימה ישנה'}
            {samples.length > 0 && !isStale && 'מחובר'}
          </div>
        </div>
      </div>
      <Sparkline samples={recent} />
    </div>
  );
}

function Sparkline({ samples }) {
  if (samples.length < 2) {
    return <div className="live-hr-sparkline live-hr-sparkline--empty" aria-hidden="true" />;
  }
  const w = 280;
  const h = 44;
  const padY = 4;
  const xs = samples.map((s) => s.ts);
  const ys = samples.map((s) => s.hr);
  const minX = xs[0];
  const maxX = xs[xs.length - 1];
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = (maxX - minX) || 1;
  const rangeY = (maxY - minY) || 1;
  const points = samples.map((s) => {
    const x = ((s.ts - minX) / rangeX) * w;
    const y = (h - padY * 2) - ((s.hr - minY) / rangeY) * (h - padY * 2) + padY;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg
      className="live-hr-sparkline"
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={h}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke="var(--lichen)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
