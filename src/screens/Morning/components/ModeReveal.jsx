import { MODES } from '../morningContent.js';

export default function ModeReveal({ modeId, canRePick, onRePick, onContinue }) {
  const mode = MODES.find((m) => m.id === modeId);
  if (!mode) return null;

  return (
    <div className="morning-stage morning-reveal">
      <article className="morning-reveal-card">
        <h2 className="morning-reveal-title">{mode.label}</h2>

        <section className="morning-reveal-section">
          <h3 className="morning-reveal-label">מאיפה הוא בא</h3>
          <p className="morning-reveal-body">{mode.origin}</p>
        </section>

        <section className="morning-reveal-section">
          <h3 className="morning-reveal-label">בבוקר</h3>
          <p className="morning-reveal-body">{mode.inMorning}</p>
        </section>

        <section className="morning-reveal-section">
          <h3 className="morning-reveal-label">מה הוא רוצה</h3>
          <p className="morning-reveal-body">{mode.wants}</p>
        </section>

        <hr className="morning-reveal-divider" aria-hidden="true" />

        <p className="morning-reveal-reaction">{mode.reaction}</p>
      </article>

      {canRePick && (
        <button type="button" className="morning-reveal-repick" onClick={onRePick}>
          לבחור חלק אחר
        </button>
      )}

      <button type="button" className="morning-btn morning-btn-primary" onClick={onContinue}>
        המשך
      </button>
    </div>
  );
}
