// Apple-style health gradient: red → orange → yellow → green → teal.
// Used by all 1-10 sliders. Score 1 is the "worst" anchor, 10 the "best",
// flipped automatically when polarity === 'high-bad'.

const APPLE_STOPS = [
  { at: 0.00, rgb: [255,  59,  48] },  // --heart
  { at: 0.25, rgb: [255, 138,  42] },  // --orange
  { at: 0.50, rgb: [255, 185,  56] },  // --yellow
  { at: 0.75, rgb: [ 52, 168, 106] },  // --green
  { at: 1.00, rgb: [ 31, 182, 166] },  // --teal
];

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function interpolate(t) {
  if (t <= 0) return APPLE_STOPS[0].rgb;
  if (t >= 1) return APPLE_STOPS[APPLE_STOPS.length - 1].rgb;
  for (let i = 1; i < APPLE_STOPS.length; i++) {
    if (t <= APPLE_STOPS[i].at) {
      const lo = APPLE_STOPS[i - 1], hi = APPLE_STOPS[i];
      const span = hi.at - lo.at;
      const local = span === 0 ? 0 : (t - lo.at) / span;
      return [
        lerp(lo.rgb[0], hi.rgb[0], local),
        lerp(lo.rgb[1], hi.rgb[1], local),
        lerp(lo.rgb[2], hi.rgb[2], local),
      ];
    }
  }
  return APPLE_STOPS[APPLE_STOPS.length - 1].rgb;
}

function softMix(rgb, towards = 0.82) {
  return [
    lerp(rgb[0], 255, towards),
    lerp(rgb[1], 255, towards),
    lerp(rgb[2], 255, towards),
  ];
}

export function colorForScore(score, polarity = 'high-good') {
  const clamped = Math.max(1, Math.min(10, Number(score) || 1));
  const t = (clamped - 1) / 9;
  const goodness = polarity === 'high-good' ? t : 1 - t;
  const rgb = interpolate(goodness);
  const soft = softMix(rgb);
  return {
    main: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
    soft: `rgb(${soft[0]}, ${soft[1]}, ${soft[2]})`,
    glow: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.45)`,
    rgbTriplet: `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`,
  };
}
