// Session 2: כעס על דמות הורית — parental anger.
// Pure configuration. The wizard renders the questions; the result screen
// runs buildPrompt(variables, meta) below.

import {
  formatSingleSelect,
  formatMultiSelect,
  formatMultiSelectNumbered,
  formatSelectWithCustomList,
  formatBulletList,
  formatScale,
  getSubInput,
  isOptionSelected,
  getCustomLabels,
} from './_promptHelpers.js';

// ── Question option dictionaries ───────────────────────────────────

const PARENT_OPTIONS = [
  { id: 'mother',  label: 'אמא' },
  { id: 'father',  label: 'אבא' },
  { id: 'both',    label: 'שניהם יחד' },
];

const TRIGGER_TYPE_OPTIONS = [
  { id: 'direct_criticism',     label: 'ביקורת ישירה' },
  { id: 'half_joke_dig',        label: 'הערה פוגעת ב"חצי-בדיחה"' },
  { id: 'ignored_request',      label: 'התעלמות מבקשה או מרגש' },
  { id: 'boundary_invasion',    label: 'פלישה לגבולות' },
  { id: 'comparison',           label: 'השוואה למישהו אחר' },
  { id: 'unwanted_advice',      label: '"עצות" לא נדרשות' },
  { id: 'blame',                label: 'הטלת אשמה' },
  { id: 'double_bind',          label: 'מסר כפול' },
  { id: 'condescension',        label: 'התנשאות' },
  { id: 'past_reminder',        label: 'תזכורת לעבר' },
  { id: 'meaningful_silence',   label: 'שתיקה משמעותית' },
  { id: 'emotional_dump_on_me', label: 'התלוננות או הצפה רגשית עליי' },
];

const WHEN_EVENT_OPTIONS = [
  { id: 'last_hour',     label: 'בשעה האחרונה' },
  { id: 'today',         label: 'היום' },
  { id: 'yesterday',     label: 'אתמול' },
  { id: 'this_week',     label: 'בשבוע האחרון' },
  { id: 'accumulated',   label: 'הצטברות ממספר אירועים' },
];

const WHEN_ANGER_OPTIONS = [
  { id: 'real_time',         label: 'בזמן אמת' },
  { id: 'within_hour',       label: 'תוך שעה אחרי' },
  { id: 'same_day',          label: 'באותו יום' },
  { id: 'day_after',         label: 'יום אחרי' },
  { id: 'few_days_later',    label: 'כמה ימים אחרי' },
  { id: 'at_night_alone',    label: 'בלילה כשהייתי לבד' },
  { id: 'unclear',           label: 'לא ברור' },
];

const BODY_SENSATION_OPTIONS = [
  { id: 'chest_pressure',  label: 'לחץ בחזה' },
  { id: 'throat_jaw',      label: 'מתח בגרון או בלסת' },
  { id: 'face_heat',       label: 'חום בפנים או בראש' },
  { id: 'shoulder_tension', label: 'מתח בכתפיים' },
  { id: 'subtle_tremor',   label: 'רעד עדין' },
  { id: 'freeze',          label: 'קיפאון — אין תנועה' },
  { id: 'nausea_belly',    label: 'בחילה או כובד בבטן' },
  { id: 'hands_energy',    label: 'אנרגיה בידיים — רצון לדחוף' },
  { id: 'no_clear_body',   label: 'אין תחושה גופנית ברורה' },
];

const RESPONSE_ACTION_OPTIONS = [
  { id: 'swallow_silent',    label: 'בלעתי ושתקתי' },
  { id: 'smile_agree',       label: 'חייכתי והסכמתי כלפי חוץ' },
  { id: 'short_disengage',   label: 'הגבתי קצרות וניתקתי' },
  { id: 'argued',            label: 'התווכחתי' },
  { id: 'exploded',          label: 'התפוצצתי בקול' },
  { id: 'left_space',        label: 'יצאתי מהמרחב' },
  { id: 'hung_up',           label: 'ניתקתי שיחה' },
  { id: 'distraction',       label: 'עשיתי משהו אחר כדי להסיח' },
];

const UNDERNEATH_OPTIONS = [
  { id: 'hurt',                  label: 'פגיעה' },
  { id: 'disappointment',        label: 'אכזבה' },
  { id: 'not_seen',              label: 'חוסר-ראייה ("הוא/היא לא רואה אותי")' },
  { id: 'loneliness_in_bond',    label: 'בדידות בתוך הקשר' },
  { id: 'shame',                 label: 'בושה' },
  { id: 'fear_of_bond',          label: 'פחד מהקשר עצמו' },
  { id: 'helplessness',          label: 'חוסר אונים' },
  { id: 'wont_change',           label: 'תחושה של "תמיד ככה ולא ישתנה"' },
  { id: 'guilt_for_anger',       label: 'אשמה על עצם הכעס' },
  { id: 'yearning_for_closeness', label: 'ערגה לקרבה שלא הייתה' },
  { id: 'unclear_underneath',    label: 'לא ברור עדיין' },
];

const INNER_CRITIC_OPTIONS = [
  { id: 'shouldnt_be_angry',    label: '"אתה לא צריך לכעוס עליהם"' },
  { id: 'did_their_best',       label: '"הם עשו כמיטב יכולתם"' },
  { id: 'grow_up',              label: '"תבגר כבר"' },
  { id: 'not_dignified',        label: '"זה לא ראוי"' },
  { id: 'exaggerating',         label: '"אתה מגזים"' },
  { id: 'let_it_go',            label: '"תעזוב את זה"' },
  { id: 'but_they_are_parents', label: '"אבל הם ההורים שלך"' },
  { id: 'voice_silent',         label: 'הקול שותק כרגע' },
  {
    id: 'vague_voice_present',
    label: 'יש קול אבל אני לא מצליח לנסח אותו',
    sub_input: { id: 'vague_voice', label: 'נסה לתאר עמום', placeholder: 'משהו כבד, קול קר, מה שאפשר' },
  },
];

