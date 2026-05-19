import { MODES } from '../morningContent.js';

export default function ModeSelector({ onSelect, onSkip }) {
  return (
    <div className="morning-stage morning-modes">
      <h2 className="morning-headline">איזה חלק התעורר ראשון איתי הבוקר?</h2>

      <div className="morning-modes-list">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className="morning-mode-card"
            onClick={() => onSelect(mode.id)}
          >
            <span className="morning-mode-label">{mode.label}</span>
            <span className="morning-mode-desc">{mode.shortDescription}</span>
          </button>
        ))}
      </div>

      {onSkip && (
        <button
          type="button"
          className="morning-skip-link"
          onClick={onSkip}
        >
          דלג
        </button>
      )}
    </div>
  );
}
