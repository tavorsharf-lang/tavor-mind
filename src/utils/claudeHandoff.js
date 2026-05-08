import { getModeById } from '../data/modes.js';
import { dominantSchemas } from '../data/schemas.js';
import { distortions, BODY_SENSATIONS } from '../data/distortions.js';

const CLAUDE_PROJECT_URL = 'https://claude.ai/new'; // PLACEHOLDER

const ACTIVATION_LABELS = {
  hyper: 'הופעלתי',
  hypo:  'מרוקן',
  mid:   'עוד טריגר אחד',
};

const SCHEMA_NAME_BY_ID = Object.fromEntries(dominantSchemas.map((s) => [s.id, s.name]));
const DISTORTION_LABEL_BY_ID = Object.fromEntries(distortions.map((d) => [d.id, d.label]));
const SENSATION_LABEL_BY_ID = Object.fromEntries(BODY_SENSATIONS.map((s) => [s.id, s.label]));

const OTHER_SCHEMA = '__other__';

function formatHebrewDateTime(value) {
  if (value == null) return 'ללא';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'ללא';
  return d.toLocaleString('he-IL', {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDuration(seconds) {
  if (!seconds || seconds < 0) return 'ללא';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs} שניות`;
  if (secs === 0) return `${mins} דקות`;
  return `${mins} דקות ו-${secs} שניות`;
}

function modeLabel(modeId) {
  const mode = getModeById(modeId);
  return mode ? mode.label : modeId;
}

function resolveOccurredAt(session) {
  if (session.clientTs) return session.clientTs;
  if (typeof session.endedAt === 'number') return session.endedAt;
  if (session.startedAtClient && session.durationSeconds) {
    return session.startedAtClient + session.durationSeconds * 1000;
  }
  if (session.startedAtClient) return session.startedAtClient;
  return Date.now();
}

function joinList(arr, fallback = 'ללא') {
  if (!Array.isArray(arr) || arr.length === 0) return fallback;
  return arr.join(', ');
}

function formatSchemas(ids, otherText) {
  if (!Array.isArray(ids) || ids.length === 0) return 'ללא';
  const labels = ids.map((id) => {
    if (id === OTHER_SCHEMA) {
      return otherText && otherText.trim() ? `אחרת: ${otherText.trim()}` : 'אחרת';
    }
    return SCHEMA_NAME_BY_ID[id] || id;
  });
  return labels.join(', ');
}

function formatThoughts(thoughts) {
  if (!Array.isArray(thoughts)) return 'ללא';
  const trimmed = thoughts.map((t) => (t || '').trim()).filter(Boolean);
  if (trimmed.length === 0) return 'ללא';
  return trimmed.map((t, i) => `${i + 1}. ${t}`).join('\n');
}

export function buildEmergencyPrompt(session) {
  const ids = session.modesIdentified || session.selectedModes || [];
  const modes = (Array.isArray(ids) && ids.length > 0)
    ? ids.map(modeLabel).join(', ')
    : 'ללא';

  const occurredAt = resolveOccurredAt(session);
  const closingNote = (session.note ?? session.closingNote ?? '').toString().trim() || 'ללא';
  const breathing = (session.breathingNote ?? '').toString().trim() || 'ללא';
  const score = (session.closingScore ?? null);
  const activation = ACTIVATION_LABELS[session.activation] || session.activation || 'ללא';

  const triggerEvent = (session.triggerEvent ?? '').toString().trim() || 'ללא';
  const sensationsLabels = (session.bodySensations || []).map((id) => SENSATION_LABEL_BY_ID[id] || id);
  const distortionLabels = (session.distortions || []).map((id) => DISTORTION_LABEL_BY_ID[id] || id);
  const schemasLine = formatSchemas(session.schemasActivated, session.otherSchemaText);
  const thoughtsBlock = formatThoughts(session.thoughts);
  const healthyResponse = (session.healthyResponse ?? '').toString().trim() || 'ללא';

  const analyzed = !!session.stage2Completed;

  const baseBlock = `[emergency_session]

סיימתי כעת סשן Emergency באפליקציה. אני רוצה לעבד מה שלא נסגר.

נתוני הסשן:
- תאריך וזמן: ${formatHebrewDateTime(occurredAt)}
- משך: ${formatDuration(session.durationSeconds)}
- רמת הפעלה: ${activation}
- הערת נשימה: ${breathing}
- ציון סגירה: ${score == null ? 'ללא' : `${score}/10`}
- הערה אישית: ${closingNote}`;

  if (!analyzed) return baseBlock;

  return `${baseBlock}

ניתוח הטריגר:
- האירוע: ${triggerEvent}
- תחושות גוף: ${joinList(sensationsLabels)}
- מחשבות שעלו:
${thoughtsBlock}
- עיוותי חשיבה: ${joinList(distortionLabels)}
- סכמות שפעלו: ${schemasLine}
- מודים שזיהיתי: ${modes}
- מה שהמבוגר הבריא אמר: ${healthyResponse}`;
}

// New, richer prompt produced when the user completed the full trigger-analysis flow.
// Reads the trigger_analyses payload directly (richer than emergency_session schema).
// Empty fields are rendered as "ללא" / "לא תואר" so the structure is stable for parsing.
export function buildTriggerAnalysisPrompt(session) {
  const occurredAt = resolveOccurredAt(session);
  const closingNote = (session.closingNote ?? session.note ?? '').toString().trim() || 'ללא';
  const score = (session.closingScore ?? null);
  const initialActivation = (typeof session.initialActivation === 'number')
    ? `${session.initialActivation}/10`
    : 'ללא';

  const event = (session.event ?? '').toString().trim() || 'לא תואר';
  const sensationsLabels = (session.bodySignals || []).map((id) => SENSATION_LABEL_BY_ID[id] || id);
  const distortionLabels = (session.distortions || []).map((id) => DISTORTION_LABEL_BY_ID[id] || id);
  const thoughtsBlock = formatThoughts(session.thoughts);
  const readBackFeeling = (session.readBackFeeling ?? '').toString().trim() || 'ללא';
  const childNeeds = (session.childNeeds ?? '').toString().trim() || 'ללא';
  const healthyAdultMessage = (session.healthyAdultMessage ?? '').toString().trim() || 'ללא';

  const schemasLine = formatSchemas(session.schemas, session.otherSchemaText);
  const dominantId = session.dominantSchema || null;
  const dominantLine = dominantId
    ? (dominantId === OTHER_SCHEMA
        ? (session.otherSchemaText && session.otherSchemaText.trim()
            ? `[סכמה דומיננטית: אחרת — ${session.otherSchemaText.trim()}]`
            : `[סכמה דומיננטית: אחרת]`)
        : `[סכמה דומיננטית: ${SCHEMA_NAME_BY_ID[dominantId] || dominantId}]`)
    : null;

  const modeIds = session.identifiedModes || [];
  const modesLine = (Array.isArray(modeIds) && modeIds.length > 0)
    ? modeIds.map(modeLabel).join(', ')
    : 'ללא';

  const lines = [
    '[trigger_analysis]',
    '',
    'סיימתי כעת ניתוח טריגר באפליקציה. אני רוצה לעבד מה שלא נסגר.',
    '',
    'נתוני הסשן:',
    `- תאריך וזמן: ${formatHebrewDateTime(occurredAt)}`,
    `- משך: ${formatDuration(session.durationSeconds)}`,
    `- מד הפעלה ראשוני: ${initialActivation}`,
    `- ציון סגירה: ${score == null ? 'ללא' : `${score}/10`}`,
    '',
    'האירוע:',
    event,
    '',
    `תחושות גוף: ${joinList(sensationsLabels)}`,
    '',
    'מחשבות שעלו:',
    thoughtsBlock,
    '',
    `איך זה הרגיש לקרוא: ${readBackFeeling}`,
    '',
    `עיוותי חשיבה: ${joinList(distortionLabels)}`,
    '',
    `סכמות שפעלו: ${schemasLine}`,
  ];
  if (dominantLine) lines.push(dominantLine);
  lines.push(
    '',
    `מה הילד צריך עכשיו: ${childNeeds}`,
    '',
    `מה אני צריך לשמוע מהמבוגר הבריא: ${healthyAdultMessage}`,
    '',
    `מודים שזיהיתי: ${modesLine}`,
    '',
    `הערה אישית: ${closingNote}`,
  );

  return lines.join('\n');
}

export function getClaudeProjectUrl() {
  return CLAUDE_PROJECT_URL;
}
