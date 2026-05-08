import { useState } from 'react';
import PhaseHeader from './components/PhaseHeader.jsx';
import SoftButton from './components/SoftButton.jsx';
import BreathingExercise from './components/BreathingExercise.jsx';
import { PhysioSighAnim } from '../tools/components/somatic/SomaticAnimations.jsx';
import { saveToolSession } from '../../utils/toolsStorage.js';

const HYPO_STEPS = [
  'קום ועמוד אם אתה יושב או שוכב.',
  'נער את הידיים והרגליים בעדינות, 10 שניות.',
  'שים יד אחת על הלב, יד אחת על הבטן.',
];

const AFTER_LINE = 'שים לב — הדופק והנשימה שונים עכשיו ממה שהיו לפני שתי דקות.';

const PATTERN_BY_ACTIVATION = { hyper: '478', hypo: 'coherent', mid: 'box' };
const CYCLES_BY_PATTERN = { '478': 4, box: 6, coherent: 6 };
const DEFAULT_PACE_BY_BRANCH = { hyper: 'normal', hypo: 'slow', mid: 'normal' };

export default function Phase2Body({ activation, breathingNote, setBreathingNote, onNext, onSkip, onExit }) {
  const noteProps = { note: breathingNote, setNote: setBreathingNote };
  if (activation === 'hyper') return <HyperBranch onNext={onNext} onSkip={onSkip} onExit={onExit} />;
  if (activation === 'hypo') return <HypoBranch onNext={onNext} onSkip={onSkip} onExit={onExit} {...noteProps} />;
  return <MidBranch onNext={onNext} onSkip={onSkip} onExit={onExit} {...noteProps} />;
}

function NoteField({ note, setNote }) {
  return (
    <label className="breathing-note-label">
      אם בא לך לכתוב מה עולה עכשיו — לא חובה
      <textarea
        className="ck-textarea breathing-note"
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
    </label>
  );
}

function SkipLink({ onSkip }) {
  return (
    <button type="button" className="link-btn phase-skip" onClick={onSkip}>
      דלג לשלב הבא
    </button>
  );
}

const HYPER_PRESTEP_DURATION_SEC = 18;

// Round 1 = sigh (18s) + 2 cycles 4-7-8 (38s) ≈ 56s. Round 2+ = 3 cycles 4-7-8 ≈ 57s.
// Each round defaults to ~1 minute; user can press "המשך לדקה נוספת" to add another round.
const HYPER_CYCLES_FIRST_ROUND = 2;
const HYPER_CYCLES_NEXT_ROUND = 3;

function HyperBranch({ onNext, onSkip, onExit }) {
  const [stage, setStage] = useState('somatic'); // somatic → breathe
  const [pattern, setPattern] = useState(PATTERN_BY_ACTIVATION.hyper);
  const [round, setRound] = useState(1);
  const [done, setDone] = useState(false);
  const cycles = round === 1 ? HYPER_CYCLES_FIRST_ROUND : HYPER_CYCLES_NEXT_ROUND;

  const handleSighComplete = () => {
    saveToolSession('somatic_sessions', {
      exerciseId: 'physio_sigh',
      exerciseTitle: 'אנחה פיזיולוגית',
      variant: 'prestep',
      completedFully: true,
      afterScore: null,
      durationSec: HYPER_PRESTEP_DURATION_SEC,
      context: 'emergency_prestep',
    }).catch(() => {});
    setStage('breathe');
  };

  if (done) {
    return (
      <div className="phase phase-body">
        <PhaseHeader phase={2} total={7} stageLabel="שלב 1 — להירגע" onExit={onExit} />
        <main className="phase-content phase-content-center">
          <h1 className="phase-title">נשימה — שאף ונשוף</h1>
        </main>
        <footer className="phase-footer phase-footer-row">
          <SoftButton variant="secondary" onClick={() => { setDone(false); setRound(round + 1); }}>
            המשך לדקה נוספת
          </SoftButton>
          <SoftButton onClick={onNext}>הלאה</SoftButton>
        </footer>
      </div>
    );
  }

  if (stage === 'somatic') {
    return (
      <div className="phase phase-body">
        <PhaseHeader phase={2} total={7} stageLabel="שלב 1 — להירגע" onExit={onExit} />
        <main className="phase-content phase-content-center">
          <h1 className="phase-title">נשימה — שאף ונשוף</h1>
          <p className="phase-subline">קודם אנחה פיזיולוגית — שתי שאיפות ונשיפה ארוכה</p>
          <PhysioSighAnim durationSec={HYPER_PRESTEP_DURATION_SEC} onComplete={handleSighComplete} />
        </main>
        <footer className="phase-footer">
          <SkipLink onSkip={onSkip} />
        </footer>
      </div>
    );
  }

  return (
    <div className="phase phase-body">
      <PhaseHeader phase={2} total={7} stageLabel="שלב 1 — להירגע" onExit={onExit} />
      <main className="phase-content phase-content-center">
        <h1 className="phase-title">נשימה — שאף ונשוף</h1>
        <BreathingExercise
          key={`hyper-${round}`}
          defaultPattern={pattern}
          defaultPace={DEFAULT_PACE_BY_BRANCH.hyper}
          cycles={cycles}
          onPatternChange={setPattern}
          onComplete={() => setDone(true)}
        />
      </main>
      <footer className="phase-footer">
        <SkipLink onSkip={onSkip} />
      </footer>
    </div>
  );
}

