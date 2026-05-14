import {
  HomePulse,
  PhaseTriggers,
  PhaseIntegration,
  SchemaVulnerable,
  Info,
  HomeHistory,
  ChevronEnd,
} from '../../components/icons/system.jsx';
import { dominantSchemas } from '../../data/schemas.js';
import { distortions, BODY_SENSATIONS } from '../../data/distortions.js';
import { getModeById } from '../../data/modes.js';
import HrSummaryCard from './components/HrSummaryCard.jsx';

const OTHER_SCHEMA = '__other__';

const ACTIVATION_LABELS = {
  hyper: 'הופעלתי',
  hypo:  'מרוקן',
  mid:   'עוד טריגר אחד',
};

const SCHEMA_NAME_BY_ID = Object.fromEntries(dominantSchemas.map((s) => [s.id, s.name]));
const DISTORTION_LABEL_BY_ID = Object.fromEntries(distortions.map((d) => [d.id, d.label]));
const SENSATION_LABEL_BY_ID = Object.fromEntries(BODY_SENSATIONS.map((s) => [s.id, s.label]));

// Section accent tints — Apple Health category colors (tokens.css).
const TINT = {
  body:  'var(--teal)',
  event: 'var(--orange)',
  mean:  'var(--indigo)',
  child: 'var(--pink)',
  meta:  'var(--ink-muted)',
};

function formatTimeNow() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDuration(seconds) {
  if (!seconds || seconds < 0) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const minsLabel = mins === 1 ? 'דקה' : `${mins} דקות`;
  const secsLabel = secs === 1 ? 'שנייה' : `${secs} שניות`;
  if (mins === 0) return secsLabel;
  if (secs === 0) return minsLabel;
  return `${minsLabel} ו-${secsLabel}`;
}

function schemaLabel(id, otherText) {
  if (id === OTHER_SCHEMA) {
    return otherText && otherText.trim() ? `אחרת — ${otherText.trim()}` : 'אחרת';
  }
  return SCHEMA_NAME_BY_ID[id] || id;
}

// ── card / section primitives ────────────────────────────────────────────

function Section({ icon: Icon, label, tint, children }) {
  return (
    <section className="ds3-section">
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        color: tint, fontSize: 14, fontWeight: 700, letterSpacing: '0.01em',
      }}>
        {Icon && <Icon size={18} />}
        <span>{label}</span>
      </div>
      <div className="ds3-stack-3">{children}</div>
    </section>
  );
}

function cardLabelStyle(tint, marginBottom = 6) {
  return { color: tint, fontSize: 14, fontWeight: 700, marginBottom };
}

function ValueCard({ label, value, sub, tint }) {
  return (
    <div className="ds3-card">
      <div style={cardLabelStyle(tint)}>{label}</div>
      <div className="ds3-h2">{value}</div>
      {sub && <p className="ds3-caption ds3-text-muted" style={{ margin: '6px 0 0' }}>{sub}</p>}
    </div>
  );
}

function TextCard({ label, text, tint }) {
  return (
    <div className="ds3-card">
      <div style={cardLabelStyle(tint, 8)}>{label}</div>
      <p className="ds3-body" style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{text}</p>
    </div>
  );
}

function ThoughtsCard({ label, thoughts, tint }) {
  return (
    <div className="ds3-card">
      <div style={cardLabelStyle(tint, 10)}>{label}</div>
      <div className="ds3-stack-2">
        {thoughts.map((thought, i) => (
          <p key={i} className="ds3-body" style={{
            margin: 0, lineHeight: 1.55,
            paddingInlineStart: 12, borderInlineStart: '2px solid var(--line)',
          }}>{thought}</p>
        ))}
      </div>
    </div>
  );
}

function ChipsCard({ label, chips, sub, tint }) {
  return (
    <div className="ds3-card">
      <div style={cardLabelStyle(tint, 10)}>{label}</div>
      <div className="ds3-chip-group">
        {chips.map((c, i) => <span key={i} className="ds3-chip-sm">{c}</span>)}
      </div>
      {sub && <p className="ds3-caption ds3-text-muted" style={{ margin: '10px 0 0' }}>{sub}</p>}
    </div>
  );
}

