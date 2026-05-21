import { useState } from 'react';
import { ChevronStart } from '../../components/icons/system.jsx';

const META_PROMPT_THRESHOLD = 10;

export default function PhaseEarlyBridge({ midStreak = 0, onAnalyze, onContinue, onExit }) {
  const [metaDismissed, setMetaDismissed] = useState(false);
  const showMetaPrompt = midStreak >= META_PROMPT_THRESHOLD && !metaDismissed;

  if (showMetaPrompt) {
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} label="גשר מוקדם" />
        <main className="ds3-screen-content ds3-screen-content-center ds3-stack-5">
          <h1 className="ds3-h1 ds3-text-center">
            הסתכלתי על הסשנים האחרונים - תמיד בחרת לנתח מוקדם.
          </h1>
          <p className="ds3-body-lg ds3-text-muted ds3-text-center" style={{ maxWidth: 36 + 'ch', margin: '0 auto' }}>
            רוצה לנסות הפעם להשלים את העיגון קודם, לראות אם זה משנה משהו?
          </p>
        </main>
        <footer className="ds3-screen-footer ds3-stack-3">
          <button
            type="button"
            className="ds3-btn ds3-btn-primary"
            onClick={() => { setMetaDismissed(true); onContinue(); }}
          >
            כן, ננסה
          </button>
          <button
            type="button"
            className="ds3-btn-quiet"
            onClick={() => setMetaDismissed(true)}
          >
            לא הפעם
          </button>
        </footer>
      </div>
    );
  }

  return (
    <div className="ds3-screen">
      <Topbar onExit={onExit} label="גשר מוקדם" />
      <main className="ds3-screen-content ds3-screen-content-center">
        <div style={{ padding: '36px 4px 18px', textAlign: 'center' }}>
          <h1 className="ds3-h1" style={{ lineHeight: 1.35 }}>
            הגוף קצת רגוע יותר.
          </h1>
        </div>
        <div style={{ padding: '0 4px 8px', textAlign: 'center' }}>
          <p className="ds3-body-lg ds3-text-muted" style={{ lineHeight: 1.65 }}>
            יש משהו ספציפי שעלה לך - משפט, אירוע, מחשבה שחוזרת - שאתה רוצה לעבוד איתו עכשיו?
          </p>
        </div>
      </main>
      <footer className="ds3-screen-footer">
        <div className="ds3-stack-3" style={{ marginBottom: 14 }}>
          <button type="button" className="ds3-btn ds3-btn-primary" onClick={onAnalyze}>
            כן, יש משהו ברור - בוא ננתח
          </button>
          <button type="button" className="ds3-btn ds3-btn-outline-terra" onClick={onContinue}>
            קודם נשלים את העיגון
          </button>
        </div>
        <p className="ds3-micro ds3-text-soft ds3-text-center" style={{ opacity: 0.85, margin: 0 }}>
          אין בחירה נכונה. שתי הדרכים תקפות.
        </p>
      </footer>
    </div>
  );
}

function Topbar({ onExit, label }) {
  return (
    <div className="ds3-topbar">
      <span className="ds3-topbar-spacer" />
      <span className="ds3-topbar-label">{label}</span>
      <button type="button" className="ds3-topbar-back" aria-label="צא" onClick={onExit}>
        <ChevronStart size={22} />
      </button>
    </div>
  );
}
