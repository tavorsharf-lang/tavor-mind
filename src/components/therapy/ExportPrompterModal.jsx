import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal.jsx';
import SoftButton from '../../screens/emergency/components/SoftButton.jsx';
import { Loading } from '../ui/Loading.jsx';
import { buildExportPrompt } from '../../utils/therapistExport.js';
import { getLastTherapistExportAt, setLastTherapistExportAt } from '../../utils/therapyDay.js';

export default function ExportPrompterModal({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [fullExport, setFullExport] = useState(false);
  const [lastExport, setLastExport] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setResult(null);
    (async () => {
      const since = await getLastTherapistExportAt();
      if (cancelled) return;
      setLastExport(since);
      const r = await buildExportPrompt({ sinceISO: fullExport ? null : since, fullExport });
      if (cancelled) return;
      setResult(r);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [open, fullExport]);

  const handleCopyAndAdvance = async () => {
    if (!result?.promptText) return;
    try {
      await navigator.clipboard.writeText(result.promptText);
      const now = new Date().toISOString();
      await setLastTherapistExportAt(now);
      setLastExport(now);
      setToast('הועתק. הייצוא הבא יתחיל מהרגע הזה.');
      setTimeout(() => { setToast(null); onClose?.(); }, 1400);
    } catch {
      setToast('העתקה נכשלה');
    }
  };

  const handleCopyOnly = async () => {
    if (!result?.promptText) return;
    try {
      await navigator.clipboard.writeText(result.promptText);
      setToast('הועתק (התאריך לא עודכן)');
      setTimeout(() => setToast(null), 1400);
    } catch {
      setToast('העתקה נכשלה');
    }
  };

  return (
    <Modal open={open} onClose={onClose} ariaLabel="ייצוא לטיפול">
      <div className="export-modal">
        <header className="export-modal-head">
          <h2 className="export-modal-title">דוח גולמי לקלוד AI</h2>
          <button
            type="button"
            className="link-btn export-modal-close"
            onClick={onClose}
            aria-label="סגירה"
          >
            ✕
          </button>
        </header>

        {loading && <Loading label="אוסף נתונים…" />}

        {!loading && result && (
          <>
            <div className="export-meta">
              <span>תקופה: {result.periodStart} → {result.periodEnd}</span>
              <span className="export-meta-dot">·</span>
              <span>{result.dataPointsCount} נתונים</span>
              {!fullExport && lastExport && (
                <>
                  <span className="export-meta-dot">·</span>
                  <span className="export-meta-soft">ייצוא קודם: {lastExport.slice(0, 10)}</span>
                </>
              )}
              {fullExport && (
                <>
                  <span className="export-meta-dot">·</span>
                  <span className="export-meta-soft">ייצוא מלא (30 ימים)</span>
                </>
              )}
            </div>

            {result.isEmpty ? (
              <div className="export-empty">
                <p>אין נתונים חדשים מאז הייצוא הקודם.</p>
                {!fullExport && (
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setFullExport(true)}
                  >
                    הצג ייצוא מלא של 30 הימים האחרונים →
                  </button>
                )}
              </div>
            ) : (
              <>
                <textarea
                  className="ck-textarea export-textarea"
                  value={result.promptText}
                  readOnly
                  rows={14}
                  spellCheck={false}
                />

                <div className="export-actions">
                  <SoftButton onClick={handleCopyAndAdvance}>
                    העתק והעבר תאריך אחרון
                  </SoftButton>
                  <button type="button" className="link-btn" onClick={handleCopyOnly}>
                    העתק בלי לעדכן תאריך
                  </button>
                  {!fullExport && (
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => setFullExport(true)}
                    >
                      ייצוא מלא (30 ימים)
                    </button>
                  )}
                  {fullExport && (
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => setFullExport(false)}
                    >
                      חזרה לדלתא מהייצוא הקודם
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {toast && <div className="toast" role="status">{toast}</div>}
      </div>
    </Modal>
  );
}
