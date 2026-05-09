import { useState } from 'react';
import CallSomeoneModal from '../../components/ui/CallSomeoneModal.jsx';
import { VagalAnim, ButterflyAnim, BodyScanAnim } from '../tools/components/somatic/SomaticAnimations.jsx';
import { colorForScore } from '../../utils/scoreColor.js';
import { Phase7BridgeIcon } from '../../components/icons/index.jsx';

const MAX_EXTRA_ROUNDS = 3;

const EXTRA_TOOLS = [
  { id: 'vagal',     name: 'ויברציה', sub: 'המהום וגאלי, רטט במיתרי הקול',          durationSec: 60 },
  { id: 'butterfly', name: 'מגע',     sub: 'חיבוק פרפר — טפיחות עדינות לסירוגין',  durationSec: 60 },
  { id: 'bodyscan',  name: 'שקט',     sub: 'סריקת גוף קצרה — 7 נקודות',             durationSec: 70 },
];

function deriveZone(score) {
  if (score >= 7) return 'high';
  if (score <= 3) return 'low';
  return 'mid';
}

export default function Phase7Bridge({
  earlyBridgeChoice,
  bodyRegulationScore,
  setBodyRegulationScore,
  onCalmFinish,
  onContinueToAnalyze,
  onExit,
}) {
  const [stage, setStage] = useState('rate');
  const [scoreTouched, setScoreTouched] = useState(bodyRegulationScore != null);
  const [score, setScore] = useState(bodyRegulationScore ?? 5);
  const [extraToolId, setExtraToolId] = useState(null);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [showCall, setShowCall] = useState(false);

  const handleScoreChange = (raw) => {
    // direction:ltr on the input gives native left=1, right=10. Labels in
    // RTL flex put "רגוע יחסית" first → on the right, matching score=10
    // at the right end. No mirror needed.
    const newScore = parseInt(raw, 10);
    setScore(newScore);
    if (!scoreTouched) setScoreTouched(true);
  };

  const goToOptions = () => {
    setBodyRegulationScore(score);
    if (roundsCompleted >= MAX_EXTRA_ROUNDS && score <= 6) {
      setStage('too_many_rounds');
    } else {
      setStage('options');
    }
  };

  // ── STAGE: rate ──────────────────────────────────────────────────────
  if (stage === 'rate') {
    const handlePos = ((score - 1) / 9) * 100;
    const tint = colorForScore(score, 'high-good');
    return (
      <div className="ds3-screen">
        <div className="ds3-breath-bg" aria-hidden="true" />
        <Topbar onExit={onExit} />

        <main className="ds3-screen-content" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <h1 className="ds3-h1">תעצור רגע</h1>
            <p className="ds3-body ds3-text-muted" style={{ marginTop: 10 }}>שים לב לגוף עכשיו</p>
          </div>

          <div className="ds3-grow" />

          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h2 className="ds3-h2" style={{ marginBottom: 8 }}>כמה הגוף רגוע?</h2>
            <p className="ds3-caption ds3-text-soft" style={{ fontStyle: 'italic', fontWeight: 400 }}>
              לא הראש — הגוף בלבד. אין תשובה נכונה.
            </p>
          </div>

          <div className="ds3-slider-wrap">
            <div className="ds3-slider-track" />
            {scoreTouched && (
              <div
                className="ds3-slider-fill"
                style={{
                  left: 4, right: 'auto',
                  width: `calc(${handlePos}% - 8px)`,
                  background: `linear-gradient(90deg, ${tint.soft}, ${tint.main})`,
                  transition: 'background 200ms ease, width 150ms ease',
                }}
              />
            )}
            <div
              className="ds3-slider-handle"
              style={{
                left: `calc(${handlePos}% - 22px)`, right: 'auto',
                boxShadow: `0 0 0 3px ${tint.main}, 0 6px 18px ${tint.glow}`,
                transition: 'left 150ms ease, box-shadow 200ms ease',
              }}
            >
              <div className="ds3-slider-handle-dot" style={{ background: tint.main, transition: 'background 200ms ease' }} />
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={score}
              onChange={(e) => handleScoreChange(e.target.value)}
              className="ds3-slider-input"
              aria-label="כמה רגוע הגוף, מ-1 עד 10"
            />
          </div>

          <div className="ds3-slider-labels">
            <span>רגוע יחסית</span>
            <span>עדיין מוצף</span>
          </div>

          {scoreTouched && (
            <div className="ds3-slider-value" style={{ marginTop: 20, color: tint.main, transition: 'color 200ms ease' }}>
              {score}/10
            </div>
          )}

          <div className="ds3-grow" />
        </main>

        <footer className="ds3-screen-footer">
          {scoreTouched && (
            <button type="button" className="ds3-btn ds3-btn-blue" onClick={goToOptions}>
              המשך
            </button>
          )}
        </footer>
      </div>
    );
  }

  // ── STAGE: options (zone-based) ──────────────────────────────────────
  if (stage === 'options') {
    const zone = deriveZone(score);
    const isFromContinueChoice = earlyBridgeChoice === 'continue';
    // Per design 3 — when user came from "continue" (chose NOT to analyze
    // early) and is now in high-zone, render the contextual dashed callout
    // above the standard "מה עכשיו?" question.
    const showContinueContext = isFromContinueChoice && zone === 'high';

    let title;
    if (zone === 'high') {
      title = showContinueContext
        ? 'מה עכשיו?'
        : 'הגוף נרגע יחסית.\nמה עכשיו?';
    } else if (zone === 'mid') {
      title = 'הגוף עדיין במתח חלקי.\nמה תרצה לעשות?';
    } else {
      title = 'הגוף עדיין מוצף.\nבוא נעבוד איתו עוד.';
    }

    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} />
        <main className="ds3-screen-content">
          {showContinueContext && (
            <div style={{
              marginTop: 8,
              padding: '14px 16px',
              background: 'rgba(255, 106, 79, 0.10)',
              borderRadius: 16,
              border: '1px dashed rgba(255, 106, 79, 0.50)',
            }}>
              <div className="ds3-micro" style={{
                color: 'var(--terra)', fontWeight: 700,
                marginBottom: 6, letterSpacing: '0.04em',
              }}>
                ⤴︎ ממה שעלה קודם
              </div>
              <p className="ds3-body" style={{
                color: 'var(--ink)', lineHeight: 1.55, marginBottom: 12, marginTop: 0,
              }}>
                סימנת קודם שזה לא היה ספציפי. עכשיו אחרי שעברת — האם משהו התבהר?
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={onContinueToAnalyze}
                  style={{
                    flex: 1, height: 44, borderRadius: 22,
                    background: 'var(--terra)', color: '#fff', border: 'none',
                    fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  כן, יש משהו עכשיו
                </button>
                <button
                  type="button"
                  onClick={onCalmFinish}
                  style={{
                    flex: 1, height: 44, borderRadius: 22,
                    background: 'var(--surface)', color: 'var(--terra)',
                    border: '1.5px solid var(--terra)',
                    fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  לא, אני רגוע
                </button>
              </div>
            </div>
          )}

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 className="ds3-h1 ds3-text-center" style={{ lineHeight: 1.4, whiteSpace: 'pre-line' }}>
              {title}
            </h1>
            {showContinueContext && (
              <p className="ds3-body ds3-text-muted ds3-text-center" style={{ marginTop: 8 }}>
                בחר את הדרך שמרגישה נכונה.
              </p>
            )}
          </div>
        </main>
        <footer className="ds3-screen-footer">
          {zone === 'high' && (
            <div className="ds3-stack-3">
              <button type="button" className="ds3-btn ds3-btn-primary" onClick={onContinueToAnalyze}>
                {showContinueContext ? 'בוא ננתח' : 'בוא ננתח את זה'}
              </button>
              <button type="button" className="ds3-btn ds3-btn-cream" onClick={onCalmFinish}>
                {showContinueContext ? 'סיימתי כאן' : 'סיימתי, אני רגוע'}
              </button>
            </div>
          )}
          {zone === 'mid' && (
            <div className="ds3-stack-3">
              <button type="button" className="ds3-btn ds3-btn-primary" onClick={() => setStage('extra_picker')}>
                להירגע עוד קצת
              </button>
              <button type="button" className="ds3-btn ds3-btn-cream" onClick={onCalmFinish}>
                סיימתי לבינתיים
              </button>
              <button type="button" className="ds3-btn ds3-btn-cream" onClick={onContinueToAnalyze}>
                בוא ננתח
              </button>
            </div>
          )}
          {zone === 'low' && (
            <>
              <div className="ds3-stack-3" style={{ marginBottom: 14 }}>
                <button type="button" className="ds3-btn ds3-btn-primary" onClick={() => setStage('extra_picker')}>
                  סיבוב נוסף של נשימה+סומאטי
                </button>
                <button type="button" className="ds3-btn ds3-btn-coral" onClick={() => setShowCall(true)}>
                  לקרוא לחבר
                </button>
              </div>
              <div className="ds3-text-center">
                <button
                  type="button"
                  className="ds3-btn-quiet"
                  style={{ height: 'auto', textDecoration: 'underline', textUnderlineOffset: 3, fontSize: 13 }}
                  onClick={onCalmFinish}
                >
                  אני יודע, אני רוצה בכל זאת לסיים
                </button>
                <button
                  type="button"
                  className="ds3-btn-quiet"
                  style={{ height: 'auto', textDecoration: 'underline', textUnderlineOffset: 3, fontSize: 13 }}
                  onClick={onContinueToAnalyze}
                >
                  או לנתח
                </button>
              </div>
            </>
          )}
        </footer>
        <CallSomeoneModal open={showCall} onClose={() => setShowCall(false)} />
      </div>
    );
  }

  // ── STAGE: extra_picker — 3 quick body needs ─────────────────────────
  if (stage === 'extra_picker') {
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} />
        <main className="ds3-screen-content ds3-stack-5">
          <div className="ds3-stack-2" style={{ marginTop: 12 }}>
            <h1 className="ds3-h1">מה הגוף הכי צריך עכשיו?</h1>
            <p className="ds3-body ds3-text-muted">סיבוב {roundsCompleted + 1} מתוך {MAX_EXTRA_ROUNDS}</p>
          </div>
          <div className="ds3-stack-3">
            {EXTRA_TOOLS.map((t) => (
              <button
                key={t.id}
                type="button"
                className="ds3-card-button"
                onClick={() => { setExtraToolId(t.id); setStage('extra_running'); }}
              >
                <div className="ds3-stack-1" style={{ flex: 1 }}>
                  <span className="ds3-body" style={{ fontWeight: 700 }}>{t.name}</span>
                  <span className="ds3-caption ds3-text-muted">{t.sub}</span>
                </div>
                <svg width="10" height="16" viewBox="0 0 10 16" className="ds3-chevron-end" aria-hidden="true">
                  <path d="M8 1L2 8l6 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ))}
          </div>
        </main>
        <footer className="ds3-screen-footer">
          <button type="button" className="ds3-btn-quiet" onClick={() => setStage('rate')}>
            חזור לדירוג
          </button>
        </footer>
      </div>
    );
  }

  // ── STAGE: extra_running — somatic exercise ──────────────────────────
  if (stage === 'extra_running') {
    const tool = EXTRA_TOOLS.find((t) => t.id === extraToolId);
    if (!tool) {
      setStage('extra_picker');
      return null;
    }
    const handleComplete = () => {
      setRoundsCompleted(roundsCompleted + 1);
      setExtraToolId(null);
      setScoreTouched(false);
      setStage('rate');
    };
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} />
        <main className="ds3-screen-content ds3-screen-content-center ds3-stack-5">
          <div className="ds3-stack-2 ds3-text-center">
            <h1 className="ds3-h1">{tool.name}</h1>
            <p className="ds3-body ds3-text-muted">{tool.sub}</p>
          </div>
          <div className="ds3-center" style={{ minHeight: 240 }}>
            {tool.id === 'vagal' && <VagalAnim durationSec={tool.durationSec} onComplete={handleComplete} />}
            {tool.id === 'butterfly' && <ButterflyAnim durationSec={tool.durationSec} onComplete={handleComplete} />}
            {tool.id === 'bodyscan' && <BodyScanAnim durationSec={tool.durationSec} onComplete={handleComplete} />}
          </div>
        </main>
        <footer className="ds3-screen-footer">
          <button type="button" className="ds3-btn-quiet" onClick={handleComplete}>
            סיימתי לפני הזמן
          </button>
        </footer>
      </div>
    );
  }

  // ── STAGE: too_many_rounds — soft pivot ──────────────────────────────
  if (stage === 'too_many_rounds') {
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} />
        <main className="ds3-screen-content ds3-screen-content-center ds3-stack-5">
          <div className="ds3-stack-3 ds3-text-center">
            <h1 className="ds3-h1">עברנו כמה סיבובים — הגוף עדיין צריך משהו אחר.</h1>
            <p className="ds3-body ds3-text-muted">לפעמים הגוף לא נרגע לבד, וזה לא כישלון — זה מידע.</p>
          </div>
          <button type="button" className="ds3-btn ds3-btn-coral" onClick={() => setShowCall(true)}>
            לקרוא לחבר
          </button>
        </main>
        <footer className="ds3-screen-footer ds3-stack-2">
          <button type="button" className="ds3-btn-quiet" onClick={onCalmFinish}>לסיים בכל זאת</button>
          <button type="button" className="ds3-btn-quiet" onClick={onContinueToAnalyze}>לנתח בכל זאת</button>
        </footer>
        <CallSomeoneModal open={showCall} onClose={() => setShowCall(false)} />
      </div>
    );
  }

  return null;
}

function Topbar({ onExit }) {
  return (
    <div className="ds3-topbar">
      <span className="ds3-topbar-spacer" />
      <span className="ds3-topbar-label">
        <span className="ds3-topbar-label-icon color-tone-reflect" aria-hidden="true"><Phase7BridgeIcon /></span>
        שלב 1 · להירגע
      </span>
      <button type="button" className="ds3-topbar-back" aria-label="צא" onClick={onExit}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
