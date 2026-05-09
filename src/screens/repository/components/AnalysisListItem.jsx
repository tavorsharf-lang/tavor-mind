import { useNavigate } from 'react-router-dom';
import { ANALYSIS_TYPES } from '../../../data/analysisSchemas.js';
import { formatHebrewDate, relativeDay, getIsraelDateString } from '../../../utils/dateHelpers.js';
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

const MAX_VISIBLE_TAGS = 3;

function dateLabel(occurredAt) {
  if (!occurredAt) return '—';
  try {
    const ds = getIsraelDateString(new Date(occurredAt));
    const rel = relativeDay(ds);
    const full = formatHebrewDate(ds);
    return rel === full ? full : rel;
  } catch {
    return '—';
  }
}

export default function AnalysisListItem({ analysis }) {
  const navigate = useNavigate();
  const meta = ANALYSIS_TYPES[analysis.type];
  const TypeIcon = TYPE_ICON[analysis.type];
  const tags = Array.isArray(analysis.tags) ? analysis.tags : [];
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const extraTags = Math.max(0, tags.length - MAX_VISIBLE_TAGS);

  return (
    <li className="analysis-row">
      <button
        type="button"
        className="analysis-row-toggle"
        onClick={() => navigate(`/repository/${analysis._id}`)}
      >
        <div className="analysis-row-top">
          {meta && (
            <span className={`type-chip type-chip-sm icon-tone-${meta.tone || 'reflect'}`}>
              {TypeIcon && (
                <span className="type-chip-icon" aria-hidden="true">
                  <TypeIcon size={14} />
                </span>
              )}
              {meta.label}
            </span>
          )}
          <span className="analysis-row-date">{dateLabel(analysis.occurredAt)}</span>
          {analysis._pending && <span className="pending-chip">ממתין</span>}
        </div>
        <h3 className="analysis-row-title">{analysis.title || 'ללא כותרת'}</h3>
        <p className="analysis-row-summary">{analysis.summary || ''}</p>
        {tags.length > 0 && (
          <div className="analysis-row-tags">
            {visibleTags.map((t, i) => (
              <span key={i} className="chip chip-tiny">{t}</span>
            ))}
            {extraTags > 0 && <span className="chip chip-tiny chip-muted">+{extraTags}</span>}
          </div>
        )}
      </button>
    </li>
  );
}
