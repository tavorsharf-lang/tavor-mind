import { useEffect, useState } from 'react';
import {
  subscribeLiveHrSamples,
  getHrSessionSnapshot,
  detectLatestCluster,
  summarizeSamples,
} from '../../../utils/liveHr.js';

export default function HrHistoryView({ sessionId }) {
  const [samples, setSamples] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!sessionId) return undefined;
    return subscribeLiveHrSamples(sessionId, ({ samples: next }) => {
      setSamples(next);
      setLoaded(true);
    });
  }, [sessionId]);

  // Belt-and-suspenders refetch (websocket may not reconnect after Safari
  // was backgrounded). Listen to visibilitychange + focus + pageshow; one
  // of them will fire when the user returns.
  useEffect(() => {
    if (!sessionId) return undefined;
    const refetch = async () => {
      const snap = await getHrSessionSnapshot(sessionId);
      if (snap?.samples) {
        setSamples(snap.samples);
        setLoaded(true);
      }
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

  if (!sessionId) return null;
  if (!loaded) return null; // first load
  if (samples.length === 0) return null; // nothing recorded for this session

  const cluster = detectLatestCluster(samples);
  if (cluster.length < 2) return null;

  const summary = summarizeSamples(cluster);
  return (
    <div className="hr-summary-card hr-summary-card--ok" style={{ marginTop: 16 }}>
      <div className="hr-summary-row">
        <div className="hr-summary-label">דופק</div>
        <div className="hr-summary-meta">
          {summary.count} דגימות · {Math.max(1, Math.round(summary.durationMs / 60000))} דק'
        </div>
      </div>
      <div className="hr-summary-stats">
        <Stat value={summary.start} label="התחלה" />
        <Stat value={summary.min} label="נמוך" tint="var(--green)" />
        <Stat value={summary.max} label="גבוה" tint="var(--orange)" />
        <Stat value={summary.end} label="סיום" />
      </div>
      <HrChart samples={cluster} />
      <div className={`hr-summary-delta ${summary.delta < 0 ? 'is-down' : summary.delta > 0 ? 'is-up' : ''}`}>
        {summary.delta < 0 ? `↓ ירידה של ${Math.abs(summary.delta)} BPM` : summary.delta > 0 ? `↑ עלייה של ${summary.delta} BPM` : 'נשאר יציב'}
      </div>
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
