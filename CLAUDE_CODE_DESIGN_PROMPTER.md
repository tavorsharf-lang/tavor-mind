# Tough Moment — Design System Operating Manual

**For**: Claude Code working on `tavor-mind` (the real codebase)
**Purpose**: Persistent rules for any future design or UI work. Re-read at the top of every design-touching session. If you're about to add a class, write inline styles, or invent a token — read the relevant section first.

---

## 0 · Hard rules (non-negotiable)

1. **Never invent design tokens.** No new colors, spacings, radii, shadows, or font sizes without explicit user approval. If you think one is missing, **stop and ask**.
2. **Never duplicate existing system primitives.** Before writing a new card / button / chip / modal / header / icon-tile rule, search `ds3.css` for an existing canonical or alias. If one exists, use it. If you genuinely need a variant, add it as a modifier on the canonical (`.thing--variant` or `.thing.is-x`), not as a parallel class.
3. **Aliases stay.** All the legacy → canonical alias selector lists in `ds3.css` (`.hub-card` → `.ds3-list-card`, `.tool-header` → `.ds3-header`, etc.) ship and stay. Don't "clean them up" without explicit instruction.
4. **No inline styles for things the system covers.** If a spacing / typography / color exists as a utility class, use the class. Inline `style={{...}}` is reserved for true one-offs (e.g. dynamic transforms, computed positions).
5. **RTL-safe always.** New CSS uses `margin-block`/`padding-inline` semantics, or direction-agnostic `gap`. Never `margin-left` / `padding-right`. The app is `<html dir="rtl">` globally.
6. **Heebo only**, weights 400/500/600/700/800. Don't introduce other font families without approval.
7. **`prefers-reduced-motion: reduce`** must disable any animation you add. Wrap new `@keyframes` usage in a guard.
8. **iOS Safari ≥ 15** is the floor. Test `mix-blend-mode`, `mask`, `backdrop-filter` accordingly. Always ship `-webkit-` prefixes for mask.

---

## 1 · Design system summary

### 1.1 Palette (Apple Health Vivid)

These are the **only** colors. Use semantic vars, not hex.

| Token | Hex | Use |
|---|---|---|
| `--canvas` | `#F2F2F7` | App background |
| `--surface` | `#FFFFFF` | Card / panel background |
| `--surface-alt` | `#F9F9FB` | Inset / secondary surface |
| `--ink` | `#0E0D0C` | Primary text |
| `--ink-soft` | `#1C1B19` | Strong secondary text |
| `--ink-muted` | `#6B6258` | Tertiary text, captions |
| `--line-soft` | `rgba(60,60,67,0.10)` | Hairline borders |
| `--line` | `rgba(60,60,67,0.20)` | Stronger borders |
| `--terra` | `#FF6A4F` | **Brand primary** (commit, hero, selected) |
| `--terra-soft` | `#FFD6C7` | Brand fill (selected bg, ambient) |
| `--lichen` | `#0A84FF` | Calm / active (focus rings, links) |
| `--lichen-soft` | `#D9E8FA` | Calm fill |
| `--lichen-deep` | `#0066D6` | Calm hover/pressed |
| `--clay` | `#FF8A2A` (+soft) | Warmth |
| `--heart` | `#FF3B30` | Crisis / danger |
| `--green` | `#34A86A` | Body / success |
| `--teal` | `#1FB6A6` | Mind / cognition |
| `--indigo` | `#5E5CE6` | Reflect / history |
| `--purple` | `#AF52DE` | Self / identity |
| `--orange` | `#FF8A2A` | (= clay) |
| `--yellow` | `#FFB938` | Reserved |
| `--pink` | `#FF6B9C` | Accent only (chromatic / holographic) |

### 1.2 Icon tone semantics (canonical: `icon-tone-*`)

Match the tone to the screen's psychological function, not to "looks nice."

