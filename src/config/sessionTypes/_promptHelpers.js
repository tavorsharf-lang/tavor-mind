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

// single_select: value is string id, OR (when the question has sub_inputs)
// { selected, sub_inputs }. Returns the option label, NULL_TOKEN when skipped.
export function formatSingleSelect(value, staticOpts) {
  if (value === null) return NULL_TOKEN;
  if (!value) return NULL_TOKEN;
  const id = typeof value === 'object' ? value.selected : value;
  if (!id || typeof id !== 'string') return NULL_TOKEN;
  const opt = (staticOpts || []).find((o) => o.id === id);
  return opt ? opt.label : id;
}

// Returns the option ids from either the legacy array shape or the
// structured `{ selected, sub_inputs }` shape used when a multi_select has
// sub_inputs declared on options.
function multiIdsFrom(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && Array.isArray(value.selected)) return value.selected;
  return null;
}

// multi_select: comma-separated, INSERTION order (Set insertion in wizard).
// Accepts legacy array or structured shape.
export function formatMultiSelect(value, staticOpts) {
  if (value === null) return NULL_TOKEN;
  const ids = multiIdsFrom(value);
  if (!ids || ids.length === 0) return NULL_TOKEN;
  const lookup = makeLabelLookup(staticOpts);
  return ids.map((id) => lookup(id)).join(', ');
}

// multi_select: 1./2./3. numbered list — used when ordering is clinically
// meaningful (e.g. response sequence).
export function formatMultiSelectNumbered(value, staticOpts) {
  if (value === null) return NULL_TOKEN;
  const ids = multiIdsFrom(value);
  if (!ids || ids.length === 0) return NULL_TOKEN;
  const lookup = makeLabelLookup(staticOpts);
  return ids.map((id, i) => `${i + 1}. ${lookup(id)}`).join('\n');
}

// multi_select rendered as bullets ("- item"). For clinical readability when
// the list is short but each entry is heavy.
export function formatMultiSelectBullets(value, staticOpts) {
  if (value === null) return NULL_TOKEN;
  const ids = multiIdsFrom(value);
  if (!ids || ids.length === 0) return NULL_TOKEN;
  const lookup = makeLabelLookup(staticOpts);
  return ids.map((id) => `- ${lookup(id)}`).join('\n');
}

// Extract selected option ids from ANY select-style value shape. Tolerant by
// design so a formatter is never silently emptied by a question/formatter
// mismatch (e.g. a plain multi_select array passed to a select_with_custom
// formatter). Accepts:
//   { selected: [...] | 'id', ... }   — select_with_custom / structured shape
//   ['id', ...]                       — plain multi_select
//   'id'                              — plain single_select
// Returns null only for an explicit skip / unusable input.
function flexibleSelectedIds(value) {
  if (value == null) return null;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value ? [value] : [];
  if (typeof value === 'object') {
    if (Array.isArray(value.selected)) return value.selected;
    if (typeof value.selected === 'string') return value.selected ? [value.selected] : [];
    return [];
  }
  return [];
}

function flexibleCustomLabels(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value.custom_labels || null)
    : null;
}

// select_with_custom (single): value is { selected: 'id', sub_inputs, custom_labels } | null
// Shape-tolerant: also accepts a plain string id.
export function formatSelectWithCustomSingle(value, staticOpts) {
  if (value === null) return NULL_TOKEN;
  const ids = flexibleSelectedIds(value);
  if (!ids || ids.length === 0) return NULL_TOKEN;
  return makeLabelLookup(staticOpts)(ids[0], flexibleCustomLabels(value));
}

// select_with_custom (multi): comma-separated list. Shape-tolerant: also
// accepts a plain multi_select array.
export function formatSelectWithCustomList(value, staticOpts) {
  if (value === null) return NULL_TOKEN;
  const ids = flexibleSelectedIds(value);
  if (!ids || ids.length === 0) return NULL_TOKEN;
  const lookup = makeLabelLookup(staticOpts);
  const customLabels = flexibleCustomLabels(value);
  return ids.map((id) => lookup(id, customLabels)).join(', ');
}

// Bullet list (each item on its own line with "- "). Shape-tolerant: accepts
// the select_with_custom { selected } shape OR a plain multi_select array.
export function formatBulletList(value, staticOpts) {
  if (value === null) return NULL_TOKEN;
  const ids = flexibleSelectedIds(value);
  if (!ids || ids.length === 0) return NULL_TOKEN;
  const lookup = makeLabelLookup(staticOpts);
  const customLabels = flexibleCustomLabels(value);
  return ids.map((id) => `- ${lookup(id, customLabels)}`).join('\n');
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
