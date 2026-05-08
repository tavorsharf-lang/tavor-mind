import { PATTERN_LABELS, MODE_LABELS } from '../../../data/analysisSchemas.js';
import { resolveModeId } from '../../../data/modes.js';

export default function PatternsPills({ patterns, compact = false }) {
  if (!patterns || typeof patterns !== 'object') return null;

  const trueOnes = Object.entries(PATTERN_LABELS).filter(([k]) => patterns[k] === true);
  const dominantModeId = patterns.dominant_mode;
  const canonicalId = dominantModeId ? resolveModeId(dominantModeId) : null;
  const modeLabel = canonicalId ? MODE_LABELS[canonicalId] : null;

  if (trueOnes.length === 0 && !dominantModeId) return null;

  return (
    <div className={`pattern-pills ${compact ? 'is-compact' : ''}`}>
      {trueOnes.map(([key, label]) => (
        <span key={key} className="pattern-chip">{label}</span>
      ))}
      {dominantModeId && modeLabel && (
        <span className="pattern-chip is-mode">
          <span className="pattern-chip-prefix">מוד דומיננטי:</span> {modeLabel}
        </span>
      )}
      {dominantModeId && !modeLabel && (
        <span className="pattern-pill-unknown">
          מוד דומיננטי: {dominantModeId} (לא ידוע)
        </span>
      )}
    </div>
  );
}
