import { formatHebrewDate, relativeDay, formatTimeOfDay } from '../../../utils/dateHelpers.js';
import { emotionLabelById, VALENCE_COLORS, VALENCE_LABELS } from '../../../data/emotionsCorpus.js';
import { factorLabelById, factorColorById } from '../../../data/lifeFactors.js';

const SCOPE_LABELS = {
  moment: 'כרגע',
  day: 'כללי',
};

export default function DayCard({ day }) {
  const { date, entries } = day;
  const rel = relativeDay(date);
  const full = formatHebrewDate(date);
  const showRel = rel !== full;

  if (!entries.length) {
    return (
      <li className="day-card is-empty">
        <div className="day-row-top">
          <span className="day-date">{full}</span>
          {showRel && <span className="day-rel">{rel}</span>}
        </div>
        <p className="day-empty-text">לא נעשה</p>
      </li>
    );
  }

  return (
    <li className="day-card">
      <div className="day-row-top">
        <span className="day-date">{full}</span>
        {showRel && <span className="day-rel">{rel}</span>}
        <span className="day-count" aria-label={`${entries.length} רישומים`}>
          {entries.length}
        </span>
      </div>
      <ul className="entry-list">
        {entries.map((entry) => (
          <EntryRow key={entry._ts} entry={entry} />
        ))}
      </ul>
    </li>
  );
}

function EntryRow({ entry }) {
  const color = VALENCE_COLORS[entry.valence] || 'var(--line)';
  const time = formatTimeOfDay(new Date(entry._ts || entry.createdAt));
  const scopeLabel = SCOPE_LABELS[entry.scope] || '';

  return (
    <li className="entry-row">
      <span
        className="entry-dot"
        style={{ background: color }}
        title={VALENCE_LABELS[entry.valence] || ''}
        aria-hidden="true"
      />
      <span className="entry-time">{time}</span>
      {scopeLabel && <span className="entry-scope">{scopeLabel}</span>}
      <span className="entry-valence" style={{ color }}>
        {VALENCE_LABELS[entry.valence] || ''}
      </span>
      {Array.isArray(entry.emotions) && entry.emotions.length > 0 && (
        <span className="entry-emotions">
          {entry.emotions.map((id) => (
            <span key={id} className="entry-emotion-chip">{emotionLabelById(id)}</span>
          ))}
        </span>
      )}
      {Array.isArray(entry.factors) && entry.factors.length > 0 && (
        <span className="entry-factors">
          {entry.factors.map((id) => (
            <span
              key={id}
              className="entry-factor-tag"
              style={{ '--factor-color': factorColorById(id) }}
            >
              {factorLabelById(id)}
            </span>
          ))}
        </span>
      )}
    </li>
  );
}
