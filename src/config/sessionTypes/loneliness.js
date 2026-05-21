// Session 7: בדידות — loneliness. The four-type taxonomy (internal-block /
// alone / different / unseen) is the organizing variable; the rest of the
// session reads through it. Pure configuration.

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

const LONELINESS_TYPE_OPTIONS = [
  { id: 'internal_block', label: 'חסם פנימי - יש אנשים סביבי אבל אני לא פונה' },
  { id: 'truly_alone',    label: 'אני לבד - אין אף אחד נגיש עכשיו' },
  { id: 'different',      label: 'אני שונה - יש אנשים אבל אני לא שייך' },
  {
    id: 'unseen',
    label: 'אני לא נראה - אנשים בקרבתי אבל לא רואים אותי באמת',
    sub_input: {
      id: 'unseen_specifics',
      label: 'מה ספציפית לא נראה?',
      placeholder: 'איזה חלק בך שהיית רוצה שיראו',
    },
  },
  { id: 'mixed',          label: 'ערבוב של כמה סוגים' },
  { id: 'unclear_type',   label: 'לא ברור כרגע' },
];

const DURATION_OPTIONS = [
  { id: 'acute_today',    label: 'אקוטית - רק הערב / היום הזה' },
  { id: 'nights_only',    label: 'חוזרת בלילות אבל לא בימים' },
  { id: 'one_two_weeks',  label: 'מלווה אותי כבר שבוע-שבועיים' },
  { id: 'months_bg',      label: 'רקע קבוע כבר חודשים' },
  { id: 'always_like_this', label: 'היה תמיד ככה - לא זוכר תקופה אחרת' },
];

const TRIGGER_CONTEXT_OPTIONS = [
  { id: 'night_bedtime',           label: 'לילה / שכבתי לישון' },
  { id: 'weekend_empty_time',      label: 'סוף שבוע / חג / זמן ריק' },
  { id: 'after_social',            label: 'אחרי אינטראקציה חברתית (פרדוקסלית)' },
  { id: 'after_partner_talk',      label: 'אחרי שיחה / קונפליקט עם בת זוג' },
  { id: 'after_work_overload',     label: 'אחרי יום עבודה / עומס' },
  { id: 'after_social_media',      label: 'אחרי שראיתי תוכן ברשתות (אחרים נהנים יחד)' },
  { id: 'after_family',            label: 'אחרי שיחה עם משפחה' },
  { id: 'after_good_no_one_to_share', label: 'אחרי משהו טוב שהיה לי ולא היה עם מי לחלוק' },
  { id: 'no_clear_trigger',        label: 'פתאום בלי טריגר ברור' },
];

const BODY_SENSATION_OPTIONS = [
  { id: 'empty_chest_hole',        label: 'ריקנות / חור בחזה' },
  { id: 'heaviness',               label: 'כובד בחזה או בבטן' },
  { id: 'throat_pinch',            label: 'צביטה בגרון' },
  { id: 'sigh_no_release',         label: 'חוסר אוויר / אנחה שלא משחררת' },
  { id: 'restless_limbs',          label: 'אי-שקט בידיים / ברגליים - צריך לקום' },
  { id: 'urge_to_cry_stuck',       label: 'רצון לבכות שלא יוצא' },
  { id: 'cold_tremor',             label: 'קור / רעד' },
  { id: 'full_head_empty_body',    label: 'ראש "מלא" אבל גוף ריק' },
  { id: 'disconnected_numb',       label: 'אין תחושה - מנותק' },
  { id: 'fog_cant_stay_present',   label: 'ערפול / קושי להישאר נוכח' },
];

const URGE_OPTIONS = [
  { id: 'apps_aimless',         label: 'לפתוח אפליקציות / רשתות חברתיות בלי תכלית' },
  { id: 'wrong_person',         label: 'לפנות לאדם הלא-נכון (יודע מראש שזה לא יעזור או יחמיר)' },
  { id: 'eat_not_hungry',       label: 'לאכול שלא מרעב' },
  { id: 'sleep_escape',         label: 'להירדם / לברוח לשינה' },
  { id: 'content_fill',         label: 'לראות תוכן / סרט / משהו שאמלא את הריקנות' },
  { id: 'call_partner_wrong_time', label: 'להתקשר לבת זוג / קרוב גם אם זה לא הזמן' },
  { id: 'no_urge_just_sit',     label: 'אין דחף ברור - רק עצב שאני יושב עם' },
  { id: 'unsure_urge',          label: 'אני לא בטוח' },
];

