import { useState } from 'react';

const PARTS = [
  { id: 'critic',   name: 'החלק הביקורתי',     desc: 'דורש ממני יותר. מודד.',          tone: 'terra' },
  { id: 'fear',     name: 'החלק שמפחד מטעות',  desc: 'בודק שוב ושוב.',                 tone: 'blue' },
  { id: 'child',    name: 'הילד שצריך אישור',   desc: 'קטן. מחפש עיניים חמות.',         tone: 'terra' },
  { id: 'distancer',name: 'החלק שמתרחק',        desc: 'מנתק כדי לא להרגיש.',            tone: 'muted' },
];

const TONE_COLOR = {
  terra: 'var(--terra)',
  blue: 'var(--lichen)',
  muted: 'var(--ink-muted)',
};

export default function PhaseParts({
  selectedPart,
  setSelectedPart,
  customPart,
  setCustomPart,
  onNext,
  onSkip,
  onExit,
}) {
  const [showOther, setShowOther] = useState(selectedPart === '__other__');

  return (
    <div className="ds3-screen">
      <div className="ds3-topbar">
        <button type="button" className="ds3-topbar-skip" onClick={onSkip}>
          אדלג
        </button>
        <span className="ds3-topbar-label">רגש · חלקים</span>
        <button type="button" className="ds3-topbar-back" aria-label="צא" onClick={onExit}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <main className="ds3-screen-content">
        <div className="ds3-stack-2" style={{ marginTop: 8 }}>
          <h1 className="ds3-h1">איזה חלק בך מרגיש את זה?</h1>
          <p className="ds3-body ds3-text-muted" style={{ lineHeight: 1.55 }}>
            לא <em style={{ fontStyle: 'italic' }}>להזדהות</em> איתו — רק לראות אותו.<br/>
            הוא בא להגן עליך.
          </p>
        </div>

        <div className="ds3-stack-3" style={{ marginTop: 22 }}>
          {PARTS.map((p) => {
            const isSel = selectedPart === p.id;
            const tint = TONE_COLOR[p.tone];
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => { setSelectedPart(p.id); setShowOther(false); }}
                aria-pressed={isSel}
                style={{
                  width: '100%', textAlign: 'right', direction: 'rtl',
                  background: isSel ? 'var(--surface)' : 'transparent',
                  border: isSel ? 'none' : '1px solid var(--line-soft)',
                  borderRadius: 16,
                  padding: '14px 16px',
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: isSel ? '0 1px 2px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(60,60,67,0.10)' : 'none',
                  transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: tint, marginTop: 8, flexShrink: 0,
                  opacity: isSel ? 1 : 0.85,
                }}/>
                <div style={{ flex: 1 }}>
                  <div className="ds3-body" style={{ fontWeight: isSel ? 700 : 600, color: 'var(--ink)' }}>
                    {p.name}
                  </div>
                  <div className="ds3-caption ds3-text-muted" style={{ marginTop: 2 }}>
                    {p.desc}
                  </div>
                </div>
              </button>
            );
          })}

          {/* "Something else — I'll write it myself" */}
          <button
            type="button"
            onClick={() => { setSelectedPart('__other__'); setShowOther(true); }}
            aria-pressed={selectedPart === '__other__'}
            style={{
              width: '100%', textAlign: 'right', direction: 'rtl',
              background: selectedPart === '__other__' ? 'var(--surface)' : 'transparent',
              border: `1px dashed var(--line-soft)`,
              borderRadius: 16,
              padding: '14px 16px',
              display: 'flex', alignItems: 'flex-start', gap: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: 'var(--ink-muted)', marginTop: 8, flexShrink: 0,
              opacity: 0.5,
            }}/>
            <div style={{ flex: 1 }}>
              <div className="ds3-body" style={{ fontWeight: 600 }}>משהו אחר</div>
              <div className="ds3-caption ds3-text-muted" style={{ marginTop: 2 }}>אכתוב בעצמי.</div>
            </div>
          </button>

          {showOther && (
            <input
              type="text"
              className="ds3-input"
              placeholder="תאר את החלק במילים שלך..."
              value={customPart || ''}
              onChange={(e) => setCustomPart(e.target.value)}
              autoFocus
            />
          )}
        </div>
      </main>

      <footer className="ds3-screen-footer">
        <button
          type="button"
          className={`ds3-btn ${selectedPart ? 'ds3-btn-primary' : 'ds3-btn-cream'}`}
          disabled={!selectedPart || (selectedPart === '__other__' && !customPart?.trim())}
          onClick={onNext}
        >
          להקשיב לחלק הזה
        </button>
      </footer>
    </div>
  );
}
