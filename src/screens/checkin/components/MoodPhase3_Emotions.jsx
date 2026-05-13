import { useMemo, useState } from 'react';
import { EMOTIONS, getEmotionsForValence } from '../../../data/emotionsCorpus.js';
import { sortByFrequency } from '../../../utils/optionFrequency.js';

export default function MoodPhase3Emotions({ valence, value, onChange }) {
  const [showAll, setShowAll] = useState(false);

  const visible = useMemo(() => {
    const pool = showAll ? EMOTIONS : getEmotionsForValence(valence);
    return sortByFrequency(pool, 'emotions');
  }, [valence, showAll]);

  const toggle = (id) => {
    const next = new Set(value);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  };

  return (
    <>
      <h1 className="phase-title">מה מתאר את התחושה הזו?</h1>
      <p className="phase-subtitle">סמן רגש אחד או יותר. אפשר גם לדלג.</p>
      <div className="mood-emotion-grid" role="group" aria-label="בחר רגשות">
        {visible.map((e) => {
          const selected = value.has(e.id);
          return (
            <button
              key={e.id}
              type="button"
              className={`mood-emotion-chip ${selected ? 'is-selected' : ''}`}
              onClick={() => toggle(e.id)}
              aria-pressed={selected}
            >
              {e.label}
            </button>
          );
        })}
      </div>
      {!showAll && (
        <button
          type="button"
          className="mood-show-all-btn"
          onClick={() => setShowAll(true)}
        >
          הצג רגשות נוספים
        </button>
      )}
    </>
  );
}
