import { PhaseIntegration as Phase10ClosingIcon } from '../../components/icons/system.jsx';

export default function Phase10Closing({
  analyzed,
  note,
  setNote,
  onFinish,
  onContinueWithClaude,
  onExit,
  savingState,
}) {
  const saving = savingState === 'saving';
  const saved = savingState === 'saved';
  const inFlight = saving || saved;

  return (
    <div className="ds3-screen">
      <div className="ds3-topbar">
        <button type="button" className="ds3-x-btn" aria-label="סגור" onClick={onExit}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
        </button>
        <span className="ds3-topbar-label">
          <span className="ds3-topbar-label-icon color-tone-reflect" aria-hidden="true"><Phase10ClosingIcon /></span>
          סגירה
        </span>
        <span className="ds3-topbar-spacer" />
      </div>

      <main className="ds3-screen-content">
        <div style={{ padding: '8px 0 4px', textAlign: 'center' }}>
          <div className="ds3-display" style={{ fontSize: 34, fontWeight: 800 }}>
            ההרגשה עכשיו
          </div>
          <p className="ds3-body ds3-text-muted" style={{ marginTop: 8 }}>
            אם בא לך לכתוב משהו לעצמך - לא חובה.
          </p>
        </div>

        <div style={{ padding: '24px 0 0' }}>
          <textarea
            className="ds3-textarea"
            rows={6}
            placeholder="הערה קצרה לעצמך (לא חובה)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </main>

      <footer className="ds3-screen-footer">
        {analyzed && onContinueWithClaude && (
          <button
            type="button"
            className="ds3-btn ds3-btn-primary"
            onClick={onContinueWithClaude}
            disabled={inFlight}
            style={{ marginBottom: 10 }}
          >
            ייצא לקלוד
          </button>
        )}

        <button
          type="button"
          className="ds3-btn ds3-btn-cream"
          onClick={onFinish}
          disabled={inFlight}
          style={{ marginTop: 10 }}
        >
          {saving ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: 'currentColor', animation: 'ds3BreathDot 1.4s ease-in-out infinite' }} />
              <span>שומר…</span>
            </span>
          ) : saved ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="5 12 10 17 19 7" />
              </svg>
              <span>נשמר</span>
            </span>
          ) : 'סיימתי'}
        </button>
      </footer>
    </div>
  );
}
