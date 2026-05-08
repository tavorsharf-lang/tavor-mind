import { useEffect, useMemo, useState } from 'react';
import ToolHeader from '../toolbox/components/ToolHeader.jsx';
import { Loading } from '../../components/ui/Loading.jsx';
import { getToolHistory, TOOL_CATEGORIES } from '../../utils/toolsStorage.js';
import { formatHebrewDate, relativeDay, formatTimeOfDay, getIsraelDateString } from '../../utils/dateHelpers.js';
import { dominantSchemas } from '../../data/schemas.js';
import { getModeById } from '../../data/modes.js';
import { distortionLabel, sensationLabel } from '../../data/distortions.js';

const CATEGORY_LABEL = {
  triggers: 'מאתר טריגרים',
  mode_checks: 'מצב סכמה',
  catastrophe_checks: 'בדיקת מציאות',
  somatic_sessions: 'ויסות בגוף',
};

const CATEGORY_FILTER_LABEL = {
  triggers: 'טריגרים',
  mode_checks: 'מצבי סכמה',
  catastrophe_checks: 'בדיקות מציאות',
  somatic_sessions: 'ויסות בגוף',
};

const PAGE_SIZE = 30;

const schemaName = (id) => {
  if (id?.startsWith?.('other:')) return id.slice(6);
  return dominantSchemas.find((s) => s.id === id)?.name ?? id;
};
const modeLabel = (id) => getModeById(id)?.label ?? id;

