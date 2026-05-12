/* tavor-mind — Utility icon set (DS3 outline style).
 *
 * Single source of truth for navigation/utility glyphs.
 * Mirrors window.ICONS in design-snapshot.html.
 *
 *   viewBox: 0 0 24 24
 *   stroke-width: 1.5, rounded caps & joins
 *   fill="none" by default, currentColor everywhere
 *   filled accents (dots) opt-in via explicit fill + stroke="none"
 *
 * Chevrons are drawn directly for RTL (the project's default direction):
 *   ChevronStart (back)    → points right
 *   ChevronEnd   (forward) → points left
 */

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function Svg({ size = 22, title, children, ...rest }) {
  const a11y = title
    ? { role: 'img', 'aria-label': title }
    : { 'aria-hidden': true };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...STROKE}
      {...a11y}
      {...rest}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

/** Back (logical start) — points right in RTL */
export function ChevronStart({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M9.5 6.5L15 12l-5.5 5.5" />
    </Svg>
  );
}

/** Forward (logical end) — points left in RTL */
export function ChevronEnd({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M14.5 6.5L9 12l5.5 5.5" />
    </Svg>
  );
}

/** Close (X) */
export function Close({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </Svg>
  );
}

/** Add */
export function Plus({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M12 5.5v13M5.5 12h13" />
    </Svg>
  );
}

/** Hamburger menu */
export function Menu({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M5 8h14M5 12h14M5 16h14" />
    </Svg>
  );
}

/** Overflow (3 dots) */
export function More({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="6" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Filter — 3 stepped horizontal lines */
export function Filter({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M4 7h16M7 12h10M10 17h4" />
    </Svg>
  );
}

/** Search — circle with handle */
export function Search({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="11" cy="11" r="5.5" />
      <path d="M11 16.5v3.5" />
    </Svg>
  );
}

/** Settings — 3 sliders with knobs */
export function Settings({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M4 7h16M4 12h16M4 17h16" />
      <circle cx="10" cy="7" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="8" cy="17" r="1.6" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Info — i in a circle */
export function Info({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 11.5v5" />
      <circle cx="12" cy="8.5" r="0.6" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Time — clock face */
export function Time({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </Svg>
  );
}

/** Calendar */
export function Calendar({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M4 11h16M9 4v4M15 4v4" />
    </Svg>
  );
}
