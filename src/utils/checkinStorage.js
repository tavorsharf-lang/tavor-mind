import { ref, set, get, update, remove, serverTimestamp } from 'firebase/database';
import { db, auth, ROOM } from '../firebase.js';
import { getIsraelDateString, lastNDateStrings } from './dateHelpers.js';
import { decorateOnQueue, decorateFailure, markFailureForType } from './syncQueue.js';
import { isSoftDeleted, isPurgeable } from './softDelete.js';

const PENDING_KEY = 'tavor_mind_pending_checkins';

function getUid() {
  return auth.currentUser?.uid || localStorage.getItem('tavor_mind_auth_uid');
}

function loadPending() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
  } catch {
    return [];
  }
}

function savePending(list) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(list));
}

function pathFor(uid, date, timestamp) {
  return `${ROOM}/${uid}/checkins/${date}/${timestamp}`;
}

export async function saveMoodCheckin({ scope, valence, emotions, factors }) {
  const uid = getUid();
  const date = getIsraelDateString();
  const timestamp = Date.now();
  const localPayload = {
    scope,
    valence,
    emotions: Array.isArray(emotions) ? emotions : [],
    factors: Array.isArray(factors) ? factors : [],
    createdAt: timestamp,
  };
  const remotePayload = { ...localPayload, savedAt: serverTimestamp() };

  const pending = loadPending();
  pending.push(decorateOnQueue({ uid, date, timestamp, payload: localPayload }));
  savePending(pending);

  if (!uid || !navigator.onLine) {
    return { ok: false, reason: 'offline' };
  }

  try {
    await set(ref(db, pathFor(uid, date, timestamp)), remotePayload);
    const after = loadPending().filter(
      (p) => !(p.uid === uid && p.date === date && p.timestamp === timestamp)
    );
    savePending(after);
    return { ok: true };
  } catch (err) {
    console.warn('mood checkin write failed:', err?.message || err);
    markFailureForType(
      'checkins',
      (p) => p.uid === uid && p.date === date && p.timestamp === timestamp,
      err
    );
    return { ok: false, reason: 'error' };
  }
}

function entriesFromDayObject(dayObj) {
  if (!dayObj || typeof dayObj !== 'object') return [];
  return Object.entries(dayObj)
    .filter(([key, val]) => /^\d+$/.test(key) && val && typeof val === 'object' && val.valence != null && !isSoftDeleted(val))
    .map(([key, val]) => ({ ...val, _ts: Number(key) }));
}

// Throttle: every list/range call would otherwise dispatch dozens of remove()
// requests in parallel during navigation. Once per hour is plenty for a lazy
// 30-day purge and keeps the network quiet.
const PURGE_INTERVAL_MS = 60 * 60 * 1000;
let lastPurgeAt = 0;

function purgeOldCheckins(uid, all) {
  if (!uid || !navigator.onLine || !all || typeof all !== 'object') return;
  const now = Date.now();
  if (now - lastPurgeAt < PURGE_INTERVAL_MS) return;
  lastPurgeAt = now;
  for (const [date, dayObj] of Object.entries(all)) {
    if (!dayObj || typeof dayObj !== 'object') continue;
    for (const [k, v] of Object.entries(dayObj)) {
      if (!/^\d+$/.test(k) || !v || typeof v !== 'object') continue;
      if (isPurgeable(v, now)) {
        remove(ref(db, pathFor(uid, date, Number(k)))).catch(() => {});
      }
    }
  }
}

export async function getCheckinsForDate(date) {
  const uid = getUid();
  if (!uid) return [];
  const pending = loadPending().filter((p) => p.uid === uid && p.date === date);
  if (!navigator.onLine) {
    return pending.map((p) => ({ ...p.payload, _ts: p.timestamp })).sort((a, b) => b._ts - a._ts);
  }
  try {
    const snap = await get(ref(db, `${ROOM}/${uid}/checkins/${date}`));
    const remote = snap.exists() ? entriesFromDayObject(snap.val()) : [];
    const remoteIds = new Set(remote.map((r) => r._ts));
    const merged = [
      ...remote,
      ...pending.filter((p) => !remoteIds.has(p.timestamp)).map((p) => ({ ...p.payload, _ts: p.timestamp })),
    ];
    return merged.sort((a, b) => b._ts - a._ts);
  } catch (err) {
    console.warn('getCheckinsForDate failed:', err?.message || err);
    return pending.map((p) => ({ ...p.payload, _ts: p.timestamp })).sort((a, b) => b._ts - a._ts);
  }
}

export async function listAllMoodCheckins() {
  const uid = getUid();
  if (!uid) return [];
  const pending = loadPending().filter((p) => p.uid === uid);
  const out = [];
  if (navigator.onLine) {
    try {
      const snap = await get(ref(db, `${ROOM}/${uid}/checkins`));
      const all = snap.exists() ? snap.val() : {};
      purgeOldCheckins(uid, all);
      for (const [date, dayObj] of Object.entries(all)) {
        if (!dayObj || typeof dayObj !== 'object') continue;
        for (const [k, v] of Object.entries(dayObj)) {
          if (!/^\d+$/.test(k) || !v || typeof v !== 'object' || v.valence == null) continue;
          if (isSoftDeleted(v)) continue;
          out.push({ ...v, _ts: Number(k), _date: date });
        }
      }
    } catch (err) {
      console.warn('listAllMoodCheckins failed:', err?.message || err);
    }
  }
  const seen = new Set(out.map((e) => `${e._date}/${e._ts}`));
  for (const p of pending) {
    const key = `${p.date}/${p.timestamp}`;
    if (!seen.has(key)) {
      out.push({ ...p.payload, _ts: p.timestamp, _date: p.date, _pending: true });
    }
  }
  out.sort((a, b) => b._ts - a._ts);
  return out;
}

