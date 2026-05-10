import { ref, set, get, update, remove, serverTimestamp, query, orderByChild, limitToLast } from 'firebase/database';
import { db, auth, ROOM } from '../firebase.js';
import { decorateOnQueue, decorateFailure, markFailureForType } from './syncQueue.js';
import { isSoftDeleted, isPurgeable } from './softDelete.js';

const PENDING_KEY = 'tavor_mind_pending_sessions';

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

function pathFor(uid, ts) {
  return `${ROOM}/${uid}/emergency_sessions/${ts}`;
}

export async function logEmergencySession(session) {
  const uid = auth.currentUser?.uid || localStorage.getItem('tavor_mind_auth_uid');
  const ts = Date.now();
  // Pending payload uses serverTimestamp sentinels too — the SDK serializes
  // them to the server-provided value at flush time, so offline-then-online
  // sessions aren't tagged with skewed client clocks.
  const payload = {
    ...session,
    startedAt: session.startedAt ?? serverTimestamp(),
    endedAt: serverTimestamp(),
    clientTs: ts,
  };

  const pending = loadPending();
  pending.push(decorateOnQueue({ ts, uid, payload }));
  savePending(pending);

  if (!uid || !navigator.onLine) {
    return { ok: false, reason: 'offline' };
  }

  try {
    await set(ref(db, pathFor(uid, ts)), payload);
    const after = loadPending().filter((p) => p.ts !== ts);
    savePending(after);
    return { ok: true };
  } catch (err) {
    console.warn('emergency log write failed:', err?.message || err);
    markFailureForType('sessions', (p) => p.ts === ts, err);
    return { ok: false, reason: 'error' };
  }
}

export async function deleteEmergencySession(ts) {
  const uid = auth.currentUser?.uid || localStorage.getItem('tavor_mind_auth_uid');
  if (!uid) return { ok: false, reason: 'no-uid' };
  const wasPending = loadPending().some((p) => p.ts === ts);
  const after = loadPending().filter((p) => p.ts !== ts);
  savePending(after);
  if (!navigator.onLine) return { ok: wasPending, reason: wasPending ? 'pending-only' : 'offline' };
  try {
    const r = ref(db, pathFor(uid, ts));
    const snap = await get(r);
    if (!snap.exists()) {
      return { ok: true, restorable: false, reason: wasPending ? 'pending-only' : 'not-found' };
    }
    await update(r, { deletedAt: serverTimestamp() });
    return { ok: true, restorable: true };
  } catch (err) {
    console.warn('deleteEmergencySession failed:', err?.message || err);
    return { ok: false, reason: 'error' };
  }
}

export async function restoreEmergencySession(ts) {
  const uid = auth.currentUser?.uid || localStorage.getItem('tavor_mind_auth_uid');
  if (!uid) return { ok: false, reason: 'no-uid' };
  if (!navigator.onLine) return { ok: false, reason: 'offline' };
  try {
    const r = ref(db, pathFor(uid, ts));
    const snap = await get(r);
    if (!snap.exists()) return { ok: false, reason: 'not-found' };
    await update(r, { deletedAt: null });
    return { ok: true };
  } catch (err) {
    console.warn('restoreEmergencySession failed:', err?.message || err);
    return { ok: false, reason: 'error' };
  }
}

function getUid() {
  return auth.currentUser?.uid || localStorage.getItem('tavor_mind_auth_uid');
}

export async function getRecentEmergencySessions(limit = 30) {
  const uid = getUid();
  if (!uid || !navigator.onLine) return [];
  try {
    const snap = await get(ref(db, `${ROOM}/${uid}/emergency_sessions`));
    if (!snap.exists()) return [];
    const out = [];
    const now = Date.now();
    Object.entries(snap.val()).forEach(([sessionId, data]) => {
      if (!data || typeof data !== 'object') return;
      if (isPurgeable(data, now)) {
        // Lazy hard-purge for soft-deleted items past the 30-day grace window.
        remove(ref(db, `${ROOM}/${uid}/emergency_sessions/${sessionId}`)).catch(() => {});
        return;
      }
      if (isSoftDeleted(data)) return;
      out.push({ sessionId, ...data });
    });
    out.sort((a, b) => {
      const ta = a.clientTs || a.endedAt || a.startedAtClient || 0;
      const tb = b.clientTs || b.endedAt || b.startedAtClient || 0;
      return tb - ta;
    });
    return out.slice(0, limit);
  } catch (err) {
    console.warn('getRecentEmergencySessions failed:', err?.message || err);
    return [];
  }
}

export async function getEmergencySession(sessionId) {
  const uid = getUid();
  if (!uid || !navigator.onLine || !sessionId) return null;
  try {
    const snap = await get(ref(db, `${ROOM}/${uid}/emergency_sessions/${sessionId}`));
    if (!snap.exists()) return null;
    const data = snap.val();
    if (!data || typeof data !== 'object' || isSoftDeleted(data)) return null;
    return { sessionId, ...data };
  } catch (err) {
    console.warn('getEmergencySession failed:', err?.message || err);
    return null;
  }
}

// ── trigger_analyses ────────────────────────────────────────────────────────
// Stage-2 deep-dive sessions are stored at a separate path so the rich payload
// (9 steps × multi-select + free text) doesn't bloat emergency_sessions, and so
// future trigger-history UI can read them independently of the emergency log.

const PENDING_TRIGGER_KEY = 'tavor_mind_pending_trigger_analyses';

