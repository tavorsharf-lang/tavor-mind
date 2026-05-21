/* tavor-mind icon system — single source of truth.
 *
 * Every icon is a 24×24 viewBox, drawn with 1.5px stroke, round caps & joins,
 * fill="none" by default, currentColor everywhere. Filled accents inside a
 * body use explicit fill="currentColor" stroke="none" on the inner element.
 *
 * Categories: util / phase / schema / trigger / status / action / home
 *
 * Bodies are the variants picked by the user in the Design Sandbox icon picker
 * (48/48 picked). Geometries are kept in sync with svgs/<Name>.svg.
 *
 * Chevrons: ChevronStart points to the logical-previous direction (right in
 * RTL, left in LTR). ChevronEnd is the inverse. Direction is read from
 * document.documentElement.dir at render time and flips automatically.
 */

import { useEffect, useState } from 'react';

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
      xmlns="http://www.w3.org/2000/svg"
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

/** Read document dir reactively so chevrons flip on devtools toggles too. */
function useDocDir() {
  const read = () =>
    typeof document !== 'undefined'
      ? document.documentElement.dir || 'rtl'
      : 'rtl';
  const [dir, setDir] = useState(read);
  useEffect(() => {
    if (typeof MutationObserver === 'undefined') return;
    const obs = new MutationObserver(() => setDir(read()));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
    });
    return () => obs.disconnect();
  }, []);
  return dir;
}

export const ICON_CATEGORIES = [
  { id: 'util',    title: 'Navigation & utility',
    note: 'Should disappear into the interface. Familiar enough to be invisible.' },
  { id: 'phase',   title: 'Emergency-Flow phases',
    note: 'A journey from body to mind to integration. Earlier phases are concrete; later ones abstract into geometry.' },
  { id: 'schema',  title: 'Schema modes',
    note: 'States of being, not symptoms. Each schema is a survival pattern - drawn with respect.' },
  { id: 'trigger', title: 'Triggers',
    note: 'Neutral and observational, not catastrophic. A trigger is a fact, not a verdict.' },
  { id: 'status',  title: 'Status indicators',
    note: 'Four states. Selected. Active. Ambient. Critical. No more.' },
  { id: 'action',  title: 'Actions',
    note: 'The smallest possible verbs - what the user can do to this object.' },
  { id: 'home',    title: 'Home & tools',
    note: 'Anchor surfaces. The face the app shows when nothing is wrong yet.' },
];

/* ============================================================
 * UTILITY & NAVIGATION (12)
 * ============================================================ */

/** חזור — back (logical-start). In RTL points right; flips in LTR. */
export function ChevronStart({ size, title }) {
  const dir = useDocDir();
  const d = dir === 'ltr'
    ? 'M19 12H6M11 7l-5 5 5 5'
    : 'M5 12h13M13 7l5 5-5 5';
  return <Svg size={size} title={title}><path d={d} /></Svg>;
}

/** הבא — forward (logical-end). In RTL points left; flips in LTR. */
export function ChevronEnd({ size, title }) {
  const dir = useDocDir();
  const d = dir === 'ltr'
    ? 'M5 12h13M13 7l5 5-5 5'
    : 'M19 12H6M11 7l-5 5 5 5';
  return <Svg size={size} title={title}><path d={d} /></Svg>;
}

/** סגירה */
export function Close({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="8" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </Svg>
  );
}

/** הוספה */
export function Plus({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8.5v7M8.5 12h7" />
    </Svg>
  );
}

/** תפריט */
export function Menu({ size, title }) {
  return <Svg size={size} title={title}><path d="M5 8h14M5 12h14M5 16h14" /></Svg>;
}

