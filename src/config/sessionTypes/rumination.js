// Session 4: רומינציה — obsessive looping thoughts after an interaction.
// Pure configuration. The wizard renders the questions; the result screen
// runs buildPrompt(variables, meta) below.

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

const INTERACTION_TYPE_OPTIONS = [
  {
    id: 'close_person_face',
    label: 'שיחה פנים-אל-פנים עם אדם קרוב',
    sub_input: { id: 'close_person_who', label: 'מי?', placeholder: 'שם או תיאור' },
  },
  { id: 'phone_call',          label: 'שיחת טלפון' },
  { id: 'text_chat',           label: 'התכתבות בכתב (וואטסאפ / הודעות)' },
  { id: 'email_formal',        label: 'מייל / מסר רשמי' },
  { id: 'presentation_group',  label: 'מצגת / דיבור בפני קבוצה' },
  { id: 'interview',           label: 'ראיון / שיחת עבודה' },
  { id: 'date_romantic',       label: 'דייט או אינטראקציה רומנטית' },
  { id: 'authority_talk',      label: 'שיחה עם בוס / סמכות' },
  { id: 'legal_professional',  label: 'אינטראקציה משפטית / מקצועית' },
  { id: 'stranger',            label: 'אינטראקציה עם זר (קופאי, מלצר, מישהו ברחוב)' },
];

const WHEN_OPTIONS = [
  { id: 'last_hour',   label: 'בשעה האחרונה' },
  { id: 'today',       label: 'היום' },
  { id: 'yesterday',   label: 'אתמול' },
  { id: 'this_week',   label: 'בשבוע האחרון' },
  { id: 'this_month',  label: 'בחודש האחרון' },
  { id: 'over_month',  label: 'לפני יותר מחודש' },
];

const REAL_OR_IMAGINED_OPTIONS = [
  { id: 'actually_negative',       label: 'הוא/הם הגיבו באמת באופן שלילי / מאכזב' },
  { id: 'neutral_but_judging',     label: 'הוא/הם הגיבו ניטרלית אבל אני בטוח שבפנים הם שופטים' },
  { id: 'fine_loop_anyway',        label: 'הוא/הם הגיבו בסדר / חיובית — והלולאה רצה בכל זאת' },
  { id: 'silence_unknown',         label: 'אין תגובה / שתיקה, ולא ידוע אם זה רע או נייטרלי' },
  { id: 'no_chance_to_see',        label: 'לא הייתה לי הזדמנות לראות איך הוא הגיב' },
  { id: 'nothing_bad_happened',    label: 'שום דבר רע לא קרה בפועל — הלולאה רצה בלי טריגר ברור' },
];

const LOOP_CONTENT_OPTIONS = [
  { id: 'should_have_said',       label: '"הייתי צריך להגיד X במקום Y" (כתיבה מחדש)' },
  { id: 'they_must_think',        label: '"הם בטח חושבים ש..."' },
  { id: 'how_it_looks',           label: '"איך זה נראה מבחוץ"' },
  { id: 'why_said_that_way',      label: '"למה אמרתי את זה ככה"' },
  { id: 'messed_up',              label: '"פישלתי / קלקלתי"' },
  { id: 'they_wont_return',       label: '"הם לא יחזרו אליי / לא ירצו לדבר איתי שוב"' },
  { id: 'i_am_idiot',             label: '"אני אידיוט / לא בסדר"' },
  { id: 'should_have_stopped',    label: '"הייתי צריך לעצור את עצמי לפני"' },
  { id: 'what_to_do_now',         label: '"מה אני יכול לעשות עכשיו לתקן"' },
  { id: 'shock_loop',             label: 'חזרה על משפט או רגע ספציפי בלי תוכן ברור (לולאה דמוית הלם)' },
];

const BODY_SENSATION_OPTIONS = [
  { id: 'chest_pressure',         label: 'לחץ / כובד בחזה' },
  { id: 'nausea',                 label: 'בחילה / בטן מתהפכת' },
  { id: 'jaw_throat',             label: 'מתח בלסת או בגרון' },
  { id: 'shallow_breath',         label: 'חוסר אוויר / נשימה רדודה' },
  { id: 'face_heat_shame',        label: 'חום בפנים (בושה גופנית)' },
  { id: 'unused_energy',          label: 'אנרגיה לא מנוצלת בידיים / רגליים' },
  { id: 'insomnia_brain_on',      label: 'נדודי שינה / ראש "ער" שלא נכבה' },
  { id: 'heaviness_emptiness',    label: 'כובד וריקנות (שלב מאוחר)' },
  { id: 'disconnected_fog',       label: 'מנותק / מעורפל' },
  { id: 'no_body_all_head',       label: 'אין תחושה — הכל בראש' },
];

