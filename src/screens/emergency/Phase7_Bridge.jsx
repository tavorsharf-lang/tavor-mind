import PhaseHeader from './components/PhaseHeader.jsx';

const STAGE_TOTAL = 7;
const STAGE_LABEL = 'שלב 1 — להירגע';

export default function Phase7Bridge({ onCalmFinish, onContinueToAnalyze, onExit }) {
  return (
    <div className="phase phase-bridge">
      <PhaseHeader phase={7} total={STAGE_TOTAL} stageLabel={STAGE_LABEL} onExit={onExit} />
      <main className="phase-content">
        <h1 className="phase-title">הגוף נרגע. מה עכשיו?</h1>
        <p className="phase-subline">אפשר לעצור כאן, או להמשיך להבין מה קרה</p>
        <div className="bridge-options">
          <button
            type="button"
            className="phase-somatic-option"
            onClick={onCalmFinish}
          >
            <span className="phase-somatic-option-name">סיימתי, אני רגוע</span>
            <span className="phase-somatic-option-sub">לסגור את הסשן ולחזור הביתה</span>
          </button>
          <button
            type="button"
            className="phase-somatic-option"
            onClick={onContinueToAnalyze}
          >
            <span className="phase-somatic-option-name">בוא ננתח את זה</span>
            <span className="phase-somatic-option-sub">להבין מה קרה — טריגר, מוד, סכמה</span>
          </button>
        </div>
      </main>
    </div>
  );
}
