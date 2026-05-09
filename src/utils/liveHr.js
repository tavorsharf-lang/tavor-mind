import { ref, onValue, off, get, set } from 'firebase/database';
import { db, auth } from '../firebase.js';

// Live heart-rate sessions live under a top-level node so that an iOS Shortcut
// (no Firebase auth) can write to them via the REST API. Each session is
// scoped under the user's anonymous-auth uid — that uid is unguessable random
// (~28 chars), so it functions as the bearer of the path.
export const LIVE_HR_ROOT = 'tavormindLiveHr';
export const FIREBASE_DB_URL = 'https://yaniv-game-aeb26-default-rtdb.firebaseio.com';
export const SHORTCUT_NAME = 'TavorMind HR';
export const HR_SETUP_KEY = 'tavor_mind_hr_setup_done';

function getUid() {
  return auth.currentUser?.uid || localStorage.getItem('tavor_mind_auth_uid');
}

export function getCurrentUid() {
  return getUid();
}

export function generateHrSessionId() {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `${t}-${r}`;
}

// Firebase push IDs encode a 48-bit ms timestamp in their first 8 chars,
// using a custom base64 alphabet (lex-sortable). Decoded value is ms since epoch.
const PUSH_ID_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
function decodePushIdTimestamp(key) {
  if (typeof key !== 'string' || key.length < 8) return NaN;
  let ts = 0;
  for (let i = 0; i < 8; i++) {
    const idx = PUSH_ID_CHARS.indexOf(key[i]);
    if (idx < 0) return NaN;
    ts = ts * 64 + idx;
  }
  return ts;
}

// The Shortcut POSTs samples to <base>/samples.json with body `{"bpm": <num>}`.
// Firebase generates an auto-id key whose timestamp we decode on read.
export function buildShortcutWriteBase(sessionId) {
  const uid = getUid();
  if (!uid || !sessionId) return null;
  return `${FIREBASE_DB_URL}/${LIVE_HR_ROOT}/${uid}/${sessionId}`;
}

// iOS URL scheme that runs the named Shortcut with the sessionId as text input.
export function buildRunShortcutUrl(sessionId) {
  return `shortcuts://run-shortcut?name=${encodeURIComponent(SHORTCUT_NAME)}&input=text&text=${encodeURIComponent(sessionId)}`;
}

// Returns an unsubscribe fn. The callback receives `{ samples, lastTs }` where
// samples is sorted ascending by ts. RTDB onValue fires once with current data
// then on every update — for samples this means new keys appearing.
export function subscribeLiveHrSamples(sessionId, onSnapshot) {
  const uid = getUid();
  if (!uid || !sessionId) return () => {};
  const samplesRef = ref(db, `${LIVE_HR_ROOT}/${uid}/${sessionId}/samples`);
  const handler = (snap) => {
    if (!snap.exists()) {
      onSnapshot({ samples: [], lastTs: 0 });
      return;
    }
    const val = snap.val() || {};
    const samples = Object.entries(val)
      .map(([key, raw]) => {
        // Body shape: `{"bpm": <num>}` (preferred). Bare numbers also accepted.
        const hr = typeof raw === 'object' && raw !== null ? Number(raw.bpm) : Number(raw);
        // Key shape: numeric ms (PUT path), or Firebase push id (POST path —
        // first 8 chars encode ms since epoch in a base64-like alphabet).
        let ts = Number(key);
        if (!Number.isFinite(ts)) ts = decodePushIdTimestamp(key);
        return { ts, hr };
      })
      .filter((s) => Number.isFinite(s.ts) && Number.isFinite(s.hr) && s.hr > 0)
      .sort((a, b) => a.ts - b.ts);
    onSnapshot({
      samples,
      lastTs: samples.length ? samples[samples.length - 1].ts : 0,
    });
  };
  onValue(samplesRef, handler);
  return () => off(samplesRef, 'value', handler);
}

export async function markHrSessionStart(sessionId) {
  const uid = getUid();
  if (!uid || !sessionId) return;
  try {
    await set(ref(db, `${LIVE_HR_ROOT}/${uid}/${sessionId}/meta/startedAt`), Date.now());
  } catch (err) {
    console.warn('markHrSessionStart failed', err?.message || err);
  }
}

export async function markHrSessionEnd(sessionId) {
  const uid = getUid();
  if (!uid || !sessionId) return;
  try {
    await set(ref(db, `${LIVE_HR_ROOT}/${uid}/${sessionId}/meta/endedAt`), Date.now());
  } catch (err) {
    console.warn('markHrSessionEnd failed', err?.message || err);
  }
}

export async function getHrSessionSnapshot(sessionId) {
  const uid = getUid();
  if (!uid || !sessionId) return null;
  try {
    const snap = await get(ref(db, `${LIVE_HR_ROOT}/${uid}/${sessionId}`));
    if (!snap.exists()) return null;
    const val = snap.val() || {};
    const samples = Object.entries(val.samples || {})
      .map(([ts, hr]) => ({ ts: Number(ts), hr: Number(hr) }))
      .filter((s) => Number.isFinite(s.ts) && Number.isFinite(s.hr) && s.hr > 0)
      .sort((a, b) => a.ts - b.ts);
    return { samples, meta: val.meta || {} };
  } catch (err) {
    console.warn('getHrSessionSnapshot failed', err?.message || err);
    return null;
  }
}

export function summarizeSamples(samples) {
  if (!samples || samples.length === 0) return null;
  let min = Infinity, max = -Infinity, sum = 0;
  for (const { hr } of samples) {
    if (hr < min) min = hr;
    if (hr > max) max = hr;
    sum += hr;
  }
  return {
    count: samples.length,
    min: Math.round(min),
    max: Math.round(max),
    avg: Math.round(sum / samples.length),
    start: Math.round(samples[0].hr),
    end: Math.round(samples[samples.length - 1].hr),
    delta: Math.round(samples[samples.length - 1].hr - samples[0].hr),
    durationMs: samples[samples.length - 1].ts - samples[0].ts,
  };
}

export function isHrSetupDone() {
  try { return localStorage.getItem(HR_SETUP_KEY) === '1'; } catch { return false; }
}

export function markHrSetupDone() {
  try { localStorage.setItem(HR_SETUP_KEY, '1'); } catch {}
}

export function clearHrSetup() {
  try { localStorage.removeItem(HR_SETUP_KEY); } catch {}
}

// Single-write probe for the setup-screen "test connection" button.
// Writes a fake HR sample under a probe sessionId so the user can verify their
// Shortcut config + Firebase rules end-to-end before relying on it in a real session.
export async function readProbeSnapshot(sessionId) {
  return getHrSessionSnapshot(sessionId);
}
