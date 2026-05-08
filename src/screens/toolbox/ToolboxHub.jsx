import { useNavigate } from 'react-router-dom';
import ToolHeader from './components/ToolHeader.jsx';

const ICONS = {
  schemas: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="9" cy="12" r="6" />
      <circle cx="15" cy="12" r="6" />
    </svg>
  ),
  attachment: (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="12" r="5" fill="currentColor" />
      <circle cx="15" cy="12" r="5" fill="none" />
    </svg>
  ),
  modes: (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
      <line x1="4" y1="5" x2="14" y2="5" />
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="13" x2="11" y2="13" />
      <line x1="4" y1="17" x2="17" y2="17" />
      <line x1="4" y1="21" x2="9" y2="21" />
    </svg>
  ),
  letter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="13" rx="1" />
      <path d="M3 8 L12 14 L21 8" />
    </svg>
  ),
};

const TOOLS = [
  { id: 'schemas',    title: 'פרופיל הסכמות',     subtitle: '4 הדפוסים שהכי משפיעים עליך',     route: '/toolbox/schemas' },
  { id: 'attachment', title: 'פרופיל ההיקשרות',   subtitle: '"החזק החרד" — איך אתה בקשרים',     route: '/toolbox/attachment' },
  { id: 'modes',      title: '5 הקולות שלך',       subtitle: 'הילד שבמרכז, המגנים סביבו, המבוגר הבריא רואה הכל', route: '/toolbox/modes' },
  { id: 'letter',     title: 'מכתב מעצמך השלם',    subtitle: 'להזכיר לעצמך מה כבר יש',    route: '/toolbox/letter' },
];

export default function ToolboxHub() {
  const navigate = useNavigate();
  return (
    <div className="toolbox-hub ds2-themed">
      <ToolHeader
        title="הפרופיל שלי"
        subtitle="הידע שצברת על עצמך, מרוכז במקום אחד"
        backTo="/"
      />
      <main className="hub-main">
        <ul className="hub-list">
          {TOOLS.map((t) => (
            <li key={t.id}>
              <button type="button" className="hub-card" onClick={() => navigate(t.route)}>
                <span className="hub-card-icon" aria-hidden="true">{ICONS[t.id]}</span>
                <span className="hub-card-text">
                  <span className="hub-card-title">{t.title}</span>
                  <span className="hub-card-sub">{t.subtitle}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="hub-footnote">כל מה שכאן — אתה כתבת. זה לא תבנית.</p>
      </main>
    </div>
  );
}
