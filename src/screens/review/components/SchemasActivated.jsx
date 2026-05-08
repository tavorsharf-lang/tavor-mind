import EmptyState from './EmptyState.jsx';

export default function SchemasActivated({ data }) {
  const activations = Array.isArray(data?.activations) ? data.activations : [];
  const top = activations.slice(0, 5);
  const total = activations.reduce((s, a) => s + a.count, 0);
  const max = top[0]?.count || 1;
  const dominant = top[0];
  const dominantRatio = total > 0 && dominant ? dominant.count / total : 0;
  const hasDeprivation = activations.some((a) => a.schema === 'emotional_deprivation');

  return (
    <section className="review-section">
      <header className="review-section-header">
        <h3 className="review-section-title">סכמות פעילות</h3>
        <p className="review-section-sub">איזו אמונה ליבתית פעלה הכי הרבה</p>
      </header>

      {top.length === 0 ? (
        <EmptyState inline />
      ) : (
        <>
          <ul className="schema-row-list">
            {top.map((s) => {
              const pct = Math.max(0, Math.min(100, (s.count / max) * 100));
              return (
                <li key={s.schema} className="schema-presence-row">
                  <div className="schema-presence-head">
                    <span className="schema-presence-label">{s.label}</span>
                    <span className="schema-presence-count">{s.count}×</span>
                  </div>
                  <div className="schema-presence-track">
                    <div className="schema-presence-fill" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
          {dominantRatio > 0.5 && (
            <p className="schema-dominant-line">
              {dominant.label} הייתה הסכמה הדומיננטית. שווה לתת לה קשב — לא להילחם בה, רק להכיר.
            </p>
          )}
          {hasDeprivation && (
            <p className="schema-hypothesis-line">
              מחסור רגשי — השערה פעילה — הופיעה בתקופה זו. סימן לבדיקה ולא למסקנה.
            </p>
          )}
        </>
      )}
    </section>
  );
}
