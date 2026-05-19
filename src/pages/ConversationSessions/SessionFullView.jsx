import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ToolHeader from '../../screens/toolbox/components/ToolHeader.jsx';
import { Loading } from '../../components/ui/Loading.jsx';
import { getSession } from '../../services/conversationSessionsService.js';
import { getSessionType } from '../../config/sessionTypes.js';
import { buildSessionPrompt } from '../../services/promptBuilder.js';

const SKIPPED_LABEL = 'לא צוין';

// Hebrew labels for fields in the imported payload. Tracks the shape returned
// by the Claude project system prompt for anticipatory_anxiety; future session
// types may share it or extend.
const PAYLOAD_LABELS = {
  core_insight: 'תובנת ליבה',
  schemas_identified: 'סכמות שזוהו',
  modes_primary: 'מוד ראשי',
  modes_voice_origin: 'מקור הקול',
  modes_secondary: 'מודים משניים',
  cognitive_name: 'דפוס קוגניטיבי',
  cognitive_thought: 'המחשבה',
  cognitive_function: 'תפקיד הדפוס',
  somatic_anchor: 'עוגן גופני',
  first_attempt: 'ניסיון ראשון לקול הורה בריא',
  first_attempt_critique: 'ביקורת על הניסיון הראשון',
  refined_voice: 'קול ההורה הבריא',
  body_signal: 'אות גופני',
  takeaway: 'לקחת איתי',
  open_threads: 'נושאים פתוחים',
};

