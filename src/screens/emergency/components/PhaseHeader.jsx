// PhaseHeader — DS3 topbar style. Replaces the old progress-dots + "לעצור כאן" pattern
// with a simple back-arrow + label header (matching the design's ScreenTopBar).
//
// Props kept for API compat:
//   phase / total — ignored (we don't show dots in DS3)
//   stageLabel — shown as the centered topbar label
//   onExit — wired to the back button
//   extra — rendered on the visual-left side (the "skip" slot)
//   icon — optional Phosphor Duotone icon component rendered before the label
//   tone — family color for the icon (e.g. 'crisis', 'calm', 'reflect')
export default function PhaseHeader({ stageLabel = null, onExit, extra = null, icon: Icon = null, tone = null }) {
  return (
    <div className="ds3-topbar">
      <div style={{ minWidth: 60, display: 'flex', justifyContent: 'flex-end' }}>
        {extra}
      </div>
      <span className="ds3-topbar-label">
        {Icon && (
          <span className={`ds3-topbar-label-icon ${tone ? `color-tone-${tone}` : ''}`} aria-hidden="true">
            <Icon />
          </span>
        )}
        {stageLabel || ''}
      </span>
      <button
        type="button"
        className="ds3-topbar-back"
        onClick={onExit}
        aria-label="לעצור כאן ולשמור"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
