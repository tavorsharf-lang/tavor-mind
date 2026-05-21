// Session 5: דחייה — rejection. Someone said no, ghosted, withdrew, or
// otherwise stepped back. Pure configuration.

import {
  formatSingleSelect,
  formatMultiSelect,
  formatBulletList,
  formatScale,
  getSubInput,
  isOptionSelected,
  getCustomLabels,
} from './_promptHelpers.js';

// ── Question option dictionaries ───────────────────────────────────

const REJECTOR_OPTIONS = [
  { id: 'romantic_partner',     label: 'מישהי / מישהו שהייתי בקשר רומנטי איתו/ה' },
  {
    id: 'early_dating',
    label: 'מישהי / מישהו שהייתי בתחילת קשר / דייטינג',
    sub_input: { id: 'dating_who', label: 'מי?', placeholder: 'שם או תיאור' },
  },
  {
    id: 'close_friend',
    label: 'חבר/ה קרוב/ה',
    sub_input: { id: 'friend_who', label: 'מי?', placeholder: 'שם או תיאור' },
  },
  { id: 'group_circle',         label: 'קבוצה / מעגל חברתי (לא הזמינו)' },
  { id: 'work_colleague',       label: 'אדם בעבודה / קולגה' },
  { id: 'authority',            label: 'סמכות (בוס, מנחה, מרצה)' },
  { id: 'family',               label: 'בן/בת משפחה' },
  { id: 'distant_acquaintance', label: 'מכר/ה רחוק/ה' },
  { id: 'near_stranger',        label: 'מישהו זר יחסית (אפליקציה, פגישה ראשונה)' },
];

const REJECTION_TYPE_OPTIONS = [
  { id: 'ghosting',              label: 'לא חזר/ה אליי (ghosting)' },
  { id: 'direct_no',             label: 'אמר/ה "לא" ישירות לבקשה / להצעה' },
  { id: 'cancelled_no_renew',    label: 'ביטל/ה ולא חידש/ה' },
  { id: 'gradual_distance',      label: 'התרחקות הדרגתית — פחות תגובה, פחות יוזמה' },
  { id: 'not_invited',           label: 'לא הזמינו אותי למשהו שאחרים הוזמנו אליו' },
  { id: 'ended_relationship',    label: 'סיים/ה את הקשר / היחסים' },
  { id: 'defining_hurtful',      label: 'אמירה פוגעת שמגדירה את הדחייה' },
  { id: 'cant_now_feels_like_no', label: '"אני לא יכול/ה עכשיו" שמרגיש כמו "לא"' },
  { id: 'public_ignored',        label: 'התעלמות גלויה במרחב פיזי / קבוצתי' },
];

const WHEN_OPTIONS = [
  { id: 'last_hour',          label: 'בשעה האחרונה' },
  { id: 'today',              label: 'היום' },
  { id: 'yesterday',          label: 'אתמול' },
  { id: 'this_week',          label: 'בשבוע האחרון' },
  { id: 'this_month',         label: 'בחודש האחרון' },
  { id: 'over_month_returns', label: 'לפני יותר מחודש — ועדיין חוזר' },
];

const STORY_OPTIONS = [
  { id: 'too_much',            label: '"אני יותר מדי" (אינטנסיבי, נצמד, רגשי, מהיר)' },
  { id: 'not_enough',          label: '"אני לא מספיק" (מעניין, מושך, חכם, מצליח, יציב)' },
  { id: 'said_did_specific',   label: '"אמרתי / עשיתי משהו ספציפי לא נכון"' },
  { id: 'saw_something_wrong', label: '"הם ראו משהו לא בסדר אצלי"' },
  { id: 'always_ends_this_way', label: '"ככה זה תמיד נגמר איתי"' },
  { id: 'should_have_been_other', label: '"הייתי צריך להיות אחר / קליל יותר"' },
  { id: 'found_someone_better', label: '"הם מצאו מישהו טוב יותר"' },
  { id: 'just_no_connection', label: '"פשוט לא חיברו אליי / לא עניין אותם" (ניטרלי יותר)' },
  { id: 'no_clear_reason',     label: '"אין סיבה ברורה — וזה הכי גרוע"' },
  { id: 'unclear_yet',         label: 'לא ברור עדיין' },
];

const BODY_SENSATION_OPTIONS = [
  { id: 'chest_pressure',   label: 'לחץ / כובד בחזה' },
  { id: 'face_heat_shame',  label: 'חום בפנים (בושה גופנית)' },
  { id: 'nausea',           label: 'בחילה / בטן מתהפכת' },
  { id: 'throat_tension',   label: 'מתח בגרון' },
  { id: 'breathlessness',   label: 'חוסר אוויר' },
  { id: 'subtle_tremor',    label: 'רעד עדין' },
  { id: 'hands_energy',     label: 'אנרגיה לא מנוצלת בידיים' },
  { id: 'heavy_empty',      label: 'כובד וריקנות' },
  { id: 'hole_in_chest',    label: '"חור" בחזה או בבטן' },
  { id: 'full_head',        label: 'ראש "מלא" / לחץ פנימי' },
  { id: 'disconnected',     label: 'אין תחושה — מנותק' },
];

