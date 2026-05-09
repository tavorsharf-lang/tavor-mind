export const EMOTIONS = [
  // 1 — רע מאוד
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

  // 2 — רע (חלק חופפים גם ל-1)
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
  { id: 'tired', label: 'עייף', valences: [2, 3] },
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
  { id: 'restless', label: 'חסר מנוחה', valences: [2, 3] },
  { id: 'confused', label: 'מבולבל', valences: [2, 3] },
  { id: 'impatient', label: 'חסר סבלנות', valences: [2] },
  { id: 'unseen', label: 'לא רואים אותי', valences: [1, 2] },

  // 3 — ניטרלי
  { id: 'calm', label: 'רגוע', valences: [3, 4] },
  { id: 'quiet', label: 'שקט', valences: [3, 4] },
  { id: 'stable', label: 'יציב', valences: [3, 4] },
  { id: 'present', label: 'נוכח', valences: [3, 4, 5] },
  { id: 'aware', label: 'מודע', valences: [3, 4] },
  { id: 'reflective', label: 'מהורהר', valences: [3] },
  { id: 'observing', label: 'מתבונן', valences: [3] },
  { id: 'curious', label: 'סקרן', valences: [3, 4] },
  { id: 'hesitant', label: 'מהוסס', valences: [2, 3] },
  { id: 'measured', label: 'מחושב', valences: [3] },
  { id: 'focused', label: 'מרוכז', valences: [3, 4] },
  { id: 'reserved', label: 'מאופק', valences: [3] },
  { id: 'open', label: 'פתוח', valences: [3, 4, 5] },
  { id: 'neutral', label: 'נייטרלי', valences: [3] },
  { id: 'ordinary', label: 'רגיל', valences: [3] },
  { id: 'foggy', label: 'ערפילי', valences: [2, 3] },
  { id: 'stuck', label: 'תקוע', valences: [2, 3] },
  { id: 'detached', label: 'מנותק', valences: [2, 3] },
  { id: 'absent', label: 'לא נוכח', valences: [2, 3] },
  { id: 'floating', label: 'מרחף', valences: [3] },
  { id: 'on_autopilot', label: 'אוטומטי', valences: [2, 3] },

  // 4 — טוב
  { id: 'good', label: 'טוב', valences: [4] },
  { id: 'content', label: 'מרוצה', valences: [4, 5] },
  { id: 'at_ease', label: 'נינוח', valences: [3, 4] },
  { id: 'comfortable', label: 'נוח', valences: [4] },
  { id: 'warm', label: 'חם', valences: [4, 5] },
  { id: 'connected', label: 'מחובר', valences: [4, 5] },
  { id: 'understood', label: 'מובן', valences: [4, 5] },
  { id: 'seen', label: 'רואים אותי', valences: [4, 5] },
  { id: 'appreciated', label: 'מוערך', valences: [4, 5] },
  { id: 'grateful', label: 'אסיר תודה', valences: [4, 5] },
  { id: 'loving', label: 'אוהב', valences: [4, 5] },
  { id: 'loved', label: 'אהוב', valences: [4, 5] },
  { id: 'accepting', label: 'מקבל', valences: [4] },
  { id: 'forgiving', label: 'סלחני', valences: [4] },
  { id: 'brave', label: 'אמיץ', valences: [4, 5] },
  { id: 'whole', label: 'שלם', valences: [4, 5] },
  { id: 'balanced', label: 'מאוזן', valences: [4] },
  { id: 'at_home', label: 'ביתי', valences: [4] },
  { id: 'interested', label: 'מעוניין', valences: [3, 4] },
  { id: 'hopeful', label: 'מלא תקווה', valences: [4, 5] },
  { id: 'inspired', label: 'מלא השראה', valences: [4, 5] },
  { id: 'proud', label: 'גאה', valences: [4, 5] },
  { id: 'satisfied', label: 'מסופק', valences: [4] },
  { id: 'enough', label: 'מספיק', valences: [4, 5] },
  { id: 'self_seeing', label: 'רואה את עצמי', valences: [4, 5] },
  { id: 'self_accepting', label: 'מקבל את עצמי', valences: [4, 5] },

  // 5 — מעולה
  { id: 'happy', label: 'שמח', valences: [4, 5] },
  { id: 'excited', label: 'נרגש', valences: [4, 5] },
  { id: 'enthusiastic', label: 'מתלהב', valences: [5] },
  { id: 'energetic', label: 'אנרגטי', valences: [4, 5] },
  { id: 'flourishing', label: 'פורח', valences: [5] },
  { id: 'alive', label: 'חי', valences: [4, 5] },
  { id: 'deeply_connected', label: 'מחובר עמוק', valences: [5] },
  { id: 'elated', label: 'מרומם', valences: [5] },
  { id: 'flooded_good', label: 'מוצף בטוב', valences: [5] },
  { id: 'strong', label: 'חזק', valences: [4, 5] },
  { id: 'free', label: 'חופשי', valences: [4, 5] },
  { id: 'full', label: 'מלא', valences: [4, 5] },
  { id: 'fully_present', label: 'נוכח לחלוטין', valences: [5] },
  { id: 'belonging', label: 'שייך', valences: [4, 5] },
  { id: 'in_love', label: 'מאוהב', valences: [5] },
  { id: 'self_known', label: 'ידוע לעצמי', valences: [4, 5] },
];

export const VALENCE_LABELS = {
  1: 'רע מאוד',
  2: 'רע',
  3: 'ניטרלי',
  4: 'טוב',
  5: 'מעולה',
};

export const VALENCE_COLORS = {
  1: '#FF3B30',
  2: '#FF8A2A',
  3: '#FFB938',
  4: '#34A86A',
  5: '#0A84FF',
};

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
