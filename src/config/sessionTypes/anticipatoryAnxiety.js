// Session 1: חרדה ציפייתית — anticipatory anxiety before a known event.
// Pure configuration. The wizard shell renders the questions and the result
// screen runs buildPrompt(variables) below.

const NULL_TOKEN = '[לא צוין]';

// ── Question option dictionaries ───────────────────────────────────
// Each option has a stable English-mnemonic id so the value lives unchanged
// even if labels evolve. Custom (user-added) options get ids prefixed with
// `custom_` at runtime — that's the only namespace collision rule.

const EVENT_TYPE_OPTIONS = [
  { id: 'interview',          label: 'ראיון עבודה' },
  { id: 'exam',               label: 'מבחן' },
  { id: 'work_meeting',       label: 'פגישה מקצועית' },
  { id: 'hard_personal_meet', label: 'פגישה אישית קשה' },
  { id: 'date',               label: 'דייט' },
  { id: 'public_speaking',    label: 'הרצאה / דיבור מול קהל' },
  { id: 'family_event',       label: 'אירוע משפחתי' },
  { id: 'social_event',       label: 'אירוע חברתי גדול' },
  { id: 'phone_avoided',      label: 'שיחת טלפון שאני דוחה' },
  { id: 'authority_talk',     label: 'שיחה עם בעל סמכות' },
  { id: 'flight',             label: 'טיסה' },
  { id: 'sport_perf',         label: 'ביצוע ספורט' },
  { id: 'legal',              label: 'דיון משפטי' },
];

const TIME_DISTANCE_OPTIONS = [
  { id: 'within_hour',   label: 'בשעה הקרובה' },
  { id: 'today',         label: 'בשעות הקרובות (היום, פחות מ-12)' },
  { id: 'tomorrow',      label: 'מחר' },
  { id: 'two_three',     label: 'בעוד יומיים-שלושה' },
  { id: 'this_week',     label: 'בשבוע הקרוב' },
  { id: 'two_weeks_month', label: 'בשבועיים-חודש' },
  { id: 'over_month',    label: 'מעל חודש קדימה' },
];

const CATASTROPHIC_OPTIONS = [
  { id: 'freeze_on_question', label: 'ישאלו אותי משהו שאני לא יודע ואקפא' },
  { id: 'say_something_stupid', label: 'אגיד משהו טיפשי או לא מתאים' },
  { id: 'not_good_enough',    label: 'ייראה שאני לא ברמה' },
  { id: 'rejected',           label: 'ידחו אותי / יסרבו לי' },
  { id: 'fall_apart',         label: 'אתפרק רגשית מול אנשים' },
  { id: 'visible_anxiety',    label: 'יראו עליי שאני חרד (קול רועד, אדמומיות)' },
  { id: 'late_or_no_show',    label: 'אאחר או לא אצליח להגיע' },
  { id: 'cancellation',       label: 'יבטלו ברגע האחרון' },
  { id: 'exposed_ignorant',   label: 'יחשפו שאני לא באמת יודע' },
  { id: 'visible_failure',    label: 'אכשל באופן נראה לעין' },
  { id: 'compared_weak',      label: 'ישוו אותי לאחרים ואצא חלש' },
  { id: 'judged',             label: 'ישפטו אותי' },
];

const PAST_PATTERN_OPTIONS = [
  { id: 'outcome_good_vs_feel_bad',    label: 'התוצאה הייתה טובה, התחושה המקדימה הייתה הרבה יותר גרועה' },
  { id: 'outcome_ok_vs_feel_bad',      label: 'התוצאה הייתה סבירה, התחושה הייתה הרבה יותר גרועה' },
  { id: 'outcome_bad_feel_right',      label: 'התוצאה הייתה גרועה, התחושה צדקה' },
  { id: 'mixed',                       label: 'היו פעמים מעורבות' },
  { id: 'no_experience',               label: 'אין לי ניסיון עם זה' },
  { id: 'dont_remember',               label: 'אני לא זוכר איך זה היה בפועל' },
  { id: 'opted_out_in_the_end',        label: 'העדפתי לא להגיע בסוף' },
];