| Tone | Palette | Use |
|---|---|---|
| `icon-tone-brand` | terra | Home hero, Phase 1 activation, primary CTAs |
| `icon-tone-crisis` | heart | Trigger detection, distortions, danger |
| `icon-tone-calm` | lichen | Reality check, breathing, grounding |
| `icon-tone-body` | green | Somatic regulation, vagal, butterfly |
| `icon-tone-self` | purple | Schemas, attachment, modes, identity |
| `icon-tone-warmth` | orange | Mood check-in, self-letter, supportive |
| `icon-tone-reflect` | indigo | Mirror (review), history, analysis |
| `icon-tone-mind` | teal | Mindfulness, cognition, awareness |

Palette aliases (`.ds3-icon-tile-{coral|blue|...}`) still ship. Prefer the semantic name in new code.

### 1.3 Radii

| Token | Px | Use |
|---|---|---|
| `--radius-sm` | 12 | Back buttons, small chips |
| `--radius-md` | 16 | Small inputs |
| `--card-radius` | **18** | **All cards** (list-card, mode-card, structure-card) |
| `--radius-lg` | 22 | Review cards, open-question |
| `--radius-xl` | 28 | Sheets, modal-card, bottom-sheet, btn |
| `--radius-pill` | 999 | Pills, chips |

### 1.4 Shadows

| Token | Use |
|---|---|
| `--shadow-soft` | Default card elevation (use this 95% of the time) |
| `--shadow-medium` | Hover, slight lift |
| `--shadow-elevated` | Modal / sheet / floating |

### 1.5 Spacing

`--space-1` through `--space-6` = 4/8/12/16/20/24. Use the utilities (`.ds3-mt-N` / `.ds3-mb-N` / `.ds3-row` / `.ds3-row-between`) instead of inline margins.

### 1.6 Typography scale

- `.ds3-h1` 28/700, `.ds3-h2` 22/700, `.ds3-h3` 19/600
- `.ds3-body` 17/400 (auto `text-wrap: pretty`)
- `.ds3-caption` 14/500
- `.ds3-micro` 13/500
- Utilities: `.ds3-text-eyebrow` / `-meta` / `-label` / `-label-lg` / `-large` / `-balance` / `-pretty` / `-center` / `.ds3-leading-{tight|normal|relaxed}`
- All `h1/h2/h3` get auto `text-wrap: balance`.

### 1.7 State taxonomy (memorize)

```
is-selected  → terra-soft + 1.5px terra border  (commit / multi-select)
is-active    → ink bg + white text               (filter / tab active)
is-active    → lichen bg + white text            (live sequence step)
is-disabled  → opacity 0.5 + cursor not-allowed + pointer-events none
is-loading   → spinner via ::after + transform suppressed
is-error     → heart border + heart halo on focus
is-on / is-off → switch states (terra fill / line-soft fill)
```

Always use these — never invent `selected` / `picked` / `chosen` / `current` etc. The taxonomy is documented at the top of `ds3.css`.

---

## 2 · Canonical components

When asked to build UI, **start by checking if a canonical fits**. Composition is preferred over new rules.

### Cards
**Canonical**: `.ds3-list-card` + `__icon` / `__text` / `__title` / `__sub`
- Modifier: `.ds3-activation-card` for Phase 1 (taller, bigger type)
- Modifier: `.ds3-mode-card` for Phase 9 multi-select
- Aliases: `.hub-card`, `.tools-card`, `.ck-card`, `.ds3-card-button` — keep using existing markup; **don't blanket-rename** without instruction.

### Headers
**Canonical**: `.ds3-header` + `__row` (back+title) / `__subtitle` / `__title` / `__back`
- For ck-hub: **row layout** (back beside title-block), padding `16 20 16`. Don't switch to column.

### Buttons
**Canonical**: `.ds3-btn`
- Variants: `.ds3-btn-primary` (terra), `.ds3-btn-blue` (lichen), `.ds3-btn-cream` (surface), `.ds3-btn-outline-terra`
- Sizes: `.ds3-btn-sm` (36h), `.ds3-btn-md` (48h), default (56h)
- Link buttons: `.ds3-btn-link` (+ `-danger` / `-success` / `-muted`). Aliases: `.link-btn`, `.ds3-topbar-skip`.
- States: `.is-disabled`, `.is-loading`. Always with `:focus-visible` ring (lichen 2px offset 3).
- The Phase 8 `.p8-safety-btn` family is non-canonical compact — leave it as-is.

