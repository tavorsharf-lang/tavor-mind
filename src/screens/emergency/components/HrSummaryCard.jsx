import { useEffect, useState } from 'react';
import {
  buildRunShortcutUrl,
  getHrSessionSnapshot,
  clipToWindow,
  summarizeSamples,
} from '../../../utils/liveHr.js';

// Polls every 2s for up to 90s after the user taps "load HR data". Bumped past
// the 60s used during initial setup because reading + posting many HealthKit
// samples in the Shortcut takes longer than a single live test.
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 90000;

export default function HrSummaryCard({ sessionId, startedAtMs, endedAtMs }) {
  const [status, setStatus] = useState('idle'); // idle | launching | waiting | ok | fail | empty
  const [samples, setSamples] = useState([]);

  useEffect(() => {
    if (status !== 'waiting' || !sessionId) return undefined;
    let cancelled = false;
    const startedAt = Date.now();
    const tick = async () => {
      if (cancelled) return;
      const snap = await getHrSessionSnapshot(sessionId);
      if (cancelled) return;
      const clipped = clipToWindow(snap?.samples || [], startedAtMs, endedAtMs);
      if (clipped.length > 0) {
        setSamples(clipped);
        setStatus('ok');
        return;
      }
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        // Distinguish "Shortcut ran but no HR samples in window" from "Shortcut never wrote".
        const anySamples = (snap?.samples || []).length > 0;
        setStatus(anySamples ? 'empty' : 'fail');
        return;
      }
      setTimeout(tick, POLL_INTERVAL_MS);
    };
    tick();
    return () => { cancelled = true; };
  }, [status, sessionId, startedAtMs, endedAtMs]);

  // Anchor-href approach: iOS Safari blocks JS-initiated custom-scheme URLs
  // (iframe / window.location). A real user-tap on <a href={shortcuts://...}>
  // works. onClick just flips state to start the polling.
  const handleLoadClick = () => {
    setStatus('waiting');
  };

  if (!sessionId) return null;

  if (status === 'ok') {
    const summary = summarizeSamples(samples);
    return (
      <div className="hr-summary-card hr-summary-card--ok">
        <div className="hr-summary-row">
          <div className="hr-summary-label">דופק</div>
          <div className="hr-summary-meta">
            {summary.count} דגימות · {Math.round(summary.durationMs / 60000)} דק'
          </div>
        </div>
        <div className="hr-summary-stats">
          <Stat value={summary.start} label="התחלה" />
          <Stat value={summary.min} label="נמוך" tint="var(--green)" />
          <Stat value={summary.max} label="גבוה" tint="var(--orange)" />
          <Stat value={summary.end} label="סיום" />
        </div>
        <HrChart samples={samples} />
        <div className={`hr-summary-delta ${summary.delta < 0 ? 'is-down' : summary.delta > 0 ? 'is-up' : ''}`}>
          {summary.delta < 0 ? `↓ ירידה של ${Math.abs(summary.delta)} BPM` : summary.delta > 0 ? `↑ עלייה של ${summary.delta} BPM` : 'נשאר יציב'}
        </div>
      </div>
    );
  }

  return (
    <div className="hr-summary-card">
      <div className="hr-summary-row">
        <div className="hr-summary-label">דופק</div>
      </div>
      {status === 'idle' && (
        <>
          <p className="hr-summary-hint">
            ודא שה-workout בשעון הסתיים. ה-Shortcut יקרא את הדגימות מ-HealthKit ויעלה לכאן.
          </p>
          <a
            href={buildRunShortcutUrl(sessionId)}
            className="ds3-btn ds3-btn-blue hr-summary-cta"
            onClick={handleLoadClick}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
          >
            טען נתוני דופק
          </a>
        </>
      )}
      {status === 'waiting' && (
        <p className="hr-summary-hint">ממתין לדגימות…</p>
      )}
      {status === 'fail' && (
        <>
          <p className="hr-summary-hint">
            לא הגיעו דגימות תוך {POLL_TIMEOUT_MS/1000} שניות. ודא שה-workout בשעון הסתיים ונסה שוב.
          </p>
          <a
            href={buildRunShortcutUrl(sessionId)}
            className="ds3-btn ds3-btn-blue hr-summary-cta"
            onClick={handleLoadClick}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
          >
            נסה שוב
          </a>
        </>
      )}
      {status === 'empty' && (
        <>
          <p className="hr-summary-hint">
            הדגימות הגיעו אבל אף אחת מהן לא נופלת בחלון הזמן של הסשן. ודא שה-workout היה פעיל לאורך הסשן.
          </p>
          <a
            href={buildRunShortcutUrl(sessionId)}
            className="ds3-btn-quiet hr-summary-cta"
            onClick={handleLoadClick}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
          >
            נסה שוב
          </a>
        </>
      )}
    </div>
  );
}

function Stat({ value, label, tint = 'var(--ink)' }) {
  return (
    <div className="hr-summary-stat">
      <div className="hr-summary-stat-value" style={{ color: tint }}>{value}</div>
      <div className="hr-summary-stat-label">{label}</div>
    </div>
  );
}

function HrChart({ samples }) {
  if (samples.length < 2) return null;
  const w = 320;
  const h = 80;
  const pad = 6;
  const xs = samples.map((s) => s.ts);
  const ys = samples.map((s) => s.hr);
  const minX = xs[0];
  const maxX = xs[xs.length - 1];
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = (maxX - minX) || 1;
  const rangeY = (maxY - minY) || 1;
  const points = samples.map((s) => {
    const x = ((s.ts - minX) / rangeX) * (w - pad * 2) + pad;
    const y = (h - pad * 2) - ((s.hr - minY) / rangeY) * (h - pad * 2) + pad;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg
      className="hr-summary-chart"
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
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
