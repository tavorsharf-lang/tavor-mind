export default function BreathingChooser({ onPickSigh, onPick478, onSkip }) {
  return (
    <div className="sleep-page">
      <button type="button" className="sleep-skip" onClick={onSkip}>דלג</button>

      <div className="nidra-stage">
        <h2 className="nidra-title">בחר תרגיל נשימה</h2>
        <div className="nidra-actions">
          <button
            type="button"
            className="nidra-end-btn nidra-end-btn-primary"
            onClick={onPickSigh}
          >
            נשימה פיזיולוגית × 5
            <span className="sleep-faint" style={{ display: 'block', marginTop: 4 }}>
              מהיר · להורדת עוררות
            </span>
          </button>
          <button
            type="button"
            className="nidra-end-btn"
            onClick={onPick478}
          >
            נשימה 4-7-8
            <span className="sleep-faint" style={{ display: 'block', marginTop: 4 }}>
              ארוך יותר · להירדמות
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
