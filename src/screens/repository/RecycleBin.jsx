import { useEffect, useState } from 'react';
import ToolHeader from '../toolbox/components/ToolHeader.jsx';
import SoftButton from '../emergency/components/SoftButton.jsx';
import { Loading } from '../../components/ui/Loading.jsx';
import {
  listDeletedAnalyses,
  restoreAnalysis,
  purgeAnalysis,
} from '../../utils/analysisStorage.js';
import {
  listDeletedMoodCheckins,
  restoreCheckinEntry,
  purgeCheckinEntry,
} from '../../utils/checkinStorage.js';
import { ANALYSIS_TYPES } from '../../data/analysisSchemas.js';
import { VALENCE_LABELS, emotionLabelById } from '../../data/emotionsCorpus.js';
import { SOFT_DELETE_PURGE_DAYS, SOFT_DELETE_PURGE_MS } from '../../utils/softDelete.js';
import { formatHebrewDate, formatTimeOfDay } from '../../utils/dateHelpers.js';

function daysRemaining(deletedAt) {
  if (typeof deletedAt !== 'number') return SOFT_DELETE_PURGE_DAYS;
  const ms = SOFT_DELETE_PURGE_MS - (Date.now() - deletedAt);
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

function deletedRelative(deletedAt) {
  if (typeof deletedAt !== 'number') return '—';
  const diffMs = Date.now() - deletedAt;
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return 'נמחק היום';
  if (diffDays === 1) return 'נמחק אתמול';
  return `נמחק לפני ${diffDays} ימים`;
}

function moodLabel(entry) {
  const valence = VALENCE_LABELS[entry.valence] || '';
  const date = entry._date ? formatHebrewDate(entry._date) : '';
  const time = entry._ts ? formatTimeOfDay(new Date(entry._ts)) : '';
  const head = [date, time].filter(Boolean).join(', ');
  const tail = valence;
  return head ? `${head} · ${tail}` : tail || 'צ׳ק־אין רגשי';
}

function moodSubline(entry) {
  if (!Array.isArray(entry.emotions) || !entry.emotions.length) return '';
  return entry.emotions.slice(0, 4).map(emotionLabelById).join(', ');
}

export default function RecycleBin() {
  const [analyses, setAnalyses] = useState(null);
  const [moods, setMoods] = useState(null);
  const [busyKey, setBusyKey] = useState(null);
  const [confirmPurge, setConfirmPurge] = useState(null);

  const reload = () => {
    Promise.all([listDeletedAnalyses(), listDeletedMoodCheckins()]).then(([a, m]) => {
      setAnalyses(a || []);
      setMoods(m || []);
    });
  };

  useEffect(() => {
    reload();
  }, []);

  const ready = analyses !== null && moods !== null;
  const merged = ready
    ? [
        ...analyses.map((a) => ({ ...a, _kind: 'analysis' })),
        ...moods.map((m) => ({ ...m, _kind: 'mood' })),
      ].sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0))
    : null;
  const totalCount = merged?.length ?? 0;

  const onRestore = async (item) => {
    const key = keyFor(item);
    if (busyKey) return;
    setBusyKey(key);
    try {
      if (item._kind === 'analysis') await restoreAnalysis(item._id);
      else if (item._kind === 'mood') await restoreCheckinEntry(item._date, item._ts);
    } finally {
      setBusyKey(null);
      reload();
    }
  };

  const onPurge = async (item) => {
    const key = keyFor(item);
    setBusyKey(key);
    try {
      if (item._kind === 'analysis') await purgeAnalysis(item._id);
      else if (item._kind === 'mood') await purgeCheckinEntry(item._date, item._ts);
    } finally {
      setBusyKey(null);
      setConfirmPurge(null);
      reload();
    }
  };

  const subtitle = !ready
    ? 'טוען…'
    : totalCount === 0
      ? 'אין פריטים שנמחקו'
      : `${totalCount} פריטים · נמחקים לצמיתות אחרי ${SOFT_DELETE_PURGE_DAYS} ימים`;

  return (
    <div className="tool-page ds2-themed">
      <ToolHeader title="סל מחזור" subtitle={subtitle} backTo="/repository" />
      <main className="tool-content recycle-bin">
        {!ready && <Loading />}
        {ready && totalCount === 0 && (
          <div className="repo-empty">
            <p className="ck-empty">סל המחזור ריק. כל מה שתמחק יישמר כאן ל־{SOFT_DELETE_PURGE_DAYS} ימים.</p>
          </div>
        )}
        {ready && totalCount > 0 && (
          <ul className="recycle-list">
            {merged.map((item) => {
              const key = keyFor(item);
              const isConfirming = confirmPurge === key;
              const busy = busyKey === key;
              return (
                <li key={key} className="recycle-row">
                  <div className="recycle-row-head">
                    <ItemLabel item={item} />
                    <p className="recycle-row-meta">
                      {deletedRelative(item.deletedAt)} · נשארו {daysRemaining(item.deletedAt)} ימים
                    </p>
                  </div>
                  <ItemSubline item={item} />
                  <div className="recycle-row-actions">
                    {!isConfirming && (
                      <>
                        <SoftButton
                          variant="secondary"
                          onClick={() => onRestore(item)}
                          disabled={busy}
                        >
                          {busy ? 'משחזר…' : 'שחזר'}
                        </SoftButton>
                        <button
                          type="button"
                          className="link-btn link-danger"
                          onClick={() => setConfirmPurge(key)}
                          disabled={busy}
                        >
                          מחק לצמיתות
                        </button>
                      </>
                    )}
                    {isConfirming && (
                      <div className="recycle-confirm" role="alertdialog">
                        <span>למחוק לצמיתות? לא יהיה ניתן לשחזר.</span>
                        <SoftButton onClick={() => onPurge(item)} disabled={busy} className="is-destructive">
                          {busy ? 'מוחק…' : 'כן, מחק'}
                        </SoftButton>
                        <button
                          type="button"
                          className="link-btn"
                          onClick={() => setConfirmPurge(null)}
                          disabled={busy}
                        >
                          ביטול
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}

function keyFor(item) {
  if (item._kind === 'mood') return `mood-${item._date}-${item._ts}`;
  return `analysis-${item._id}`;
}

function ItemLabel({ item }) {
  if (item._kind === 'mood') {
    return <h3 className="recycle-row-title">{moodLabel(item)}</h3>;
  }
  const meta = ANALYSIS_TYPES[item.type];
  return (
    <div className="recycle-row-title-wrap">
      {meta && (
        <span className="type-chip type-chip-sm" style={{ background: meta.color, color: '#fff' }}>
          <span aria-hidden="true">{meta.icon}</span>
          {meta.label}
        </span>
      )}
      <h3 className="recycle-row-title">{item.title || 'ללא כותרת'}</h3>
    </div>
  );
}

function ItemSubline({ item }) {
  if (item._kind === 'mood') {
    const sub = moodSubline(item);
    return sub ? <p className="recycle-row-summary">{sub}</p> : null;
  }
  return item.summary ? <p className="recycle-row-summary">{item.summary}</p> : null;
}
