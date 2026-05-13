import { useMemo } from 'react';
import { LIFE_FACTORS } from '../../../data/lifeFactors.js';
import { sortByFrequency } from '../../../utils/optionFrequency.js';

export default function MoodPhase4Factors({ value, onChange }) {
  const sortedFactors = useMemo(() => sortByFrequency(LIFE_FACTORS, 'life_factors'), []);

  const toggle = (id) => {
    const next = new Set(value);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  };

  return (
    <>
      <h1 className="phase-title">מה הכי משפיע עליך?</h1>
      <p className="phase-subtitle">בחר תחום אחד או יותר. אפשר גם לדלג.</p>
      <div className="mood-factor-grid" role="group" aria-label="בחר תחומי השפעה">
        {sortedFactors.map((f) => {
          const selected = value.has(f.id);
          return (
            <button
              key={f.id}
              type="button"
              className={`mood-factor-chip ${selected ? 'is-selected' : ''}`}
              onClick={() => toggle(f.id)}
              aria-pressed={selected}
              style={{ '--factor-color': f.color }}
            >
              <span className="mood-factor-dot" aria-hidden="true" />
              {f.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
