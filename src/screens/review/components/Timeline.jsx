import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { aggregateTimeline } from '../../../utils/timelineAggregator.js';
import { deleteEmergencySession, restoreEmergencySession } from '../../../utils/emergencyLog.js';
import { deleteToolEntry, restoreToolEntry } from '../../../utils/toolsStorage.js';
import { deleteCheckinEntry, restoreCheckinEntry } from '../../../utils/checkinStorage.js';
import { deleteAnalysis, restoreAnalysis } from '../../../utils/analysisStorage.js';
import UndoToast from '../../../components/ui/UndoToast.jsx';
import { formatHebrewDate, relativeDay, formatTimeOfDay, getIsraelDateString } from '../../../utils/dateHelpers.js';
import { emotionLabelById, VALENCE_LABELS, VALENCE_COLORS } from '../../../data/emotionsCorpus.js';
import { factorLabelById } from '../../../data/lifeFactors.js';
import { getModeById } from '../../../data/modes.js';
import { dominantSchemas } from '../../../data/schemas.js';
import { distortionLabel, sensationLabel } from '../../../data/distortions.js';
import { typeMeta } from '../../../data/analysisSchemas.js';

const KIND_LABEL = {
  emergency: 'עכשיו קשה לי',
  mood: 'צ׳ק־אין רגשי',
  trigger: 'מאתר טריגרים',
  mode_check: 'מצב סכמה',
  catastrophe: 'בדיקת מציאות',
  somatic: 'תרגיל גוף',
  analysis: 'ניתוח',
};

const KIND_FILTERS = [
  { id: 'emergency', label: 'עכשיו קשה לי' },
  { id: 'checkin', label: 'צ׳ק־אין' },
  { id: 'tools', label: 'כלים פנימיים' },
  { id: 'analysis', label: 'ניתוחים' },
];

const KIND_TO_GROUP = {
  emergency: 'emergency',
  mood: 'checkin',
  trigger: 'tools',
  mode_check: 'tools',
  catastrophe: 'tools',
  somatic: 'tools',
  analysis: 'analysis',
};

const SCOPE_LABEL = {
  moment: 'כרגע',
  day: 'כללי',
};

const ACTIVATION_LABEL = {
  hyper: 'הופעלתי',
  hypo: 'מרוקן',
  mid: 'על הסף',
};

const schemaName = (id) => {
  if (id?.startsWith?.('other:')) return id.slice(6);
  return dominantSchemas.find((s) => s.id === id)?.name ?? id;
};
const modeLabelOf = (id) => getModeById(id)?.label ?? id;

