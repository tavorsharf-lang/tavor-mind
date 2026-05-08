import { ANALYSIS_TYPES } from '../../../data/analysisSchemas.js';
import { formatHebrewDate } from '../../../utils/dateHelpers.js';

function fmtDate(s) {
  if (!s) return '—';
  try {
    return formatHebrewDate(s);
  } catch {
    return s;
  }
}

export default function EnvelopeHeader({ analysis }) {
  const meta = ANALYSIS_TYPES[analysis.type];
  return (
    <header className="env-header">
      <div className="env-top-row">
        {meta && (
          <span className="type-chip" style={{ background: meta.color, color: '#fff' }}>
            <span aria-hidden="true">{meta.icon}</span>
            {meta.label}
          </span>
        )}
        {analysis._pending && <span className="pending-chip">ממתין לסנכרון</span>}
      </div>
      <h2 className="env-title">{analysis.title || 'ללא כותרת'}</h2>
      <div className="env-dates">
        <span><strong>התרחש:</strong> {fmtDate(analysis.occurredAt)}</span>
        <span><strong>נכתב:</strong> {fmtDate(analysis.createdAt)}</span>
      </div>
      {analysis.summary && (
        <aside className="env-summary">{analysis.summary}</aside>
      )}
      {Array.isArray(analysis.tags) && analysis.tags.length > 0 && (
        <div className="chip-row env-tags">
          {analysis.tags.map((t, i) => (
            <span key={i} className="chip">{t}</span>
          ))}
        </div>
      )}
    </header>
  );
}
