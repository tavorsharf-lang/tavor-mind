import { useState, useEffect } from 'react';
import { dominantSchemas } from '../../data/schemas.js';

export default function PhaseSchemaReflection({
  triggerSchemas,        // schemas selected during trigger analysis (Phase 8 step 6)
  reflectionSelection,
  setReflectionSelection,
  reflectionText,
  setReflectionText,
  onNext,
  onSkip,
  onExit,
}) {
  // Build the candidate schema list — start with what user picked in Phase 8,
  // pad up to ~4 with the dominant ones.
  const initialSelected = new Set(reflectionSelection || triggerSchemas || []);
  const [selected, setSelected] = useState(initialSelected);

  // Auto-save reflection text after pause (debounced via simple setTimeout)
  const [savedNote, setSavedNote] = useState(false);
  useEffect(() => {
    if (!reflectionText) return;
    const t = setTimeout(() => setSavedNote(true), 800);
    return () => clearTimeout(t);
  }, [reflectionText]);

  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
    setReflectionSelection(Array.from(next));
  };

  // Top 4 candidates: trigger schemas first, then fill from dominantSchemas
  const candidateList = [];
  const seen = new Set();
  (triggerSchemas || []).forEach((id) => {
    if (id && id !== '__other__' && !seen.has(id)) {
      candidateList.push(id);
      seen.add(id);
    }
  });
  for (const s of dominantSchemas) {
    if (candidateList.length >= 4) break;
    if (!seen.has(s.id)) {
      candidateList.push(s.id);
      seen.add(s.id);
    }
  }

  const schemaName = (id) => dominantSchemas.find((s) => s.id === id)?.name || id;

  return (
    <div className="ds3-screen">
      <div className="ds3-topbar">
        <button type="button" className="ds3-topbar-skip" onClick={onSkip}>
          לדלג על הרישום
        </button>
        <span className="ds3-topbar-label" />
        <button type="button" className="ds3-topbar-back" aria-label="צא" onClick={onExit}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <main className="ds3-screen-content">
        <div className="ds3-stack-2" style={{ marginTop: 8 }}>
          <p className="ds3-caption ds3-text-muted">אחרי הסערה · לראות בשקט</p>
          <h1 className="ds3-h1">האם זה מוכר?</h1>
          <p className="ds3-body ds3-text-muted" style={{ lineHeight: 1.6 }}>
            אם בא — נסה לראות אם התחושה הזו<br/>
            מזכירה לך משהו אחר.
          </p>
        </div>

        {/* Schema chips */}
        <div style={{ marginTop: 24 }}>
          <p className="ds3-caption ds3-text-muted" style={{ marginBottom: 10 }}>
            סכמות שעלו לאחרונה
          </p>
          <div className="ds3-chip-group">
            {candidateList.map((id) => {
              const isSel = selected.has(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggle(id)}
                  aria-pressed={isSel}
                  style={{
                    padding: '8px 14px', borderRadius: 999,
                    border: `1px solid ${isSel ? 'var(--ink)' : 'var(--line-soft)'}`,
                    background: isSel ? 'var(--ink)' : 'transparent',
                    color: isSel ? '#fff' : 'var(--ink)',
                    fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
                    cursor: 'pointer', transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)',
                  }}
                >
                  {schemaName(id)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reflection field */}
        <div style={{
          marginTop: 22,
          background: 'var(--surface)',
          borderRadius: 22,
          padding: 18,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(60,60,67,0.10)',
        }}>
          <p className="ds3-caption ds3-text-muted" style={{ marginBottom: 8 }}>
            מתי הרגשתי ככה לאחרונה?
          </p>
          <textarea
            className="ds3-textarea"
            rows={5}
            value={reflectionText || ''}
            onChange={(e) => { setReflectionText(e.target.value); setSavedNote(false); }}
            placeholder="לדוגמה: לפני הבחינה. שתי שעות לפני, התחלתי לבדוק שוב ושוב..."
            style={{
              border: 'none',
              padding: '8px 0',
              background: 'transparent',
              fontSize: 17,
              lineHeight: 1.7,
              minHeight: 100,
            }}
          />
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line-soft)',
          }}>
            <span className="ds3-micro ds3-text-muted">זה ייכנס למה שנדבר עליו ביום ג׳</span>
            <span className="ds3-micro ds3-text-muted">
              {savedNote && reflectionText ? 'נשמר אוטומטית' : ''}
            </span>
          </div>
        </div>
      </main>

      <footer className="ds3-screen-footer">
        <button type="button" className="ds3-btn ds3-btn-ink" onClick={onNext}>
          לשמור ברגע שקט
        </button>
      </footer>
    </div>
  );
}
