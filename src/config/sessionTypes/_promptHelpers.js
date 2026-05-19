// Shared formatters for session buildPrompt functions. Each session type's
// config imports what it needs. Centralizing keeps the "[לא צוין]" handling
// and multi_select ordering rules consistent across all sessions.

export const NULL_TOKEN = '[לא צוין]';

function asArray(value) {
  if (value == null) return null;
  if (Array.isArray(value)) return value;
  return [value];
}

export function makeLabelLookup(staticOpts) {
  const map = new Map((staticOpts || []).map((o) => [o.id, o.label]));
  return (id, customLabels) => {
    if (!id) return id;
    if (map.has(id)) return map.get(id);
    if (customLabels && customLabels[id]) return customLabels[id];
    return id;
  };
}

// single_select: value is string id (or null when skipped)
export function formatSingleSelect(value, staticOpts) {
  if (value === null) return NULL_TOKEN;
  if (!value) return NULL_TOKEN;
  const opt = (staticOpts || []).find((o) => o.id === value);
  return opt ? opt.label : value;
}

// multi_select: value is string[] (or null when skipped). Renders comma-
// separated in INSERTION order — relies on the wizard preserving the order
// of user selections (which it does, via Set insertion order).
export function formatMultiSelect(value, staticOpts) {
  if (value === null) return NULL_TOKEN;
  if (!Array.isArray(value) || value.length === 0) return NULL_TOKEN;
  const lookup = makeLabelLookup(staticOpts);
  return value.map((id) => lookup(id)).join(', ');
}

// multi_select: same as above but rendered as a 1./2./3. numbered list — used
// when ordering is clinically meaningful (e.g. response sequence).
export function formatMultiSelectNumbered(value, staticOpts) {
  if (value === null) return NULL_TOKEN;
  if (!Array.isArray(value) || value.length === 0) return NULL_TOKEN;
  const lookup = makeLabelLookup(staticOpts);
  return value.map((id, i) => `${i + 1}. ${lookup(id)}`).join('\n');
}

// select_with_custom (single): value is { selected: 'id', sub_inputs, custom_labels } | null
export function formatSelectWithCustomSingle(value, staticOpts) {
  if (value === null) return NULL_TOKEN;
  if (!value || typeof value !== 'object') return NULL_TOKEN;
  const id = Array.isArray(value.selected) ? value.selected[0] : value.selected;
  if (!id) return NULL_TOKEN;
  return makeLabelLookup(staticOpts)(id, value.custom_labels);
}

// select_with_custom (multi): comma-separated list
export function formatSelectWithCustomList(value, staticOpts) {
  if (value === null) return NULL_TOKEN;
  if (!value || typeof value !== 'object') return NULL_TOKEN;
  const arr = asArray(value.selected) || [];
  if (arr.length === 0) return NULL_TOKEN;
  const lookup = makeLabelLookup(staticOpts);
  return arr.map((id) => lookup(id, value.custom_labels)).join(', ');
}

// select_with_custom (multi): bullet list (each item on its own line with "- ")
export function formatBulletList(value, staticOpts) {
  if (value === null) return NULL_TOKEN;
  if (!value || typeof value !== 'object') return NULL_TOKEN;
  const ids = asArray(value.selected) || [];
  if (ids.length === 0) return NULL_TOKEN;
  const lookup = makeLabelLookup(staticOpts);
  return ids.map((id) => `- ${lookup(id, value.custom_labels)}`).join('\n');
}

// scale: number 0..N (or null when skipped). Pass max to override default 10.
export function formatScale(value, max = 10) {
  if (value === null || typeof value !== 'number') return NULL_TOKEN;
  return `${value}/${max}`;
}

// Returns the sub_input value for an option (or null if option not selected
// or sub_input empty).
export function getSubInput(value, subInputId) {
  if (!value || typeof value !== 'object') return null;
  const text = value.sub_inputs?.[subInputId];
  return typeof text === 'string' && text.trim() ? text.trim() : null;
}

export function isOptionSelected(value, optionId) {
  if (!value || typeof value !== 'object') return false;
  const arr = Array.isArray(value.selected) ? value.selected : (value.selected ? [value.selected] : []);
  return arr.includes(optionId);
}

// Labels of user-added (custom_*) options currently selected. Use for the
// "בקול שלי:" line that surfaces user-authored options.
export function getCustomLabels(value) {
  if (!value || typeof value !== 'object') return [];
  const selected = asArray(value.selected) || [];
  const labels = value.custom_labels || {};
  const out = [];
  for (const id of selected) {
    if (typeof id === 'string' && id.startsWith('custom_') && labels[id]) {
      out.push(labels[id]);
    }
  }
  return out;
}
