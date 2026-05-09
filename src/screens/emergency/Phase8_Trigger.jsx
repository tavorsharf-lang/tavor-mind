import { useState } from 'react';
import PhaseHeader from './components/PhaseHeader.jsx';
import SoftButton from './components/SoftButton.jsx';
import { Phase8TriggerIcon } from '../../components/icons/index.jsx';
import { distortions, BODY_SENSATIONS } from '../../data/distortions.js';
import { dominantSchemas } from '../../data/schemas.js';
import { useBackHandler } from '../../utils/navContext.jsx';
import { colorForScore } from '../../utils/scoreColor.js';

const STAGE_TOTAL = 10;
const STAGE_LABEL = 'שלב 2 — לנתח';
const OTHER_SCHEMA = '__other__';

const ACTIVATION_HIGH_THRESHOLD = 7;

// Steps go from 0..8 internally; UI never shows aggregate progress (intentional).
const FIRST_STEP = 0;
const LAST_STEP = 8;

export default function Phase8Trigger({
  data,
  setData,
  initialStep = FIRST_STEP,
  activation,
  skipInitialActivation = false,
  onNext,
  onExit,
  onBack,
  onGoToGrounding,
  onGoToContainment,
  onGoToRegulation,
}) {
  const [step, setStep] = useState(initialStep);
  // Soft safety net shown after step 4 (readback): "how is it now?"
  // null until armed; once true, the chip choice drives the next move.
  const [showSafetyCheck, setShowSafetyCheck] = useState(false);
  const [safetyAnswer, setSafetyAnswer] = useState(null); // null | 'clearer' | 'same' | 'heavier'

  const effectiveFirstStep = skipInitialActivation ? 1 : FIRST_STEP;

  const update = (patch) => setData({ ...data, ...patch });

  const toggleSet = (key, id) => {
    const next = new Set(data[key] || []);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    update({ [key]: Array.from(next) });
  };

  // Schema toggle: also recomputes dominantSchema so it stays in sync.
  // 0 real selected → null. 1 real → that. 2+ → keep if still selected else null.
  const toggleSchema = (id) => {
    const next = new Set(data.schemas || []);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    const arr = Array.from(next);
    const realSchemas = arr.filter((s) => s !== OTHER_SCHEMA);
    let newDominant = data.dominantSchema || null;
    if (realSchemas.length === 0) newDominant = null;
    else if (realSchemas.length === 1) newDominant = realSchemas[0];
    else if (newDominant && !realSchemas.includes(newDominant)) newDominant = null;
    update({ schemas: arr, dominantSchema: newDominant });
  };

  const updateThought = (i, val) => {
    const next = [...(data.thoughts || ['', '', ''])];
    next[i] = val;
    update({ thoughts: next });
  };

  const thoughts = data.thoughts || ['', '', ''];
  const hasAnyThought = thoughts.some((t) => (t || '').trim());

  // Auto-skip step 4 (read-back feeling) when no thoughts in step 3.
  // Arm safety check after step 4 → user should pause and pulse before distortions.
  const goNext = () => {
    if (step === 3 && !hasAnyThought) {
      setStep(5);
      return;
    }
    if (step === 4 && !showSafetyCheck) {
      setShowSafetyCheck(true);
      return;
    }
    if (step >= LAST_STEP) {
      onNext();
      return;
    }
    setStep(step + 1);
  };

  const goBack = () => {
    if (step <= effectiveFirstStep) {
      if (typeof onBack === 'function') onBack();
      return;
    }
    if (step === 5 && !hasAnyThought) {
      setStep(3);
      return;
    }
    setStep(step - 1);
  };

  useBackHandler(goBack);

  const dismissSafetyCheck = (answer) => {
    setSafetyAnswer(answer);
    update({ heavinessCheck: answer });
    setShowSafetyCheck(false);
    setStep(5);
  };

  const handleHeavierStay = () => {
    setSafetyAnswer('heavier');
    update({ heavinessCheck: 'heavier' });
  };

  const sensations = new Set(data.sensations || []);
  const distortionSet = new Set(data.distortions || []);
  const schemaSet = new Set(data.schemas || []);
  const realSchemasSelected = (data.schemas || []).filter((s) => s !== OTHER_SCHEMA);
  const showDominantPicker = realSchemasSelected.length >= 2;

  const initialActivation = data.initialActivation ?? 5;

  return (
    <div className="phase phase-trigger ck-step" style={{ position: 'relative' }}>
      <PhaseHeader phase={8} total={STAGE_TOTAL} stageLabel={STAGE_LABEL} onExit={onExit} icon={Phase8TriggerIcon} tone="crisis" />

      {/* Safety-check rendered as a BOTTOM-SHEET MODAL overlay (per design 2/2b).
       * The analysis content stays mounted (blurred) so context is preserved. */}
      {showSafetyCheck && (
        <div
          aria-modal="true"
          role="dialog"
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(20, 18, 16, 0.42)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            padding: 16,
            paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
            animation: 'p8-sheet-fade 200ms ease-out',
          }}
        >
          <style>{`
            @keyframes p8-sheet-fade { from { opacity: 0; } to { opacity: 1; } }
            @keyframes p8-sheet-rise {
              from { transform: translateY(20px); opacity: 0; }
              to   { transform: translateY(0);    opacity: 1; }
            }
          `}</style>
          {safetyAnswer !== 'heavier' ? (
            <div style={{
              width: '100%', maxWidth: 360,
              background: 'var(--surface)',
              borderRadius: 22,
              padding: '20px 18px',
              boxShadow: '0 14px 40px rgba(0, 0, 0, 0.18)',
              border: '1px solid var(--line-soft)',
              animation: 'p8-sheet-rise 250ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              <h2 style={{
                fontSize: 22, fontWeight: 700, color: 'var(--ink)',
                textAlign: 'center', margin: '0 0 16px',
                letterSpacing: '-0.01em',
              }}>איך זה עכשיו?</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => dismissSafetyCheck('clearer')}
                  style={{
                    flex: 1, height: 48, borderRadius: 24,
                    background: 'var(--surface)', color: 'var(--ink)',
                    border: '1px solid var(--line-soft)',
                    fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  }}
                >יותר ברור</button>
                <button
                  type="button"
                  onClick={() => dismissSafetyCheck('same')}
                  style={{
                    flex: 1, height: 48, borderRadius: 24,
                    background: 'var(--surface)', color: 'var(--ink)',
                    border: '1px solid var(--line-soft)',
                    fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  }}
                >אותו דבר</button>
                <button
                  type="button"
                  onClick={handleHeavierStay}
                  style={{
                    flex: 1, height: 48, borderRadius: 24,
                    background: 'var(--terra)', color: '#fff',
                    border: 'none',
                    fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(255, 106, 79, 0.40)',
                  }}
                >יותר כבד</button>
              </div>
            </div>
          ) : (
            <div style={{
              width: '100%', maxWidth: 340,
              background: 'var(--surface)',
              borderRadius: 22,
              padding: '24px 22px',
              boxShadow: '0 14px 40px rgba(0, 0, 0, 0.18)',
              border: '1px solid var(--line-soft)',
              textAlign: 'center',
              animation: 'p8-sheet-rise 250ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              <p style={{
                fontSize: 17, color: 'var(--ink)', lineHeight: 1.65, margin: '0 0 18px',
              }}>
                בוא נחזור לגוף לרגע.<br/>
                נסיים את הניתוח אחר כך.
              </p>
              <button
                type="button"
                onClick={() => onGoToRegulation && onGoToRegulation(5)}
                style={{
                  width: '100%', height: 52, borderRadius: 26,
                  background: 'var(--terra)', color: '#fff',
                  border: 'none',
                  fontFamily: 'inherit', fontSize: 17, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 6px 18px rgba(255, 106, 79, 0.40)',
                }}
              >חזור לוויסות</button>
              <button
                type="button"
                onClick={() => dismissSafetyCheck('heavier_continue')}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--ink-muted)',
                  fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', marginTop: 12,
                  textDecoration: 'underline', textUnderlineOffset: 4,
                }}
              >בכל זאת להמשיך לניתוח</button>
            </div>
          )}
        </div>
      )}

      <main className="phase-content" style={{
        filter: showSafetyCheck ? 'blur(2px)' : 'none',
        transition: 'filter 200ms',
      }}>
        {true && (
          <>
            {step === 0 && (() => {
              const tint = colorForScore(initialActivation, 'high-bad');
              return (
              <>
                <h1 className="phase-title">כמה אתה מופעל עכשיו?</h1>
                <div className="activation-meter-display" aria-hidden="true" style={{ color: tint.main }}>{initialActivation}</div>
                <div className="score-slider-wrap">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={initialActivation}
                    onChange={(e) => update({ initialActivation: parseInt(e.target.value, 10) })}
                    className="score-slider"
                    style={{ '--slider-tint': tint.main, '--slider-tint-glow': tint.glow }}
                    aria-label="כמה אתה מופעל עכשיו, מ-1 עד 10"
                  />
                  <div className="activation-meter-labels">
                    <span>1 = רגוע</span>
                    <span>5 = יש משהו</span>
                    <span>10 = שורף</span>
                  </div>
                </div>
                {initialActivation >= ACTIVATION_HIGH_THRESHOLD && (onGoToGrounding || (activation === 'mid' && onGoToContainment)) && (
                  <div className="step0-side-trip-options">
                    <p className="step0-side-trip-lead">ה-activation שלך גבוה. מה לדעתך עולה?</p>
                    {onGoToGrounding && (
                      <button type="button" className="link-btn step0-side-trip-btn" onClick={onGoToGrounding}>
                        הגוף עדיין מתוח — לעבור גראונדינג קצר ולחזור
                      </button>
                    )}
                    {activation === 'mid' && onGoToContainment && (
                      <button type="button" className="link-btn step0-side-trip-btn" onClick={onGoToContainment}>
                        משהו ספציפי עולה — זיכרון, רגש, מחשבה שמסחפת
                      </button>
                    )}
                  </div>
                )}
              </>
              );
            })()}
            {step === 1 && (
              <>
                <h1 className="phase-title">מה קרה ברגע שהפעיל אותך?</h1>
                <p className="phase-subtitle">תאר ביובש את האירוע, בלי פרשנות.</p>
                <textarea
                  className="ck-textarea"
                  rows={5}
                  placeholder="לדוגמה: ראיתי אותה צופה בסטורי שלי ולא הגיבה"
                  value={data.event || ''}
                  onChange={(e) => update({ event: e.target.value })}
                />
              </>
            )}
            {step === 2 && (
              <>
                <h1 className="phase-title">מה קרה בגוף?</h1>
                <p className="phase-subtitle">סמן הכל שמתאים</p>
                <div className="emotion-grid">
                  {BODY_SENSATIONS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={sensations.has(s.id)}
                      className={`emotion-chip ${sensations.has(s.id) ? 'is-selected' : ''}`}
                      onClick={() => toggleSet('sensations', s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <h1 className="phase-title">מה הקול בראש אמר?</h1>
                <p className="phase-subtitle">כמה שיותר מילים שלו, לא תרגום שלך</p>
                <ol className="thought-list">
                  {thoughts.map((t, i) => (
                    <li key={i} className="thought-item">
                      <span className="thought-num">{i + 1}</span>
                      <input
                        type="text"
                        className="thought-input"
                        value={t}
                        onChange={(e) => updateThought(i, e.target.value)}
                        placeholder={i === 0 ? '"אף פעם לא..." / "תמיד..." / "אני..."' : ''}
                      />
                    </li>
                  ))}
                </ol>
              </>
            )}
            {step === 4 && (
              <>
                <div className="thoughts-readback">
                  {thoughts.map((t, i) => (
                    t.trim() ? (
                      <p key={i} className="thoughts-readback-line">{t}</p>
                    ) : null
                  ))}
                </div>
                <h1 className="phase-title">תקרא את המשפטים האלה לעצמך עכשיו. איך זה מרגיש לשמוע אותם?</h1>
                <textarea
                  className="ck-textarea"
                  rows={2}
                  value={data.readBackFeeling || ''}
                  onChange={(e) => update({ readBackFeeling: e.target.value })}
                />
              </>
            )}
            {step === 5 && (
              <>
                <h1 className="phase-title">סמן אם רלוונטי</h1>
                <p className="phase-subtitle">לא חובה לסמן. אם זה לא יושב — דלג.</p>
                <div className="emotion-grid">
                  {distortions.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      aria-pressed={distortionSet.has(d.id)}
                      className={`emotion-chip ${distortionSet.has(d.id) ? 'is-selected' : ''}`}
                      onClick={() => toggleSet('distortions', d.id)}
                      title={d.cue}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 6 && (
              <>
                <h1 className="phase-title">איזו סכמה פעלה כאן?</h1>
                <p className="phase-subtitle">בחר אחת או יותר</p>
                <div className="emotion-grid">
                  {dominantSchemas.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={schemaSet.has(s.id)}
                      className={`emotion-chip ${schemaSet.has(s.id) ? 'is-selected' : ''}`}
                      onClick={() => toggleSchema(s.id)}
                    >
                      {s.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    aria-pressed={schemaSet.has(OTHER_SCHEMA)}
                    className={`emotion-chip ${schemaSet.has(OTHER_SCHEMA) ? 'is-selected' : ''}`}
                    onClick={() => toggleSchema(OTHER_SCHEMA)}
                  >
                    אחרת
                  </button>
                </div>
                {schemaSet.has(OTHER_SCHEMA) && (
                  <input
                    type="text"
                    className="thought-input other-schema-input"
                    placeholder="באילו מילים תקרא לזה?"
                    value={data.otherSchema || ''}
                    onChange={(e) => update({ otherSchema: e.target.value })}
                  />
                )}
                {showDominantPicker && (
                  <div className="dominant-picker">
                    <h3 className="form-section-label">איזו מהן הכי דוברת עכשיו?</h3>
                    <div className="emotion-grid">
                      {realSchemasSelected.map((id) => {
                        const schema = dominantSchemas.find((s) => s.id === id);
                        const isSel = data.dominantSchema === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            aria-pressed={isSel}
                            className={`emotion-chip ${isSel ? 'is-selected' : ''}`}
                            onClick={() => update({ dominantSchema: id })}
                          >
                            {schema?.name || id}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
            {step === 7 && (
              <>
                <h1 className="phase-title">תפנה לחלק שדיבר במשפטים האלה. מה הוא צריך עכשיו?</h1>
                <p className="phase-subtitle">במילים שלך. בלי לתרגם.</p>
                <textarea
                  className="ck-textarea"
                  rows={2}
                  value={data.childNeeds || ''}
                  onChange={(e) => update({ childNeeds: e.target.value })}
                />
              </>
            )}
            {step === 8 && (
              <>
                <h1 className="phase-title">אם המבוגר הבריא שלך היה כאן עכשיו — מה אתה צריך לשמוע ממנו?</h1>
                <p className="phase-subtitle">לא מה הוא "צריך" להגיד. מה אתה צריך לשמוע.</p>
                <p className="phase-subtitle phase-subtitle-faint">אם קשה — אפשר לדלג. תרשום את מה שעולה.</p>
                <textarea
                  className="ck-textarea"
                  rows={4}
                  value={data.healthyAdultMessage || ''}
                  onChange={(e) => update({ healthyAdultMessage: e.target.value })}
                />
              </>
            )}
          </>
        )}
      </main>
      <footer className="phase-footer phase-footer-stack" style={{
        filter: showSafetyCheck ? 'blur(2px)' : 'none',
        transition: 'filter 200ms',
        pointerEvents: showSafetyCheck ? 'none' : 'auto',
      }}>
        <SoftButton onClick={goNext}>
          {step === 0 ? 'להמשיך עכשיו' : step >= LAST_STEP ? 'המשך למוד' : 'הבא'}
        </SoftButton>
        {step > effectiveFirstStep && (
          <button type="button" className="link-btn phase-skip" onClick={goBack}>
            חזור
          </button>
        )}
      </footer>
    </div>
  );
}
