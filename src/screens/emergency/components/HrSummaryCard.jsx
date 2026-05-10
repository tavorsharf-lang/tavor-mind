import { useEffect, useState } from 'react';
import {
  buildRunShortcutUrl,
  subscribeLiveHrSamples,
  getHrSessionSnapshot,
  getCurrentUid,
  detectLatestCluster,
  summarizeSamples,
} from '../../../utils/liveHr.js';

// Generous timeout: even with Limit=30, a full upload plus iOS Safari coming
// back from background can take a while. Extending past 90s avoids spurious
// "no samples" errors when data is still trickling in.
const POLL_TIMEOUT_MS = 180000;

export default function HrSummaryCard({ sessionId, startedAtMs, endedAtMs }) {
  const [samples, setSamples] = useState([]);
  // 'idle' = waiting for user to tap "טען נתוני דופק"
  // 'loading' = user tapped, Shortcut launched, polling for samples
  // 'timeout' = no samples after POLL_TIMEOUT_MS
  const [state, setState] = useState('idle');

  // Real-time subscription — pushes new samples as they arrive.
  useEffect(() => {
    if (!sessionId) return undefined;
    const unsub = subscribeLiveHrSamples(sessionId, ({ samples: next }) => {
      setSamples(next);
    });
    return unsub;
  }, [sessionId]);

  // iOS Safari closes websockets when backgrounded. Multiple recovery paths:
  // (a) visibilitychange/focus/pageshow listeners refetch when the page
  //     returns to foreground.
  // (b) Active polling every 3s while state === 'loading' AND no samples
  //     yet — guarantees the chart appears once data is in Firebase even
  //     if the visibility events don't fire reliably on iOS.
  useEffect(() => {
    if (!sessionId) return undefined;
    const refetch = async () => {
      const snap = await getHrSessionSnapshot(sessionId);
      if (snap?.samples) setSamples(snap.samples);
    };
    document.addEventListener('visibilitychange', refetch);
    window.addEventListener('focus', refetch);
    window.addEventListener('pageshow', refetch);
    refetch();
    return () => {
      document.removeEventListener('visibilitychange', refetch);
      window.removeEventListener('focus', refetch);
      window.removeEventListener('pageshow', refetch);
    };
  }, [sessionId]);

  // Active poll: while loading and no samples yet, hit Firebase every 3s.
  useEffect(() => {
    if (!sessionId) return undefined;
    if (state !== 'loading') return undefined;
    if (samples.length > 0) return undefined;
    const id = setInterval(async () => {
      const snap = await getHrSessionSnapshot(sessionId);
      if (snap?.samples?.length > 0) setSamples(snap.samples);
    }, 3000);
    return () => clearInterval(id);
  }, [sessionId, state, samples.length]);

  // Idle timeout — if user tapped "load" but no samples arrive in time.
  useEffect(() => {
    if (state !== 'loading') return undefined;
    if (samples.length > 0) return undefined;
    const id = setTimeout(() => setState('timeout'), POLL_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [state, samples.length]);

  if (!sessionId) return null;

  // Pick the most recent contiguous cluster. Workouts sample HR densely
  // (~1Hz); any gap >60s marks a session boundary. This auto-detects the
  // current session without depending on tavor-mind's own startedAt/endedAt
  // (which can be off if the workout started before the user opened the app).
  const displaySamples = detectLatestCluster(samples);

  if (displaySamples.length > 0) {
    const summary = summarizeSamples(displaySamples);
    const sourceLabel = `${summary.count} דגימות · ${Math.max(1, Math.round(summary.durationMs / 60000))} דק'`;
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

  // No samples yet — show explicit "load" button (anchor to launch Shortcut).
  return (
    <div className="hr-summary-card">
      <div className="hr-summary-row">
        <div className="hr-summary-label">דופק</div>
      </div>
      {state === 'idle' && (
        <>
          <p className="hr-summary-hint">
            ודא שה-workout בשעון הסתיים. ה-Shortcut יקרא דגימות ויעלה אותן לכאן.
          </p>
          <a
            href={buildRunShortcutUrl(sessionId)}
            className="ds3-btn ds3-btn-blue hr-summary-cta"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
            onClick={() => setState('loading')}
          >
            טען נתוני דופק
          </a>
        </>
      )}
      {state === 'loading' && (
        <>
          <p className="hr-summary-hint">ממתין לדגימות…</p>
          <p className="hr-summary-hint" style={{ fontSize: 10, opacity: 0.6, fontFamily: 'monospace', lineHeight: 1.5 }}>
            UID: {(getCurrentUid() || '?').slice(0, 12)}…<br/>
            sessionId: {sessionId}<br/>
            בזיכרון: {samples.length}
          </p>
          <button
            type="button"
            className="ds3-btn-quiet"
            onClick={async () => {
              const snap = await getHrSessionSnapshot(sessionId);
              alert(`UID: ${getCurrentUid()}\nsessionId: ${sessionId}\nFirebase returned: ${snap ? `${snap.samples?.length || 0} samples` : 'null'}`);
              if (snap?.samples) setSamples(snap.samples);
            }}
            style={{ fontSize: 13 }}
          >
            רענן ידנית + הצג מצב
          </button>
        </>
      )}
      {state === 'timeout' && (
        <>
          <p className="hr-summary-hint">
            לא הגיעו דגימות. ודא ש-Shortcut "TavorMind HR" רץ (ושיש workout פעיל בשעון בזמן הסשן).
          </p>
          <a
            href={buildRunShortcutUrl(sessionId)}
            className="ds3-btn ds3-btn-blue hr-summary-cta"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
            onClick={() => setState('loading')}
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
