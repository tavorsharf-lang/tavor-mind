export const distortions = [
  { id: 'all_or_nothing', label: 'הכל-או-כלום', cue: 'בלי אזורי אפור — או הצלחה גמורה או כישלון מוחלט' },
  { id: 'overgeneralization', label: 'הכללת יתר', cue: 'מאירוע אחד למסקנה גורפת ("תמיד", "אף פעם")' },
  { id: 'mental_filter', label: 'שליליות', cue: 'התמקדות רק במה שלא עבד' },
  { id: 'mind_reading', label: 'קריאת מחשבות', cue: 'הנחה שאתה יודע מה האחר חושב' },
  { id: 'catastrophizing', label: 'קטסטרופיזציה', cue: 'הקפיצה לתרחיש הגרוע ביותר' },
  { id: 'fortune_telling', label: 'התמקדות בעתיד', cue: 'ידיעה כאילו של מה שיקרה בעתיד' },
  { id: 'should_must', label: 'חייב/אסור', cue: 'דרישות נוקשות מעצמך או מאחרים' },
  { id: 'personalization', label: 'לוקח על עצמי', cue: 'לקיחת אחריות על מה שלא שלך' },
];

export const distortionLabel = (id) => distortions.find((d) => d.id === id)?.label ?? id;

export const BODY_SENSATIONS = [
  { id: 'warmth_face', label: 'חום בפנים' },
  { id: 'chest_pressure', label: 'לחץ בחזה' },
  { id: 'fast_heartbeat', label: 'פעימות מהירות' },
  { id: 'breathless', label: 'חוסר אוויר' },
  { id: 'hand_tremor', label: 'רטט בידיים' },
  { id: 'shoulder_tension', label: 'מתח בכתפיים' },
  { id: 'heaviness', label: 'כובד' },
  { id: 'emptiness', label: 'תחושת ריקנות' },
  { id: 'nausea', label: 'בחילה' },
  { id: 'mental_fog', label: 'בלבול בראש' },
  { id: 'dizziness', label: 'סחרחורת' },
  { id: 'racing_thoughts', label: 'ריצה של מחשבות' },
  { id: 'numbness', label: 'חוסר תחושה / ניתוק' },
];

export const sensationLabel = (id) => BODY_SENSATIONS.find((s) => s.id === id)?.label ?? id;
