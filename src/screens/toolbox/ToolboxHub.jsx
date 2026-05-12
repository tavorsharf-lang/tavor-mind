import { useNavigate } from 'react-router-dom';
import ToolHeader from './components/ToolHeader.jsx';
import { SelfLetterIcon } from '../../components/icons/index.jsx';
import {
  PhaseDistortion,
  TriggerRelational,
  SchemaHealthyAdult,
} from '../../components/icons/system.jsx';

const TOOLS = [
  { id: 'schemas',    icon: <PhaseDistortion />,    tone: 'self',   title: 'פרופיל הסכמות',   subtitle: '4 הדפוסים שהכי משפיעים עליך',     route: '/toolbox/schemas' },
  { id: 'attachment', icon: <TriggerRelational />,  tone: 'self',   title: 'פרופיל ההיקשרות', subtitle: '"החזק החרד" — איך אתה בקשרים',     route: '/toolbox/attachment' },
  { id: 'modes',      icon: <SchemaHealthyAdult />, tone: 'self',   title: '5 הקולות שלך',     subtitle: 'הילד שבמרכז, המגנים סביבו, המבוגר הבריא רואה הכל', route: '/toolbox/modes' },
  { id: 'letter',     icon: <SelfLetterIcon />,     tone: 'warmth', title: 'מכתב מעצמך השלם',  subtitle: 'להזכיר לעצמך מה כבר יש',           route: '/toolbox/letter' },
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
                <span className={`hub-card-icon icon-tone-${t.tone}`} aria-hidden="true">{t.icon}</span>
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
