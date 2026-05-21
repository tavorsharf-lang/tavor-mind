import { formatHebrewDate, relativeDay, formatTimeOfDay } from '../../../utils/dateHelpers.js';
import { emotionLabelById, VALENCE_LABELS, VALENCE_COLORS } from '../../../data/emotionsCorpus.js';

const SCOPE_LABELS = { moment: 'כרגע', day: 'כללי' };

function dateLabel(dateStr) {
  if (!dateStr) return '-';
  const rel = relativeDay(dateStr);
  const full = formatHebrewDate(dateStr);
  return rel === full ? full : rel;
}

export default function MoodListItem({ entry }) {
  const color = VALENCE_COLORS[entry.valence] || 'var(--line)';
  const time = formatTimeOfDay(new Date(entry._ts || entry.createdAt));
  const valenceLabel = VALENCE_LABELS[entry.valence] || '';
  const scopeLabel = SCOPE_LABELS[entry.scope] || '';

  return (
    <li className="analysis-row mood-row">
      <div className="analysis-row-toggle mood-row-content">
        <div className="analysis-row-top">
          <span className="type-chip type-chip-sm mood-type-chip" style={{ background: color, color: '#fff' }}>
            <span className="mood-type-dot" aria-hidden="true" />
            צ'ק-אין רגשי
          </span>
          <span className="analysis-row-date">{dateLabel(entry._date)} · {time}</span>
          {entry._pending && <span className="pending-chip">ממתין</span>}
        </div>
        <h3 className="analysis-row-title mood-row-title" style={{ color }}>
          {valenceLabel}
          {scopeLabel && <span className="mood-row-scope"> · {scopeLabel}</span>}
        </h3>
        {Array.isArray(entry.emotions) && entry.emotions.length > 0 && (
          <div className="analysis-row-tags">
            {entry.emotions.map((id) => (
              <span key={id} className="chip chip-tiny">{emotionLabelById(id)}</span>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
