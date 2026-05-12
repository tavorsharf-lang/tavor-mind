import { useNavigate } from 'react-router-dom';
import ToolHeader from '../toolbox/components/ToolHeader.jsx';
import { MindfulnessIcon } from '../../components/icons/index.jsx';
import {
  PhaseTriggers,
  SchemaHealthyAdult,
  PhaseDistortion,
  PhaseSomatic,
} from '../../components/icons/system.jsx';

const TOOLS = [
  { id: 'triggers',     icon: <PhaseTriggers />,      tone: 'crisis',  title: 'מאתר טריגרים',   subtitle: 'מה הפעיל אותך עכשיו, ומה זה אומר',           route: '/tools/triggers' },
  { id: 'mode-check',   icon: <SchemaHealthyAdult />, tone: 'self',    title: 'מצב סכמה עכשיו', subtitle: 'איזה מוד מדבר ברגע הזה',                       route: '/tools/mode-check' },
  { id: 'catastrophe',  icon: <PhaseDistortion />,    tone: 'calm',    title: 'בדיקת מציאות',   subtitle: 'האם הקטסטרופה שאתה רואה אמיתית?',              route: '/tools/catastrophe' },
  { id: 'somatic',      icon: <PhaseSomatic />,       tone: 'body',    title: 'ויסות בגוף',     subtitle: '5 תרגילים מהירים שמדברים ישירות לגוף',         route: '/tools/somatic' },
  { id: 'mindfulness',  icon: <MindfulnessIcon />,    tone: 'reflect', title: 'מיינדפולנס',     subtitle: 'הקלטות מדיטציה',                                route: '/mindfulness' },
];

export default function ToolsHub() {
  const navigate = useNavigate();
  return (
    <div className="tool-page ds2-themed">
      <ToolHeader
        title="כלים"
        subtitle="כלים שאתה מפעיל ברגע אמת — לזיהוי, עצירה, ובחינה מחדש"
        backTo="/"
      />
      <main className="tool-content">
        <ul className="tools-list">
          {TOOLS.map((t) => (
            <li key={t.id}>
              <button type="button" className="tools-card" onClick={() => navigate(t.route)}>
                <span className={`tools-card-icon icon-tone-${t.tone}`} aria-hidden="true">{t.icon}</span>
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
