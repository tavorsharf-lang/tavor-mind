export const ANALYSIS_TYPES = {
  emotion_recognition: {
    id: 'emotion_recognition',
    label: 'זיהוי רגשות',
    icon: '◐',
    color: '#7A8FA8',
    description: 'זיהוי רגש בזמן אמת, תרגול יומי, או ניתוח מקרה',
  },
  gratitude: {
    id: 'gratitude',
    label: 'הוקרת תודה',
    icon: '○',
    color: '#A8967A',
    description: 'תרגול תודה — גרסה 2.0 עם פרוטוקולים',
  },
  i_language: {
    id: 'i_language',
    label: 'שפת אני',
    icon: '◇',
    color: '#9B8AA8',
    description: 'תרגול ניסוח בשפת אני / NVC',
  },
  therapy_session: {
    id: 'therapy_session',
    label: 'סשן תרפיה',
    icon: '◈',
    color: '#7A9B8A',
    description: 'IFS, עבודה על סכמה ספציפית, או דיאלוג כיסאות',
  },
  meta_analysis: {
    id: 'meta_analysis',
    label: 'מטא-ניתוח',
    icon: '◉',
    color: '#A87A8A',
    description: 'סינתזה של מספר ניתוחים על פני זמן',
  },
};

export const ANALYSIS_TYPE_IDS = Object.keys(ANALYSIS_TYPES);

export const REQUIRED_FIELDS = {
  emotion_recognition: {
    envelope: ['type', 'version', 'title', 'createdAt', 'occurredAt', 'summary', 'tags', 'patterns', 'schemas_activated'],
    payload: ['mode', 'trigger_event', 'body_signals', 'emotions', 'thoughts_identified', 'parts_active', 'insight', 'what_was_needed'],
  },
  gratitude: {
    envelope: ['type', 'version', 'title', 'createdAt', 'occurredAt', 'summary', 'tags', 'patterns', 'schemas_activated'],
    payload: ['mode', 'calibration', 'protocol', 'items', 'insight'],
  },
  i_language: {
    envelope: ['type', 'version', 'title', 'createdAt', 'occurredAt', 'summary', 'tags', 'patterns', 'schemas_activated'],
    payload: ['context', 'original_phrasing', 'components', 'final_phrasing'],
  },
  therapy_session: {
    envelope: ['type', 'version', 'title', 'createdAt', 'occurredAt', 'summary', 'tags', 'patterns', 'schemas_activated'],
    payload: ['modality', 'topic', 'insight'],
  },
  meta_analysis: {
    envelope: ['type', 'version', 'title', 'createdAt', 'occurredAt', 'period_covered', 'summary', 'tags', 'patterns', 'schemas_activated'],
    payload: ['domain', 'central_sentence', 'open_question'],
  },
};

export const PATTERN_LABELS = {
  not_enough_appeared: 'הופיע "לא מספיק"',
  dichotomous_phrasing: 'מבנה דיכוטומי',
  body_as_compass: 'הגוף הוביל',
  core_child_addressed: 'פנייה לילד הגלותי',
};

export const PATTERN_IDS = Object.keys(PATTERN_LABELS);

export const MODE_LABELS = {
  exiled_child: 'הילד הגלותי',
  performer_manager: 'המנהל הביצועיסט',
  sacrificer_manager: 'המקריב',
  guard_manager: 'המגן החשדן',
  approval_seeker: 'מחפש האישור',
  healthy_adult: 'המבוגר הבריא',
};

export const SCHEMA_LABELS = {
  unrelenting_standards: 'סטנדרטים בלתי מתפשרים',
  self_sacrifice: 'הקרבה עצמית',
  mistrust_abuse: 'חוסר אמון',
  approval_seeking: 'חיפוש אישור',
  emotional_deprivation: 'מחסור רגשי',
};

export const SCHEMA_IDS = Object.keys(SCHEMA_LABELS);

export const patternLabel = (id) => PATTERN_LABELS[id] ?? id;
export const modeLabel = (id) => MODE_LABELS[id] ?? id;
export const schemaLabel = (id) => SCHEMA_LABELS[id] ?? id;
export const typeMeta = (id) => ANALYSIS_TYPES[id] ?? null;
