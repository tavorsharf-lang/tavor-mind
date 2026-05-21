import { useState } from 'react';
import ToolHeader from './components/ToolHeader.jsx';
import { dominantSchemas, hypothesisSchemas, strengths, integrationNote } from '../../data/schemas.js';

export default function SchemaProfile() {
  const [expanded, setExpanded] = useState(new Set());

  const toggle = (id) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  return (
    <div className="tool-page ds2-themed">
      <ToolHeader
        title="פרופיל הסכמות"
        subtitle="שאלון YSQ-S3 - סולם 1 (נמוך) עד 6 (גבוה)"
      />
      <main className="tool-content">
        <ul className="schema-list">
          {dominantSchemas.map((s) => {
            const open = expanded.has(s.id);
            return (
              <li key={s.id} className={`schema-card ${open ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="schema-toggle"
                  aria-expanded={open}
                  onClick={() => toggle(s.id)}
                >
                  <div className="schema-row">
                    <div className="schema-name-block">
                      <h3 className="schema-name">{s.name}</h3>
                      <span className="schema-severity">{s.severity}</span>
                    </div>
                    <span className="schema-score">{s.score.toFixed(2)}</span>
                  </div>
                  <p className="schema-summary">{s.summary}</p>
                </button>
                <SchemaDetail schema={s} />
              </li>
            );
          })}
        </ul>

        <section className="hypothesis-section">
          <h2 className="section-title">סכמה לבחינה</h2>
          <p className="hypothesis-subtitle">דפוס שעלה במטא-ניתוח - לא בשאלון</p>
          <ul className="schema-list">
            {hypothesisSchemas.map((s) => {
              const open = expanded.has(s.id);
              return (
                <li key={s.id} className={`schema-card schema-card-hypothesis ${open ? 'is-open' : ''}`}>
                  <span className="schema-hypothesis-chip">השערה</span>
                  <button
                    type="button"
                    className="schema-toggle"
                    aria-expanded={open}
                    onClick={() => toggle(s.id)}
                  >
                    <h3 className="schema-name">{s.name}</h3>
                    <p className="schema-summary">{s.summary}</p>
                    {s.note && <p className="schema-note">{s.note}</p>}
                  </button>
                  <SchemaDetail schema={s} />
                </li>
              );
            })}
          </ul>
        </section>

        <hr className="section-rule" />

        <section className="strengths-section">
          <h2 className="section-title">החוזקות שלך</h2>
          <p className="section-intro">{strengths.intro}</p>
          <div className="strength-grid">
            {strengths.items.map((it, i) => (
              <div key={i} className="strength-card">
                <span className="strength-name">{it.name}</span>
                <span className="strength-score">{it.score.toFixed(2)}</span>
                <span className="strength-meaning">{it.meaning}</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="callout">
          {integrationNote.split('\n').map((line, i) => (
            <p key={i} className="callout-text">{line}</p>
          ))}
        </aside>
      </main>
    </div>
  );
}

function SchemaDetail({ schema }) {
  return (
    <div className="schema-detail-wrap">
      <div className="schema-detail">
        <DetailBlock label="קולות פנימיים">
          <ul className="quote-list">
            {schema.voices.map((v, i) => <li key={i}>"{v}"</li>)}
          </ul>
        </DetailBlock>
        <DetailBlock label="טריגרים">
          <div className="chip-row">
            {schema.triggers.map((t, i) => <span key={i} className="chip">{t}</span>)}
          </div>
        </DetailBlock>
        <DetailBlock label="תגובה בריאה">
          <p className="schema-healthy">{schema.healthy_response}</p>
        </DetailBlock>
      </div>
    </div>
  );
}

function DetailBlock({ label, children }) {
  return (
    <div className="detail-block">
      <h4 className="detail-label">{label}</h4>
      {children}
    </div>
  );
}
