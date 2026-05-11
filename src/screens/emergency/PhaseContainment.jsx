import { useState } from 'react';
import { saveWaitingItem } from '../../utils/somethingWaitingStorage.js';

const ONBOARD_KEY = 'tavor_mind_containment_onboarded_v1';

const STRUCTURES = [
  { id: 'box',     name: 'קופסה עם מכסה', icon: 'box',    verb: 'סוגר את המכסה' },
  { id: 'cabinet', name: 'ארון נעול',     icon: 'lock',   verb: 'נועל את הדלת' },
  { id: 'lake',    name: 'אגם רחוק',      icon: 'lake',   verb: 'מרחיק עד שזה נעלם' },
  { id: 'cloud',   name: 'ענן בשמיים',    icon: 'cloud',  verb: 'משחרר ומסתכל איך זה מתרחק' },
  { id: 'custom',  name: 'מבנה אחר',      icon: 'pencil', verb: 'מקבע במקום שבחרת' },
];

const RETURN_OPTIONS = [
  { id: 'after_this_flow',   label: 'אחרי שאסיים את הזרימה הזו' },
  { id: 'next_session',      label: 'בסשן הניתוח הבא' },
  { id: 'with_therapist',    label: 'כשאדבר עם המטפל' },
  { id: 'something_waiting', label: 'ארשום ב"משהו ממתין"' },
];

