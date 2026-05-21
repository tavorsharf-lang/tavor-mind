import { formatHebrewDate, getIsraelDateString } from '../../../utils/dateHelpers.js';
import { SchemaVulnerable as CoreChildIcon } from '../../../components/icons/system.jsx';

export default function CoreChildSection({ data }) {
  if (!data) return null;
  const { sessions_addressed = 0, appearances_in_text = 0, last_addressed = null, needs_expressed = [] } = data;
  if (appearances_in_text === 0 && sessions_addressed === 0) return null;

  const showUnaddressedNote = !last_addressed && appearances_in_text > 3;
  let lastAddressedLabel = null;
  if (last_addressed) {
    try { lastAddressedLabel = formatHebrewDate(getIsraelDateString(new Date(last_addressed))); }
    catch { lastAddressedLabel = null; }
  }

  return (
    <section className="review-section core-child-section">
      <header className="review-section-header">
        <h3 className="review-section-title">
          <span className="review-section-icon icon-tone-self" aria-hidden="true"><CoreChildIcon /></span>
          הילד
        </h3>
        <p className="review-section-sub">מה הוא ביקש, מה הוא קיבל</p>
      </header>
      <div className="core-child-card">
        <p className="core-child-headline">
          "אני לא מספיק חשוב" הופיע {appearances_in_text} פעמים בתקופה זו.
        </p>
        <p className="core-child-subline">
          {sessions_addressed} מתוך הסשנים פנו אליו ישירות.
          {lastAddressedLabel && <> נפנית אליו לאחרונה: {lastAddressedLabel}.</>}
        </p>
        {showUnaddressedNote && (
          <p className="core-child-note">
            הוא הופיע אבל לא נפנית אליו. לא כנזיפה - כתזכורת.
          </p>
        )}
        {needs_expressed.length > 0 && (
          <div className="core-child-needs">
            <h4 className="core-needs-title">מה הוא ביקש</h4>
            <ul className="core-needs-list">
              {needs_expressed.slice(0, 6).map((need, i) => (
                <li key={i} className="core-need-quote">{need}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
