import { useEffect, useState } from 'react';
import { SCHEMA_LABELS } from '../../../data/analysisSchemas.js';
import { getFrameByLinkedAnalysisId } from '../../../utils/therapyStorage.js';
import { formatHebrewDate } from '../../../utils/dateHelpers.js';

const MODALITY_LABELS = {
  ifs: 'IFS',
  schema_focused: 'עבודת סכמה',
  chair_dialogue: 'דיאלוג כיסאות',
};

const PART_ROLE_LABELS = {
  manager: 'מנהל',
  firefighter: 'כבאי',
  exile: 'גלותי',
};

export default function TherapySessionDetail({ analysis }) {
  const p = analysis.payload || {};
  const [frame, setFrame] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (analysis._id) {
      getFrameByLinkedAnalysisId(analysis._id).then((f) => {
        if (!cancelled) setFrame(f);
      });
    }
    return () => { cancelled = true; };
  }, [analysis._id]);

  return (
    <div className="detail-sections">
      {frame && (frame.prepText || frame.debriefText) && (
        <section className="detail-section frame-block">
          <h3 className="form-section-label">המסגרת של הפגישה · {formatHebrewDate(frame.sessionDate)}</h3>
          {frame.prepText && (
            <div className="frame-block-row">
              <span className="frame-block-label">לפני (מה רציתי להביא):</span>
              <div className="callout callout-soft">{frame.prepText}</div>
            </div>
          )}
          {frame.debriefText && (
            <div className="frame-block-row">
              <span className="frame-block-label">אחרי (מה התרחש):</span>
              <div className="callout callout-soft">{frame.debriefText}</div>
            </div>
          )}
        </section>
      )}
      <section className="detail-section">
        <h3 className="form-section-label">פרטי הסשן</h3>
        <div className="chip-row">
          {p.modality && <span className="chip">{MODALITY_LABELS[p.modality] || p.modality}</span>}
          {p.duration && <span className="chip">{p.duration} דקות</span>}
        </div>
        {p.topic && <p className="detail-line" style={{ marginTop: 6 }}><strong>נושא:</strong> {p.topic}</p>}
      </section>

      {p.ifs_specific && <IfsBranch data={p.ifs_specific} />}
      {p.schema_focused_specific && <SchemaFocusedBranch data={p.schema_focused_specific} />}
      {p.chair_dialogue_specific && <ChairDialogueBranch data={p.chair_dialogue_specific} />}

      {p.insight && (
        <section className="detail-section">
          <h3 className="form-section-label">התובנה</h3>
          <div className="callout callout-prominent">{p.insight}</div>
        </section>
      )}

      {p.homework && (
        <section className="detail-section">
          <h3 className="form-section-label">שיעורי בית</h3>
          <div className="callout callout-soft">{p.homework}</div>
        </section>
      )}
    </div>
  );
}

function IfsBranch({ data }) {
  const energy = Number(data?.self_energy);
  const pct = Number.isFinite(energy) ? Math.max(0, Math.min(100, (energy / 10) * 100)) : 0;
  const parts = Array.isArray(data?.parts) ? data.parts : [];
  return (
    <>
      <section className="detail-section">
        <h3 className="form-section-label">Self Energy</h3>
        <div className="score-bar">
          <div className="score-bar-row">
            <span className="score-bar-label">{Number.isFinite(energy) ? `${energy} / 10` : '-'}</span>
          </div>
          <div className="score-bar-track">
            <div className="score-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </section>

      {parts.length > 0 && (
        <section className="detail-section">
          <h3 className="form-section-label">חלקים שנפגשנו</h3>
          <ul className="part-card-list">
            {parts.map((part, i) => (
              <li key={i} className="part-card">
                <div className="part-card-row">
                  <h4 className="part-name">{part.name}</h4>
                  {part.role && <span className="chip chip-tiny">{PART_ROLE_LABELS[part.role] || part.role}</span>}
                </div>
                {part.what_carries && <p><strong>מה הוא נושא:</strong> {part.what_carries}</p>}
                {part.what_needs && <p><strong>מה הוא צריך:</strong> {part.what_needs}</p>}
                <p className="part-self-status">
                  {part.self_present ? 'Self היה נוכח ✓' : 'Self לא היה נוכח -'}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function SchemaFocusedBranch({ data }) {
  return (
    <>
      {data.schema && (
        <section className="detail-section">
          <h3 className="form-section-label">סכמה</h3>
          <span className="chip">{SCHEMA_LABELS[data.schema] || data.schema}</span>
        </section>
      )}
      {data.trigger_explored && (
        <section className="detail-section">
          <h3 className="form-section-label">טריגר</h3>
          <div className="callout callout-soft">{data.trigger_explored}</div>
        </section>
      )}
      {(data.old_belief || data.new_belief_emerging) && (
        <section className="detail-section">
          <h3 className="form-section-label">תזוזה באמונה</h3>
          {data.old_belief && (
            <blockquote className="quote-block quote-old">"{data.old_belief}"</blockquote>
          )}
          {data.old_belief && data.new_belief_emerging && (
            <div className="belief-arrow" aria-hidden="true">↓</div>
          )}
          {data.new_belief_emerging && (
            <blockquote className="quote-block quote-new">"{data.new_belief_emerging}"</blockquote>
          )}
        </section>
      )}
    </>
  );
}

function ChairDialogueBranch({ data }) {
  return (
    <>
      <section className="detail-section">
        <h3 className="form-section-label">הדיאלוג</h3>
        <div className="chair-grid">
          <ChairCard label="כיסא א" data={data.chair_a} />
          <ChairCard label="כיסא ב" data={data.chair_b} />
        </div>
      </section>
      {data.movement_observed && (
        <section className="detail-section">
          <h3 className="form-section-label">מה זז במהלך הדיאלוג</h3>
          <div className="callout callout-prominent">{data.movement_observed}</div>
        </section>
      )}
    </>
  );
}

function ChairCard({ label, data }) {
  const c = data || {};
  return (
    <div className="chair-card">
      <h4 className="chair-card-label">{label}</h4>
      {c.represents && <p><strong>מייצג:</strong> {c.represents}</p>}
      {c.key_voice && (
        <blockquote className="quote-block quote-block-sm">"{c.key_voice}"</blockquote>
      )}
    </div>
  );
}
