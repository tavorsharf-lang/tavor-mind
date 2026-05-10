import { ref, get } from 'firebase/database';
import { db, auth, ROOM } from '../firebase.js';
import { getIsraelDateString, lastNDateStrings } from './dateHelpers.js';
import { EMOTIONS as EMOTION_VOCAB, emotionLabelById } from '../data/emotionsCorpus.js';
import { resolveModeId, modes as ALL_MODES } from '../data/modes.js';
import { SCHEMA_LABELS } from '../data/analysisSchemas.js';
import { isSoftDeleted } from './softDelete.js';

const SCOPE_DAYS = { week: 7, month: 30, '90d': 90 };
const NOT_ENOUGH = 'לא מספיק';

function getUid() {
  return auth.currentUser?.uid || localStorage.getItem('tavor_mind_auth_uid');
}

async function readNode(uid, key) {
  try {
    const snap = await get(ref(db, `${ROOM}/${uid}/${key}`));
    return snap.exists() ? snap.val() : {};
  } catch (err) {
    console.warn(`review: read ${key} failed`, err?.message || err);
    return {};
  }
}

function valuesOf(obj) {
  if (!obj || typeof obj !== 'object') return [];
  return Object.values(obj).filter((v) => v && typeof v === 'object' && !isSoftDeleted(v));
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

function bumpCount(map, key) {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + 1);
}

function pushUnique(map, key, value) {
  if (!key || value == null || value === '') return;
  if (!map.has(key)) map.set(key, new Set());
  map.get(key).add(value);
}

function normalizeTriggerName(s) {
  if (typeof s !== 'string') return '';
  const trimmed = s.trim().replace(/\s+/g, ' ');
  return trimmed.length > 50 ? trimmed.slice(0, 50) + '…' : trimmed;
}

function countOccurrences(haystack, needle) {
  if (!haystack || typeof haystack !== 'string') return 0;
  let count = 0;
  let i = 0;
  while ((i = haystack.indexOf(needle, i)) !== -1) {
    count += 1;
    i += needle.length;
  }
  return count;
}

function extractAnalysisText(a) {
  const parts = [a.summary || ''];
  const p = a.payload || {};
  parts.push(p.insight || '', p.central_sentence || '', p.what_was_needed || '', p.original_phrasing || '', p.final_phrasing || '');
  if (Array.isArray(p.thoughts_identified)) parts.push(...p.thoughts_identified);
  if (Array.isArray(p.blind_spots)) parts.push(...p.blind_spots);
  return parts.filter(Boolean).join(' ');
}

function streakOfDays(dateStrings, datesWithEither) {
  // dateStrings is oldest→newest; datesWithEither is a Set of date strings
  let longest = 0;
  let current = 0;
  for (const ds of dateStrings) {
    if (datesWithEither.has(ds)) {
      current += 1;
      if (current > longest) longest = current;
    } else {
      current = 0;
    }
  }
  return longest;
}

