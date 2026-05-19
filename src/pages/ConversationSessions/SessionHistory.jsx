import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ToolHeader from '../../screens/toolbox/components/ToolHeader.jsx';
import { Loading } from '../../components/ui/Loading.jsx';
import { listSessions } from '../../services/conversationSessionsService.js';
import { getSessionType } from '../../config/sessionTypes.js';
import SessionListItem from './components/SessionListItem.jsx';

export default function SessionHistory() {
  const { type } = useParams();
  const navigate = useNavigate();
  const def = getSessionType(type);
  const [items, setItems] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listSessions({ type }).then((list) => {
      if (!cancelled) setItems(list || []);
    });
    return () => { cancelled = true; };
  }, [type]);

  return (
    <div className="tool-page conversation-sessions-page ds2-themed">
      <ToolHeader
        title={def?.label || 'היסטוריה'}
        subtitle="כל הסשנים מהסוג הזה"
        backTo={`/sessions/${type}`}
      />
      <main className="tool-content">
        {!items && <Loading />}
        {items && items.length === 0 && <p className="cs-empty">אין עדיין סשנים מהסוג הזה.</p>}
        {items && items.length > 0 && (
          <ul className="cs-history-list">
            {items.map((s) => (
              <SessionListItem
                key={s.sessionId}
                session={s}
                showType={false}
                onClick={() => navigate(`/sessions/${s.type}/result/${s.sessionId}`)}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
