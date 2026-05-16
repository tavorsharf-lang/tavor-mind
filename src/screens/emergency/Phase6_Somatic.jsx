import { useState } from 'react';
import { ButterflyAnim, VagalAnim } from '../tools/components/somatic/SomaticAnimations.jsx';
import { PhaseSomatic as Phase6SomaticIcon } from '../../components/icons/system.jsx';
import VagalHummingHologram from './components/VagalHummingHologram.jsx';
import ScoreSlider from '../../components/ui/ScoreSlider.jsx';

const BUTTERFLY_DURATION_SEC = 60;
const VAGAL_DURATION_SEC = 90;

const PRIMARY_OPTIONS_BY_ACTIVATION = {
  hyper: [
    { id: 'butterfly', name: 'חיבוק פרפר', sub: 'הצלבת ידיים על החזה, טפיחות סירוגין', tone: 'orange' },
    { id: 'cold',      name: 'עיגון קר',    sub: 'מים קרים על הפנים או פרקי הידיים',    tone: 'blue' },
  ],
  mid: [
    { id: 'butterfly', name: 'חיבוק פרפר', sub: 'הצלבת ידיים על החזה, טפיחות סירוגין', tone: 'orange' },
    { id: 'cold',      name: 'עיגון קר',    sub: 'מים קרים על פרקי הידיים, או קוביית קרח על הצוואר', tone: 'blue' },
  ],
  hypo: [
    { id: 'vagal',     name: 'רטט קולי',    sub: 'המהום נמוך וארוך — הוויברציה מפעילה את הוואגוס', tone: 'body' },
    { id: 'butterfly', name: 'חיבוק פרפר', sub: 'הצלבת ידיים על החזה, טפיחות סירוגין', tone: 'orange' },
  ],
};

