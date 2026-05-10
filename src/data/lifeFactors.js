// Apple Health "State of Mind" — life factors / associations.
// Each factor has an accent color used as a left-border on chips.

export const LIFE_FACTORS = [
  { id: 'family',         label: 'משפחה',                 color: 'var(--heart)' },
  { id: 'friends',        label: 'חברים',                 color: 'var(--orange)' },
  { id: 'partner',        label: 'בן/בת זוג',              color: 'var(--pink)' },
  { id: 'studies',        label: 'לימודים',               color: 'var(--indigo)' },
  { id: 'career',         label: 'קריירה ועבודה',          color: 'var(--teal)' },
  { id: 'money',          label: 'כסף',                   color: 'var(--yellow)' },
  { id: 'health',         label: 'בריאות',                color: 'var(--green)' },
  { id: 'fitness',        label: 'כושר וספורט',           color: 'var(--green)' },
  { id: 'hobbies',        label: 'תחביבים',               color: 'var(--purple)' },
  { id: 'identity',       label: 'זהות ועצמי',             color: 'var(--terra)' },
  { id: 'therapy',        label: 'טיפול ועבודה פנימית',    color: 'var(--lichen)' },
  { id: 'social',         label: 'חיים חברתיים',           color: 'var(--orange)' },
  { id: 'current_events', label: 'אקטואליה',              color: 'var(--ink-muted)' },
];

const FACTORS_BY_ID = new Map(LIFE_FACTORS.map((f) => [f.id, f]));

export function factorById(id) {
  return FACTORS_BY_ID.get(id) || null;
}

export function factorLabelById(id) {
  return FACTORS_BY_ID.get(id)?.label || id;
}

export function factorColorById(id) {
  return FACTORS_BY_ID.get(id)?.color || 'var(--line)';
}
