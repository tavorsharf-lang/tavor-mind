import { ref, set, get, update, remove, serverTimestamp } from 'firebase/database';
import { db, auth, ROOM } from '../firebase.js';
import { decorateOnQueue, decorateFailure, markFailureForType } from './syncQueue.js';
import { isSoftDeleted, isPurgeable } from './softDelete.js';

const PENDING_KEY = 'tavor_mind_pending_tools';

export const TOOL_CATEGORIES = ['triggers', 'mode_checks', 'catastrophe_checks', 'somatic_sessions'];

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

function pathFor(uid, category, ts) {
  return `${ROOM}/${uid}/${category}/${ts}`;
}

export async function saveToolSession(category, data) {
  const uid = getUid();
  const ts = Date.now();
  const payload = { ...data, createdAt: serverTimestamp(), clientTs: ts };

  const pending = loadPending();
  pending.push(decorateOnQueue({
    uid, category, ts,
    payload: { ...data, createdAt: ts, clientTs: ts },
  }));
  savePending(pending);

  if (!uid || !navigator.onLine) {
    return { ok: false, reason: 'offline', ts };
  }

  try {
    await set(ref(db, pathFor(uid, category, ts)), payload);
    const after = loadPending().filter((p) => !(p.uid === uid && p.category === category && p.ts === ts));
    savePending(after);
    return { ok: true, ts };
  } catch (err) {
    console.warn(`tool save failed (${category}):`, err?.message || err);
    markFailureForType(
      'tools',
      (p) => p.uid === uid && p.category === category && p.ts === ts,
      err
    );
    return { ok: false, reason: 'error', ts };
  }
}

export async function deleteToolEntry(category, ts) {
  const uid = getUid();
  if (!uid) return { ok: false, reason: 'no-uid' };
  if (!TOOL_CATEGORIES.includes(category)) return { ok: false, reason: 'bad-category' };
  const wasPending = loadPending().some((p) => p.uid === uid && p.category === category && p.ts === ts);
  const after = loadPending().filter((p) => !(p.uid === uid && p.category === category && p.ts === ts));
  savePending(after);
  if (!navigator.onLine) return { ok: wasPending, reason: wasPending ? 'pending-only' : 'offline' };
  try {
    const r = ref(db, pathFor(uid, category, ts));
    const snap = await get(r);
    if (!snap.exists()) {
      return { ok: true, restorable: false, reason: wasPending ? 'pending-only' : 'not-found' };
    }
    await update(r, { deletedAt: serverTimestamp() });
    return { ok: true, restorable: true };
  } catch (err) {
    console.warn(`deleteToolEntry failed (${category}):`, err?.message || err);
    return { ok: false, reason: 'error' };
  }
}

export async function restoreToolEntry(category, ts) {
  const uid = getUid();
  if (!uid) return { ok: false, reason: 'no-uid' };
  if (!TOOL_CATEGORIES.includes(category)) return { ok: false, reason: 'bad-category' };
  if (!navigator.onLine) return { ok: false, reason: 'offline' };
  try {
    const r = ref(db, pathFor(uid, category, ts));
    const snap = await get(r);
    if (!snap.exists()) return { ok: false, reason: 'not-found' };
    await update(r, { deletedAt: null });
    return { ok: true };
  } catch (err) {
    console.warn(`restoreToolEntry failed (${category}):`, err?.message || err);
    return { ok: false, reason: 'error' };
  }
}

export async function flushPendingTools() {
  const uid = getUid();
  if (!uid || !navigator.onLine) return;
  const pending = loadPending();
  if (!pending.length) return;
  const remaining = [];
  for (const item of pending) {
    try {
      const payload = { ...item.payload, createdAt: serverTimestamp() };
      await set(ref(db, pathFor(item.uid || uid, item.category, item.ts)), payload);
    } catch (err) {
      remaining.push(decorateFailure(item, err));
    }
  }
  savePending(remaining);
}

export async function getToolHistory() {
  const uid = getUid();
  if (!uid) return [];
  const out = [];
  if (navigator.onLine) {
    try {
      const now = Date.now();
      for (const cat of TOOL_CATEGORIES) {
        const snap = await get(ref(db, `${ROOM}/${uid}/${cat}`));
        if (snap.exists()) {
          const data = snap.val();
          for (const [key, val] of Object.entries(data)) {
            if (!val || typeof val !== 'object') continue;
            if (isPurgeable(val, now)) {
              remove(ref(db, pathFor(uid, cat, parseInt(key, 10)))).catch(() => {});
              continue;
            }
            if (isSoftDeleted(val)) continue;
            out.push({ ...val, category: cat, ts: parseInt(key, 10) || val.clientTs || 0 });
          }
        }
      }
    } catch (err) {
      console.warn('getToolHistory failed:', err?.message || err);
    }
  }
  // Merge in locally pending entries
  const pending = loadPending().filter((p) => p.uid === uid);
  for (const p of pending) {
    if (!out.some((e) => e.category === p.category && e.ts === p.ts)) {
      out.push({ ...p.payload, category: p.category, ts: p.ts, _pending: true });
    }
  }
  out.sort((a, b) => b.ts - a.ts);
  return out;
}

