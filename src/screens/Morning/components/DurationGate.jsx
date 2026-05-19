export default function DurationGate({ onChoose }) {
  return (
    <div className="morning-stage morning-gate">
      <h1 className="morning-title">בוקר טוב</h1>
      <p className="morning-sub">כמה זמן יש לך עכשיו?</p>

      <div className="morning-gate-actions">
        <button
          type="button"
          className="morning-btn morning-btn-soft"
          onClick={() => onChoose('short')}
        >
          יש לי דקה
        </button>
        <button
          type="button"
          className="morning-btn morning-btn-soft"
          onClick={() => onChoose('long')}
        >
          יש לי כמה דקות
        </button>
      </div>

      <button
        type="button"
        className="morning-skip-link"
        onClick={() => onChoose('short')}
      >
        דלג
      </button>
    </div>
  );
}
