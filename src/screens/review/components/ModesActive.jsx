import EmptyState from './EmptyState.jsx';

const DOMINANT_LINE = {
  performer_manager: 'המנהל הביצועיסט הוביל. שווה לשאול: מה הוא מגן עליו השבוע?',
  sacrificer_manager: 'המקריב הוביל. נתת הרבה. מה נשאר לך?',
  guard_manager: 'המגן החשדן הוביל. ממה הוא הגן עליך?',
  approval_seeker: 'מחפש האישור הוביל. מאיפה ביקשת אישור החודש?',
  exiled_child: 'הילד הוביל. הוא בא להיראות.',
  healthy_adult: 'המבוגר הבריא הוביל. נדיר ויפה.',
};

export default function ModesActive({ data }) {
  const modes = Array.isArray(data) ? data : [];
  const top = modes.slice(0, 5);
  const max = top[0]?.count || 1;
  const dominant = top[0];

  return (
    <section className="review-section">
      <header className="review-section-header">
        <h3 className="review-section-title">הקולות</h3>
        <p className="review-section-sub">מי הוביל את התקופה הזו</p>
      </header>

      {top.length === 0 ? (
        <EmptyState inline message="אין מספיק נתונים על מי הוביל. עוד כמה ניתוחים יציפו את התמונה." />
      ) : (
        <>
          <ul className="mode-row-list">
            {top.map((m) => {
              const pct = Math.max(0, Math.min(100, (m.count / max) * 100));
              return (
                <li key={m.id} className="mode-presence-row">
                  <div className="mode-presence-head">
                    <span className="mode-presence-label">{m.label}</span>
                    <span className="mode-presence-count">{m.count}×</span>
                  </div>
                  <div className="mode-presence-track">
                    <div
                      className="mode-presence-fill"
                      style={{ width: `${pct}%`, background: m.color }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          {dominant && DOMINANT_LINE[dominant.id] && (
            <p className="mode-dominant-line">{DOMINANT_LINE[dominant.id]}</p>
          )}
        </>
      )}
    </section>
  );
}