export default function ToolHistory() {
  const [items, setItems] = useState(null);
  const [filters, setFilters] = useState(new Set(TOOL_CATEGORIES));
  const [openId, setOpenId] = useState(null);
  const [shown, setShown] = useState(PAGE_SIZE);

  useEffect(() => {
    getToolHistory().then((list) => setItems(list || []));
  }, []);

  const toggleFilter = (cat) => {
    const next = new Set(filters);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setFilters(next);
  };

  const visible = useMemo(() => {
    if (!items) return null;
    return items.filter((it) => filters.has(it.category));
  }, [items, filters]);

  return (
    <div className="tool-page ds2-themed">
      <ToolHeader title="היסטוריה — כלים פנימיים" backTo="/tools" />
      <main className="tool-content">
        <div className="filter-row">
          {TOOL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`pace-pill ${filters.has(cat) ? 'is-active' : ''}`}
              onClick={() => toggleFilter(cat)}
              aria-pressed={filters.has(cat)}
            >
              {CATEGORY_FILTER_LABEL[cat]}
            </button>
          ))}
        </div>

        {!items && <Loading />}
        {items && visible.length === 0 && (
          <p className="ck-empty">
            עוד אין היסטוריה. כל פעם שתשתמש בכלי, הוא יישמר כאן ויעזור לראות דפוסים.
          </p>
        )}
        {items && visible.length > 0 && (
          <>
            <ul className="history-list">
              {visible.slice(0, shown).map((it) => (
                <HistoryRow
                  key={`${it.category}-${it.ts}`}
                  item={it}
                  open={openId === `${it.category}-${it.ts}`}
                  onToggle={() =>
                    setOpenId(openId === `${it.category}-${it.ts}` ? null : `${it.category}-${it.ts}`)
                  }
                />
              ))}
            </ul>
            {visible.length > shown && (
              <button type="button" className="link-btn load-more" onClick={() => setShown(shown + PAGE_SIZE)}>
                טען עוד
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function HistoryRow({ item, open, onToggle }) {
  const date = new Date(item.ts);
  const dateString = getIsraelDateString(date);
  const rel = relativeDay(dateString);
  const time = formatTimeOfDay(date);
  const fullDate = formatHebrewDate(dateString);
  const dateLabel = rel === fullDate ? `${fullDate}, ${time}` : `${rel}, ${time}`;

  let summary = '';
  if (item.category === 'triggers') summary = item.event || 'טריגר';
  else if (item.category === 'mode_checks') summary = (item.modesActive || []).map(modeLabel).join(', ') || 'מצב';
  else if (item.category === 'catastrophe_checks') summary = item.thought || 'מחשבה';
  else if (item.category === 'somatic_sessions') {
    const variant = item.variant === 'short' ? 'קצר' : item.variant === 'long' ? 'ארוך' : '';
    summary = [item.exerciseTitle || 'תרגיל', variant].filter(Boolean).join(' · ');
  }

  return (
    <li className={`history-row ${open ? 'is-open' : ''}`}>
      <button type="button" className="history-row-toggle" onClick={onToggle} aria-expanded={open}>
        <div className="history-row-top">
          <span className="history-cat">{CATEGORY_LABEL[item.category]}</span>
          <span className="history-date">{dateLabel}</span>
          {item._pending && <span className="pending-chip">ממתין לסנכרון</span>}
        </div>
        <p className="history-summary">{summary}</p>
      </button>
      <div className="history-detail-wrap">
        <div className="history-detail">
          {item.category === 'triggers' && <TriggerDetail data={item} />}
          {item.category === 'mode_checks' && <ModeCheckDetail data={item} />}
          {item.category === 'catastrophe_checks' && <CatastropheDetail data={item} />}
          {item.category === 'somatic_sessions' && <SomaticDetail data={item} />}
        </div>
      </div>
    </li>
  );
}

function TriggerDetail({ data }) {
  return (
    <section className="day-detail-section">
      {data.event && <p><strong>אירוע:</strong> {data.event}</p>}
      {Array.isArray(data.bodySensations) && data.bodySensations.length > 0 && (
        <p><strong>גוף:</strong> {data.bodySensations.map(sensationLabel).join(', ')}</p>
      )}
      {Array.isArray(data.thoughts) && data.thoughts.length > 0 && (
        <div>
          <strong>קולות:</strong>
          <ul className="detail-list">
            {data.thoughts.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      )}
      {Array.isArray(data.distortions) && data.distortions.length > 0 && (
        <p><strong>עיוותי חשיבה:</strong> {data.distortions.map(distortionLabel).join(', ')}</p>
      )}
      {Array.isArray(data.schemasActivated) && data.schemasActivated.length > 0 && (
        <p><strong>סכמות:</strong> {data.schemasActivated.map(schemaName).join(', ')}</p>
      )}
      {data.healthyResponse && <p><strong>תגובה בריאה:</strong> {data.healthyResponse}</p>}
    </section>
  );
}

function ModeCheckDetail({ data }) {
  return (
    <section className="day-detail-section">
      {Array.isArray(data.modesActive) && data.modesActive.length > 0 && (
        <p>
          <strong>מודים:</strong>{' '}
          {data.modesActive.map((id, i) => {
            const mode = getModeById(id);
            return (
              <span key={i}>
                {i > 0 && ', '}
                {mode ? mode.label : <span className="legacy-mode-id">{id} (לא ידוע)</span>}
              </span>
            );
          })}
        </p>
      )}
      {data.note && <p><strong>תיאור:</strong> {data.note}</p>}
    </section>
  );
}

function SomaticDetail({ data }) {
  const variantLabel = data.variant === 'short' ? 'קצר' : data.variant === 'long' ? 'ארוך' : null;
  const durationLabel = data.durationSec ? `${Math.round(data.durationSec)} שניות` : null;
  return (
    <section className="day-detail-section">
      {data.exerciseTitle && <p><strong>תרגיל:</strong> {data.exerciseTitle}</p>}
      {variantLabel && <p><strong>גרסה:</strong> {variantLabel}</p>}
      {durationLabel && <p><strong>משך:</strong> {durationLabel}</p>}
      <p><strong>סיים:</strong> {data.completedFully ? 'עד הסוף' : 'עצר באמצע'}</p>
      {typeof data.afterScore === 'number' && (
        <p><strong>איך הרגשתי אחרי:</strong> {data.afterScore} מתוך 10</p>
      )}
      {data.context && <p className="history-context"><em>{data.context === 'emergency_prestep' ? 'נעשה במהלך סשן חירום' : data.context}</em></p>}
    </section>
  );
}

function CatastropheDetail({ data }) {
  return (
    <section className="day-detail-section">
      {data.thought && <p><strong>המחשבה:</strong> {data.thought}</p>}
      {data.evidenceFor && <p><strong>בעד:</strong> {data.evidenceFor}</p>}
      {data.evidenceAgainst && <p><strong>נגד:</strong> {data.evidenceAgainst}</p>}
      {data.worstCasePlan && <p><strong>תוכנית למקרה הגרוע:</strong> {data.worstCasePlan}</p>}
      {data.reframe && <p><strong>ניסוח מחדש:</strong> {data.reframe}</p>}
    </section>
  );
}
