export const BREATHING_PATTERNS = {
  simple:  { inhale: 4000, hold: 0,    exhale: 6000, rest: 0    },
  '4-7-8': { inhale: 4000, hold: 7000, exhale: 8000, rest: 0    },
  box:     { inhale: 4000, hold: 4000, exhale: 4000, rest: 4000 },
};

export function getPattern(name) {
  return BREATHING_PATTERNS[name] || BREATHING_PATTERNS.simple;
}
