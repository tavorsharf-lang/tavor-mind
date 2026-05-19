import { ref, get, set, update, serverTimestamp } from 'firebase/database';
import { db, auth, ROOM } from '../firebase.js';
import { isSoftDeleted } from '../utils/softDelete.js';

const PENDING_KEY = 'tavor_mind_pending_conversation_sessions';

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
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(list));
  } catch {
    /* quota — best effort */
  }
}

function pathFor(uid, sessionId) {
  return `${ROOM}/${uid}/conversation_sessions/${sessionId}`;
}

export function generateSessionId() {
  const salt = Math.random().toString(36).slice(2, 8);
  return `${Date.now()}-${salt}`;
}

function nowMs() {
  return Date.now();
}

export async function createSession({ sessionId, type, variables }) {
  const uid = getUid();
  const id = sessionId || generateSessionId();
  const record = {
    sessionId: id,
    type,
    createdAt: nowMs(),
    updatedAt: nowMs(),
    variables: variables || {},
    exportedAt: null,
    importedResponse: null,
  };

  const pending = loadPending();
  pending.push({ uid, id, payload: record });
  savePending(pending);

  if (!uid || !navigator.onLine) {
    return { ok: false, reason: 'offline', sessionId: id, record };
  }

  try {
    await set(ref(db, pathFor(uid, id)), record);
    const after = loadPending().filter((p) => !(p.uid === uid && p.id === id));
    savePending(after);
    return { ok: true, sessionId: id, record };
  } catch (err) {
    console.warn('createSession failed:', err?.message || err);
    return { ok: false, reason: 'error', sessionId: id, record };
  }
}

export async function getSession(sessionId) {
  const uid = getUid();
  if (!uid) return null;
  const local = loadPending().find((p) => p.uid === uid && p.id === sessionId);
  if (local) return local.payload;
  if (!navigator.onLine) return null;
  try {
    const snap = await get(ref(db, pathFor(uid, sessionId)));
    if (!snap.exists()) return null;
    const val = snap.val();
    if (isSoftDeleted(val)) return null;
    return val;
  } catch (err) {
    console.warn('getSession failed:', err?.message || err);
    return null;
  }
}

export async function markExported(sessionId) {
  const uid = getUid();
  if (!uid) return { ok: false, reason: 'no-uid' };
  const ts = nowMs();
  // patch pending if present
  const pending = loadPending();
  const idx = pending.findIndex((p) => p.uid === uid && p.id === sessionId);
  if (idx >= 0) {
    pending[idx] = {
      ...pending[idx],
      payload: { ...pending[idx].payload, exportedAt: ts, updatedAt: ts },
    };
    savePending(pending);
  }
  if (!navigator.onLine) return { ok: false, reason: 'offline' };
  try {
    await update(ref(db, pathFor(uid, sessionId)), {
      exportedAt: ts,
      updatedAt: ts,
    });
    return { ok: true };
  } catch (err) {
    console.warn('markExported failed:', err?.message || err);
    return { ok: false, reason: 'error' };
  }
}

export async function saveImportedResponse(sessionId, importedResponse) {
  const uid = getUid();
  if (!uid) return { ok: false, reason: 'no-uid' };
  const ts = nowMs();
  const pending = loadPending();
  const idx = pending.findIndex((p) => p.uid === uid && p.id === sessionId);
  if (idx >= 0) {
    pending[idx] = {
      ...pending[idx],
      payload: { ...pending[idx].payload, importedResponse, updatedAt: ts },
    };
    savePending(pending);
  }
  if (!navigator.onLine) return { ok: false, reason: 'offline' };
  try {
    await update(ref(db, pathFor(uid, sessionId)), {
      importedResponse,
      updatedAt: ts,
    });
    return { ok: true };
  } catch (err) {
    console.warn('saveImportedResponse failed:', err?.message || err);
    return {
      ok: false,
      reason: 'error',
      message: err?.message || String(err),
      code: err?.code || null,
    };
  }
}

export async function listSessions({ type } = {}) {
  const uid = getUid();
  if (!uid) return [];
  const out = [];
  if (navigator.onLine) {
    try {
      const snap = await get(ref(db, `${ROOM}/${uid}/conversation_sessions`));
      if (snap.exists()) {
        Object.values(snap.val()).forEach((v) => {
          if (v && typeof v === 'object' && !isSoftDeleted(v)) out.push(v);
        });
      }
    } catch (err) {
      console.warn('listSessions failed:', err?.message || err);
    }
  }
  const pending = loadPending().filter((p) => p.uid === uid);
  for (const p of pending) {
    if (!out.some((s) => s.sessionId === p.id)) {
      out.push({ ...p.payload, _pending: true });
    }
  }
  const filtered = type ? out.filter((s) => s.type === type) : out;
  filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return filtered;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function countSessionsByTypeLast30Days() {
  const all = await listSessions();
  const cutoff = nowMs() - THIRTY_DAYS_MS;
  const counts = {};
  for (const s of all) {
    if (!s?.type) continue;
    if (typeof s.createdAt !== 'number' || s.createdAt < cutoff) continue;
    counts[s.type] = (counts[s.type] || 0) + 1;
  }
  return counts;
}

export async function flushPendingConversationSessions() {
  const uid = getUid();
  if (!uid || !navigator.onLine) return;
  const pending = loadPending();
  if (!pending.length) return;
  const remaining = [];
  for (const item of pending) {
    try {
      await set(ref(db, pathFor(item.uid || uid, item.id)), item.payload);
    } catch (err) {
      remaining.push(item);
      console.warn('flush conversation_session failed:', err?.message || err);
    }
  }
  savePending(remaining);
}
