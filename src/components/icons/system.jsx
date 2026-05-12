/* tavor-mind icon system — single source of truth.
 *
 * Every icon is a 24×24 viewBox, drawn with 1.5px stroke, round caps & joins,
 * fill="none" by default, currentColor everywhere. Filled accents are explicit.
 *
 * Categories: util / phase / schema / trigger / status / action / home
 *
 * Chevrons are drawn directly for RTL (the project's default direction):
 *   ChevronStart (back)    → points right
 *   ChevronEnd   (forward) → points left
 *
 * Mirrors window.ICONS in design-snapshot.html.
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

export const ICON_CATEGORIES = [
  { id: 'util',    title: 'Navigation & utility',
    note: 'Should disappear into the interface. Familiar enough to be invisible.' },
  { id: 'phase',   title: 'Emergency-Flow phases',
    note: 'A journey from body to mind to integration. Earlier phases are concrete; later ones abstract into geometry.' },
  { id: 'schema',  title: 'Schema modes',
    note: 'States of being, not symptoms. Each schema is a survival pattern — drawn with respect.' },
  { id: 'trigger', title: 'Triggers',
    note: 'Neutral and observational, not catastrophic. A trigger is a fact, not a verdict.' },
  { id: 'status',  title: 'Status indicators',
    note: 'Four states. Selected. Active. Ambient. Critical. No more.' },
  { id: 'action',  title: 'Actions',
    note: 'The smallest possible verbs — what the user can do to this object.' },
  { id: 'home',    title: 'Home & tools',
    note: 'Anchor surfaces. The face the app shows when nothing is wrong yet.' },
];

/* ============================================================
 * UTILITY & NAVIGATION (12)
 * ============================================================ */

/** חזור — back (logical start), points right in RTL */
export function ChevronStart({ size, title }) {
  return <Svg size={size} title={title}><path d="M9.5 6.5L15 12l-5.5 5.5" /></Svg>;
}

/** הבא — forward (logical end), points left in RTL */
export function ChevronEnd({ size, title }) {
  return <Svg size={size} title={title}><path d="M14.5 6.5L9 12l5.5 5.5" /></Svg>;
}

/** סגירה */
export function Close({ size, title }) {
  return <Svg size={size} title={title}><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" /></Svg>;
}

/** הוספה */
export function Plus({ size, title }) {
  return <Svg size={size} title={title}><path d="M12 5.5v13M5.5 12h13" /></Svg>;
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
  return <Svg size={size} title={title}><path d="M4 7h16M7 12h10M10 17h4" /></Svg>;
}