const LOOP_FUNCTION_OPTIONS = [
  { id: 'rewrite_magic',          label: 'למצוא ניסוח אחר שיגרום למה שקרה לא לקרות (קסם ילדי)' },
  { id: 'understand_their_view',  label: 'להבין בדיוק מה הם חושבים עליי' },
  { id: 'verify_no_harm',         label: 'לוודא שלא פגעתי / לא קלקלתי' },
  { id: 'evidence_not_bad',       label: 'לאסוף ראיות שאני לא נורא כמו שאני חושב' },
  { id: 'fix_now',                label: 'למצוא דרך לתקן עכשיו (לשלוח הודעה, להתקשר)' },
  { id: 'self_punish',            label: 'להעניש את עצמי על מה שקרה' },
  { id: 'do_anything_avoid_helplessness', label: 'פשוט "לעשות משהו" כדי לא להרגיש את חוסר האונים' },
  { id: 'unclear_function',       label: 'לא ברור — הלולאה רצה ואני לא יודע מה היא רוצה' },
];

const AVOIDED_FEELING_OPTIONS = [
  { id: 'shame',                  label: 'בושה' },
  { id: 'helplessness',           label: 'חוסר אונים — זה קרה ואני לא יכול לשנות' },
  { id: 'loss',                   label: 'אובדן — הרגע הזה איננו' },
  { id: 'anger_unexpressed',      label: 'כעס שלא הוצא במקום ובזמן' },
  { id: 'fear_abandonment',       label: 'פחד שיעזבו / לא ירצו אותי יותר' },
  { id: 'sadness',                label: 'עצב' },
  { id: 'emptiness',              label: 'ריקנות' },
  { id: 'raw_anxiety',            label: 'חרדה גולמית בלי תוכן' },
  { id: 'just_nothing',           label: '"סתם" כלום — שעמום או שקט' },
  {
    id: 'cant_imagine_stopping',
    label: 'לא יודע / קשה לדמיין שהיא נעצרת',
    sub_input: {
      id: 'why_hard_to_imagine',
      label: 'מה הכי מפחיד בלחשוב על זה?',
      placeholder: 'גם תיאור עמום מספיק',
    },
  },
];

const LEADING_VOICE_OPTIONS = [
  { id: 'critic_calculating',     label: 'הביקורתי שמחשב כל מילה ומגלה כשלים' },
  { id: 'demanding_should',       label: 'התובעני ש"היה צריך להגיד / לעשות יותר טוב"' },
  { id: 'scared_child',           label: 'הילדי המבוהל "מה יקרה עכשיו"' },
  { id: 'control_past',           label: 'חלק שמנסה לשלוט במשהו שכבר קרה' },
  { id: 'imagining_others',       label: 'חלק שמדמיין מה אחרים חושבים ברגע זה' },
  { id: 'rotating',               label: 'מתחלף בין כמה קולות' },
  { id: 'unclear_voice',          label: 'לא ברור — פשוט לולאה' },
];

// ── Session definition ─────────────────────────────────────────────

