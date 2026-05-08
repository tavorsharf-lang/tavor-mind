import { SCHEMA_LABELS } from '../../../data/analysisSchemas.js';

export default function SchemasPills({ schemas, compact = false }) {
  if (!Array.isArray(schemas) || schemas.length === 0) return null;
  return (
    <div className={`schema-pills ${compact ? 'is-compact' : ''}`}>
      {schemas.map((id, i) => (
        <span key={i} className="schema-chip">{SCHEMA_LABELS[id] || id}</span>
      ))}
    </div>
  );
}
