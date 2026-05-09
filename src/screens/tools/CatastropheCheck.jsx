import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CheckinHeader from '../checkin/components/CheckinHeader.jsx';
import SoftButton from '../emergency/components/SoftButton.jsx';
import SavedConfirm from '../../components/ui/SavedConfirm.jsx';
import { saveToolSession } from '../../utils/toolsStorage.js';
import { getModeById } from '../../data/modes.js';
import { useBackHandler } from '../../utils/navContext.jsx';

const TOTAL = 5;

export default function CatastropheCheck() {
  const navigate = useNavigate();
  const location = useLocation();
  const incomingModeLabels = (location.state?.selectedModes || [])
    .map((id) => getModeById(id)?.label)
    .filter(Boolean);
  const [step, setStep] = useState(1);
  const [thought, setThought] = useState('');
  const [evidenceFor, setEvidenceFor] = useState('');
  const [evidenceAgainst, setEvidenceAgainst] = useState('');
  const [worstCasePlan, setWorstCasePlan] = useState('');
  const [reframe, setReframe] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const exit = () => navigate('/tools', { replace: true });

  useBackHandler(() => {
    if (step > 1) setStep(step - 1);
    else navigate(-1);
  });

  const showAgainstHint = step === 3 && evidenceAgainst.trim() === '';

  const handleSave = async () => {
    setSaving(true);
    await saveToolSession('catastrophe_checks', {
      thought: thought.trim(),
      evidenceFor: evidenceFor.trim(),
      evidenceAgainst: evidenceAgainst.trim(),
      worstCasePlan: worstCasePlan.trim(),
      reframe: reframe.trim(),
    });
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="phase ck-step ds2-themed">
      <CheckinHeader step={step} total={TOTAL} onExit={exit} />
      <main className="phase-content">
        {incomingModeLabels.length > 0 && (
          <p className="incoming-modes-line">הקולות שזיהית עכשיו: {incomingModeLabels.join(', ')}</p>
        )}
        {step === 1 && (
          <>
            <h1 className="phase-title">מה המחשבה הקטסטרופלית שעולה?</h1>
            <textarea
              className="ck-textarea"
              rows={5}
              placeholder="הגרסה הכי גרועה שהמוח שלך מציע עכשיו"
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              autoFocus
            />
          </>
        )}
        {step === 2 && (
          <>
            <h1 className="phase-title">מה הראיות שתומכות במחשבה?</h1>
            <p className="phase-subtitle">עובדות בלבד, לא רגשות</p>
            <textarea
              className="ck-textarea"
              rows={5}
              value={evidenceFor}
              onChange={(e) => setEvidenceFor(e.target.value)}
            />
          </>
        )}
        {step === 3 && (
          <>
            <h1 className="phase-title">מה הראיות שמערערות עליה?</h1>
            <p className="phase-subtitle">קח רגע. תמיד יש משהו.</p>
            <textarea
              className="ck-textarea"
              rows={5}
              value={evidenceAgainst}
              onChange={(e) => setEvidenceAgainst(e.target.value)}
            />
            {showAgainstHint && (
              <p className="empty-hint">
                אם באמת אין כלום — ננסה משהו אחר. לפעמים השאלה "האם זה כבר קרה לי בעבר ועברתי?" עוזרת.
              </p>
            )}
          </>
        )}
        {step === 4 && (
          <>
            <h1 className="phase-title">נניח שזה באמת קרה. מה תעשה?</h1>
            <p className="phase-subtitle">לא "הכל יהיה בסדר" — תוכנית מעשית.</p>
            <textarea
              className="ck-textarea"
              rows={6}
              value={worstCasePlan}
              onChange={(e) => setWorstCasePlan(e.target.value)}
            />
          </>
        )}
        {step === 5 && (
          <>
            <h1 className="phase-title">איך תנסח את זה עכשיו, אחרי שעברנו על הכל?</h1>
            <textarea
              className="ck-textarea"
              rows={6}
              value={reframe}
              onChange={(e) => setReframe(e.target.value)}
            />
          </>
        )}
      </main>
      <footer className="phase-footer">
        {step < TOTAL && <SoftButton onClick={() => setStep(step + 1)}>הבא</SoftButton>}
        {step === TOTAL && (
          <SoftButton onClick={handleSave} disabled={saving || saved}>
            {saving ? 'שומר…' : 'שמור'}
          </SoftButton>
        )}
      </footer>
      <SavedConfirm
        open={saved}
        onClose={() => navigate('/tools', { replace: true })}
      />
    </div>
  );
}