function loadPendingTriggers() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_TRIGGER_KEY) || '[]');
  } catch {
    return [];
  }
}

function savePendingTriggers(list) {
  localStorage.setItem(PENDING_TRIGGER_KEY, JSON.stringify(list));
}

function triggerPathFor(uid, ts) {
  return `${ROOM}/${uid}/trigger_analyses/${ts}`;
}

export async function logTriggerAnalysis(payload) {
  const uid = auth.currentUser?.uid || localStorage.getItem('tavor_mind_auth_uid');
  const ts = Date.now();
  const body = {
    ...payload,
    startedAt: payload.startedAt ?? serverTimestamp(),
    endedAt: serverTimestamp(),
    clientTs: ts,
  };

  const pending = loadPendingTriggers();
  pending.push(decorateOnQueue({ ts, uid, payload: body }));
  savePendingTriggers(pending);

  if (!uid || !navigator.onLine) {
    return { ok: false, reason: 'offline' };
  }

  try {
    await set(ref(db, triggerPathFor(uid, ts)), body);
    const after = loadPendingTriggers().filter((p) => p.ts !== ts);
    savePendingTriggers(after);
    return { ok: true, sessionId: ts };
  } catch (err) {
    console.warn('trigger analysis write failed:', err?.message || err);
    markFailureForType('trigger_analyses', (p) => p.ts === ts, err);
    return { ok: false, reason: 'error' };
  }
}

export async function getRecentTriggerAnalyses(limit = 30) {
  const uid = getUid();
  if (!uid || !navigator.onLine) return [];
  try {
    const snap = await get(ref(db, `${ROOM}/${uid}/trigger_analyses`));
    if (!snap.exists()) return [];
    const out = [];
    const now = Date.now();
    Object.entries(snap.val()).forEach(([sessionId, data]) => {
      if (!data || typeof data !== 'object') return;
      if (isPurgeable(data, now)) {
        remove(ref(db, `${ROOM}/${uid}/trigger_analyses/${sessionId}`)).catch(() => {});
        return;
      }
      if (isSoftDeleted(data)) return;
      out.push({ sessionId, ...data });
    });
    out.sort((a, b) => {
      const ta = a.clientTs || a.endedAt || a.startedAtClient || 0;
      const tb = b.clientTs || b.endedAt || b.startedAtClient || 0;
      return tb - ta;
    });
    return out.slice(0, limit);
  } catch (err) {
    console.warn('getRecentTriggerAnalyses failed:', err?.message || err);
    return [];
  }
}

export async function getTriggerAnalysis(sessionId) {
  const uid = getUid();
  if (!uid || !navigator.onLine || !sessionId) return null;
  try {
    const snap = await get(ref(db, `${ROOM}/${uid}/trigger_analyses/${sessionId}`));
    if (!snap.exists()) return null;
    const data = snap.val();
    if (!data || typeof data !== 'object' || isSoftDeleted(data)) return null;
    return { sessionId, ...data };
  } catch (err) {
    console.warn('getTriggerAnalysis failed:', err?.message || err);
    return null;
  }
}

export async function flushPendingTriggerAnalyses() {
  const uid = auth.currentUser?.uid || localStorage.getItem('tavor_mind_auth_uid');
  if (!uid || !navigator.onLine) return;
  const pending = loadPendingTriggers();
  if (!pending.length) return;
  const remaining = [];
  for (const item of pending) {
    try {
      await set(ref(db, triggerPathFor(item.uid || uid, item.ts)), item.payload);
    } catch (err) {
      remaining.push(decorateFailure(item, err));
    }
  }
  savePendingTriggers(remaining);
}

// Returns how many of the most recent consecutive mid-activation sessions
// chose 'analyze' in the early bridge. A 'continue' breaks the streak; a mid
// session without earlyBridgeChoice (pre-feature) also stops the count.
// Non-mid sessions are skipped (they don't break or extend the streak).
export async function getMidEarlyBridgeStreak() {
  try {
    const uid = getUid();
    if (!uid || !navigator.onLine) return 0;
    const sessionsRef = ref(db, `${ROOM}/${uid}/emergency_sessions`);
    const q = query(sessionsRef, orderByChild('startedAtClient'), limitToLast(50));
    const snap = await get(q);
    if (!snap.exists()) return 0;

    const sessions = [];
    snap.forEach((child) => {
      const v = child.val();
      if (v && !isSoftDeleted(v)) sessions.push(v);
    });
    sessions.sort((a, b) => (b.startedAtClient || 0) - (a.startedAtClient || 0));

    let streak = 0;
    for (const s of sessions) {
      if (s.activation !== 'mid') continue;
      if (s.earlyBridgeChoice === 'analyze') {
        streak += 1;
      } else if (s.earlyBridgeChoice === 'continue') {
        break;
      } else {
        break;
      }
    }
    return streak;
  } catch {
    return 0;
  }
}

export async function flushPendingSessions() {
  const uid = auth.currentUser?.uid || localStorage.getItem('tavor_mind_auth_uid');
  if (!uid || !navigator.onLine) return;
  const pending = loadPending();
  if (!pending.length) return;
  const remaining = [];
  for (const item of pending) {
    try {
      await set(ref(db, pathFor(item.uid || uid, item.ts)), item.payload);
    } catch (err) {
      remaining.push(decorateFailure(item, err));
    }
  }
  savePending(remaining);
}
