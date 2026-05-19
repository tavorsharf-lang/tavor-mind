import { ref, get, set, update, increment, serverTimestamp } from 'firebase/database';
import { db, auth, ROOM } from '../firebase.js';

// Per-(sessionType, questionId) user-added options. Same exact label → same
// optionId, so re-adding bumps the existing count instead of duplicating.
// Path: tavormind/{uid}/custom_options/{type}/{questionId}/{optionId}

const CUSTOM_PREFIX = 'custom_';

function getUid() {
  return auth.currentUser?.uid || localStorage.getItem('tavor_mind_auth_uid');
}

function pathFor(uid, type, questionId, optionId) {
  return `${ROOM}/${uid}/custom_options/${type}/${questionId}${optionId ? '/' + optionId : ''}`;
}

function slugify(text) {
  return String(text)
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, '_')
    // strip Firebase-illegal key chars and anything that's not letter/number/_-
    .replace(/[.#$/[\]]/g, '')
    .replace(/[^\p{L}\p{N}_-]/gu, '')
    .slice(0, 40);
}

function shortHash(text) {
  let h = 5381;
  const s = String(text);
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h.toString(36).slice(0, 6);
}

export function customOptionIdFromLabel(label) {
  const clean = (label || '').trim();
  if (!clean) return null;
  const slug = slugify(clean);
  return `${CUSTOM_PREFIX}${slug || 'x'}_${shortHash(clean)}`;
}

export function isCustomOptionId(id) {
  return typeof id === 'string' && id.startsWith(CUSTOM_PREFIX);
}

export async function listCustomOptions(type, questionId) {
  const uid = getUid();
  if (!uid || !navigator.onLine) return [];
  try {
    const snap = await get(ref(db, pathFor(uid, type, questionId)));
    if (!snap.exists()) return [];
    const out = [];
    const val = snap.val() || {};
    for (const [id, rec] of Object.entries(val)) {
      if (!rec || typeof rec !== 'object') continue;
      out.push({ id, label: rec.label || id, count: Number(rec.count) || 0, createdAt: rec.createdAt || 0 });
    }
    return out;
  } catch (err) {
    console.warn('listCustomOptions failed:', err?.message || err);
    return [];
  }
}

// Create-or-bump in one call. Returns the optionId (caller selects it).
export async function addOrBumpCustomOption(type, questionId, label) {
  const optionId = customOptionIdFromLabel(label);
  if (!optionId) return null;
  const uid = getUid();
  if (!uid || !navigator.onLine) return optionId;
  try {
    const recRef = ref(db, pathFor(uid, type, questionId, optionId));
    const snap = await get(recRef);
    if (!snap.exists()) {
      await set(recRef, {
        label: (label || '').trim(),
        count: 1,
        createdAt: serverTimestamp(),
      });
    } else {
      await update(recRef, { count: increment(1) });
    }
    return optionId;
  } catch (err) {
    console.warn('addOrBumpCustomOption failed:', err?.message || err);
    return optionId;
  }
}

export async function bumpCustomOption(type, questionId, optionId) {
  if (!isCustomOptionId(optionId)) return;
  const uid = getUid();
  if (!uid || !navigator.onLine) return;
  try {
    const recRef = ref(db, pathFor(uid, type, questionId, optionId));
    const snap = await get(recRef);
    if (!snap.exists()) return;
    await update(recRef, { count: increment(1) });
  } catch (err) {
    console.warn('bumpCustomOption failed:', err?.message || err);
  }
}
