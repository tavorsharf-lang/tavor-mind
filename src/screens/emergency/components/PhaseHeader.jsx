const DEFAULT_TOTAL = 7;

export default function PhaseHeader({ phase, total = DEFAULT_TOTAL, stageLabel = null, onExit, extra = null }) {
  return (
    <header className="phase-header">
      <div className="phase-progress">
        {stageLabel && <span className="phase-stage-label">{stageLabel}</span>}
        <div className="phase-dots" aria-label={`שלב ${phase} מתוך ${total}`}>
          {Array.from({ length: total }, (_, i) => {
            const idx = i + 1;
            const state = idx === phase ? 'is-current' : idx < phase ? 'is-completed' : '';
            return <span key={i} className={`phase-dot ${state}`} />;
          })}
        </div>
      </div>
      <div className="phase-header-end">
        {extra}
        <button type="button" className="phase-exit" onClick={onExit} aria-label="לעצור כאן ולשמור">
          לעצור כאן
        </button>
      </div>
    </header>
  );
}
