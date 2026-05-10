import { ref, set, get, serverTimestamp } from 'firebase/database';
import { db, auth, ROOM } from '../firebase.js';
import { decorateOnQueue, decorateFailure } from './syncQueue.js';

const PENDING_KEY = 'tavor_mind_pending_frames';

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

function pathFor(uid, frameId) {
  return `${ROOM}/${uid}/therapy_frames/${frameId}`;
}

function emptyFrame(sessionDate) {
  return {
    frameId: sessionDate,
    sessionDate,
    prepText: '',
    prepCreatedAt: null,
    debriefText: '',
    debriefCreatedAt: null,
    linkedAnalysisId: null,
  };
}

async function readRemoteFrame(uid, sessionDate) {
  if (!uid || !navigator.onLine) return null;
  try {
    const snap = await get(ref(db, pathFor(uid, sessionDate)));
    return snap.exists() ? snap.val() : null;
  } catch (err) {
    console.warn('readRemoteFrame failed:', err?.message || err);
    return null;
  }
}

function mergeFromPending(uid, sessionDate, base) {
  const pending = loadPending().filter((p) => p.uid === uid && p.frameId === sessionDate);
  if (!pending.length) return base;
  let out = base ? { ...base } : emptyFrame(sessionDate);
  for (const p of pending) {
    out = { ...out, ...p.payload };
  }
  return out;
}

export async function getFrame(sessionDate) {
  const uid = getUid();
  if (!uid || !sessionDate) return null;
  const remote = await readRemoteFrame(uid, sessionDate);
  return mergeFromPending(uid, sessionDate, remote);
}

async function writeFrameUpdate(sessionDate, partial) {
  const uid = getUid();
  if (!uid || !sessionDate) return { ok: false, reason: 'no-uid' };

  // Reference-equality on `payload` after JSON round-trip never matched, so the
  // pending entry leaked → duplicate writes / overwritten remote on every save.
  // Tag with a unique _localId and filter by it.
  const localId = `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const pending = loadPending();
  pending.push(decorateOnQueue({ uid, frameId: sessionDate, ts: Date.now(), _localId: localId, payload: partial }));
  savePending(pending);

  if (!navigator.onLine) return { ok: false, reason: 'offline' };

  try {
    const existing = await readRemoteFrame(uid, sessionDate);
    const base = existing || emptyFrame(sessionDate);
    const next = { ...base, ...partial, _savedAt: serverTimestamp() };
    await set(ref(db, pathFor(uid, sessionDate)), next);
    const after = loadPending().filter((p) => p._localId !== localId);
    savePending(after);
    return { ok: true };
  } catch (err) {
    console.warn('writeFrameUpdate failed:', err?.message || err);
    return { ok: false, reason: 'error' };
  }
}

export async function saveFramePrep(sessionDate, text) {
  return writeFrameUpdate(sessionDate, {
    prepText: text,
    prepCreatedAt: new Date().toISOString(),
  });
}

export async function saveFrameDebrief(sessionDate, text) {
  return writeFrameUpdate(sessionDate, {
    debriefText: text,
    debriefCreatedAt: new Date().toISOString(),
  });
}

export async function listFrames() {
  const uid = getUid();
  if (!uid) return [];
  const out = [];
  if (navigator.onLine) {
    try {
      const snap = await get(ref(db, `${ROOM}/${uid}/therapy_frames`));
      if (snap.exists()) {
        Object.values(snap.val()).forEach((v) => out.push(v));
      }
    } catch (err) {
      console.warn('listFrames failed:', err?.message || err);
    }
  }
  const pending = loadPending().filter((p) => p.uid === uid);
  const byId = new Map(out.map((f) => [f.frameId, f]));
  for (const p of pending) {
    const existing = byId.get(p.frameId) || emptyFrame(p.frameId);
    byId.set(p.frameId, { ...existing, ...p.payload });
  }
  const merged = Array.from(byId.values());
  merged.sort((a, b) => (a.sessionDate < b.sessionDate ? 1 : -1));
  return merged;
}

export async function getFrameByLinkedAnalysisId(analysisId) {
  if (!analysisId) return null;
  const all = await listFrames();
  return all.find((f) => f.linkedAnalysisId === analysisId) || null;
}

export async function findClosestFrame(occurredDateString, withinDays = 3) {
  if (!occurredDateString) return null;
  const all = await listFrames();
  const candidates = all
    .filter((f) => !f.linkedAnalysisId)
    .map((f) => ({ frame: f, distance: Math.abs(daysBetween(f.sessionDate, occurredDateString)) }))
    .filter((c) => c.distance <= withinDays);
  candidates.sort((a, b) => a.distance - b.distance);
  return candidates[0]?.frame || null;
}

function daysBetween(a, b) {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const at = Date.UTC(ay, am - 1, ad);
  const bt = Date.UTC(by, bm - 1, bd);
  return Math.round((at - bt) / (24 * 60 * 60 * 1000));
}

export async function linkFrameToAnalysis(frameId, analysisId) {
  const uid = getUid();
  if (!uid || !frameId || !analysisId) return { ok: false };
  return writeFrameUpdate(frameId, { linkedAnalysisId: analysisId });
}

export async function flushPendingFrames() {
  const uid = getUid();
  if (!uid || !navigator.onLine) return;
  const pending = loadPending();
  if (!pending.length) return;
  const remaining = [];
  const groups = new Map();
  for (const item of pending) {
    if (!groups.has(item.frameId)) groups.set(item.frameId, []);
    groups.get(item.frameId).push(item);
  }
  for (const [frameId, items] of groups.entries()) {
    try {
      const existing = await readRemoteFrame(uid, frameId);
      let merged = existing || emptyFrame(frameId);
      for (const it of items) merged = { ...merged, ...it.payload };
      merged._savedAt = serverTimestamp();
      await set(ref(db, pathFor(uid, frameId)), merged);
    } catch (err) {
      for (const it of items) remaining.push(decorateFailure(it, err));
    }
  }
  savePending(remaining);
}
