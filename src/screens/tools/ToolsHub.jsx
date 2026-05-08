import { useNavigate } from 'react-router-dom';
import ToolHeader from '../toolbox/components/ToolHeader.jsx';

const ICONS = {
  triggers: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="16" r="3" />
      <circle cx="16" cy="16" r="8" />
      <circle cx="16" cy="16" r="13" opacity="0.4" />
    </svg>
  ),
  modeCheck: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11 L9 21" />
      <path d="M16 7 L16 25" />
      <path d="M23 13 L23 19" />
      <circle cx="9" cy="11" r="2" fill="currentColor" />
      <circle cx="16" cy="7" r="2" fill="currentColor" />
      <circle cx="23" cy="13" r="2" fill="currentColor" />
    </svg>
  ),
  catastrophe: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="16" r="12" />
      <path d="M11 14 Q 13 16 11 18" />
      <path d="M21 14 Q 19 16 21 18" />
      <path d="M11 23 Q 16 20 21 23" />
    </svg>
  ),
  somatic: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="16" r="3" fill="currentColor" />
      <circle cx="16" cy="16" r="8" opacity="0.55" />
      <circle cx="16" cy="16" r="13" opacity="0.25" />
    </svg>
  ),
};

const TOOLS = [
  { id: 'triggers', icon: 'triggers', title: 'מאתר טריגרים', subtitle: 'מה הפעיל אותך עכשיו, ומה זה אומר', route: '/tools/triggers' },
  { id: 'mode-check', icon: 'modeCheck', title: 'מצב סכמה עכשיו', subtitle: 'איזה מוד מדבר ברגע הזה', route: '/tools/mode-check' },
  { id: 'catastrophe', icon: 'catastrophe', title: 'בדיקת מציאות', subtitle: 'האם הקטסטרופה שאתה רואה אמיתית?', route: '/tools/catastrophe' },
  { id: 'somatic', icon: 'somatic', title: 'ויסות בגוף', subtitle: '5 תרגילים מהירים שמדברים ישירות לגוף', route: '/tools/somatic' },
];

export default function ToolsHub() {
  const navigate = useNavigate();
  return (
    <div className="tool-page ds2-themed">
      <ToolHeader
        title="כלים פנימיים"
        subtitle="כלים שאתה מפעיל ברגע אמת — לזיהוי, עצירה, ובחינה מחדש"
        backTo="/"
      />
      <main className="tool-content">
        <ul className="tools-list">
          {TOOLS.map((t) => (
            <li key={t.id}>
              <button type="button" className="tools-card" onClick={() => navigate(t.route)}>
                <span className="tools-card-icon" aria-hidden="true">{ICONS[t.icon]}</span>
                <span className="tools-card-text">
                  <span className="tools-card-title">{t.title}</span>
                  <span className="tools-card-sub">{t.subtitle}</span>
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
