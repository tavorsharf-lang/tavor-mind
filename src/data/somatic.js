// Somatic regulation toolkit — body-based exercises that complement the
// cognitive tools (triggers / mode-check / catastrophe). Each exercise has a
// short and long variant so the user can pick the dose that fits the moment.
//
// `animation` keys map to components in screens/tools/components/somatic/SomaticAnimations.jsx.
// `forActivation` is used by SomaticHub for filtering and by the activation→exercise maps below.

export const SOMATIC_EXERCISES = [
  {
    id: 'physio_sigh',
    title: 'אנחה פיזיולוגית',
    subtitle: 'שתי שאיפות ונשיפה אחת ארוכה',
    why: 'מאפס את מערכת העצבים — הכי מהיר שיש',
    forActivation: ['hyper', 'mid'],
    short: { durationSec: 30, label: 'קצר · 30 שניות' },
    long:  { durationSec: 90, label: 'ארוך · דקה וחצי' },
    instructions: [
      'שאיפה ראשונה דרך האף',
      'שאיפה קצרה נוספת — תמלא קצת יותר',
      'נשיפה ארוכה דרך הפה',
    ],
    animation: 'physio_sigh',
  },
  {
    id: 'butterfly_hug',
    title: 'חיבוק פרפר',
    subtitle: 'הצלבת ידיים על החזה, טפיחות סירוגין',
    why: 'גירוי דו-צדדי — מרגיע את האמיגדלה (EMDR-מבוסס)',
    forActivation: ['hyper', 'mid', 'hypo'],
    short: { durationSec: 60,  label: 'קצר · דקה' },
    long:  { durationSec: 180, label: 'ארוך · 3 דקות' },
    instructions: [
      'הצלב ידיים על החזה',
      'טפיחות עדינות לסירוגין',
      'קצב איטי, אחת בשנייה',
    ],
    animation: 'butterfly',
  },
  {
    id: 'cold_anchor',
    title: 'עיגון קר',
    subtitle: 'מים קרים על פנים או ידיים',
    why: 'mammalian dive reflex — מוריד דופק ב-10 עד 15 פעימות',
    forActivation: ['hyper'],
    short: { durationSec: 30, label: 'קצר · 30 שניות' },
    long:  { durationSec: 90, label: 'ארוך · דקה וחצי' },
    instructions: [
      'מים קרים מהברז על פרקי הידיים',
      'או — שטוף פנים, התרכז סביב העיניים',
      'נשום רגיל תוך כדי',
    ],
    animation: null,
  },
  {
    id: 'vagal_humming',
    title: 'המהום',
    subtitle: 'נשיפה ארוכה עם המהום',
    why: 'מפעיל את עצב הואגוס דרך מיתרי הקול',
    forActivation: ['hypo', 'mid'],
    short: { durationSec: 30, label: 'קצר · 30 שניות' },
    long:  { durationSec: 90, label: 'ארוך · דקה וחצי' },
    instructions: [
      'שאיפה דרך האף',
      'נשיפה ארוכה עם "מממ"',
      'תרגיש רטט בחזה',
    ],
    animation: 'vagal',
  },
  {
    id: 'body_scan',
    title: 'סריקת גוף קצרה',
    subtitle: '7 נקודות',
    why: 'מחזיר אותך לגוף כשאתה במחשבות',
    forActivation: ['hypo', 'mid'],
    short: { durationSec: 70,  label: 'קצר · דקה' },
    long:  { durationSec: 140, label: 'ארוך · 2 דקות' },
    instructions: ['ראש', 'לסת', 'כתפיים', 'חזה', 'בטן', 'ידיים', 'רגליים'],
    animation: 'bodyscan',
  },
];

// Phase 2 hyper pre-step — short physio sigh before the breathing exercise.
export const ACTIVATION_TO_PRESTEP_SOMATIC = {
  hyper: 'physio_sigh',
};

// Phase 6 closing referral — different from prestep so hyper users get variety.
export const ACTIVATION_TO_CLOSE_SOMATIC = {
  hyper: 'butterfly_hug',
  mid:   'physio_sigh',
  hypo:  'vagal_humming',
};

export const getSomaticExercise = (id) => SOMATIC_EXERCISES.find((e) => e.id === id);

export const somaticTitle = (id) => getSomaticExercise(id)?.title ?? id;