const JUDGES_OPTIONS = [
  { id: 'boss',                  label: 'בוס / מנהל' },
  { id: 'senior_lawyer',         label: 'שופט / עורך דין בכיר' },
  { id: 'lecturer',              label: 'מרצה' },
  { id: 'father',                label: 'אבא' },
  { id: 'mother',                label: 'אמא' },
  { id: 'potential_partner',     label: 'בת זוג פוטנציאלי' },
  { id: 'current_partner',       label: 'בת זוג נוכחי' },
  { id: 'important_friends',     label: 'חברים שהדעה שלהם חשובה לי' },
  { id: 'strangers_unknown',     label: 'זרים שלא אכיר' },
  { id: 'siblings',              label: 'אחים ואחיות' },
  { id: 'colleagues',            label: 'קולגות' },
  {
    id: 'specific_person_present',
    label: 'אדם ספציפי שאני יודע שיהיה שם',
    sub_input: { id: 'specific_person', label: 'מי?', placeholder: 'שם או תיאור' },
  },
  { id: 'inner_demanding_parent', label: 'ההורה התובעני הפנימי שלי (לא אדם חיצוני)' },
  { id: 'undefined_crowd',       label: 'קהל לא מובחן' },
];

const BODY_LOCATION_OPTIONS = [
  { id: 'neck',           label: 'צוואר' },
  { id: 'shoulders',      label: 'כתפיים' },
  { id: 'chest',          label: 'חזה' },
  { id: 'throat',         label: 'גרון' },
  { id: 'upper_belly',    label: 'בטן עליונה' },
  { id: 'lower_belly',    label: 'בטן תחתונה' },
  { id: 'head',           label: 'ראש' },
  { id: 'upper_back',     label: 'גב עליון' },
  { id: 'lower_back',     label: 'גב תחתון' },
  { id: 'hands',          label: 'ידיים' },
  { id: 'legs',           label: 'רגליים' },
  { id: 'face',           label: 'פנים (לסת, מצח)' },
  { id: 'whole_body',     label: 'כל הגוף' },
  { id: 'outside_body',   label: 'מחוץ לגוף ("מרחף", "לא בתוכי")' },
];

const BODY_QUALITY_OPTIONS = [
  { id: 'pressure',       label: 'לחץ' },
  { id: 'tightness',      label: 'כיווץ' },
  { id: 'speed',          label: 'מהירות (לב, נשימה)' },
  { id: 'breathlessness', label: 'חוסר אוויר' },
  { id: 'waves',          label: 'גלים' },
  { id: 'sting',          label: 'דקירה' },
  { id: 'heaviness',      label: 'כובד' },
  { id: 'emptiness',      label: 'ריקנות' },
  { id: 'trembling',      label: 'רעד' },
  { id: 'heat',           label: 'חום' },
  { id: 'cold',           label: 'קור' },
  { id: 'tingling',       label: 'נמלול / עקצוץ' },
  { id: 'vibration',      label: 'רטט' },
  { id: 'burning',        label: 'צריבה' },
  { id: 'numbness',       label: 'חוסר תחושה / קהות' },
];

const THREAT_TYPE_OPTIONS = [
  { id: 'judgement', label: 'שיפוט — יכריעו אם אני "מספיק טוב"' },
  { id: 'exposure',  label: 'חשיפה — יראו אותי כפי שאני באמת' },
  { id: 'perform',   label: 'ביצוע — צריך להוציא תוצר ספציפי תחת לחץ' },
];

// ── Lookup helpers for buildPrompt ─────────────────────────────────

function makeLabelLookup(staticOpts) {
  const map = new Map(staticOpts.map((o) => [o.id, o.label]));
  return (id, customLabels) => {
    if (!id) return id;
    if (map.has(id)) return map.get(id);
    if (customLabels && customLabels[id]) return customLabels[id];
    return id;
  };
}

