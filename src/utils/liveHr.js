import { ref, get, onValue, off } from 'firebase/database';
import { db, auth } from '../firebase.js';

// Heart-rate sessions live under a top-level node so that an iOS Shortcut
// (no Firebase auth) can write to them via the REST API. Each session is
// scoped under the user's anonymous-auth uid — that uid is unguessable random
// (~28 chars), so it functions as the bearer of the path.
//
// Architecture: post-session, not live. iOS HealthKit doesn't surface live
// workout HR samples to Shortcuts, so we don't try. The user starts a workout
// on the Apple Watch before the emergency session, runs through it normally,
// and at the end taps a button that triggers the Shortcut. The Shortcut reads
// all HR samples from the workout window and POSTs each to Firebase. The web
// app then renders a chart in PhaseSummary.
export const LIVE_HR_ROOT = 'tavormindLiveHr';
export const FIREBASE_DB_URL = 'https://yaniv-game-aeb26-default-rtdb.firebaseio.com';
export const SHORTCUT_NAME = 'TavorMind HR';
// A second tiny Shortcut whose only job is to start a workout on the watch.
// Triggered at the start of an emergency session so HealthKit gets dense HR
// samples (workouts sample at ~1Hz vs passive ~5-10min).
export const SHORTCUT_NAME_START = 'TavorMind HR Start';
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

// Each sample's value is `{bpm: <num>, ts: <ms-or-iso>}`. We accept ts as either
// a numeric ms timestamp or an ISO 8601 string (Date.parse handles both).
function parseTs(rawTs, fallbackKey) {
  if (typeof rawTs === 'number' && Number.isFinite(rawTs)) return rawTs;
  if (typeof rawTs === 'string') {
    const n = Number(rawTs);
    if (Number.isFinite(n)) return n;
    const parsed = Date.parse(rawTs);
    if (Number.isFinite(parsed)) return parsed;
  }
  // Fallback: Firebase push IDs encode a 48-bit ms timestamp in their first 8
  // chars, using a custom base64 alphabet (lex-sortable).
  if (typeof fallbackKey === 'string' && fallbackKey.length >= 8) {
    let ts = 0;
    for (let i = 0; i < 8; i++) {
      const idx = PUSH_ID_CHARS.indexOf(fallbackKey[i]);
      if (idx < 0) return NaN;
      ts = ts * 64 + idx;
    }
    return ts;
  }
  return NaN;
}

const PUSH_ID_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';

export function buildShortcutWriteBase(sessionId) {
  const uid = getUid();
  if (!uid || !sessionId) return null;
  return `${FIREBASE_DB_URL}/${LIVE_HR_ROOT}/${uid}/${sessionId}`;
}

// iOS URL scheme that runs the named Shortcut. Input is `sessionId` alone, or
// `sessionId|<startIso>` when the session start time is known — the Shortcut
// can then filter HealthKit to exactly the session window (no fixed Limit,
// upload time scales with session length, first sample = first session sample).
//
// Why not x-callback-url: returning via a fresh URL load can reset React state
// and lose the cached sessionId. User manually switches back; HrSummaryCard
// re-fetches on visibilitychange.
export function buildRunShortcutUrl(sessionId, startMs = null) {
  let text = sessionId || '';
  if (startMs != null && Number.isFinite(startMs)) {
    const startIso = new Date(startMs).toISOString();
    text = `${text}|${startIso}`;
  }
  return `shortcuts://run-shortcut?name=${encodeURIComponent(SHORTCUT_NAME)}&input=text&text=${encodeURIComponent(text)}`;
}

export function buildStartShortcutUrl() {
  return `shortcuts://run-shortcut?name=${encodeURIComponent(SHORTCUT_NAME_START)}`;
}