const URGE_OPTIONS = [
  { id: 'reach_again_beg',     label: 'לפנות שוב / להסביר / להתחנן' },
  { id: 'prove_worth',         label: 'להוכיח שאני שווה (אצלם או אצל אחרים)' },
  { id: 'erase_them',          label: 'למחוק אותם — חסימה, ניתוק קשר' },
  { id: 'punish_them',         label: 'להעניש / לפגוע בהם בחזרה (במחשבה או במציאות)' },
  { id: 'isolate_disappear',   label: 'להסתגר ולהיעלם מכולם' },
  { id: 'forced_closure',      label: '"לסגור חשבון" — קבלה כפויה ועצירה רגשית' },
  { id: 'numb_distractions',   label: 'להסיח דעת באכילה / עישון / טלפון' },
  { id: 'no_clear_urge',       label: 'אין דחף ברור — רק עצב או ריקנות' },
];

const OLD_FEELING_OPTIONS = [
  { id: 'old_too_much',        label: '"אני יותר מדי" (תחושה ישנה שמלווה הרבה לפני זה)' },
  { id: 'old_not_enough',      label: '"אני לא מספיק" (תחושה ישנה שמלווה הרבה לפני זה)' },
  { id: 'always_leave_me',     label: '"תמיד עוזבים אותי בסוף"' },
  { id: 'never_belong',        label: '"אני לא שייך באמת לאף קבוצה"' },
  { id: 'flawed_others_sense', label: '"יש בי משהו פגום שאחרים מרגישים"' },
  { id: 'child_loneliness',    label: 'בדידות ילדית — "אף אחד לא רואה אותי"' },
  { id: 'not_worthy_of_love',  label: '"אני לא ראוי לאהבה / לרצייה"' },
  {
    id: 'present_pain_not_old',
    label: 'זה לא מציף משהו ישן — הכאב נוכחי וספציפי',
    sub_input: {
      id: 'present_pain',
      label: 'מה כן מורגש כרגע, אם זה לא ישן?',
      placeholder: 'אכזבה, פגיעה, אובדן ספציפי',
    },
  },
  { id: 'unsure_locate',       label: 'לא בטוח / קשה לאתר עכשיו' },
];

const INNER_CRITIC_OPTIONS = [
  { id: 'youre_exaggerating',     label: '"אתה מגזים, זה לא היה כזה גדול"' },
  { id: 'shaming_for_feeling',    label: '"אתה מבזה את עצמך אם תרגיש ככה"' },
  { id: 'knew_so_why_surprised',  label: '"ידעת שזה יקרה, אז למה הופתעת"' },
  { id: 'always_like_this',       label: '"תמיד אתה ככה — נצמד / רגיש / יותר מדי"' },
  { id: 'truly_alone',            label: '"אתה לבד באמת בעולם"' },
  { id: 'move_on_already',        label: '"תעבור הלאה כבר"' },
  { id: 'prove_them_wrong',       label: '"תוכיח להם שהם טעו"' },
  { id: 'youre_at_fault',         label: '"אתה אשם בזה"' },
  { id: 'worthy_to_reject_back',  label: '"אתה ראוי לדחות אותם בחזרה"' },
  { id: 'silent_critic',          label: 'שתיקה / הקול לא ברור' },
];

// Q1 sub_input mapping: option id → sub_input id, used by buildPrompt to
// surface the "שם / תיאור: ..." line under Q1.
const REJECTOR_SUBINPUT_IDS = {
  early_dating: 'dating_who',
  close_friend: 'friend_who',
};

function getRejectorSubInputValue(value) {
  if (!value || typeof value !== 'object') return null;
  const subId = REJECTOR_SUBINPUT_IDS[value.selected];
  if (!subId) return null;
  return getSubInput(value, subId);
}

// ── Session definition ─────────────────────────────────────────────

