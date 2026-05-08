import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ToolHeader from '../toolbox/components/ToolHeader.jsx';
import SoftButton from '../emergency/components/SoftButton.jsx';
import { Loading } from '../../components/ui/Loading.jsx';
import ExportPrompterModal from '../../components/therapy/ExportPrompterModal.jsx';
import {
  getTherapyDayOfWeek,
  getRelevantFrameDate,
  HEBREW_DOW_LABELS,
} from '../../utils/therapyDay.js';
import { getFrame, saveFramePrep, saveFrameDebrief } from '../../utils/therapyStorage.js';
import { formatHebrewDate, dayOfWeekFromString, getIsraelDateString } from '../../utils/dateHelpers.js';

const SAVE_DEBOUNCE_MS = 700;

export default function TherapyFrameScreen() {
  const navigate = useNavigate();
  const [dow, setDow] = useState(null);
  const [frameDate, setFrameDate] = useState(null);
  const [frame, setFrame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prepDraft, setPrepDraft] = useState('');
  const [debriefDraft, setDebriefDraft] = useState('');
  const [savingPrep, setSavingPrep] = useState(false);
  const [savingDebrief, setSavingDebrief] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [savedFlash, setSavedFlash] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const d = await getTherapyDayOfWeek();
      if (cancelled) return;
      setDow(d);
      if (d == null) {
        setLoading(false);
        return;
      }
      const fd = getRelevantFrameDate(d);
      const target = fd || getIsraelDateString();
      setFrameDate(target);
      const f = await getFrame(target);
      if (cancelled) return;
      setFrame(f || { sessionDate: target, prepText: '', debriefText: '' });
      setPrepDraft(f?.prepText || '');
      setDebriefDraft(f?.debriefText || '');
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // Debounced auto-save for prep
  useEffect(() => {
    if (!frameDate || !frame) return;
    if (prepDraft === (frame.prepText || '')) return;
    const t = setTimeout(async () => {
      setSavingPrep(true);
      const res = await saveFramePrep(frameDate, prepDraft);
      setSavingPrep(false);
      if (res.ok || res.reason === 'offline') {
        setFrame((prev) => ({ ...prev, prepText: prepDraft, prepCreatedAt: prev?.prepCreatedAt || new Date().toISOString() }));
        flashSaved(res.reason === 'offline' ? 'נשמר מקומית' : 'נשמר');
      }
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [prepDraft, frameDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced auto-save for debrief
  useEffect(() => {
    if (!frameDate || !frame) return;
    if (debriefDraft === (frame.debriefText || '')) return;
    const t = setTimeout(async () => {
      setSavingDebrief(true);
      const res = await saveFrameDebrief(frameDate, debriefDraft);
      setSavingDebrief(false);
      if (res.ok || res.reason === 'offline') {
        setFrame((prev) => ({ ...prev, debriefText: debriefDraft, debriefCreatedAt: prev?.debriefCreatedAt || new Date().toISOString() }));
        flashSaved(res.reason === 'offline' ? 'נשמר מקומית' : 'נשמר');
      }
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [debriefDraft, frameDate]); // eslint-disable-line react-hooks/exhaustive-deps

  function flashSaved(msg) {
    setSavedFlash(msg);
    setTimeout(() => setSavedFlash(null), 1400);
  }

  if (loading) {
    return (
      <div className="tool-page ds2-themed">
        <ToolHeader title="מסגרת הטיפול" backTo="/" />
        <main className="tool-content"><Loading /></main>
      </div>
    );
  }

  if (dow == null) {
    return (
      <div className="tool-page ds2-themed">
        <ToolHeader title="מסגרת הטיפול" backTo="/" />
        <main className="tool-content">
          <p className="ck-empty">עוד לא הוגדר יום טיפול קבוע.</p>
          <div style={{ marginTop: 16 }}>
            <SoftButton onClick={() => navigate('/settings/therapy-day')}>
              הגדר יום טיפול
            </SoftButton>
          </div>
        </main>
      </div>
    );
  }

  const todayDow = dayOfWeekFromString(getIsraelDateString());
  const isPastSession = todayDow !== dow; // we're on the day after — debrief mode
  const hasPrep = Boolean(frame?.prepText && frame.prepText.trim());
  const dateLabel = frameDate ? formatHebrewDate(frameDate) : '';

  return (
    <div className="tool-page ds2-themed">
      <ToolHeader
        title="מסגרת הטיפול"
        subtitle={`יום ${HEBREW_DOW_LABELS[dow]} · ${dateLabel}`}
        backTo="/"
      />
      <main className="tool-content">
        <section className="import-section">
          <h3 className="form-section-label">
            מה אני רוצה להביא?
            {savingPrep && <span className="frame-save-status"> · שומר…</span>}
          </h3>
          <textarea
            className="ck-textarea"
            rows={6}
            value={prepDraft}
            onChange={(e) => setPrepDraft(e.target.value)}
            placeholder={isPastSession ? 'הוספה אופציונלית — כבר עברת את הפגישה' : 'נושאים, תחושות, רגעים מהשבוע, שאלות למטפלת…'}
            spellCheck={false}
          />
        </section>

        {hasPrep && (
          <section className="import-section">
            <h3 className="form-section-label">
              מה התרחש שם?
              {savingDebrief && <span className="frame-save-status"> · שומר…</span>}
            </h3>
            <textarea
              className="ck-textarea"
              rows={6}
              value={debriefDraft}
              onChange={(e) => setDebriefDraft(e.target.value)}
              placeholder="מה הופיע, מה זז, מה נשאר פתוח, מה לקחת איתך…"
              spellCheck={false}
            />
          </section>
        )}

        <section className="import-section">
          <button
            type="button"
            className="link-btn"
            onClick={() => setExportOpen(true)}
          >
            ייצא דוח גולמי לקלוד AI ←
          </button>
          <p className="override-note" style={{ marginTop: 6 }}>
            יוצר פרומפט עם כל מה שתיעדת מאז הייצוא הקודם — להעביר לקלוד AI שיעזור לסדר ולתעדף.
          </p>
        </section>

        {savedFlash && <div className="toast" role="status">{savedFlash}</div>}
      </main>

      <ExportPrompterModal open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}
