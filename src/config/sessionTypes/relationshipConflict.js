// Session 3: קונפליקט פתוח עם בת זוג / קרוב — relationship_conflict.
// Pure configuration. The wizard renders the questions; the result screen
// runs buildPrompt(variables, meta) below.

import {
  formatSingleSelect,
  formatMultiSelect,
  formatMultiSelectBullets,
  formatBulletList,
  formatScale,
  getSubInput,
  getCustomLabels,
} from './_promptHelpers.js';

// ── Question option dictionaries ───────────────────────────────────

const PERSON_OPTIONS = [
  { id: 'partner',         label: 'בת זוג' },
  {
    id: 'close_friend',
    label: 'חבר/ה קרוב/ה',
    sub_input: { id: 'friend_who', label: 'מי?', placeholder: 'שם או תיאור' },
  },
  {
    id: 'sibling',
    label: 'אח / אחות',
    sub_input: { id: 'sibling_who', label: 'מי?', placeholder: 'שם או תיאור' },
  },
  {
    id: 'other_person',
    label: 'אחר',
    sub_input: { id: 'other_who', label: 'מי?', placeholder: 'שם או תיאור' },
  },
];

const CONFLICT_STAGE_OPTIONS = [
  { id: 'mid_live_argument',  label: 'עכשיו, באמצע ויכוח חי' },
  { id: 'paused_one_left',    label: 'השיחה נעצרה - אחד מאיתנו שתק או יצא' },
  { id: 'silence_lingering',  label: 'שתיקה משתררת בלי שדיברנו' },
  { id: 'fake_reconciliation', label: '"פיוס" מזויף - אמרנו "סבבה" אבל לא נסגר' },
  { id: 'after_explosion',    label: 'אחרי שהתפוצצתי וטרם נסגר' },
  { id: 'after_swallow',      label: 'אחרי שבלעתי ולא אמרתי כלום' },
  { id: 'unclear_stage',      label: 'לא ברור איפה זה עומד' },
];

const TRIGGER_OPTIONS = [
  { id: 'direct_criticism',     label: 'ביקורת ישירה עליי' },
  { id: 'condescending_tone',   label: 'טון מזלזל / מתנשא' },
  { id: 'unfair_blame',         label: 'האשמה לא מוצדקת' },
  { id: 'ignored_emotion',      label: 'התעלמות ממשהו שאמרתי / רגש שהבעתי' },
  { id: 'past_brought_up',      label: '"הזכרת" משהו מהעבר נגדי' },
  { id: 'boundary_invasion',    label: 'פלישה לגבולות' },
  { id: 'unilateral_decision',  label: 'החלטה חד-צדדית' },
  { id: 'disappointment_in_me', label: 'אכזבה ממני שהובעה' },
  { id: 'compromise_invisible', label: 'ויתור שעשיתי שלא נראה / לא הוערך' },
  { id: 'small_accumulation',   label: 'הצטברות של דברים קטנים שהתפוצצה עכשיו' },
];

const BODY_SENSATION_OPTIONS = [
  { id: 'chest_pressure',     label: 'לחץ / חום בחזה' },
  { id: 'jaw_throat',         label: 'מתח בלסת או בגרון' },
  { id: 'face_heat',          label: 'חום בפנים' },
  { id: 'subtle_tremor',      label: 'רעד עדין' },
  { id: 'heaviness',          label: 'כובד בבטן או בחזה' },
  { id: 'nausea',             label: 'בחילה' },
  { id: 'shallow_breath',     label: 'חוסר אוויר / נשימה רדודה' },
  { id: 'freeze',             label: 'קיפאון / אין תנועה' },
  { id: 'want_to_leave',      label: 'רצון פיזי לעזוב את החדר' },
  { id: 'want_to_approach',   label: 'רצון פיזי להתקרב אליו/ה למרות הקונפליקט' },
  { id: 'hands_energy',       label: 'אנרגיה בידיים' },
  { id: 'disconnected',       label: 'אין תחושה ברורה - מנותק' },
];

const OUTWARD_RESPONSE_OPTIONS = [
  { id: 'swallow_silent',          label: 'בלעתי ושתקתי' },
  { id: 'placate_outside',         label: '"פייסתי" כלפי חוץ אבל בפנים סגור' },
  { id: 'insisted_right',          label: 'התעקשתי שאני צודק' },
  { id: 'exploded',                label: 'התפוצצתי / הרמתי קול' },
  { id: 'left_physically',         label: 'יצאתי מהמרחב פיזית' },
  { id: 'disconnected_emotionally', label: 'ניתקתי רגשית - נוכח אבל לא שם' },
  { id: 'self_erasing',            label: 'ניסיתי להבין אותו/אותה ולוותר על עצמי' },
  { id: 'said_hurtful',            label: 'אמרתי משהו פוגעני שאני מתחרט עליו' },
  { id: 'still_in_it',             label: 'עוד לא עשיתי כלום - אני בתוך זה עכשיו' },
];

