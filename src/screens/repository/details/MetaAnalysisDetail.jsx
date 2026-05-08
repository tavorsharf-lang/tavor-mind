import { formatHebrewDate } from '../../../utils/dateHelpers.js';

const DOMAIN_LABELS = {
  emotion: 'רגשות',
  gratitude: 'הוקרת תודה',
  mixed: 'משולב',
};

function fmt(d) {
  if (!d) return '—';
  try { return formatHebrewDate(d); } catch { return d; }
}

export default function MetaAnalysisDetail({ analysis }) {
  const p = analysis.payload || {};
  const period = analysis.period_covered || {};
  return (
    <div className="detail-sections">
      <section className="detail-section">
        <h3 className="form-section-label">תקופה</h3>
        <p className="detail-line">
          <strong>{fmt(period.start)}</strong>
          {' '}—{' '}
          <strong>{fmt(period.end)}</strong>
        </p>
        {Number.isFinite(Number(period.sources_count)) && (
          <p className="detail-line detail-line-soft">
            מבוסס על {period.sources_count} ניתוחים
          </p>
        )}
      </section>

      {p.domain && (
        <section className="detail-section">
          <h3 className="form-section-label">דומיין</h3>
          <span className="chip">{DOMAIN_LABELS[p.domain] || p.domain}</span>
        </section>
      )}

      {Array.isArray(p.recurring_emotions) && p.recurring_emotions.length > 0 && (
        <section className="detail-section">
          <h3 className="form-section-label">רגשות חוזרים</h3>
          <ul className="meta-table">
            {p.recurring_emotions.map((e, i) => {
              const intensity = e.average_intensity ?? e.avg_intensity;
              const hasIntensity = typeof intensity === 'number' && intensity > 0;
              return (
                <li key={i} className="meta-row">
                  <span className="meta-row-name">{e.name}</span>
                  <span className="meta-row-count">{e.occurrences ?? '—'}×</span>
                  {hasIntensity
                    ? <IntensityBar value={intensity} />
                    : <span className="no-intensity">ללא דירוג עוצמה</span>}
                  {e.dominant_flavor && <span className="meta-row-flavor">{e.dominant_flavor}</span>}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {Array.isArray(p.recurring_triggers) && p.recurring_triggers.length > 0 && (
        <section className="detail-section">
          <h3 className="form-section-label">טריגרים חוזרים</h3>
          <ul className="meta-list">
            {p.recurring_triggers.map((t, i) => (
              <li key={i} className="meta-list-row">
                <div className="meta-row-head">
                  <span className="meta-row-name">{t.name}</span>
                  <span className="meta-row-count">{t.count ?? '—'}×</span>
                </div>
                {Array.isArray(t.contexts) && t.contexts.length > 0 && (
                  <div className="chip-row">
                    {t.contexts.map((c, j) => <span key={j} className="chip chip-tiny">{c}</span>)}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {Array.isArray(p.linguistic_patterns) && p.linguistic_patterns.length > 0 && (
        <section className="detail-section">
          <h3 className="form-section-label">דפוסים לשוניים</h3>
          <ul className="meta-list">
            {p.linguistic_patterns.map((lp, i) => (
              <li key={i} className="meta-list-row">
                <div className="meta-row-head">
                  <span className="meta-row-name">{lp.pattern}</span>
                  <span className="meta-row-count">{lp.count ?? '—'}×</span>
                </div>
                {Array.isArray(lp.examples) && lp.examples.length > 0 && (
                  <ul className="example-list">
                    {lp.examples.map((ex, j) => (
                      <li key={j} className="example-quote">"{ex}"</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {Array.isArray(p.blind_spots) && p.blind_spots.length > 0 && (
        <section className="detail-section">
          <h3 className="form-section-label">נקודות עיוורון</h3>
          <ol className="numbered-list numbered-list-muted">
            {p.blind_spots.map((b, i) => <li key={i}>{b}</li>)}
          </ol>
        </section>
      )}

      {p.movement_observed && (
        <section className="detail-section">
          <h3 className="form-section-label">מה זז</h3>
          <div className="callout callout-positive">{p.movement_observed}</div>
        </section>
      )}

      {p.stayed_constant && (
        <section className="detail-section">
          <h3 className="form-section-label">מה נשאר קבוע</h3>
          <div className="callout callout-soft">{p.stayed_constant}</div>
        </section>
      )}

      {p.central_sentence && (
        <section className="detail-section">
          <h3 className="form-section-label">המשפט המכונן</h3>
          <div className="callout callout-central">{p.central_sentence}</div>
        </section>
      )}

      {Array.isArray(p.recommendations) && p.recommendations.length > 0 && (
        <section className="detail-section">
          <h3 className="form-section-label">המלצות</h3>
          <ul className="rec-list">
            {p.recommendations.map((r, i) => (
              <li key={i} className="rec-card">
                <h4 className="rec-area">{r.area}</h4>
                {r.why_matters && <p className="rec-why">{r.why_matters}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {p.open_question && (
        <section className="detail-section">
          <h3 className="form-section-label">השאלה הפתוחה</h3>
          <div className="callout callout-question">{p.open_question}</div>
        </section>
      )}
    </div>
  );
}

function IntensityBar({ value }) {
  const v = Number(value);
  const pct = Number.isFinite(v) ? Math.max(0, Math.min(100, (v / 10) * 100)) : 0;
  return (
    <span className="intensity-bar" aria-label={Number.isFinite(v) ? `עוצמה ${v}/10` : ''}>
      <span className="intensity-bar-fill" style={{ width: `${pct}%` }} />
    </span>
  );
}
