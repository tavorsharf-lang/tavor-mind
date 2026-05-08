import { useEffect, useRef, useState } from 'react';
import PhaseHeader from './components/PhaseHeader.jsx';
import SoftButton from './components/SoftButton.jsx';
import { MODES } from '../../data/modes.js';

const STAGE_TOTAL = 10;
const STAGE_LABEL = 'שלב 2 — לנתח';

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 6 L8 10 L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Phase9Mode({ selected, setSelected, onNext, onSkip, onExit }) {
  const [expandedModeId, setExpandedModeId] = useState(null);
  const itemRefs = useRef({});

  const toggleSelected = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleExpanded = (id) => {
    setExpandedModeId((curr) => (curr === id ? null : id));
  };

  useEffect(() => {
    if (!expandedModeId) return;
    const el = itemRefs.current[expandedModeId];
    if (!el) return;
    const id = window.requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    return () => window.cancelAnimationFrame(id);
  }, [expandedModeId]);

  return (
    <div className="phase phase-modes">
      <PhaseHeader phase={9} total={STAGE_TOTAL} stageLabel={STAGE_LABEL} onExit={onExit} />
      <main className="phase-content">
        <h1 className="phase-title">איזה קול מדבר עכשיו?</h1>
        <p className="phase-subtitle">סמן אחד או יותר</p>
        <ul className="mode-pick-list phase-mode-list">
          {MODES.map((m) => {
            const isSel = selected.has(m.id);
            const isExpanded = expandedModeId === m.id;
            return (
              <li key={m.id} ref={(el) => { itemRefs.current[m.id] = el; }}>
                <div
                  className={`mode-pick ${isSel ? 'is-selected' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSel}
                  aria-expanded={isExpanded}
                  onClick={() => toggleSelected(m.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleSelected(m.id);
                    }
                  }}
                >
                  <div className="mode-pick-row">
                    <button
                      type="button"
                      className="mode-pick-chevron"
                      aria-label={isExpanded ? 'סגור הסבר' : 'פתח הסבר'}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(m.id);
                      }}
                    >
                      <ChevronIcon />
                    </button>
                    <span className="mode-pick-label">{m.label}</span>
                  </div>

                  {isExpanded && (
                    <div className="mode-pick-expanded">
                      <p className="mode-description">{m.description}</p>
                      <div className="mode-healthy-adult">
                        <span className="mode-healthy-adult-label">המבוגר הבריא</span>
                        <p>{m.healthyAdultMessage}</p>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </main>
      <footer className="phase-footer phase-footer-stack">
        <SoftButton onClick={onNext}>המשך</SoftButton>
        <button type="button" className="link-btn phase-skip" onClick={onSkip}>
          דלג לשלב הבא
        </button>
      </footer>
    </div>
  );
}