const WHAT_HIT_OPTIONS = [
  { id: 'not_seen_heard',      label: 'שלא רואים / שומעים אותי באמת' },
  { id: 'not_trusted',         label: 'שלא סומכים עליי / חושדים בי' },
  { id: 'i_am_wrong',          label: 'שאני שגוי / לא בסדר' },
  { id: 'fear_losing_them',    label: 'שאני אאבד אותו/אותה אם אגיד את האמת' },
  { id: 'controlled_erased',   label: 'שאני נשלט / נמחק' },
  { id: 'must_swallow_again',  label: 'שאני "צריך" להבליג גם הפעם' },
  { id: 'used_against_me',     label: 'שמשתמשים נגדי במשהו שחשפתי' },
  { id: 'helplessness',        label: 'חוסר אונים מהקשר עצמו' },
  { id: 'loneliness_in_closeness', label: 'בדידות בתוך הקרבה' },
  { id: 'yearning_understood', label: 'ערגה שמישהו רק יבין בלי שאסביר' },
  { id: 'unclear_hit',         label: 'לא ברור עדיין' },
];

const LEADING_PART_OPTIONS = [
  { id: 'peace_over_truth',    label: 'החלק ש"שלום עדיף על אמת"' },
  { id: 'right_no_compromise', label: 'החלק ש"אני צודק ולא אוותר"' },
  { id: 'detached',            label: 'החלק שמתנתק ועושה כאילו אין כלום' },
  { id: 'unseen_child',        label: 'החלק הפגוע - הילד שלא נראה' },
  { id: 'self_critic',         label: 'החלק שמבקר אותי על שאני בכלל בקונפליקט' },
  { id: 'rotating',            label: 'מתחלף בין כמה מהם בזמן קצר' },
  { id: 'cant_identify',       label: 'אני לא מצליח לזהות כרגע' },
];

const INNER_CRITIC_OPTIONS = [
  { id: 'give_up_for_peace',   label: '"תוותר ויהיה שלום"' },
  { id: 'you_will_lose_them',  label: '"אתה תאבד אותו/אותה"' },
  { id: 'truth_will_end_it',   label: '"אם תגיד את האמת זה ייגמר"' },
  { id: 'too_sensitive',       label: '"אתה מגזים / רגיש מדי"' },
  { id: 'not_important',       label: '"תרד מזה, זה לא חשוב"' },
  { id: 'you_caused_this',     label: '"אתה גורם לזה"' },
  { id: 'dont_give_up',        label: '"אל תוותר, אתה צודק"' },
  { id: 'be_the_adult',        label: '"תהיה הבוגר במצב הזה"' },
  { id: 'unclear_critic',      label: 'שתיקה / הקול לא ברור' },
];

// Map structured single_select option id → sub_input id used in buildPrompt
// to surface "שם / תיאור: ..." on Q1.
const PERSON_SUBINPUT_IDS = {
  close_friend: 'friend_who',
  sibling: 'sibling_who',
  other_person: 'other_who',
};

function getPersonSubInputValue(value) {
  if (!value || typeof value !== 'object') return null;
  const subId = PERSON_SUBINPUT_IDS[value.selected];
  if (!subId) return null;
  return getSubInput(value, subId);
}

// ── Session definition ─────────────────────────────────────────────

