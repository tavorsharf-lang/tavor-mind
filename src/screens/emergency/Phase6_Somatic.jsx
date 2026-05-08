import { useState } from 'react';
import PhaseHeader from './components/PhaseHeader.jsx';
import SoftButton from './components/SoftButton.jsx';
import { ButterflyAnim } from '../tools/components/somatic/SomaticAnimations.jsx';
import { saveToolSession } from '../../utils/toolsStorage.js';

const STAGE_TOTAL = 7;
const STAGE_LABEL = 'שלב 1 — להירגע';
const BUTTERFLY_DURATION_SEC = 60;

export default function Phase6Somatic({ onNext, onSkip, onExit }) {
  const [chosen, setChosen] = useState(null); // null | 'butterfly' | 'cold'

  if (chosen === 'butterfly') {
    return (
      <ButterflyExercise
        onDone={onNext}
        onBack={() => setChosen(null)}
        onExit={onExit}
      />
    );
  }

  if (chosen === 'cold') {
    return (
      <ColdAnchorExercise
        onDone={onNext}
        onBack={() => setChosen(null)}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="phase phase-somatic-page">
      <PhaseHeader phase={6} total={STAGE_TOTAL} stageLabel={STAGE_LABEL} onExit={onExit} />
      <main className="phase-content">
        <h1 className="phase-title">רוצה עוד רגע אחד בגוף?</h1>
        <p className="phase-subline">בחר תרגיל קצר — או דלג</p>
        <div className="phase-somatic-options">
          <button
            type="button"
            className="phase-somatic-option"
            onClick={() => setChosen('butterfly')}
          >
            <span className="phase-somatic-option-name">חיבוק פרפר</span>
            <span className="phase-somatic-option-sub">הצלבת ידיים על החזה, טפיחות סירוגין</span>
          </button>
          <button
            type="button"
            className="phase-somatic-option"
            onClick={() => setChosen('cold')}
          >
            <span className="phase-somatic-option-name">עיגון קר</span>
            <span className="phase-somatic-option-sub">מים קרים על פרקי הידיים או על הפנים</span>
          </button>
        </div>
      </main>
      <footer className="phase-footer phase-footer-stack">
        <SoftButton onClick={onNext}>הלאה</SoftButton>
        <button type="button" className="link-btn phase-skip" onClick={onSkip}>
          דלג לשלב הבא
        </button>
      </footer>
    </div>
  );
}

function ButterflyExercise({ onDone, onBack, onExit }) {
  const [done, setDone] = useState(false);

  const handleComplete = () => {
    setDone(true);
    saveToolSession('somatic_sessions', {
      exerciseId: 'butterfly_hug',
      exerciseTitle: 'חיבוק פרפר',
      variant: 'short',
      completedFully: true,
      afterScore: null,
      durationSec: BUTTERFLY_DURATION_SEC,
      context: 'emergency_phase6',
    }).catch(() => {});
  };

  return (
    <div className="phase phase-somatic-page">
      <PhaseHeader phase={6} total={STAGE_TOTAL} stageLabel={STAGE_LABEL} onExit={onExit} />
      <main className="phase-content phase-content-center">
        <h1 className="phase-title">חיבוק פרפר</h1>
        <p className="phase-subline">הצלב ידיים על החזה, טפיחות עדינות לסירוגין — אחת בשנייה</p>
        {!done && (
          <ButterflyAnim durationSec={BUTTERFLY_DURATION_SEC} onComplete={handleComplete} />
        )}
        {done && <p className="phase-after">סיימת.</p>}
      </main>
      <footer className="phase-footer phase-footer-stack">
        {done ? (
          <SoftButton onClick={onDone}>הלאה</SoftButton>
        ) : (
          <button type="button" className="link-btn phase-skip" onClick={onBack}>
            חזור לבחירה
          </button>
        )}
      </footer>
    </div>
  );
}

function ColdAnchorExercise({ onDone, onBack, onExit }) {
  return (
    <div className="phase phase-somatic-page">
      <PhaseHeader phase={6} total={STAGE_TOTAL} stageLabel={STAGE_LABEL} onExit={onExit} />
      <main className="phase-content">
        <h1 className="phase-title">עיגון קר</h1>
        <p className="phase-subline">mammalian dive reflex — מוריד דופק ב-10 עד 15 פעימות</p>
        <ol className="cold-anchor-steps">
          <li>מים קרים מהברז על פרקי הידיים</li>
          <li>או — שטוף פנים, התרכז סביב העיניים</li>
          <li>נשום רגיל תוך כדי</li>
        </ol>
      </main>
      <footer className="phase-footer phase-footer-stack">
        <SoftButton onClick={() => {
          saveToolSession('somatic_sessions', {
            exerciseId: 'cold_anchor',
            exerciseTitle: 'עיגון קר',
            variant: 'short',
            completedFully: true,
            afterScore: null,
            durationSec: 30,
            context: 'emergency_phase6',
          }).catch(() => {});
          onDone();
        }}>סיימתי</SoftButton>
        <button type="button" className="link-btn phase-skip" onClick={onBack}>
          חזור לבחירה
        </button>
      </footer>
    </div>
  );
}
