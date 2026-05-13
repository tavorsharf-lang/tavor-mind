// Tracks how many times the user has picked each option in a given list, so
// chips can be ordered by personal frequency — most-picked first. Counts live
// in localStorage; first-time users see the original list order (all zeros,
// stable tie-break by original index).

const STORAGE_KEY = 'tavor_mind_option_frequencies';

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota or private mode — silently drop, frequency is a nice-to-have */
  }
}

export function getCounts(listId) {
  const all = readAll();
  return all[listId] || {};
}

export function incrementCounts(listId, ids) {
  const arr = Array.isArray(ids) ? ids : Array.from(ids || []);
  if (!arr.length) return;
  const all = readAll();
  const list = { ...(all[listId] || {}) };
  for (const id of arr) {
    if (id == null || id === '') continue;
    list[id] = (list[id] || 0) + 1;
  }
  all[listId] = list;
  writeAll(all);
}

export function sortByFrequency(options, listId, idKey = 'id') {
  const counts = getCounts(listId);
  return options
    .map((opt, idx) => ({ opt, idx, count: counts[opt[idKey]] || 0 }))
    .sort((a, b) => (b.count - a.count) || (a.idx - b.idx))
    .map((x) => x.opt);
}
