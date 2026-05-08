// Flat list of all available mindfulness recordings.
// Used by MindfulnessHub for direct access, and by emergencyMeditationMap.js
// to map activation states (hyper/hypo/mid) to a recording.
// MP3 files live in public/audio/ and are served from BASE_URL/audio/.
const base = import.meta.env.BASE_URL;

export const MEDITATIONS = [
  {
    id: 'morning-short',
    src: `${base}audio/meditation-morning-short.mp3`,
    title: 'בוקר קצר',
    subtitle: 'פתיחה רכה ליום',
    description: 'התחברות שקטה לרגע הזה כדי להתחיל את היום מתוך ריכוז ונחת במקום מתוך לחץ.',
  },
  {
    id: 'morning-long',
    src: `${base}audio/meditation-morning-long.mp3`,
    title: 'בוקר ארוך',
    subtitle: 'פתיחה מלאה ליום',
    description: 'בניית אנרגיה חיובית דרך הצבת כוונות (Intentions) וויזואליזציה של המשימות שמחכות לך בהצלחה.',
  },
  {
    id: 'on-edge-short',
    src: `${base}audio/meditation-on-edge-short.mp3`,
    title: 'על הסף קצר',
    subtitle: 'רגע לפני שמשהו עולה',
    description: 'שימוש בנשימה כעוגן מיידי כדי לייצר מרחק בטחון מהמחשבות הטורדניות שרצות בראש.',
  },
  {
    id: 'activated-short',
    src: `${base}audio/meditation-activated-short.mp3`,
    title: 'הופעלתי קצר',
    subtitle: 'להוריד את האש',
    description: 'סריקה מהירה של איברי הגוף להחזרת הקשב מהראש אל הפיזיולוגיה והרגעת הדופק.',
  },
  {
    id: 'depleted-short',
    src: `${base}audio/meditation-depleted-short.mp3`,
    title: 'מרוקן קצר',
    subtitle: 'להזכיר שאתה כאן',
    description: 'דמיון מודרך קליל ליצירת "דף חלק" בראש והתנעה מחודשת של האנרגיה הפנימית.',
  },
  {
    id: 'mid',
    src: `${base}audio/meditation-mid.mp3`,
    title: 'מדיטציית איזון',
    subtitle: 'לחזור לעצמך',
    description: 'תרגול אקטיבי של התבוננות במחשבות כ"עננים חולפים" ולימוד טכניקות לשחרור חשיבת יתר.',
  },
  {
    id: 'hyper',
    src: `${base}audio/meditation-hyper.mp3`,
    title: 'סריקת גוף',
    subtitle: 'לפזר את האקטיבציה',
    description: 'תרגול ממושך ויסודי של מודעות לכל תחושה בגוף להורדה משמעותית של רמת המתח והעוררות.',
  },
  {
    id: 'hypo',
    src: `${base}audio/meditation-hypo.mp3`,
    title: 'מדיטציית התעוררות עדינה',
    subtitle: 'להחזיר תחושה',
    description: 'עבודה רגשית עמוקה על חמלה עצמית, תוך שימוש בהצהרות חיוביות לקבלה עצמית ללא מאמץ.',
  },
];

export const MEDITATIONS_BY_ID = Object.fromEntries(MEDITATIONS.map((m) => [m.id, m]));
