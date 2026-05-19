import { SESSION_TYPES } from '../config/sessionTypes.js';

// Generic dispatcher. Each session type registers its own
// buildPrompt(variables, meta) in config/sessionTypes.js. This keeps the
// wizard shell unaware of any type-specific prompt structure.
//
// `meta` always includes:
//   createdAt : ISO string (session.createdAt → ISO) | null
//   sessionId : string | null
export function buildSessionPrompt({ type, variables, meta }) {
  const def = SESSION_TYPES[type];
  const safeMeta = meta || {};
  if (!def) {
    return `[unknown_session_type:${type}]\n\n${JSON.stringify(variables ?? {}, null, 2)}`;
  }
  if (typeof def.buildPrompt !== 'function') {
    return `[${type}]\n\n${JSON.stringify(variables ?? {}, null, 2)}`;
  }
  try {
    return def.buildPrompt(variables || {}, safeMeta);
  } catch (err) {
    console.warn('buildSessionPrompt failed:', err?.message || err);
    return `[${type}]\n\n${JSON.stringify(variables ?? {}, null, 2)}`;
  }
}
