const NEED_TYPE_LABELS = {
  child: 'צורך מהילד',
  protector: 'צורך מהמגן',
};

export default function ILanguageDetail({ analysis }) {
  const p = analysis.payload || {};
  const components = p.components || {};
  const deeper = p.deeper_emotion_check;
  const needCheck = p.need_check;
  return (
    <div className="detail-sections">
      {p.context && (
        <section className="detail-section">
          <h3 className="form-section-label">ההקשר</h3>
          <div className="callout callout-soft">{p.context}</div>
        </section>
      )}

      {p.original_phrasing && (
        <section className="detail-section">
          <h3 className="form-section-label">הניסוח הראשוני</h3>
          <blockquote className="quote-block">{p.original_phrasing}</blockquote>
        </section>
      )}

      {deeper && (
        <section className="detail-section">
          <h3 className="form-section-label">בדיקת עומק</h3>
          {deeper.surface_emotion && (
            <p><strong>שטח:</strong> {deeper.surface_emotion}</p>
          )}
          {deeper.underlying_emotion && (
            <p><strong>מתחת:</strong> {deeper.underlying_emotion}</p>
          )}
          {deeper.shifted_after_check && (
            <span className="success-chip">הניסוח השתנה אחרי הבדיקה ✓</span>
          )}
        </section>
      )}

      {needCheck && (
        <section className="detail-section">
          <h3 className="form-section-label">בדיקת צורך</h3>
          {needCheck.stated_need && (
            <p><strong>צורך מוצהר:</strong> {needCheck.stated_need}</p>
          )}
          {needCheck.type && (
            <span className={`type-chip type-chip-sm ${needCheck.type === 'child' ? 'need-child' : 'need-protector'}`}>
              {NEED_TYPE_LABELS[needCheck.type] || needCheck.type}
            </span>
          )}
          {needCheck.what_child_really_needs && (
            <p style={{ marginTop: 8 }}>
              <strong>מה הילד באמת צריך:</strong> {needCheck.what_child_really_needs}
            </p>
          )}
        </section>
      )}

      <section className="detail-section">
        <h3 className="form-section-label">רכיבי NVC</h3>
        <div className="nvc-grid">
          <NvcCell label="תצפית" value={components.observation} />
          <NvcCell label="רגש" value={components.feeling} />
          <NvcCell label="צורך" value={components.need} />
          <NvcCell label="בקשה" value={components.request} />
        </div>
      </section>

      {p.final_phrasing && (
        <section className="detail-section">
          <h3 className="form-section-label">הניסוח הסופי</h3>
          <div className="callout callout-prominent callout-large">{p.final_phrasing}</div>
        </section>
      )}

      {Array.isArray(p.pitfalls_avoided) && p.pitfalls_avoided.length > 0 && (
        <section className="detail-section">
          <h3 className="form-section-label">מלכודות שנמנעו</h3>
          <div className="chip-row">
            {p.pitfalls_avoided.map((s, i) => <span key={i} className="chip">{s}</span>)}
          </div>
        </section>
      )}

      {p.softened_too_much === true && (
        <div className="warning-chip warning-chip-block">נטה לרכך מעבר לצורך</div>
      )}
    </div>
  );
}

function NvcCell({ label, value }) {
  return (
    <div className="nvc-cell">
      <h4 className="nvc-cell-label">{label}</h4>
      <p className="nvc-cell-value">{value || '-'}</p>
    </div>
  );
}
