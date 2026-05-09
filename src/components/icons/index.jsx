/* tavor-mind — Phosphor Duotone icon set.
 *
 * Unified style across the app:
 *   viewBox: 0 0 24 24
 *   stroke-width: 1.5, rounded caps and joins
 *   color: inherits from parent (currentColor) — set by .ds2-icon-tile-* family class
 *   duotone: one path with fill="currentColor" fillOpacity="0.25"
 *
 * Family colors (set by tile class):
 *   crisis  → heart red       (Emergency, triggers, hyper, activated)
 *   calm    → lichen blue     (Mindfulness, breath, on-edge)
 *   body    → green           (Somatic, grounding, body)
 *   self    → purple          (Modes, parts, schemas, profile)
 *   warmth  → clay orange     (Gratitude, mood, morning, mid-balance)
 *   reflect → indigo          (Therapy, repository, i-language, catastrophe)
 *   mind    → teal            (Review, history, meta, settings)
 */

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const DUOTONE = {
  fill: 'currentColor',
  fillOpacity: 0.25,
};

function Svg({ size = 24, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ============================================================
 * HomeScreen icons
 * ============================================================ */

/** Crisis / Emergency — open hand reaching forward, "I'll hold you" */
export function EmergencyIcon({ size }) {
  return (
    <Svg size={size}>
      {/* palm duotone */}
      <path
        {...DUOTONE}
        d="M9 12c0-3 0-5.5 0-7a1.2 1.2 0 0 1 2.4 0v6.5c0-3 0-5 0-6.5a1.2 1.2 0 0 1 2.4 0V12c0-2 0-3.2 0-4.5a1.2 1.2 0 0 1 2.4 0V14c0 3.5-2 6-5 6s-5-2-5-6 0-3 0-3z"
      />
      <path {...STROKE} d="M9 12V5a1.2 1.2 0 0 1 2.4 0v6.5" />
      <path {...STROKE} d="M11.4 11.5V5a1.2 1.2 0 0 1 2.4 0V12" />
      <path {...STROKE} d="M13.8 12V7.5a1.2 1.2 0 0 1 2.4 0V14c0 3.5-2 6-5 6s-5-2-5-6V9.5a1.2 1.2 0 0 1 2.4 0V14" />
    </Svg>
  );
}

/** Warmth / Checkin — sun + moon split (morning + evening) */
export function CheckinIcon({ size }) {
  return (
    <Svg size={size}>
      <path {...DUOTONE} d="M12 4a8 8 0 0 0 0 16V4z" />
      <circle {...STROKE} cx="12" cy="12" r="8" />
      <path {...STROKE} d="M12 4v16" />
      {/* sun rays on left half */}
      <path {...STROKE} d="M5 8l-1.2-.7" />
      <path {...STROKE} d="M5 16l-1.2.7" />
      <path {...STROKE} d="M3.5 12H2" />
    </Svg>
  );
}

/** Calm / Mindfulness — person in lotus pose with halo */
export function MindfulnessIcon({ size }) {
  return (
    <Svg size={size}>
      {/* halo arc */}
      <path {...STROKE} d="M7.5 5.5a6 6 0 0 1 9 0" opacity="0.55" />
      {/* head */}
      <circle {...DUOTONE} cx="12" cy="8.5" r="2" />
      <circle {...STROKE} cx="12" cy="8.5" r="2" />
      {/* torso */}
      <path {...STROKE} d="M12 10.5v3" />
      {/* arms folded, hands resting */}
      <path {...STROKE} d="M8.5 13.5c1.2-.6 2.3-.8 3.5-.8s2.3.2 3.5.8" />
      {/* crossed legs base */}
      <path {...DUOTONE} d="M5 19c2-3 5-4 7-4s5 1 7 4H5z" />
      <path {...STROKE} d="M5 19c2-3 5-4 7-4s5 1 7 4" />
    </Svg>
  );
}

/** Calm / Tools — compass with needle */
export function ToolsIcon({ size }) {
  return (
    <Svg size={size}>
      <circle {...DUOTONE} cx="12" cy="12" r="9" />
      <circle {...STROKE} cx="12" cy="12" r="9" />
      <path {...STROKE} d="M9 15l3-7 3 7-3-1.5-3 1.5z" />
      <circle cx="12" cy="13.5" r="0.6" fill="currentColor" />
    </Svg>
  );
}

/** Self / Profile — fingerprint, concentric arcs */
export function ProfileIcon({ size }) {
  return (
    <Svg size={size}>
      <path {...DUOTONE} d="M12 7a5 5 0 0 1 5 5v3a5 5 0 0 1-2 4H9a5 5 0 0 1-2-4v-3a5 5 0 0 1 5-5z" />
      <path {...STROKE} d="M7 12a5 5 0 0 1 10 0v3a5 5 0 0 1-1 3" />
      <path {...STROKE} d="M9.5 12a2.5 2.5 0 0 1 5 0v4" />
      <path {...STROKE} d="M12 12v4" />
      <path {...STROKE} d="M5 11a7 7 0 0 1 14 0" />
    </Svg>
  );
}

/** Mind / Repository — open book */
export function RepositoryIcon({ size }) {
  return (
    <Svg size={size}>
      <path {...DUOTONE} d="M12 6v13c-1.5-1-3.5-1.5-7-1.5V4.5c3.5 0 5.5.5 7 1.5z" />
      <path {...STROKE} d="M12 6c-1.5-1-3.5-1.5-7-1.5V18c3.5 0 5.5.5 7 1.5" />
      <path {...STROKE} d="M12 6c1.5-1 3.5-1.5 7-1.5V18c-3.5 0-5.5.5-7 1.5" />
      <path {...STROKE} d="M12 6v13" />
    </Svg>
  );
}

/** Self / Mirror — concentric eye (preserved from previous design) */
export function MirrorIcon({ size }) {
  return (
    <Svg size={size}>
      <circle {...DUOTONE} cx="12" cy="12" r="9" />
      <circle {...STROKE} cx="12" cy="12" r="9" />
      <circle {...STROKE} cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </Svg>
  );
}

/** Reflect / Therapy — two chairs facing each other */
export function TherapyIcon({ size }) {
  return (
    <Svg size={size}>
      {/* left chair seat duotone */}
      <path {...DUOTONE} d="M4 13h5v3H4z" />
      {/* left chair */}
      <path {...STROKE} d="M4 16v-3h5v3" />
      <path {...STROKE} d="M4.5 16v3" />
      <path {...STROKE} d="M8.5 16v3" />
      <path {...STROKE} d="M9 13V8" />
      {/* right chair */}
      <path {...STROKE} d="M15 13V8" />
      <path {...STROKE} d="M15 16v-3h5v3" />
      <path {...STROKE} d="M15.5 16v3" />
      <path {...STROKE} d="M19.5 16v3" />
    </Svg>
  );
}

/** Utility — chevron pointing inline-end (left in RTL) */
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

/* ============================================================
 * Toolbox icons (4)
 * ============================================================ */

/** Self / Schemas — 4 overlapping circles (Venn) */
export function SchemasIcon({ size }) {
  return (
    <Svg size={size}>
      <circle {...DUOTONE} cx="9" cy="9" r="4" />
      <circle {...DUOTONE} cx="15" cy="15" r="4" />
      <circle {...STROKE} cx="9" cy="9" r="4" />
      <circle {...STROKE} cx="15" cy="9" r="4" />
      <circle {...STROKE} cx="9" cy="15" r="4" />
      <circle {...STROKE} cx="15" cy="15" r="4" />
    </Svg>
  );
}

/** Self / Attachment — two figures connected by a thin line */
export function AttachmentIcon({ size }) {
  return (
    <Svg size={size}>
      {/* left figure - filled (anxious/holding) */}
      <circle {...DUOTONE} cx="7" cy="9" r="2.2" />
      <path {...DUOTONE} d="M3.8 18c.5-2.4 1.7-4 3.2-4s2.7 1.6 3.2 4H3.8z" />
      <circle {...STROKE} cx="7" cy="9" r="2.2" />
      <path {...STROKE} d="M3.8 18c.5-2.4 1.7-4 3.2-4s2.7 1.6 3.2 4" />
      {/* connecting line */}
      <path {...STROKE} d="M10.5 12.5h3" opacity="0.55" />
      {/* right figure - outline */}
      <circle {...STROKE} cx="17" cy="9" r="2.2" />
      <path {...STROKE} d="M13.8 18c.5-2.4 1.7-4 3.2-4s2.7 1.6 3.2 4" />
    </Svg>
  );
}

/** Self / Modes — ANCHOR icon. 3-tier hierarchy: observer / 4 protectors / inner child */
export function ModesIcon({ size }) {
  return (
    <Svg size={size}>
      {/* top — wise observer */}
      <circle {...STROKE} cx="12" cy="4.5" r="1.5" />
      {/* middle — 4 protectors */}
      <circle {...STROKE} cx="6" cy="11.5" r="1.4" />
      <circle {...STROKE} cx="10" cy="11.5" r="1.4" />
      <circle {...STROKE} cx="14" cy="11.5" r="1.4" />
      <circle {...STROKE} cx="18" cy="11.5" r="1.4" />
      {/* bottom — inner child (with duotone) */}
      <circle {...DUOTONE} cx="12" cy="19" r="2.5" />
      <circle {...STROKE} cx="12" cy="19" r="2.5" />
    </Svg>
  );
}

/** Warmth / Self-Letter — open envelope with letter peeking out */
export function SelfLetterIcon({ size }) {
  return (
    <Svg size={size}>
      {/* letter peeking */}
      <path {...DUOTONE} d="M7 5h10v8H7z" />
      <path {...STROKE} d="M7 5h10v8H7z" />
      <path {...STROKE} d="M9 8h6" />
      <path {...STROKE} d="M9 10.5h4" />
      {/* envelope */}
      <path {...STROKE} d="M3 11l9 5 9-5" />
      <path {...STROKE} d="M3 11v8h18v-8" />
    </Svg>
  );
}

/* ============================================================
 * Tools icons (4)
 * ============================================================ */

/** Crisis / Triggers — target with ripples */
export function TriggersIcon({ size }) {
  return (
    <Svg size={size}>
      <circle {...DUOTONE} cx="12" cy="12" r="2.5" />
      <circle {...STROKE} cx="12" cy="12" r="2.5" />
      <circle {...STROKE} cx="12" cy="12" r="6" opacity="0.7" />
      <circle {...STROKE} cx="12" cy="12" r="9.5" opacity="0.4" />
    </Svg>
  );
}

/** Self / Mode-check — radar with sweep needle */
export function ModeCheckIcon({ size }) {
  return (
    <Svg size={size}>
      <circle {...DUOTONE} cx="12" cy="12" r="9" />
      <circle {...STROKE} cx="12" cy="12" r="9" />
      <path {...STROKE} d="M12 12L18 7" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
      <path {...STROKE} d="M3 12h2" />
      <path {...STROKE} d="M19 12h2" />
      <path {...STROKE} d="M12 3v2" />
      <path {...STROKE} d="M12 19v2" />
    </Svg>
  );
}

/** Reflect / Catastrophe — balanced scales (reality check) */
export function CatastropheIcon({ size }) {
  return (
    <Svg size={size}>
      {/* center pole */}
      <path {...STROKE} d="M12 4v17" />
      <path {...STROKE} d="M9 21h6" />
      {/* balance bar */}
      <path {...STROKE} d="M4 7h16" />
      {/* left pan */}
      <path {...DUOTONE} d="M3 12c0 1.7 1.3 3 3 3s3-1.3 3-3H3z" />
      <path {...STROKE} d="M3 12c0 1.7 1.3 3 3 3s3-1.3 3-3" />
      <path {...STROKE} d="M6 7v5" />
      {/* right pan */}
      <path {...STROKE} d="M15 12c0 1.7 1.3 3 3 3s3-1.3 3-3" />
      <path {...STROKE} d="M18 7v5" />
    </Svg>
  );
}

/** Body / Somatic — body silhouette with 3 dots */
export function SomaticToolIcon({ size }) {
  return (
    <Svg size={size}>
      {/* body outline duotone */}
      <path
        {...DUOTONE}
        d="M12 3a2.2 2.2 0 0 1 2.2 2.2A2.2 2.2 0 0 1 12 7.4 2.2 2.2 0 0 1 9.8 5.2 2.2 2.2 0 0 1 12 3zM9 8h6l-1 12h-4z"
      />
      <circle {...STROKE} cx="12" cy="5.2" r="2.2" />
      <path {...STROKE} d="M9 8h6l-1 12h-4z" />
      {/* energy dots */}
      <circle cx="12" cy="11" r="0.9" fill="currentColor" />
      <circle cx="12" cy="14.5" r="0.9" fill="currentColor" />
      <circle cx="12" cy="18" r="0.9" fill="currentColor" />
    </Svg>
  );
}

/* ============================================================
 * Checkin / Mindfulness icons
 * ============================================================ */

/** Warmth / Mood-log — face with neutral mouth */
export function MoodLogIcon({ size }) {
  return (
    <Svg size={size}>
      <circle {...DUOTONE} cx="12" cy="12" r="9" />
      <circle {...STROKE} cx="12" cy="12" r="9" />
      <circle cx="9" cy="10.5" r="0.9" fill="currentColor" />
      <circle cx="15" cy="10.5" r="0.9" fill="currentColor" />
      <path {...STROKE} d="M9 15.5h6" />
    </Svg>
  );
}

/** Mind / History — calendar with dot */
export function HistoryIcon({ size }) {
  return (
    <Svg size={size}>
      <path {...DUOTONE} d="M4 8h16v12H4z" />
      <rect {...STROKE} x="4" y="6" width="16" height="14" rx="1.5" />
      <path {...STROKE} d="M4 10h16" />
      <path {...STROKE} d="M9 4v4" />
      <path {...STROKE} d="M15 4v4" />
      <circle cx="12" cy="15" r="1.4" fill="currentColor" />
    </Svg>
  );
}

/** Warmth / Morning — sun rising over horizon */
export function MorningIcon({ size }) {
  return (
    <Svg size={size}>
      <path {...DUOTONE} d="M5 17a7 7 0 0 1 14 0H5z" />
      <path {...STROKE} d="M5 17a7 7 0 0 1 14 0" />
      <path {...STROKE} d="M3 17h18" />
      {/* rays */}
      <path {...STROKE} d="M12 5v2" />
      <path {...STROKE} d="M5 11l1.4 1.4" />
      <path {...STROKE} d="M19 11l-1.4 1.4" />
    </Svg>
  );
}

/** Calm / On-edge — balance line with dot at the tipping edge */
export function OnEdgeIcon({ size }) {
  return (
    <Svg size={size}>
      <path {...STROKE} d="M3 17h18" />
      {/* tilted balance bar */}
      <path {...STROKE} d="M5 13l14-3" />
      {/* dot at the tipping edge */}
      <circle {...DUOTONE} cx="19" cy="10" r="2" />
      <circle {...STROKE} cx="19" cy="10" r="2" />
      {/* fulcrum */}
      <path {...STROKE} d="M11 17v-4" opacity="0.55" />
    </Svg>
  );
}

/** Crisis / Activated — soft flame */
export function ActivatedIcon({ size }) {
  return (
    <Svg size={size}>
      <path
        {...DUOTONE}
        d="M12 3c0 4-5 5-5 10a5 5 0 0 0 10 0c0-3-2-4-3-6 0 2-1 3-2 3s-1-2 0-7z"
      />
      <path
        {...STROKE}
        d="M12 3c0 4-5 5-5 10a5 5 0 0 0 10 0c0-3-2-4-3-6 0 2-1 3-2 3s-1-2 0-7z"
      />
    </Svg>
  );
}

/** Mind / Depleted — candle with small flame */
export function DepletedIcon({ size }) {
  return (
    <Svg size={size}>
      {/* flame */}
      <path {...DUOTONE} d="M12 3c1 1.5 1.5 2.5 1.5 3.5a1.5 1.5 0 0 1-3 0c0-1 .5-2 1.5-3.5z" />
      <path {...STROKE} d="M12 3c1 1.5 1.5 2.5 1.5 3.5a1.5 1.5 0 0 1-3 0c0-1 .5-2 1.5-3.5z" />
      {/* candle body */}
      <path {...STROKE} d="M9 8h6v12H9z" />
      <path {...STROKE} d="M12 8v12" opacity="0.4" />
      {/* base */}
      <path {...STROKE} d="M8 20h8" />
    </Svg>
  );
}

/** Warmth / Mid-balance — two soft scales pans, balanced */
export function MidBalanceIcon({ size }) {
  return (
    <Svg size={size}>
      {/* horizon line */}
      <path {...STROKE} d="M3 12h18" />
      {/* left pan */}
      <path {...DUOTONE} d="M4 8c0 2 1.3 3.5 3 3.5s3-1.5 3-3.5H4z" />
      <path {...STROKE} d="M4 8c0 2 1.3 3.5 3 3.5s3-1.5 3-3.5" />
      {/* right pan */}
      <path {...DUOTONE} d="M14 8c0 2 1.3 3.5 3 3.5s3-1.5 3-3.5h-6z" />
      <path {...STROKE} d="M14 8c0 2 1.3 3.5 3 3.5s3-1.5 3-3.5" />
      {/* center pivot */}
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      <path {...STROKE} d="M12 12v6" />
      <path {...STROKE} d="M9 19h6" />
    </Svg>
  );
}

/** Play (mindfulness recordings, generic) — triangle in circle */
export function PlayIcon({ size }) {
  return (
    <Svg size={size}>
      <circle {...DUOTONE} cx="12" cy="12" r="9" />
      <circle {...STROKE} cx="12" cy="12" r="9" />
      <path d="M10 8.5l6 3.5-6 3.5z" fill="currentColor" />
    </Svg>
  );
}

/* ============================================================
 * Repository analysis-type icons (5)
 * ============================================================ */

/** Reflect / Emotion-recognition — heart with center dot */
export function EmotionRecognitionIcon({ size }) {
  return (
    <Svg size={size}>
      <path
        {...DUOTONE}
        d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5 4 4 0 0 1 7 2.5c0 5.5-7 10-7 10z"
      />
      <path
        {...STROKE}
        d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5 4 4 0 0 1 7 2.5c0 5.5-7 10-7 10z"
      />
      <circle cx="12" cy="11.5" r="1.2" fill="currentColor" />
    </Svg>
  );
}

/** Warmth / Gratitude — open palm upward with dot floating */
export function GratitudeIcon({ size }) {
  return (
    <Svg size={size}>
      {/* dot floating above */}
      <circle {...DUOTONE} cx="12" cy="7" r="1.5" />
      <circle {...STROKE} cx="12" cy="7" r="1.5" />
      {/* palm bowl shape */}
      <path
        {...DUOTONE}
        d="M5 13c0 4 3 6 7 6s7-2 7-6c0-1-.7-1.5-1.5-1.5s-1.5.5-1.5 1.5H7c0-1-.7-1.5-1.5-1.5S5 12 5 13z"
      />
      <path
        {...STROKE}
        d="M5 13c0 4 3 6 7 6s7-2 7-6c0-1-.7-1.5-1.5-1.5s-1.5.5-1.5 1.5"
      />
      <path {...STROKE} d="M7 13c0-1-.7-1.5-1.5-1.5S5 12 5 13" />
    </Svg>
  );
}

/** Reflect / I-Language — speech bubble with center dot */
export function ILanguageIcon({ size }) {
  return (
    <Svg size={size}>
      <path
        {...DUOTONE}
        d="M4 6h16v10H10l-4 4v-4H4z"
      />
      <path
        {...STROKE}
        d="M4 6h16v10H10l-4 4v-4H4z"
      />
      <circle cx="12" cy="11" r="1.4" fill="currentColor" />
    </Svg>
  );
}

/** Mind / Meta-analysis — 3 small circles connecting to one central */
export function MetaAnalysisIcon({ size }) {
  return (
    <Svg size={size}>
      {/* connection lines */}
      <path {...STROKE} d="M6 6l5 5" opacity="0.55" />
      <path {...STROKE} d="M18 6l-5 5" opacity="0.55" />
      <path {...STROKE} d="M6 18l5-5" opacity="0.55" />
      {/* outer dots */}
      <circle {...STROKE} cx="6" cy="6" r="1.6" />
      <circle {...STROKE} cx="18" cy="6" r="1.6" />
      <circle {...STROKE} cx="6" cy="18" r="1.6" />
      {/* center */}
      <circle {...DUOTONE} cx="13" cy="13" r="3.2" />
      <circle {...STROKE} cx="13" cy="13" r="3.2" />
    </Svg>
  );
}

/* ============================================================
 * Emergency phase icons (10)
 * ============================================================ */

/** Phase 1 — Activation: 3 arrows (hyper/mid/hypo) */
export function Phase1ActivationIcon({ size }) {
  return (
    <Svg size={size}>
      {/* up arrow */}
      <path {...STROKE} d="M6 14V6m0 0l-2.5 2.5M6 6l2.5 2.5" />
      {/* mid line */}
      <path {...DUOTONE} d="M10 11h4v2h-4z" />
      <path {...STROKE} d="M10 12h4" />
      {/* down arrow */}
      <path {...STROKE} d="M18 10v8m0 0l-2.5-2.5M18 18l2.5-2.5" />
    </Svg>
  );
}

/** Phase 2 — Breathing: two lungs / expanding circle */
export function Phase2BreathingIcon({ size }) {
  return (
    <Svg size={size}>
      <circle {...DUOTONE} cx="12" cy="12" r="3" />
      <circle {...STROKE} cx="12" cy="12" r="3" />
      <circle {...STROKE} cx="12" cy="12" r="6" opacity="0.6" />
      <circle {...STROKE} cx="12" cy="12" r="9.5" opacity="0.3" />
    </Svg>
  );
}

/** Phase 3 — Grounding: hand with 5 lines (5 senses) */
export function Phase3GroundingIcon({ size }) {
  return (
    <Svg size={size}>
      {/* palm */}
      <path
        {...DUOTONE}
        d="M7 13c0-3 .5-5 .5-7a1 1 0 0 1 2 0v4l1-5a1 1 0 0 1 2 0v5l1-4a1 1 0 0 1 2 0v5l1-3a1 1 0 0 1 2 0v8c0 2.5-2 4.5-4.5 4.5h-2A4 4 0 0 1 7 13z"
      />
      <path
        {...STROKE}
        d="M7 13c0-3 .5-5 .5-7a1 1 0 0 1 2 0v4"
      />
      <path {...STROKE} d="M9.5 10V5a1 1 0 0 1 2 0v5" />
      <path {...STROKE} d="M11.5 10V6a1 1 0 0 1 2 0v5" />
      <path {...STROKE} d="M13.5 11V8a1 1 0 0 1 2 0v6" />
      <path {...STROKE} d="M7 13v2c0 3 2 5 5 5s4.5-2 4.5-4.5V14" />
    </Svg>
  );
}

/** Phase 4 — Meditation: sound waves */
export function Phase4MeditationIcon({ size }) {
  return (
    <Svg size={size}>
      <circle {...DUOTONE} cx="12" cy="12" r="2" />
      <circle {...STROKE} cx="12" cy="12" r="2" />
      <path {...STROKE} d="M6 12a6 6 0 0 1 12 0" opacity="0.7" />
      <path {...STROKE} d="M3 12a9 9 0 0 1 18 0" opacity="0.4" />
    </Svg>
  );
}

/** Phase 5 — Anchor: nautical anchor */
export function Phase5AnchorIcon({ size }) {
  return (
    <Svg size={size}>
      <circle {...DUOTONE} cx="12" cy="6" r="1.8" />
      <circle {...STROKE} cx="12" cy="6" r="1.8" />
      <path {...STROKE} d="M12 8v12" />
      <path {...STROKE} d="M9 11h6" />
      <path {...STROKE} d="M5 16c0 3 3 4 7 4s7-1 7-4" />
      <path {...STROKE} d="M5 16l-2-1.5" />
      <path {...STROKE} d="M19 16l2-1.5" />
    </Svg>
  );
}

/** Phase 6 — Somatic: palm with center dot */
export function Phase6SomaticIcon({ size }) {
  return (
    <Svg size={size}>
      <path
        {...DUOTONE}
        d="M8 14c0-2 0-4 0-6a1 1 0 0 1 2 0v3l1-4a1 1 0 0 1 2 0v4l1-3a1 1 0 0 1 2 0v4l1-2a1 1 0 0 1 2 0v6a4 4 0 0 1-4 4h-1a5 5 0 0 1-5-5z"
      />
      <path {...STROKE} d="M8 14V8a1 1 0 0 1 2 0v3" />
      <path {...STROKE} d="M10 11V7a1 1 0 0 1 2 0v4" />
      <path {...STROKE} d="M12 11V8a1 1 0 0 1 2 0v4" />
      <path {...STROKE} d="M14 12v-2a1 1 0 0 1 2 0v6a4 4 0 0 1-4 4h-1a5 5 0 0 1-3-1.5" />
      <circle cx="12" cy="15" r="1.2" fill="currentColor" />
    </Svg>
  );
}

/** Phase 7 — Bridge: arch with two pillars */
export function Phase7BridgeIcon({ size }) {
  return (
    <Svg size={size}>
      <path {...DUOTONE} d="M3 14a9 5 0 0 1 18 0v1H3z" />
      <path {...STROKE} d="M3 14a9 5 0 0 1 18 0" />
      <path {...STROKE} d="M3 14v6" />
      <path {...STROKE} d="M21 14v6" />
      <path {...STROKE} d="M9 14v6" />
      <path {...STROKE} d="M15 14v6" />
      <path {...STROKE} d="M3 20h18" />
    </Svg>
  );
}

/** Phase 8 — Trigger investigation: magnifying glass over a spark */
export function Phase8TriggerIcon({ size }) {
  return (
    <Svg size={size}>
      <circle {...DUOTONE} cx="11" cy="11" r="6" />
      <circle {...STROKE} cx="11" cy="11" r="6" />
      <path {...STROKE} d="M15.5 15.5L20 20" />
      {/* spark inside */}
      <path {...STROKE} d="M11 8v3" />
      <path {...STROKE} d="M11 13v1" />
      <path {...STROKE} d="M8 11h2" />
      <path {...STROKE} d="M12 11h2" />
    </Svg>
  );
}

/** Phase 10 — Closing: sun setting over horizon */
export function Phase10ClosingIcon({ size }) {
  return (
    <Svg size={size}>
      <path {...DUOTONE} d="M5 16a7 7 0 0 1 14 0H5z" />
      <path {...STROKE} d="M5 16a7 7 0 0 1 14 0" />
      <path {...STROKE} d="M3 16h18" />
      {/* descending arrow indicator */}
      <path {...STROKE} d="M12 8v3" opacity="0.6" />
      <path {...STROKE} d="M11 10l1 1 1-1" opacity="0.6" />
      <path {...STROKE} d="M3 19h18" opacity="0.4" />
    </Svg>
  );
}

/* ============================================================
 * Review section icons (8)
 * ============================================================ */

/** Mind / Checkin-rhythm — pulse line */
export function CheckinRhythmIcon({ size }) {
  return (
    <Svg size={size}>
      <path {...DUOTONE} d="M3 12h4l2-5 2 10 2-7 2 4 2-2h4v3H3z" />
      <path
        {...STROKE}
        d="M3 12h4l2-5 2 10 2-7 2 4 2-2h4"
      />
    </Svg>
  );
}

/** Body / Emotional-landscape — 3 soft hills */
export function EmotionalLandscapeIcon({ size }) {
  return (
    <Svg size={size}>
      <path {...DUOTONE} d="M3 18c2-4 4-4 6 0 1-3 3-3 4 0 1-5 4-5 8 0H3z" />
      <path
        {...STROKE}
        d="M3 18c2-4 4-4 6 0 1-3 3-3 4 0 1-5 4-5 8 0"
      />
      <path {...STROKE} d="M3 18h18" />
    </Svg>
  );
}

/** Reflect / Patterns — closed loop (two arrows in a circle) */
export function PatternsIcon({ size }) {
  return (
    <Svg size={size}>
      <circle {...DUOTONE} cx="12" cy="12" r="8" />
      <path {...STROKE} d="M19 12a7 7 0 0 1-12 5" />
      <path {...STROKE} d="M5 12a7 7 0 0 1 12-5" />
      <path {...STROKE} d="M17 7v3h-3" />
      <path {...STROKE} d="M7 17v-3h3" />
    </Svg>
  );
}

/** Self / Core-child — sprout with halo */
export function CoreChildIcon({ size }) {
  return (
    <Svg size={size}>
      <circle {...DUOTONE} cx="12" cy="14" r="3" />
      <circle {...STROKE} cx="12" cy="14" r="3" />
      {/* halo above */}
      <path {...STROKE} d="M9 8a3 3 0 0 1 6 0" opacity="0.55" />
      {/* sprout leaves */}
      <path {...STROKE} d="M12 14V8" />
      <path {...STROKE} d="M12 10c-2-1-3-2.5-3-4 1.5 0 3 1 3 2.5" />
      <path {...STROKE} d="M12 10c2-1 3-2.5 3-4-1.5 0-3 1-3 2.5" />
      <path {...STROKE} d="M9 19h6" />
    </Svg>
  );
}

/** Reflect / Open-question — question mark in an open circle */
export function OpenQuestionIcon({ size }) {
  return (
    <Svg size={size}>
      {/* open circle (gap at top) */}
      <path
        {...DUOTONE}
        d="M12 3a9 9 0 1 1-7 14"
      />
      <path
        {...STROKE}
        d="M5 17a9 9 0 1 1 14-7"
      />
      {/* question mark */}
      <path {...STROKE} d="M10 10a2 2 0 1 1 2 3v1" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" />
    </Svg>
  );
}

/** Reflect / Schemas-activated — 3 stacked layers */
export function SchemasActivatedIcon({ size }) {
  return (
    <Svg size={size}>
      <path {...DUOTONE} d="M4 7h16v3H4z" />
      <rect {...STROKE} x="4" y="6" width="16" height="3" rx="1" />
      <rect {...STROKE} x="4" y="11" width="16" height="3" rx="1" />
      <rect {...STROKE} x="4" y="16" width="16" height="3" rx="1" />
    </Svg>
  );
}

/* ============================================================
 * Somatic exercises (5)
 * ============================================================ */

/** Body / Physio-sigh — 2 short up arrows + 1 long down */
export function PhysioSighIcon({ size }) {
  return (
    <Svg size={size}>
      {/* up arrows */}
      <path {...STROKE} d="M6 11V6m-1.5 1.5L6 6l1.5 1.5" />
      <path {...STROKE} d="M11 11V6m-1.5 1.5L11 6l1.5 1.5" />
      {/* center pause */}
      <path {...DUOTONE} d="M6 13h7v2H6z" />
      {/* long down arrow */}
      <path {...STROKE} d="M18 6v12m1.5-1.5L18 18l-1.5-1.5" />
    </Svg>
  );
}

/** Body / Butterfly-hug — butterfly with one duotone wing */
export function ButterflyHugIcon({ size }) {
  return (
    <Svg size={size}>
      {/* left wing - duotone (the "held" wing) */}
      <path
        {...DUOTONE}
        d="M11 12c-2-3-4-4-6-4-1.5 0-2 1-2 2 0 3 2 6 4 6 1.5 0 3-1 4-4z"
      />
      <path
        {...STROKE}
        d="M11 12c-2-3-4-4-6-4-1.5 0-2 1-2 2 0 3 2 6 4 6 1.5 0 3-1 4-4z"
      />
      {/* right wing */}
      <path
        {...STROKE}
        d="M13 12c2-3 4-4 6-4 1.5 0 2 1 2 2 0 3-2 6-4 6-1.5 0-3-1-4-4z"
      />
      {/* body */}
      <path {...STROKE} d="M12 7v10" />
      {/* antennae */}
      <path {...STROKE} d="M12 7c-1-1.5-2-2-2.5-2" />
      <path {...STROKE} d="M12 7c1-1.5 2-2 2.5-2" />
    </Svg>
  );
}

/** Body / Cold-anchor — water droplet with snowflake spark */
export function ColdAnchorIcon({ size }) {
  return (
    <Svg size={size}>
      <path {...DUOTONE} d="M12 4c-3 4-5 7-5 10a5 5 0 0 0 10 0c0-3-2-6-5-10z" />
      <path
        {...STROKE}
        d="M12 4c-3 4-5 7-5 10a5 5 0 0 0 10 0c0-3-2-6-5-10z"
      />
      {/* spark/sparkle inside */}
      <path {...STROKE} d="M12 11v4" opacity="0.7" />
      <path {...STROKE} d="M10 13h4" opacity="0.7" />
    </Svg>
  );
}

/** Body / Vagal-humming — sound waves from O */
export function VagalHummingIcon({ size }) {
  return (
    <Svg size={size}>
      <circle {...DUOTONE} cx="9" cy="12" r="3" />
      <circle {...STROKE} cx="9" cy="12" r="3" />
      <path {...STROKE} d="M14 9.5a4 4 0 0 1 0 5" opacity="0.7" />
      <path {...STROKE} d="M17 7a8 8 0 0 1 0 10" opacity="0.4" />
    </Svg>
  );
}

/** Body / Body-scan — body with multiple scan dots */
export function BodyScanIcon({ size }) {
  return (
    <Svg size={size}>
      <path
        {...DUOTONE}
        d="M9 8h6l-1 12h-4z"
      />
      <circle {...STROKE} cx="12" cy="5" r="2" />
      <path {...STROKE} d="M9 8h6l-1 12h-4z" />
      {/* scan dots */}
      <circle cx="12" cy="9.5" r="0.7" fill="currentColor" />
      <circle cx="12" cy="11.5" r="0.7" fill="currentColor" />
      <circle cx="12" cy="13.5" r="0.7" fill="currentColor" />
      <circle cx="12" cy="15.5" r="0.7" fill="currentColor" />
      <circle cx="12" cy="17.5" r="0.7" fill="currentColor" />
    </Svg>
  );
}

/* ============================================================
 * Utility / Toolbar icons
 * ============================================================ */

/** Mind / Settings — gear */
export function SettingsIcon({ size }) {
  return (
    <Svg size={size}>
      <circle {...DUOTONE} cx="12" cy="12" r="3.5" />
      <circle {...STROKE} cx="12" cy="12" r="3.5" />
      <path
        {...STROKE}
        d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M5.6 18.4l1.7-1.7M16.7 7.3l1.7-1.7"
      />
    </Svg>
  );
}

/** Mind / Search — magnifying glass */
export function SearchIcon({ size }) {
  return (
    <Svg size={size}>
      <circle {...DUOTONE} cx="11" cy="11" r="6" />
      <circle {...STROKE} cx="11" cy="11" r="6" />
      <path {...STROKE} d="M16 16l4 4" />
    </Svg>
  );
}

/** Mind / Trash — bin (preserves existing semantics) */
export function TrashIcon({ size }) {
  return (
    <Svg size={size}>
      <path {...DUOTONE} d="M6 7l1 13h10l1-13H6z" />
      <path {...STROKE} d="M3 7h18" />
      <path {...STROKE} d="M6 7l1 13h10l1-13" />
      <path {...STROKE} d="M9 7V4h6v3" />
      <path {...STROKE} d="M10 11v6" />
      <path {...STROKE} d="M14 11v6" />
    </Svg>
  );
}

/** Mind / Filter — three lines (preserves existing semantics) */
export function FilterIcon({ size }) {
  return (
    <Svg size={size}>
      <path {...STROKE} d="M4 7h16" />
      <path {...STROKE} d="M7 12h10" />
      <path {...STROKE} d="M10 17h4" />
    </Svg>
  );
}

/** Mind / Import — plus in circle */
export function ImportIcon({ size }) {
  return (
    <Svg size={size}>
      <circle {...DUOTONE} cx="12" cy="12" r="9" />
      <circle {...STROKE} cx="12" cy="12" r="9" />
      <path {...STROKE} d="M12 8v8" />
      <path {...STROKE} d="M8 12h8" />
    </Svg>
  );
}

/** Reflect / Therapy-prep — paper with arrow entering */
export function TherapyPrepIcon({ size }) {
  return (
    <Svg size={size}>
      <path {...DUOTONE} d="M8 4h10v16H8z" />
      <path {...STROKE} d="M8 4h10v16H8z" />
      <path {...STROKE} d="M11 9h4" />
      <path {...STROKE} d="M11 12h4" />
      <path {...STROKE} d="M11 15h2" />
      {/* arrow entering */}
      <path {...STROKE} d="M3 12h5" />
      <path {...STROKE} d="M6 9l-3 3 3 3" />
    </Svg>
  );
}

/** Reflect / Therapy-debrief — paper with checkmark */
export function TherapyDebriefIcon({ size }) {
  return (
    <Svg size={size}>
      <path {...DUOTONE} d="M5 4h14v16H5z" />
      <path {...STROKE} d="M5 4h14v16H5z" />
      <path {...STROKE} d="M8 9h8" />
      <path {...STROKE} d="M8 12h8" />
      {/* checkmark */}
      <path {...STROKE} d="M9 16l2 2 4-4" />
    </Svg>
  );
}

/* ============================================================
 * Legacy aliases for backwards compatibility.
 * Old screens may still import ToolboxIcon — map to ProfileIcon.
 * ============================================================ */

export const ToolboxIcon = ProfileIcon;

/* Phase 9 (mode identification) reuses the canonical Modes icon. */
export const Phase9ModeIcon = ModesIcon;

/* Therapy icons in Repository should reuse the canonical TherapyIcon for visual coherence. */
export const TherapySessionIcon = TherapyIcon;