function hasString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}
function hasArray(v) {
  return Array.isArray(v) && v.length > 0;
}
function formatDate(ms) {
  if (!ms) return '';
  try {
    const d = new Date(ms);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}.${mm}.${yyyy} בשעה ${hh}:${min}`;
  } catch {
    return '';
  }
}

function optionLabel(question, optionId, customLabels) {
  const opt = (question.options || []).find((o) => o.id === optionId);
  if (opt) return opt.label;
  if (customLabels && customLabels[optionId]) return customLabels[optionId];
  return optionId;
}

function subInputFor(question, optionId, subInputs) {
  const opt = (question.options || []).find((o) => o.id === optionId);
  const cfg = opt?.sub_input;
  if (!cfg) return null;
  const text = subInputs?.[cfg.id];
  if (!hasString(text)) return null;
  return { label: cfg.label, value: text.trim() };
}

function VariableValue({ question, value }) {
  if (value === null || value === undefined) {
    return <span className="cs-full-skipped">{SKIPPED_LABEL}</span>;
  }
  switch (question.type) {
    case 'single_select': {
      const usesSubs = (question.options || []).some((o) => o?.sub_input);
      if (usesSubs) {
        const obj = value && typeof value === 'object' ? value : { selected: null, sub_inputs: {} };
        if (!obj.selected) return <span className="cs-full-skipped">{SKIPPED_LABEL}</span>;
        const label = optionLabel(question, obj.selected);
        const sub = subInputFor(question, obj.selected, obj.sub_inputs);
        return (
          <div>
            <p className="cs-full-text">{label}</p>
            {sub && <p className="cs-full-subinput">({sub.label}: {sub.value})</p>}
          </div>
        );
      }
      const label = optionLabel(question, value);
      return <p className="cs-full-text">{label}</p>;
    }
    case 'multi_select': {
      if (!Array.isArray(value) || value.length === 0) {
        return <span className="cs-full-skipped">{SKIPPED_LABEL}</span>;
      }
      return (
        <ul className="cs-full-bullets">
          {value.map((id) => <li key={id}>{optionLabel(question, id)}</li>)}
        </ul>
      );
    }
    case 'scale': {
      if (typeof value !== 'number') return <span className="cs-full-skipped">{SKIPPED_LABEL}</span>;
      const max = question.config?.max ?? question.max ?? 10;
      return <p className="cs-full-text">{value}/{max}</p>;
    }
    case 'text': {
      return <p className="cs-full-text">{value}</p>;
    }
    case 'select_with_custom': {
      const selected = Array.isArray(value.selected)
        ? value.selected
        : (value.selected ? [value.selected] : []);
      if (selected.length === 0) {
        return <span className="cs-full-skipped">{SKIPPED_LABEL}</span>;
      }
      if (!question.multi) {
        const id = selected[0];
        const label = optionLabel(question, id, value.custom_labels);
        const sub = subInputFor(question, id, value.sub_inputs);
        return (
          <div>
            <p className="cs-full-text">{label}</p>
            {sub && <p className="cs-full-subinput">({sub.label}: {sub.value})</p>}
          </div>
        );
      }
      return (
        <ul className="cs-full-bullets">
          {selected.map((id) => {
            const sub = subInputFor(question, id, value.sub_inputs);
            return (
              <li key={id}>
                {optionLabel(question, id, value.custom_labels)}
                {sub && <span className="cs-full-subinput"> ({sub.label}: {sub.value})</span>}
              </li>
            );
          })}
        </ul>
      );
    }
    default:
      return null;
  }
}

function PayloadField({ label, children, variant }) {
  return (
    <div className={`cs-full-field${variant ? ' cs-full-field-' + variant : ''}`}>
      <div className="cs-full-field-label">{label}</div>
      <div className="cs-full-field-body">{children}</div>
    </div>
  );
}

function PayloadChips({ values }) {
  return (
    <div className="cs-full-chips">
      {values.map((v, i) => (
        <span key={i} className="cs-neutral-chip">{v}</span>
      ))}
    </div>
  );
}

function PayloadBullets({ values }) {
  return (
    <ul className="cs-full-bullets">
      {values.map((v, i) => <li key={i}>{v}</li>)}
    </ul>
  );
}

function renderPayload(payload) {
  if (!payload || typeof payload !== 'object') return null;

  const m = payload.modes_active || {};
  const c = payload.cognitive_pattern || {};
  const h = payload.healthy_adult_voice || {};

  const fields = [];

  if (hasString(payload.core_insight)) {
    fields.push(
      <PayloadField key="core" label={PAYLOAD_LABELS.core_insight} variant="emphasis">
        <p className="cs-full-text">{payload.core_insight}</p>
      </PayloadField>,
    );
  }
  if (hasArray(payload.schemas_identified)) {
    fields.push(
      <PayloadField key="schemas" label={PAYLOAD_LABELS.schemas_identified}>
        <PayloadChips values={payload.schemas_identified} />
      </PayloadField>,
    );
  }
  if (hasString(m.primary)) {
    fields.push(
      <PayloadField key="m-pri" label={PAYLOAD_LABELS.modes_primary}>
        <p className="cs-full-text">{m.primary}</p>
      </PayloadField>,
    );
  }
  if (hasString(m.voice_origin)) {
    fields.push(
      <PayloadField key="m-orig" label={PAYLOAD_LABELS.modes_voice_origin}>
        <p className="cs-full-text">{m.voice_origin}</p>
      </PayloadField>,
    );
  }
  if (hasArray(m.secondary_modes_noticed)) {
    fields.push(
      <PayloadField key="m-sec" label={PAYLOAD_LABELS.modes_secondary}>
        <PayloadBullets values={m.secondary_modes_noticed} />
      </PayloadField>,
    );
  }
  if (hasString(c.name)) {
    fields.push(
      <PayloadField key="c-name" label={PAYLOAD_LABELS.cognitive_name}>
        <p className="cs-full-text">{c.name}</p>
      </PayloadField>,
    );
  }
  if (hasString(c.the_thought)) {
    fields.push(
      <PayloadField key="c-thought" label={PAYLOAD_LABELS.cognitive_thought}>
        <blockquote className="cs-full-quote">{c.the_thought}</blockquote>
      </PayloadField>,
    );
  }
  if (hasString(c.function)) {
    fields.push(
      <PayloadField key="c-fn" label={PAYLOAD_LABELS.cognitive_function}>
        <p className="cs-full-text">{c.function}</p>
      </PayloadField>,
    );
  }
  if (hasString(payload.somatic_anchor)) {
    fields.push(
      <PayloadField key="anchor" label={PAYLOAD_LABELS.somatic_anchor}>
        <p className="cs-full-text">{payload.somatic_anchor}</p>
      </PayloadField>,
    );
  }
  if (hasString(h.first_attempt)) {
    fields.push(
      <PayloadField key="h-first" label={PAYLOAD_LABELS.first_attempt}>
        <p className="cs-full-text">{h.first_attempt}</p>
      </PayloadField>,
    );
  }
  if (hasString(h.first_attempt_critique)) {
    fields.push(
      <PayloadField key="h-crit" label={PAYLOAD_LABELS.first_attempt_critique}>
        <p className="cs-full-text">{h.first_attempt_critique}</p>
      </PayloadField>,
    );
  }
  if (hasString(h.refined_voice)) {
    fields.push(
      <PayloadField key="h-ref" label={PAYLOAD_LABELS.refined_voice} variant="emphasis">
        <p className="cs-full-text">{h.refined_voice}</p>
      </PayloadField>,
    );
  }
  if (hasString(h.body_signal)) {
    fields.push(
      <PayloadField key="h-body" label={PAYLOAD_LABELS.body_signal}>
        <p className="cs-full-text">{h.body_signal}</p>
      </PayloadField>,
    );
  }
  if (hasString(payload.takeaway_for_event)) {
    fields.push(
      <PayloadField key="tk" label={PAYLOAD_LABELS.takeaway} variant="emphasis">
        <p className="cs-full-text">{payload.takeaway_for_event}</p>
      </PayloadField>,
    );
  }
  if (hasArray(payload.open_threads)) {
    fields.push(
      <PayloadField key="open" label={PAYLOAD_LABELS.open_threads}>
        <PayloadBullets values={payload.open_threads} />
      </PayloadField>,
    );
  }
  return fields;
}

export default function SessionFullView() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSession(sessionId).then((s) => {
      if (cancelled) return;
      setSession(s);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [sessionId]);

  const def = session ? getSessionType(session.type) : null;

  const prompt = useMemo(() => {
    if (!session || !def) return '';
    const createdAtIso = session.createdAt ? new Date(session.createdAt).toISOString() : null;
    return buildSessionPrompt({
      type: session.type,
      variables: session.variables,
      meta: { createdAt: createdAtIso, sessionId: session.sessionId },
    });
  }, [session, def]);

  if (loading) {
    return (
      <div className="tool-page ds2-themed">
        <ToolHeader title="" subtitle="" backTo="/review" />
        <main className="tool-content"><Loading /></main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="tool-page ds2-themed">
        <ToolHeader title="לא נמצא" subtitle="הסשן לא קיים" backTo="/review" />
        <main className="tool-content"><p>הסשן הזה לא נמצא.</p></main>
      </div>
    );
  }

  const variables = session.variables || {};
  const questions = def?.questions || [];
  const payload = session.importedResponse?.payload || null;
  const rawText = session.importedResponse?.rawText || null;
  const payloadFields = payload ? renderPayload(payload) : null;
  const hasPayloadContent = Array.isArray(payloadFields) && payloadFields.length > 0;

  return (
    <div className="tool-page conversation-sessions-page cs-full-view ds2-themed">
      <ToolHeader
        title={def?.label || 'סשן'}
        subtitle={formatDate(session.createdAt)}
        backTo="/review"
      />
      <main className="tool-content">

        {questions.length > 0 && (
          <section className="cs-full-section">
            <h2 className="cs-full-section-title">מה הבאתי לסשן</h2>
            <div className="cs-full-vars">
              {questions.map((q) => (
                <div key={q.id} className="cs-full-var">
                  <div className="cs-full-var-label">{q.label}</div>
                  <div className="cs-full-var-body">
                    <VariableValue question={q} value={variables[q.id]} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {hasPayloadContent && (
          <section className="cs-full-section">
            <h2 className="cs-full-section-title">מה עלה בעיבוד</h2>
            <div className="cs-full-payload">{payloadFields}</div>
          </section>
        )}

        <section className="cs-full-section cs-full-actions">
          <h2 className="cs-full-section-title">פעולות</h2>
          <button
            type="button"
            className="cs-btn cs-btn-primary cs-btn-block"
            onClick={() => navigate('/review')}
          >
            חזרה למראה
          </button>

          {prompt && (
            <details className="cs-accordion">
              <summary className="cs-accordion-summary">צפה בפרומפט המיוצא</summary>
              <pre className="cs-prompt-block cs-accordion-body" dir="rtl">{prompt}</pre>
            </details>
          )}

          {(payload || rawText) && (
            <details className="cs-accordion">
              <summary className="cs-accordion-summary">צפה ב-JSON גולמי</summary>
              <pre className="cs-imported-block cs-accordion-body" dir="rtl">
                {payload ? JSON.stringify(payload, null, 2) : rawText}
              </pre>
            </details>
          )}
        </section>

      </main>
    </div>
  );
}
