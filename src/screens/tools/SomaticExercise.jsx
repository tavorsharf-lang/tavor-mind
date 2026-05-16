import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ToolHeader from '../toolbox/components/ToolHeader.jsx';
import { getSomaticExercise } from '../../data/somatic.js';
import { saveToolSession } from '../../utils/toolsStorage.js';
import { SomaticAnimation } from './components/somatic/SomaticAnimations.jsx';
import VagalHummingHologram from '../emergency/components/VagalHummingHologram.jsx';
import ScoreSlider from '../../components/ui/ScoreSlider.jsx';
import { colorForScore } from '../../utils/scoreColor.js';

function moodForScore(s) {
  if (s <= 3) return 'עדיין כבד';
  if (s <= 6) return 'מתחיל להירגע';
  if (s <= 8) return 'קל יותר';
  return 'במקום טוב';
}

function formatRemaining(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function SomaticExercise() {
  const { id } = useParams();
  const navigate = useNavigate();
  const exercise = getSomaticExercise(id);

  const [variant, setVariant] = useState(null);
  const [stage, setStage] = useState('select'); // select | running | rating
  const [afterScore, setAfterScore] = useState(5);
  const [completedFully, setCompletedFully] = useState(false);
  const [silent, setSilent] = useState(false);
  const [vibrationFelt, setVibrationFelt] = useState(null); // null | true | false
  const [savingState, setSavingState] = useState('idle'); // idle | saving | saved | offline
  const startedAtRef = useRef(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (stage !== 'running') return;
    const tickId = setInterval(() => setTick((n) => n + 1), 250);
    return () => clearInterval(tickId);
  }, [stage]);

  if (!exercise) {
    return (
      <div className="tool-page ds2-themed">
        <ToolHeader title="לא נמצא" backTo="/tools/somatic" />
        <main className="tool-content">
          <p className="ck-empty">תרגיל לא קיים</p>
        </main>
      </div>
    );
  }

  const variantConfig = variant ? exercise[variant] : null;

  const startVariant = (v) => {
    setVariant(v);
    setStage('running');
    startedAtRef.current = Date.now();
  };

  const handleAnimationComplete = () => {
    setCompletedFully(true);
    setStage('rating');
  };

  const handleEarlyFinish = () => {
    setCompletedFully(false);
    setStage('rating');
  };

  const handleSave = async (includeScore) => {
    const durationSec = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
    setSavingState('saving');
    const result = await saveToolSession('somatic_sessions', {
      exerciseId: id,
      exerciseTitle: exercise.title,
      variant,
      completedFully,
      afterScore: includeScore ? afterScore : null,
      durationSec,
      silent: exercise.supportsSilent ? silent : undefined,
      vibrationFelt: id === 'vagal_humming' ? vibrationFelt : undefined,
    });
    setSavingState(result.ok ? 'saved' : 'offline');
    setTimeout(() => navigate('/tools/somatic'), result.ok ? 600 : 1400);
  };

  const inFlight = savingState === 'saving' || savingState === 'saved';

  return (
    <div className="tool-page ds2-themed">
      {savingState === 'offline' && (
        <div className="offline-toast" role="status">נשמר מקומית, יסונכרן כשתחזור לרשת</div>
      )}
      <ToolHeader
        title={exercise.title}
        subtitle={exercise.subtitle}
        backTo="/tools/somatic"
      />
      <main className="tool-content somatic-exercise">
        {stage === 'select' && (
          <section className="somatic-select">
            <p className="somatic-why">{exercise.why}</p>
            {id === 'vagal_humming' && (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 12px' }}>
                <VagalHummingHologram size={240} />
              </div>
            )}
            <ol className="somatic-instructions">
              {exercise.instructions.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ol>
            <div className="somatic-variant-row">
              <button
                type="button"
                className="somatic-variant-btn"
                onClick={() => startVariant('short')}
              >
                <span className="somatic-variant-label">{exercise.short.label}</span>
              </button>
              <button
                type="button"
                className="somatic-variant-btn somatic-variant-btn-secondary"
                onClick={() => startVariant('long')}
              >
                <span className="somatic-variant-label">{exercise.long.label}</span>
              </button>
            </div>
          </section>
        )}

        {stage === 'running' && variantConfig && (
          <section className="somatic-running">
            <SomaticAnimation
              kind={exercise.animation}
              durationSec={variantConfig.durationSec}
              onComplete={handleAnimationComplete}
            />
            <ul className="somatic-instructions-compact">
              {exercise.instructions.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
            <div className="somatic-countdown" aria-live="polite">
              {formatRemaining(variantConfig.durationSec * 1000 - (Date.now() - startedAtRef.current))}
            </div>
            {exercise.supportsSilent && (
              <button
                type="button"
                className="link-btn somatic-silent-toggle"
                onClick={() => setSilent((s) => !s)}
                aria-pressed={silent}
              >
                {silent ? 'מצב ללא קול פעיל' : (exercise.silentNote || 'אפשר גם בפה סגור')}
              </button>
            )}
            <button
              type="button"
              className="link-btn somatic-early-finish"
              onClick={handleEarlyFinish}
            >
              סיימתי לפני הזמן
            </button>
          </section>
        )}

        {stage === 'rating' && (() => {
          const tint = colorForScore(afterScore, 'high-good');
          return (
          <section className="somatic-rating">
            <h2 className="somatic-rating-title">איך אתה עכשיו?</h2>
            <div className="score-mood" key={moodForScore(afterScore)} aria-hidden="true" style={{ color: tint.main }}>
              {moodForScore(afterScore)}
            </div>
            <div className="score-display" aria-hidden="true" style={{ color: tint.main }}>{afterScore}</div>
            <div className="score-slider-wrap">
              <ScoreSlider
                value={afterScore}
                onChange={setAfterScore}
                polarity="high-good"
                showValue={false}
                labels={['עדיין קשה', 'טוב יותר']}
                ariaLabel="איך אתה עכשיו, מ-1 עד 10"
              />
            </div>

            {id === 'vagal_humming' && completedFully && (
              <div className="vibration-feedback">
                <p className="vibration-feedback-q">האם הצלחת לחוש את הוויברציה?</p>
                <div className="vibration-feedback-btns">
                  <button
                    type="button"
                    aria-pressed={vibrationFelt === true}
                    className={`vibration-btn ${vibrationFelt === true ? 'is-selected' : ''}`}
                    onClick={() => setVibrationFelt(true)}
                  >
                    כן
                  </button>
                  <button
                    type="button"
                    aria-pressed={vibrationFelt === false}
                    className={`vibration-btn ${vibrationFelt === false ? 'is-selected' : ''}`}
                    onClick={() => setVibrationFelt(false)}
                  >
                    לא
                  </button>
                </div>
                {vibrationFelt === false && (
                  <p className="vibration-feedback-tip">
                    נסה שוב — צליל יותר נמוך, נשיפה יותר ארוכה. הוויברציה מורגשת בעיקר באזור הצוואר והעצם החזה.
                  </p>
                )}
              </div>
            )}

            <div className="somatic-rating-actions">
              <button
                type="button"
                className="somatic-variant-btn"
                onClick={() => handleSave(true)}
                disabled={inFlight}
              >
                {savingState === 'saving' ? 'שומר…' : savingState === 'saved' ? 'נשמר' : 'סיימתי'}
              </button>
              <button
                type="button"
                className="link-btn"
                onClick={() => handleSave(false)}
                disabled={inFlight}
              >
                דלג בלי לסמן
              </button>
            </div>
          </section>
          );
        })()}
      </main>
    </div>
  );
}
