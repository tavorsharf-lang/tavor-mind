import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CheckinHeader from '../checkin/components/CheckinHeader.jsx';
import SoftButton from '../emergency/components/SoftButton.jsx';
import SavedConfirm from '../../components/ui/SavedConfirm.jsx';
import { saveToolSession } from '../../utils/toolsStorage.js';
import { distortions, BODY_SENSATIONS } from '../../data/distortions.js';
import { dominantSchemas } from '../../data/schemas.js';
import { getModeById } from '../../data/modes.js';
import { useBackHandler } from '../../utils/navContext.jsx';

const TOTAL = 5;
const OTHER_SCHEMA = '__other__';

export default function TriggerTracker() {
  const navigate = useNavigate();
  const location = useLocation();
  const incomingModeLabels = (location.state?.selectedModes || [])
    .map((id) => getModeById(id)?.label)
    .filter(Boolean);
  const [step, setStep] = useState(1);
  const [event, setEvent] = useState('');
  const [sensations, setSensations] = useState(new Set());
  const [thoughts, setThoughts] = useState(['', '', '']);
  const [distortionSet, setDistortionSet] = useState(new Set());
  const [schemaSet, setSchemaSet] = useState(new Set());
  const [otherSchemaText, setOtherSchemaText] = useState('');
  const [healthyResponse, setHealthyResponse] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const exit = () => navigate('/tools', { replace: true });

  useBackHandler(() => {
    if (step > 1) setStep(step - 1);
    else navigate(-1);
  });

  const toggleSet = (set, setSet, id) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSet(next);
  };

  const updateThought = (i, val) => {
    const next = [...thoughts];
    next[i] = val;
    setThoughts(next);
  };

  const showReminders = () => {
    const pool = dominantSchemas
      .filter((s) => schemaSet.has(s.id))
      .map((s) => s.healthy_response);
    const fallback = dominantSchemas.map((s) => s.healthy_response);
    const list = (pool.length > 0 ? pool : fallback).slice();
    list.sort(() => Math.random() - 0.5);
    setSuggestions(list.slice(0, Math.min(3, list.length)));
    setShowSuggestions(true);
  };

  const insertSuggestion = (text) => {
    setHealthyResponse((cur) => (cur ? cur + '\n' + text : text));
    setShowSuggestions(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const schemasArr = Array.from(schemaSet);
    const finalSchemas = schemasArr.includes(OTHER_SCHEMA)
      ? [...schemasArr.filter((x) => x !== OTHER_SCHEMA), ...(otherSchemaText.trim() ? [`other:${otherSchemaText.trim()}`] : [])]
      : schemasArr;
    await saveToolSession('triggers', {
      event: event.trim(),
      bodySensations: Array.from(sensations),
      thoughts: thoughts.map((t) => t.trim()).filter(Boolean),
      distortions: Array.from(distortionSet),
      schemasActivated: finalSchemas,
      healthyResponse: healthyResponse.trim() || null,
    });
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="phase ck-step ds2-themed">
      <CheckinHeader step={step} total={TOTAL} onExit={exit} />
      <main className="phase-content">
        {incomingModeLabels.length > 0 && (
          <p className="incoming-modes-line">הקולות שזיהית עכשיו: {incomingModeLabels.join(', ')}</p>
        )}
        {step === 1 && (
          <>
            <h1 className="phase-title">מה קרה ברגע שהפעיל אותך?</h1>
            <p className="phase-subtitle">תאר ביובש את האירוע, בלי פרשנות.</p>
            <textarea
              className="ck-textarea"
              rows={5}
              placeholder="לדוגמה: ראיתי אותה צופה בסטורי שלי ולא הגיבה"
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              autoFocus
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
                  onClick={() => toggleSet(sensations, setSensations, s.id)}
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
            <h3 className="form-section-label">עיוותי חשיבה אפשריים — סמן אם רלוונטי</h3>
            <div className="emotion-grid">
              {distortions.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  aria-pressed={distortionSet.has(d.id)}
                  className={`emotion-chip ${distortionSet.has(d.id) ? 'is-selected' : ''}`}
                  onClick={() => toggleSet(distortionSet, setDistortionSet, d.id)}
                  title={d.cue}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </>
        )}
        {step === 4 && (
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
                  onClick={() => toggleSet(schemaSet, setSchemaSet, s.id)}
                >
                  {s.name}
                </button>
              ))}
              <button
                type="button"
                aria-pressed={schemaSet.has(OTHER_SCHEMA)}
                className={`emotion-chip ${schemaSet.has(OTHER_SCHEMA) ? 'is-selected' : ''}`}
                onClick={() => toggleSet(schemaSet, setSchemaSet, OTHER_SCHEMA)}
              >
                אחרת
              </button>
            </div>
            {schemaSet.has(OTHER_SCHEMA) && (
              <input
                type="text"
                className="thought-input other-schema-input"
                placeholder="באילו מילים תקרא לזה?"
                value={otherSchemaText}
                onChange={(e) => setOtherSchemaText(e.target.value)}
              />
            )}
          </>
        )}
        {step === 5 && (
          <>
            <h1 className="phase-title">מה המבוגר הבריא שלך היה אומר עכשיו?</h1>
            <p className="phase-subtitle">אם קשה — אפשר לדלג, או להעתיק תזכורת.</p>
            <textarea
              className="ck-textarea"
              rows={4}
              value={healthyResponse}
              onChange={(e) => setHealthyResponse(e.target.value)}
            />
            <button type="button" className="link-btn suggest-btn" onClick={showReminders}>
              הצע לי תזכורת מהפרופיל שלי
            </button>
            {showSuggestions && (
              <ul className="suggestion-list">
                {suggestions.map((text, i) => (
                  <li key={i}>
                    <button type="button" className="suggestion-item" onClick={() => insertSuggestion(text)}>
                      {text}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
      <footer className="phase-footer">
        {step < TOTAL && (
          <SoftButton onClick={() => setStep(step + 1)}>הבא</SoftButton>
        )}
        {step === TOTAL && (
          <SoftButton onClick={handleSave} disabled={saving || saved}>
            {saving ? 'שומר…' : 'שמור'}
          </SoftButton>
        )}
      </footer>
      <SavedConfirm
        open={saved}
        onClose={() => navigate('/tools', { replace: true })}
      />
    </div>
  );
}
