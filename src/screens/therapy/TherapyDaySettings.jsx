import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ToolHeader from '../toolbox/components/ToolHeader.jsx';
import SoftButton from '../emergency/components/SoftButton.jsx';
import {
  HEBREW_DOW_LABELS,
  getTherapyDayOfWeek,
  setTherapyDayOfWeek,
} from '../../utils/therapyDay.js';

export default function TherapyDaySettings() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [initial, setInitial] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getTherapyDayOfWeek().then((dow) => {
      if (cancelled) return;
      setSelected(dow);
      setInitial(dow);
    });
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    if (selected == null) return;
    setSaving(true);
    const result = await setTherapyDayOfWeek(selected);
    setSaving(false);
    if (result.ok) {
      setToast(result.synced ? 'נשמר' : 'נשמר מקומית · יסונכרן ברשת');
      setTimeout(() => navigate('/'), 700);
    } else {
      setToast('שמירה נכשלה');
    }
  };

  const dirty = selected !== initial;

  return (
    <div className="tool-page ds2-themed">
      <ToolHeader
        title="יום הטיפול"
        subtitle="היום הקבוע שיש לך פגישת טיפול. כפתור ההכנה והדיבריף יופיע בבית בימים האלה בלבד."
        backTo="/"
      />
      <main className="tool-content">
        <section className="import-section">
          <h3 className="form-section-label">היום בשבוע</h3>
          <div className="dow-picker">
            {HEBREW_DOW_LABELS.map((label, idx) => (
              <button
                key={idx}
                type="button"
                className={`dow-pill ${selected === idx ? 'is-selected' : ''}`}
                onClick={() => setSelected(idx)}
                aria-pressed={selected === idx}
              >
                {label}
              </button>
            ))}
          </div>
          {initial != null && (
            <p className="override-note">
              ההגדרה הנוכחית: יום {HEBREW_DOW_LABELS[initial]}.
            </p>
          )}
        </section>

        {toast && <div className="toast" role="status">{toast}</div>}
      </main>
      <footer className="phase-footer phase-footer-stack">
        <SoftButton onClick={handleSave} disabled={!dirty || selected == null || saving}>
          {saving ? 'שומר…' : 'שמור'}
        </SoftButton>
        <button type="button" className="link-btn" onClick={() => navigate('/')}>
          ביטול
        </button>
      </footer>
    </div>
  );
}
