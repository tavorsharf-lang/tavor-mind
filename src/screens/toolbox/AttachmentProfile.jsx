import { useState } from 'react';
import ToolHeader from './components/ToolHeader.jsx';
import { profileLabel, profileIntro, scores, dynamics, corePoint } from '../../data/attachment.js';

const QUESTIONNAIRES = ['ecr', 'asq', 'rsq'];

export default function AttachmentProfile() {
  const [openSet, setOpenSet] = useState(new Set());

  const toggle = (key) => {
    const next = new Set(openSet);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setOpenSet(next);
  };

  return (
    <div className="tool-page ds2-themed">
      <ToolHeader title="פרופיל ההיקשרות" />
      <main className="tool-content">
        <div className="attachment-profile-label">{profileLabel}</div>
        <div className="attachment-intro">
          {profileIntro.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        <ul className="q-list">
          {QUESTIONNAIRES.map((key) => {
            const q = scores[key];
            const open = openSet.has(key);
            return (
              <li key={key} className={`q-section ${open ? 'is-open' : ''}`}>
                <button type="button" className="q-toggle" onClick={() => toggle(key)} aria-expanded={open}>
                  <span className="q-name">{q.name}</span>
                  <span className="q-chevron" aria-hidden="true">
                    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>
                <div className="q-bars-wrap">
                  <div className="q-bars">
                    {q.items.map((it, i) => (
                      <ScoreBar key={i} {...it} />
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <hr className="section-rule" />

        <section className="dynamics-section">
          <h2 className="section-title">הדינמיקות שלך</h2>
          <ul className="dynamic-list">
            {dynamics.map((d, i) => (
              <li key={i} className="dynamic-card">
                <h3 className="dynamic-title">{d.title}</h3>
                <p className="dynamic-body">{d.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <aside className="callout">
          {corePoint.split('\n').map((line, i) => (
            <p key={i} className="callout-text">{line}</p>
          ))}
        </aside>
      </main>
    </div>
  );
}

function ScoreBar({ label, value, max, note }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="score-bar">
      <div className="score-bar-row">
        <span className="score-bar-label">{label}</span>
        <span className="score-bar-value">{value.toFixed(2)} / {max} · {note}</span>
      </div>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
