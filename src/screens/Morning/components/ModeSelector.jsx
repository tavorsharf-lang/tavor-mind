import { useState } from 'react';
import { MODES } from '../morningContent.js';

export default function ModeSelector({ onContinue }) {
  const [selectedId, setSelectedId] = useState(null);
  const selected = selectedId ? MODES.find((m) => m.id === selectedId) : null;

  return (
    <div className="morning-stage morning-modes">
      <h2 className="morning-headline">איזה חלק התעורר ראשון איתי הבוקר?</h2>

      <div className="morning-modes-list">
        {MODES.map((mode) => {
          const isSelected = selectedId === mode.id;
          const isFaded = selectedId && !isSelected;
          return (
            <button
              key={mode.id}
              type="button"
              className={`morning-mode-card ${isSelected ? 'is-selected' : ''} ${isFaded ? 'is-faded' : ''}`}
              onClick={() => setSelectedId(mode.id)}
            >
              <span className="morning-mode-label">{mode.label}</span>
              <span className="morning-mode-desc">{mode.description}</span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="morning-mode-reaction" key={selected.id}>
          {selected.reaction}
        </div>
      )}

      {selected && (
        <button type="button" className="morning-btn morning-btn-primary" onClick={() => onContinue(selected.id)}>
          המשך
        </button>
      )}
    </div>
  );
}
