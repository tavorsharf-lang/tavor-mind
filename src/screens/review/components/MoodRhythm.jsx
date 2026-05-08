import EmptyState from './EmptyState.jsx';
import { VALENCE_COLORS, VALENCE_LABELS } from '../../../data/emotionsCorpus.js';

function trendDirection(points) {
  if (!Array.isArray(points) || points.length < 4) return null;
  const third = Math.max(1, Math.floor(points.length / 3));
  const first = points.slice(0, third);
  const last = points.slice(-third);
  const mean = (arr) => arr.reduce((s, p) => s + p.score, 0) / arr.length;
  const f = mean(first);
  const l = mean(last);
  const diff = l - f;
  if (diff < -0.4) return 'down';
  if (diff > 0.4) return 'up';
  return 'flat';
}

function Sparkline({ points }) {
  if (!Array.isArray(points) || points.length < 4) return null;
  const w = 320;
  const h = 60;
  const padX = 6;
  const padY = 8;
  const xs = points.length - 1;
  const path = points.map((p, i) => {
    const x = padX + (i / xs) * (w - 2 * padX);
    const y = h - padY - ((p.score - 1) / 4) * (h - 2 * padY);
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg className="sparkline" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={path} fill="none" stroke="var(--lichen)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function colorForAvg(avg) {
  if (avg == null) return null;
  const rounded = Math.max(1, Math.min(5, Math.round(avg)));
  return VALENCE_COLORS[rounded];
}

export default function MoodRhythm({ data }) {
  const { perDay = [], totalDays, daysWithEntries = 0, valence_trend = [] } = data || {};
  if (perDay.length === 0) {
    return (
      <section className="review-section">
        <header className="review-section-header">
          <h3 className="review-section-title">קצב מצב הרוח</h3>
          <p className="review-section-sub">איזה גוון נשא איתך כל יום</p>
        </header>
        <EmptyState inline />
      </section>
    );
  }

  const trend = trendDirection(valence_trend);
  const trendLine = trend === 'down'
    ? 'התקופה נסגרה נמוך מאיך שהתחילה.'
    : trend === 'up'
    ? 'משהו זז כלפי מעלה.'
    : null;

  const sizeClass = perDay.length <= 7 ? 'is-week' : perDay.length <= 30 ? 'is-month' : 'is-90d';

  return (
    <section className="review-section">
      <header className="review-section-header">
        <h3 className="review-section-title">קצב מצב הרוח</h3>
        <p className="review-section-sub">איזה גוון נשא איתך כל יום</p>
      </header>
      <div className={`mood-ribbon ${sizeClass}`} aria-label={`קצב מצב הרוח על פני ${totalDays} ימים`}>
        {perDay.map((d) => {
          const color = colorForAvg(d.avgValence);
          const title = d.avgValence != null
            ? `${d.date} · ${VALENCE_LABELS[Math.round(d.avgValence)]} · ${d.count} רישומים`
            : d.date;
          return (
            <span
              key={d.date}
              className={`mood-ribbon-dot ${d.hasEntries ? 'is-on' : 'is-off'}`}
              style={color ? { background: color } : undefined}
              title={title}
            />
          );
        })}
      </div>
      <p className="rhythm-summary">
        מתוך {totalDays} ימים, נכחת ב-{daysWithEntries}.
      </p>
      <Sparkline points={valence_trend} />
      {trendLine && <p className="rhythm-trend-line">{trendLine}</p>}
    </section>
  );
}
