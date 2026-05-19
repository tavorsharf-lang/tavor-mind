import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ToolHeader from '../../screens/toolbox/components/ToolHeader.jsx';
import { Loading } from '../../components/ui/Loading.jsx';
import { listSessions } from '../../services/conversationSessionsService.js';
import { listSessionTypes } from '../../config/sessionTypes.js';
import SessionListItem from './components/SessionListItem.jsx';

export default function UnifiedHistory() {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    let cancelled = false;
    listSessions().then((list) => {
      if (!cancelled) setItems(list || []);
    });
    return () => { cancelled = true; };
  }, []);

  const allTypes = listSessionTypes();

  const visible = useMemo(() => {
    if (!items) return null;
    if (!typeFilter) return items;
    return items.filter((s) => s.type === typeFilter);
  }, [items, typeFilter]);

  return (
    <div className="tool-page conversation-sessions-page ds2-themed">
      <ToolHeader
        title="היסטוריית שיחות"
        subtitle="כל הסשנים, מכל הסוגים"
        backTo="/sessions"
      />
      <div className="cs-toolbar">
        <label className="cs-filter-label" htmlFor="cs-type-filter">סוג:</label>
        <select
          id="cs-type-filter"
          className="cs-filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">הכל</option>
          {allTypes.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>
      <main className="tool-content">
        {!visible && <Loading />}
        {visible && visible.length === 0 && <p className="cs-empty">אין סשנים להצגה.</p>}
        {visible && visible.length > 0 && (
          <ul className="cs-history-list">
            {visible.map((s) => (
              <SessionListItem
                key={s.sessionId}
                session={s}
                showType={true}
                onClick={() => navigate(`/sessions/${s.type}/result/${s.sessionId}`)}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