export const relationshipConflict = {
  id: 'relationship_conflict',
  label: 'קונפליקט פתוח עם בת זוג / קרוב',
  description: 'משהו פתוח, באמצע, או לא נסגר',
  icon: '◐',

  questions: [
    {
      id: 'person',
      type: 'single_select',
      label: 'מי האדם?',
      options: PERSON_OPTIONS,
    },
    {
      id: 'conflict_stage',
      type: 'single_select',
      label: 'באיזה שלב הקונפליקט עכשיו?',
      options: CONFLICT_STAGE_OPTIONS,
    },
    {
      id: 'trigger',
      type: 'select_with_custom',
      multi: true,
      label: 'מה הצית את זה?',
      options: TRIGGER_OPTIONS,
    },
    {
      id: 'body_sensation',
      type: 'multi_select',
      label: 'תחושה גופנית עכשיו',
      options: BODY_SENSATION_OPTIONS,
    },
    {
      id: 'intensity',
      type: 'scale',
      label: 'עוצמת ההפעלה כרגע',
      config: {
        min: 1,
        max: 10,
        step: 1,
        polarity: 'high-bad',
        leftLabel: 'רגוע יחסית',
        midLabel: 'מורגש מאוד אבל מתפקד',
        rightLabel: 'מציף, קשה לחשוב',
      },
    },
    {
      id: 'outward_response',
      type: 'single_select',
      label: 'מה אני עושה / עשיתי כלפי חוץ?',
      options: OUTWARD_RESPONSE_OPTIONS,
    },
    {
      id: 'what_hit',
      type: 'multi_select',
      label: 'מה זה נוגע אצלי?',
      options: WHAT_HIT_OPTIONS,
    },
    {
      id: 'leading_part',
      type: 'single_select',
      label: 'איזה חלק בי מוביל ברגע זה?',
      options: LEADING_PART_OPTIONS,
    },
    {
      id: 'inner_critic',
      type: 'select_with_custom',
      multi: true,
      label: 'מה הקול הפנימי אומר על הקונפליקט עצמו?',
      options: INNER_CRITIC_OPTIONS,
    },
  ],

  buildPrompt: (v, meta) => {
    const dateIso = meta?.createdAt || new Date().toISOString();

    const person          = formatSingleSelect(v.person, PERSON_OPTIONS);
    const personSubValue  = getPersonSubInputValue(v.person);
    const conflictStage   = formatSingleSelect(v.conflict_stage, CONFLICT_STAGE_OPTIONS);
    const triggers        = formatBulletList(v.trigger, TRIGGER_OPTIONS);
    const triggersCustom  = getCustomLabels(v.trigger);
    const body            = formatMultiSelect(v.body_sensation, BODY_SENSATION_OPTIONS);
    const intensity       = formatScale(v.intensity);
    const outward         = formatSingleSelect(v.outward_response, OUTWARD_RESPONSE_OPTIONS);
    const leadingPart     = formatSingleSelect(v.leading_part, LEADING_PART_OPTIONS);
    const innerCritic     = formatBulletList(v.inner_critic, INNER_CRITIC_OPTIONS);
    const innerCriticCustom = getCustomLabels(v.inner_critic);
    // what_hit is plain multi_select but the brief asks for a bullet render
    // (clinical readability). Local helper below.
    const whatHitBullets  = formatMultiSelectBullets(v.what_hit, WHAT_HIT_OPTIONS);

    const lines = [
      'סשן: קונפליקט פתוח עם בת זוג / קרוב',
      `תאריך: ${dateIso}`,
      '',
      '- מי ומה -',
      `האדם: ${person}`,
    ];
    if (personSubValue) {
      lines.push(`שם / תיאור: ${personSubValue}`);
    }
    lines.push(`שלב הקונפליקט עכשיו: ${conflictStage}`);
    lines.push('מה הצית:');
    lines.push(triggers);
    if (triggersCustom.length > 0) {
      lines.push('');
      lines.push(`בקול שלי: ${triggersCustom.join(', ')}`);
    }
    lines.push('');
    lines.push('- איך זה מורגש -');
    lines.push(`תחושה גופנית: ${body}`);
    lines.push(`עוצמה: ${intensity}`);
    lines.push(`מה עשיתי / עושה כלפי חוץ: ${outward}`);
    lines.push('');
    lines.push('- מתחת לקונפליקט -');
    lines.push('מה זה נוגע אצלי:');
    lines.push(whatHitBullets);
    lines.push('');
    lines.push(`מי מוביל עכשיו בפנים: ${leadingPart}`);
    lines.push('');
    lines.push('הקול הפנימי על הקונפליקט:');
    lines.push(innerCritic);
    if (innerCriticCustom.length > 0) {
      lines.push(`בקול שלי: ${innerCriticCustom.join(', ')}`);
    }
    lines.push('');
    lines.push('- הוראה לקלוד -');
    lines.push('זהו סשן קונפליקט פתוח עם אדם קרוב. עבוד איתי לפי המבנה שמוגדר בסיסטם של הפרויקט. שים לב לסיכון מובנה: הסשן עצמו עלול להיהפך לעוד רגע של "שלום עדיף" - אל תמהר לעבר פתרון, ניסוח מה להגיד, או פיוס. תן מקום קודם לפגיעה הגולמית ולחלק שכן רוצה לכעוס, לפני כל מחשבה על תיקון או על האדם השני.');

    return lines.join('\n');
  },
};

