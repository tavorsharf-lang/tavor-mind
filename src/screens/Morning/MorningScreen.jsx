import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BreathingExercise from '../emergency/components/BreathingExercise.jsx';
import DurationGate from './components/DurationGate.jsx';
import ModeSelector from './components/ModeSelector.jsx';
import IntentionPicker from './components/IntentionPicker.jsx';
import { HEALTHY_ADULT_MESSAGES, INTENTION_MESSAGES, pickOne, pickTwo } from './morningContent.js';
import './styles.css';

const HEART_HAND_SECONDS = 20;

export default function MorningScreen() {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(null);
  const [stage, setStage] = useState(0);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedIntentions, setSelectedIntentions] = useState([]);

  const healthyAdultMessage = useMemo(() => pickOne(HEALTHY_ADULT_MESSAGES), []);
  const intentionsShown = useMemo(() => pickTwo(INTENTION_MESSAGES), []);

  useEffect(() => {
    document.body.classList.add('morning-mode');
    return () => document.body.classList.remove('morning-mode');
  }, []);

  const exitHome = () => navigate('/', { replace: true });

  const chooseDuration = (d) => {
    setDuration(d);
    setStage(1);
  };

  const goNext = () => {
    if (stage === 4 && duration === 'short') {
      setStage(6);
    } else {
      setStage(stage + 1);
    }
  };

  const toggleIntention = (text) => {
    setSelectedIntentions((prev) => {
      if (prev.includes(text)) return prev.filter((t) => t !== text);
      if (prev.length >= 2) return prev;
      return [...prev, text];
    });
  };

  return (
    <div className="morning-page" role="presentation">
      <button type="button" className="morning-exit" onClick={exitHome} aria-label="סיום">
        ✕
      </button>

      <div className="morning-canvas">
        {stage === 0 && <DurationGate onChoose={chooseDuration} />}

        {stage === 1 && (
          <div className="morning-stage">
            <h1 className="morning-headline morning-headline-display">אני כאן. זה בוקר.</h1>
            <p className="morning-sub-quiet">הגוף עוד לא איתי, וזה בסדר.</p>
            <button type="button" className="morning-btn morning-btn-primary" onClick={goNext}>
              המשך
            </button>
          </div>
        )}

        {stage === 2 && <HeartHandStage onReady={goNext} />}

        {stage === 3 && (
          <div className="morning-stage morning-breath">
            <h2 className="morning-headline">נשימה איטית. בנשיפה — המהום שקט.</h2>
            <p className="morning-sub-quiet">המהום מפעיל את העצב הוואגלי. עוזר להתעורר בעדינות.</p>
            <div className="morning-breath-wrap">
              <BreathingExercise
                defaultPattern="morning_hum"
                defaultPace="normal"
                cycles={3}
                lockPattern
                onComplete={goNext}
              />
            </div>
            <button type="button" className="morning-btn morning-btn-ghost" onClick={goNext}>
              סיימתי
            </button>
          </div>
        )}

        {stage === 4 && (
          <div className="morning-stage morning-voice">
            <p className="morning-voice-line">{healthyAdultMessage}</p>
            <button type="button" className="morning-btn morning-btn-primary" onClick={goNext}>
              המשך
            </button>
          </div>
        )}

        {stage === 5 && duration === 'long' && (
          <ModeSelector
            onContinue={(modeId) => {
              setSelectedMode(modeId);
              setStage(6);
            }}
          />
        )}

        {stage === 6 && (
          <div className="morning-stage">
            <h2 className="morning-headline">עכשיו, צא מהאזור הזה.</h2>
            <p className="morning-body-line">לך לצחצח שיניים.</p>
            <p className="morning-body-line">שטוף פנים במים פושרים — לא קרים.</p>
            <p className="morning-note">
              מים קרים מתאימים למצב הפוך מהבוקר שלך. פושרים יעירו את הגוף בלי לחץ.
            </p>
            <button type="button" className="morning-btn morning-btn-primary" onClick={goNext}>
              הולך
            </button>
          </div>
        )}

        {stage === 7 && (
          <IntentionPicker
            intentions={intentionsShown}
            selected={selectedIntentions}
            onToggle={toggleIntention}
          />
        )}
      </div>
    </div>
  );
}

function HeartHandStage({ onReady }) {
  const [remaining, setRemaining] = useState(HEART_HAND_SECONDS);
  const finishedRef = useRef(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (finishedRef.current) return;
    if (remaining <= 0) {
      finishedRef.current = true;
      setFinished(true);
      return;
    }
    const t = setTimeout(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  const progress = 1 - remaining / HEART_HAND_SECONDS;
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="morning-stage morning-heart">
      <h2 className="morning-headline">הנח יד על הלב.</h2>
      <p className="morning-sub-quiet">שים לב לחום. לא צריך להרגיש משהו מיוחד.</p>

      <button
        type="button"
        className="morning-heart-dial"
        onClick={onReady}
        aria-label={finished ? 'מוכן' : 'דלג על הטיימר'}
      >
        <svg viewBox="0 0 120 120" width="160" height="160" aria-hidden="true">
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="rgba(44, 95, 111, 0.12)"
            strokeWidth="2"
          />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="#2C5F6F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <span className="morning-heart-num" aria-hidden="true">
          {finished ? '✓' : remaining}
        </span>
      </button>

      {finished && (
        <button type="button" className="morning-btn morning-btn-primary" onClick={onReady}>
          מוכן
        </button>
      )}
    </div>
  );
}
