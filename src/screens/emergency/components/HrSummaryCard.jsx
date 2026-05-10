import { useEffect, useState } from 'react';
import {
  buildRunShortcutUrl,
  subscribeLiveHrSamples,
  clipToWindow,
  summarizeSamples,
} from '../../../utils/liveHr.js';

const POLL_TIMEOUT_MS = 90000;

export default function HrSummaryCard({ sessionId, startedAtMs, endedAtMs }) {
  const [samples, setSamples] = useState([]);
  const [timedOut, setTimedOut] = useState(false);

  // Real-time subscription — pushes new samples as they arrive.
  useEffect(() => {
    if (!sessionId) return undefined;
    const unsub = subscribeLiveHrSamples(sessionId, ({ samples: next }) => {
      setSamples(next);
    });
    return unsub;
  }, [sessionId]);

  // Idle timeout — if no samples after POLL_TIMEOUT_MS, surface the empty
  // state instead of leaving the user staring at "waiting" forever.
  useEffect(() => {
    if (!sessionId) return undefined;
    const id = setTimeout(() => setTimedOut(true), POLL_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [sessionId]);

  if (!sessionId) return null;

  // Try clipped first; fall back to all samples if the window filter loses
  // everything (e.g., samples come from BEFORE the user mounted EmergencyFlow
  // because the watch was already in workout mode and HealthKit had recent
  // history). Better to show *something* than nothing when data exists.
  const clipped = clipToWindow(samples, startedAtMs, endedAtMs);
  const displaySamples = clipped.length > 0 ? clipped : samples;

  if (displaySamples.length > 0) {
    const summary = summarizeSamples(displaySamples);
    const sourceLabel = clipped.length > 0
      ? `${summary.count} דגימות · ${Math.max(1, Math.round(summary.durationMs / 60000))} דק'`
      : `${summary.count} דגימות (מחוץ לחלון הסשן)`;
    return (
      <div className="hr-summary-card hr-summary-card--ok">
        <div className="hr-summary-row">
          <div className="hr-summary-label">דופק</div>
          <div className="hr-summary-meta">{sourceLabel}</div>
        </div>
        <div className="hr-summary-stats">
          <Stat value={summary.start} label="התחלה" />
          <Stat value={summary.min} label="נמוך" tint="var(--green)" />
          <Stat value={summary.max} label="גבוה" tint="var(--orange)" />
          <Stat value={summary.end} label="סיום" />
        </div>
        <HrChart samples={displaySamples} />
        <div className={`hr-summary-delta ${summary.delta < 0 ? 'is-down' : summary.delta > 0 ? 'is-up' : ''}`}>
          {summary.delta < 0 ? `↓ ירידה של ${Math.abs(summary.delta)} BPM` : summary.delta > 0 ? `↑ עלייה של ${summary.delta} BPM` : 'נשאר יציב'}
        </div>
      </div>
    );
  }

  // No samples yet
  return (
    <div className="hr-summary-card">
      <div className="hr-summary-row">
        <div className="hr-summary-label">דופק</div>
      </div>
      {!timedOut ? (
        <p className="hr-summary-hint">ממתין לדגימות…</p>
      ) : (
        <>
          <p className="hr-summary-hint">
            לא הגיעו דגימות. ודא ש-Shortcut "TavorMind HR" רץ (ושיש workout פעיל בשעון בזמן הסשן).
          </p>
          <a
            href={buildRunShortcutUrl(sessionId)}
            className="ds3-btn ds3-btn-blue hr-summary-cta"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
            onClick={() => setTimedOut(false)}
          >
            הרץ שוב
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