### Pills (segmented controls)
- `.ds3-pill` — primary selection (terra active, 40h, flex-fill)
- `.scope-pill` — filter (ink active, 36h, auto-width)
- **Keep these separate.** Don't merge.

### Chips
- `.ds3-chip` (md, tappable, `is-selected` terra) — alias: `.emotion-chip`
- `.ds3-chip-sm` (readonly stats, `is-strong` terra-soft) — alias: `.review-chip`
- `.ds3-chip-xs` (dense inline)
- Tone modifiers: `.ds3-chip-warm` / `-cool` / `-dashed`
- Padding: 10×16 (not 8×14).

### Forms
- `.ds3-input`, `.ds3-textarea`, `.ds3-textarea-mono`
- Focus state: lichen border + 3px halo (`rgba(10,132,255,0.15)`). Already global.
- Error: `.is-error` (heart border + heart halo on focus)
- Wrapper: `.ds3-field` + `-label` / `-help` / `-error`

### Slider
- Color modifiers: `.ds3-slider-fill-{green|orange|heart|indigo}` + matching handle/value modifiers
- Focus-visible on handle (lichen)

### Switch
- **Generic**: `.ds3-switch` + `-label` / `-pill` + `.is-on` (terra) / `.is-off`
- **Specific**: `.ds3-watch-toggle` — kept independent (lichen, device-presence indicator). **Do not rename to ds3-switch.**

### Modals
**Composition** (always use this shape):
```
.modal-overlay [.modal-overlay-soft | -strong]
  .modal-card [.modal-card-center] role="dialog" aria-modal="true" aria-labelledby
    .modal-icon .modal-icon-{terra|lichen|green|indigo|heart}   ← only when ceremonial
    .modal-accent .modal-accent-{terra|lichen|green|indigo}    ← eyebrow caption
    h3.modal-title (with id)
    p.modal-body
    .modal-actions [.modal-actions-row]
      .ds3-btn ...
```
- **Icon is for ceremonial announces only** (Containment, hypo onboard). List/form modals (Stuck, Export, Call, Letter) shouldn't have one.
- Phase 2 onboarding modal lives inside `.ds3-screen` and uses `position: absolute` — single allowed deviation.
- `Modal.jsx` base component handles focus-trap / Escape / body-scroll lock / aria. Don't reimplement.

### Bottom-sheet
- `.modal-sheet` with `@keyframes ds3SheetIn` (240ms cubic-bezier). Use for non-blocking secondary actions.

---

## 3 · Holographic accents (use sparingly)

Three sites only:
1. **Home hero core** — radial-gradient 3D + conic halo + scanlines
2. **Open Question card** (`.open-question-text`) — conic mask border, 12s spin
3. **`.is-selected` cards** — linear-gradient shimmer sweep, 3.6s

**Don't** add holographic treatment elsewhere without explicit approval. Three sites = signature moments. More = visual noise.

`@keyframes`: `ds3HoloSpin` (8s linear), `ds3HoloShimmer` (3.6s ease), `ds3HeartBeat` + `ds3HeartBeatPulse`. All wrapped in reduced-motion guards.

---

## 4 · A11y standards

1. **Every interactive element gets `:focus-visible`** with lichen outline 2px offset 3. Already on buttons / cards / pills / chips / inputs / slider handles / switches / structure-cards / dialog cards.
2. **Modals**: `role="dialog"` + `aria-modal="true"` + `aria-labelledby={titleId}` + focus-trap + Escape + body-scroll lock. `Modal.jsx` handles this.
3. **Heading hierarchy**: `h1` per screen (header title), `h2` for sections, `h3` for cards/modals. Never skip.
4. **Color is never the only signal.** Selected = terra **+ border** (not bg-only). Error = heart **+ icon/text** (not bg-only).
5. **Hebrew RTL**: don't reverse content order in JSX to "fix" RTL — let CSS handle it. Use `gap`, `margin-block`, logical properties.

---

## 5 · Hebrew / RTL specifics

