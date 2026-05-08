import { useState, useEffect } from 'react';
import PhaseHeader from './components/PhaseHeader.jsx';
import {
  SENSES_54321,
  COLOR_SCAN,
  ACTIVATION_TO_TECHNIQUE,
} from '../../data/groundingTechniques.js';

const SENSE_VERB = {
  sight: 'רואה',
  hearing: 'שומע',
  touch: 'חש',
  smell: 'מריח',
  taste: 'טועם',
};

const COLOR_NAME = {
  green: 'ירוק',
  red: 'אדום',
};

const getSequence = (technique) =>
  technique === 'colors' ? COLOR_SCAN : SENSES_54321;

export default function Phase3Grounding({ activation, onNext, onExit }) {
  const initialTechnique = ACTIVATION_TO_TECHNIQUE[activation] || 'senses';
  const [technique, setTechnique] = useState(initialTechnique);
  const [stepIndex, setStepIndex] = useState(0);
  const [remaining, setRemaining] = useState(getSequence(initialTechnique)[0].count);

  useEffect(() => {
    const seq = getSequence(technique);
    setStepIndex(0);
    setRemaining(seq[0].count);
  }, [technique]);

  const sequence = getSequence(technique);
  const currentItem = sequence[stepIndex];

  const advance = () => {
    const nextIndex = stepIndex + 1;
    if (nextIndex >= sequence.length) {
      onNext();
      return;
    }
    setStepIndex(nextIndex);
    setRemaining(sequence[nextIndex].count);
  };

  const handlePrimary = () => {
    if (technique === 'colors') {
      advance();
      return;
    }
    if (remaining > 1) {
      setRemaining(remaining - 1);
    } else {
      advance();
    }
  };

  const handleSwitch = () => {
    setTechnique(technique === 'senses' ? 'colors' : 'senses');
  };

  const subtitle = technique === 'senses'
    ? `תסתכל סביב — מה אתה ${SENSE_VERB[currentItem.sense]} עכשיו?`
    : `תסתכל סביב — איפה יש ${COLOR_NAME[currentItem.color]} עכשיו?`;

  const switchLabel = technique === 'senses'
    ? 'להחליף לסריקת צבעים'
    : 'להחליף ל-5-4-3-2-1';

  return (
    <div className="phase phase-grounding">
      <PhaseHeader phase={3} total={7} stageLabel="שלב 1 — להירגע" onExit={onExit} />
      <main className="phase-content">
        <div className="grounding-switch-wrap">
          <button
            type="button"
            className="grounding-switch"
            onClick={handleSwitch}
          >
            {switchLabel}
          </button>
        </div>

        <h2 className="grounding-headline">
          <span className="grounding-count">{remaining}</span>
          <span className="grounding-label">{currentItem.label}</span>
        </h2>

        <p className="grounding-sub">{subtitle}</p>

        <div className="grounding-action-wrap">
          <button
            type="button"
            className="grounding-primary"
            onClick={handlePrimary}
          >
            {currentItem.action}
          </button>

          <button
            type="button"
            className="link-btn grounding-skip"
            onClick={onNext}
          >
            אי אפשר עכשיו, להמשיך
          </button>
        </div>
      </main>
    </div>
  );
}