export default function Timeline({ scope }) {
  const [items, setItems] = useState(null);
  const [filters, setFilters] = useState(new Set(KIND_FILTERS.map((f) => f.id)));
  const [openKey, setOpenKey] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [undoInfo, setUndoInfo] = useState(null);

  const load = () => {
    setItems(null);
    aggregateTimeline(scope).then(setItems);
  };

  useEffect(() => {
    load();
  }, [scope]);

  const toggleFilter = (id) => {
    const next = new Set(filters);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setFilters(next);
  };

  const visible = useMemo(() => {
    if (!items) return null;
    return items.filter((it) => filters.has(KIND_TO_GROUP[it.kind]));
  }, [items, filters]);

  const onDelete = async (item) => {
    setDeleting(true);
    let res = null;
    try {
      if (item.kind === 'emergency') res = await deleteEmergencySession(item.ts);
      else if (item.kind === 'mood') res = await deleteCheckinEntry(item.refDate, item.refTs);
      else if (item.kind === 'trigger') res = await deleteToolEntry('triggers', item.ts);
      else if (item.kind === 'mode_check') res = await deleteToolEntry('mode_checks', item.ts);
      else if (item.kind === 'catastrophe') res = await deleteToolEntry('catastrophe_checks', item.ts);
      else if (item.kind === 'somatic') res = await deleteToolEntry('somatic_sessions', item.ts);
      else if (item.kind === 'analysis') res = await deleteAnalysis(item.refId);
    } finally {
      setPendingDelete(null);
      setDeleting(false);
      load();
      if (res?.restorable) {
        setUndoInfo({ kind: item.kind, ts: item.ts, refDate: item.refDate, refTs: item.refTs, refId: item.refId, label: KIND_LABEL[item.kind] });
      }
    }
  };

  const onUndo = async () => {
    if (!undoInfo) return;
    const { kind } = undoInfo;
    if (kind === 'emergency') await restoreEmergencySession(undoInfo.ts);
    else if (kind === 'mood') await restoreCheckinEntry(undoInfo.refDate, undoInfo.refTs);
    else if (kind === 'trigger') await restoreToolEntry('triggers', undoInfo.ts);
    else if (kind === 'mode_check') await restoreToolEntry('mode_checks', undoInfo.ts);
    else if (kind === 'catastrophe') await restoreToolEntry('catastrophe_checks', undoInfo.ts);
    else if (kind === 'somatic') await restoreToolEntry('somatic_sessions', undoInfo.ts);
    else if (kind === 'analysis') await restoreAnalysis(undoInfo.refId);
    load();
  };

  if (items === null) {
    return (
      <section className="review-section timeline-section">
        <h3 className="review-section-title">יומן</h3>
        <p className="ck-empty">טוען…</p>
      </section>
    );
  }

  return (
    <section className="review-section timeline-section">
      <h3 className="review-section-title">יומן</h3>
      <p className="review-section-sub">
        כל מה שעשית ומילאת בטווח הזה. נשמר עד שתמחק.
      </p>

      <div className="filter-row">
        {KIND_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`pace-pill ${filters.has(f.id) ? 'is-active' : ''}`}
            onClick={() => toggleFilter(f.id)}
            aria-pressed={filters.has(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="ck-empty">לא נמצאו רשומות בטווח הנבחר.</p>
      )}

      {undoInfo && (
        <UndoToast
          message={`נמחק: ${undoInfo.label}`}
          onUndo={onUndo}
          onDismiss={() => setUndoInfo(null)}
        />
      )}

      {visible.length > 0 && (
        <ul className="history-list">
          {visible.map((item) => {
            const key = itemKey(item);
            const isOpen = openKey === key;
            return (
              <li key={key} className={`history-row ${isOpen ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="history-row-toggle"
                  onClick={() => setOpenKey(isOpen ? null : key)}
                  aria-expanded={isOpen}
                >
                  <RowTop kind={item.kind} ts={item.ts} />
                  <p className="history-summary">{summaryFor(item)}</p>
                </button>
                <div className="history-detail-wrap">
                  <div className="history-detail">
                    <DetailFor item={item} />
                    <div className="timeline-actions">
                      {pendingDelete === key ? (
                        <div className="timeline-confirm" role="alertdialog">
                          <span>למחוק את הרשומה הזו?</span>
                          <button
                            type="button"
                            className="link-btn timeline-confirm-yes"
                            onClick={() => onDelete(item)}
                            disabled={deleting}
                          >
                            {deleting ? 'מוחק…' : 'כן, מחק'}
                          </button>
                          <button
                            type="button"
                            className="link-btn"
                            onClick={() => setPendingDelete(null)}
                            disabled={deleting}
                          >
                            ביטול
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="link-btn timeline-delete"
                          onClick={() => setPendingDelete(key)}
                        >
                          מחק רשומה
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function itemKey(item) {
  if (item.kind === 'mood') return `mood-${item.refDate}-${item.refTs}`;
  if (item.kind === 'analysis') return `analysis-${item.refId}`;
  return `${item.kind}-${item.ts}`;
}

function RowTop({ kind, ts }) {
  const date = new Date(ts);
  const dateString = getIsraelDateString(date);
  const rel = relativeDay(dateString);
  const time = formatTimeOfDay(date);
  const fullDate = formatHebrewDate(dateString);
  const dateLabel = rel === fullDate ? `${fullDate}, ${time}` : `${rel}, ${time}`;
  return (
    <div className="history-row-top">
      <span className="history-cat">{KIND_LABEL[kind]}</span>
      <span className="history-date">{dateLabel}</span>
    </div>
  );
}

function summaryFor(item) {
  const { kind, data } = item;
  if (kind === 'emergency') {
    const parts = [];
    if (data.activation) parts.push(ACTIVATION_LABEL[data.activation] || data.activation);
    if (typeof data.closingScore === 'number') parts.push(`סוף: ${data.closingScore}/10`);
    return parts.join(' · ') || 'סשן עכשיו קשה לי';
  }
  if (kind === 'mood') {
    const valenceLabel = VALENCE_LABELS[data.valence] || '';
    const scopeLabel = SCOPE_LABEL[data.scope] || '';
    const parts = [scopeLabel, valenceLabel].filter(Boolean);
    if (Array.isArray(data.emotions) && data.emotions.length) {
      parts.push(data.emotions.slice(0, 3).map(emotionLabelById).join(', '));
    }
    if (Array.isArray(data.factors) && data.factors.length) {
      parts.push(data.factors.slice(0, 2).map(factorLabelById).join(', '));
    }
    return parts.join(' · ') || 'רישום';
  }
  if (kind === 'trigger') return data.event || 'טריגר';
  if (kind === 'mode_check') {
    return (data.modesActive || []).map(modeLabelOf).join(', ') || 'מצב';
  }
  if (kind === 'catastrophe') return data.thought || 'מחשבה';
  if (kind === 'somatic') {
    const parts = [data.exerciseTitle || 'תרגיל גוף'];
    if (typeof data.afterScore === 'number') parts.push(`${data.afterScore}/10`);
    return parts.join(' · ');
  }
  if (kind === 'analysis') return data.title || data.summary || typeMeta(data.type)?.label || 'ניתוח';
  return '';
}

function DetailFor({ item }) {
  const { kind, data } = item;
  if (kind === 'emergency') return <EmergencyDetail data={data} />;
  if (kind === 'mood') return <MoodDetail data={data} />;
  if (kind === 'trigger') return <TriggerDetail data={data} />;
  if (kind === 'mode_check') return <ModeCheckDetail data={data} />;
  if (kind === 'catastrophe') return <CatastropheDetail data={data} />;
  if (kind === 'somatic') return <SomaticDetail data={data} />;
  if (kind === 'analysis') return <AnalysisDetail item={item} />;
  return null;
}

function SomaticDetail({ data }) {
  const minutes = data.durationSec ? Math.max(1, Math.round(data.durationSec / 60)) : null;
  return (
    <section className="day-detail-section">
      {data.exerciseTitle && <p><strong>תרגיל:</strong> {data.exerciseTitle}</p>}
      {data.variant && <p><strong>וריאנט:</strong> {data.variant}</p>}
      {typeof data.afterScore === 'number' && (
        <p><strong>אחרי:</strong> {data.afterScore} / 10</p>
      )}
      {minutes && <p><strong>משך:</strong> {minutes} דק׳</p>}
    </section>
  );
}

function EmergencyDetail({ data }) {
  const minutes = data.durationSeconds ? Math.max(1, Math.round(data.durationSeconds / 60)) : null;
  return (
    <section className="day-detail-section">
      {data.activation && (
        <p><strong>איפה הייתי:</strong> {ACTIVATION_LABEL[data.activation] || data.activation}</p>
      )}
      {Array.isArray(data.modesIdentified) && data.modesIdentified.length > 0 && (
        <p><strong>מודים שזוהו:</strong> {data.modesIdentified.map(modeLabelOf).join(', ')}</p>
      )}
      {data.breathingNote && <p><strong>בנשימה עלה:</strong> {data.breathingNote}</p>}
      {typeof data.closingScore === 'number' && (
        <p><strong>סוף סשן:</strong> {data.closingScore} / 10</p>
      )}
      {data.note && <p><strong>הערה:</strong> {data.note}</p>}
      {minutes && <p><strong>משך:</strong> {minutes} דק׳</p>}
    </section>
  );
}

function MoodDetail({ data }) {
  const color = VALENCE_COLORS[data.valence];
  return (
    <section className="day-detail-section">
      {data.scope && (
        <p><strong>על מה:</strong> {SCOPE_LABEL[data.scope] || data.scope}</p>
      )}
      {data.valence != null && (
        <p>
          <strong>תחושה:</strong>{' '}
          <span style={{ color }}>{VALENCE_LABELS[data.valence] || data.valence}</span>
        </p>
      )}
      {Array.isArray(data.emotions) && data.emotions.length > 0 && (
        <p><strong>רגשות:</strong> {data.emotions.map((id) => emotionLabelById(id)).join(', ')}</p>
      )}
      {Array.isArray(data.factors) && data.factors.length > 0 && (
        <p><strong>השפיע:</strong> {data.factors.map((id) => factorLabelById(id)).join(', ')}</p>
      )}
    </section>
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
        <p><strong>מודים:</strong> {data.modesActive.map(modeLabelOf).join(', ')}</p>
      )}
      {data.note && <p><strong>תיאור:</strong> {data.note}</p>}
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

function AnalysisDetail({ item }) {
  const { data } = item;
  const meta = typeMeta(data.type);
  return (
    <section className="day-detail-section">
      {meta && <p><strong>סוג:</strong> {meta.label}</p>}
      {data.title && <p><strong>כותרת:</strong> {data.title}</p>}
      {data.summary && <p>{data.summary}</p>}
      <p>
        <Link to={`/repository/${data._id}`} className="link-btn">
          פתח ניתוח מלא →
        </Link>
      </p>
    </section>
  );
}
