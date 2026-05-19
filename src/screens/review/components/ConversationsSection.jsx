import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listSessions } from '../../../services/conversationSessionsService.js';
import { getSessionTypeLabel } from '../../../config/sessionTypes.js';

const SCOPE_DAYS = { week: 7, month: 30, '90d': 90 };
const DAY_MS = 24 * 60 * 60 * 1000;

function formatDate(ms) {
  if (!ms) return '';
  try {
    return new Date(ms).toLocaleString('he-IL', {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function summarizeImported(importedResponse) {
  if (!importedResponse) return null;
  const p = importedResponse.payload;
  if (p && typeof p === 'object') {
    // Prefer a few common headline-style keys; never assume a deep schema.
    const candidates = [
      p.title,
      p.headline,
      p.summary,
      p.central_sentence,
      p.core_insight,
      p.insight,
    ].filter((v) => typeof v === 'string' && v.trim());
    if (candidates.length) return candidates[0].trim().slice(0, 140);
  }
  const raw = (importedResponse.rawText || '').trim();
  if (raw) return raw.slice(0, 140) + (raw.length > 140 ? '…' : '');
  return null;
}

export default function ConversationsSection({ scope = 'week' }) {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listSessions().then((list) => {
      if (cancelled) return;
      const days = SCOPE_DAYS[scope] || SCOPE_DAYS.week;
      const cutoff = Date.now() - days * DAY_MS;
      const filtered = (list || [])
        .filter((s) => s?.importedResponse && (s.createdAt || 0) >= cutoff)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setItems(filtered);
    });
    return () => { cancelled = true; };
  }, [scope]);

  if (!items || items.length === 0) return null;

  return (
    <section className="review-section conversations-section">
      <header className="review-section-header">
        <h3 className="review-section-title">שיחות שניהלת</h3>
        <p className="review-section-sub">סשנים מובנים עם תגובה שיובאה</p>
      </header>
      <ul className="cs-review-list">
        {items.map((s) => {
          const summary = summarizeImported(s.importedResponse);
          return (
            <li key={s.sessionId} className="cs-review-item">
              <button
                type="button"
                className="cs-review-item-btn"
                onClick={() => navigate(`/sessions/${s.type}/result/${s.sessionId}`)}
              >
                <div className="cs-review-item-head">
                  <span className="cs-history-type-tag">{getSessionTypeLabel(s.type)}</span>
                  <span className="cs-history-date">{formatDate(s.createdAt)}</span>
                </div>
                {summary && <p className="cs-review-item-summary">{summary}</p>}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
