// Maps activation choice in Phase 1 → suggested somatic exercise on the closing screen.
// Phase 6 shows this as an additional referral card next to the existing tool/meditation/letter cards.
// Routes hand off to the standalone /tools/somatic/:id flow (which logs its own ToolHistory entry).
// Different from ACTIVATION_TO_PRESTEP_SOMATIC so hyper users don't get the same exercise twice.
import { ACTIVATION_TO_CLOSE_SOMATIC, getSomaticExercise } from './somatic.js';

const buildEntry = (activation) => {
  const id = ACTIVATION_TO_CLOSE_SOMATIC[activation];
  if (!id) return null;
  const ex = getSomaticExercise(id);
  if (!ex) return null;
  return {
    route: `/tools/somatic/${id}`,
    title: ex.title,
    subtitle: ex.subtitle,
  };
};

export const EMERGENCY_TO_SOMATIC = {
  hyper: buildEntry('hyper'),
  mid:   buildEntry('mid'),
  hypo:  buildEntry('hypo'),
};
