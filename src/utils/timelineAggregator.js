import { ref, get } from 'firebase/database';
import { db, auth, ROOM } from '../firebase.js';
import { getIsraelDateString, lastNDateStrings } from './dateHelpers.js';
import { isSoftDeleted } from './softDelete.js';

const SCOPE_DAYS = { week: 7, month: 30, '90d': 90 };

function getUid() {
  return auth.currentUser?.uid || localStorage.getItem('tavor_mind_auth_uid');
}

async function readNode(uid, key) {
  try {
    const snap = await get(ref(db, `${ROOM}/${uid}/${key}`));
    return snap.exists() ? snap.val() : {};
  } catch (err) {
    console.warn(`timeline: read ${key} failed`, err?.message || err);
    return {};
  }
}

function toIsraelDateFromMs(ms) {
  return getIsraelDateString(new Date(ms));
}

function toIsraelDateFromIso(iso) {
  if (!iso) return null;
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return null;
  return toIsraelDateFromMs(ms);
}

export async function aggregateTimeline(scope = 'week') {
  const uid = getUid();
  if (!uid) return [];

  const days = SCOPE_DAYS[scope] || SCOPE_DAYS.week;
  const dateSet = new Set(lastNDateStrings(days));

  const [emergencyRaw, checkinsRaw, triggersRaw, modeChecksRaw, catastropheRaw, analysesRaw] = await Promise.all([
    readNode(uid, 'emergency_sessions'),
    readNode(uid, 'checkins'),
    readNode(uid, 'triggers'),
    readNode(uid, 'mode_checks'),
    readNode(uid, 'catastrophe_checks'),
    readNode(uid, 'analyses'),
  ]);

  const out = [];

  // Emergency sessions: keyed by ts
  for (const [tsKey, data] of Object.entries(emergencyRaw || {})) {
    if (!data || typeof data !== 'object') continue;
    if (isSoftDeleted(data)) continue;
    const ts = parseInt(tsKey, 10) || data.clientTs || data.startedAtClient || 0;
    if (!ts) continue;
    if (!dateSet.has(toIsraelDateFromMs(ts))) continue;
    out.push({ kind: 'emergency', ts, refId: tsKey, data });
  }

  // Mood checkins: keyed by date → { [timestamp]: { scope, valence, emotions } }
  for (const [dateKey, dayObj] of Object.entries(checkinsRaw || {})) {
    if (!dateSet.has(dateKey) || !dayObj || typeof dayObj !== 'object') continue;
    for (const [tsKey, entry] of Object.entries(dayObj)) {
      if (!/^\d+$/.test(tsKey) || !entry || typeof entry !== 'object') continue;
      if (entry.valence == null) continue;
      if (isSoftDeleted(entry)) continue;
      const ts = Number(tsKey);
      out.push({ kind: 'mood', ts, refDate: dateKey, refTs: ts, data: entry });
    }
  }

  // Tools: keyed by ts
  const toolMap = [
    { raw: triggersRaw, kind: 'trigger', category: 'triggers' },
    { raw: modeChecksRaw, kind: 'mode_check', category: 'mode_checks' },
    { raw: catastropheRaw, kind: 'catastrophe', category: 'catastrophe_checks' },
  ];
  for (const { raw, kind, category } of toolMap) {
    for (const [tsKey, data] of Object.entries(raw || {})) {
      if (!data || typeof data !== 'object') continue;
      if (isSoftDeleted(data)) continue;
      const ts = parseInt(tsKey, 10) || data.clientTs || 0;
      if (!ts) continue;
      if (!dateSet.has(toIsraelDateFromMs(ts))) continue;
      out.push({ kind, ts, refId: tsKey, refCategory: category, data });
    }
  }

  // Analyses: occurredAt (ISO) preferred, fallback to clientTs / _importedAt
  for (const [id, a] of Object.entries(analysesRaw || {})) {
    if (!a || typeof a !== 'object') continue;
    if (isSoftDeleted(a)) continue;
    const dateStr = toIsraelDateFromIso(a.occurredAt) || toIsraelDateFromMs(a.clientTs || a._importedAt);
    if (!dateStr || !dateSet.has(dateStr)) continue;
    const ts = a.occurredAt ? new Date(a.occurredAt).getTime() : (a.clientTs || a._importedAt || 0);
    out.push({ kind: 'analysis', ts, refId: id, data: a });
  }

  out.sort((a, b) => b.ts - a.ts);
  return out;
}