function asArray(value) {
  if (value == null) return null;
  if (Array.isArray(value)) return value;
  return [value];
}

function formatSelectWithCustomList(value, staticOpts) {
  if (value === null) return NULL_TOKEN;
  if (!value || typeof value !== 'object') return NULL_TOKEN;
  const lookup = makeLabelLookup(staticOpts);
  const arr = asArray(value.selected) || [];
  if (arr.length === 0) return NULL_TOKEN;
  return arr.map((id) => lookup(id, value.custom_labels)).join(', ');
}

function formatBulletList(value, staticOpts) {
  if (value === null) return NULL_TOKEN;
  if (!value || typeof value !== 'object') return NULL_TOKEN;
  const ids = asArray(value.selected) || [];
  if (ids.length === 0) return NULL_TOKEN;
  const lookup = makeLabelLookup(staticOpts);
  return ids.map((id) => `- ${lookup(id, value.custom_labels)}`).join('\n');
}

function formatSelectWithCustomSingle(value, staticOpts) {
  if (value === null) return NULL_TOKEN;
  if (!value || typeof value !== 'object') return NULL_TOKEN;
  const id = Array.isArray(value.selected) ? value.selected[0] : value.selected;
  if (!id) return NULL_TOKEN;
  return makeLabelLookup(staticOpts)(id, value.custom_labels);
}

function formatSingleSelect(value, staticOpts) {
  if (value === null) return NULL_TOKEN;
  if (!value) return NULL_TOKEN;
  const opt = staticOpts.find((o) => o.id === value);
  return opt ? opt.label : value;
}

function formatScale(value) {
  if (value === null || typeof value !== 'number') return NULL_TOKEN;
  return `${value}/10`;
}

function getSubInput(value, subInputId) {
  if (!value || typeof value !== 'object') return null;
  const text = value.sub_inputs?.[subInputId];
  return typeof text === 'string' && text.trim() ? text.trim() : null;
}

function isOptionSelected(value, optionId) {
  if (!value || typeof value !== 'object') return false;
  const arr = Array.isArray(value.selected) ? value.selected : (value.selected ? [value.selected] : []);
  return arr.includes(optionId);
}

// Return labels of user-added (custom_*) options that are currently selected.
// Used to surface the "בקול שלי" line — text the user wrote in their own words.
function getCustomLabels(value) {
  if (!value || typeof value !== 'object') return [];
  const selected = asArray(value.selected) || [];
  const labels = value.custom_labels || {};
  const out = [];
  for (const id of selected) {
    if (typeof id === 'string' && id.startsWith('custom_') && labels[id]) {
      out.push(labels[id]);
    }
  }
  return out;
}

// ── Session definition ─────────────────────────────────────────────

