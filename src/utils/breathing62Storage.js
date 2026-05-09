// localStorage helpers for the 6-2 asymmetric breathing layer in Phase 2 hypo.
// Two responsibilities:
// 1. Onboarding flag — show extended explanation only the first time.
// 2. Adaptive cycles — if user marked "almost too much" 3 times in a row,
//    default cycles drop from 6 to 4.

const ONBOARD_KEY = 'tavor_mind_62_onboarded_v1';
const RESPONSES_KEY = 'tavor_mind_62_recent_responses_v1';

const DEFAULT_CYCLES = 6;
const ADAPTED_CYCLES = 4;
const ADAPTATION_THRESHOLD = 3;

export function hasSeenOnboarding() {
  try {
    return Boolean(localStorage.getItem(ONBOARD_KEY));
  } catch { return false; }
}

export function markOnboardingSeen() {
  try { localStorage.setItem(ONBOARD_KEY, String(Date.now())); } catch {}
}

export function getRecentResponses() {
  try {
    const raw = localStorage.getItem(RESPONSES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

export function pushResponse(value) {
  // value: 'right' | 'almost' | 'too_much'
  const list = getRecentResponses();
  list.push(value);
  while (list.length > ADAPTATION_THRESHOLD) list.shift();
  try { localStorage.setItem(RESPONSES_KEY, JSON.stringify(list)); } catch {}
}

export function getDefaultCycles() {
  const recent = getRecentResponses();
  if (recent.length < ADAPTATION_THRESHOLD) return DEFAULT_CYCLES;
  const lastN = recent.slice(-ADAPTATION_THRESHOLD);
  if (lastN.every((r) => r === 'almost' || r === 'too_much')) return ADAPTED_CYCLES;
  return DEFAULT_CYCLES;
}
