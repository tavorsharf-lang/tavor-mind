// Registry of structured conversation session types. Each entry is a self-
// contained config: identity (id/label/description), the wizard questions,
// and a buildPrompt(variables) function. The wizard shell, history, importer,
// and result screen are all generic — they read from here.
//
// Supported question shapes (rendered by WizardStep):
//   single_select        : { id, type, label, options: [{id,label}], required? }
//   multi_select         : { id, type, label, options: [{id,label}], required? }
//   text                 : { id, type, label, placeholder?, maxLength?, required? }
//   scale                : { id, type, label, config: { min, max, step?, leftLabel, midLabel?, rightLabel } }
//   select_with_custom   : { id, type, label, multi: bool, options, hint?, required? }
//                          options may carry sub_input: { id, label, placeholder }
//
// Value shape stored in `variables`:
//   single_select        : string | null
//   multi_select         : string[] | null
//   text                 : string | null
//   scale                : number | null
//   select_with_custom   : { selected, sub_inputs, custom_labels } | null
//
// `null` everywhere = the user explicitly skipped the question. buildPrompt
// MUST distinguish null from an empty array/string and surface "[לא צוין]".
//
// When adding a real session type, append a new key here. The wizard does not
// need to change.

import { anticipatoryAnxiety } from './sessionTypes/anticipatoryAnxiety.js';
import { parentalAnger } from './sessionTypes/parentalAnger.js';

export const SESSION_TYPES = {
  [anticipatoryAnxiety.id]: anticipatoryAnxiety,
  [parentalAnger.id]: parentalAnger,

  _placeholder: {
    id: '_placeholder',
    label: 'סשן לדוגמה',
    icon: '○',
    description: 'סשן בדיקה לתשתית',
    questions: [
      {
        id: 'sample_q1',
        type: 'single_select',
        label: 'שאלה לדוגמה',
        options: [
          { id: 'opt_a', label: 'אופציה א' },
          { id: 'opt_b', label: 'אופציה ב' },
        ],
      },
      {
        id: 'sample_q2',
        type: 'text',
        label: 'תיאור חופשי',
        placeholder: 'כתוב כאן...',
      },
    ],
    buildPrompt: (variables) => {
      return `סשן לדוגמה\n\nמשתנים:\n${JSON.stringify(variables, null, 2)}`;
    },
  },
};

export function listSessionTypes() {
  return Object.values(SESSION_TYPES);
}

export function getSessionType(id) {
  return SESSION_TYPES[id] || null;
}

export function getSessionTypeLabel(id) {
  return SESSION_TYPES[id]?.label || id;
}