const INNER_STORY_OPTIONS = [
  { id: 'everyone_else_has',      label: '"לכל האחרים יש מישהו / משהו ולי לא"' },
  { id: 'too_much_if_reach',      label: '"אם אפנה אהיה לטרח / נצמד / יותר מדי"' },
  { id: 'no_one_truly_sees',      label: '"אין מישהו שבאמת רואה אותי"' },
  { id: 'belong_to_no_group',     label: '"אני לא שייך לאף קבוצה / מעגל"' },
  { id: 'if_they_knew_real_me',   label: '"אם הם היו יודעים מי אני באמת, לא היו רוצים"' },
  { id: 'reached_didnt_get',      label: '"פניתי כבר ולא קיבלתי, אז לא עוד"' },
  { id: 'always_like_this_wont_change', label: '"זה תמיד ככה, זה לא ישתנה"' },
  { id: 'my_fault_no_bonds_built', label: '"אני בעצמי אשם - לא בניתי קשרים נכונים"' },
  { id: 'unsure_story_yet',       label: 'לא בטוח עדיין' },
];

const AGE_OPTIONS = [
  { id: 'current_age',         label: 'מרגיש כמו הגיל הנוכחי שלי' },
  { id: 'twenties',            label: 'מרגיש כמו עשרים-ומשהו (שנים אחרונות)' },
  { id: 'adolescence',         label: 'מרגיש כמו גיל ההתבגרות' },
  { id: 'elementary',          label: 'מרגיש כמו ילדות (בית ספר יסודי)' },
  { id: 'preverbal',           label: 'מרגיש מאוד צעיר - קדם-מילולי כמעט' },
  { id: 'cant_identify_age',   label: 'לא מצליח לזהות גיל' },
  {
    id: 'shifting',
    label: 'מתחלף',
    sub_input: {
      id: 'shifting_ages',
      label: 'בין אילו גילאים?',
      placeholder: 'למשל: גיל נוכחי וגם ילדות',
    },
  },
];

const REACH_OUT_OPTIONS = [
  { id: 'someone_comes_blocked',    label: 'עולה מישהו ויש לי חסם פנימי לפנות' },
  { id: 'someone_comes_not_available', label: 'עולה מישהו אבל הוא לא זמין כרגע' },
  { id: 'someone_comes_wont_see',   label: 'עולה מישהו אבל הוא לא יראה אותי באמת' },
  { id: 'someone_comes_wrong',      label: 'עולה מישהו ואני יודע שהוא האדם הלא-נכון' },
  { id: 'no_one_comes_up',          label: 'אין אף אחד שעולה לי לראש' },
  { id: 'people_come_none_fit_moment', label: 'עולים אנשים אבל אף אחד לא מתאים לרגע הזה ספציפית' },
  { id: 'dont_want_to_reach',       label: 'אני לא רוצה לפנות לאף אחד עכשיו - רק לשבת עם זה' },
];

// ── Session definition ─────────────────────────────────────────────

