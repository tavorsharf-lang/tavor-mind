import { dominantSchemas } from '../../data/schemas.js';

const MOOD_LABELS = ['מאוד לא נעים', 'לא נעים', 'מעט לא נעים', 'ניטרלי', 'ניטרלי', 'מעט נעים', 'נעים', 'מאוד נעים', 'נפלא'];

function formatTimeNow() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function CardIcon({ kind, color }) {
  const p = { stroke: color, fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (kind === 'mind') return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path d="M9 4a4 4 0 00-3 6.5A4 4 0 008 18a4 4 0 008 0 4 4 0 002-7.5A4 4 0 0014 4a3 3 0 00-5 0z" {...p}/>
    </svg>
  );
  if (kind === 'breath') return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" {...p}/>
      <circle cx="12" cy="12" r="7" {...p} strokeOpacity="0.6"/>
      <circle cx="12" cy="12" r="11" {...p} strokeOpacity="0.3"/>
    </svg>
  );
  if (kind === 'wave') return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0" {...p}/>
    </svg>
  );
  if (kind === 'note') return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path d="M5 4h14v16H5z M9 9h6 M9 13h6 M9 17h4" {...p}/>
    </svg>
  );
  return null;
}

export default function PhaseSummary({
  session,           // { activation, breathingFelt62, modesIdentified, dominantSchema, ... }
  onClose,           // navigate home
}) {
  const cards = [];

  // Mood card — from emotionsNamed if present
  if (session.moodIndex != null) {
    cards.push({
      tint: '#1FB6A6',
      label: 'מצב רוח',
      title: MOOD_LABELS[session.moodIndex] || 'נעים',
      meta: `עכשיו · ${formatTimeNow()}`,
      icon: 'mind',
      big: true,
    });
  } else if (session.closingScore != null) {
    const score = session.closingScore;
    const moodTitle = score >= 7 ? 'יותר טוב' : score >= 4 ? 'באמצע' : 'עדיין כבד';
    cards.push({
      tint: '#1FB6A6',
      label: 'מצב רוח',
      title: moodTitle,
      meta: `עכשיו · ${formatTimeNow()} · ${score}/10`,
      icon: 'mind',
      big: true,
    });
  }

  // Breathing card
  if (session.breathingFelt62) {
    const feltLabels = { right: 'מעורר נכון', almost: 'כמעט יותר מדי', too_much: 'יותר מדי' };
    cards.push({
      tint: '#FF8A2A',
      label: 'נשימה',
      title: feltLabels[session.breathingFelt62] || 'הושלמה',
      meta: 'גוף',
      icon: 'breath',
    });
  } else if (session.activation) {
    const patternLabels = { hyper: '4-7-8', mid: 'קופסה 4×4', hypo: '6-2 + 5-5' };
    cards.push({
      tint: '#FF8A2A',
      label: 'נשימה',
      title: patternLabels[session.activation] || 'הושלמה',
      meta: 'גוף',
      icon: 'breath',
    });
  }

  // Vagal/somatic card — only if had vagal session in session data (heuristic)
  if (session.activation === 'hypo' || session.somaticRan) {
    cards.push({
      tint: '#FF6A4F',
      label: 'סומאטי',
      title: session.somaticFelt || 'הושלם',
      meta: 'גוף',
      icon: 'wave',
    });
  }

  // Dominant schema card
  if (session.dominantSchema) {
    const schemaName = dominantSchemas.find((s) => s.id === session.dominantSchema)?.name || session.dominantSchema;
    cards.push({
      tint: '#5E5CE6',
      label: 'סכמה שעלתה',
      title: schemaName,
      meta: 'נשמר ליום ג׳',
      icon: 'note',
    });
  }

  // If absolutely nothing — show a generic card
  if (cards.length === 0) {
    cards.push({
      tint: '#1FB6A6',
      label: 'סשן',
      title: 'הושלם',
      meta: `עכשיו · ${formatTimeNow()}`,
      icon: 'mind',
      big: true,
    });
  }

  return (
    <div className="ds3-screen">
      <main className="ds3-screen-content">
        <div style={{ marginTop: 4, marginBottom: 18 }}>
          <h1 style={{
            fontSize: 34, fontWeight: 800, color: 'var(--ink)',
            letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1,
          }}>
            סיכום
          </h1>
        </div>

        <div className="ds3-stack-3">
          {cards.map((card, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 22, padding: '16px 18px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(60,60,67,0.10)',
              minHeight: card.big ? 120 : 84,
              display: 'flex', flexDirection: 'column',
              justifyContent: 'space-between', gap: 8,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  color: card.tint, fontFamily: 'inherit',
                  fontSize: 15, fontWeight: 700,
                }}>
                  <CardIcon kind={card.icon} color={card.tint}/>
                  <span>{card.label}</span>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  color: 'var(--ink-muted)', fontSize: 13,
                }}>
                  <svg width="8" height="14" viewBox="0 0 8 14"><path d="M7 1L1 7l6 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                  <span>{card.meta}</span>
                </div>
              </div>
              <div className="ds3-h2" style={{ marginTop: 4 }}>{card.title}</div>
              {card.big && card.subnote && (
                <div className="ds3-caption ds3-text-muted">{card.subnote}</div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#fff', border: 'none', borderRadius: 22, padding: '16px 18px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(60,60,67,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: 'inherit', fontSize: 17, fontWeight: 700,
              color: 'var(--ink)', cursor: 'pointer',
              minHeight: 64,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'var(--heart)',
                display: 'grid', placeItems: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                  <path d="M12 21s-7-4.5-7-11a4 4 0 017-2.6A4 4 0 0119 10c0 6.5-7 11-7 11z"/>
                </svg>
              </div>
              <span>הצגת כל הרשומות</span>
            </div>
            <svg width="8" height="14" viewBox="0 0 8 14"><path d="M7 1L1 7l6 6" stroke="var(--ink-muted)" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
          </button>
        </div>
      </main>

      <footer className="ds3-screen-footer">
        <button type="button" className="ds3-btn ds3-btn-cream" onClick={onClose}>
          חזרה הביתה
        </button>
      </footer>
    </div>
  );
}