function SchemaCard({ dominant, others, tint }) {
  return (
    <div className="ds3-card">
      <div style={cardLabelStyle(tint)}>סכמה דומיננטית</div>
      <div className="ds3-h2">{dominant}</div>
      {others.length > 0 && (
        <div className="ds3-chip-group" style={{ marginTop: 10 }}>
          {others.map((s, i) => <span key={i} className="ds3-chip-sm">{s}</span>)}
        </div>
      )}
    </div>
  );
}

function MetaCard({ rows }) {
  return (
    <div className="ds3-card">
      <div className="ds3-stack-2">
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between',
            gap: 14, alignItems: 'baseline',
          }}>
            <span className="ds3-caption ds3-text-muted" style={{ flexShrink: 0 }}>{r.label}</span>
            <span className="ds3-caption" style={{ fontWeight: 600, textAlign: 'end' }}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── screen ───────────────────────────────────────────────────────────────

export default function PhaseSummary({ session, onShowRecords, onClose }) {
  const {
    analyzed,
    activation,
    breathingFelt62,
    breathingNote,
    bodyRegulationScore,
    modesIdentified = [],
    somaticRan,
    hrSessionId,
    startedAtMs,
    endedAtMs,
    trigger,
  } = session;

  // — body section —
  const feltLabels = { right: 'מעורר נכון', almost: 'כמעט יותר מדי', too_much: 'יותר מדי' };
  const patternLabels = { hyper: '4-7-8', mid: 'קופסה 4×4', hypo: '6-2 + 5-5' };
  const breathingValue = breathingFelt62
    ? (feltLabels[breathingFelt62] || 'הושלמה')
    : (patternLabels[activation] || null);
  const showSomatic = activation === 'hypo' || somaticRan;
  const hasBody = breathingValue || showSomatic || bodyRegulationScore != null;

  // — analysis sections — mirror buildTriggerAnalysisPrompt() in claudeHandoff.js,
  // which is the source of truth for what gets exported to Claude.
  const t = trigger || {};
  const sensations = (t.bodySignals || []).map((id) => SENSATION_LABEL_BY_ID[id] || id);
  const thoughts = (t.thoughts || []).map((x) => (x || '').trim()).filter(Boolean);
  const distortionLabels = (t.distortions || []).map((id) => DISTORTION_LABEL_BY_ID[id] || id);
  const modeLabels = modesIdentified.map((id) => getModeById(id)?.label || id);
  const heavinessNote = t.heavinessCheck === 'heavier'
    ? 'באמצע הסשן בדקת איך זה — היה יותר כבד.'
    : t.heavinessCheck === 'heavier_continue'
      ? 'באמצע הסשן בדקת איך זה — היה יותר כבד, ובחרת להמשיך.'
      : null;
  const dominantName = t.dominantSchema ? schemaLabel(t.dominantSchema, t.otherSchemaText) : null;
  const otherSchemaLabels = (t.schemas || [])
    .filter((id) => id !== t.dominantSchema)
    .map((id) => schemaLabel(id, t.otherSchemaText));

  const hasWhatHappened = analyzed
    && (t.event || sensations.length > 0 || thoughts.length > 0 || t.readBackFeeling || heavinessNote);
  const hasWhatItMeans = analyzed
    && (dominantName || modeLabels.length > 0 || distortionLabels.length > 0);
  const hasChildNeeds = analyzed && (t.childNeeds || t.healthyAdultMessage);

  // — meta —
  const metaRows = [];
  if (analyzed) {
    metaRows.push({ label: 'מתי', value: `עכשיו · ${formatTimeNow()}` });
    const dur = formatDuration(t.durationSeconds);
    if (dur) metaRows.push({ label: 'משך', value: dur });
    if (typeof t.initialActivation === 'number') {
      const cat = ACTIVATION_LABELS[activation];
      metaRows.push({
        label: 'הפעלה ראשונית',
        value: cat ? `${t.initialActivation}/10 · ${cat}` : `${t.initialActivation}/10`,
      });
    }
    if (t.closingNote) metaRows.push({ label: 'הערה אישית', value: t.closingNote });
    if (t.schemaModeBridgeResponse === 'rejected_known') {
      metaRows.push({ label: 'מוד מהסכמה', value: 'נדחה' });
    }
  }

  return (
    <div className="ds3-screen">
      <main className="ds3-screen-content" style={{ gap: 18, paddingTop: 6, paddingBottom: 24 }}>
        <h1 style={{
          fontSize: 34, fontWeight: 800, color: 'var(--ink)',
          letterSpacing: '-0.02em', margin: '4px 0 0', lineHeight: 1.1,
        }}>
          סיכום
        </h1>

        {hrSessionId && (
          <HrSummaryCard sessionId={hrSessionId} startedAtMs={startedAtMs} endedAtMs={endedAtMs} />
        )}

        {hasBody && (
          <Section icon={HomePulse} label="הגוף" tint={TINT.body}>
            {breathingValue && (
              <ValueCard label="נשימה" value={breathingValue} sub={breathingNote || null} tint={TINT.event} />
            )}
            {showSomatic && <ValueCard label="סומאטי" value="הושלם" tint={TINT.body} />}
            {bodyRegulationScore != null && (
              <ValueCard label="ויסות גוף" value={`${bodyRegulationScore}/10`} tint={TINT.body} />
            )}
          </Section>
        )}

        {hasWhatHappened && (
          <Section icon={PhaseTriggers} label="מה קרה" tint={TINT.event}>
            {t.event && <TextCard label="האירוע" text={t.event} tint={TINT.event} />}
            {sensations.length > 0 && (
              <ChipsCard label="בגוף הופיע" chips={sensations} tint={TINT.event} />
            )}
            {thoughts.length > 0 && (
              <ThoughtsCard label="המחשבות שעלו" thoughts={thoughts} tint={TINT.event} />
            )}
            {t.readBackFeeling && (
              <TextCard label="איך הרגיש לשמוע אותן" text={t.readBackFeeling} tint={TINT.event} />
            )}
            {heavinessNote && <TextCard label="בדיקת ביניים" text={heavinessNote} tint={TINT.event} />}
          </Section>
        )}

        {hasWhatItMeans && (
          <Section icon={PhaseIntegration} label="מה זה אומר" tint={TINT.mean}>
            {dominantName && (
              <SchemaCard dominant={dominantName} others={otherSchemaLabels} tint={TINT.mean} />
            )}
            {modeLabels.length > 0 && (
              <ChipsCard
                label="מודים שזיהיתי"
                chips={modeLabels}
                sub={t.phase9CustomDescription || null}
                tint={TINT.mean}
              />
            )}
            {distortionLabels.length > 0 && (
              <ChipsCard label="עיוותי חשיבה" chips={distortionLabels} tint={TINT.mean} />
            )}
          </Section>
        )}

        {hasChildNeeds && (
          <Section icon={SchemaVulnerable} label="מה הילד צריך" tint={TINT.child}>
            {t.childNeeds && (
              <TextCard label="הילד צריך עכשיו" text={t.childNeeds} tint={TINT.child} />
            )}
            {t.healthyAdultMessage && (
              <TextCard
                label="מה אני צריך לשמוע מהמבוגר הבריא"
                text={t.healthyAdultMessage}
                tint={TINT.child}
              />
            )}
          </Section>
        )}

        {analyzed && metaRows.length > 0 && (
          <Section icon={Info} label="פרטים" tint={TINT.meta}>
            <MetaCard rows={metaRows} />
          </Section>
        )}

        <button
          type="button"
          className="ds3-card-button"
          onClick={onShowRecords}
          style={{ marginTop: 4 }}
        >
          <span style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'var(--lichen)', color: '#fff',
            display: 'grid', placeItems: 'center',
          }}>
            <HomeHistory size={18} />
          </span>
          <span style={{ flex: 1, fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
            הצגת כל הרשומות
          </span>
          <span className="ds3-chevron-end" style={{ display: 'flex' }}>
            <ChevronEnd size={16} />
          </span>
        </button>
      </main>

      <footer className="ds3-screen-footer">
        <button type="button" className="ds3-btn ds3-btn-cream" onClick={onClose}>
          חזרה הביתה
        </button>
      </footer>
    </div>
  );
}
