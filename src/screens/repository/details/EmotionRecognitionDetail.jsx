const MODE_LABELS = {
  real_time: 'זמן אמת',
  daily_practice: 'תרגול יומי',
  case_analysis: 'ניתוח מקרה',
};

const LAYER_LABELS = {
  primary: 'ראשוני',
  protective: 'מגונן',
};

export default function EmotionRecognitionDetail({ analysis }) {
  const p = analysis.payload || {};
  return (
    <div className="detail-sections">
      {p.mode && (
        <Section label="מצב העבודה">
          <p className="detail-line">{MODE_LABELS[p.mode] || p.mode}</p>
        </Section>
      )}

      {p.trigger_event && (
        <Section label="מה הפעיל">
          <div className="callout callout-soft">{p.trigger_event}</div>
        </Section>
      )}

      {Array.isArray(p.body_signals) && p.body_signals.length > 0 && (
        <Section label="סימני גוף">
          <div className="chip-row">
            {p.body_signals.map((s, i) => <span key={i} className="chip">{s}</span>)}
          </div>
        </Section>
      )}

      {Array.isArray(p.emotions) && p.emotions.length > 0 && (
        <Section label="רגשות">
          <ul className="emotion-card-list">
            {p.emotions.map((e, i) => <EmotionCard key={i} emotion={e} />)}
          </ul>
        </Section>
      )}

      {Array.isArray(p.thoughts_identified) && p.thoughts_identified.length > 0 && (
        <Section label="מחשבות שזוהו">
          <ol className="numbered-list">
            {p.thoughts_identified.map((t, i) => <li key={i}>{t}</li>)}
          </ol>
        </Section>
      )}

      {Array.isArray(p.parts_active) && p.parts_active.length > 0 && (
        <Section label="חלקים פעילים">
          <ul className="part-card-list">
            {p.parts_active.map((part, i) => (
              <li key={i} className="part-card">
                <h4 className="part-name">{part.name}</h4>
                {part.what_carries && (
                  <p><strong>מה הוא נושא:</strong> {part.what_carries}</p>
                )}
                {part.what_protects && (
                  <p><strong>על מה הוא מגן:</strong> {part.what_protects}</p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {p.insight && (
        <Section label="התובנה">
          <div className="callout callout-prominent">{p.insight}</div>
        </Section>
      )}

      {p.what_was_needed && (
        <Section label="מה הילד היה צריך">
          <div className="callout callout-soft">{p.what_was_needed}</div>
        </Section>
      )}
    </div>
  );
}

function EmotionCard({ emotion }) {
  const intensity = Number(emotion.intensity);
  const pct = Number.isFinite(intensity) ? Math.max(0, Math.min(100, (intensity / 10) * 100)) : 0;
  const layer = emotion.layer || emotion.type;
  return (
    <li className="emotion-card">
      <div className="emotion-card-row">
        <span className="emotion-card-name">{emotion.name}</span>
        {layer && <span className="chip chip-tiny">{LAYER_LABELS[layer] || layer}</span>}
        {Number.isFinite(intensity) && (
          <span className="emotion-intensity">{intensity} / 10</span>
        )}
      </div>
      {Number.isFinite(intensity) && (
        <div className="score-bar-track">
          <div className="score-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      )}
      {emotion.context && (
        <p className="emotion-context">{emotion.context}</p>
      )}
    </li>
  );
}

function Section({ label, children }) {
  return (
    <section className="detail-section">
      <h3 className="form-section-label">{label}</h3>
      {children}
    </section>
  );
}
