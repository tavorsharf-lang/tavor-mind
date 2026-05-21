// Session 6: כשלון בגבולות — boundary failure. The user said yes when they
// wanted to say no. Pure configuration.

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
  { id: 'partner',             label: 'בת זוג' },
  {
    id: 'dating',
    label: 'מישהי / מישהו במצב רומנטי / דייטינג',
    sub_input: { id: 'dating_who', label: 'מי?', placeholder: 'שם או תיאור' },
  },
  {
    id: 'close_friend',
    label: 'חבר/ה קרוב/ה',
    sub_input: { id: 'friend_who', label: 'מי?', placeholder: 'שם או תיאור' },
  },
  { id: 'colleague',           label: 'קולגה / מישהו בעבודה' },
  { id: 'authority',           label: 'בוס / מנחה / סמכות' },
  { id: 'family',              label: 'בן/בת משפחה' },
  { id: 'client',              label: 'לקוח / מישהו שאני נותן לו שירות' },
  { id: 'distant_acquaintance', label: 'מכר/ה רחוק/ה' },
  { id: 'reached_out_first',   label: 'מישהו שפנה לי לראשונה' },
  {
    id: 'other',
    label: 'אחר',
    sub_input: { id: 'other_who', label: 'מי?', placeholder: 'שם או תיאור' },
  },
];

const WHAT_AGREED_OPTIONS = [
  { id: 'favor_logistic',           label: 'טובה / משימה לוגיסטית' },
  { id: 'time_commitment',          label: 'התחייבות זמן (פגישה, מפגש, אירוע)' },
  { id: 'ongoing_role',             label: 'תפקיד / אחריות מתמשכת' },
  { id: 'emotional_support_no_capacity', label: 'סיוע רגשי שאני לא בכוחות אליו' },
  { id: 'financial_material',       label: 'ויתור כספי או חומרי' },
  { id: 'their_plan_over_mine',     label: 'הסכמה לתוכנית של מישהו אחר במקום שלי' },
  { id: 'fake_agreement_in_talk',   label: 'ויתור על דעה / עמדה / "הסכמה" מזויפת בשיחה' },
  { id: 'intimate_physical',        label: '"כן" אינטימי / פיזי שלא רציתי' },
  { id: 'meeting_no_continue',      label: 'הסכמה לפגישה / קשר שאני לא רוצה להמשיך' },
  { id: 'gave_up_my_ask',           label: 'ויתור על בקשה שלי כדי לא להעמיס' },
];

const REVERSIBILITY_OPTIONS = [
  { id: 'yes_no_cost',         label: 'כן בלי "מחיר" משמעותי' },
  { id: 'yes_creates_tension', label: 'כן אבל יהיה לא נעים / יצור מתח' },
  { id: 'yes_fear_harm_bond',  label: 'כן אבל אני חושש שזה יפגע בקשר' },
  { id: 'partial_only',        label: 'אפשר חלקית — אפשר לצמצם אבל לא לבטל' },
  { id: 'no_done_already',     label: 'כבר אי אפשר — קרה / הסכמתי בכתב / נעשה' },
  { id: 'unsure_reversible',   label: 'לא בטוח' },
];

const BODY_AT_YES_OPTIONS = [
  { id: 'felt_no_overrode',       label: 'הרגשתי את ה"לא" בגוף ועברתי מעליו' },
  { id: 'tightness_unnamed',      label: 'הרגשתי לחץ / כיווץ אבל לא ניסחתי לעצמי' },
  { id: 'watched_myself',         label: 'הסתכלתי על עצמי אומר כן מבחוץ (דיסוציאציה)' },
  { id: 'auto_fawn',              label: 'חיוך / נימוס אוטומטי השתלט (fawn)' },
  { id: 'fear_pushed_compliance', label: 'פחד גופני שדחף אותי לציית מהר' },
  { id: 'flat_agreement',         label: 'לא הרגשתי כלום בגוף — הסכמתי שטוח' },
  { id: 'dont_remember',          label: 'אני לא זוכר את הרגע עצמו' },
];

const FEELING_NOW_OPTIONS = [
  { id: 'regret',                  label: 'חרטה — איך הסכמתי' },
  { id: 'anger_at_self',           label: 'כעס על עצמי' },
  { id: 'resentment',              label: 'רסנטמנט / כעס על האדם השני' },
  { id: 'anxiety_ahead',           label: 'חרדה לקראת הקיום של ההתחייבות' },
  { id: 'trapped',                 label: '"לכוד" — אין מוצא' },
  { id: 'shame_humiliation',       label: 'בושה / השפלה' },
  { id: 'general_self_betrayal',   label: 'תחושת ויתור עצמי כללית' },
  { id: 'emptiness_fatigue',       label: 'ריקנות / עייפות' },
  { id: 'disconnected_not_yet',    label: 'מנותק — אני לא מרגיש את זה לגמרי עדיין' },
  { id: 'unsure_feeling',          label: 'אני לא בטוח' },
];

