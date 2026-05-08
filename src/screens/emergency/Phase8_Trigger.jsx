import { useState } from 'react';
import PhaseHeader from './components/PhaseHeader.jsx';
import SoftButton from './components/SoftButton.jsx';
import { distortions, BODY_SENSATIONS } from '../../data/distortions.js';
import { dominantSchemas } from '../../data/schemas.js';

const STAGE_TOTAL = 10;
const STAGE_LABEL = 'שלב 2 — לנתח';
const OTHER_SCHEMA = '__other__';

const ACTIVATION_HIGH_THRESHOLD = 7;

// Steps go from 0..8 internally; UI never shows aggregate progress (intentional).
const FIRST_STEP = 0;
const LAST_STEP = 8;

export default function Phase8Trigger({ data, setData, initialStep = FIRST_STEP, onNext, onExit, onGoToGrounding }) {
  const [step, setStep] = useState(initialStep);

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
  const goNext = () => {
    if (step === 3 && !hasAnyThought) {
      setStep(5);
      return;
    }
    if (step >= LAST_STEP) {
      onNext();
      return;
    }
    setStep(step + 1);
  };

  const goBack = () => {
    if (step <= FIRST_STEP) return;
    if (step === 5 && !hasAnyThought) {
      setStep(3);
      return;
    }
    setStep(step - 1);
  };

  const sensations = new Set(data.sensations || []);
  const distortionSet = new Set(data.distortions || []);
  const schemaSet = new Set(data.schemas || []);
  const realSchemasSelected = (data.schemas || []).filter((s) => s !== OTHER_SCHEMA);
  const showDominantPicker = realSchemasSelected.length >= 2;

  const initialActivation = data.initialActivation ?? 5;

  return (
    <div className="phase phase-trigger ck-step">
      <PhaseHeader phase={8} total={STAGE_TOTAL} stageLabel={STAGE_LABEL} onExit={onExit} />
      <main className="phase-content">
        {step === 0 && (
          <>
            <h1 className="phase-title">כמה אתה מופעל עכשיו?</h1>
            <div className="activation-meter-display" aria-hidden="true">{initialActivation}</div>
            <div className="score-slider-wrap">
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={initialActivation}
                onChange={(e) => update({ initialActivation: parseInt(e.target.value, 10) })}
                className="score-slider"
                aria-label="כמה אתה מופעל עכשיו, מ-1 עד 10"
              />
              <div className="activation-meter-labels">
                <span>1 = רגוע</span>
                <span>5 = יש משהו</span>
                <span>10 = שורף</span>
              </div>
            </div>
            {initialActivation >= ACTIVATION_HIGH_THRESHOLD && onGoToGrounding && (
              <button
                type="button"
                className="link-btn activation-grounding-suggest"
                onClick={onGoToGrounding}
              >
                אתה במצב גבוה — לעבור גראונדינג קצר ואז לחזור?
              </button>
            )}
          </>
        )}
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
      </main>
      <footer className="phase-footer phase-footer-stack">
        <SoftButton onClick={goNext}>
          {step === 0 ? 'להמשיך עכשיו' : step >= LAST_STEP ? 'המשך למוד' : 'הבא'}
        </SoftButton>
        {step > FIRST_STEP && (
          <button type="button" className="link-btn phase-skip" onClick={goBack}>
            חזור
          </button>
        )}
      </footer>
    </div>
  );
}
