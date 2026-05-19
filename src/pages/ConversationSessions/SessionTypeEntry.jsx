import { useNavigate, useParams } from 'react-router-dom';
import ToolHeader from '../../screens/toolbox/components/ToolHeader.jsx';
import { getSessionType } from '../../config/sessionTypes.js';

export default function SessionTypeEntry() {
  const { type } = useParams();
  const navigate = useNavigate();
  const def = getSessionType(type);

  if (!def) {
    return (
      <div className="tool-page ds2-themed">
        <ToolHeader title="לא נמצא" subtitle="סוג הסשן לא קיים" backTo="/sessions" />
        <main className="tool-content">
          <p>הסוג "{type}" אינו ידוע.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="tool-page conversation-sessions-page ds2-themed">
      <ToolHeader title={def.label} subtitle={def.description || ''} backTo="/sessions" />
      <main className="tool-content">
        <div className="cs-entry-actions">
          <button
            type="button"
            className="cs-btn cs-btn-primary cs-btn-block"
            onClick={() => navigate(`/sessions/${type}/new`)}
          >
            התחל סשן חדש
          </button>
          <button
            type="button"
            className="cs-btn cs-btn-ghost cs-btn-block"
            onClick={() => navigate(`/sessions/${type}/history`)}
          >
            היסטוריה של הסוג הזה
          </button>
        </div>
      </main>
    </div>
  );
}
