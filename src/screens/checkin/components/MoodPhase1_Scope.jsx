import { useEffect, useState } from 'react';
import { formatTimeOfDay } from '../../../utils/dateHelpers.js';

export default function MoodPhase1Scope({ value, onChange }) {
  const [now, setNow] = useState(() => formatTimeOfDay());

  useEffect(() => {
    const id = setInterval(() => setNow(formatTimeOfDay()), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <h1 className="phase-title">תיעוד רגש או מצב רוח</h1>
      <p className="phase-subtitle">על מה הרישום הזה?</p>
      <div className="mood-scope-grid">
        <button
          type="button"
          className={`mood-scope-card ${value === 'moment' ? 'is-selected' : ''}`}
          onClick={() => onChange('moment')}
          aria-pressed={value === 'moment'}
        >
          <span className="mood-scope-check" aria-hidden="true">✓</span>
          <span className="mood-scope-title">איך אתה מרגיש כרגע</span>
          <span className="mood-scope-meta">{now}</span>
        </button>
        <button
          type="button"
          className={`mood-scope-card ${value === 'day' ? 'is-selected' : ''}`}
          onClick={() => onChange('day')}
          aria-pressed={value === 'day'}
        >
          <span className="mood-scope-check" aria-hidden="true">✓</span>
          <span className="mood-scope-title">איך הרגשת היום באופן כללי</span>
          <span className="mood-scope-meta">סיכום של היום</span>
        </button>
      </div>
    </>
  );
}