export const loneliness = {
  id: 'loneliness',
  label: 'בדידות',
  description: 'תחושה שלא מצליחה לנוח',
  icon: '◯',

  questions: [
    {
      id: 'loneliness_type',
      type: 'single_select',
      label: 'איזה סוג בדידות זה כרגע?',
      options: LONELINESS_TYPE_OPTIONS,
    },
    {
      id: 'duration',
      type: 'single_select',
      label: 'משך - אקוטית או כרונית?',
      options: DURATION_OPTIONS,
    },
    {
      id: 'trigger_context',
      type: 'select_with_custom',
      multi: true,
      label: 'מה מקדים את העלייה הזו?',
      options: TRIGGER_CONTEXT_OPTIONS,
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
      label: 'הדחף הכי חזק עכשיו',
      options: URGE_OPTIONS,
    },
    {
      id: 'intensity',
      type: 'scale',
      label: 'עוצמת הבדידות כרגע',
      config: {
        min: 1,
        max: 10,
        step: 1,
        polarity: 'high-bad',
        leftLabel: 'מורגשת ברקע, מתפקד',
        midLabel: 'נוכחת ומכבידה אבל סובל',
        rightLabel: 'מציפה, חייב לעשות משהו',
      },
    },
    {
      id: 'inner_story',
      type: 'select_with_custom',
      multi: true,
      label: 'הסיפור הפנימי על למה אני בודד עכשיו',
      options: INNER_STORY_OPTIONS,
    },
    {
      id: 'age',
      type: 'single_select',
      label: 'בן כמה הבדידות הזו מרגישה?',
      options: AGE_OPTIONS,
    },
    {
      id: 'reach_out',
      type: 'single_select',
      label: 'מה קורה כשאני חושב לפנות למישהו?',
      options: REACH_OUT_OPTIONS,
    },
  ],

  buildPrompt: (v, meta) => {
    const dateIso = meta?.createdAt || new Date().toISOString();

    const lonelinessType  = formatSingleSelect(v.loneliness_type, LONELINESS_TYPE_OPTIONS);
    const unseenSpecifics = isOptionSelected(v.loneliness_type, 'unseen')
      ? getSubInput(v.loneliness_type, 'unseen_specifics')
      : null;
    const duration        = formatSingleSelect(v.duration, DURATION_OPTIONS);
    const triggers        = formatBulletList(v.trigger_context, TRIGGER_CONTEXT_OPTIONS);
    const triggersCustom  = getCustomLabels(v.trigger_context);
    const body            = formatMultiSelect(v.body_sensation, BODY_SENSATION_OPTIONS);
    const urge            = formatSingleSelect(v.urge, URGE_OPTIONS);
    const intensity       = formatScale(v.intensity);
    const innerStory      = formatBulletList(v.inner_story, INNER_STORY_OPTIONS);
    const innerStoryCustom = getCustomLabels(v.inner_story);
    const age             = formatSingleSelect(v.age, AGE_OPTIONS);
    const shiftingAges    = isOptionSelected(v.age, 'shifting')
      ? getSubInput(v.age, 'shifting_ages')
      : null;
    const reachOut        = formatSingleSelect(v.reach_out, REACH_OUT_OPTIONS);

    const lines = [
      'סשן: בדידות',
      `תאריך: ${dateIso}`,
      '',
      '- סוג הבדידות -',
      `הסוג כרגע: ${lonelinessType}`,
    ];
    if (unseenSpecifics) {
      lines.push(`מה ספציפית לא נראה: ${unseenSpecifics}`);
    }
    lines.push(`משך - אקוטית או כרונית: ${duration}`);
    lines.push('מה מקדים את העלייה:');
    lines.push(triggers);
    if (triggersCustom.length > 0) {
      lines.push('');
      lines.push(`בקול שלי: ${triggersCustom.join(', ')}`);
    }
    lines.push('');
    lines.push('- איך זה מורגש -');
    lines.push(`תחושה גופנית: ${body}`);
    lines.push(`הדחף הכי חזק עכשיו: ${urge}`);
    lines.push(`עוצמה: ${intensity}`);
    lines.push('');
    lines.push('- מתחת לבדידות -');
    lines.push('הסיפור הפנימי על למה אני בודד:');
    lines.push(innerStory);
    if (innerStoryCustom.length > 0) {
      lines.push('');
      lines.push(`בקול שלי: ${innerStoryCustom.join(', ')}`);
    }
    lines.push('');
    lines.push(`בן כמה הבדידות הזו מרגישה: ${age}`);
    if (shiftingAges) {
      lines.push(`בין אילו גילאים: ${shiftingAges}`);
    }
    lines.push('');
    lines.push(`מה קורה כשאני חושב לפנות למישהו: ${reachOut}`);
    lines.push('');
    lines.push('- הוראה לקלוד -');
    lines.push('זהו סשן בדידות. עבוד איתי לפי המבנה שמוגדר בסיסטם של הפרויקט.');
    lines.push('שים לב לארבע נקודות מבניות:');
    lines.push('1) "סוג הבדידות" הוא משתנה מארגן - חסם פנימי / אני לבד / אני שונה / אני לא נראה הם ארבע סכמות שונות שדורשות עבודה שונה. אל תתייחס לבדידות כאל ישות אחת. במיוחד אל תציע "לפנות למישהו" אם הסוג הוא "אני לא נראה" - זה רק מחזק את ה-Emotional Deprivation.');
    lines.push('2) הדחפים שעולים (אפליקציות, אדם לא נכון, אוכל, גלישה) הם Detached Self-Soother - חלק שמנסה לעזור בדרך היחידה שהוא מכיר. שמע אותו בלי לבייש, גם בלי לתת לו להוביל את הסשן לפעולה.');
    lines.push('3) "בן כמה הבדידות מרגישה" הוא הציר העמוק. גיל צעיר = הבדידות הנוכחית נושאת בדידות ילדית ספציפית, ושם העבודה. גיל הנוכחי = יותר מצבי. אל תדלג על השדה הזה.');
    lines.push('4) הסיפור "זה תמיד יהיה ככה" יעלה כמעט בוודאות - זו קטסטרופיזציה של Abandonment, לא נבואה. אל תתווכח איתה ראש בראש; שמע מה היא מנסה למסור על מה שהיה ולא היה.');
    lines.push('בדידות לילית שלא נחה לא תיפתר ב"לך לישון" או "תרשום למי לפנות מחר". המטרה כאן היא להישאר *עם* - לא לפתור.');

    return lines.join('\n');
  },
};
