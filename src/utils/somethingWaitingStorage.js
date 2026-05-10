import { ref, push, get, update, query, orderByChild } from 'firebase/database';
import { db, auth, ROOM } from '../firebase.js';
import { isSoftDeleted } from './softDelete.js';
import { decorateOnQueue, decorateFailure } from './syncQueue.js';

const COLLECTION = 'something_waiting';
const PENDING_KEY = 'tavor_mind_pending_waiting_items_v1';

const STATUS_OLD_DAYS = 14;
const STATUS_LONG_WAITED_DAYS = 30;

function getUid() {
  return auth.currentUser?.uid || localStorage.getItem('tavor_mind_auth_uid');
}

function pathFor(uid) {
  return `${ROOM}/${uid}/${COLLECTION}`;
}

function readPending() {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function writePending(arr) {
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(arr)); } catch {}
}

export async function saveWaitingItem(item) {
  const payload = {
    sentence: item.sentence || '',
    structure: item.structure || null,
    customStructure: item.customStructure || null,
    returnCommitment: item.returnCommitment || null,
    activationAtTime: item.activationAtTime ?? null,
    sourceContext: item.sourceContext || 'emergency_phase8',
    createdAt: Date.now(),
  };
  const uid = getUid();
  const localId = `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  if (!uid || !navigator.onLine) {
    const pending = readPending();
    pending.push(decorateOnQueue({ ...payload, _localId: localId }));
    writePending(pending);
    return { ok: false, reason: 'offline' };
  }
  try {
    const newRef = push(ref(db, pathFor(uid)));
    await update(newRef, payload);
    return { ok: true, id: newRef.key };
  } catch (e) {
    const pending = readPending();
    pending.push(decorateFailure(decorateOnQueue({ ...payload, _localId: localId }), e));
    writePending(pending);
    return { ok: false, reason: 'error' };
  }
}

export async function flushPendingWaitingItems() {
  const pending = readPending();
  if (!pending.length) return;
  const uid = getUid();
  if (!uid || !navigator.onLine) return;
  // Per-item try/catch — a failure mid-loop must not re-push items we already
  // wrote successfully. Remaining items keep their localId for the next attempt.
  const remaining = [];
  for (const p of pending) {
    try {
      const newRef = push(ref(db, pathFor(uid)));
      const { _localId, _attempts, _firstQueuedAt, _lastAttemptAt, _lastError, ...payload } = p;
      await update(newRef, payload);
    } catch (err) {
      remaining.push(decorateFailure(p, err));
    }
  }
  writePending(remaining);
}

export async function listWaitingItems() {
  const uid = getUid();
  if (!uid || !navigator.onLine) return [];
  try {
    const snap = await get(query(ref(db, pathFor(uid)), orderByChild('createdAt')));
    if (!snap.exists()) return [];
    const items = [];
    snap.forEach((c) => {
      const v = c.val();
      if (v && !isSoftDeleted(v)) items.push({ _id: c.key, ...v });
    });
    items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return items;
  } catch { return []; }
}

export async function countWaitingItems() {
  const items = await listWaitingItems();
  return items.length;
}

export async function markHandled(id) {
  const uid = getUid();
  if (!uid) return { ok: false };
  await update(ref(db, `${pathFor(uid)}/${id}`), { deletedAt: Date.now(), handledReason: 'handled' });
  return { ok: true };
}

export async function markChanged(id, note) {
  const uid = getUid();
  if (!uid) return { ok: false };
  await update(ref(db, `${pathFor(uid)}/${id}`), {
    deletedAt: Date.now(),
    handledReason: 'changed',
    handledNote: (note || '').trim(),
  });
  return { ok: true };
}

export function deriveStatus(item) {
  if (!item?.createdAt) return 'fresh';
  const ageDays = (Date.now() - item.createdAt) / (1000 * 60 * 60 * 24);
  if (ageDays >= STATUS_LONG_WAITED_DAYS) return 'long_waited';
  if (ageDays >= STATUS_OLD_DAYS) return 'old';
  return 'fresh';
}
