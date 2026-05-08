const SCOPES = [
  { id: 'week', label: 'שבוע' },
  { id: 'month', label: 'חודש' },
  { id: '90d', label: '90 יום' },
];

export default function ScopeSelector({ value, onChange }) {
  return (
    <div className="scope-selector" role="tablist" aria-label="טווח זמן">
      {SCOPES.map((s) => (
        <button
          key={s.id}
          type="button"
          role="tab"
          aria-selected={value === s.id}
          className={`scope-pill ${value === s.id ? 'is-active' : ''}`}
          onClick={() => onChange(s.id)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
