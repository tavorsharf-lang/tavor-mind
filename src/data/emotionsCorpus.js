// Valence scale: 1-7 (DS3 "pleasant scale", inspired by Apple Health State of Mind).
// In RTL UI, value 1 sits visually on the RIGHT (unpleasant) and value 7 on the
// LEFT (pleasant). Older stored entries used a 1-5 scale — `migrateValence()`
// below expands them deterministically (1→1, 2→2, 3→4, 4→6, 5→7).

export const EMOTIONS = [
  // 1 — מאוד לא נעים
  { id: 'very_sad', label: 'עצוב מאוד', valences: [1] },
  { id: 'hopeless', label: 'מיואש', valences: [1] },
  { id: 'empty', label: 'ריק', valences: [1] },
  { id: 'no_hope', label: 'חסר תקווה', valences: [1] },
  { id: 'no_energy', label: 'חסר כוח', valences: [1] },
  { id: 'abandoned', label: 'נטוש', valences: [1] },
  { id: 'wounded', label: 'פגוע עמוק', valences: [1] },
  { id: 'terrified', label: 'מבועת', valences: [1] },
  { id: 'very_anxious', label: 'חרד מאוד', valences: [1] },
  { id: 'overwhelmed', label: 'מוצף', valences: [1] },
  { id: 'broken', label: 'נשבר', valences: [1] },
  { id: 'trapped', label: 'לכוד', valences: [1] },
  { id: 'lost', label: 'אבוד', valences: [1] },
  { id: 'helpless', label: 'חסר אונים', valences: [1] },
  { id: 'grief', label: 'אבל', valences: [1] },
  { id: 'deeply_ashamed', label: 'מבויש מאוד', valences: [1] },
  { id: 'self_loathing', label: 'מתעב את עצמי', valences: [1] },

  // 2 — לא נעים
  { id: 'sad', label: 'עצוב', valences: [1, 2] },
  { id: 'frustrated', label: 'מתוסכל', valences: [2] },
  { id: 'disappointed', label: 'מאוכזב', valences: [2] },
  { id: 'hurt', label: 'פגוע', valences: [1, 2] },
  { id: 'worried', label: 'דאוג', valences: [2] },
  { id: 'anxious', label: 'חרד', valences: [2] },
  { id: 'stressed', label: 'לחוץ', valences: [2] },
  { id: 'irritated', label: 'עצבני', valences: [2] },
  { id: 'angry', label: 'כועס', valences: [2] },
  { id: 'embarrassed', label: 'נבוך', valences: [2] },
  { id: 'guilty', label: 'אשם', valences: [2] },
  { id: 'ashamed', label: 'מבויש', valences: [2] },
  { id: 'jealous', label: 'קנאי', valences: [2] },
  { id: 'lonely', label: 'בודד', valences: [1, 2] },
  { id: 'insecure', label: 'חסר ביטחון', valences: [2] },
  { id: 'exhausted', label: 'מותש', valences: [1, 2] },
  { id: 'burned_out', label: 'שחוק', valences: [1, 2] },
  { id: 'heavy', label: 'כבד', valences: [2] },
  { id: 'drained', label: 'מרוקן', valences: [2] },
  { id: 'craving_validation', label: 'צמא לאישור', valences: [2] },
  { id: 'fear_abandonment', label: 'פוחד שיעזבו', valences: [1, 2] },
  { id: 'not_enough', label: 'לא מספיק טוב', valences: [2] },
  { id: 'self_disappointed', label: 'מאוכזב מעצמי', valences: [2] },
  { id: 'self_frustrated', label: 'מתוסכל מעצמי', valences: [2] },
  { id: 'used', label: 'מנוצל', valences: [2] },
  { id: 'depleted_giving', label: 'מותש מנתינה', valences: [2] },
  { id: 'silent_resentment', label: 'טינה שקטה', valences: [2] },
  { id: 'unseen', label: 'לא רואים אותי', valences: [1, 2] },

  // 3 — מעט לא נעים
  { id: 'tired', label: 'עייף', valences: [2, 3] },
  { id: 'restless', label: 'חסר מנוחה', valences: [3] },
  { id: 'confused', label: 'מבולבל', valences: [3] },
  { id: 'impatient', label: 'חסר סבלנות', valences: [2, 3] },
  { id: 'hesitant', label: 'מהוסס', valences: [2, 3] },
  { id: 'foggy', label: 'ערפילי', valences: [3] },
  { id: 'stuck', label: 'תקוע', valences: [2, 3] },
  { id: 'detached', label: 'מנותק', valences: [3] },
  { id: 'absent', label: 'לא נוכח', valences: [3] },
  { id: 'on_autopilot', label: 'אוטומטי', valences: [3, 4] },

  // 4 — ניטרלי
  { id: 'neutral', label: 'נייטרלי', valences: [4] },
  { id: 'ordinary', label: 'רגיל', valences: [4] },
  { id: 'quiet', label: 'שקט', valences: [4, 5] },
  { id: 'stable', label: 'יציב', valences: [4, 5] },
  { id: 'observing', label: 'מתבונן', valences: [4] },
  { id: 'reflective', label: 'מהורהר', valences: [4] },
  { id: 'reserved', label: 'מאופק', valences: [4] },
  { id: 'measured', label: 'מחושב', valences: [4] },
  { id: 'floating', label: 'מרחף', valences: [4] },
  { id: 'aware', label: 'מודע', valences: [4, 5] },
  { id: 'present', label: 'נוכח', valences: [4, 5, 6] },

  // 5 — מעט נעים
  { id: 'calm', label: 'רגוע', valences: [5] },
  { id: 'at_ease', label: 'נינוח', valences: [5] },
  { id: 'focused', label: 'מרוכז', valences: [5] },
  { id: 'curious', label: 'סקרן', valences: [5, 6] },
  { id: 'open', label: 'פתוח', valences: [5, 6] },
  { id: 'interested', label: 'מעוניין', valences: [5] },
  { id: 'comfortable', label: 'נוח', valences: [5, 6] },
  { id: 'balanced', label: 'מאוזן', valences: [5] },
  { id: 'accepting', label: 'מקבל', valences: [5, 6] },
  { id: 'forgiving', label: 'סלחני', valences: [5, 6] },
  { id: 'at_home', label: 'ביתי', valences: [5, 6] },

  // 6 — נעים
  { id: 'good', label: 'טוב', valences: [6] },
  { id: 'content', label: 'מרוצה', valences: [6] },
  { id: 'warm', label: 'חם', valences: [6, 7] },
  { id: 'connected', label: 'מחובר', valences: [6, 7] },
  { id: 'understood', label: 'מובן', valences: [6, 7] },
  { id: 'seen', label: 'רואים אותי', valences: [6, 7] },
  { id: 'appreciated', label: 'מוערך', valences: [6, 7] },
  { id: 'grateful', label: 'אסיר תודה', valences: [6, 7] },
  { id: 'loving', label: 'אוהב', valences: [6, 7] },
  { id: 'loved', label: 'אהוב', valences: [6, 7] },
  { id: 'brave', label: 'אמיץ', valences: [6, 7] },
  { id: 'whole', label: 'שלם', valences: [6, 7] },
  { id: 'hopeful', label: 'מלא תקווה', valences: [6, 7] },
  { id: 'satisfied', label: 'מסופק', valences: [6] },
  { id: 'enough', label: 'מספיק', valences: [6, 7] },
  { id: 'self_seeing', label: 'רואה את עצמי', valences: [6, 7] },
  { id: 'self_accepting', label: 'מקבל את עצמי', valences: [6, 7] },
  { id: 'inspired', label: 'מלא השראה', valences: [6, 7] },
  { id: 'proud', label: 'גאה', valences: [6, 7] },

  // 7 — מאוד נעים
  { id: 'happy', label: 'שמח', valences: [6, 7] },
  { id: 'excited', label: 'נרגש', valences: [7] },
  { id: 'enthusiastic', label: 'מתלהב', valences: [7] },
  { id: 'energetic', label: 'אנרגטי', valences: [7] },
  { id: 'flourishing', label: 'פורח', valences: [7] },
  { id: 'alive', label: 'חי', valences: [7] },
  { id: 'deeply_connected', label: 'מחובר עמוק', valences: [7] },
  { id: 'elated', label: 'מרומם', valences: [7] },
  { id: 'flooded_good', label: 'מוצף בטוב', valences: [7] },
  { id: 'strong', label: 'חזק', valences: [6, 7] },
  { id: 'free', label: 'חופשי', valences: [6, 7] },
  { id: 'full', label: 'מלא', valences: [6, 7] },
  { id: 'fully_present', label: 'נוכח לחלוטין', valences: [7] },
  { id: 'belonging', label: 'שייך', valences: [6, 7] },
  { id: 'in_love', label: 'מאוהב', valences: [7] },
  { id: 'self_known', label: 'ידוע לעצמי', valences: [6, 7] },
];

