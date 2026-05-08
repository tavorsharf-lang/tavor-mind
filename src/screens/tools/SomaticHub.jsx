import { useNavigate } from 'react-router-dom';
import ToolHeader from '../toolbox/components/ToolHeader.jsx';
import { SOMATIC_EXERCISES } from '../../data/somatic.js';

const ICONS = {
  physio_sigh: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="16" r="6" />
      <circle cx="16" cy="16" r="11" opacity="0.45" />
      <path d="M16 5 L16 9" />
      <path d="M16 23 L16 27" />
    </svg>
  ),
  butterfly_hug: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 10 C 10 4, 4 10, 6 16 C 8 22, 14 24, 16 26 C 18 24, 24 22, 26 16 C 28 10, 22 4, 16 10 Z" />
    </svg>
  ),
  cold_anchor: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4 L16 28" />
      <path d="M16 10 L11 5 M16 10 L21 5" />
      <path d="M5 11 L27 21" />
      <path d="M27 11 L5 21" />
    </svg>
  ),
  vagal_humming: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="16" r="3" fill="currentColor" />
      <circle cx="16" cy="16" r="8" opacity="0.55" />
      <circle cx="16" cy="16" r="13" opacity="0.25" />
    </svg>
  ),
  body_scan: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="7" r="3" />
      <path d="M16 10 L16 22 M11 14 L21 14 M11 22 L16 22 L21 22 M11 22 L11 28 M21 22 L21 28" />
    </svg>
  ),
};

export default function SomaticHub() {
  const navigate = useNavigate();
  return (
    <div className="tool-page ds2-themed">
      <ToolHeader
        title="ויסות בגוף"
        subtitle="תרגילים מהירים שמדברים ישירות לגוף — לפני שהראש מספיק להבין"
        backTo="/tools"
      />
      <main className="tool-content">
        <ul className="tools-list">
          {SOMATIC_EXERCISES.map((ex) => (
            <li key={ex.id}>
              <button
                type="button"
                className="tools-card"
                onClick={() => navigate(`/tools/somatic/${ex.id}`)}
              >
                <span className="tools-card-icon" aria-hidden="true">{ICONS[ex.id]}</span>
                <span className="tools-card-text">
                  <span className="tools-card-title">{ex.title}</span>
                  <span className="tools-card-sub">{ex.subtitle}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="tools-history-link-wrap">
          <button type="button" className="link-btn tools-history-link" onClick={() => navigate('/tools/history')}>
            היסטוריה ←
          </button>
        </div>
      </main>
    </div>
  );
}
