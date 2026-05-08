export default function CheckinHeader({ step, total, onExit }) {
  return (
    <header className="phase-header">
      <div className="phase-dots" aria-label={`שלב ${step} מתוך ${total}`}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`phase-dot ${i + 1 === step ? 'is-current' : ''}`} />
        ))}
      </div>
      <button type="button" className="phase-exit" onClick={onExit}>
        סיימתי
      </button>
    </header>
  );
}
