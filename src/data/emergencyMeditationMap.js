// Maps the activation choice in EmergencyFlow Phase 1 → mindfulness meditation.
// Phase 6 (closing) shows an optional meditation card alongside the referral block.
// Recordings are defined in meditations.js — here we only pick which one fits each activation.
// On natural completion (audio.onEnded), the closing flow logs the session and exits home.
import { MEDITATIONS_BY_ID } from './meditations.js';

export const EMERGENCY_TO_MEDITATION = {
  hyper: MEDITATIONS_BY_ID.hyper,
  hypo:  MEDITATIONS_BY_ID.hypo,
  mid:   MEDITATIONS_BY_ID.mid,
};