/** אפשרויות */
export function More({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="6" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** סינון */
export function Filter({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M4 5h16l-6 8v6l-4-2v-4z" />
    </Svg>
  );
}

/** חיפוש */
export function Search({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="11" cy="11" r="5.5" />
      <path d="M15 15l4 4" />
    </Svg>
  );
}

/** הגדרות */
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

/** מידע */
export function Info({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5l-2.5 5h5z" />
      <circle cx="12" cy="16" r="0.85" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** זמן */
export function Time({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </Svg>
  );
}

/** יומן */
export function Calendar({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M4 11h16M9 4v4M15 4v4" />
    </Svg>
  );
}

/* ============================================================
 * EMERGENCY-FLOW PHASES (8) — body → mind → integration
 * ============================================================ */

/** פאזה 1 · התעוררות — sun */
export function PhaseActivation({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M12 2.5v2.5M12 19v2.5M2.5 12h2.5M19 12h2.5M5.1 5.1l1.8 1.8M17.1 17.1l1.8 1.8M18.9 5.1l-1.8 1.8M5.1 18.9l1.8-1.8" />
      <circle cx="12" cy="12" r="4" />
    </Svg>
  );
}

/** פאזה 2 · הקרקעה — person on chair */
export function PhaseGrounding({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M16 4v16M16 14h-9v6" />
      <circle cx="10" cy="6" r="2" />
      <path d="M10 8v4l3 2" />
    </Svg>
  );
}

/** פאזה 3 · נשימה — twin breath waves */
export function PhaseBreath({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M3 10c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
      <path d="M3 16c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
    </Svg>
  );
}

/** פאזה 4 · סומטי — small figure */
export function PhaseSomatic({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="6" r="2" />
      <path d="M12 8v6M8 11h8M9 19l3-5 3 5" />
    </Svg>
  );
}

/** פאזה 5 · טריגרים — arrows pointing inward to a center */
export function PhaseTriggers({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="6" />
      <path d="M12 4v3M12 17v3M4 12h3M17 12h3" />
    </Svg>
  );
}

/** פאזה 6 · עיוותים — warped grid */
export function PhaseDistortion({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M4 4h16M4 12c4-3 12 3 16 0M4 20h16" />
      <path d="M4 4v16M12 4c-3 4 3 12 0 16M20 4v16" />
    </Svg>
  );
}

/** פאזה 7 · בדיקת מציאות — open eye */
export function PhaseReality({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M3 12s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

/** פאזה 8 · אינטגרציה — two clasped arcs */
export function PhaseIntegration({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M5 5c5 0 8 3 8 7s-3 7-8 7" />
      <path d="M19 5c-5 0-8 3-8 7s3 7 8 7" />
    </Svg>
  );
}

/* ============================================================
 * SCHEMA MODES (9) — states of being, not symptoms
 * ============================================================ */

/** ילד פגיע — face, soft eyes, gentle frown */
export function SchemaVulnerable({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="9.5" cy="11" r="1" />
      <circle cx="14.5" cy="11" r="1" />
      <path d="M9.5 16q2.5 -1.8 5 0" />
    </Svg>
  );
}

/** ילד כועס — face, angry brows + frown */
export function SchemaAngry({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="8" />
      <path d="M7.5 9.5l3 1M16.5 9.5l-3 1" />
      <circle cx="10" cy="12" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="14" cy="12" r="0.75" fill="currentColor" stroke="none" />
      <path d="M9.5 16q2.5 -1.5 5 0" />
    </Svg>
  );
}

/** ילד אימפולסיבי — running figure */
export function SchemaImpulsive({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="14" cy="5" r="2" />
      <path d="M5 10l3-2l4 5l5-1M12 13l-2 3l-2 4M12 13l3 3l-1 4" />
    </Svg>
  );
}

/** ילד מאושר — face, smile */
export function SchemaHappy({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="9.5" cy="11" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="11" r="0.75" fill="currentColor" stroke="none" />
      <path d="M9 14.5q3 2.5 6 0" />
    </Svg>
  );
}

/** הכניע — submissive face, eyes down, small mouth */
export function SchemaCompliant({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 11.2h2M13.5 11.2h2" />
      <path d="M10.5 15.7h3" />
    </Svg>
  );
}

/** המגן המנותק — protective shield around a hidden core */
export function SchemaDetached({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <path d="M5 7c0-3 3-4 7-4s7 1 7 4v10c0 3-3 4-7 4s-7-1-7-4z" />
      <path d="M12 3v18M5 12h14" />
    </Svg>
  );
}

/** ההורה הביקורתי — yelling figure aimed at a smaller one */
export function SchemaPunitive({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="7" cy="5" r="2" />
      <path d="M7 7v5l8 3M4 20l3 -7l2 7" />
      <circle cx="19" cy="13" r="1.4" />
      <path d="M19 14.4v2.5M17 20l2 -3l2 3" />
    </Svg>
  );
}

/** ההורה התובעני — pointing figure */
export function SchemaDemanding({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="9" cy="7" r="2" />
      <path d="M9 9v6M9 12h6l3 -3" />
    </Svg>
  );
}

/** מבוגר בריא — calm steady face */
export function SchemaHealthyAdult({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 11.5q1 -1 2 0M13.5 11.5q1 -1 2 0" />
      <path d="M9.5 14.8q2.5 2 5 0" />
    </Svg>
  );
}

/* ============================================================
 * TRIGGERS (5) — neutral, observational
 * ============================================================ */

/** בין-אישי — two small figures */
export function TriggerRelational({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="8" cy="9" r="2" />
      <circle cx="16" cy="9" r="2" />
      <path d="M4 19c0-3 2-5 4-5s4 2 4 5M12 19c0-3 2-5 4-5s4 2 4 5" />
    </Svg>
  );
}

/** סביבתי — globe / earth */
export function TriggerEnvironmental({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M9 4.5c-1.5 4-1.5 11 0 15M15 4.5c1.5 4 1.5 11 0 15" />
    </Svg>
  );
}

/** זיכרון — thought bubble */
export function TriggerMemory({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="8" cy="17" r="3" />
      <circle cx="17" cy="8" r="4" />
      <circle cx="12.5" cy="12.5" r="1" />
    </Svg>
  );
}

/** מחשבתי — brain */
export function TriggerCognitive({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M9 4c-2 0-4 1-4 3s-2 1-2 4 2 3 2 5 1 4 4 4M15 4c2 0 4 1 4 3s2 1 2 4-2 3-2 5-1 4-4 4M12 4v16" />
    </Svg>
  );
}

/** גופני — body diagram */
export function TriggerPhysical({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="6" r="2" />
      <path d="M12 8v7M8 12h8M9 19l3-4 3 4" />
    </Svg>
  );
}

/* ============================================================
 * STATUS (4)
 * ============================================================ */

/** נבחר — ring + check */
export function StatusSelected({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="8" />
      <path d="M8 12l3 3 5-5.5" />
    </Svg>
  );
}

/** פעיל — filled disc */
export function StatusActive({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="5" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** ממתין — clock */
export function StatusAmbient({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </Svg>
  );
}

/** דחוף — triangle warning */
export function StatusCritical({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M12 4l9 16H3z" />
      <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
      <path d="M12 10v4" />
    </Svg>
  );
}

/* ============================================================
 * ACTIONS (6)
 * ============================================================ */

/** נגן — play in a circle */
export function ActionPlay({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="8" />
      <path d="M10 9v6l5-3z" />
    </Svg>
  );
}

/** השהיה — pause in a circle */
export function ActionPause({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="8" />
      <path d="M10 9v6M14 9v6" />
    </Svg>
  );
}

/** עוגן — ship's anchor */
export function ActionAnchor({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M10 5a2 2 0 1 0 4 0 2 2 0 1 0-4 0M12 7v13M9 10h6M5 16c0 3 3 4 7 4s7-1 7-4" />
    </Svg>
  );
}

/** יצוא — out of tray */
export function ActionExport({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4" />
      <path d="M12 4v11M8 8l4-4 4 4" />
    </Svg>
  );
}

/** עריכה — pencil */
export function ActionEdit({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M4 20l5-1.5L20 7l-4-4L4.5 14.5z" />
      <path d="M14 5l4 4" />
    </Svg>
  );
}

/** שיתוף — three nodes */
export function ActionShare({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="6" cy="12" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M8 11l8-4M8 13l8 4" />
    </Svg>
  );
}

/* ============================================================
 * HOME / TOOLS (4)
 * ============================================================ */

/** מודד — heartbeat trace */
export function HomePulse({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M3 12h4l2-5 4 10 2-5h6" />
    </Svg>
  );
}

/** מראה — face inside an oval frame */
export function HomeMirror({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <ellipse cx="12" cy="12" rx="6" ry="8" />
      <circle cx="12" cy="9.5" r="1.6" />
      <path d="M8 17c1-2.5 2.4-3.5 4-3.5s3 1 4 3.5" />
    </Svg>
  );
}

/** ארגז כלים — box + handle */
export function HomeToolbox({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M9 8V6h6v2" />
    </Svg>
  );
}

/** היסטוריה — clock with a rewind hand */
export function HomeHistory({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M4 12a8 8 0 1 0 3-6.2L4 7" />
      <path d="M4 4v4h4" />
      <path d="M12 8v4l3 2" />
    </Svg>
  );
}

/* ============================================================
 * Registry — enumerate icons by category, label, component.
 * Useful for palette/gallery views or programmatic lookups.
 * ============================================================ */

export const ICON_INDEX = {
  // util
  ChevronStart:         { cat: 'util',    he: 'חזור',                    Component: ChevronStart },
  ChevronEnd:           { cat: 'util',    he: 'הבא',                     Component: ChevronEnd },
  Close:                { cat: 'util',    he: 'סגירה',                   Component: Close },
  Plus:                 { cat: 'util',    he: 'הוספה',                   Component: Plus },
  Menu:                 { cat: 'util',    he: 'תפריט',                   Component: Menu },
  More:                 { cat: 'util',    he: 'אפשרויות',                Component: More },
  Filter:               { cat: 'util',    he: 'סינון',                   Component: Filter },
  Search:               { cat: 'util',    he: 'חיפוש',                   Component: Search },
  Settings:             { cat: 'util',    he: 'הגדרות',                  Component: Settings },
  Info:                 { cat: 'util',    he: 'מידע',                    Component: Info },
  Time:                 { cat: 'util',    he: 'זמן',                     Component: Time },
  Calendar:             { cat: 'util',    he: 'יומן',                    Component: Calendar },
  // phase
  PhaseActivation:      { cat: 'phase',   he: 'פאזה 1 · התעוררות',       Component: PhaseActivation },
  PhaseGrounding:       { cat: 'phase',   he: 'פאזה 2 · הקרקעה',         Component: PhaseGrounding },
  PhaseBreath:          { cat: 'phase',   he: 'פאזה 3 · נשימה',          Component: PhaseBreath },
  PhaseSomatic:         { cat: 'phase',   he: 'פאזה 4 · סומטי',          Component: PhaseSomatic },
  PhaseTriggers:        { cat: 'phase',   he: 'פאזה 5 · טריגרים',        Component: PhaseTriggers },
  PhaseDistortion:      { cat: 'phase',   he: 'פאזה 6 · עיוותים',        Component: PhaseDistortion },
  PhaseReality:         { cat: 'phase',   he: 'פאזה 7 · בדיקת מציאות',   Component: PhaseReality },
  PhaseIntegration:     { cat: 'phase',   he: 'פאזה 8 · אינטגרציה',      Component: PhaseIntegration },
  // schema
  SchemaVulnerable:     { cat: 'schema',  he: 'ילד פגיע',                Component: SchemaVulnerable },
  SchemaAngry:          { cat: 'schema',  he: 'ילד כועס',                Component: SchemaAngry },
  SchemaImpulsive:      { cat: 'schema',  he: 'ילד אימפולסיבי',          Component: SchemaImpulsive },
  SchemaHappy:          { cat: 'schema',  he: 'ילד מאושר',               Component: SchemaHappy },
  SchemaCompliant:      { cat: 'schema',  he: 'הכניע',                   Component: SchemaCompliant },
  SchemaDetached:       { cat: 'schema',  he: 'המגן המנותק',             Component: SchemaDetached },
  SchemaPunitive:       { cat: 'schema',  he: 'ההורה הביקורתי',          Component: SchemaPunitive },
  SchemaDemanding:      { cat: 'schema',  he: 'ההורה התובעני',           Component: SchemaDemanding },
  SchemaHealthyAdult:   { cat: 'schema',  he: 'מבוגר בריא',              Component: SchemaHealthyAdult },
  // trigger
  TriggerRelational:    { cat: 'trigger', he: 'בין-אישי',                Component: TriggerRelational },
  TriggerEnvironmental: { cat: 'trigger', he: 'סביבתי',                  Component: TriggerEnvironmental },
  TriggerMemory:        { cat: 'trigger', he: 'זיכרון',                  Component: TriggerMemory },
  TriggerCognitive:     { cat: 'trigger', he: 'מחשבתי',                  Component: TriggerCognitive },
  TriggerPhysical:      { cat: 'trigger', he: 'גופני',                   Component: TriggerPhysical },
  // status
  StatusSelected:       { cat: 'status',  he: 'נבחר',                    Component: StatusSelected },
  StatusActive:         { cat: 'status',  he: 'פעיל',                    Component: StatusActive },
  StatusAmbient:        { cat: 'status',  he: 'ממתין',                   Component: StatusAmbient },
  StatusCritical:       { cat: 'status',  he: 'דחוף',                    Component: StatusCritical },
  // action
  ActionPlay:           { cat: 'action',  he: 'נגן',                     Component: ActionPlay },
  ActionPause:          { cat: 'action',  he: 'השהיה',                   Component: ActionPause },
  ActionAnchor:         { cat: 'action',  he: 'עוגן',                    Component: ActionAnchor },
  ActionExport:         { cat: 'action',  he: 'יצוא',                    Component: ActionExport },
  ActionEdit:           { cat: 'action',  he: 'עריכה',                   Component: ActionEdit },
  ActionShare:          { cat: 'action',  he: 'שיתוף',                   Component: ActionShare },
  // home
  HomePulse:            { cat: 'home',    he: 'מודד',                    Component: HomePulse },
  HomeMirror:           { cat: 'home',    he: 'מראה',                    Component: HomeMirror },
  HomeToolbox:          { cat: 'home',    he: 'ארגז כלים',               Component: HomeToolbox },
  HomeHistory:          { cat: 'home',    he: 'היסטוריה',                Component: HomeHistory },
};