export const rejection = {
  id: 'rejection',
  label: 'דחייה',
  description: 'מישהו דחה, ביטל, או התרחק',
  icon: '◌',

  questions: [
    {
      id: 'rejector',
      type: 'single_select',
      label: 'מי דחה?',
      options: REJECTOR_OPTIONS,
    },
    {
      id: 'rejection_type',
      type: 'single_select',
      label: 'איזה סוג של דחייה?',
      options: REJECTION_TYPE_OPTIONS,
    },
    {
      id: 'when',
      type: 'single_select',
      label: 'מתי הדחייה קרתה?',
      options: WHEN_OPTIONS,
    },
    {
      id: 'story',
      type: 'select_with_custom',
      multi: true,
      label: 'מה הסיפור שאני מספר על למה זה קרה?',
      options: STORY_OPTIONS,
    },
    {
      id: 'body_sensation',
      type: 'multi_select',
      label: 'תחושה גופנית עכשיו',
      options: BODY_SENSATION_OPTIONS,
    },
    {
      id: 'urge',
      type: 'single_select',
      label: 'איזה דחף הכי חזק עכשיו?',
      options: URGE_OPTIONS,
    },
    {
      id: 'intensity',
      type: 'scale',
      label: 'עוצמת הפגיעה כרגע',
      config: {
        min: 1,
        max: 10,
        step: 1,
        polarity: 'high-bad',
        leftLabel: 'מורגש, מתפקד',
        midLabel: 'נוכח מאוד, חוזר ועולה',
        rightLabel: 'מציף, קשה לעשות משהו',
      },
    },
    {
      id: 'old_feeling',
      type: 'multi_select',
      label: 'מה התחושה הישנה שזה מציף?',
      options: OLD_FEELING_OPTIONS,
    },
    {
      id: 'inner_critic',
      type: 'select_with_custom',
      multi: true,
      label: 'מה הקול הפנימי אומר לי על הדחייה ועל התגובה שלי?',
      options: INNER_CRITIC_OPTIONS,
    },
  ],

  buildPrompt: (v, meta) => {
    const dateIso = meta?.createdAt || new Date().toISOString();

    const rejector       = formatSingleSelect(v.rejector, REJECTOR_OPTIONS);
    const rejectorSubVal = getRejectorSubInputValue(v.rejector);
    const rejectionType  = formatSingleSelect(v.rejection_type, REJECTION_TYPE_OPTIONS);
    const whenLine       = formatSingleSelect(v.when, WHEN_OPTIONS);
    const story          = formatBulletList(v.story, STORY_OPTIONS);
    const storyCustom    = getCustomLabels(v.story);
    const body           = formatMultiSelect(v.body_sensation, BODY_SENSATION_OPTIONS);
    const urge           = formatSingleSelect(v.urge, URGE_OPTIONS);
    const intensity      = formatScale(v.intensity);
    const oldFeeling     = formatBulletList(v.old_feeling, OLD_FEELING_OPTIONS);
    const presentPain    = isOptionSelected(v.old_feeling, 'present_pain_not_old')
      ? getSubInput(v.old_feeling, 'present_pain')
      : null;
    const innerCritic    = formatBulletList(v.inner_critic, INNER_CRITIC_OPTIONS);
    const innerCriticCustom = getCustomLabels(v.inner_critic);

    const lines = [
      'סשן: דחייה',
      `תאריך: ${dateIso}`,
      '',
      '— מי ומה —',
      `מי דחה: ${rejector}`,
    ];
    if (rejectorSubVal) {
      lines.push(`שם / תיאור: ${rejectorSubVal}`);
    }
    lines.push(`סוג הדחייה: ${rejectionType}`);
    lines.push(`מתי: ${whenLine}`);
    lines.push('');
    lines.push('— הפגיעה —');
    lines.push('הסיפור שאני מספר על למה זה קרה:');
    lines.push(story);
    if (storyCustom.length > 0) {
      lines.push('');
      lines.push(`בקול שלי: ${storyCustom.join(', ')}`);
    }
    lines.push('');
    lines.push(`תחושה גופנית: ${body}`);
    lines.push(`הדחף הכי חזק עכשיו: ${urge}`);
    lines.push(`עוצמת הפגיעה: ${intensity}`);
    lines.push('');
    lines.push('— מתחת לדחייה —');
    lines.push('התחושה הישנה שזה מציף:');
    lines.push(oldFeeling);
    if (presentPain) {
      lines.push(`מה כן מורגש כרגע (לא ישן): ${presentPain}`);
    }
    lines.push('');
    lines.push('הקול הפנימי על הדחייה ועל התגובה שלי:');
    lines.push(innerCritic);
    if (innerCriticCustom.length > 0) {
      lines.push(`בקול שלי: ${innerCriticCustom.join(', ')}`);
    }
    lines.push('');
    lines.push('— הוראה לקלוד —');
    lines.push('זהו סשן דחייה. עבוד איתי לפי המבנה שמוגדר בסיסטם של הפרויקט.');
    lines.push('שים לב לשתי נקודות מבניות:');
    lines.push('1) הדחייה הספציפית סביר שמפעילה תחושה ישנה שקדמה לאירוע — "יותר מדי" או "לא מספיק" — וזה השכבה שאליה צריך לרדת. השדה "התחושה הישנה שזה מציף" הוא הציר.');
    lines.push('2) הסיפור של "אני אשם" שצפוי לעלות הוא הגנה, לא רק תקיפה — הוא משמר אשליית שליטה במקום חוסר האונים האמיתי שהדחייה מציפה. אל תתווכח עם הסיפור הזה ראש בראש, אבל גם אל תקבל אותו כתיאור מציאות. הכר במה שהוא מנסה להגן עליו.');
    lines.push('אל תמהר לעבר "אולי הם פשוט עסוקים", "תמצא מישהי אחרת", או "כאלה הם אנשים" — כל אלה חילוץ מהבושה במקום נוכחות איתה.');

    return lines.join('\n');
  },
};
