export const reviewQuestions = {
  child_focused: [
    'אם הילד שבך כותב לך עכשיו משפט אחד — מה הוא היה כותב?',
    'מה היה משתנה אם היית מתייחס לעצמך הילדותי כמו לחבר טוב?',
    'מה הצורך הקטן ביותר שלך השבוע שלא קיבל מקום?',
  ],
  performer: [
    'מה היית עושה השבוע אילולא הצורך להוכיח כלום?',
    'באיזה רגע השבוע נתת לעצמך לנוח בלי להצדיק?',
    'מה הקול הביצועיסטי לא רוצה שתראה?',
  ],
  sacrificer: [
    'מה ביקשת לעצמך השבוע?',
    'מי דאג לך כשאתה דאגת לאחרים?',
    'מה היית רוצה שמישהו ייתן לך, ולא ביקשת?',
  ],
  somatic: [
    'מה הגוף שלך מנסה להגיד לך עכשיו, שלא אמרת לעצמך במילים?',
    'איפה בגוף שלך גרים הרגשות שלא הופיעו השבוע?',
  ],
  general_week: [
    'איזה רגע השבוע באמת היה שלך?',
    'אם השבוע הזה היה ספר — מה הכותרת?',
    'מה היית רוצה לקחת מהשבוע, ומה להשאיר?',
  ],
  general_month: [
    'מה השתנה החודש שאתה לא בטוח אם שמת לב?',
    'מה אתה דוחה לראות?',
    'אילולא היית עורך דין / סטודנט / אחראי — מה היית עושה החודש?',
  ],
  general_90d: [
    'אם תסתכל אחורה ב-90 יום — מי האדם ההוא? איך הוא שונה ממך עכשיו?',
    'מה התחיל בלי שראית ומסתיים בלי שראית?',
  ],
};

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pickPool(aggregate) {
  const ratio = (entry, total) => (total > 0 ? (entry || 0) / total : 0);
  const totalAnalyses = Object.values(aggregate.patterns || {})[0]?.total ?? 0;
  const notEnoughRatio = ratio(aggregate.patterns?.not_enough_appeared?.count, totalAnalyses);
  const bodyRatio = ratio(aggregate.patterns?.body_as_compass?.count, totalAnalyses);
  const dominantMode = aggregate.modes?.[0]?.id;

  if (notEnoughRatio > 0.5) return 'child_focused';
  if (dominantMode === 'performer_manager') return 'performer';
  if (dominantMode === 'sacrificer_manager') return 'sacrificer';
  if (bodyRatio > 0.6) return 'somatic';
  if (aggregate.scope === 'month') return 'general_month';
  if (aggregate.scope === '90d') return 'general_90d';
  return 'general_week';
}

export function selectQuestion(aggregate) {
  const poolKey = pickPool(aggregate);
  const pool = reviewQuestions[poolKey] || reviewQuestions.general_week;
  // Deterministic seed: scope + week-of-year — same review shows same question on re-open within week.
  const weekNum = Math.floor(Date.now() / (7 * 86400000));
  const seed = `${aggregate.scope}-${weekNum}-${poolKey}`;
  const idx = hash(seed) % pool.length;
  return { question: pool[idx], poolKey };
}
