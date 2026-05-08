// Maps the activation choice in EmergencyFlow Phase 1 → optional letter card.
// Phase 6 (closing) shows an optional letter card alongside referral + meditation,
// only when the activation is hypo or mid (the depletion / on-the-edge states).
// hyper is intentionally absent — a long reflective letter doesn't land when
// the system is racing; the body-scan meditation + trigger-tracker fit better.
// The letter content itself comes from `letterDefault` in data/selfLetter.js.
export const EMERGENCY_TO_LETTER = {
  hypo: { title: 'להזכיר לעצמי', subtitle: 'מה כבר יש' },
  mid:  { title: 'להזכיר לעצמי', subtitle: 'הכלים שעובדים' },
};
