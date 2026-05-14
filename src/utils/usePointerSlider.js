import { useRef } from 'react';

// Direction-independent slider drag. Overlay-style sliders (an invisible
// <input type=range> with a manually positioned handle) inherit dir="rtl"
// from the document root on desktop browsers, which silently reverses the
// drag direction — pointer-right lowers the value. iOS Safari honored the
// CSS `direction: ltr` so it worked there but not on desktop.
//
// Instead of fighting the native input, we read the pointer X directly and
// map it ourselves: left edge = min, right edge = max, always. The native
// input stays in the DOM (pointer-events: none) purely for keyboard a11y.
export function usePointerSlider({ min, max, onChange, padding = 0 }) {
  const wrapRef = useRef(null);

  const valueFromClientX = (clientX) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const usable = rect.width - padding * 2;
    const x = clientX - rect.left - padding;
    const frac = usable > 0 ? Math.min(1, Math.max(0, x / usable)) : 0;
    return Math.round(frac * (max - min)) + min;
  };

  const apply = (e) => onChange(valueFromClientX(e.clientX));

  const handlers = {
    onPointerDown: (e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      apply(e);
    },
    onPointerMove: (e) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) apply(e);
    },
  };

  return { wrapRef, handlers };
}
