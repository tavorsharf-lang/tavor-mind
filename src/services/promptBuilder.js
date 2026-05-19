import { SESSION_TYPES } from '../config/sessionTypes.js';

// Generic dispatcher. Each session type registers its own buildPrompt(variables)
// in config/sessionTypes.js. This keeps the wizard shell unaware of any
// type-specific prompt structure.
export function buildSessionPrompt({ type, variables }) {
  const def = SESSION_TYPES[type];
  if (!def) {
    return `[unknown_session_type:${type}]\n\n${JSON.stringify(variables ?? {}, null, 2)}`;
  }
  if (typeof def.buildPrompt !== 'function') {
    return `[${type}]\n\n${JSON.stringify(variables ?? {}, null, 2)}`;
  }
  try {
    return def.buildPrompt(variables || {});
  } catch (err) {
    console.warn('buildSessionPrompt failed:', err?.message || err);
    return `[${type}]\n\n${JSON.stringify(variables ?? {}, null, 2)}`;
  }
}