export async function aggregateReview(scope = 'week') {
  const uid = getUid();
  const days = SCOPE_DAYS[scope] || SCOPE_DAYS.week;
  // dateStrings ordered oldest → newest (lastNDateStrings returns newest first)
  const dateStrings = lastNDateStrings(days).slice().reverse();
  const startDate = dateStrings[0];
  const endDate = dateStrings[dateStrings.length - 1];
  const dateSet = new Set(dateStrings);

  const empty = {
    scope, startDate, endDate,
    moodRhythm: { totalDays: days, daysWithEntries: 0, perDay: [], streakLength: 0, valence_trend: [] },
    emotions: { fromCheckins: [], fromAnalyses: [], absent: EMOTION_VOCAB.map((e) => e.id) },
    triggers: [],
    patterns: {
      not_enough_appeared: { count: 0, total: 0, sources: [] },
      dichotomous_phrasing: { count: 0, total: 0, sources: [] },
      body_as_compass: { count: 0, total: 0, sources: [] },
      core_child_addressed: { count: 0, total: 0, sources: [] },
    },
    modes: [],
    schemas: { activations: [], not_activated: Object.keys(SCHEMA_LABELS) },
    coreChild: { sessions_addressed: 0, appearances_in_text: 0, last_addressed: null, needs_expressed: [] },
    hasEnoughData: false,
  };

  if (!uid) return empty;

  const [emergencyRaw, checkinsRaw, triggersRaw, modeChecksRaw, catastropheRaw, somaticRaw, analysesRaw] = await Promise.all([
    readNode(uid, 'emergency_sessions'),
    readNode(uid, 'checkins'),
    readNode(uid, 'triggers'),
    readNode(uid, 'mode_checks'),
    readNode(uid, 'catastrophe_checks'),
    readNode(uid, 'somatic_sessions'),
    readNode(uid, 'analyses'),
  ]);

  // ── Filter by scope ──────────────────────────────────────────────
  const inScopeByDate = (dateString) => dateString && dateSet.has(dateString);
  const inScopeByMs = (ms) => {
    if (typeof ms !== 'number' || Number.isNaN(ms)) return false;
    return dateSet.has(toIsraelDateFromMs(ms));
  };

  // Checkins: each day → array of mood entries (timestamp-keyed children)
  const checkinsInScope = [];
  for (const [dateKey, dayObj] of Object.entries(checkinsRaw)) {
    if (!inScopeByDate(dateKey) || !dayObj || typeof dayObj !== 'object') continue;
    const entries = [];
    for (const [k, v] of Object.entries(dayObj)) {
      if (!/^\d+$/.test(k) || !v || typeof v !== 'object') continue;
      if (v.valence == null) continue;
      if (isSoftDeleted(v)) continue;
      entries.push({ ...v, _ts: Number(k) });
    }
    if (entries.length) checkinsInScope.push({ date: dateKey, entries });
  }

  const triggersInScope = valuesOf(triggersRaw).filter((t) => inScopeByMs(t.clientTs || t.createdAt));
  const modeChecksInScope = valuesOf(modeChecksRaw).filter((t) => inScopeByMs(t.clientTs || t.createdAt));
  const catastropheInScope = valuesOf(catastropheRaw).filter((t) => inScopeByMs(t.clientTs || t.createdAt));
  const somaticInScope = valuesOf(somaticRaw).filter((t) => inScopeByMs(t.clientTs || t.createdAt));
  const emergencyInScope = valuesOf(emergencyRaw).filter((s) => inScopeByMs(s.clientTs || s.startedAtClient));

  // Analyses: prefer occurredAt (in scope) then dedupe by date — count once per day per type if many on same day
  const analysesAll = valuesOf(analysesRaw);
  const seenAnalysisDays = new Set();
  const analysesInScope = [];
  for (const a of analysesAll) {
    const d = toIsraelDateFromIso(a.occurredAt) || toIsraelDateFromMs(a.clientTs || a._importedAt);
    if (!d || !inScopeByDate(d)) continue;
    const key = `${a.type}:${d}:${a._id}`;
    if (seenAnalysisDays.has(key)) continue;
    seenAnalysisDays.add(key);
    analysesInScope.push({ ...a, _scopeDate: d });
  }

  // ── MoodRhythm ───────────────────────────────────────────────────
  const dayValenceMap = new Map(); // date → { sum, count }
  for (const ci of checkinsInScope) {
    let sum = 0;
    let count = 0;
    for (const e of ci.entries) {
      if (typeof e.valence === 'number') {
        sum += e.valence;
        count += 1;
      }
    }
    if (count) dayValenceMap.set(ci.date, { sum, count, avg: sum / count });
  }
  const datesWithEntries = new Set(dayValenceMap.keys());
  const valence_trend = dateStrings
    .filter((d) => dayValenceMap.has(d))
    .map((d) => ({ date: d, score: dayValenceMap.get(d).avg }));
  const moodRhythm = {
    totalDays: days,
    daysWithEntries: datesWithEntries.size,
    streakLength: streakOfDays(dateStrings, datesWithEntries),
    valence_trend,
    perDay: dateStrings.map((d) => ({
      date: d,
      hasEntries: datesWithEntries.has(d),
      avgValence: dayValenceMap.get(d)?.avg ?? null,
      count: dayValenceMap.get(d)?.count ?? 0,
    })),
  };

  // ── Emotions ─────────────────────────────────────────────────────
  const emoFromCheckins = new Map(); // id → { count, contexts:Set }
  for (const ci of checkinsInScope) {
    for (const entry of ci.entries) {
      if (!Array.isArray(entry.emotions)) continue;
      for (const eid of entry.emotions) {
        if (!emoFromCheckins.has(eid)) emoFromCheckins.set(eid, { count: 0, contexts: new Set() });
        emoFromCheckins.get(eid).count += 1;
        if (entry.scope) emoFromCheckins.get(eid).contexts.add(entry.scope);
      }
    }
  }

  const emoFromAnalyses = new Map(); // name → { count, intensitySum, intensityN, sources:Set }
  for (const a of analysesInScope) {
    const p = a.payload || {};
    if (Array.isArray(p.emotions)) {
      for (const e of p.emotions) {
        if (!e?.name) continue;
        if (!emoFromAnalyses.has(e.name)) emoFromAnalyses.set(e.name, { count: 0, intensitySum: 0, intensityN: 0, sources: new Set() });
        const slot = emoFromAnalyses.get(e.name);
        slot.count += 1;
        slot.sources.add(a.type);
        const intensity = Number(e.intensity);
        if (Number.isFinite(intensity) && intensity > 0) {
          slot.intensitySum += intensity;
          slot.intensityN += 1;
        }
      }
    }
    if (Array.isArray(p.recurring_emotions)) {
      for (const e of p.recurring_emotions) {
        if (!e?.name) continue;
        if (!emoFromAnalyses.has(e.name)) emoFromAnalyses.set(e.name, { count: 0, intensitySum: 0, intensityN: 0, sources: new Set() });
        const slot = emoFromAnalyses.get(e.name);
        slot.count += Number(e.occurrences) || 1;
        slot.sources.add(a.type);
        const intensity = Number(e.average_intensity ?? e.avg_intensity);
        if (Number.isFinite(intensity) && intensity > 0) {
          slot.intensitySum += intensity;
          slot.intensityN += 1;
        }
      }
    }
  }

  const fromCheckinsList = Array.from(emoFromCheckins.entries())
    .map(([id, slot]) => ({ id, name: emotionLabelById(id), count: slot.count, contexts: Array.from(slot.contexts) }))
    .sort((a, b) => b.count - a.count);

  const fromAnalysesList = Array.from(emoFromAnalyses.entries())
    .map(([name, slot]) => ({
      name,
      count: slot.count,
      average_intensity: slot.intensityN > 0 ? slot.intensitySum / slot.intensityN : null,
      sources: Array.from(slot.sources),
    }))
    .sort((a, b) => b.count - a.count);

  const seenEmotionNames = new Set([
    ...emoFromCheckins.keys(),
    ...Array.from(emoFromAnalyses.keys()).map((n) => {
      const match = EMOTION_VOCAB.find((e) => e.label === n);
      return match ? match.id : null;
    }).filter(Boolean),
  ]);
  const absent = EMOTION_VOCAB.filter((e) => !seenEmotionNames.has(e.id)).map((e) => e.id);

  // ── Triggers ─────────────────────────────────────────────────────
  const triggerMap = new Map(); // normalized name → { count, contexts:Set, schemas:Set, raw:[] }
  for (const t of triggersInScope) {
    const name = normalizeTriggerName(t.event || '') || 'טריגר ללא תיאור';
    if (!triggerMap.has(name)) triggerMap.set(name, { count: 0, contexts: new Set(), schemas: new Set() });
    const slot = triggerMap.get(name);
    slot.count += 1;
    if (t.event) slot.contexts.add(t.event.trim());
    if (Array.isArray(t.schemasActivated)) {
      for (const s of t.schemasActivated) {
        if (typeof s === 'string' && SCHEMA_LABELS[s]) slot.schemas.add(s);
      }
    }
  }
  const triggers = Array.from(triggerMap.entries())
    .map(([name, slot]) => ({
      name,
      count: slot.count,
      contexts: Array.from(slot.contexts),
      schemas: Array.from(slot.schemas),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ── Patterns ─────────────────────────────────────────────────────
  const totalAnalyses = analysesInScope.length;
  const patternKeys = ['not_enough_appeared', 'dichotomous_phrasing', 'body_as_compass', 'core_child_addressed'];
  const patterns = {};
  for (const key of patternKeys) {
    const sources = new Set();
    let count = 0;
    for (const a of analysesInScope) {
      if (a.patterns?.[key] === true) {
        count += 1;
        sources.add(a.type);
      }
    }
    patterns[key] = { count, total: totalAnalyses, sources: Array.from(sources) };
  }

  // ── Modes ────────────────────────────────────────────────────────
  const modeMap = new Map(); // canonicalId → { count, sources:Set }
  const bumpMode = (id, source) => {
    if (!id) return;
    const canonical = resolveModeId(id);
    if (!canonical) return;
    if (!modeMap.has(canonical)) modeMap.set(canonical, { count: 0, sources: new Set() });
    modeMap.get(canonical).count += 1;
    modeMap.get(canonical).sources.add(source);
  };
  for (const m of modeChecksInScope) {
    if (Array.isArray(m.modesActive)) {
      for (const id of new Set(m.modesActive)) bumpMode(id, 'mode_check');
    }
  }
  for (const e of emergencyInScope) {
    // Partial sessions (saved mid-flow) are tracked for rhythm but must not
    // pollute mode counts — the user may have selected modes and abandoned.
    if (e.partial) continue;
    if (Array.isArray(e.modesIdentified)) {
      for (const id of new Set(e.modesIdentified)) bumpMode(id, 'emergency');
    }
  }
  for (const a of analysesInScope) {
    const dm = a.patterns?.dominant_mode;
    if (dm) bumpMode(dm, 'analysis');
  }
  const modesList = Array.from(modeMap.entries())
    .map(([id, slot]) => ({
      id,
      label: ALL_MODES.find((m) => m.id === id)?.label || id,
      color: ALL_MODES.find((m) => m.id === id)?.color || 'var(--accent)',
      count: slot.count,
      sources: Array.from(slot.sources),
    }))
    .sort((a, b) => b.count - a.count);

  // ── Schemas ──────────────────────────────────────────────────────
  const schemaMap = new Map();
  const bumpSchema = (id, source) => {
    if (typeof id !== 'string' || !SCHEMA_LABELS[id]) return;
    if (!schemaMap.has(id)) schemaMap.set(id, { count: 0, sources: new Set() });
    schemaMap.get(id).count += 1;
    schemaMap.get(id).sources.add(source);
  };
  for (const t of triggersInScope) {
    if (Array.isArray(t.schemasActivated)) {
      for (const s of new Set(t.schemasActivated)) bumpSchema(s, 'trigger');
    }
  }
  for (const a of analysesInScope) {
    if (Array.isArray(a.schemas_activated)) {
      for (const s of new Set(a.schemas_activated)) bumpSchema(s, 'analysis');
    }
  }
  const activations = Array.from(schemaMap.entries())
    .map(([schema, slot]) => ({ schema, label: SCHEMA_LABELS[schema], count: slot.count, sources: Array.from(slot.sources) }))
    .sort((a, b) => b.count - a.count);
  const not_activated = Object.keys(SCHEMA_LABELS).filter((s) => !schemaMap.has(s));

  // ── Core Child ───────────────────────────────────────────────────
  let appearances_in_text = 0;
  let last_addressed = null;
  let sessions_addressed = 0;
  const needs_expressed = [];
  for (const a of analysesInScope) {
    const text = extractAnalysisText(a);
    appearances_in_text += countOccurrences(text, NOT_ENOUGH);
    if (a.patterns?.core_child_addressed === true) {
      sessions_addressed += 1;
      if (!last_addressed || a.occurredAt > last_addressed) last_addressed = a.occurredAt;
    }
    const need = a.payload?.what_was_needed;
    if (typeof need === 'string' && need.trim()) {
      const cleaned = need.trim();
      if (!needs_expressed.includes(cleaned)) needs_expressed.push(cleaned);
    }
  }
  const coreChild = { sessions_addressed, appearances_in_text, last_addressed, needs_expressed };

  // ── hasEnoughData ────────────────────────────────────────────────
  const totalCheckinEntries = checkinsInScope.reduce((s, ci) => s + ci.entries.length, 0);
  const totalDataPoints =
    totalCheckinEntries +
    triggersInScope.length +
    modeChecksInScope.length +
    catastropheInScope.length +
    somaticInScope.length +
    emergencyInScope.length +
    analysesInScope.length;
  const hasEnoughData = totalDataPoints >= 3;

  return {
    scope, startDate, endDate,
    moodRhythm,
    emotions: { fromCheckins: fromCheckinsList, fromAnalyses: fromAnalysesList, absent },
    triggers,
    patterns,
    modes: modesList,
    schemas: { activations, not_activated },
    coreChild,
    hasEnoughData,
    totalDataPoints,
  };
}
