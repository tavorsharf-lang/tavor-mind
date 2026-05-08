import { useState } from 'react';
import ToolHeader from '../toolbox/components/ToolHeader.jsx';
import MeditationPlayer from '../emergency/components/MeditationPlayer.jsx';
import { MEDITATIONS } from '../../data/meditations.js';

const PlayGlyph = () => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="16" cy="16" r="13" />
    <path d="M14 11 L21 16 L14 21 Z" fill="currentColor" stroke="none" />
  </svg>
);

export default function MindfulnessHub() {
  const [active, setActive] = useState(null);

  return (
    <div className="tool-page ds2-themed">
      <ToolHeader
        title="מיינדפולנס"
        subtitle="הקלטות מדיטציה לרגעי שקט, איזון, או חזרה לגוף"
        backTo="/"
      />
      <main className="tool-content">
        <ul className="tools-list">
          {MEDITATIONS.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                className="tools-card"
                onClick={() => setActive(m)}
                aria-label={`נגן: ${m.title}`}
              >
                <span className="tools-card-icon" aria-hidden="true"><PlayGlyph /></span>
                <span className="tools-card-text">
                  <span className="tools-card-title">{m.title}</span>
                  <span className="tools-card-sub">{m.description || m.subtitle}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </main>

      {active && (
        <MeditationPlayer
          open={!!active}
          src={active.src}
          title={active.title}
          subtitle={active.subtitle}
          onClose={() => setActive(null)}
          onComplete={() => setActive(null)}
        />
      )}
    </div>
  );
}
