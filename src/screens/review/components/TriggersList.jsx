import { useState } from 'react';
import EmptyState from './EmptyState.jsx';
import { SCHEMA_LABELS } from '../../../data/analysisSchemas.js';
import { PhaseTriggers as TriggersIcon } from '../../../components/icons/system.jsx';

export default function TriggersList({ data, scope }) {
  const [openIdx, setOpenIdx] = useState(null);
  const triggers = Array.isArray(data) ? data : [];
  const scopeWord = scope === 'week' ? 'השבוע' : scope === 'month' ? 'החודש' : 'ב-90 יום';
  const repeatThreshold = scope === 'week' ? 3 : 7;

  return (
    <section className="review-section">
      <header className="review-section-header">
        <h3 className="review-section-title">
          <span className="review-section-icon icon-tone-crisis" aria-hidden="true"><TriggersIcon /></span>
          מה הפעיל
        </h3>
        <p className="review-section-sub">הטריגרים שחזרו, והסכמות שעלו איתם</p>
      </header>

      {triggers.length === 0 ? (
        <EmptyState inline />
      ) : (
        <ul className="trigger-list">
          {triggers.map((t, i) => {
            const isHighlight = t.count >= repeatThreshold;
            const open = openIdx === i;
            return (
              <li key={i} className={`trigger-card ${isHighlight ? 'is-repeating' : ''}`}>
                <button type="button" className="trigger-toggle" onClick={() => setOpenIdx(open ? null : i)} aria-expanded={open}>
                  <div className="trigger-row-top">
                    <span className="trigger-name">{t.name}</span>
                    <span className="trigger-count">{t.count}× {scopeWord}</span>
                  </div>
                  {Array.isArray(t.schemas) && t.schemas.length > 0 && (
                    <div className="trigger-schemas">
                      {t.schemas.map((s, j) => (
                        <span key={j} className="schema-chip">{SCHEMA_LABELS[s] || s}</span>
                      ))}
                    </div>
                  )}
                  {isHighlight && (
                    <p className="trigger-note">חזר {t.count} פעמים - שווה תשומת לב.</p>
                  )}
                </button>
                {open && Array.isArray(t.contexts) && t.contexts.length > 0 && (
                  <ul className="trigger-contexts">
                    {t.contexts.map((c, j) => <li key={j}>{c}</li>)}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
