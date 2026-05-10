import { ref, set, get, update, remove, serverTimestamp } from 'firebase/database';
import { db, auth, ROOM } from '../firebase.js';
import { getIsraelDateString } from './dateHelpers.js';
import { findClosestFrame, linkFrameToAnalysis } from './therapyStorage.js';
import { decorateOnQueue, decorateFailure, markFailureForType } from './syncQueue.js';
import { isSoftDeleted, isPurgeable } from './softDelete.js';

const PENDING_KEY = 'tavor_mind_pending_analyses';

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

function pathFor(uid, id) {
  return `${ROOM}/${uid}/analyses/${id}`;
}

// Defensive parse: malformed `occurredAt` strings produce NaN which makes
// Array.sort unstable. Fall back to clientTs / _importedAt when invalid.
function parseAnalysisTimestamp(item) {
  if (item?.occurredAt) {
    const t = new Date(item.occurredAt).getTime();
    if (Number.isFinite(t)) return t;
  }
  if (Number.isFinite(item?.clientTs)) return item.clientTs;
  if (Number.isFinite(item?._importedAt)) return item._importedAt;
  return 0;
}

export async function saveAnalysis(normalized) {
  const uid = getUid();
  const id = normalized._id;
  const localCopy = { ...normalized, _importedAt: Date.now() };
  const remotePayload = { ...normalized, _importedAt: serverTimestamp() };

  const pending = loadPending();
  pending.push(decorateOnQueue({ uid, id, payload: localCopy }));
  savePending(pending);

  if (!uid || !navigator.onLine) {
    return { ok: false, reason: 'offline', id };
  }

  try {
    await set(ref(db, pathFor(uid, id)), remotePayload);
    const after = loadPending().filter((p) => !(p.uid === uid && p.id === id));
    savePending(after);
    if (normalized.type === 'therapy_session') {
      try {
        const occurredDate = normalized.occurredAt
          ? getIsraelDateString(new Date(normalized.occurredAt))
          : null;
        if (occurredDate) {
          const frame = await findClosestFrame(occurredDate, 1);
          if (frame) await linkFrameToAnalysis(frame.frameId, id);
        }
      } catch (linkErr) {
        console.warn('frame auto-link failed:', linkErr?.message || linkErr);
      }
    }
    return { ok: true, id };
  } catch (err) {
    const message = err?.message || String(err);
    const code = err?.code || null;
    console.error('analysis save failed:', { code, message, path: pathFor(uid, id), payloadKeys: Object.keys(remotePayload) });
    markFailureForType('analyses', (p) => p.uid === uid && p.id === id, err);
    return { ok: false, reason: 'error', id, message, code };
  }
}

export async function getAnalysis(id) {
  const uid = getUid();
  if (!uid) return null;
  const local = loadPending().find((p) => p.uid === uid && p.id === id);
  if (local) return local.payload;
  if (!navigator.onLine) return null;
  try {
    const snap = await get(ref(db, pathFor(uid, id)));
    if (!snap.exists()) return null;
    const val = snap.val();
    if (isSoftDeleted(val)) return null;
    return val;
  } catch (err) {
    console.warn('getAnalysis failed:', err?.message || err);
    return null;
  }
}

function passesFilters(item, { typeFilter, schemaFilter, patternFilter, searchText }) {
  if (typeFilter && typeFilter.size > 0 && !typeFilter.has(item.type)) return false;
  if (schemaFilter && schemaFilter.size > 0) {
    const arr = Array.isArray(item.schemas_activated) ? item.schemas_activated : [];
    if (!arr.some((s) => schemaFilter.has(s))) return false;
  }
  if (patternFilter && patternFilter.size > 0) {
    const p = item.patterns || {};
    const anyTrue = Array.from(patternFilter).some((k) => p[k] === true);
    if (!anyTrue) return false;
  }
  if (searchText && searchText.trim()) {
    const needle = searchText.trim().toLowerCase();
    const haystacks = [
      item.title,
      item.summary,
      Array.isArray(item.tags) ? item.tags.join(' ') : '',
      item.payload?.insight,
      item.payload?.central_sentence,
    ];
    const text = haystacks.filter(Boolean).join(' ').toLowerCase();
    if (!text.includes(needle)) return false;
  }
  return true;
}

