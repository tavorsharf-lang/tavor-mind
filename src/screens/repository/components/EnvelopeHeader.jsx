import { ANALYSIS_TYPES } from '../../../data/analysisSchemas.js';
import { formatHebrewDate } from '../../../utils/dateHelpers.js';
import {
  EmotionRecognitionIcon,
  GratitudeIcon,
  ILanguageIcon,
  TherapyIcon,
  MetaAnalysisIcon,
} from '../../../components/icons/index.jsx';

const TYPE_ICON = {
  emotion_recognition: EmotionRecognitionIcon,
  gratitude: GratitudeIcon,
  i_language: ILanguageIcon,
  therapy_session: TherapyIcon,
  meta_analysis: MetaAnalysisIcon,
};

function fmtDate(s) {
  if (!s) return '—';
  try {
    return formatHebrewDate(s);
  } catch {
    return s;
  }
}

export default function EnvelopeHeader({ analysis }) {
  const meta = ANALYSIS_TYPES[analysis.type];
  const TypeIcon = TYPE_ICON[analysis.type];
  return (
    <header className="env-header">
      <div className="env-top-row">
        {meta && (
          <span className={`type-chip icon-tone-${meta.tone || 'reflect'}`}>
            {TypeIcon && (
              <span className="type-chip-icon" aria-hidden="true">
                <TypeIcon size={14} />
              </span>
            )}
            {meta.label}
          </span>
        )}
        {analysis._pending && <span className="pending-chip">ממתין לסנכרון</span>}
      </div>
      <h2 className="env-title">{analysis.title || 'ללא כותרת'}</h2>
      <div className="env-dates">
        <span><strong>התרחש:</strong> {fmtDate(analysis.occurredAt)}</span>
        <span><strong>נכתב:</strong> {fmtDate(analysis.createdAt)}</span>
      </div>
      {analysis.summary && (
        <aside className="env-summary">{analysis.summary}</aside>
      )}
      {Array.isArray(analysis.tags) && analysis.tags.length > 0 && (
        <div className="chip-row env-tags">
          {analysis.tags.map((t, i) => (
            <span key={i} className="chip">{t}</span>
          ))}
        </div>
      )}
    </header>
  );
}
