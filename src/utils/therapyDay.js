import { ref, set, get } from 'firebase/database';
import { db, auth, ROOM } from '../firebase.js';
import { getIsraelDateString, dayOfWeekFromString, shiftIsraelDate, getIsraelHour } from './dateHelpers.js';

const SETTING_PATH = 'therapyDayOfWeek';
const LAST_EXPORT_PATH = 'lastTherapistExportAt';
const LOCAL_DOW_KEY = 'tavor_mind_therapy_dow';
const LOCAL_LAST_EXPORT_KEY = 'tavor_mind_last_therapist_export';

export const HEBREW_DOW_LABELS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function getUid() {
  return auth.currentUser?.uid || localStorage.getItem('tavor_mind_auth_uid');
}

export async function getTherapyDayOfWeek() {
  const cached = localStorage.getItem(LOCAL_DOW_KEY);
  if (cached !== null && cached !== '') {
    const n = Number(cached);
    if (Number.isInteger(n) && n >= 0 && n <= 6) return n;
  }
  const uid = getUid();
  if (!uid || !navigator.onLine) return null;
  try {
    const snap = await get(ref(db, `${ROOM}/${uid}/settings/${SETTING_PATH}`));
    if (!snap.exists()) return null;
    const v = snap.val();
    if (Number.isInteger(v) && v >= 0 && v <= 6) {
      localStorage.setItem(LOCAL_DOW_KEY, String(v));
      return v;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setTherapyDayOfWeek(dow) {
  const n = Number(dow);
  if (!Number.isInteger(n) || n < 0 || n > 6) {
    return { ok: false, reason: 'invalid' };
  }
  localStorage.setItem(LOCAL_DOW_KEY, String(n));
  const uid = getUid();
  if (!uid || !navigator.onLine) return { ok: true, synced: false };
  try {
    await set(ref(db, `${ROOM}/${uid}/settings/${SETTING_PATH}`), n);
    return { ok: true, synced: true };
  } catch {
    return { ok: true, synced: false };
  }
}

export function isTherapyDayToday(dow) {
  if (dow == null) return false;
  return dayOfWeekFromString(getIsraelDateString()) === dow;
}

export function getRelevantFrameDate(dow) {
  if (dow == null) return null;
  const today = getIsraelDateString();
  if (dayOfWeekFromString(today) === dow) return today;
  const yesterday = shiftIsraelDate(today, -1);
  if (dayOfWeekFromString(yesterday) === dow) return yesterday;
  return null;
}

export function isAfterEvening() {
  return getIsraelHour() >= 18;
}

export async function getLastTherapistExportAt() {
  const cached = localStorage.getItem(LOCAL_LAST_EXPORT_KEY);
  if (cached) {
    const ms = new Date(cached).getTime();
    if (!Number.isNaN(ms)) return cached;
  }
  const uid = getUid();
  if (!uid || !navigator.onLine) return null;
  try {
    const snap = await get(ref(db, `${ROOM}/${uid}/settings/${LAST_EXPORT_PATH}`));
    if (!snap.exists()) return null;
    const v = snap.val();
    if (typeof v === 'string') {
      localStorage.setItem(LOCAL_LAST_EXPORT_KEY, v);
      return v;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setLastTherapistExportAt(iso) {
  const v = iso || new Date().toISOString();
  localStorage.setItem(LOCAL_LAST_EXPORT_KEY, v);
  const uid = getUid();
  if (!uid || !navigator.onLine) return { ok: true, synced: false };
  try {
    await set(ref(db, `${ROOM}/${uid}/settings/${LAST_EXPORT_PATH}`), v);
    return { ok: true, synced: true };
  } catch {
    return { ok: true, synced: false };
  }
}