export async function listAnalyses(filters = {}) {
  const uid = getUid();
  if (!uid) return [];
  const out = [];
  if (navigator.onLine) {
    try {
      const snap = await get(ref(db, `${ROOM}/${uid}/analyses`));
      if (snap.exists()) {
        Object.values(snap.val()).forEach((v) => out.push(v));
      }
    } catch (err) {
      console.warn('listAnalyses failed:', err?.message || err);
    }
  }
  const pending = loadPending().filter((p) => p.uid === uid);
  for (const p of pending) {
    if (!out.some((a) => a._id === p.id)) {
      out.push({ ...p.payload, _pending: true });
    }
  }
  // Lazy purge: hard-remove items soft-deleted >30 days ago (best-effort, fire-and-forget).
  if (uid && navigator.onLine) {
    const now = Date.now();
    for (const item of out) {
      if (isPurgeable(item, now) && item._id) {
        remove(ref(db, pathFor(uid, item._id))).catch(() => {});
      }
    }
  }
  const visible = out.filter((item) => !isSoftDeleted(item));
  const filtered = visible.filter((item) => passesFilters(item, filters));
  filtered.sort((a, b) => {
    const ta = parseAnalysisTimestamp(a);
    const tb = parseAnalysisTimestamp(b);
    return tb - ta;
  });
  return filtered;
}

export async function deleteAnalysis(id) {
  const uid = getUid();
  if (!uid) return { ok: false, reason: 'no-uid' };
  // Pending items have no server presence to soft-delete; remove them outright (no undo).
  const wasPending = loadPending().some((p) => p.uid === uid && p.id === id);
  const after = loadPending().filter((p) => !(p.uid === uid && p.id === id));
  savePending(after);
  if (!navigator.onLine) return { ok: wasPending, reason: wasPending ? 'pending-only' : 'offline' };
  try {
    const r = ref(db, pathFor(uid, id));
    const snap = await get(r);
    if (!snap.exists()) {
      return { ok: true, restorable: false, reason: wasPending ? 'pending-only' : 'not-found' };
    }
    await update(r, { deletedAt: serverTimestamp() });
    return { ok: true, restorable: true };
  } catch (err) {
    console.warn('deleteAnalysis failed:', err?.message || err);
    return { ok: false, reason: 'error' };
  }
}

export async function listDeletedAnalyses() {
  const uid = getUid();
  if (!uid || !navigator.onLine) return [];
  try {
    const snap = await get(ref(db, `${ROOM}/${uid}/analyses`));
    if (!snap.exists()) return [];
    const items = Object.values(snap.val()).filter((v) => v && typeof v === 'object' && isSoftDeleted(v));
    items.sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
    return items;
  } catch (err) {
    console.warn('listDeletedAnalyses failed:', err?.message || err);
    return [];
  }
}

export async function purgeAnalysis(id) {
  const uid = getUid();
  if (!uid) return { ok: false, reason: 'no-uid' };
  if (!navigator.onLine) return { ok: false, reason: 'offline' };
  try {
    await remove(ref(db, pathFor(uid, id)));
    return { ok: true };
  } catch (err) {
    console.warn('purgeAnalysis failed:', err?.message || err);
    return { ok: false, reason: 'error' };
  }
}

export async function restoreAnalysis(id) {
  const uid = getUid();
  if (!uid) return { ok: false, reason: 'no-uid' };
  if (!navigator.onLine) return { ok: false, reason: 'offline' };
  try {
    const r = ref(db, pathFor(uid, id));
    const snap = await get(r);
    if (!snap.exists()) return { ok: false, reason: 'not-found' };
    await update(r, { deletedAt: null });
    return { ok: true };
  } catch (err) {
    console.warn('restoreAnalysis failed:', err?.message || err);
    return { ok: false, reason: 'error' };
  }
}

export async function flushPendingAnalyses() {
  const uid = getUid();
  if (!uid || !navigator.onLine) return;
  const pending = loadPending();
  if (!pending.length) return;
  const remaining = [];
  for (const item of pending) {
    try {
      const payload = { ...item.payload, _importedAt: serverTimestamp() };
      await set(ref(db, pathFor(item.uid || uid, item.id)), payload);
    } catch (err) {
      remaining.push(decorateFailure(item, err));
    }
  }
  savePending(remaining);
}
