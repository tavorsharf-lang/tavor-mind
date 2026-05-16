import { useState, useCallback } from 'react';
import { Modal } from './Modal.jsx';
import {
  getStuckItems,
  clearAttemptsForRetry,
  discardStuckItem,
} from '../../utils/syncQueue.js';
import { flushPendingSessions } from '../../utils/emergencyLog.js';
import { flushPendingCheckins } from '../../utils/checkinStorage.js';
import { flushPendingAnalyses } from '../../utils/analysisStorage.js';

const FLUSH_BY_TYPE = {
  sessions: flushPendingSessions,
  checkins: flushPendingCheckins,
  analyses: flushPendingAnalyses,
};

function formatRelative(ts) {
  if (!ts) return '';
  const ms = Date.now() - ts;
  if (ms < 0) return 'עכשיו';
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return minutes <= 1 ? 'לפני רגע' : `לפני ${minutes} דקות`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? 'לפני שעה' : `לפני ${hours} שעות`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'לפני יום' : `לפני ${days} ימים`;
}

export default function StuckItemsModal({ open, onClose }) {
  const [items, setItems] = useState(() => (open ? getStuckItems() : []));
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => setItems(getStuckItems()), []);

  const retryOne = async (item) => {
    setBusy(true);
    clearAttemptsForRetry(item.id);
    const flush = FLUSH_BY_TYPE[item.type];
    if (flush) await flush().catch(() => {});
    refresh();
    setBusy(false);
  };

  const discardOne = (item) => {
    const ok = window.confirm(`להשליך את הפריט "${item.label}" — ${item.detail || ''}? פעולה לא הפיכה.`);
    if (!ok) return;
    discardStuckItem(item.id);
    refresh();
  };

  const retryAll = async () => {
    setBusy(true);
    items.forEach((it) => clearAttemptsForRetry(it.id));
    await Promise.all(Object.values(FLUSH_BY_TYPE).map((f) => f().catch(() => {})));
    refresh();
    setBusy(false);
  };

  const discardAll = () => {
    const ok = window.confirm(`להשליך את כל ${items.length} הפריטים? פעולה לא הפיכה.`);
    if (!ok) return;
    items.forEach((it) => discardStuckItem(it.id));
    refresh();
  };

  const titleId = 'stuck-items-title';

  return (
    <Modal open={open} onClose={onClose} ariaLabel="פריטים שלא הועלו">
      <div className="stuck-modal" aria-labelledby={titleId}>
        <div className="stuck-modal-header">
          <h2 id={titleId} className="modal-title stuck-modal-title">פריטים שלא הצליחו לעלות</h2>
          <p className="modal-body stuck-modal-sub">
            {items.length === 0
              ? 'הכל סגור. שום פריט לא תקוע.'
              : 'הפריטים שמורים אצלך במכשיר אבל לא הועלו לענן. אפשר לנסות שוב או להשליך.'}
          </p>
        </div>

        {items.length > 0 && (
          <ul className="stuck-list" role="list">
            {items.map((it) => (
              <li key={it.id} className="stuck-row">
                <div className="stuck-row-info">
                  <div className="stuck-row-label">{it.label}</div>
                  {it.detail && <div className="stuck-row-detail">{it.detail}</div>}
                  <div className="stuck-row-meta">
                    {it.attempts > 0 && <span>{it.attempts} ניסיונות</span>}
                    {it.attempts > 0 && it.firstQueuedAt && <span> · </span>}
                    {it.firstQueuedAt && <span>בתור {formatRelative(it.firstQueuedAt)}</span>}
                  </div>
                  {it.lastError && <div className="stuck-row-error">{it.lastError}</div>}
                </div>
                <div className="stuck-row-actions">
                  <button
                    type="button"
                    className="stuck-btn stuck-btn-retry"
                    onClick={() => retryOne(it)}
                    disabled={busy}
                  >
                    נסה שוב
                  </button>
                  <button
                    type="button"
                    className="stuck-btn stuck-btn-discard"
                    onClick={() => discardOne(it)}
                    disabled={busy}
                  >
                    השלך
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="modal-actions stuck-modal-footer">
          {items.length > 1 && (
            <>
              <button type="button" className="stuck-btn stuck-btn-retry" onClick={retryAll} disabled={busy}>
                נסה הכל שוב
              </button>
              <button type="button" className="stuck-btn stuck-btn-discard" onClick={discardAll} disabled={busy}>
                השלך הכל
              </button>
            </>
          )}
          <button type="button" className="stuck-btn stuck-btn-close" onClick={onClose}>
            סגור
          </button>
        </div>
      </div>
    </Modal>
  );
}
