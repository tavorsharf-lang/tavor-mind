import { TAVORS_TASKS_URL } from '../morningContent.js';

export default function IntentionPicker({ intentions, selected, onToggle }) {
  const openJournal = () => {
    window.open(TAVORS_TASKS_URL, '_blank', 'noopener,noreferrer');
  };

  const hasSelection = selected.length > 0;

  return (
    <div className="morning-stage morning-intentions">
      <h2 className="morning-headline">בחר כוונה ליום.</h2>
      <p className="morning-sub-quiet">אחת או שתיים. מה שמדבר אליך.</p>

      <div className="morning-intent-grid">
        {intentions.map((text, i) => {
          const isSelected = selected.includes(text);
          const isFaded = hasSelection && !isSelected;
          return (
            <button
              key={i}
              type="button"
              className={`morning-intent-card ${isSelected ? 'is-selected' : ''} ${isFaded ? 'is-faded' : ''}`}
              onClick={() => onToggle(text)}
              aria-pressed={isSelected}
            >
              {text}
            </button>
          );
        })}
      </div>

      <button type="button" className="morning-btn morning-btn-primary" onClick={openJournal}>
        פתח יומן ובנה את היום
      </button>
    </div>
  );
}