const PART_THAT_SAID_YES_OPTIONS = [
  { id: 'demanding_must_be_available',  label: 'התובעני שאמר "אתה חייב להיות זמין / נחמד / מועיל"' },
  { id: 'giver',                        label: 'הנותן שאמר "הם זקוקים לי"' },
  { id: 'child_seeking_approval',       label: 'הילד שחיפש אישור / שהם יחבבו אותי' },
  { id: 'fear_their_anger',             label: 'החלק שפחד מקונפליקט / כעס שלהם' },
  { id: 'fear_abandonment',             label: 'החלק שפחד שיעזבו / יתרחקו' },
  { id: 'automatic_no_time',            label: 'החלק שעבד אוטומטית, בלי שהיה זמן לחשוב' },
  { id: 'didnt_want_to_make_a_thing',   label: 'החלק ש"לא רצה לעשות עניין"' },
];

const FEARED_CONSEQUENCE_OPTIONS = [
  { id: 'they_will_be_hurt_angry',  label: 'שייעלבו / יכעסו עליי' },
  { id: 'they_will_distance',       label: 'שיתרחקו / לא ירצו אותי יותר' },
  { id: 'will_see_me_selfish',      label: 'שיחשבו שאני אנוכי / רע' },
  { id: 'will_see_me_weak',         label: 'שיחשבו שאני לא מועיל / חלש / לא שווה' },
  { id: 'conflict_overwhelm',       label: 'שיהיה קונפליקט שאני לא אסתדר איתו' },
  { id: 'public_image_no_guy',      label: 'שאני אהיה "ההוא שאמר לא" — הסתכלות חיצונית' },
  { id: 'will_really_hurt_them',    label: 'שאני אפגע בהם באמת' },
  { id: 'concrete_bad_outcome',     label: 'שמשהו רע ממשי יקרה (פיטורים, פירוד, הוצאה מקבוצה)' },
  { id: 'will_feel_guilty_later',   label: 'שאני ארגיש אשמה / חרטה אחר כך על שאמרתי לא' },
  { id: 'unclear_fear',             label: 'לא ברור עדיין' },
];

const PATTERN_OPTIONS = [
  { id: 'yes_this_person',     label: 'כן, מול האדם הספציפי הזה זה חוזר' },
  { id: 'yes_this_type',       label: 'כן, מול סוג של אנשים (אני מזהה את הסוג)' },
  { id: 'yes_cant_characterize', label: 'כן, אבל אני לא מצליח לאפיין את הסוג' },
  { id: 'single_event',        label: 'זה לא דפוס — אירוע יחיד' },
  { id: 'suspect_unsure',      label: 'אני חושד שיש דפוס אבל לא בטוח עדיין' },
];

// Q1 sub_input mapping: option id → sub_input id, used by buildPrompt to
// surface the "שם / תיאור: ..." line under Q1.
const PERSON_SUBINPUT_IDS = {
  dating: 'dating_who',
  close_friend: 'friend_who',
  other: 'other_who',
};

function getPersonSubInputValue(value) {
  if (!value || typeof value !== 'object') return null;
  const subId = PERSON_SUBINPUT_IDS[value.selected];
  if (!subId) return null;
  return getSubInput(value, subId);
}

// ── Session definition ─────────────────────────────────────────────

