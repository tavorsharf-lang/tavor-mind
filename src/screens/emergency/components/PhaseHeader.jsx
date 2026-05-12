import { ChevronStart } from '../../../components/icons/system.jsx';

// PhaseHeader — DS3 topbar style. Replaces the old progress-dots + "לעצור כאן" pattern
// with a simple back-arrow + label header (matching the design's ScreenTopBar).
//
// Props kept for API compat:
//   phase / total — ignored (we don't show dots in DS3)
//   stageLabel — shown as the centered topbar label
//   onExit — wired to the back button
//   extra — rendered on the visual-left side (the "skip" slot)
//   icon — optional icon component rendered before the label
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
        <ChevronStart size={22} />
      </button>
    </div>
  );
}