function HypoBranch({ onNext, onSkip, onExit, note, setNote }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [stage, setStage] = useState('activate');
  const [pattern, setPattern] = useState(PATTERN_BY_ACTIVATION.hypo);
  const [round, setRound] = useState(1);
  const [breathDone, setBreathDone] = useState(false);
  const cycles = CYCLES_BY_PATTERN[pattern];

  if (stage === 'activate') {
    const isLast = stepIdx === HYPO_STEPS.length - 1;
    return (
      <div className="phase phase-body">
        <PhaseHeader phase={2} total={7} stageLabel="שלב 1 — להירגע" onExit={onExit} />
        <main className="phase-content">
          <h1 className="phase-title">קודם נעיר את הגוף בעדינות, ואז ננשום</h1>
          <div className="hypo-step-card">
            <div className="hypo-step-num">{stepIdx + 1} / {HYPO_STEPS.length}</div>
            <p className="hypo-step-text">{HYPO_STEPS[stepIdx]}</p>
          </div>
        </main>
        <footer className="phase-footer phase-footer-stack">
          <SoftButton onClick={() => { isLast ? setStage('breathe') : setStepIdx(stepIdx + 1); }}>
            הבא
          </SoftButton>
          <SkipLink onSkip={onSkip} />
        </footer>
      </div>
    );
  }

  if (breathDone) {
    return (
      <div className="phase phase-body">
        <PhaseHeader phase={2} total={7} stageLabel="שלב 1 — להירגע" onExit={onExit} />
        <main className="phase-content">
          <h1 className="phase-title">עכשיו נשימה — שאף ונשוף</h1>
          <p className="phase-after">{AFTER_LINE}</p>
          <NoteField note={note} setNote={setNote} />
        </main>
        <footer className="phase-footer phase-footer-row">
          <SoftButton variant="secondary" onClick={() => { setBreathDone(false); setRound(round + 1); }}>
            עוד {cycles} נשימות
          </SoftButton>
          <SoftButton onClick={onNext}>הלאה</SoftButton>
        </footer>
      </div>
    );
  }

  return (
    <div className="phase phase-body">
      <PhaseHeader phase={2} total={7} stageLabel="שלב 1 — להירגע" onExit={onExit} />
      <main className="phase-content phase-content-center">
        <h1 className="phase-title">עכשיו נשימה — שאף ונשוף</h1>
        <BreathingExercise
          key={`hypo-${round}`}
          defaultPattern={pattern}
          defaultPace={DEFAULT_PACE_BY_BRANCH.hypo}
          cycles={cycles}
          onPatternChange={setPattern}
          onComplete={() => setBreathDone(true)}
        />
      </main>
      <footer className="phase-footer">
        <SkipLink onSkip={onSkip} />
      </footer>
    </div>
  );
}

function MidBranch({ onNext, onSkip, onExit, note, setNote }) {
  const [pattern, setPattern] = useState(PATTERN_BY_ACTIVATION.mid);
  const [round, setRound] = useState(1);
  const [done, setDone] = useState(false);
  const cycles = CYCLES_BY_PATTERN[pattern];

  if (done) {
    return (
      <div className="phase phase-body">
        <PhaseHeader phase={2} total={7} stageLabel="שלב 1 — להירגע" onExit={onExit} />
        <main className="phase-content">
          <h1 className="phase-title">נשימה — שאף ונשוף</h1>
          <p className="phase-after">{AFTER_LINE}</p>
          <NoteField note={note} setNote={setNote} />
        </main>
        <footer className="phase-footer phase-footer-row">
          <SoftButton variant="secondary" onClick={() => { setDone(false); setRound(round + 1); }}>
            עוד {cycles} נשימות
          </SoftButton>
          <SoftButton onClick={onNext}>הלאה</SoftButton>
        </footer>
      </div>
    );
  }

  return (
    <div className="phase phase-body">
      <PhaseHeader phase={2} total={7} stageLabel="שלב 1 — להירגע" onExit={onExit} />
      <main className="phase-content phase-content-center">
        <h1 className="phase-title">נשימה — שאף ונשוף</h1>
        <BreathingExercise
          key={`mid-${round}`}
          defaultPattern={pattern}
          defaultPace={DEFAULT_PACE_BY_BRANCH.mid}
          cycles={cycles}
          onPatternChange={setPattern}
          onComplete={() => setDone(true)}
        />
      </main>
      <footer className="phase-footer">
        <SkipLink onSkip={onSkip} />
      </footer>
    </div>
  );
}