// Trigger a custom-scheme URL without navigating Safari away from the page.
// Setting window.location.href causes Safari to keep the broken URL in history;
// a hidden iframe gets iOS to handle the scheme while the main document stays put.
export function launchShortcut(sessionId) {
  if (!sessionId) return;
  const url = buildRunShortcutUrl(sessionId);
  const frame = document.createElement('iframe');
  frame.style.display = 'none';
  frame.setAttribute('aria-hidden', 'true');
  frame.src = url;
  document.body.appendChild(frame);
  setTimeout(() => { frame.remove(); }, 400);
}

// Real-time subscription via Firebase onValue (websocket). Preferred over
// setTimeout-based polling on iOS Safari, which throttles background timers.
// Returns an unsubscribe fn. Callback receives { samples: [{ts, hr}] }.
export function subscribeLiveHrSamples(sessionId, onSnapshot) {
  const uid = getUid();
  if (!uid || !sessionId) return () => {};
  const samplesRef = ref(db, `${LIVE_HR_ROOT}/${uid}/${sessionId}/samples`);
  const handler = (snap) => {
    if (!snap.exists()) {
      onSnapshot({ samples: [] });
      return;
    }
    const val = snap.val() || {};
    const samples = Object.entries(val)
      .map(([key, raw]) => {
        if (raw == null) return null;
        const isObj = typeof raw === 'object';
        const hr = isObj ? Number(raw.bpm) : Number(raw);
        const ts = parseTs(isObj ? raw.ts : null, key);
        return { ts, hr };
      })
      .filter((s) => s && Number.isFinite(s.ts) && Number.isFinite(s.hr) && s.hr > 0)
      .sort((a, b) => a.ts - b.ts);
    onSnapshot({ samples });
  };
  onValue(samplesRef, handler);
  return () => off(samplesRef, 'value', handler);
}

export async function getHrSessionSnapshot(sessionId) {
  const uid = getUid();
  if (!uid || !sessionId) return null;
  try {
    const snap = await get(ref(db, `${LIVE_HR_ROOT}/${uid}/${sessionId}`));
    if (!snap.exists()) return null;
    const val = snap.val() || {};
    const samples = Object.entries(val.samples || {})
      .map(([key, raw]) => {
        if (raw == null) return null;
        // Preferred body: {bpm, ts}. Legacy: bare number.
        const isObj = typeof raw === 'object';
        const hr = isObj ? Number(raw.bpm) : Number(raw);
        const ts = parseTs(isObj ? raw.ts : null, key);
        return { ts, hr };
      })
      .filter((s) => s && Number.isFinite(s.ts) && Number.isFinite(s.hr) && s.hr > 0)
      .sort((a, b) => a.ts - b.ts);
    return { samples, meta: val.meta || {} };
  } catch (err) {
    console.warn('getHrSessionSnapshot failed', err?.message || err);
    return null;
  }
}

// Restrict samples to the session window when one is provided. The Shortcut
// reads HR samples from a relative window (e.g., last 60 minutes), which can
// include data outside the actual emergency session — clip it here.
export function clipToWindow(samples, startMs, endMs) {
  if (!samples) return [];
  return samples.filter((s) => {
    if (startMs != null && s.ts < startMs) return false;
    if (endMs != null && s.ts > endMs) return false;
    return true;
  });
}

// Pick the most recent contiguous cluster of samples, defined as a run where
// no two consecutive samples are more than maxGapMs apart. Workouts produce
// dense (~1Hz) sampling, so any gap longer than ~1 minute marks a session
// boundary. Walks backward from the latest sample until it hits a gap.
export function detectLatestCluster(samples, maxGapMs = 60000) {
  if (!samples || samples.length === 0) return [];
  const sorted = [...samples].sort((a, b) => a.ts - b.ts);
  let startIdx = 0;
  for (let i = sorted.length - 1; i > 0; i--) {
    const gap = sorted[i].ts - sorted[i - 1].ts;
    if (gap > maxGapMs) {
      startIdx = i;
      break;
    }
  }
  return sorted.slice(startIdx);
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
