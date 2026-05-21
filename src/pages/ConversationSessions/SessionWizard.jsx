import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ToolHeader from '../../screens/toolbox/components/ToolHeader.jsx';
import ProgressDots from '../../components/conversation/ProgressDots.jsx';
import WizardStep, {
  isAnswered,
  selectedOptionIds,
  freshCustomSelections,
} from '../../components/conversation/WizardStep.jsx';
import { getSessionType } from '../../config/sessionTypes.js';
import { createSession } from '../../services/conversationSessionsService.js';
import { bumpChoiceCounts } from '../../services/choiceFrequencyService.js';
import { addOrBumpCustomOption } from '../../services/customOptionsService.js';

export default function SessionWizard() {
  const { type } = useParams();
  const navigate = useNavigate();
  const def = getSessionType(type);

  const [step, setStep] = useState(0);
  const [variables, setVariables] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!def) {
    return (
      <div className="tool-page ds2-themed">
        <ToolHeader title="לא נמצא" subtitle="סוג הסשן לא קיים" backTo="/sessions" />
        <main className="tool-content"><p>הסוג "{type}" אינו ידוע.</p></main>
      </div>
    );
  }

  const questions = def.questions || [];
  const total = questions.length;
  const current = questions[step];
  const isLast = step === total - 1;

  const setVar = (id, val) => {
    setVariables((prev) => ({ ...prev, [id]: val }));
  };

  const canProceed = current ? isAnswered(current, variables[current.id]) : false;

  const handleBack = () => {
    if (step === 0) {
      navigate(`/sessions/${type}`);
    } else {
      setStep(step - 1);
    }
  };

  const submitWithVars = async (vars) => {
    setSubmitting(true);
    setError(null);

    for (const q of questions) {
      const v = vars[q.id];
      const ids = selectedOptionIds(q, v);
      if (ids.length) {
        bumpChoiceCounts(type, q.id, ids).catch(() => {});
      }
      for (const c of freshCustomSelections(q, v)) {
        addOrBumpCustomOption(type, q.id, c.label).catch(() => {});
      }
    }

    const result = await createSession({ type, variables: vars });
    if (!result?.sessionId) {
      setError('שגיאה ביצירת הסשן. נסה שוב.');
      setSubmitting(false);
      return;
    }
    navigate(`/sessions/${type}/result/${result.sessionId}`, { replace: true });
  };

  const handleNext = async () => {
    if (!canProceed) return;
    if (!isLast) {
      setStep(step + 1);
      return;
    }
    await submitWithVars(variables);
  };

  const handleSkip = async () => {
    if (current?.required) return;
    const nextVars = { ...variables, [current.id]: null };
    setVariables(nextVars);
    if (!isLast) {
      setStep(step + 1);
      return;
    }
    await submitWithVars(nextVars);
  };

  if (total === 0) {
    return (
      <div className="tool-page ds2-themed">
        <ToolHeader title={def.label} subtitle="אין שאלות מוגדרות" backTo={`/sessions/${type}`} />
      </div>
    );
  }

  return (
    <div className="tool-page conversation-sessions-page ds2-themed">
      <ToolHeader title={def.label} subtitle="" backTo={`/sessions/${type}`} onBack={handleBack} />
      <div className="cs-wizard-progress-bar">
        <ProgressDots total={total} current={step} />
      </div>
      <main className="tool-content cs-wizard-content">
        <WizardStep
          sessionType={type}
          question={current}
          value={variables[current.id]}
          onChange={(val) => setVar(current.id, val)}
          onSkip={handleSkip}
        />
        {error && <div className="cs-feedback-error cs-import-feedback">{error}</div>}
      </main>
      <footer className="cs-wizard-footer">
        <button type="button" className="cs-btn cs-btn-ghost" onClick={handleBack} disabled={submitting}>
          {step === 0 ? 'ביטול' : 'חזור'}
        </button>
        <button
          type="button"
          className="cs-btn cs-btn-primary"
          onClick={handleNext}
          disabled={!canProceed || submitting}
        >
          {submitting ? 'יוצר…' : isLast ? 'צור פרומפט' : 'המשך'}
        </button>
      </footer>
    </div>
  );
}