export const anticipatoryAnxiety = {
  id: 'anticipatory_anxiety',
  label: 'חרדה ציפייתית לפני אירוע',
  description: 'משהו צפוי שמעיק עליי כבר עכשיו',
  icon: '⌛',

  questions: [
    {
      id: 'event_type',
      type: 'select_with_custom',
      multi: false,
      label: 'איזה אירוע צפוי?',
      options: EVENT_TYPE_OPTIONS,
    },
    {
      id: 'time_distance',
      type: 'single_select',
      label: 'מתי האירוע?',
      options: TIME_DISTANCE_OPTIONS,
    },
    {
      id: 'preparedness',
      type: 'scale',
      label: 'כמה אתה מרגיש מוכן?',
      config: {
        min: 0,
        max: 10,
        step: 1,
        leftLabel: 'לא מוכן בכלל',
        midLabel: 'מוכן חלקית',
        rightLabel: 'מוכן לגמרי',
      },
    },
    {
      id: 'catastrophic_scenario',
      type: 'select_with_custom',
      multi: true,
      label: 'מה הסיוט הספציפי?',
      hint: 'אם בחרת קטגוריה — נסה לכתוב במילים שלך מה בדיוק התרחיש',
      options: CATASTROPHIC_OPTIONS,
    },
    {
      id: 'past_pattern',
      type: 'select_with_custom',
      multi: true,
      label: 'מה קרה בעבר באירועים דומים?',
      options: PAST_PATTERN_OPTIONS,
    },
    {
      id: 'judges',
      type: 'select_with_custom',
      multi: true,
      label: 'מי יהיה שם / מי השופט הפנימי המוקרן?',
      options: JUDGES_OPTIONS,
    },
    {
      id: 'body_location',
      type: 'select_with_custom',
      multi: true,
      label: 'איפה אתה מרגיש את זה בגוף?',
      options: BODY_LOCATION_OPTIONS,
    },
    {
      id: 'body_quality',
      type: 'select_with_custom',
      multi: true,
      label: 'איזה איכות לתחושה?',
      options: BODY_QUALITY_OPTIONS,
    },
    {
      id: 'threat_type',
      type: 'select_with_custom',
      multi: true,
      label: 'מה סוג האיום הבסיסי?',
      options: THREAT_TYPE_OPTIONS,
    },
  ],

  buildPrompt: (v, meta) => {
    const eventType    = formatSelectWithCustomSingle(v.event_type, EVENT_TYPE_OPTIONS);
    const timeDistance = formatSingleSelect(v.time_distance, TIME_DISTANCE_OPTIONS);
    const preparedness = formatScale(v.preparedness);
    const scenariosBullets = formatBulletList(v.catastrophic_scenario, CATASTROPHIC_OPTIONS);
    const scenariosCustom  = getCustomLabels(v.catastrophic_scenario);
    const pastPattern  = formatBulletList(v.past_pattern, PAST_PATTERN_OPTIONS);
    const judges       = formatBulletList(v.judges, JUDGES_OPTIONS);
    const specificPerson = isOptionSelected(v.judges, 'specific_person_present')
      ? getSubInput(v.judges, 'specific_person')
      : null;
    const bodyLocation = formatSelectWithCustomList(v.body_location, BODY_LOCATION_OPTIONS);
    const bodyQuality  = formatSelectWithCustomList(v.body_quality, BODY_QUALITY_OPTIONS);
    const threatType   = formatSelectWithCustomList(v.threat_type, THREAT_TYPE_OPTIONS);
    const dateIso      = meta?.createdAt || new Date().toISOString();

    const lines = [
      'סשן: חרדה ציפייתית לפני אירוע',
      `תאריך: ${dateIso}`,
      '',
      '— מה האירוע —',
      `סוג: ${eventType}`,
      `מתי: ${timeDistance}`,
      '',
      '— מצב נוכחי —',
      `רמת מוכנות סובייקטיבית: ${preparedness}`,
      `תחושה גופנית — מיקום: ${bodyLocation}`,
      `תחושה גופנית — איכות: ${bodyQuality}`,
      '',
      '— התוכן הקוגניטיבי —',
      'התרחיש הקטסטרופי:',
      scenariosBullets,
    ];

    if (scenariosCustom.length > 0) {
      lines.push('');
      lines.push(`בקול שלי: ${scenariosCustom.join(', ')}`);
    }

    lines.push('');
    lines.push(`סוג איום בסיסי: ${threatType}`);
    lines.push('');
    lines.push('— הקשר היסטורי ושיפוטי —');
    lines.push('דפוס בעבר:');
    lines.push(pastPattern);
    lines.push('מי השופט:');
    lines.push(judges);

    if (specificPerson) {
      lines.push(`אדם ספציפי שצוין: ${specificPerson}`);
    }

    lines.push('');
    lines.push('— הוראה לקלוד —');
    lines.push('זהו סשן חרדה ציפייתית. עבוד איתי לפי המבנה שמוגדר בסיסטם של הפרויקט.');

    return lines.join('\n');
  },
};
