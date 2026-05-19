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

// Pick the most meaningful insight string from the imported payload. The
// Claude project system for anticipatory_anxiety returns `core_insight`;
// others may use one of the conventional headline keys. Full text — no
// truncation — fits the "shut and chew on it" intent of the mirror card.
function bestInsight(importedResponse) {
  if (!importedResponse) return null;
  const p = importedResponse.payload;
  if (p && typeof p === 'object') {
    const candidates = [
      p.title,
      p.headline,
      p.summary,
      p.central_sentence,
      p.core_insight,
      p.insight,
    ].filter((v) => typeof v === 'string' && v.trim());
    if (candidates.length) return { kind: 'insight', text: candidates[0].trim() };
  }
  const raw = (importedResponse.rawText || '').trim();
  if (raw) {
    return { kind: 'raw', text: raw.slice(0, 140) + (raw.length > 140 ? '…' : '') };
  }
  return null;
}

function extractTags(importedResponse) {
  const p = importedResponse?.payload;
  if (!p || typeof p !== 'object') return [];
  const tags = [];
  const primary = p.modes_active?.primary;
  if (typeof primary === 'string' && primary.trim()) {
    tags.push({ label: 'מוד', value: primary.trim() });
  }
  if (Array.isArray(p.schemas_identified) && p.schemas_identified.length > 0) {
    const first = p.schemas_identified.find((s) => typeof s === 'string' && s.trim());
    if (first) tags.push({ label: 'סכמה', value: first.trim() });
  }
  return tags;
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
          const insight = bestInsight(s.importedResponse);
          const tags = extractTags(s.importedResponse);
          return (
            <li key={s.sessionId} className="cs-review-item">
              <button
                type="button"
                className="cs-review-item-btn cs-review-card"
                onClick={() => navigate(`/sessions/full/${s.sessionId}`)}
              >
                <div className="cs-review-item-head">
                  <span className="cs-history-type-tag">{getSessionTypeLabel(s.type)}</span>
                  <span className="cs-history-date">{formatDate(s.createdAt)}</span>
                </div>
                {insight && (
                  <p className={`cs-review-insight${insight.kind === 'raw' ? ' is-raw' : ''}`}>
                    {insight.text}
                  </p>
                )}
                {tags.length > 0 && (
                  <div className="cs-review-tags">
                    {tags.map((t, i) => (
                      <span key={i} className="cs-neutral-chip">
                        <span className="cs-neutral-chip-label">{t.label}:</span> {t.value}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