function Topbar({ onExit, label = 'שלב 1 · להירגע · סומאטי' }) {
  return (
    <div className="ds3-topbar">
      <span className="ds3-topbar-spacer" />
      <span className="ds3-topbar-label">
        <span className="ds3-topbar-label-icon color-tone-body" aria-hidden="true"><Phase6SomaticIcon /></span>
        {label}
      </span>
      <button type="button" className="ds3-topbar-back" aria-label="צא" onClick={onExit}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

export default function Phase6Somatic({ activation, onNext, onSkip, onExit }) {
  const [chosen, setChosen] = useState(null);
  const [showAdditional, setShowAdditional] = useState(false);

  const primaryOptions = PRIMARY_OPTIONS_BY_ACTIVATION[activation] || PRIMARY_OPTIONS_BY_ACTIVATION.mid;
  const showAdditionalToggle = activation === 'hypo';

  if (chosen === 'butterfly') return <ButterflyExercise onDone={onNext} onBack={() => setChosen(null)} onExit={onExit} />;
  if (chosen === 'cold')      return <ColdAnchorExercise activation={activation} onDone={onNext} onBack={() => setChosen(null)} onExit={onExit} />;
  if (chosen === 'vagal')     return <VagalHummingExercise onDone={onNext} onBack={() => setChosen(null)} onExit={onExit} />;

  return (
    <div className="ds3-screen">
      <Topbar onExit={onExit} />
      <main className="ds3-screen-content">
        <div className="ds3-stack-2" style={{ marginTop: 8 }}>
          <h1 className="ds3-h1">רוצה עוד רגע אחד בגוף?</h1>
          <p className="ds3-body ds3-text-muted">בחר תרגיל קצר — או הלאה</p>
        </div>

        <div className="ds3-stack-3" style={{ marginTop: 22 }}>
          {primaryOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className="ds3-card-button"
              onClick={() => setChosen(opt.id)}
            >
              <div className="ds3-stack-1" style={{ flex: 1 }}>
                <span className="ds3-body" style={{ fontWeight: 700 }}>{opt.name}</span>
                <span className="ds3-caption ds3-text-muted">{opt.sub}</span>
              </div>
              <svg width="10" height="16" viewBox="0 0 10 16" className="ds3-chevron-end" aria-hidden="true">
                <path d="M8 1L2 8l6 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ))}
        </div>

        {showAdditionalToggle && !showAdditional && (
          <div className="ds3-text-center" style={{ marginTop: 18 }}>
            <button
              type="button"
              className="ds3-btn-quiet"
              style={{ height: 'auto', textDecoration: 'underline', textUnderlineOffset: 4, fontSize: 14 }}
              onClick={() => setShowAdditional(true)}
            >
              כלים נוספים
            </button>
          </div>
        )}

        {showAdditionalToggle && showAdditional && (
          <div style={{ marginTop: 18 }}>
            <div className="ds3-callout-terra" style={{ marginBottom: 12 }}>
              <p className="ds3-body" style={{ margin: 0, lineHeight: 1.55 }}>
                במצב מרוקן, גירוי קר יכול להעמיק את ההקפאה במקום לחלץ ממנה. אם זה עובד לך — מצוין, השתמש. אם לא — נסה רטט קולי או חיבוק פרפר במקום.
              </p>
            </div>
            <button
              type="button"
              className="ds3-card-button"
              onClick={() => setChosen('cold')}
            >
              <div className="ds3-stack-1" style={{ flex: 1 }}>
                <span className="ds3-body" style={{ fontWeight: 700 }}>עיגון קר</span>
                <span className="ds3-caption ds3-text-muted">מים קרים על פרקי הידיים</span>
              </div>
              <svg width="10" height="16" viewBox="0 0 10 16" className="ds3-chevron-end" aria-hidden="true">
                <path d="M8 1L2 8l6 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </main>
      <footer className="ds3-screen-footer">
        <button type="button" className="ds3-btn ds3-btn-primary" onClick={onNext}>הלאה</button>
      </footer>
    </div>
  );
}

function ButterflyExercise({ onDone, onBack, onExit }) {
  const [done, setDone] = useState(false);
  const handleComplete = () => {
    setDone(true);
  };
  return (
    <div className="ds3-screen">
      <Topbar onExit={onExit} label="חיבוק פרפר" />
      <main className="ds3-screen-content ds3-screen-content-center ds3-stack-5 ds3-text-center">
        <div className="ds3-stack-2">
          <h1 className="ds3-h1">חיבוק פרפר</h1>
          <p className="ds3-body ds3-text-muted">הצלב ידיים על החזה, טפיחות עדינות לסירוגין — אחת בשנייה</p>
        </div>
        <div className="ds3-center" style={{ minHeight: 220 }}>
          {!done && <ButterflyAnim durationSec={BUTTERFLY_DURATION_SEC} onComplete={handleComplete} />}
          {done && <p className="ds3-body" style={{ fontWeight: 600 }}>סיימת.</p>}
        </div>
      </main>
      <footer className="ds3-screen-footer ds3-stack-3">
        {done ? (
          <button type="button" className="ds3-btn ds3-btn-primary" onClick={onDone}>הלאה</button>
        ) : (
          <button type="button" className="ds3-btn-quiet" onClick={onBack}>חזור לבחירה</button>
        )}
      </footer>
    </div>
  );
}

// 3-state lifecycle per design 05a/05b/05c — idle (preview + start), active
// (animation running), after (1-10 score + "did you feel it" question).
function VagalHummingExercise({ onDone, onBack, onExit }) {
  const [stage, setStage] = useState('idle');
  const [intensity, setIntensity] = useState('gentle'); // gentle | intense
  const [silent, setSilent] = useState(false);
  const [feltIt, setFeltIt] = useState(null); // null | true | false
  const [afterScore, setAfterScore] = useState(5);

  const ringTint = intensity === 'intense' ? 'var(--terra)' : 'var(--lichen)';
  const ringTintRgba = intensity === 'intense'
    ? 'rgba(255, 106, 79, '
    : 'rgba(10, 132, 255, ';

  const handleAnimComplete = () => {
    setStage('after');
  };

  // ── ACTIVE — animation running ─────────────────────────────────────
  if (stage === 'active') {
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} label="רטט קולי" />
        <main className="ds3-screen-content ds3-screen-content-center ds3-stack-5 ds3-text-center">
          <div className="ds3-stack-2">
            <h1 className="ds3-h1">רטט קולי</h1>
            <p className="ds3-caption ds3-text-muted">המשך כל עוד נוח</p>
          </div>
          <div className="ds3-center" style={{ minHeight: 260 }}>
            <VagalAnim durationSec={VAGAL_DURATION_SEC} onComplete={handleAnimComplete} />
          </div>
        </main>
        <footer className="ds3-screen-footer">
          <button type="button" className="ds3-btn-quiet" onClick={handleAnimComplete}>
            סיימתי לפני
          </button>
        </footer>
      </div>
    );
  }

  // ── AFTER — score + "did you feel it?" ─────────────────────────────
  if (stage === 'after') {
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} label="רטט קולי" />
        <main className="ds3-screen-content ds3-stack-5">
          <div className="ds3-stack-2 ds3-text-center" style={{ marginTop: 8 }}>
            <h1 className="ds3-h1">איך זה הרגיש?</h1>
            <p className="ds3-caption ds3-text-muted">6 מחזורים הושלמו</p>
          </div>

          {/* Did you feel the vibration? — yes/no */}
          <div>
            <p className="ds3-body" style={{ marginBottom: 10, fontWeight: 600, textAlign: 'center' }}>
              הצלחת לחוש את הוויברציה?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setFeltIt(true)}
                style={{
                  flex: 1, height: 48, borderRadius: 14,
                  background: feltIt === true ? 'var(--terra)' : 'var(--surface)',
                  color: feltIt === true ? '#fff' : 'var(--ink)',
                  border: feltIt === true ? 'none' : '1px solid var(--line-soft)',
                  fontFamily: 'inherit', fontSize: 16, fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: feltIt === true ? '0 4px 14px rgba(255, 106, 79, 0.40)' : 'var(--shadow-soft)',
                }}
              >
                כן, הרגשתי
              </button>
              <button
                type="button"
                onClick={() => setFeltIt(false)}
                style={{
                  flex: 1, height: 48, borderRadius: 14,
                  background: feltIt === false ? 'var(--terra)' : 'var(--surface)',
                  color: feltIt === false ? '#fff' : 'var(--ink)',
                  border: feltIt === false ? 'none' : '1px solid var(--line-soft)',
                  fontFamily: 'inherit', fontSize: 16, fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: feltIt === false ? '0 4px 14px rgba(255, 106, 79, 0.40)' : 'var(--shadow-soft)',
                }}
              >
                לא ממש
              </button>
            </div>
          </div>

          {/* 1-10 score */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <span className="ds3-body" style={{ fontWeight: 600 }}>איך עכשיו?</span>
            </div>
            <ScoreSlider
              value={afterScore}
              onChange={setAfterScore}
              polarity="high-good"
              labels={['קל יותר', 'כבד']}
              ariaLabel="ציון אחרי"
            />
          </div>
        </main>
        <footer className="ds3-screen-footer">
          <button type="button" className="ds3-btn ds3-btn-primary" onClick={onDone}>הלאה</button>
        </footer>
      </div>
    );
  }

  // ── IDLE — preview, instructions, intensity toggle, "Start" ────────
  return (
    <div className="ds3-screen">
      {/* Topbar with skip on visual-left, back on right */}
      <div className="ds3-topbar">
        <button type="button" className="ds3-topbar-skip" onClick={onBack}>
          חזור
        </button>
        <span className="ds3-topbar-label" />
        <button type="button" className="ds3-topbar-back" aria-label="צא" onClick={onExit}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <main className="ds3-screen-content">
        <div className="ds3-stack-2 ds3-text-center" style={{ marginBottom: 8 }}>
          <h1 className="ds3-h2">רטט קולי</h1>
          <p className="ds3-caption ds3-text-muted" style={{ maxWidth: 280, margin: '4px auto 0' }}>
            הצליל מרטיט את עצב הוואגוס מבפנים
          </p>
        </div>

        {/* Breath hologram — figure inhales, then exhales humming "מממממ" */}
        <div className="ds3-center" style={{ minHeight: 260, margin: '8px 0 4px' }}>
          <VagalHummingHologram size={240} />
        </div>

        <div className="ds3-caption ds3-text-muted ds3-text-center" style={{ marginBottom: 16 }}>
          מחזור 1 מתוך 6
        </div>

        {/* Numbered instruction card */}
        <div className="ds3-card-tight" style={{ marginBottom: 14 }}>
          {[
            'יד אחת על הגרון, יד שנייה על החזה',
            'שאף עמוק דרך האף',
            'בנשיפה — הפק קול "מממם" נמוך',
            'שים לב לוויברציה תחת ידיך',
          ].map((line, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '6px 0',
              borderBottom: i < 3 ? '1px solid var(--line-soft)' : 'none',
            }}>
              <span className="ds3-caption" style={{
                width: 22, height: 22, borderRadius: 11,
                background: `${ringTintRgba}0.12)`,
                color: ringTint,
                display: 'grid', placeItems: 'center',
                fontWeight: 700, flexShrink: 0,
                fontSize: 12,
              }}>{i + 1}</span>
              <span className="ds3-body" style={{ flex: 1, lineHeight: 1.55 }}>{line}</span>
            </div>
          ))}
        </div>

        {/* Intensity toggle: gentle / intense */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button
            type="button"
            onClick={() => setIntensity('gentle')}
            aria-pressed={intensity === 'gentle'}
            style={{
              flex: 1, height: 44, borderRadius: 999,
              border: intensity === 'gentle' ? 'none' : '1px solid var(--line-soft)',
              background: intensity === 'gentle' ? 'var(--ink)' : 'transparent',
              color: intensity === 'gentle' ? '#fff' : 'var(--ink-muted)',
              fontFamily: 'inherit', fontSize: 15, fontWeight: 600,
              cursor: 'pointer', transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            בעדינות
          </button>
          <button
            type="button"
            onClick={() => setIntensity('intense')}
            aria-pressed={intensity === 'intense'}
            style={{
              flex: 1, height: 44, borderRadius: 999,
              border: intensity === 'intense' ? 'none' : '1px solid var(--line-soft)',
              background: intensity === 'intense' ? 'var(--terra)' : 'transparent',
              color: intensity === 'intense' ? '#fff' : 'var(--ink-muted)',
              fontFamily: 'inherit', fontSize: 15, fontWeight: 600,
              cursor: 'pointer', transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            בעוצמה
          </button>
        </div>

        {/* Silent fallback */}
        <div className="ds3-text-center">
          <button
            type="button"
            className="ds3-btn-quiet"
            style={{ height: 'auto', fontSize: 13, padding: '6px 0' }}
            onClick={() => setSilent((s) => !s)}
            aria-pressed={silent}
          >
            {silent ? 'מצב ללא קול פעיל — לחץ לחזרה לקול' : 'אי אפשר להשמיע קול עכשיו? המהם בפה סגור'}
          </button>
        </div>
      </main>

      <footer className="ds3-screen-footer">
        <button
          type="button"
          className="ds3-btn ds3-btn-primary"
          onClick={() => setStage('active')}
        >
          התחל
        </button>
      </footer>
    </div>
  );
}

const COLD_STEPS_BY_ACTIVATION = {
  hyper: [
    'מים קרים מהברז על פרקי הידיים',
    'או — שטוף פנים, התרכז סביב העיניים',
    'נשום רגיל תוך כדי',
  ],
  mid: [
    'מים קרים מהברז על פרקי הידיים',
    'או — קוביית קרח על הצוואר, חזית הגרון',
    'נשום רגיל תוך כדי',
  ],
  hypo: [
    'מים קרים מהברז על פרקי הידיים',
    'נשום רגיל תוך כדי',
  ],
};

function ColdAnchorExercise({ activation, onDone, onBack, onExit }) {
  const steps = COLD_STEPS_BY_ACTIVATION[activation] || COLD_STEPS_BY_ACTIVATION.mid;
  return (
    <div className="ds3-screen">
      <Topbar onExit={onExit} label="עיגון קר" />
      <main className="ds3-screen-content">
        <div className="ds3-stack-2" style={{ marginTop: 8 }}>
          <h1 className="ds3-h1">עיגון קר</h1>
          <p className="ds3-caption ds3-text-muted">mammalian dive reflex — מוריד דופק ב-10 עד 15 פעימות</p>
        </div>
        <div className="ds3-stack-3" style={{ marginTop: 22 }}>
          {steps.map((step, i) => (
            <div key={i} className="ds3-card-tight" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--lichen)',
                color: '#fff',
                display: 'grid', placeItems: 'center',
                fontSize: 16, fontWeight: 700, flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <p className="ds3-body" style={{ margin: 0, flex: 1 }}>{step}</p>
            </div>
          ))}
        </div>
      </main>
      <footer className="ds3-screen-footer ds3-stack-3">
        <button
          type="button"
          className="ds3-btn ds3-btn-primary"
          onClick={onDone}
        >
          סיימתי
        </button>
        <button type="button" className="ds3-btn-quiet" onClick={onBack}>חזור לבחירה</button>
      </footer>
    </div>
  );
}
