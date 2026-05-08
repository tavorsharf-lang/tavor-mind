// THE CORE — the vulnerable child at the center
export const coreMode = {
  id: 'exiled_child',
  label: 'הילד שלא מספיק חשוב',
  subtitle: 'הגרעין',
  role: 'החלק שמרגיש לא נראה, לא מספיק, לא רצוי',
  description: 'הוא הקול הכי שקט אבל הכי עמוק. הוא לא מדבר ישירות — הוא נמצא מתחת לכל הקולות האחרים. כל ארבעת המגנים נבנו כדי להגן עליו.',
  cue: '"אני לא מספיק חשוב. אני לא מספיק מעניין. אף אחד לא יבחר בי."',
  triggers: ['ביקורת', 'דחייה', 'חוסר הכלה', 'מצבי השוואה', 'רגעים של פגיעות'],
  what_he_needs: 'להיראות. בלי לעשות. בלי להוכיח. רק נוכחות.',
  healthy_response: 'יד על הלב. פנימה: "אני רואה אותך. מותר לך להרגיש ככה. אני כאן."',
  color: '#C4A79A',
};

// THE PROTECTORS — four managers built around the core
export const protectorModes = [
  {
    id: 'performer_manager',
    label: 'המנהל הביצועיסט',
    role: 'אם אהיה הכי טוב — לא יוכלו לדחות אותי',
    fed_by: 'סטנדרטים בלתי מתפשרים',
    cue: '"זה לא מספיק טוב. אני יכול יותר. אסור לי לעצור."',
    triggers: ['רגעי מנוחה', 'טעויות קטנות', 'השוואה לאחרים', 'תחושת נחיתות'],
    automatic_response: 'דחיפה לעוד עבודה, ביקורת עצמית, אשמה על הפסקה',
    healthy_alternative: 'להבחין שהקול הזה לא "אני" — הוא תפקיד שנבנה כדי להגן על הילד שלא מספיק חשוב. לעצור: "אני לא צריך להוכיח עכשיו. הילד צריך מקום, לא ביצועים."',
    color: '#A77B6E',
  },
  {
    id: 'sacrificer_manager',
    label: 'המקריב',
    role: 'אם אתן הכל — לא יעזבו אותי',
    fed_by: 'הקרבה עצמית',
    cue: '"אני חייב להיות שם בשבילם. אסור לי לאכזב. הצורך שלהם קודם לשלי."',
    triggers: ['בקשת עזרה ממישהו', 'אמירת "לא"', 'תחושה שמישהו צריך אותי'],
    automatic_response: 'נתינה אוטומטית, ויתור על צרכים, השתקת התסכול',
    healthy_alternative: 'לשאול לפני כל נתינה: "אני נותן כי אני רוצה, או כי אני מפחד ממה שיקרה אם לא? והאם נתתי לעצמי היום מה שאני נותן עכשיו לאחר?"',
    color: '#9B8A7A',
  },
  {
    id: 'guard_manager',
    label: 'המגן החשדן',
    role: 'אם אזהה סכנה מראש — לא אפגע',
    fed_by: 'חוסר אמון',
    cue: '"בסוף הוא יאכזב. אני לא יכול באמת לסמוך. עדיף מרחק."',
    triggers: ['רגעי קרבה רגשית', 'בקשת עזרה', 'שיתוף פגיעות'],
    automatic_response: 'סריקה אקטיבית של סימני סכנה, בנייה של מרחק רגשי, "אני אסתדר לבד"',
    healthy_alternative: 'לסמוך מדורגות. לא "סמוך על כולם" אלא "בוא ננסה צעד אחד עם אדם אחד בטוח, ונראה מה קורה". אמון נבנה בקטן.',
    color: '#7A8A95',
  },
  {
    id: 'approval_seeker',
    label: 'מחפש האישור',
    role: 'אם אקבל אישור — ארגיש בסדר',
    fed_by: 'חיפוש אישור',
    cue: '"מה הוא חשב על מה שאמרתי? אני צריך להוכיח את עצמי."',
    triggers: ['ביקורת', 'הצלחה של אחר', 'רשתות חברתיות', 'מצבים של חשיפה'],
    automatic_response: 'התאמה לציפיות, חיפוש מחמאות, רגישות יתר לתגובות',
    healthy_alternative: 'הערך שלי לא תלוי במי שמסתכל. רוב הזמן — אני יודע מה עשיתי היום. זה מספיק. אם הילד צריך לשמוע "אתה מספיק" — אני יכול לתת לו את זה.',
    color: '#9C8FA3',
  },
];

// THE WITNESS — sits above, not within the circle
export const healthyAdult = {
  id: 'healthy_adult',
  label: 'המבוגר הבריא',
  subtitle: 'העֵד',
  role: 'הצד שמודע לכל החלקים — בלי להיבלע באף אחד מהם',
  description: 'הוא לא נלחם במגנים ולא מתעלם מהילד. הוא רואה אותם. הוא יודע שהמנהל הביצועיסט הוא לא "אני" — הוא תפקיד. ושהילד שלא מספיק חשוב הוא חלק ממני שראוי לקשב, לא חלק שצריך לתקן.',
  cue: '"אני רואה מה קורה כאן. אני אדאג לעצמי עכשיו, וזה בסדר."',
  triggers: ['אינו מופעל אוטומטית — נבנה במודעות'],
  automatic_response: 'אינו אוטומטי — דורש זיהוי הקולות האחרים והפרדה מהם',
  healthy_alternative: 'הוא עצמו האלטרנטיבה. כל פעם שאתה מזהה את אחד הקולות האחרים בלי להיות הוא — המבוגר הבריא נכנס.',
  color: '#5C8A6B',
};