- Sentence-case for buttons and headers (e.g., "להוסיף עוגן", not "להוסיף עוגן.").
- Numbers in dates and stats: Hebrew default (no special wrapping).
- Punctuation: `׳`/`״` are correct Hebrew, not ASCII `'`/`"`. **But** in JSX strings, ASCII is fine because the app renders fine — don't go back and "fix" working strings.
- Idiomatic Hebrew over literal English translation. "עכשיו קשה לי" not "אני זקוק לעזרה כעת."
- Avoid heavy clinical jargon in user-facing copy. Tools are named in everyday Hebrew (מאתר טריגרים, מצב סכמה, בדיקת מציאות).

---

## 6 · Anti-patterns (never do these)

- ❌ New radial/conic/linear-gradient on a card "to add interest"
- ❌ New rounded-corner left-border accent color (AI-slop pattern)
- ❌ Emoji as UI affordance (we use inline SVG)
- ❌ Generic system fonts (Inter, Roboto, SF Pro) — Heebo only
- ❌ `font-size: 12px` or smaller for user-facing text (a11y floor)
- ❌ Tap targets under 44×44
- ❌ Adding "informational" filler sections / copy / icons just to fill space — every element earns its place
- ❌ `box-shadow: 0 4px 20px rgba(black, 0.1)` ad-hoc — use `var(--shadow-*)`
- ❌ Naming a new state `selected2` / `selected-strong` / `picked` — extend `.is-selected` with a modifier
- ❌ Building a new Phase modal from scratch — extend `Modal.jsx` or compose from the canonical pieces

---

## 7 · Workflow with the user

1. **User attaches a `design-snapshot.html`**: that's the source of truth for this iteration. Treat it as a spec. Don't compare against your memory — read it.
2. **User pastes a Change Report from the Design Sandbox**: work top-to-bottom, mark each item, **reply with a completion report listing per-section: ✅ done / ⚠️ partial / ❌ skipped (with reason)**. Don't combine items; don't reorder.
3. **Spec mismatches against production source are common.** When you find one (class with different name in production, file under different path, behavior that doesn't match the spec):
   - Apply the spec's *intent* to the actual production code
   - Flag the mismatch in your report
   - **Never silently retitle items, invent files, or skip without reporting**
4. **Aliases > renames.** If a Change Report says "rename X to Y", default to **aliasing**: add Y as canonical, map X → Y via selector list, leave JSX as-is. Only do a full JSX rename if explicitly asked.
5. **Build green at each commit.** `npm run build` should pass. CSS changes can break Tailwind purge if you reference undefined vars — verify.
6. **Visual smoke test is the user's job.** You can't run a browser. After build-green, hand off and say "awaiting your smoke test."

---

## 8 · Recurring red flags to watch for

- A new file appearing in `src/styles/` that's not `tokens.css` / `ds3.css` / `styles.css` — probably wrong, ask
- A `.module.css` file — we don't use CSS modules, ask
- A `styled-components` / `emotion` import — we don't use CSS-in-JS, ask
- A new color hex literal anywhere in JSX (not via var) — wrong, use token
- Tailwind utility classes (`p-4`, `text-lg`, etc.) — we don't use Tailwind in production, only in the design sandbox
- `useState` for selected card index with `selected` instead of `is-selected` class — minor, but the canonical state class is `is-selected`

---

## 9 · What's already in place (don't rebuild)

- ✅ State taxonomy comment block at top of `ds3.css` cards section
- ✅ All 6 waves of unification (Cards / Headers / States / Icons / Tones / Holographic / Buttons / Pills / Chips / Typography / Rhythm / Forms / Modals)
- ✅ Focus-trap in `Modal.jsx`
- ✅ 8 modals refactored to canonical composition
- ✅ Tone audit applied (6 fixes in Home / Check-in / Tools / Phase 6)
- ✅ Holographic on 3 signature sites
- ✅ `prefers-reduced-motion` guards on all custom keyframes

If you find one of these "missing", you're probably reading the wrong file — verify against `ds3.css` at HEAD.

---

## 10 · When in doubt

Stop and ask the user. Conservative > clever. The user manages a Design Sandbox where iteration happens; this codebase receives the result. Your job is fidelity to the system, not improvisation on top of it.
