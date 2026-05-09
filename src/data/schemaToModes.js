// Maps each schema to its primary and secondary mode (with role hints in context).
// "primary" = which mode appears FIRST in the bridge UI AND gets pre-selected on "yes".
// For mistrust_abuse and emotional_deprivation, the exiled_child is the primary
// because clinically the protectors enter so fast they obscure the child if shown first.
//
// Mode IDs use the SHORT form ('manager', 'sacrificer', 'guardian', 'approval', 'exile')
// because that's what Phase 9 / EmergencyFlow.selectedModes uses internally.
// Schema IDs match dominantSchemas + hypothesisSchemas in data/schemas.js.

export const SCHEMA_TO_MODES = {
  unrelenting_standards: {
    primary:   { id: 'manager',  hint: 'דוחף אותך לעבוד עוד כדי לא להרגיש לא מספיק' },
    secondary: { id: 'approval', hint: 'מחפש איתות חיצוני שאתה בסדר' },
  },
  self_sacrifice: {
    primary:   { id: 'sacrificer', hint: 'אומר "אם אתן את כל מה שיש לי, לא יוותרו עליי"' },
    secondary: { id: 'manager',    hint: 'מנסה להיות גם מצוין, מעבר לנתינה' },
  },
  mistrust_abuse: {
    // Child first: the protector enters too fast and obscures the wound.
    primary:   { id: 'exile',    hint: 'הילד שלמד שאי אפשר לסמוך — הפצע מתחת להגנה' },
    secondary: { id: 'guardian', hint: 'ההגנה — סוקר אנשים על סכנה ושומר מרחק' },
  },
  approval_seeking: {
    primary:   { id: 'approval', hint: 'יודע איך להוציא איתות חיצוני שאתה בסדר' },
    secondary: { id: 'exile',    hint: 'הילד שלא קיבל מספיק — הצורך מאחורי החיפוש' },
  },
  emotional_deprivation: {
    // Hypothesis schema. Child is direct — not via protector.
    primary:   { id: 'exile',      hint: 'מופיע ישירות, לא דרך הגנה — הצורך הלא-נענה' },
    secondary: { id: 'sacrificer', hint: 'תגובת ההישרדות — "אם אקריב מספיק, אולי אקבל"' },
  },
};

export function getSchemaModesMapping(schemaId) {
  if (!schemaId) return null;
  return SCHEMA_TO_MODES[schemaId] || null;
}

// 4 helper questions for "can't identify" branch.
// Each maps a felt experience to a mode short-id.
export const HELPER_QUESTIONS = [
  { id: 'pushing',   text: 'האם הוא דוחף אותך לעוד?',          modeId: 'manager' },
  { id: 'isolating', text: 'האם הוא מסתגר ושומר מרחק?',         modeId: 'guardian' },
  { id: 'small',     text: 'האם הוא קטן ופגוע, צריך נוכחות?',  modeId: 'exile' },
  { id: 'seeking',   text: 'האם הוא מחפש אישור מבחוץ?',         modeId: 'approval' },
];