// Flat list — used by ModeCheck (Step 5) and ToolHistory label lookup.
// Order mirrors the hierarchy shown in ModesMap (witness on top, protectors, core at bottom).
export const modes = [healthyAdult, ...protectorModes, coreMode];

// Short-id list used by EmergencyFlow Phase 4 multi-select.
// Order is fixed: 4 protectors first, exile last. Do not reorder.
export const MODES = [
  {
    id: 'manager',
    label: 'המנהל הביצועיסט',
    role: 'protector',
    description: 'הקול שדורש שלמות, שאומר "זה לא מספיק", שמשווה אותך לסטנדרט שלא מגיעים אליו. מופיע במיוחד אחרי שעשית הרבה.',
    healthyAdultMessage: 'אני רואה כמה אתה משקיע. עכשיו לא צריך להוכיח כלום — אתה יכול פשוט להיות פה.',
  },
  {
    id: 'sacrificer',
    label: 'המקריב',
    role: 'protector',
    description: 'הקול שאומר "תוותר, הם יותר חשובים", שמרגיש אשמה כשאתה דואג לעצמך. מופיע כשמישהו אחר צריך משהו ממך.',
    healthyAdultMessage: 'שאתה דואג לאחרים זה אמיתי. גם הצרכים שלך אמיתיים. אפשר להחזיק את שניהם בלי לבחור.',
  },
  {
    id: 'guardian',
    label: 'המגן החשדן',
    role: 'protector',
    description: 'הקול שאומר "אל תסמוך, הם יפגעו", ששומר אותך במרחק. מופיע ברגעי קרבה, או כשמישהו מציע עזרה.',
    healthyAdultMessage: 'החלק הזה למד להגן עליך, ויש לו סיבה. אני פה איתו עכשיו, ויחד נבדוק אם הסכנה ברגע הזה אמיתית.',
  },
  {
    id: 'approval',
    label: 'מחפש האישור',
    role: 'protector',
    description: 'הקול שמודד את הערך שלך לפי תגובות של אחרים. שואל "איך זה נשמע?", "הרשמתי?". מופיע אחרי מפגש, הודעה, או החלטה.',
    healthyAdultMessage: 'מה שאתה מרגיש עכשיו אמיתי, גם בלי שמישהו יראה אותו. אין צורך באישור כדי שזה ייחשב.',
  },
  {
    id: 'exile',
    label: 'הילד שלא מספיק חשוב',
    role: 'exile',
    description: 'החלק הצעיר שמרגיש שהוא לא מספיק חשוב, שצריך לעבוד כדי להיחשב. הוא נמצא מתחת לכל המגנים, וצף ברגעי פגיעות עמוקה.',
    healthyAdultMessage: 'אני רואה אותך. אתה חשוב לי גם בלי שתעשה כלום, גם עכשיו, ככה.',
  },
];

export const fourAxes = {
  title: '4 הצירים לחיזוק המבוגר הבריא',
  intro: 'מה לתת עליו דעת ביומיום:',
  axes: [
    {
      n: 1,
      title: 'לזהות את ההורה התובעני בזמן אמת',
      body: 'הקול הזה מרגיש כמו "אני" כי הוא קיים מאז ילדות. הרגע שתזהה — "זה לא אני, זה ההורה התובעני" — הוא הרגע שהמבוגר הבריא נכנס.',
    },
    {
      n: 2,
      title: 'לתת מקום לילד הפגיע',
      body: 'שלושה מודים "שומרים" עליו — וכך הוא לא מקבל מקום. שים לב לרגעים שאתה אומר "אני בסדר" אוטומטית. שאל אם זה באמת נכון.',
    },
    {
      n: 3,
      title: 'להבחין בין נתינה בריאה לכפייתית',
      body: 'אתה אדם שנותן — וזה יפה. השאלה לפני כל נתינה: "אני עושה את זה כי אני רוצה, או כי אני מפחד ממה שיקרה אם לא?"',
    },
    {
      n: 4,
      title: 'לסמוך מדורגות',
      body: 'לא "סמוך על כולם" — "בוא נבדוק לאט". לשתף רגש קטן עם אדם בטוח, לראות מה קורה, ולבנות אמון בהדרגה.',
    },
  ],
};

// Legacy ID migration map — for sessions saved before the meta-analysis update
// + short ids used by EmergencyFlow Phase 4 (MODES export above).
export const legacyModeMap = {
  'demanding_parent': 'performer_manager',     // closest match — both are the inner critic
  'vulnerable_child': 'exiled_child',          // direct rename — same concept
  'detached_protector': 'guard_manager',       // closest match — both create distance
  'compliant_giver': 'sacrificer_manager',     // closest match — both over-give
  'healthy_adult': 'healthy_adult',            // unchanged
  'manager': 'performer_manager',              // EmergencyFlow short id
  'sacrificer': 'sacrificer_manager',
  'guardian': 'guard_manager',
  'approval': 'approval_seeker',
  'exile': 'exiled_child',
};

/**
 * Resolves a mode id to its current canonical id.
 * Handles legacy ids from before the meta-analysis update.
 * Returns null if the id is unknown (e.g., custom or corrupted data).
 */
export function resolveModeId(id) {
  if (!id) return null;
  if (modes.find((m) => m.id === id)) return id;
  return legacyModeMap[id] || null;
}

/**
 * Resolves a mode id to its full mode object (or null).
 * Use this anywhere you need to render a label/color from a stored id.
 */
export function getModeById(id) {
  const canonical = resolveModeId(id);
  if (!canonical) return null;
  return modes.find((m) => m.id === canonical) || null;
}
