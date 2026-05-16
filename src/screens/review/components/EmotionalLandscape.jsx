import EmptyState from './EmptyState.jsx';
import { EMOTIONS as EMOTION_VOCAB, emotionLabelById } from '../../../data/emotionsCorpus.js';
import { EmotionalLandscapeIcon } from '../../../components/icons/index.jsx';

const VALENCE_BY_ID = Object.fromEntries(
  EMOTION_VOCAB.map((e) => [e.id, e.valences[0]])
);

function sizeClassFromCount(c) {
  if (c >= 5) return 'is-lg';
  if (c >= 2) return 'is-md';
  return 'is-sm';
}

function categoryClass(valence) {
  if (valence == null) return 'is-neutral';
  if (valence <= 3) return 'is-cool';
  if (valence >= 5) return 'is-warm';
  return 'is-neutral';
}

export default function EmotionalLandscape({ data }) {
  const fromCheckins = data?.fromCheckins || [];
  const fromAnalyses = data?.fromAnalyses || [];
  const absent = data?.absent || [];

  const merged = new Map();
  for (const e of fromCheckins) {
    merged.set(`id:${e.id}`, { id: e.id, label: e.name, count: e.count, valence: VALENCE_BY_ID[e.id] });
  }
  for (const e of fromAnalyses) {
    const matchById = EMOTION_VOCAB.find((v) => v.label === e.name);
    const key = matchById ? `id:${matchById.id}` : `name:${e.name}`;
    if (merged.has(key)) {
      merged.get(key).count += e.count;
    } else {
      merged.set(key, {
        id: matchById?.id ?? null,
        label: matchById?.label || e.name,
        count: e.count,
        valence: matchById ? matchById.valences[0] : null,
      });
    }
  }
  const top = Array.from(merged.values())
    .filter((x) => x.label)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const hasAny = top.length > 0;

  return (
    <section className="review-section">
      <header className="review-section-header">
        <h3 className="review-section-title">
          <span className="review-section-icon icon-tone-body" aria-hidden="true"><EmotionalLandscapeIcon /></span>
          נוף רגשי
        </h3>
        <p className="review-section-sub">מה הופיע, מה לא הופיע</p>
      </header>

      {!hasAny ? (
        <EmptyState inline />
      ) : (
        <div className="emotion-landscape-grid">
          {top.map((e) => (
            <span
              key={`${e.id || e.label}`}
              className={`landscape-chip ${sizeClassFromCount(e.count)} ${categoryClass(e.valence)}`}
              title={`${e.label} · ${e.count}×`}
            >
              {e.label}
              <span className="landscape-chip-count">{e.count}</span>
            </span>
          ))}
        </div>
      )}

      {absent.length > 0 && (
        <>
          <h4 className="absent-title">מה לא הופיע</h4>
          <div className="absent-list">
            {absent.slice(0, 10).map((id) => (
              <span key={id} className="absent-chip">{emotionLabelById(id)}</span>
            ))}
          </div>
          <p className="absent-thesis">
            היעדר זה גם מידע. רגש שלא הופיע — לא בהכרח לא היה. אולי לא ניתן לו מקום.
          </p>
        </>
      )}
    </section>
  );
}
