// Maps the activation choice in EmergencyFlow Phase 1 → mindfulness meditation pair.
// Phase 4 (meditation) shows BOTH a short and a long option for every activation —
// different moments call for different durations (a 2-minute reset vs. a deeper settling).
// Recordings are defined in meditations.js — here we only pick which pair fits each activation.
import { MEDITATIONS_BY_ID } from './meditations.js';

export const EMERGENCY_TO_MEDITATION = {
  hyper: { short: MEDITATIONS_BY_ID['activated-short'], long: MEDITATIONS_BY_ID.hyper },
  hypo:  { short: MEDITATIONS_BY_ID['depleted-short'],  long: MEDITATIONS_BY_ID.hypo },
  mid:   { short: MEDITATIONS_BY_ID['on-edge-short'],   long: MEDITATIONS_BY_ID.mid },
};
