// Maps the activation choice in EmergencyFlow Phase 1 → suggested follow-up tool.
// Phase 5 shows an optional referral card above the primary "סיימתי" button.
// Keys are activation IDs ('hyper' / 'hypo' / 'mid') stored in flow state.
// Routes are the actual app routes (mode-check / catastrophe), labels mirror the spec.
export const EMERGENCY_TO_TOOL = {
  hyper: { route: '/tools/triggers',    name: 'מאתר טריגרים', question: 'מה הפעיל אותך עכשיו, ומה זה אומר?' },
  hypo:  { route: '/tools/mode-check',  name: 'מצב סכמה',     question: 'איזה קול הריץ אותך עד שהתרוקנת?' },
  mid:   { route: '/tools/catastrophe', name: 'בדיקת מציאות', question: 'האם הקטסטרופה שאתה רואה אמיתית?' },
};
