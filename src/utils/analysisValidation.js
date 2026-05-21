import {
  ANALYSIS_TYPES,
  REQUIRED_FIELDS,
  PATTERN_IDS,
  SCHEMA_LABELS,
} from '../data/analysisSchemas.js';

const PATTERN_BOOL_KEYS = ['not_enough_appeared', 'dichotomous_phrasing', 'body_as_compass', 'core_child_addressed'];
const THERAPY_BRANCHES = ['ifs_specific', 'schema_focused_specific', 'chair_dialogue_specific'];

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function trimStrings(obj) {
  if (typeof obj === 'string') return obj.trim();
  if (Array.isArray(obj)) return obj.map(trimStrings);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = trimStrings(v);
    }
    return out;
  }
  return obj;
}

export function parseJSON(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (err) {
    return { ok: false, error: err?.message || String(err) };
  }
}

export function validateAnalysis(input) {
  const errors = [];
  let json = input;
  if (typeof input === 'string') {
    const parsed = parseJSON(input);
    if (!parsed.ok) {
      return { ok: false, errors: [`JSON לא תקין: ${parsed.error}`] };
    }
    json = parsed.value;
  }

  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return { ok: false, errors: ['JSON לא תקין: התוכן חייב להיות אובייקט'] };
  }

  // type + version
  if (!json.type) {
    errors.push('שדה חובה חסר: type');
  } else if (!ANALYSIS_TYPES[json.type]) {
    errors.push(`סוג הניתוח לא מזוהה: ${json.type}`);
  }
  if (json.version !== 1) {
    errors.push(`גרסה לא נתמכת: ${json.version} (נדרש 1)`);
  }

  if (!ANALYSIS_TYPES[json.type]) {
    return { ok: false, errors };
  }

  const required = REQUIRED_FIELDS[json.type];

  // envelope fields
  for (const field of required.envelope) {
    if (!(field in json)) {
      errors.push(`שדה חובה חסר: ${field}`);
    }
  }

  // payload fields
  if (!json.payload || typeof json.payload !== 'object' || Array.isArray(json.payload)) {
    errors.push('שדה חובה חסר: payload');
  } else {
    for (const field of required.payload) {
      if (!(field in json.payload)) {
        errors.push(`שדה חובה חסר ב-payload: ${field}`);
      }
    }
  }

  // tags
  if (!Array.isArray(json.tags)) {
    errors.push('tags לא תקין - חייב להיות מערך מחרוזות');
  } else {
    if (json.tags.length < 1 || json.tags.length > 15) {
      errors.push('tags לא תקין - נדרש בין 1 ל-15 פריטים');
    }
    if (!json.tags.every((t) => typeof t === 'string')) {
      errors.push('tags לא תקין - כל פריט חייב להיות מחרוזת');
    }
  }

  // patterns
  if (!json.patterns || typeof json.patterns !== 'object' || Array.isArray(json.patterns)) {
    errors.push('patterns לא תקין - חייב להיות אובייקט');
  } else {
    for (const key of PATTERN_IDS) {
      if (!(key in json.patterns)) {
        errors.push(`חסר pattern: ${key}`);
        continue;
      }
      const v = json.patterns[key];
      if (v !== true && v !== false && v !== null) {
        errors.push(`pattern ${key} חייב להיות true / false / null`);
      }
    }
    if (!('dominant_mode' in json.patterns)) {
      errors.push('חסר pattern: dominant_mode');
    } else {
      const dm = json.patterns.dominant_mode;
      if (dm !== null && dm !== undefined) {
        // Accept current canonical ids OR legacy ids that resolve to canonical.
        // Truly unknown ids pass validation and render with a (לא ידוע) marker.
        if (typeof dm !== 'string') {
          errors.push(`dominant_mode לא תקין: ${dm}`);
        }
      }
    }
  }

  // schemas_activated
  if (!Array.isArray(json.schemas_activated)) {
    errors.push('schemas_activated לא תקין - חייב להיות מערך');
  } else {
    for (const s of json.schemas_activated) {
      if (typeof s !== 'string' || !SCHEMA_LABELS[s]) {
        errors.push(`schema לא מוכר: ${s}`);
      }
    }
  }

  // dates
  if (json.createdAt && Number.isNaN(new Date(json.createdAt).getTime())) {
    errors.push('createdAt - תאריך לא תקין');
  }
  if (json.occurredAt && Number.isNaN(new Date(json.occurredAt).getTime())) {
    errors.push('occurredAt - תאריך לא תקין');
  }

  // therapy_session — exactly one *_specific non-null
  if (json.type === 'therapy_session' && json.payload && typeof json.payload === 'object') {
    const nonNull = THERAPY_BRANCHES.filter((k) => {
      const v = json.payload[k];
      return v !== null && v !== undefined;
    });
    if (nonNull.length !== 1) {
      errors.push('דיאלוג תרפיה - מותר רק שדה specific אחד פעיל');
    }
  }

  if (errors.length) return { ok: false, errors };

  // Normalize
  const normalized = trimStrings(deepClone(json));
  if (Array.isArray(normalized.tags)) {
    normalized.tags = Array.from(new Set(normalized.tags));
  }
  // Stable id based on save time + 4-char salt
  const salt = Math.random().toString(36).slice(2, 6);
  normalized._id = `${Date.now()}-${salt}`;

  return { ok: true, normalized };
}

export function applyDateOverride(normalized, dateString, timeString) {
  if (!dateString) return normalized;
  const [y, m, d] = dateString.split('-').map(Number);
  let hh = 12;
  let mm = 0;
  if (timeString && /^\d{2}:\d{2}$/.test(timeString)) {
    [hh, mm] = timeString.split(':').map(Number);
  }
  const dt = new Date(y, m - 1, d, hh, mm, 0);
  if (Number.isNaN(dt.getTime())) return normalized;
  return { ...normalized, occurredAt: dt.toISOString() };
}