export const boundaryFailure = {
  id: 'boundary_failure',
  label: 'כשלון בגבולות',
  description: 'אמרתי כן כשרציתי לא',
  icon: '⤬',

  questions: [
    {
      id: 'person',
      type: 'single_select',
      label: 'מי האדם?',
      options: PERSON_OPTIONS,
    },
    {
      id: 'what_agreed_to',
      type: 'select_with_custom',
      multi: true,
      label: 'למה הסכמת?',
      options: WHAT_AGREED_OPTIONS,
    },
    {
      id: 'reversibility',
      type: 'single_select',
      label: 'האם עוד אפשר לחזור בך?',
      options: REVERSIBILITY_OPTIONS,
    },
    {
      id: 'body_at_yes',
      type: 'multi_select',
      label: 'מה קרה בגוף ברגע ה"כן"?',
      options: BODY_AT_YES_OPTIONS,
    },
    {
      id: 'feeling_now',
      type: 'multi_select',
      label: 'איך אני מרגיש עכשיו אחרי שהסכמתי?',
      options: FEELING_NOW_OPTIONS,
    },
    {
      id: 'intensity',
      type: 'scale',
      label: 'עוצמת המצוקה כרגע',
      config: {
        min: 1,
        max: 10,
        step: 1,
        polarity: 'high-bad',
        leftLabel: 'מציק ברקע',
        midLabel: 'חוזר ועולה, משפיע על המצב רוח',
        rightLabel: 'מציף, קשה לחשוב על משהו אחר',
      },
    },
    {
      id: 'part_that_said_yes',
      type: 'multi_select',
      label: 'איזה חלק בי אמר כן?',
      options: PART_THAT_SAID_YES_OPTIONS,
    },
    {
      id: 'feared_consequence',
      type: 'multi_select',
      label: 'מה החלק שרצה לומר לא חשש שיקרה אם היה אומר לא?',
      options: FEARED_CONSEQUENCE_OPTIONS,
    },
    {
      id: 'pattern',
      type: 'single_select',
      label: 'האם זה דפוס מול האדם הזה / סוג האדם הזה?',
      options: PATTERN_OPTIONS,
    },
  ],

  buildPrompt: (v, meta) => {
    const dateIso = meta?.createdAt || new Date().toISOString();

    const person          = formatSingleSelect(v.person, PERSON_OPTIONS);
    const personSubValue  = getPersonSubInputValue(v.person);
    const whatAgreed      = formatBulletList(v.what_agreed_to, WHAT_AGREED_OPTIONS);
    const whatAgreedCustom = getCustomLabels(v.what_agreed_to);
    const reversibility   = formatSingleSelect(v.reversibility, REVERSIBILITY_OPTIONS);
    const bodyAtYes       = formatMultiSelect(v.body_at_yes, BODY_AT_YES_OPTIONS);
    const feelingNow      = formatMultiSelect(v.feeling_now, FEELING_NOW_OPTIONS);
    const intensity       = formatScale(v.intensity);
    const partsYes        = formatMultiSelectBullets(v.part_that_said_yes, PART_THAT_SAID_YES_OPTIONS);
    const fearedConsequence = formatMultiSelectBullets(v.feared_consequence, FEARED_CONSEQUENCE_OPTIONS);
    const pattern         = formatSingleSelect(v.pattern, PATTERN_OPTIONS);

    const lines = [
      'סשן: כשלון בגבולות',
      `תאריך: ${dateIso}`,
      '',
      '— מי ומה —',
      `האדם: ${person}`,
    ];
    if (personSubValue) {
      lines.push(`שם / תיאור: ${personSubValue}`);
    }
    lines.push('למה הסכמתי:');
    lines.push(whatAgreed);
    if (whatAgreedCustom.length > 0) {
      lines.push('');
      lines.push(`בקול שלי: ${whatAgreedCustom.join(', ')}`);
    }
    lines.push('');
    lines.push(`האם עוד אפשר לחזור בי: ${reversibility}`);
    lines.push('');
    lines.push('— הרגע ואחריו —');
    lines.push(`מה קרה בגוף ברגע ה"כן": ${bodyAtYes}`);
    lines.push(`איך אני מרגיש עכשיו אחרי שהסכמתי: ${feelingNow}`);
    lines.push(`עוצמת המצוקה: ${intensity}`);
    lines.push('');
    lines.push('— מי בפנים —');
    lines.push('החלק / החלקים שאמרו כן:');
    lines.push(partsYes);
    lines.push('');
    lines.push('מה החלק שרצה לומר לא חשש שיקרה:');
    lines.push(fearedConsequence);
    lines.push('');
    lines.push(`דפוס מול האדם הזה / הסוג הזה: ${pattern}`);
    lines.push('');
    lines.push('— הוראה לקלוד —');
    lines.push('זהו סשן כשלון בגבולות. עבוד איתי לפי המבנה שמוגדר בסיסטם של הפרויקט.');
    lines.push('שים לב לשלוש נקודות מבניות:');
    lines.push('1) רגע ה"כן" היה רגע של פיצול פנימי — חלק אחד אמר כן, חלק אחר רצה לומר לא. אל תזהה רק עם החלק שכועס עכשיו על מה שקרה. הזמן לשולחן גם את החלק שאמר כן ושמע מה הוא ניסה להגן עליו. הוא לא חלש, הוא מגן.');
    lines.push('2) אם אפשר עוד לחזור בי, יש דחף מובנה לקפוץ לפעולה — "איך לנסח הודעת ביטול". עכב את הפעולה עד שהפיצול הוכר. הפעולה שתבוא אחר כך תהיה יציבה יותר.');
    lines.push('3) אם אי אפשר לחזור בי, העבודה היא לא תיקון אלא מפגש עם החלק שלא הצליח לדבר ברגע אמת. תן לו מקום, אל תאשים אותו, ואל תזרוק אותו לטובת קבלה מהירה.');

    return lines.join('\n');
  },
};