/** חיפוש */
export function Search({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="11" cy="11" r="5.5" />
      <path d="M11 16.5v3.5" />
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
      <path d="M12 11.5v5" />
      <circle cx="12" cy="8.5" r="0.6" fill="currentColor" stroke="none" />
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

/** פאזה 1 · התעוררות — first awareness, a point inside a ring */
export function PhaseActivation({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="7.5" />
    </Svg>
  );
}

/** פאזה 2 · הקרקעה — body lands on the ground */
export function PhaseGrounding({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M4 19h16" />
      <circle cx="12" cy="8" r="3" />
      <path d="M12 11v8" />
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

/** פאזה 4 · סומטי — body axis with somatic anchors */
export function PhaseSomatic({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M12 4v16" />
      <circle cx="12" cy="8" r="2" />
      <circle cx="12" cy="15" r="2" />
    </Svg>
  );
}

/** פאזה 5 · טריגרים — concentric awareness */
export function PhaseTriggers({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="6.5" />
      <circle cx="12" cy="12" r="10" />
    </Svg>
  );
}

/** פאזה 6 · עיוותים — a shape that does not fit its frame */
export function PhaseDistortion({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M12 8l-4 8h8z" />
    </Svg>
  );
}

/** פאזה 7 · בדיקת מציאות — framed mirror */
export function PhaseReality({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M12 4v16" />
    </Svg>
  );
}

/** פאזה 8 · אינטגרציה — two arcs become one shape */
export function PhaseIntegration({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="9" cy="12" r="5" />
      <circle cx="15" cy="12" r="5" />
    </Svg>
  );
}

/* ============================================================
 * SCHEMA MODES (9) — states of being, not symptoms
 * ============================================================ */

/** ילד פגיע — small enclosed self under a shelter arc */
export function SchemaVulnerable({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M4 13c0-4.5 3.5-8 8-8s8 3.5 8 8" />
      <circle cx="12" cy="16" r="2.5" />
    </Svg>
  );
}

/** ילד כועס — contained intensity, concentric squares */
export function SchemaAngry({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <rect x="5" y="5" width="14" height="14" rx="1" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** ילד אימפולסיבי — scattered points, energy without spine */
export function SchemaImpulsive({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="7" cy="7" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="13" cy="5.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18" cy="10" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="6.5" cy="14.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="14" cy="17" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="19" cy="16" r="1.4" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** ילד מאושר — open form, petals around the center */
export function SchemaHappy({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 5.5c1.5 2 1.5 4 0 5.5M12 18.5c1.5-2 1.5-4 0-5.5M5.5 12c2-1.5 4-1.5 5.5 0M18.5 12c-2 1.5-4 1.5-5.5 0" />
    </Svg>
  );
}

/** הכניע — straight line above, bowing curve below */
export function SchemaCompliant({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M4 6h16" />
      <path d="M5 12c2 5 12 5 14 0" />
    </Svg>
  );
}

/** המגן המנותק — hex shield wrapping a contained core */
export function SchemaDetached({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M12 4l7 4v8l-7 4-7-4V8z" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** ההורה הביקורתי — inverted triangle, pressure from above */
export function SchemaPunitive({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M4 5h16l-8 14z" />
    </Svg>
  );
}

/** ההורה התובעני — high bar with a self reaching upward */
export function SchemaDemanding({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M4 6h16" />
      <path d="M12 12v-3" />
      <circle cx="12" cy="15" r="3" />
    </Svg>
  );
}

/** מבוגר בריא — a circle with its own centered axis */
export function SchemaHealthyAdult({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M4.5 12h15M12 4.5v15" />
    </Svg>
  );
}

/* ============================================================
 * TRIGGERS (5) — neutral, observational
 * ============================================================ */

/** בין-אישי */
export function TriggerRelational({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="9" cy="12" r="3.5" />
      <circle cx="15" cy="12" r="3.5" />
    </Svg>
  );
}

/** סביבתי */
export function TriggerEnvironmental({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** זיכרון — dashed ring echoing a present point */
export function TriggerMemory({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="7.5" strokeDasharray="2 2.5" />
    </Svg>
  );
}

/** מחשבתי — sequence, a thought picking up a thought */
export function TriggerCognitive({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="6" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="18" cy="12" r="2" />
    </Svg>
  );
}

/** גופני */
export function TriggerPhysical({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M12 4v16" />
      <circle cx="12" cy="12" r="3.5" />
    </Svg>
  );
}

/* ============================================================
 * STATUS (4)
 * ============================================================ */

/** נבחר */
export function StatusSelected({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Svg>
  );
}

/** פעיל */
export function StatusActive({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="5" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** ממתין */
export function StatusAmbient({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="7" />
    </Svg>
  );
}

/** דחוף */
export function StatusCritical({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/* ============================================================
 * ACTIONS (6)
 * ============================================================ */

/** נגן — universal play convention, kept right-pointing */
export function ActionPlay({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M8 5.5v13l11-6.5z" />
    </Svg>
  );
}

/** השהיה */
export function ActionPause({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M9.5 6v12M14.5 6v12" />
    </Svg>
  );
}

/** עוגן — bookmark / save, symmetric vertical */
export function ActionAnchor({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M6.5 4h11v16l-5.5-4-5.5 4z" />
    </Svg>
  );
}

/** יצוא */
export function ActionExport({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4" />
      <path d="M12 4v11M8 8l4-4 4 4" />
    </Svg>
  );
}

/** עריכה */
export function ActionEdit({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M4 20l5-1.5L20 7l-4-4L4.5 14.5z" />
      <path d="M14 5l4 4" />
    </Svg>
  );
}

/** שיתוף */
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

/** מודד — heartbeat trace, replaces literal hearts */
export function HomePulse({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <path d="M3 12h4l2-5 4 10 2-5h6" />
    </Svg>
  );
}

/** מראה — review surface, oval frame with a soft highlight */
export function HomeMirror({ size, title }) {
  return (
    <Svg size={size} title={title}>
      <ellipse cx="12" cy="12" rx="6" ry="8" />
      <path d="M8 8c1.5 0 2.5 1 2.5 2.5" />
    </Svg>
  );
}

/** ארגז כלים */
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