export async function getCheckinsRange(days = 7) {
  const uid = getUid();
  const dateStrings = lastNDateStrings(days);
  if (!uid) return dateStrings.map((date) => ({ date, entries: [] }));
  const pending = loadPending();

  if (!navigator.onLine) {
    return dateStrings.map((date) => {
      const entries = pending
        .filter((p) => p.uid === uid && p.date === date)
        .map((p) => ({ ...p.payload, _ts: p.timestamp }))
        .sort((a, b) => b._ts - a._ts);
      return { date, entries };
    });
  }

  try {
    const snap = await get(ref(db, `${ROOM}/${uid}/checkins`));
    const all = snap.exists() ? snap.val() : {};
    purgeOldCheckins(uid, all);
    return dateStrings.map((date) => {
      const remote = entriesFromDayObject(all[date]);
      const remoteIds = new Set(remote.map((r) => r._ts));
      const local = pending
        .filter((p) => p.uid === uid && p.date === date && !remoteIds.has(p.timestamp))
        .map((p) => ({ ...p.payload, _ts: p.timestamp }));
      const entries = [...remote, ...local].sort((a, b) => b._ts - a._ts);
      return { date, entries };
    });
  } catch (err) {
    console.warn('getCheckinsRange failed:', err?.message || err);
    return dateStrings.map((date) => ({ date, entries: [] }));
  }
}

export async function deleteCheckinEntry(date, timestamp) {
  const uid = getUid();
  if (!uid) return { ok: false, reason: 'no-uid' };
  const wasPending = loadPending().some(
    (p) => p.uid === uid && p.date === date && p.timestamp === timestamp
  );
  const after = loadPending().filter(
    (p) => !(p.uid === uid && p.date === date && p.timestamp === timestamp)
  );
  savePending(after);
  if (!navigator.onLine) return { ok: wasPending, reason: wasPending ? 'pending-only' : 'offline' };
  try {
    const r = ref(db, pathFor(uid, date, timestamp));
    const snap = await get(r);
    if (!snap.exists()) {
      return { ok: true, restorable: false, reason: wasPending ? 'pending-only' : 'not-found' };
    }
    await update(r, { deletedAt: serverTimestamp() });
    return { ok: true, restorable: true };
  } catch (err) {
    console.warn('deleteCheckinEntry failed:', err?.message || err);
    return { ok: false, reason: 'error' };
  }
}

export async function listDeletedMoodCheckins() {
  const uid = getUid();
  if (!uid || !navigator.onLine) return [];
  try {
    const snap = await get(ref(db, `${ROOM}/${uid}/checkins`));
    if (!snap.exists()) return [];
    const all = snap.val();
    const out = [];
    for (const [date, dayObj] of Object.entries(all)) {
      if (!dayObj || typeof dayObj !== 'object') continue;
      for (const [k, v] of Object.entries(dayObj)) {
        if (!/^\d+$/.test(k) || !v || typeof v !== 'object') continue;
        if (!isSoftDeleted(v)) continue;
        out.push({ ...v, _ts: Number(k), _date: date });
      }
    }
    out.sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
    return out;
  } catch (err) {
    console.warn('listDeletedMoodCheckins failed:', err?.message || err);
    return [];
  }
}

export async function purgeCheckinEntry(date, timestamp) {
  const uid = getUid();
  if (!uid) return { ok: false, reason: 'no-uid' };
  if (!navigator.onLine) return { ok: false, reason: 'offline' };
  try {
    await remove(ref(db, pathFor(uid, date, timestamp)));
    return { ok: true };
  } catch (err) {
    console.warn('purgeCheckinEntry failed:', err?.message || err);
    return { ok: false, reason: 'error' };
  }
}

export async function restoreCheckinEntry(date, timestamp) {
  const uid = getUid();
  if (!uid) return { ok: false, reason: 'no-uid' };
  if (!navigator.onLine) return { ok: false, reason: 'offline' };
  try {
    const r = ref(db, pathFor(uid, date, timestamp));
    const snap = await get(r);
    if (!snap.exists()) return { ok: false, reason: 'not-found' };
    await update(r, { deletedAt: null });
    return { ok: true };
  } catch (err) {
    console.warn('restoreCheckinEntry failed:', err?.message || err);
    return { ok: false, reason: 'error' };
  }
}

export async function flushPendingCheckins() {
  const uid = getUid();
  if (!uid || !navigator.onLine) return;
  const pending = loadPending();
  if (!pending.length) return;
  const remaining = [];
  for (const item of pending) {
    try {
      const payload = { ...item.payload, savedAt: serverTimestamp() };
      await set(ref(db, pathFor(item.uid || uid, item.date, item.timestamp)), payload);
    } catch (err) {
      remaining.push(decorateFailure(item, err));
    }
  }
  savePending(remaining);
}
