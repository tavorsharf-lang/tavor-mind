const HEBREW_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

const ISRAEL_TZ = 'Asia/Jerusalem';

function israelParts(d = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: ISRAEL_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const parts = fmt.formatToParts(d);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return {
    year: parseInt(get('year'), 10),
    month: parseInt(get('month'), 10),
    day: parseInt(get('day'), 10),
    hour: parseInt(get('hour'), 10),
    minute: parseInt(get('minute'), 10),
  };
}

export function getIsraelDateString(d = new Date()) {
  const { year, month, day } = israelParts(d);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function getIsraelHour(d = new Date()) {
  return israelParts(d).hour;
}

export function dayOfWeekFromString(yyyymmdd) {
  const [y, m, d] = yyyymmdd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function formatHebrewDate(input) {
  const dateString = typeof input === 'string' ? input : getIsraelDateString(input);
  const [, m, d] = dateString.split('-').map(Number);
  const dayIdx = dayOfWeekFromString(dateString);
  const dayName = HEBREW_DAYS[dayIdx];
  const monthName = HEBREW_MONTHS[m - 1];
  const prefix = dayIdx === 6 ? '' : 'יום ';
  return `${prefix}${dayName}, ${d} ב${monthName}`;
}

export function shiftIsraelDate(dateString, offsetDays) {
  const [y, m, d] = dateString.split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  utc.setUTCDate(utc.getUTCDate() + offsetDays);
  const yy = utc.getUTCFullYear();
  const mm = String(utc.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(utc.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function isToday(dateString) {
  return dateString === getIsraelDateString();
}

export function isYesterday(dateString) {
  return dateString === shiftIsraelDate(getIsraelDateString(), -1);
}

export function relativeDay(dateString) {
  if (isToday(dateString)) return 'היום';
  if (isYesterday(dateString)) return 'אתמול';
  if (dateString === shiftIsraelDate(getIsraelDateString(), -2)) return 'שלשום';
  return formatHebrewDate(dateString);
}

export function lastNDateStrings(n) {
  const today = getIsraelDateString();
  const out = [];
  for (let i = 0; i < n; i++) out.push(shiftIsraelDate(today, -i));
  return out;
}

export function getNext8amIsraelMs(now = new Date()) {
  // Coarse delta in wall-clock minutes, then refine via Israel-TZ readback.
  // The plain `delta * 60000` math assumes 60-minute hours, which is wrong
  // around Israel DST transitions and skews the next-8am by up to 60 min.
  const il = israelParts(now);
  const minutesNow = il.hour * 60 + il.minute;
  const target = 8 * 60;
  let delta = target - minutesNow;
  if (delta <= 0) delta += 24 * 60;
  let candidate = new Date(now.getTime() + delta * 60000);
  for (let i = 0; i < 4; i += 1) {
    const cp = israelParts(candidate);
    const off = (8 - cp.hour) * 60 + (0 - cp.minute);
    if (off === 0) break;
    candidate = new Date(candidate.getTime() + off * 60000);
  }
  if (candidate.getTime() <= now.getTime()) {
    candidate = new Date(candidate.getTime() + 24 * 60 * 60000);
    for (let i = 0; i < 4; i += 1) {
      const cp = israelParts(candidate);
      const off = (8 - cp.hour) * 60 + (0 - cp.minute);
      if (off === 0) break;
      candidate = new Date(candidate.getTime() + off * 60000);
    }
  }
  return candidate.getTime();
}

export function formatRemaining(ms) {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatTimeOfDay(d = new Date()) {
  const il = israelParts(d);
  return `${String(il.hour).padStart(2, '0')}:${String(il.minute).padStart(2, '0')}`;
}
