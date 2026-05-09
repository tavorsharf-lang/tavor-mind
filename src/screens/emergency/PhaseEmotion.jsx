import { useState } from 'react';

const GROUPS = [
  {
    label: 'קרוב לפחד',
    items: ['חרדה', 'דריכות', 'אימה', 'חוסר ביטחון'],
  },
  {
    label: 'קרוב לבושה',
    items: ['לא מספיק', 'חשיפה', 'אשמה'],
  },
  {
    label: 'קרוב לעצב',
    items: ['ריקנות', 'ייאוש', 'בדידות'],
  },
  {
    label: 'קרוב לכעס',
    items: ['תסכול', 'זעם', 'גועל'],
  },
];

export default function PhaseEmotion({
  selectedEmotions,
  setSelectedEmotions,
  customEmotion,
  setCustomEmotion,
  onNext,
  onSkip,
  onExit,
}) {
  const [showOther, setShowOther] = useState(!!customEmotion);
  const selected = new Set(selectedEmotions || []);

  const toggle = (item) => {
    const next = new Set(selected);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    setSelectedEmotions(Array.from(next));
  };

  const totalSelected = selected.size + (customEmotion?.trim() ? 1 : 0);
  const hasAny = totalSelected > 0;

  return (
    <div className="ds3-screen">
      <div className="ds3-topbar">
        <button type="button" className="ds3-topbar-skip" onClick={onSkip}>
          אין שם — רק תחושה
        </button>
        <span className="ds3-topbar-label">רגש · לתת שם</span>
        <button type="button" className="ds3-topbar-back" aria-label="צא" onClick={onExit}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <main className="ds3-screen-content">
        <div className="ds3-stack-2" style={{ marginTop: 8 }}>
          <h1 className="ds3-h1">מה עולה?</h1>
          <p className="ds3-body ds3-text-muted">
            אפשר יותר מאחד. אפשר גם משהו שלא ברשימה.
          </p>
        </div>

        <div className="ds3-stack-5" style={{ marginTop: 22 }}>
          {GROUPS.map((g) => (
            <div key={g.label}>
              <p className="ds3-chip-group-label">{g.label}</p>
              <div className="ds3-chip-group">
                {g.items.map((it) => {
                  const isSel = selected.has(it);
                  return (
                    <button
                      key={it}
                      type="button"
                      onClick={() => toggle(it)}
                      className={`ds3-chip ${isSel ? 'is-selected' : ''}`}
                      aria-pressed={isSel}
                    >
                      {it}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            {!showOther ? (
              <button
                type="button"
                onClick={() => setShowOther(true)}
                className="ds3-chip ds3-chip-dashed"
              >
                + משהו אחר
              </button>
            ) : (
              <input
                type="text"
                className="ds3-input"
                placeholder="במילה משלך..."
                value={customEmotion || ''}
                onChange={(e) => setCustomEmotion(e.target.value)}
                autoFocus
              />
            )}
          </div>
        </div>
      </main>

      <footer className="ds3-screen-footer">
        <button
          type="button"
          className={`ds3-btn ${hasAny ? 'ds3-btn-primary' : 'ds3-btn-cream'}`}
          disabled={!hasAny}
          onClick={onNext}
        >
          {hasAny ? `להמשיך עם ${totalSelected}` : 'להמשיך'}
        </button>
      </footer>
    </div>
  );
}