function CNIcon({ kind, color = 'currentColor', size = 28 }) {
  const s = { stroke: color, fill: 'none', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (kind === 'box') return (
    <svg width={size} height={size} viewBox="0 0 28 28">
      <path d="M4 11h20v12H4z M4 11l3-4h14l3 4 M14 11v12" {...s}/>
    </svg>
  );
  if (kind === 'lock') return (
    <svg width={size} height={size} viewBox="0 0 28 28">
      <rect x="6" y="12" width="16" height="12" rx="1.5" {...s}/>
      <path d="M9 12V8a5 5 0 0110 0v4" {...s}/>
      <circle cx="14" cy="18" r="1.6" fill={color}/>
    </svg>
  );
  if (kind === 'lake') return (
    <svg width={size} height={size} viewBox="0 0 28 28">
      <path d="M2 18c4-2 8-2 12 0s8 2 12 0 M3 11l3-3M22 9l3 3" {...s}/>
      <circle cx="14" cy="9" r="2.2" {...s}/>
    </svg>
  );
  if (kind === 'cloud') return (
    <svg width={size} height={size} viewBox="0 0 28 28">
      <path d="M8 18a4 4 0 010-8 5 5 0 019.6-1.2A4 4 0 0119 18H8z" {...s}/>
    </svg>
  );
  if (kind === 'pencil') return (
    <svg width={size} height={size} viewBox="0 0 28 28">
      <path d="M4 24l3-1 14-14-2-2L5 21l-1 3z M17 7l2-2 2 2-2 2" {...s}/>
    </svg>
  );
  return null;
}

function hasSeenOnboarding() {
  try { return Boolean(localStorage.getItem(ONBOARD_KEY)); } catch { return false; }
}
function markOnboardingSeen() {
  try { localStorage.setItem(ONBOARD_KEY, String(Date.now())); } catch {}
}

export default function PhaseContainment({
  activationAtTime,
  containmentCountSoFar,
  onComplete,
  onAddToAnalysis,
  onAbortToEnd,
  onExit,
}) {
  const [stage, setStage] = useState(hasSeenOnboarding() ? 'name' : 'onboard');
  const [sentence, setSentence] = useState('');
  const [structure, setStructure] = useState(null);
  const [customStructure, setCustomStructure] = useState('');
  const [returnCommitment, setReturnCommitment] = useState(null);
  const [saving, setSaving] = useState(false);

  const showRepeatNudge = containmentCountSoFar >= 2;
  const showAbortOption = containmentCountSoFar >= 2;

  // ── Onboarding modal ────────────────────────────────────────────────
  if (stage === 'onboard') {
    return (
      <div className="ds3-screen">
        <div className="ds3-modal-overlay">
          <div className="ds3-modal-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <CNIcon kind="box" color="var(--terra)" size={22} />
              <span className="ds3-caption" style={{ color: 'var(--terra)', fontWeight: 700 }}>
                Containment — להניח רגע
              </span>
            </div>
            <p className="ds3-body" style={{ lineHeight: 1.65, marginBottom: 20 }}>
              לא כל מה שעולה צריך להיפתח עכשיו. זה לא דחיקה — זו דרך מובנית לשים משהו במקום בטוח, עם הבטחה לחזור.
              זה בא מטיפול בטראומה. עובד לרוב כשמשהו מסיט את הניתוח — זיכרון רחוק, רגש לא צפוי, מחשבה שלא קשורה ישירות.
            </p>
            <div className="ds3-stack-3">
              <button
                type="button"
                className="ds3-btn ds3-btn-primary"
                onClick={() => { markOnboardingSeen(); setStage('name'); }}
              >
                נסה
              </button>
              <button
                type="button"
                className="ds3-btn ds3-btn-outline-terra"
                onClick={onExit}
              >
                לא עכשיו
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Stage 1 — Naming ────────────────────────────────────────────────
  if (stage === 'name') {
    const enabled = sentence.trim().length > 0;
    const len = sentence.length;
    const limit = 240;
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} label="containment · 1 / 4" />
        <main className="ds3-screen-content">
          {showRepeatNudge && (
            <div className="ds3-callout-terra" style={{ marginTop: 8, marginBottom: 16 }}>
              <p className="ds3-body" style={{ lineHeight: 1.55, margin: 0 }}>
                שמת כבר {containmentCountSoFar} דברים בקונטיינר היום. לפעמים זה מה שצריך. ולפעמים זו דרך לא להישאר עם משהו. שווה לבדוק עם עצמך — או עם המטפל.
              </p>
            </div>
          )}
          <h1 className="ds3-h1" style={{ marginTop: 16, marginBottom: 22 }}>מה עולה עכשיו?</h1>
          <textarea
            className="ds3-textarea"
            rows={3}
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            placeholder='משהו ספציפי שעלה — משפט אחד'
            maxLength={limit}
            autoFocus
          />
          <div className="ds3-input-counter">
            <span>תכתוב במשפט אחד — לא יותר.</span>
            <span style={{ color: len >= limit * 0.9 ? 'var(--terra)' : undefined }}>{len} / {limit}</span>
          </div>
          <div className="ds3-text-center" style={{ marginTop: 14 }}>
            <button
              type="button"
              className="ds3-btn-quiet"
              style={{ height: 'auto', textDecoration: 'underline', textUnderlineOffset: 4, fontSize: 14 }}
              onClick={onAddToAnalysis}
            >
              זה דווקא קשור לסשן — להוסיף לאירוע
            </button>
          </div>
        </main>
        <footer className="ds3-screen-footer ds3-stack-2">
          <button
            type="button"
            className={`ds3-btn ${enabled ? 'ds3-btn-primary' : 'ds3-btn-cream'}`}
            disabled={!enabled}
            onClick={() => setStage('structure')}
          >
            הבא
          </button>
          {showAbortOption && (
            <button type="button" className="ds3-btn-quiet" onClick={onAbortToEnd}>
              ה-activation לא יורד — בוא נסיים את הסשן
            </button>
          )}
        </footer>
      </div>
    );
  }

  // ── Stage 2 — Container choice ──────────────────────────────────────
  if (stage === 'structure') {
    const enabled = structure && (structure !== 'custom' || customStructure.trim());
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} label="containment · 2 / 4" />
        <main className="ds3-screen-content">
          <h1 className="ds3-h1" style={{ marginTop: 16, marginBottom: 14, lineHeight: 1.35 }}>
            איפה תרצה להניח את זה לרגע?
          </h1>
          <div className="ds3-stack-3" style={{ marginTop: 4 }}>
            {STRUCTURES.map((s) => {
              const isSel = structure === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`ds3-card-button ${isSel ? 'is-selected' : ''}`}
                  onClick={() => setStructure(s.id)}
                  aria-pressed={isSel}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <CNIcon kind={s.icon} color={isSel ? 'var(--terra)' : 'var(--ink)'} />
                  </div>
                  <span className="ds3-body" style={{ flex: 1, fontWeight: 600 }}>{s.name}</span>
                  <div style={{
                    width: 22, height: 22, borderRadius: 11,
                    border: `1.5px solid ${isSel ? 'var(--terra)' : 'var(--line-soft)'}`,
                    background: isSel ? 'var(--terra)' : 'transparent',
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                  }}>
                    {isSel && (
                      <svg width="11" height="11" viewBox="0 0 11 11">
                        <path d="M2 5.5L4.5 8 9 3" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
            {structure === 'custom' && (
              <input
                type="text"
                className="ds3-input"
                placeholder="לדוגמה: מגרה במגירה, מצוף בים..."
                value={customStructure}
                onChange={(e) => setCustomStructure(e.target.value)}
                autoFocus
                style={{ marginTop: -4 }}
              />
            )}
          </div>
        </main>
        <footer className="ds3-screen-footer">
          <button
            type="button"
            className={`ds3-btn ${enabled ? 'ds3-btn-primary' : 'ds3-btn-cream'}`}
            disabled={!enabled}
            onClick={() => setStage('placement')}
          >
            הבא
          </button>
        </footer>
      </div>
    );
  }

  // ── Stage 3 — Placement (animated visualization) ────────────────────
  if (stage === 'placement') {
    const struct = STRUCTURES.find((s) => s.id === structure);
    const structureName = struct?.name || customStructure;
    const verb = struct?.verb || 'מקבע במקום שבחרת';
    return (
      <div className="ds3-screen">
        <div className="ds3-topbar" style={{ justifyContent: 'flex-end' }}>
          <span className="ds3-topbar-spacer" />
        </div>

        {/* Soft floating container icon */}
        <div className="ds3-center" style={{ marginTop: 6, marginBottom: 22 }}>
          <div style={{
            width: 110, height: 110, borderRadius: 32,
            background: `radial-gradient(circle at 35% 30%, #FFFFFF, rgba(255, 106, 79, 0.33))`,
            display: 'grid', placeItems: 'center',
            boxShadow: '0 14px 36px rgba(255, 106, 79, 0.33)',
            animation: 'cnFloat 4s ease-in-out infinite',
          }}>
            <CNIcon kind={struct?.icon || 'pencil'} color="var(--terra)" size={48} />
          </div>
        </div>
        <style>{`
          @keyframes cnFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
          @keyframes cnLine { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
          @keyframes cnTimer { 0% { width: 0; } 100% { width: 100%; } }
        `}</style>

        <main className="ds3-screen-content ds3-screen-content-center" style={{ gap: 24, textAlign: 'center' }}>
          <p className="ds3-body-lg" style={{ animation: 'cnLine 0.8s ease-out 0s both', lineHeight: 1.6 }}>
            תדמיין את <span style={{ color: 'var(--terra)', fontWeight: 700 }}>{structureName}</span>.
          </p>
          <p className="ds3-body-lg" style={{ animation: 'cnLine 0.8s ease-out 1.5s both', lineHeight: 1.6, opacity: 0 }}>
            תדמיין את <span style={{ color: 'var(--terra)', fontWeight: 700 }}>"{sentence}"</span> נכנס פנימה.
          </p>
          <p className="ds3-body-lg" style={{ animation: 'cnLine 0.8s ease-out 3s both', lineHeight: 1.6, opacity: 0 }}>
            תראה את עצמך <span style={{ color: 'var(--terra)', fontWeight: 700 }}>{verb}</span>.
          </p>
        </main>

        <footer className="ds3-screen-footer">
          <div style={{ width: 80, height: 2, background: 'var(--line-soft)', borderRadius: 99, margin: '0 auto 12px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--terra)', animation: 'cnTimer 30s linear forwards' }} />
          </div>
          <button
            type="button"
            className="ds3-btn ds3-btn-primary"
            onClick={() => setStage('return')}
          >
            הלאה
          </button>
        </footer>
      </div>
    );
  }

  // ── Stage 4 — Commitment to return ──────────────────────────────────
  if (stage === 'return') {
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} label="containment · 4 / 4" />
        <main className="ds3-screen-content">
          <div className="ds3-stack-3" style={{ marginTop: 16 }}>
            <h1 className="ds3-h1" style={{ lineHeight: 1.35 }}>זה לא נעלם — זה רק לא עכשיו.</h1>
            <p className="ds3-body ds3-text-muted">מתי תרצה לחזור לזה?</p>
          </div>
          <div className="ds3-stack-3" style={{ marginTop: 18 }}>
            {RETURN_OPTIONS.map((opt) => {
              const isSel = returnCommitment === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`ds3-card-button ${isSel ? 'is-selected' : ''}`}
                  onClick={() => setReturnCommitment(opt.id)}
                  aria-pressed={isSel}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: 11,
                    border: `1.5px solid ${isSel ? 'var(--terra)' : 'var(--line-soft)'}`,
                    background: isSel ? 'var(--terra)' : 'transparent',
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                  }}>
                    {isSel && (
                      <svg width="11" height="11" viewBox="0 0 11 11">
                        <path d="M2 5.5L4.5 8 9 3" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="ds3-body" style={{ flex: 1, fontWeight: 600 }}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </main>
        <footer className="ds3-screen-footer">
          <button
            type="button"
            className="ds3-btn ds3-btn-primary"
            disabled={!returnCommitment || saving}
            onClick={async () => {
              if (saving) return;
              setSaving(true);
              const item = {
                sentence: sentence.trim(),
                structure,
                customStructure: structure === 'custom' ? customStructure.trim() : null,
                returnCommitment,
                activationAtTime,
                sourceContext: 'emergency_phase8_step0',
              };
              await saveWaitingItem(item);
              setSaving(false);
              onComplete(item);
            }}
          >
            {saving ? 'שומר…' : 'סיימתי'}
          </button>
        </footer>
      </div>
    );
  }

  return null;
}

function Topbar({ onExit, label }) {
  return (
    <div className="ds3-topbar">
      <span className="ds3-topbar-spacer" />
      <span className="ds3-topbar-label">{label}</span>
      <button type="button" className="ds3-topbar-back" aria-label="צא" onClick={onExit}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
