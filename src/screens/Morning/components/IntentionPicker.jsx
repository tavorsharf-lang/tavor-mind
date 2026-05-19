import { useState } from 'react';
import MeditationPlayer from '../../emergency/components/MeditationPlayer.jsx';
import { MEDITATIONS_BY_ID } from '../../../data/meditations.js';
import { TAVORS_TASKS_URL } from '../morningContent.js';

export default function IntentionPicker({ intentions, selected, onToggle }) {
  const [active, setActive] = useState(null);

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

      <div className="morning-finish-actions">
        <button type="button" className="morning-btn morning-btn-primary" onClick={openJournal}>
          פתח יומן ובנה את היום
        </button>

        <div className="morning-finish-or" aria-hidden="true">או</div>

        <button
          type="button"
          className="morning-btn morning-btn-soft"
          onClick={() => setActive(MEDITATIONS_BY_ID['morning-short'])}
        >
          הפעל מדיטציית בוקר קצרה
        </button>
        <button
          type="button"
          className="morning-btn morning-btn-soft"
          onClick={() => setActive(MEDITATIONS_BY_ID['morning-long'])}
        >
          הפעל מדיטציית בוקר ארוכה
        </button>
      </div>

      {active && (
        <MeditationPlayer
          open={!!active}
          src={active.src}
          title={active.title}
          subtitle={active.subtitle}
          onClose={() => setActive(null)}
          onComplete={() => setActive(null)}
        />
      )}
    </div>
  );
}