export const VALENCE_LABELS = {
  1: 'מאוד לא נעים',
  2: 'לא נעים',
  3: 'מעט לא נעים',
  4: 'ניטרלי',
  5: 'מעט נעים',
  6: 'נעים',
  7: 'מאוד נעים',
};

// Right→Left in RTL: 1=red (unpleasant) → 7=warm orange (pleasant).
// Middle (4) is a calm grass-green; the warm side intentionally avoids yellow
// so the "pleasant" pole reads as warmth, not warning.
export const VALENCE_COLORS = {
  1: '#FF3B30', // red — מאוד לא נעים
  2: '#AF52DE', // purple — לא נעים
  3: '#0A84FF', // blue — מעט לא נעים
  4: '#34A86A', // green — ניטרלי
  5: '#A8C547', // yellow-green — מעט נעים
  6: '#FFB347', // light orange — נעים
  7: '#FF7A1F', // deep orange — מאוד נעים
};

export const VALENCE_MIN = 1;
export const VALENCE_MAX = 7;

// Migrate a legacy 1-5 valence to the 1-7 scale. New entries written from
// 2026-05 onward carry `valenceVersion: 2`; everything else is assumed to be
// the old 1-5 scheme.
const LEGACY_TO_V2 = { 1: 1, 2: 2, 3: 4, 4: 6, 5: 7 };
export function migrateValence(v, version) {
  if (v == null) return v;
  const n = Number(v);
  if (!Number.isFinite(n)) return v;
  if (version === 2 || version === '2') return Math.round(n);
  if (n >= 1 && n <= 5 && Number.isInteger(n)) {
    return LEGACY_TO_V2[n] ?? n;
  }
  return Math.round(n);
}

export function normalizeEntryValence(entry) {
  if (!entry || typeof entry !== 'object' || entry.valence == null) return entry;
  if (entry.valenceVersion === 2) return entry;
  return { ...entry, valence: migrateValence(entry.valence, 1), valenceVersion: 2 };
}

export function getEmotionsForValence(valence) {
  return EMOTIONS.filter((e) => e.valences.includes(valence));
}

export function getEmotionById(id) {
  return EMOTIONS.find((e) => e.id === id);
}

export function emotionLabelById(id) {
  const e = getEmotionById(id);
  return e ? e.label : id;
}
