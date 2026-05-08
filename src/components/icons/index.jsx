/* Icon set for HomeScreen v2 — confident filled geometry, currentColor.
 * Each icon assumes it's inside a 44×44 colored tile with color: var(--surface).
 */

export function EmergencyIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

export function CheckinIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 3 A9 9 0 0 1 12 21 Z" fill="currentColor" />
    </svg>
  );
}

export function ToolboxIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="1.2" />
      <rect x="13" y="3" width="8" height="8" rx="1.2" />
      <rect x="3" y="13" width="8" height="8" rx="1.2" />
      <rect x="13" y="13" width="8" height="8" rx="1.2" />
    </svg>
  );
}

export function ToolsIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
    </svg>
  );
}

export function RepositoryIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="3" y="6" width="18" height="3" rx="0.6" />
      <rect x="3" y="11" width="18" height="3" rx="0.6" />
      <rect x="3" y="16" width="18" height="3" rx="0.6" />
    </svg>
  );
}

/* MirrorIcon — concentric "eye": outer disc + ring (hole) + center dot.
 * Uses fill-rule="evenodd" so the inner sub-path cuts a hole regardless of
 * the parent tile color, then a small circle fills the iris center.
 */
export function MirrorIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21 12 A9 9 0 1 0 3 12 A9 9 0 0 0 21 12 Z M16 12 A4 4 0 1 0 8 12 A4 4 0 0 0 16 12 Z"
      />
      <circle cx="12" cy="12" r="1.8" />
    </svg>
  );
}

/* MindfulnessIcon — concentric ripples / aura: solid center disc with two soft
 * outward arcs, evoking breath waves outward. */
export function MindfulnessIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <path
        d="M5.5 12 A6.5 6.5 0 0 1 18.5 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M2.5 12 A9.5 9.5 0 0 1 21.5 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

/* Chevron pointing toward inline-end (left in RTL) — used as "go to" indicator
 * on stack-item rows. Renders visually on the left of the card in RTL flow.
 */
export function ChevronEnd({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="15 6 9 12 15 18" />
    </svg>
  );
}
