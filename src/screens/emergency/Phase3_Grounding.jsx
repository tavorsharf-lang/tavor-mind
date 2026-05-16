import { useState } from 'react';
import { PhaseGrounding as Phase3GroundingIcon, ChevronStart } from '../../components/icons/system.jsx';
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

  const sequence = getSequence(technique);
  const currentItem = sequence[stepIndex];

  const advance = () => {
    const nextIndex = stepIndex + 1;
    if (nextIndex >= sequence.length) {
      onNext();
      return;
    }
    setStepIndex(nextIndex);
  };

  const handleSwitch = () => {
    setTechnique(technique === 'senses' ? 'colors' : 'senses');
    setStepIndex(0);
  };

  const subtitle = technique === 'senses'
    ? `תסתכל סביב — מה אתה ${SENSE_VERB[currentItem.sense]} עכשיו?`
    : `תסתכל סביב — איפה יש ${COLOR_NAME[currentItem.color]} עכשיו?`;

  const switchLabel = technique === 'senses'
    ? 'להחליף לסריקת צבעים'
    : 'להחליף ל-5-4-3-2-1';

  // Render the 5-4-3-2-1 list visualization (when on senses technique)
  const showSensesList = technique === 'senses';

  // Color-match the primary CTA to the color we're searching for (color scan only).
  // For senses technique, stay on lichen (the blue body-work primary).
  const colorScanTint = technique === 'colors'
    ? (currentItem.color === 'green' ? '#34A86A' : '#FF3B30')
    : null;
  const ctaStyle = colorScanTint ? {
    background: colorScanTint,
    color: '#fff',
    border: 'none',
    boxShadow: `0 8px 22px ${colorScanTint}66`,
  } : null;

  return (
    <div className="ds3-screen">
      <div className="ds3-topbar">
        <span className="ds3-topbar-spacer" />
        <span className="ds3-topbar-label">
          <span className="ds3-topbar-label-icon color-tone-body" aria-hidden="true"><Phase3GroundingIcon /></span>
          שלב 1 · להירגע · גראונדינג
        </span>
        <button type="button" className="ds3-topbar-back" aria-label="צא" onClick={onExit}>
          <ChevronStart size={22} />
        </button>
      </div>

      <main className="ds3-screen-content">
        <div style={{ marginTop: 8 }}>
          <p className="ds3-caption ds3-text-muted" style={{ marginBottom: 4 }}>
            גוף · חזרה לחושים
          </p>
          <h1 className="ds3-h1" style={{ marginBottom: 8 }}>חזרה לכאן</h1>
          <p className="ds3-body ds3-text-muted" style={{ marginBottom: 18 }}>
            לאט. שם אחד בכל פעם.
          </p>
        </div>

        {showSensesList ? (
          <div className="ds3-stack-2">
            {SENSES_54321.map((s, idx) => {
              const isCurrent = idx === stepIndex;
              const senseVerb = SENSE_VERB[s.sense];
              return (
                <div
                  key={s.count}
                  style={{
                    background: isCurrent ? 'var(--surface)' : 'transparent',
                    border: isCurrent ? 'none' : '1px solid var(--line-soft)',
                    borderRadius: 14,
                    padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 14,
                    boxShadow: isCurrent ? '0 1px 2px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(60,60,67,0.10)' : 'none',
                    transition: 'all 250ms cubic-bezier(0.4,0,0.2,1)',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: isCurrent ? 'var(--lichen)' : 'transparent',
                    border: isCurrent ? 'none' : '1px solid var(--line-soft)',
                    color: isCurrent ? '#fff' : 'var(--ink-muted)',
                    display: 'grid', placeItems: 'center',
                    fontSize: 16, fontWeight: 600, flexShrink: 0,
                  }}>
                    {s.count}
                  </div>
                  <div className="ds3-body" style={{
                    flex: 1,
                    color: isCurrent ? 'var(--ink)' : 'var(--ink-muted)',
                    fontWeight: isCurrent ? 600 : 400,
                  }}>
                    דברים שאני {senseVerb}
                  </div>
                  {isCurrent && (
                    <div className="ds3-caption" style={{ color: 'var(--lichen)', fontWeight: 700 }}>
                      {s.count}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="ds3-card-loose ds3-text-center" style={{ marginTop: 12 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 30,
              background: currentItem.color === 'green' ? '#34A86A' : '#FF3B30',
              margin: '0 auto 14px',
              boxShadow: `0 8px 22px ${currentItem.color === 'green' ? 'rgba(52, 168, 106, 0.40)' : 'rgba(255, 59, 48, 0.40)'}`,
            }}/>
            <h2 className="ds3-h1" style={{ marginBottom: 8 }}>
              {COLOR_NAME[currentItem.color]}
            </h2>
            <p className="ds3-body ds3-text-muted">
              {subtitle}
            </p>
          </div>
        )}

        {showSensesList && (
          <p className="ds3-body ds3-text-center" style={{ marginTop: 18 }}>
            {subtitle}
          </p>
        )}
      </main>

      <footer className="ds3-screen-footer ds3-stack-3">
        <button
          type="button"
          className={`ds3-btn ${colorScanTint ? '' : 'ds3-btn-blue'}`}
          style={ctaStyle || undefined}
          onClick={advance}
        >
          {currentItem.action}
        </button>
        <button type="button" className="ds3-btn-quiet" onClick={handleSwitch}>
          {switchLabel}
        </button>
        <button type="button" className="ds3-btn-quiet" onClick={onNext}>
          אי אפשר עכשיו, להמשיך
        </button>
      </footer>
    </div>
  );
}
