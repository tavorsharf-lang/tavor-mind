import { ref, get, update, increment } from 'firebase/database';
import { db, auth, ROOM } from '../firebase.js';

// Frequency of internal wizard choices, scoped per session-type+question.
// Used to order options so the user's most-picked answers float to the top.
// Path: tavormind/{uid}/choice_frequency/{type}/{questionId}/{optionId} = count

const LOCAL_CACHE_KEY = 'tavor_mind_conversation_choice_frequency';

function getUid() {
  return auth.currentUser?.uid || localStorage.getItem('tavor_mind_auth_uid');
}

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(data));
  } catch {
    /* quota — frequency is nice-to-have */
  }
}

function pathFor(uid, type, questionId) {
  return `${ROOM}/${uid}/choice_frequency/${type}/${questionId}`;
}

// Increment local cache immediately so the next wizard sees fresh data even
// before the Firebase write resolves.
function bumpLocal(type, questionId, optionIds) {
  const cache = readCache();
  if (!cache[type]) cache[type] = {};
  if (!cache[type][questionId]) cache[type][questionId] = {};
  for (const id of optionIds) {
    if (id == null || id === '') continue;
    cache[type][questionId][id] = (cache[type][questionId][id] || 0) + 1;
  }
  writeCache(cache);
}

export async function bumpChoiceCounts(type, questionId, optionIds) {
  const arr = Array.isArray(optionIds) ? optionIds : Array.from(optionIds || []);
  if (!arr.length) return;
  bumpLocal(type, questionId, arr);
  const uid = getUid();
  if (!uid || !navigator.onLine) return;
  try {
    const updates = {};
    for (const id of arr) {
      if (id == null || id === '') continue;
      updates[`${pathFor(uid, type, questionId)}/${id}`] = increment(1);
    }
    if (Object.keys(updates).length === 0) return;
    await update(ref(db), updates);
  } catch (err) {
    console.warn('bumpChoiceCounts failed:', err?.message || err);
  }
}

export async function getCounts(type, questionId) {
  const cache = readCache();
  const local = cache?.[type]?.[questionId] || {};
  const uid = getUid();
  if (!uid || !navigator.onLine) return local;
  try {
    const snap = await get(ref(db, pathFor(uid, type, questionId)));
    if (!snap.exists()) return local;
    const remote = snap.val() || {};
    // merge: take max of remote and local (local can be ahead while offline)
    const merged = { ...remote };
    for (const [k, v] of Object.entries(local)) {
      merged[k] = Math.max(Number(merged[k]) || 0, Number(v) || 0);
    }
    // refresh cache with merged view
    const next = readCache();
    if (!next[type]) next[type] = {};
    next[type][questionId] = merged;
    writeCache(next);
    return merged;
  } catch (err) {
    console.warn('getCounts failed:', err?.message || err);
    return local;
  }
}

export function sortOptionsByCounts(options, counts) {
  if (!Array.isArray(options) || options.length === 0) return [];
  if (!counts || typeof counts !== 'object') return options.slice();
  return options
    .map((opt, idx) => ({ opt, idx, count: Number(counts[opt.id]) || 0 }))
    .sort((a, b) => (b.count - a.count) || (a.idx - b.idx))
    .map((x) => x.opt);
}
