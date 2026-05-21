import { useState } from 'react';
import { getSchemaModesMapping, HELPER_QUESTIONS } from '../../data/schemaToModes.js';
import { dominantSchemas, hypothesisSchemas } from '../../data/schemas.js';
import { ChevronStart } from '../../components/icons/system.jsx';

const ALL_SCHEMAS = [...dominantSchemas, ...hypothesisSchemas];

function schemaName(id) {
  const s = ALL_SCHEMAS.find((x) => x.id === id);
  return s?.name || id;
}

function modeLabel(shortId) {
  switch (shortId) {
    case 'manager':    return 'המנהל הביצועיסט';
    case 'sacrificer': return 'המקריב';
    case 'guardian':   return 'המגן החשדן';
    case 'approval':   return 'מחפש האישור';
    case 'exile':      return 'הילד שלא מספיק חשוב';
    default:           return shortId;
  }
}

function ModeCard({ mode, role, hint, smaller, onClick, className }) {
  const isPrimary = role === 'primary';
  return (
    <button
      type="button"
      onClick={onClick}
      className={className || undefined}
      style={{
        width: '100%', textAlign: 'right', direction: 'rtl',
        background: 'var(--surface)',
        borderRadius: 16,
        padding: smaller ? '12px 14px' : '14px 16px',
        border: '1px solid var(--line-soft)',
        display: 'flex', alignItems: 'center', gap: 12,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        fontFamily: 'inherit',
        transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span className="ds3-body" style={{ fontWeight: 700, fontSize: smaller ? 16 : 17 }}>
            {modeLabel(mode)}
          </span>
          <span
            className="ds3-micro"
            style={{
              padding: '2px 8px', borderRadius: 99,
              background: isPrimary ? 'var(--terra-soft)' : 'rgba(0,0,0,0.04)',
              color: isPrimary ? 'var(--terra)' : 'var(--ink-muted)',
              fontWeight: 600,
            }}
          >
            {isPrimary ? 'ראשי' : 'משני'}
          </span>
        </div>
        <span className="ds3-caption" style={{ lineHeight: 1.45, fontWeight: 400 }}>
          {hint}
        </span>
      </div>
      <svg width="10" height="16" viewBox="0 0 10 16" style={{ color: 'var(--ink-soft)', flexShrink: 0 }}>
        <path d="M8 1L2 8l6 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

export default function PhaseSchemaModeBridge({
  dominantSchema,
  allSchemas,
  onAccept,
  onSkip,
  onExit,
}) {
  const [view, setView] = useState('main');
  const [showSecondarySchemas, setShowSecondarySchemas] = useState(false);

  const mapping = getSchemaModesMapping(dominantSchema);
  if (!mapping) return null;

  const secondarySchemaIds = (allSchemas || []).filter(
    (id) => id && id !== dominantSchema && id !== '__other__' && getSchemaModesMapping(id)
  );

  // ── Mini diagnostic ──────────────────────────────────────────────────
  if (view === 'helper') {
    return (
      <div className="ds3-screen">
        {/* Minimal topbar — only the back chevron on visual-left (RTL "end").
            Per design 3 — no centered label, no skip on right. */}
        <div className="ds3-topbar">
          <button type="button" className="ds3-topbar-back" aria-label="חזור" onClick={() => setView('main')}>
            <ChevronStart size={22} />
          </button>
          <span className="ds3-topbar-label" />
          <span className="ds3-topbar-spacer" />
        </div>

        <main className="ds3-screen-content">
          <div style={{ padding: '20px 4px 4px' }}>
            <h1 className="ds3-h1" style={{ lineHeight: 1.35 }}>
              אם תקשיב פנימה,<br/>מי הקול ששומע עכשיו?
            </h1>
          </div>
          <div className="ds3-stack-3" style={{ marginTop: 22 }}>
            {HELPER_QUESTIONS.map((q) => (
              <div
                key={q.id}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 22,
                  padding: '16px 18px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(60,60,67,0.10)',
                  display: 'flex', alignItems: 'center', gap: 12,
                  direction: 'rtl',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ds3-body" style={{ fontWeight: 700, lineHeight: 1.35 }}>
                    {q.text}
                  </div>
                  <div className="ds3-caption ds3-text-muted" style={{ marginTop: 6 }}>
                    → {modeLabel(q.modeId)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSkip('helper_skipped')}
                  style={{
                    background: 'none', border: 'none',
                    color: 'var(--ink-muted)',
                    fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
                    textDecoration: 'underline', textUnderlineOffset: 4,
                    cursor: 'pointer',
                    padding: '6px 4px',
                  }}
                >
                  דלג
                </button>
                <button
                  type="button"
                  onClick={() => onAccept(q.modeId, 'helper_resolved')}
                  style={{
                    minWidth: 72, height: 52, borderRadius: 26,
                    background: 'var(--terra)', color: '#fff',
                    border: 'none',
                    fontFamily: 'inherit', fontSize: 17, fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(255, 106, 79, 0.40)',
                    flexShrink: 0,
                  }}
                >
                  כן
                </button>
              </div>
            ))}
          </div>
        </main>
        <footer className="ds3-screen-footer ds3-text-center">
          <p className="ds3-micro ds3-text-soft" style={{ opacity: 0.85, margin: 0 }}>
            תשובת "כן" אחת תספיק - נמשיך עם המוד הזה
          </p>
        </footer>
      </div>
    );
  }

  // ── Branch — "what doesn't fit" ─────────────────────────────────────
  if (view === 'why_not') {
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} label="גשר סכמה → מוד" onBack={() => setView('main')} />
        <main className="ds3-screen-content ds3-screen-content-center">
          <div className="ds3-stack-3" style={{ padding: '24px 0 8px' }}>
            <h1 className="ds3-h1">מה לא מתאים?</h1>
            <p className="ds3-body ds3-text-muted" style={{ marginTop: 8 }}>
              שתי דרכים להמשיך - בחר את זו שמרגישה נכונה.
            </p>
          </div>
        </main>
        <footer className="ds3-screen-footer ds3-stack-3">
          <button
            type="button"
            className="ds3-btn ds3-btn-primary"
            onClick={() => onSkip('rejected_known')}
            style={{ minHeight: 64, height: 64, lineHeight: 1.35 }}
          >
            המוד שהציעו לי לא נכון - אבל אני יודע מה כן
          </button>
          <button
            type="button"
            className="ds3-btn ds3-btn-outline-terra"
            onClick={() => setView('helper')}
          >
            אני לא מצליח לזהות מה פעיל
          </button>
        </footer>
      </div>
    );
  }

  // ── Main bridge ──────────────────────────────────────────────────────
  return (
    <div className="ds3-screen">
      <Topbar onExit={onExit} label="גשר סכמה → מוד" />
      <main className="ds3-screen-content">
        <div style={{ marginTop: 8 }}>
          <p className="ds3-caption" style={{ marginBottom: 6 }}>הסכמה שזיהית:</p>
          <h1 className="ds3-h1 ds3-schema-name" style={{
            color: 'var(--terra)',
            fontWeight: 700,
            lineHeight: 1.3,
            marginBottom: 18,
          }}>
            {schemaName(dominantSchema)}
          </h1>
          <p className="ds3-body" style={{ marginBottom: 14, lineHeight: 1.55 }}>
            כשהיא פעילה אצלך, היא לרוב מתבטאת דרך:
          </p>
        </div>

        <span className="ds3-bridge-connector" aria-hidden="true" />

        <div className="ds3-stack-3">
          <ModeCard mode={mapping.primary.id}   role="primary"   hint={mapping.primary.hint} className="ds3-bridge-primary" />
          <ModeCard mode={mapping.secondary.id} role="secondary" hint={mapping.secondary.hint} />
        </div>

        <div className="ds3-text-center" style={{ padding: '22px 0 14px' }}>
          <p className="ds3-body" style={{ fontWeight: 500 }}>
            מתאים למה שאתה מרגיש עכשיו?
          </p>
        </div>

        {secondarySchemaIds.length > 0 && (
          <div style={{ padding: '14px 0 18px', borderTop: '1px solid var(--line-soft)', marginTop: 14 }}>
            <button
              type="button"
              onClick={() => setShowSecondarySchemas((e) => !e)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, padding: 0,
                fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
                color: 'var(--ink-muted)',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" style={{
                transform: showSecondarySchemas ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}>
                <path d="M2 3l3 4 3-4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>ראה גם מודים של הסכמות הנוספות שזיהית</span>
            </button>
            {showSecondarySchemas && (
              <div className="ds3-stack-3" style={{ marginTop: 12 }}>
                {secondarySchemaIds.map((schemaId) => {
                  const m = getSchemaModesMapping(schemaId);
                  if (!m) return null;
                  return (
                    <div key={schemaId}>
                      <p className="ds3-micro" style={{ fontWeight: 600, padding: '4px 4px 8px', letterSpacing: '0.02em' }}>
                        מתוך {schemaName(schemaId)}
                      </p>
                      <div className="ds3-stack-2">
                        <ModeCard mode={m.primary.id}   role="primary"   hint={m.primary.hint}   smaller />
                        <ModeCard mode={m.secondary.id} role="secondary" hint={m.secondary.hint} smaller />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="ds3-screen-footer ds3-stack-3">
        <button
          type="button"
          className="ds3-btn ds3-btn-primary"
          onClick={() => onAccept(mapping.primary.id, 'accepted')}
        >
          כן - אבחר את המוד הראשי
        </button>
        <button
          type="button"
          className="ds3-btn ds3-btn-outline-terra"
          onClick={() => setView('why_not')}
        >
          לא - בוא נבדוק מה כן עכשיו
        </button>
      </footer>
    </div>
  );
}

function Topbar({ onExit, onBack, label }) {
  return (
    <div className="ds3-topbar">
      {onBack ? (
        <button type="button" className="ds3-topbar-back" onClick={onBack} aria-label="חזור">
          <ChevronStart size={22} />
        </button>
      ) : (
        <span className="ds3-topbar-spacer" />
      )}
      <span className="ds3-topbar-label">{label}</span>
      <button type="button" className="ds3-topbar-back" aria-label="צא" onClick={onExit}>
        <ChevronStart size={22} />
      </button>
    </div>
  );
}