export const rumination = {
  id: 'rumination',
  label: 'מחשבות כפייתיות אחרי אירוע',
  description: 'לולאה בראש שלא נסגרת',
  icon: '↻',

  questions: [
    {
      id: 'interaction_type',
      type: 'select_with_custom',
      multi: true,
      label: 'סוג האינטראקציה שמרומנים עליה',
      options: INTERACTION_TYPE_OPTIONS,
    },
    {
      id: 'when',
      type: 'single_select',
      label: 'מתי האינטראקציה הייתה?',
      options: WHEN_OPTIONS,
    },
    {
      id: 'real_or_imagined',
      type: 'single_select',
      label: 'תגובת האדם בפועל',
      options: REAL_OR_IMAGINED_OPTIONS,
    },
    {
      id: 'loop_content',
      type: 'select_with_custom',
      multi: true,
      label: 'מה הלולאה חוזרת ואומרת?',
      options: LOOP_CONTENT_OPTIONS,
    },
    {
      id: 'body_sensation',
      type: 'multi_select',
      label: 'תחושה גופנית עכשיו',
      hint: 'תסמן מה מרגיש עכשיו — לא מה היה בהתחלה',
      options: BODY_SENSATION_OPTIONS,
    },
    {
      id: 'intensity',
      type: 'scale',
      label: 'עוצמת האחיזה של הלולאה כרגע',
      config: {
        min: 1,
        max: 10,
        step: 1,
        leftLabel: 'ברקע, מצליח לעשות דברים',
        midLabel: 'חוזר בכל פעם שאני לא עסוק',
        rightLabel: 'כל הראש בזה, לא מצליח להתרכז',
      },
    },
    {
      id: 'loop_function',
      type: 'single_select',
      label: 'מה הלולאה מנסה להשיג?',
      options: LOOP_FUNCTION_OPTIONS,
    },
    {
      id: 'avoided_feeling',
      type: 'multi_select',
      label: 'מה הייתי מרגיש אם הלולאה הייתה נעצרת ברגע זה?',
      options: AVOIDED_FEELING_OPTIONS,
    },
    {
      id: 'leading_voice',
      type: 'single_select',
      label: 'איזה קול פנימי מריץ אותה?',
      options: LEADING_VOICE_OPTIONS,
    },
  ],

  buildPrompt: (v, meta) => {
    const dateIso = meta?.createdAt || new Date().toISOString();

    const interactionList   = formatBulletList(v.interaction_type, INTERACTION_TYPE_OPTIONS);
    const interactionCustom = getCustomLabels(v.interaction_type);
    const closePersonName   = isOptionSelected(v.interaction_type, 'close_person_face')
      ? getSubInput(v.interaction_type, 'close_person_who')
      : null;
    const whenLine          = formatSingleSelect(v.when, WHEN_OPTIONS);
    const realOrImagined    = formatSingleSelect(v.real_or_imagined, REAL_OR_IMAGINED_OPTIONS);
    const loopContent       = formatBulletList(v.loop_content, LOOP_CONTENT_OPTIONS);
    const loopContentCustom = getCustomLabels(v.loop_content);
    const body              = formatMultiSelect(v.body_sensation, BODY_SENSATION_OPTIONS);
    const intensity         = formatScale(v.intensity);
    const loopFunction      = formatSingleSelect(v.loop_function, LOOP_FUNCTION_OPTIONS);
    const avoidedFeeling    = formatBulletList(v.avoided_feeling, AVOIDED_FEELING_OPTIONS);
    const whyHardToImagine  = isOptionSelected(v.avoided_feeling, 'cant_imagine_stopping')
      ? getSubInput(v.avoided_feeling, 'why_hard_to_imagine')
      : null;
    const leadingVoice      = formatSingleSelect(v.leading_voice, LEADING_VOICE_OPTIONS);

    const lines = [
      'סשן: רומינציה — מחשבות כפייתיות אחרי אירוע',
      `תאריך: ${dateIso}`,
      '',
      '— מה קרה —',
      'סוג האינטראקציה:',
      interactionList,
    ];
    if (closePersonName) {
      lines.push(`שם / תיאור: ${closePersonName}`);
    }
    if (interactionCustom.length > 0) {
      lines.push('');
      lines.push(`בקול שלי: ${interactionCustom.join(', ')}`);
    }
    lines.push('');
    lines.push(`מתי: ${whenLine}`);
    lines.push(`תגובת האדם בפועל: ${realOrImagined}`);
    lines.push('');
    lines.push('— הלולאה —');
    lines.push('מה הלולאה חוזרת ואומרת:');
    lines.push(loopContent);
    if (loopContentCustom.length > 0) {
      lines.push('');
      lines.push(`בקול שלי: ${loopContentCustom.join(', ')}`);
    }
    lines.push('');
    lines.push(`תחושה גופנית: ${body}`);
    lines.push(`עוצמת האחיזה של הלולאה: ${intensity}`);
    lines.push('');
    lines.push('— מתחת ללולאה —');
    lines.push(`מה הלולאה מנסה להשיג: ${loopFunction}`);
    lines.push('');
    lines.push('מה הייתי מרגיש אם היא הייתה נעצרת עכשיו:');
    lines.push(avoidedFeeling);
    if (whyHardToImagine) {
      lines.push(`מה הכי מפחיד בלחשוב על זה: ${whyHardToImagine}`);
    }
    lines.push('');
    lines.push(`איזה קול פנימי מריץ אותה: ${leadingVoice}`);
    lines.push('');
    lines.push('— הוראה לקלוד —');
    lines.push('זהו סשן רומינציה. עבוד איתי לפי המבנה שמוגדר בסיסטם של הפרויקט. סיכון מובנה: הסשן עצמו עלול להפוך לעוד שכבה של הלולאה — ניתוח למה אני מרומן, חיפוש "התשובה הנכונה", או נסיון לפתור את האינטראקציה המקורית בשיחה איתך. אל תזין את הלולאה הקוגניטיבית. הפנה אותי לגוף ולרגש שמתחת — במיוחד למה שעלה בשאלה "מה הייתי מרגיש אם הלולאה נעצרת". זה הנקודה.');

    return lines.join('\n');
  },
};
