import { getModeById } from '../data/modes.js';
import { dominantSchemas } from '../data/schemas.js';
import { distortions, BODY_SENSATIONS } from '../data/distortions.js';

const CLAUDE_PROJECT_URL = 'https://claude.ai/project/019e0f55-801c-7678-a509-a30da71d5386';

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

  const minsLabel = mins === 1 ? 'דקה אחת' : `${mins} דקות`;
  const secsLabel = secs === 1 ? 'שנייה אחת' : `${secs} שניות`;

  if (mins === 0) return secsLabel;
  if (secs === 0) return minsLabel;
  return `${minsLabel} ו-${secsLabel}`;
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

export function buildTriggerAnalysisPrompt(session) {
  const occurredAt = resolveOccurredAt(session);
  const event = (session.event ?? '').toString().trim();
  const sensationsLabels = (session.bodySignals || [])
    .map((id) => SENSATION_LABEL_BY_ID[id] || id);
  const thoughts = (session.thoughts || [])
    .map(t => (t ?? '').toString().trim())
    .filter(Boolean);
  const readBackFeeling = (session.readBackFeeling ?? '').toString().trim();
  const distortionLabels = (session.distortions || [])
    .map((id) => DISTORTION_LABEL_BY_ID[id] || id);

  const allSchemaIds = (session.schemas || []);
  const dominantId = session.dominantSchema || null;
  const dominantSchemaName = dominantId
    ? (dominantId === OTHER_SCHEMA
        ? (session.otherSchemaText && session.otherSchemaText.trim()
            ? `אחרת — ${session.otherSchemaText.trim()}`
            : 'אחרת')
        : (SCHEMA_NAME_BY_ID[dominantId] || dominantId))
    : null;
  const otherSchemaIds = allSchemaIds.filter(id => id !== dominantId);
  const otherSchemaLabels = otherSchemaIds.map(id => {
    if (id === OTHER_SCHEMA) {
      return session.otherSchemaText && session.otherSchemaText.trim()
        ? `אחרת — ${session.otherSchemaText.trim()}`
        : 'אחרת';
    }
    return SCHEMA_NAME_BY_ID[id] || id;
  });

  const childNeeds = (session.childNeeds ?? '').toString().trim();
  const healthyAdultMessage = (session.healthyAdultMessage ?? '').toString().trim();

  const modeIds = session.identifiedModes || [];
  const primaryModeId = modeIds[0] || null;
  const primaryModeLabel = primaryModeId ? modeLabel(primaryModeId) : null;
  const otherModeLabels = modeIds.slice(1).map(modeLabel);
  const customModeDescription = (session.phase9CustomDescription ?? '').toString().trim();

  const initialActivation = (typeof session.initialActivation === 'number')
    ? `${session.initialActivation}/10`
    : null;
  const closingScore = (session.closingScore != null)
    ? `${session.closingScore}/10`
    : null;
  const closingNote = (session.closingNote ?? session.note ?? '').toString().trim();

  const lines = [
    '[trigger_analysis]',
    '',
    'סיימתי כעת ניתוח טריגר באפליקציה. אני רוצה לעבד מה שלא נסגר.',
  ];

  const heaviness = session.heavinessCheck;
  const heavinessLine = heaviness === 'heavier'
    ? 'באמצע הסשן בדקתי איך זה: היה יותר כבד.'
    : heaviness === 'heavier_continue'
      ? 'באמצע הסשן בדקתי איך זה: היה יותר כבד, ובחרתי להמשיך.'
      : null;

  const whatHappenedHasContent = event || sensationsLabels.length > 0
    || thoughts.length > 0 || readBackFeeling || heavinessLine;

  if (whatHappenedHasContent) {
    lines.push('', '', '—— מה קרה ——', '');
    if (event) {
      lines.push(`האירוע: ${event}`, '');
    }
    if (sensationsLabels.length > 0) {
      lines.push(`בגוף הופיע: ${sensationsLabels.join(', ')}`, '');
    }
    if (thoughts.length > 0) {
      lines.push('המחשבות שעלו:');
      thoughts.forEach((t, i) => lines.push(`  ${i + 1}. ${t}`));
      lines.push('');
    }
    if (readBackFeeling) {
      lines.push(`קראתי לעצמי את המחשבות האלה, וזה הרגיש: ${readBackFeeling}`);
    }
    if (heavinessLine) {
      if (lines[lines.length - 1] !== '') lines.push('');
      lines.push(heavinessLine);
    }
    while (lines[lines.length - 1] === '') lines.pop();
  }

  const whatItMeansHasContent = dominantSchemaName || primaryModeLabel;

  if (whatItMeansHasContent) {
    lines.push('', '', '—— מה זה אומר ——', '');
    if (dominantSchemaName) {
      lines.push(`הסכמה הדומיננטית שפעלה כאן: ${dominantSchemaName}.`, '');
    }
    if (primaryModeLabel) {
      lines.push(`המוד שדיבר עכשיו: ${primaryModeLabel}.`);
      if (customModeDescription) {
        lines.push(`תיארתי אותו במילים שלי: ${customModeDescription}`);
      }
    }
    while (lines[lines.length - 1] === '') lines.pop();
  }

  const childSectionHasContent = childNeeds || healthyAdultMessage;

  if (childSectionHasContent) {
    lines.push('', '', '—— מה הילד צריך ——', '');
    if (childNeeds) {
      lines.push(`הילד צריך עכשיו: ${childNeeds}`, '');
    }
    if (healthyAdultMessage) {
      lines.push(`מה אני צריך לשמוע מהמבוגר הבריא: ${healthyAdultMessage}`);
    }
    while (lines[lines.length - 1] === '') lines.pop();
  }

  const metaLines = [];
  metaLines.push(`- תאריך וזמן: ${formatHebrewDateTime(occurredAt)}`);
  metaLines.push(`- משך הסשן: ${formatDuration(session.durationSeconds)}`);

  const activationCategory = ACTIVATION_LABELS[session.activation] || null;
  const initialActivationLine = initialActivation
    ? (activationCategory ? `${initialActivation} (${activationCategory})` : initialActivation)
    : (activationCategory || null);

  if (initialActivationLine && closingScore) {
    metaLines.push(`- הפעלה ראשונית: ${initialActivationLine}  ·  סגירה: ${closingScore}`);
  } else if (initialActivationLine) {
    metaLines.push(`- הפעלה ראשונית: ${initialActivationLine}`);
  } else if (closingScore) {
    metaLines.push(`- סגירה: ${closingScore}`);
  }

  if (otherModeLabels.length > 0) {
    metaLines.push(`- מודים נוספים שזוהו: ${otherModeLabels.join(', ')}`);
  }
  if (otherSchemaLabels.length > 0) {
    metaLines.push(`- סכמות נוספות שפעלו: ${otherSchemaLabels.join(', ')}`);
  }
  if (distortionLabels.length > 0) {
    metaLines.push(`- עיוותי חשיבה שזיהיתי: ${distortionLabels.join(', ')}`);
  }
  if (closingNote) {
    metaLines.push(`- הערה אישית: ${closingNote}`);
  }
  if (session.schemaModeBridgeResponse === 'rejected_known') {
    metaLines.push('- דחיתי את הצעת המוד מהסכמה הדומיננטית');
  }

  lines.push('', '', '—— מטא-נתונים ——', '');
  lines.push(...metaLines);

  return lines.join('\n');
}

export function getClaudeProjectUrl() {
  return CLAUDE_PROJECT_URL;
}
