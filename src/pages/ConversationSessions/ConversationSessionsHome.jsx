import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ToolHeader from '../../screens/toolbox/components/ToolHeader.jsx';
import { Loading } from '../../components/ui/Loading.jsx';
import { listSessionTypes } from '../../config/sessionTypes.js';
import { countSessionsByTypeLast30Days } from '../../services/conversationSessionsService.js';

export default function ConversationSessionsHome() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    let cancelled = false;
    countSessionsByTypeLast30Days().then((c) => {
      if (!cancelled) setCounts(c || {});
    });
    return () => { cancelled = true; };
  }, []);

  const types = listSessionTypes();
  const ordered = (() => {
    if (!counts) return null;
    return types
      .map((t) => ({ ...t, _count: counts[t.id] || 0 }))
      .sort((a, b) => {
        if (b._count !== a._count) return b._count - a._count;
        return a.label.localeCompare(b.label, 'he');
      });
  })();

  return (
    <div className="tool-page conversation-sessions-page ds2-themed">
      <ToolHeader
        title="שיחות מובנות"
        subtitle="סשנים מודרכים לאיסוף הקשר ועיבוד עם קלוד"
        backTo="/"
      />
      <div className="cs-toolbar">
        <button
          type="button"
          className="link-btn"
          onClick={() => navigate('/sessions/history')}
        >
          כל ההיסטוריה ←
        </button>
      </div>
      <main className="tool-content">
        {!ordered && <Loading />}
        {ordered && (
          <div className="cs-type-grid">
            {ordered.map((t) => (
              <button
                type="button"
                key={t.id}
                className="cs-type-card"
                onClick={() => navigate(`/sessions/${t.id}`)}
              >
                <div className="cs-type-card-head">
                  <span className="cs-type-icon" aria-hidden="true">{t.icon || '·'}</span>
                  {t._count > 0 && <span className="cs-type-count">{t._count}</span>}
                </div>
                <div className="cs-type-label">{t.label}</div>
                {t.description && <div className="cs-type-desc">{t.description}</div>}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
