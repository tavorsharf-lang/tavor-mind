import EmptyState from './EmptyState.jsx';
import { PATTERN_LABELS } from '../../../data/analysisSchemas.js';

const ORDER = ['not_enough_appeared', 'dichotomous_phrasing', 'body_as_compass', 'core_child_addressed'];

function interpret(key, ratio, count) {
  if (key === 'not_enough_appeared') {
    if (ratio < 0.3) return 'הקול הזה היה שקט יחסית בתקופה הזו.';
    if (ratio <= 0.6) return 'הקול הזה הופיע בקביעות.';
    return 'הקול הזה היה דומיננטי. הילד מבקש מקום.';
  }
  if (key === 'dichotomous_phrasing') {
    if (ratio < 0.2) return 'שמרת על הווה — הניסוחים נשארו עם מה שיש, בלי לקנות מהעבר.';
    if (ratio <= 0.5) return 'המבנה "פעם X, היום Y" הופיע מדי פעם.';
    return 'הרבה מהניסוחים מבוססים על ניגוד לעבר. שווה לשאול: מה ההווה לבד אומר?';
  }
  if (key === 'body_as_compass') {
    if (ratio < 0.3) return 'הראש הוביל הרבה. הגוף פחות.';
    if (ratio <= 0.6) return 'הגוף נכח ככלי. אפשר להישען עליו יותר.';
    return 'הגוף הוביל. סימן בריא — המידע הראשון מגיע משם.';
  }
  if (key === 'core_child_addressed') {
    if (count === 0) return 'לא פנית ישירות לילד הגלותי בתקופה הזו. אין רע — אבל אם זה נמשך, שווה לשים לב.';
    if (ratio <= 0.4) return 'פנית אליו לפעמים.';
    return 'פנית אליו בקביעות. הוא לא לבד.';
  }
  return null;
}

export default function PatternsPresence({ data }) {
  const total = data?.[ORDER[0]]?.total ?? 0;

  return (
    <section className="review-section">
      <header className="review-section-header">
        <h3 className="review-section-title">דפוסים שצפו</h3>
        <p className="review-section-sub">מה שהופיע במילים שלך — לא רק במה שהרגשת</p>
      </header>

      {total === 0 ? (
        <EmptyState inline message="עוד אין ניתוחים בתקופה זו. ייבא ניתוחים כדי לראות דפוסים." />
      ) : (
        <ul className="pattern-row-list">
          {ORDER.map((key) => {
            const slot = data[key] || { count: 0, total };
            const ratio = slot.total > 0 ? slot.count / slot.total : 0;
            const pct = Math.max(0, Math.min(100, ratio * 100));
            const line = interpret(key, ratio, slot.count);
            return (
              <li key={key} className="pattern-presence-row">
                <div className="pattern-presence-head">
                  <span className="pattern-presence-label">{PATTERN_LABELS[key]}</span>
                  <span className="pattern-presence-count">
                    הופיע ב-{slot.count} מתוך {slot.total} ניתוחים
                  </span>
                </div>
                <div className="pattern-presence-track">
                  <div className="pattern-presence-fill" style={{ width: `${pct}%` }} />
                </div>
                {line && <p className="pattern-presence-line">{line}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
