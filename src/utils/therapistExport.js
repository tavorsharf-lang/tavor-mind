import { ref, get } from 'firebase/database';
import { db, auth, ROOM } from '../firebase.js';
import { emotionLabelById, VALENCE_LABELS } from '../data/emotionsCorpus.js';
import { getModeById } from '../data/modes.js';
import { ANALYSIS_TYPES, SCHEMA_LABELS, MODE_LABELS } from '../data/analysisSchemas.js';
import { isSoftDeleted } from './softDelete.js';

const DEFAULT_LOOKBACK_DAYS = 30;

function getUid() {
  return auth.currentUser?.uid || localStorage.getItem('tavor_mind_auth_uid');
}

async function readNode(uid, key) {
  try {
    const snap = await get(ref(db, `${ROOM}/${uid}/${key}`));
    return snap.exists() ? snap.val() : null;
  } catch (err) {
    console.warn(`export: read ${key} failed`, err?.message || err);
    return null;
  }
}

function toMs(v) {
  if (v == null) return null;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const t = new Date(v).getTime();
    return Number.isNaN(t) ? null : t;
  }
  return null;
}

function fmtDateTime(ms) {
  if (!ms) return '—';
  const d = new Date(ms);
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const parts = fmt.formatToParts(d);
  const get = (t) => parts.find((p) => p.type === t)?.value;
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`;
}

function fmtDate(ms) {
  if (!ms) return '—';
  const d = new Date(ms);
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
  return fmt.format(d);
}

function valuesOf(obj) {
  return obj && typeof obj === 'object' ? Object.values(obj) : [];
}

function defaultSinceMs() {
  return Date.now() - DEFAULT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
}

function clean(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/\s+/g, ' ').trim();
}

function truncate(s, max = 240) {
  const c = clean(s);
  if (c.length <= max) return c;
  return c.slice(0, max - 1) + '…';
}

// ── Section formatters ────────────────────────────────────────────────

function formatCheckins(checkinsRaw, sinceMs) {
  const lines = [];
  let count = 0;
  if (!checkinsRaw) return { lines, count };
  for (const dayObj of Object.values(checkinsRaw)) {
    if (!dayObj || typeof dayObj !== 'object') continue;
    for (const [k, v] of Object.entries(dayObj)) {
      if (!/^\d+$/.test(k) || !v || typeof v !== 'object') continue;
      if (v.valence == null) continue;
      const ts = Number(k);
      if (ts <= sinceMs) continue;
      const valenceLabel = VALENCE_LABELS[v.valence] || `${v.valence}`;
      const emotions = Array.isArray(v.emotions) ? v.emotions.map(emotionLabelById).join(', ') : '';
      const scopeLabel = v.scope === 'morning' ? 'בוקר' : v.scope === 'evening' ? 'ערב' : '';
      const parts = [`${fmtDateTime(ts)}${scopeLabel ? ' · ' + scopeLabel : ''} — ${valenceLabel}`];
      if (emotions) parts.push(`רגשות: ${emotions}`);
      lines.push(parts.join(' · '));
      count += 1;
    }
  }
  lines.sort();
  return { lines, count };
}

function formatTriggers(triggersRaw, sinceMs) {
  const lines = [];
  let count = 0;
  for (const t of valuesOf(triggersRaw)) {
    const ts = toMs(t.clientTs) || toMs(t.createdAt);
    if (!ts || ts <= sinceMs) continue;
    const event = clean(t.event) || 'ללא תיאור';
    const schemas = Array.isArray(t.schemasActivated)
      ? t.schemasActivated.map((s) => SCHEMA_LABELS[s] || s).join(', ')
      : '';
    const emotions = Array.isArray(t.emotionsRaw) && t.emotionsRaw.length
      ? t.emotionsRaw.map(emotionLabelById).join(', ')
      : '';
    const reframe = clean(t.reframe);
    const lineParts = [`${fmtDateTime(ts)} — TriggerTracker`, `אירוע: "${truncate(event, 160)}"`];
    if (schemas) lineParts.push(`סכמות: ${schemas}`);
    if (emotions) lineParts.push(`רגשות: ${emotions}`);
    if (reframe) lineParts.push(`reframe: "${truncate(reframe, 160)}"`);
    lines.push(lineParts.join(' · '));
    count += 1;
  }
  lines.sort();
  return { lines, count };
}

function formatModeChecks(modesRaw, sinceMs) {
  const lines = [];
  let count = 0;
  for (const m of valuesOf(modesRaw)) {
    const ts = toMs(m.clientTs) || toMs(m.createdAt);
    if (!ts || ts <= sinceMs) continue;
    const ids = Array.isArray(m.modesActive) ? m.modesActive : [];
    const labels = ids.map((id) => getModeById(id)?.label || MODE_LABELS[id] || id).join(', ');
    const note = clean(m.note);
    const parts = [`${fmtDateTime(ts)} — ModeCheck`, `מודים פעילים: ${labels || '—'}`];
    if (note) parts.push(`הערה: "${truncate(note, 160)}"`);
    lines.push(parts.join(' · '));
    count += 1;
  }
  lines.sort();
  return { lines, count };
}

function formatCatastrophe(catRaw, sinceMs) {
  const lines = [];
  let count = 0;
  for (const c of valuesOf(catRaw)) {
    const ts = toMs(c.clientTs) || toMs(c.createdAt);
    if (!ts || ts <= sinceMs) continue;
    const fear = clean(c.feared || c.worstCase);
    const realistic = clean(c.realistic);
    const parts = [`${fmtDateTime(ts)} — CatastropheCheck`];
    if (fear) parts.push(`תרחיש קטסטרופלי: "${truncate(fear, 160)}"`);
    if (realistic) parts.push(`מציאותי: "${truncate(realistic, 160)}"`);
    lines.push(parts.join(' · '));
    count += 1;
  }
  lines.sort();
  return { lines, count };
}

function formatEmergency(emergRaw, sinceMs) {
  const lines = [];
  let count = 0;
  for (const e of valuesOf(emergRaw)) {
    const ts = toMs(e.clientTs) || toMs(e.startedAtClient);
    if (!ts || ts <= sinceMs) continue;
    const activation = e.activation || '—';
    const modes = Array.isArray(e.modesIdentified)
      ? e.modesIdentified.map((id) => getModeById(id)?.label || id).join(', ')
      : '';
    const grounding = e.groundingChoice || '';
    const breathingNote = clean(e.breathingNote);
    const parts = [`${fmtDateTime(ts)} — רגע משבר`, `activation: ${activation}`];
    if (grounding) parts.push(`גראונדינג: ${grounding}`);
    if (modes) parts.push(`מודים שזוהו: ${modes}`);
    if (breathingNote) parts.push(`הערת נשימה: "${truncate(breathingNote, 160)}"`);
    lines.push(parts.join(' · '));
    count += 1;
  }
  lines.sort();
  return { lines, count };
}

function formatAnalyses(analysesRaw, sinceMs) {
  const lines = [];
  let count = 0;
  for (const a of valuesOf(analysesRaw)) {
    if (isSoftDeleted(a)) continue;
    const ts = toMs(a._importedAt);
    if (!ts || ts <= sinceMs) continue;
    const meta = ANALYSIS_TYPES[a.type];
    const typeLabel = meta?.label || a.type;
    const occurredDate = a.occurredAt ? fmtDate(toMs(a.occurredAt)) : null;
    const title = clean(a.title) || '—';
    const summary = truncate(a.summary, 220);
    const tags = Array.isArray(a.tags) ? a.tags.join(', ') : '';
    const schemas = Array.isArray(a.schemas_activated)
      ? a.schemas_activated.map((s) => SCHEMA_LABELS[s] || s).join(', ')
      : '';
    const dominantMode = a.patterns?.dominant_mode
      ? (getModeById(a.patterns.dominant_mode)?.label || MODE_LABELS[a.patterns.dominant_mode] || a.patterns.dominant_mode)
      : '';
    const truePatterns = Object.entries(a.patterns || {})
      .filter(([k, v]) => v === true && k !== 'dominant_mode')
      .map(([k]) => k);

    const lineParts = [`[נכנס: ${fmtDateTime(ts)}${occurredDate ? `, התרחש: ${occurredDate}` : ''}] ${typeLabel} — "${title}"`];
    if (summary) lineParts.push(`תקציר: ${summary}`);
    if (tags) lineParts.push(`תגיות: ${tags}`);
    if (schemas) lineParts.push(`סכמות: ${schemas}`);
    if (dominantMode) lineParts.push(`מוד דומיננטי: ${dominantMode}`);
    if (truePatterns.length) lineParts.push(`דפוסים: ${truePatterns.join(', ')}`);

    // type-specific payload extracts
    const p = a.payload || {};
    const extras = [];
    if (a.type === 'therapy_session') {
      if (p.modality) extras.push(`שיטה: ${p.modality}`);
      if (p.topic) extras.push(`נושא: "${truncate(p.topic, 200)}"`);
      if (p.insight) extras.push(`תובנה: "${truncate(p.insight, 240)}"`);
      if (p.homework) extras.push(`שיעורי בית: "${truncate(p.homework, 200)}"`);
    } else if (a.type === 'emotion_recognition') {
      if (p.trigger_event) extras.push(`טריגר: "${truncate(p.trigger_event, 180)}"`);
      if (p.insight) extras.push(`תובנה: "${truncate(p.insight, 200)}"`);
      if (p.what_was_needed) extras.push(`מה היה נצרך: "${truncate(p.what_was_needed, 180)}"`);
    } else if (a.type === 'meta_analysis') {
      if (p.central_sentence) extras.push(`משפט מרכזי: "${truncate(p.central_sentence, 220)}"`);
      if (p.open_question) extras.push(`שאלה פתוחה: "${truncate(p.open_question, 220)}"`);
    } else if (a.type === 'i_language') {
      if (p.original_phrasing) extras.push(`ניסוח מקורי: "${truncate(p.original_phrasing, 160)}"`);
      if (p.final_phrasing) extras.push(`ניסוח סופי: "${truncate(p.final_phrasing, 160)}"`);
    } else if (a.type === 'gratitude') {
      if (p.insight) extras.push(`תובנה: "${truncate(p.insight, 200)}"`);
    }
    if (extras.length) lineParts.push(extras.join(' · '));
    lines.push(lineParts.join('\n  '));
    count += 1;
  }
  lines.sort();
  return { lines, count };
}

function formatFrames(framesRaw, sinceMs) {
  const lines = [];
  let count = 0;
  for (const f of valuesOf(framesRaw)) {
    const prepMs = toMs(f.prepCreatedAt);
    const debriefMs = toMs(f.debriefCreatedAt);
    const include = (prepMs && prepMs > sinceMs) || (debriefMs && debriefMs > sinceMs);
    if (!include) continue;
    const parts = [`פגישת ${f.sessionDate}`];
    if (f.prepText && f.prepText.trim()) {
      parts.push(`לפני: "${truncate(f.prepText, 280)}"`);
    }
    if (f.debriefText && f.debriefText.trim()) {
      parts.push(`אחרי: "${truncate(f.debriefText, 280)}"`);
    }
    lines.push(parts.join('\n  '));
    count += 1;
  }
  lines.sort();
  return { lines, count };
}

// ── Main builder ──────────────────────────────────────────────────────

export async function buildExportPrompt({ sinceISO, fullExport = false } = {}) {
  const uid = getUid();
  if (!uid) {
    return {
      promptText: '',
      dataPointsCount: 0,
      periodStart: null,
      periodEnd: null,
      isEmpty: true,
      error: 'no-uid',
    };
  }

  const sinceMs = fullExport
    ? defaultSinceMs()
    : (toMs(sinceISO) ?? defaultSinceMs());

  const [
    checkinsRaw,
    triggersRaw,
    modesRaw,
    catRaw,
    emergRaw,
    analysesRaw,
    framesRaw,
  ] = await Promise.all([
    readNode(uid, 'checkins'),
    readNode(uid, 'triggers'),
    readNode(uid, 'mode_checks'),
    readNode(uid, 'catastrophe_checks'),
    readNode(uid, 'emergency_sessions'),
    readNode(uid, 'analyses'),
    readNode(uid, 'therapy_frames'),
  ]);

  const sec1 = formatCheckins(checkinsRaw, sinceMs);
  const sec2 = formatTriggers(triggersRaw, sinceMs);
  const sec3 = formatModeChecks(modesRaw, sinceMs);
  const sec4 = formatCatastrophe(catRaw, sinceMs);
  const sec5 = formatEmergency(emergRaw, sinceMs);
  const sec6 = formatAnalyses(analysesRaw, sinceMs);
  const sec7 = formatFrames(framesRaw, sinceMs);

  const dataPointsCount = sec1.count + sec2.count + sec3.count + sec4.count + sec5.count + sec6.count + sec7.count;
  const periodStart = fmtDate(sinceMs);
  const periodEnd = fmtDate(Date.now());

  if (dataPointsCount === 0) {
    return {
      promptText: '',
      dataPointsCount: 0,
      periodStart,
      periodEnd,
      isEmpty: true,
    };
  }

  const header = [
    'אתה עוזר לי להכין לפגישת טיפול קרובה.',
    `זה דוח גולמי של כל מה שתיעדתי במערכת מאז הייצוא הקודם (${periodStart} → ${periodEnd}, סה"כ ${dataPointsCount} נתונים).`,
    '',
    'המשימה שלך:',
    '1. סדר את החומר לפי חשיבות פסיכולוגית/קליניקלית',
    '2. זהה דפוסים חוזרים, סכמות שהתעוררו, מודים דומיננטיים',
    '3. הצע 3-5 נושאים מרכזיים לעלות בטיפול הקרוב',
    '4. הדגש כל אירוע משברי או שינוי משמעותי',
    '',
    '==========',
    'הנתונים:',
    '==========',
    '',
  ].join('\n');

  const sections = [];
  const addSection = (title, sec) => {
    if (sec.count === 0) return;
    sections.push(`[${sections.length + 1}] ${title} (${sec.count})`);
    sections.push('─────────────────────');
    for (const ln of sec.lines) sections.push(ln);
    sections.push('');
  };

  addSection("צ'ק-אינים", sec1);
  addSection('TriggerTracker', sec2);
  addSection('ModeCheck', sec3);
  addSection('CatastropheCheck', sec4);
  addSection('רגעי משבר', sec5);
  addSection('ניתוחים', sec6);
  addSection('מסגרות טיפול', sec7);

  return {
    promptText: header + sections.join('\n'),
    dataPointsCount,
    periodStart,
    periodEnd,
    isEmpty: false,
  };
}
