const MODE_LABELS = {
  daily: 'יומי',
  real_time: 'זמן אמת',
  evening: 'ערב',
};

const PROTOCOL_LABELS = {
  sensory_specific: 'חושי-ספציפי',
  body_first: 'גוף ראשון',
  micro_moments: 'רגעים זעירים',
  person_specific: 'אדם ספציפי',
};

const CATEGORY_LABELS = {
  sensory: 'חושי',
  person: 'אדם',
  achievement: 'הישג',
  body: 'גוף',
  micro_moment: 'רגע זעיר',
};

const PATTERN_FLAG_LABELS = {
  generic: 'גנרי',
  performance_framed: 'במסגרת הישג',
  not_specific_enough: 'לא מספיק ספציפי',
  duty_disguised: 'חובה במסווה',
};

export default function GratitudeDetail({ analysis }) {
  const p = analysis.payload || {};
  const cal = p.calibration || {};
  return (
    <div className="detail-sections">
      <section className="detail-section">
        <h3 className="form-section-label">מצב ופרוטוקול</h3>
        <div className="chip-row">
          {p.mode && <span className="chip">{MODE_LABELS[p.mode] || p.mode}</span>}
          {p.protocol && <span className="chip">{PROTOCOL_LABELS[p.protocol] || p.protocol}</span>}
        </div>
      </section>

      <section className="detail-section">
        <h3 className="form-section-label">כיול</h3>
        <div className="calibration-row">
          <CalibrationStat label="לפני" value={cal.access_score_start} />
          <span className="calibration-arrow" aria-hidden="true">←</span>
          <CalibrationStat label="אחרי" value={cal.access_score_end} />
        </div>
        {cal.feeling_now && (
          <p className="detail-line"><strong>תחושה עכשיו:</strong> {cal.feeling_now}</p>
        )}
      </section>

      {Array.isArray(p.items) && p.items.length > 0 && (
        <section className="detail-section">
          <h3 className="form-section-label">3 הפריטים</h3>
          <ul className="grat-item-list">
            {p.items.map((it, i) => <GratItem key={i} item={it} />)}
          </ul>
        </section>
      )}

      {p.insight && (
        <section className="detail-section">
          <h3 className="form-section-label">התובנה</h3>
          <div className="callout callout-prominent">{p.insight}</div>
        </section>
      )}

      {p.closing_note && (
        <section className="detail-section">
          <h3 className="form-section-label">הערת סיום</h3>
          <p className="detail-line detail-line-soft">{p.closing_note}</p>
        </section>
      )}
    </div>
  );
}

function CalibrationStat({ label, value }) {
  return (
    <div className="calibration-stat">
      <span className="calibration-label">{label}</span>
      <span className="calibration-value">{value ?? '-'}</span>
    </div>
  );
}

function GratItem({ item }) {
  const flagged = Array.isArray(item.patterns_flagged) ? item.patterns_flagged : [];
  return (
    <li className="grat-detail-card">
      <p className="grat-quote">"{item.content}"</p>
      <div className="grat-meta-row">
        {item.category && <span className="chip chip-tiny">{CATEGORY_LABELS[item.category] || item.category}</span>}
        {typeof item.passes_non_proof_test === 'boolean' && (
          <span className={`grat-badge ${item.passes_non_proof_test ? 'is-pass' : 'is-fail'}`}>
            {item.passes_non_proof_test ? 'עובר ✓' : 'לא עובר ✗'}
          </span>
        )}
      </div>
      {item.depth_response && (
        <p className="grat-depth">{item.depth_response}</p>
      )}
      {flagged.length > 0 && (
        <div className="chip-row">
          {flagged.map((f, i) => (
            <span key={i} className="warning-chip">{PATTERN_FLAG_LABELS[f] || f}</span>
          ))}
        </div>
      )}
    </li>
  );
}
