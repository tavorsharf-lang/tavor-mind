// Centralized helpers for inspecting + acting on the offline queues.
// Each storage util keeps its own queue in localStorage; this module reads
// across all of them to surface "stuck" items (failed >= 3 times or sitting
// in the queue for over 24 hours) and exposes retry / discard primitives.

const KEYS = {
  sessions: 'tavor_mind_pending_sessions',
  checkins: 'tavor_mind_pending_checkins',
  analyses: 'tavor_mind_pending_analyses',
  trigger_analyses: 'tavor_mind_pending_trigger_analyses',
  frames: 'tavor_mind_pending_frames',
  something_waiting: 'tavor_mind_pending_waiting_items_v1',
};

export const PENDING_KEYS = Object.values(KEYS);
export const STUCK_AFTER_ATTEMPTS = 3;
export const STUCK_AFTER_MS = 24 * 60 * 60 * 1000;

function load(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function save(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

export function decorateOnQueue(item) {
  return { _firstQueuedAt: Date.now(), _attempts: 0, ...item };
}

export function decorateFailure(item, err) {
  const message = err?.message || (typeof err === 'string' ? err : null);
  return {
    ...item,
    _firstQueuedAt: item._firstQueuedAt || Date.now(),
    _attempts: (item._attempts || 0) + 1,
    _lastAttemptAt: Date.now(),
    _lastError: message,
  };
}

export function isStuck(item) {
  if ((item._attempts || 0) >= STUCK_AFTER_ATTEMPTS) return true;
  const queuedAt = item._firstQueuedAt || 0;
  if (queuedAt && Date.now() - queuedAt >= STUCK_AFTER_MS) return true;
  return false;
}

// Mark failure metadata on the matching item in a given queue.
// Used by storage utils on immediate-save catch paths.
export function markFailureForType(type, predicate, err) {
  const key = KEYS[type];
  if (!key) return;
  const list = load(key).map((it) => (predicate(it) ? decorateFailure(it, err) : it));
  save(key, list);
}

// ── Identity & description per type ─────────────────────────────────

const SCOPE_LABEL = {
  morning: 'צ׳ק-אין בוקר',
  evening: 'צ׳ק-אין ערב',
  mood: 'צ׳ק-אין מצב רוח',
};

function formatTime(ts) {
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleString('he-IL', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function describe(type, item) {
  if (type === 'sessions') {
    return {
      id: `sessions:${item.ts}`,
      label: 'סשן חירום',
      detail: formatTime(item.ts || item._firstQueuedAt),
    };
  }
  if (type === 'checkins') {
    const scope = item.payload?.scope || 'mood';
    return {
      id: `checkins:${item.uid}:${item.date}:${item.timestamp}`,
      label: SCOPE_LABEL[scope] || 'צ׳ק-אין',
      detail: item.date,
    };
  }
  if (type === 'analyses') {
    const title = item.payload?.title || item.id;
    return {
      id: `analyses:${item.id}`,
      label: 'ניתוח מיובא',
      detail: title,
    };
  }
  if (type === 'trigger_analyses') {
    return {
      id: `trigger_analyses:${item.ts}`,
      label: 'ניתוח טריגר',
      detail: formatTime(item.ts || item._firstQueuedAt),
    };
  }
  if (type === 'frames') {
    return {
      id: `frames:${item.frameId}:${item.ts}`,
      label: 'הכנה לטיפול',
      detail: item.frameId || '',
    };
  }
  if (type === 'something_waiting') {
    const sentence = item.sentence || '';
    return {
      id: `something_waiting:${item._localId || item.createdAt}`,
      label: 'משהו שממתין',
      detail: sentence.length > 30 ? sentence.slice(0, 30) + '…' : sentence,
    };
  }
  return { id: `${type}:?`, label: type, detail: '' };
}

// ── Public read API ─────────────────────────────────────────────────

function* iterAll() {
  for (const [type, key] of Object.entries(KEYS)) {
    for (const item of load(key)) yield { type, key, item };
  }
}

export function getAllPending() {
  const out = [];
  for (const { type, item } of iterAll()) {
    out.push({ type, item, descriptor: describe(type, item) });
  }
  return out;
}

export function getPendingCount() {
  let n = 0;
  for (const _ of iterAll()) n += 1;
  return n;
}

export function getStuckItems() {
  const out = [];
  for (const { type, item } of iterAll()) {
    if (!isStuck(item)) continue;
    const d = describe(type, item);
    out.push({
      type,
      id: d.id,
      label: d.label,
      detail: d.detail,
      attempts: item._attempts || 0,
      lastError: item._lastError || null,
      firstQueuedAt: item._firstQueuedAt || null,
    });
  }
  return out;
}

export function getStuckCount() {
  let n = 0;
  for (const { item } of iterAll()) {
    if (isStuck(item)) n += 1;
  }
  return n;
}

// ── Retry / discard ─────────────────────────────────────────────────

function matcherFor(id) {
  const parts = String(id).split(':');
  const type = parts[0];
  if (type === 'sessions') {
    const ts = Number(parts[1]);
    return { key: KEYS.sessions, predicate: (it) => Number(it.ts) === ts };
  }
  if (type === 'checkins') {
    const [uid, date, timestamp] = parts.slice(1);
    return {
      key: KEYS.checkins,
      predicate: (it) =>
        it.uid === uid && it.date === date && String(it.timestamp) === String(timestamp),
    };
  }
  if (type === 'analyses') {
    const aid = parts.slice(1).join(':');
    return { key: KEYS.analyses, predicate: (it) => it.id === aid };
  }
  if (type === 'trigger_analyses') {
    const ts = Number(parts[1]);
    return { key: KEYS.trigger_analyses, predicate: (it) => Number(it.ts) === ts };
  }
  if (type === 'frames') {
    const [frameId, ts] = parts.slice(1);
    return {
      key: KEYS.frames,
      predicate: (it) => it.frameId === frameId && String(it.ts) === String(ts),
    };
  }
  if (type === 'something_waiting') {
    const tail = parts.slice(1).join(':');
    return {
      key: KEYS.something_waiting,
      predicate: (it) => (it._localId || String(it.createdAt)) === tail,
    };
  }
  return null;
}

// Reset attempt counters + queued-at so the item is no longer "stuck".
// The next flush will retry; if it succeeds the item is removed naturally.
export function clearAttemptsForRetry(id) {
  const m = matcherFor(id);
  if (!m) return false;
  const now = Date.now();
  const list = load(m.key).map((it) =>
    m.predicate(it)
      ? { ...it, _attempts: 0, _lastError: null, _lastAttemptAt: null, _firstQueuedAt: now }
      : it
  );
  save(m.key, list);
  return true;
}

export function discardStuckItem(id) {
  const m = matcherFor(id);
  if (!m) return false;
  const list = load(m.key).filter((it) => !m.predicate(it));
  save(m.key, list);
  return true;
}
