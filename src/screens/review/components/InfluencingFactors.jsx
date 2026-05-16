import { InfluencingFactorsIcon } from '../../../components/icons/index.jsx';
import { factorLabelById } from '../../../data/lifeFactors.js';
import { VALENCE_LABELS } from '../../../data/emotionsCorpus.js';

function valenceTone(avg) {
  if (avg == null) return 'is-neutral';
  if (avg <= 3.4) return 'is-cool';
  if (avg >= 4.6) return 'is-warm';
  return 'is-neutral';
}

function valenceShort(avg) {
  if (avg == null) return null;
  const rounded = Math.round(avg);
  return VALENCE_LABELS[rounded] || null;
}

export default function InfluencingFactors({ data }) {
  const top = (data?.top || []).slice(0, 5);
  const totalWithFactors = data?.totalWithFactors || 0;
  const totalEntries = data?.totalEntries || 0;
  const absent = data?.absent || [];

  if (totalWithFactors === 0) {
    return (
      <section className="review-section">
        <header className="review-section-header">
          <h3 className="review-section-title">
            <span className="review-section-icon icon-tone-mind" aria-hidden="true">
              <InfluencingFactorsIcon />
            </span>
            מה השפיע עליך
          </h3>
          <p className="review-section-sub">תחומי החיים שסימנת בצ׳ק־אינים</p>
        </header>
        <p className="review-section-empty-line">
          לא סימנת תחומים בצ׳ק־אינים בטווח הזה. בפעם הבאה — נסה לסמן.
        </p>
      </section>
    );
  }

  return (
    <section className="review-section">
      <header className="review-section-header">
        <h3 className="review-section-title">
          <span className="review-section-icon icon-tone-mind" aria-hidden="true">
            <InfluencingFactorsIcon />
          </span>
          מה השפיע עליך
        </h3>
        <p className="review-section-sub">
          {totalWithFactors} מתוך {totalEntries} צ׳ק־אינים סומנו בתחום
        </p>
      </header>

      <ul className="review-factors-list">
        {top.map((f) => {
          const pct = Math.round(f.ratio * 100);
          const valLabel = valenceShort(f.avgValence);
          return (
            <li
              key={f.id}
              className={`review-factor-row ${valenceTone(f.avgValence)}`}
              style={{ '--factor-color': f.color }}
            >
              <span className="review-factor-bullet" aria-hidden="true" />
              <span className="review-factor-label">{f.label}</span>
              <span className="review-factor-meta">
                <span className="review-factor-count">{f.count}×</span>
                <span className="review-factor-ratio">{pct}%</span>
                {valLabel && <span className="review-factor-valence">{valLabel}</span>}
              </span>
            </li>
          );
        })}
      </ul>

      {absent.length > 0 && top.length > 0 && (
        <>
          <h4 className="absent-title">תחומים שלא סומנו</h4>
          <div className="absent-list">
            {absent.slice(0, 8).map((id) => (
              <span key={id} className="absent-chip">{factorLabelById(id)}</span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