// ── Session definition ─────────────────────────────────────────────

export const parentalAnger = {
  id: 'parental_anger',
  label: 'כעס על דמות הורית',
  description: 'משהו שעלה אחרי אינטראקציה עם הורה',
  icon: '⚡',

  questions: [
    {
      id: 'parent',
      type: 'single_select',
      label: 'מי ההורה?',
      options: PARENT_OPTIONS,
    },
    {
      id: 'trigger_type',
      type: 'select_with_custom',
      multi: true,
      label: 'מה קרה?',
      options: TRIGGER_TYPE_OPTIONS,
    },
    {
      id: 'when_event',
      type: 'single_select',
      label: 'מתי האירוע עצמו היה?',
      options: WHEN_EVENT_OPTIONS,
    },
    {
      id: 'when_anger',
      type: 'single_select',
      label: 'מתי הכעס עלה?',
      options: WHEN_ANGER_OPTIONS,
    },
    {
      id: 'body_sensation',
      type: 'multi_select',
      label: 'איך הכעס מורגש בגוף עכשיו?',
      options: BODY_SENSATION_OPTIONS,
    },
    {
      id: 'response_action',
      type: 'multi_select',
      label: 'מה עשית עם הכעס באותו רגע?',
      hint: 'אפשר לסמן יותר מאחד — לפי הסדר שזה קרה',
      options: RESPONSE_ACTION_OPTIONS,
    },
    {
      id: 'intensity',
      type: 'scale',
      label: 'עוצמת הכעס ברגע זה',
      config: {
        min: 1,
        max: 10,
        step: 1,
        polarity: 'high-bad',
        leftLabel: 'כמעט שכחתי',
        midLabel: 'מורגש ומתפקד',
        rightLabel: 'צף ושולט עליי',
      },
    },
    {
      id: 'underneath',
      type: 'select_with_custom',
      multi: true,
      label: 'מה אתה מנחש שיש מתחת לכעס?',
      options: UNDERNEATH_OPTIONS,
    },
    {
      id: 'inner_critic',
      type: 'select_with_custom',
      multi: true,
      label: 'מה הקול הפנימי אומר על זה שכעסת?',
      options: INNER_CRITIC_OPTIONS,
    },
  ],

  buildPrompt: (v, meta) => {
    const dateIso = meta?.createdAt || new Date().toISOString();

    const parent          = formatSingleSelect(v.parent, PARENT_OPTIONS);
    const triggers        = formatBulletList(v.trigger_type, TRIGGER_TYPE_OPTIONS);
    const triggersCustom  = getCustomLabels(v.trigger_type);
    const whenEvent       = formatSingleSelect(v.when_event, WHEN_EVENT_OPTIONS);
    const whenAnger       = formatSingleSelect(v.when_anger, WHEN_ANGER_OPTIONS);
    const body            = formatMultiSelect(v.body_sensation, BODY_SENSATION_OPTIONS);
    const responses       = formatMultiSelectNumbered(v.response_action, RESPONSE_ACTION_OPTIONS);
    const intensity       = formatScale(v.intensity);
    const underneath      = formatBulletList(v.underneath, UNDERNEATH_OPTIONS);
    const underneathCustom = getCustomLabels(v.underneath);
    const innerCritic     = formatBulletList(v.inner_critic, INNER_CRITIC_OPTIONS);
    const vagueVoice = isOptionSelected(v.inner_critic, 'vague_voice_present')
      ? getSubInput(v.inner_critic, 'vague_voice')
      : null;

    const lines = [
      'סשן: כעס על דמות הורית',
      `תאריך: ${dateIso}`,
      '',
      '— מה קרה —',
      `ההורה: ${parent}`,
      'מה קרה:',
      triggers,
    ];
    if (triggersCustom.length > 0) {
      lines.push('');
      lines.push(`בקול שלי: ${triggersCustom.join(', ')}`);
    }
    lines.push('');
    lines.push(`מתי האירוע: ${whenEvent}`);
    lines.push(`מתי הכעס עלה: ${whenAnger}`);
    lines.push('');
    lines.push('— איך זה מורגש —');
    lines.push(`תחושה גופנית: ${body}`);
    lines.push('מה עשיתי עם הכעס באותו רגע:');
    lines.push(responses);
    lines.push(`עוצמה כרגע: ${intensity}`);
    lines.push('');
    lines.push('— מתחת לכעס —');
    lines.push('מה אני מנחש שיש שם:');
    lines.push(underneath);
    if (underneathCustom.length > 0) {
      lines.push(`בקול שלי: ${underneathCustom.join(', ')}`);
    }
    lines.push('');
    lines.push('הקול הפנימי על עצם הכעס:');
    lines.push(innerCritic);
    if (vagueVoice) {
      lines.push(`תיאור עמום של הקול: ${vagueVoice}`);
    }
    lines.push('');
    lines.push('— הוראה לקלוד —');
    lines.push('זהו סשן כעס על דמות הורית. עבוד איתי לפי המבנה שמוגדר בסיסטם של הפרויקט. שים לב לפער בין "מתי האירוע" ל"מתי הכעס עלה" — זה המדד לדפוס הבליעה.');

    return lines.join('\n');
  },
};
