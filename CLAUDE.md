# tavor-mind — מדריך פרויקט

> **לעבודת עיצוב/UI**: קרא קודם את [CLAUDE_CODE_DESIGN_PROMPTER.md](CLAUDE_CODE_DESIGN_PROMPTER.md)
> (Operating Manual של ה-Design System — טוקנים, canonicals, state taxonomy, anti-patterns).

## 1. מטרת הפרויקט

`tavor-mind` הוא מרחב ויסות רגשי ותמיכה פסיכולוגית עצמית בעברית RTL — אפליקציית web אישית למשתמש יחיד (תבור), שמיועדת לתת מקלט ברגעים קשים, לתמוך בעבודה פנימית, ולשמש ארגז כלים רגשי. התכנון הוא **crisis-first**: כפתור "עכשיו קשה לי" הוא הפעולה הראשית והנגישה ביותר. כל שאר הפיצ'רים (צ'ק-אין יומי, ארגז כלים, כלי AI) נכנסים בשלבים הבאים.

## 2. Tech stack

- Vite 5 + React 18 (אין TypeScript, אין Next.js)
- Firebase Realtime Database — modular SDK (`firebase` v10)
- Firebase Anonymous Auth (uid נשמר ב-`localStorage['tavor_mind_auth_uid']`)
- React Router v6
- Plain CSS עם CSS variables (אין Tailwind, אין styled-components)
- פונט: Heebo (Google Fonts) → Assistant → system-ui
- Build target: GitHub Pages, base path `/tavor-mind/`

## 3. Firebase

- אותו פרויקט Firebase של `tavors-tasks` (`yaniv-game-aeb26`)
- **שם החדר/path: `tavormind`** (לא `tavoros` — להפריד לחלוטין מ-tavors-tasks)
- Anonymous Auth בלבד
- helper: `ensureAuth()` ב-[src/firebase.js](src/firebase.js) — חותם anonymously, שומר uid ב-localStorage, מחזיר Promise. `App.jsx` ממתין לו לפני render של ילדים.

## 4. GitHub Pages

- Repo: `tavorsharf-lang/tavor-mind`
- URL: https://tavorsharf-lang.github.io/tavor-mind/
- Base path ב-Vite: `/tavor-mind/`
- Deploy: אוטומטי ב-GitHub Actions בכל push ל-`main` (workflow ב-`.github/workflows/`). אין יותר `npm run deploy` — ה-package `gh-pages` הוסר.

### Live HR (Apple Watch) — Firebase rules

נתיב נפרד `tavormindLiveHr/{uid}/{sessionId}` עבור דגימות דופק שנכתבות מ-iOS Shortcut (REST API ללא auth). ה-uid הוא מזהה Firebase האנונימי של המשתמש (28 תווים אקראיים) ומשמש כסוד הנתיב. דרושה תוספת לכללי RTDB:

```json
"tavormindLiveHr": {
  "$uid": {
    ".read": true,
    ".write": true
  }
}
```

הגדרת ה-Shortcut נעשית פעם אחת דרך מסך [/emergency/hr-setup](src/screens/emergency/HrSetup.jsx). לאחר ההגדרה, Phase 2 (נשימה) מציג פאנל דופק חי עם sparkline + delta מההתחלה. סיכום HR (start/end/min/max/avg/delta) נשמר ב-`emergency_sessions/{ts}/hrTrack` בסוף הסשן דרך [src/utils/liveHr.js](src/utils/liveHr.js).

## 5. Color palette — DS3 "Apple Health Vivid" (CSS tokens ב-[src/styles/tokens.css](src/styles/tokens.css))

נבחר 2026-05-09 כתחליף ל-DS2 "Architect's Workbench" (אזוב/טרקוטה ארצית). העיצוב הזה מקורו ב-Claude Design "Tough Moment Flow" handoff ושאוב מ-Apple Health "State of Mind".

```css
/* Surfaces */
--canvas: #F2F2F7;          /* iOS secondary system grouped bg — cool light gray */
--surface: #FFFFFF;          /* white cards */
--surface-alt: #F9F9FB;
--elevated: #FFFFFF;

/* Text */
--ink: #0E0D0C;              /* primary — near-black, vivid contrast */
--ink-soft: #1C1B19;         /* secondary heading */
--ink-muted: #6B6258;        /* tertiary muted */

/* Borders — iOS hairlines */
--line-soft: rgba(60, 60, 67, 0.10);
--line: rgba(60, 60, 67, 0.20);

/* Primary (BLUE — body, calm, navigation) */
--lichen: #0A84FF;            /* Apple blue — primary accent (was green in DS2) */
--lichen-deep: #0066D6;
--lichen-soft: #D9E8FA;

/* Terracotta (CORAL — emotional content, primary CTA) */
--terra: #FF6A4F;             /* bright coral */
--terra-soft: #FFD6C7;

/* Warning/attention */
--clay: #FF8A2A;              /* orange */
--clay-soft: #FFE4C7;

/* Apple Health category accents (used per phase) */
--heart: #FF3B30;  --orange: #FF8A2A;  --yellow: #FFB938;
--green: #34A86A;  --teal:   #1FB6A6;  --indigo: #5E5CE6;
--purple: #AF52DE; --pink:   #FF6B9C;

/* Radii (vivid system uses large pills) */
--radius-sm: 12px;  --radius-md: 16px;  --radius-lg: 22px;  --radius-xl: 28px;
--radius-pill: 999px;

/* Shadows — soft, iOS-style with hairline ring */
--shadow-soft: 0 1px 2px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(60,60,67,0.10);
--shadow-medium: 0 2px 8px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(60,60,67,0.08);
--shadow-elevated: 0 14px 40px rgba(0,0,0,0.18);
```

טוקני שמות (lichen / terra / clay / canvas / ink) נשמרו מ-DS2 כדי שכל ה-CSS הקיים ימשיך להידור — רק הערכים הוחלפו. אין יותר גריין ברקע (היה ב-DS2). אין יותר adaptation ל-time-of-day.

## 6. Design philosophy

- **crisis-first** — הפעולה החשובה ביותר היא תמיד הכי בולטת ונגישה.
- **vivid yet calm** — צבעי קטגוריה עזים בנפרד, אבל הקומפוזיציה כולה לבנה ושקטה. כפתורי CTA טרקוטה מלאים = "זה מה שחשוב". כחול = body work, calm.
- **bold typography** — H1 בכובד 700, display 800. בלי hairline weights. מאזן את הצבעוניות — ה"שקט" מגיע מהווייטספייס, לא ממשקל הטקסט.
- **rounded pills** — הכל ברדיוסים של 16-28px, כפתורי CTA ב-`--radius-xl` (28px = פיל מלא). זה ה-vibe של Apple Health.
- **RTL Hebrew** — כל ה-UI בעברית, dir="rtl" ב-`<html>`.
- **breathing layout** — מרווחים נדיבים, line-height גבוה (1.55-1.65), הרבה whitespace.

## 7. מבנה התיקיות

```
src/
├── main.jsx                       # entry
├── App.jsx                        # router + auth bootstrap
├── styles.css                     # global styles + CSS variables + RTL
├── firebase.js                    # Firebase init + ensureAuth()
├── screens/
│   ├── HomeScreen.jsx             # crisis btn → /emergency, toolbox → /toolbox
│   ├── emergency/                 # Step 2: 6-phase crisis flow (זיהוי, נשימה, גראונדינג, אנקרים, מודים, סיום)
│   │   ├── EmergencyFlow.jsx
│   │   ├── Phase1_Activation.jsx … Phase6_Closing.jsx
│   │   ├── EmergencyHistory.jsx, EmergencySessionDetail.jsx
│   │   └── components/ (PhaseHeader, SoftButton, BreathingExercise)
│   ├── toolbox/                   # Step 3: read-only personal tools
│   │   ├── ToolboxHub.jsx, SchemaProfile.jsx, AttachmentProfile.jsx
│   │   ├── ModesMap.jsx, SelfLetter.jsx
│   │   └── components/ToolHeader.jsx
│   ├── checkin/                   # Step 4: morning + evening + history
│   │   ├── CheckinHub.jsx, MorningCheckin.jsx, EveningCheckin.jsx, CheckinHistory.jsx
│   │   └── components/ (CheckinHeader, EnergySlider, EmotionPicker, DayCard)
│   ├── tools/                     # Step 5: in-the-moment regulation tools (no persistence)
│   │   ├── ToolsHub.jsx, TriggerTracker.jsx (5 steps), ModeCheck.jsx
│   │   ├── CatastropheCheck.jsx (5 steps), SomaticHub.jsx, SomaticExercise.jsx
│   ├── admin/
│   │   └── FactoryReset.jsx        # /admin/reset — wipes user data, keeps analyses
│   ├── repository/                # Step 6: analysis repository (JSON import)
│   │   ├── RepositoryHub.jsx       # list + filters + import button
│   │   ├── ImportScreen.jsx        # paste JSON, validate, save (debounced)
│   │   ├── AnalysisDetail.jsx      # router by type with delete + generic fallback
│   │   ├── components/ (EnvelopeHeader, PatternsPills, SchemasPills, AnalysisListItem)
│   │   └── details/ (EmotionRecognition, Gratitude, ILanguage, TherapySession, MetaAnalysis)
│   └── review/                    # Step 7: weekly/monthly/90d review (the mirror)
│       ├── ReviewScreen.jsx        # parent: scope tabs + section orchestration
│       └── components/ (ScopeSelector, EmptyState, CheckinRhythm, EmotionalLandscape,
│                        TriggersList, PatternsPresence, ModesActive, SchemasActivated,
│                        CoreChildSection, OpenQuestion)
├── data/
│   ├── anchors.js, schemaModes.js, grounding.js     # used by emergency
│   ├── schemas.js, attachment.js, modes.js, selfLetter.js  # used by toolbox
│   ├── emotions.js, checkinPrompts.js               # used by checkin
│   ├── distortions.js                               # used by tools
│   └── analysisSchemas.js                           # used by repository — types, required fields, labels
└── utils/
    ├── emergencyLog.js            # Firebase write w/ offline queue (emergency)
    ├── checkinStorage.js          # Firebase R/W w/ offline queue (checkin)
    ├── analysisValidation.js      # validateAnalysis + applyDateOverride
    ├── analysisStorage.js         # Firebase R/W w/ offline queue (analyses) + filters
    ├── reviewAggregator.js        # aggregateReview(scope) — reads all sources, returns one object
    ├── reviewQuestions.js         # selectQuestion(aggregate) — deterministic per scope+week
    ├── claudeHandoff.js           # buildEmergencyPrompt(session) — copies session prompt + opens Claude
    └── dateHelpers.js             # Israel TZ, Hebrew dates, formatRemaining, getNext8amIsraelMs
```

## 8. סטטוס

- **Step 1 (תשתית): הושלם.**
- **Step 2 (מסך עכשיו קשה לי): הושלם.** 6 שלבים: זיהוי הפעלה (Phase1) → נשימה (Phase2) → גראונדינג (Phase3, 5-4-3-2-1 או סריקת צבעים, נבחר אוטומטית לפי activation: hyper→colors, hypo/mid→senses; ניתן להחליף; לא נשמר בסשן) → אנקרים (Phase4) → מודים (Phase5) → סיום (Phase6). Phase 5 = multi-select של 5 מודים מ-`data/modes.js`/`MODES` (4 protectors + exile בתחתית). Phase 6 כולל בלוק הפניה אופציונלי לכלי מתאים (mapping ב-`data/emergencyToolMap.js` לפי בחירת activation בשלב 1), בלוק מדיטציה אופציונלי (mapping ב-`data/emergencyMeditationMap.js` לפי activation, MP3 מ-`public/audio/meditation-{hyper|hypo|mid}.mp3`), ובלוק מכתב אופציונלי (mapping ב-`data/emergencyLetterMap.js` — מציג רק ב-hypo/mid את `letterDefault` מ-`data/selfLetter.js` במודאל גלילה. סגירה חוזרת ל-Phase 6, לא מסיימת את הסשן) — שלושתם מוצגים מעל "סיימתי". המדיטציה נפתחת ב-Modal עם נגן HTML5 (Play/Pause + פס פרוגרס + זמן), `onEnded` קורא ל-handleFinish (שומר סשן + ניווט הביתה), סגירה ידנית מחזירה ל-Phase6. תרגיל הנשימה (BreathingExercise) מורחב: countdown של השלב הנוכחי בלב המעגל, זמן כולל שעבר מעל, אייקון כיוון (↑/■/↓) ליד label, תת-הוראה לכל שלב, חיזוק לכל מחזור, ושדה `breathingNote` אופציונלי במסך post-completion שנשמר ב-session payload. התבנית נבחרת אוטומטית לפי activation (hyper→`478`, hypo→`coherent`, mid→`box`) וניתנת לשינוי מתוך ה-pattern picker (3 אפשרויות: 4-7-8 / קופסה 4×4 / 5-5). cycles נקבע אוטומטית לפי התבנית (478→4, box/coherent→6) ומוצג בכפתור "עוד X נשימות".
- **Step 3 (ארגז כלים): הושלם + עודכן מטא-ניתוח.** SchemaProfile מציג גם סכמה לבחינה (מחסור רגשי, השערה במסגרת מקווקוות). ModesMap בהיררכיה תלת-שכבתית: המבוגר הבריא (העֵד) למעלה, 4 מגנים באמצע, הילד שלא מספיק חשוב (הגרעין) למטה. SelfLetter פונה ישירות לילד הגלותי. `data/modes.js` מייצא `coreMode`, `protectorModes`, `healthyAdult` + flat `modes` ל-backwards compat עם ModeCheck.
- **Step 4 (צ'ק-אין יומי): הושלם.**
- **Step 5 (כלים פנימיים): הושלם — ללא שמירה.** ToolsHub עם 3 כלים + תרגילי גוף: TriggerTracker (5 שלבים), ModeCheck (single-screen, עם pre-select אופציונלי מ-location.state.selectedModes), CatastropheCheck (5 שלבים), SomaticHub/SomaticExercise. **2026-05-16: שמירה והיסטוריה הוסרו לחלוטין** — הכלים פועלים כתהליך בזמן אמת בלבד, אין כתיבה ל-Firebase, אין מסך היסטוריה, אין כניסות ל-Review/Timeline. [src/utils/toolsStorage.js] נמחק. Timeline + reviewAggregator + timelineAggregator לא קוראים יותר מ-`triggers`/`mode_checks`/`catastrophe_checks`/`somatic_sessions`.
- **Step 6 (מאגר ניתוחים): הושלם.** מערכת ייבוא JSON — לא קוראת ל-Claude API מתוך האפליקציה. 5 סוגי ניתוחים: emotion_recognition, gratitude, i_language, therapy_session (3 ענפים: IFS / schema-focused / chair-dialogue), meta_analysis. ImportScreen עם validation דבאונסד וtצוגה מקדימה, RepositoryHub עם פילטרים (סוג / סכמות / דפוסים / חיפוש), AnalysisDetail עם רכיב מותאם לכל סוג + fallback גנרי. כתיבות ל-Firebase תחת `tavormind/{uid}/analyses/{_id}`, queue offline ב-`localStorage['tavor_mind_pending_analyses']`. Override תאריך לניתוחים ישנים (משנה רק occurredAt, createdAt תמיד now).
- **Step 7 (המראה — סקירת שבוע/חודש/90 יום): הושלם.** ReviewScreen עם 3 טאבים (שבוע=7 ימים, חודש=30, 90 יום) ו-8 סקציות בסדר: CheckinRhythm (ribbon של נקודות + sparkline אם ≥4 נקודות) → EmotionalLandscape (chips לפי תדירות + רשימת absent + thesis: "היעדר זה גם מידע") → TriggersList (top 5 + הדגשת חזרה) → PatternsPresence (4 דפוסים עם ratio + פירוש מותאם) → ModesActive (top 5 + פירוש למוד הדומיננטי) → SchemasActivated (כולל הערה מיוחדת ל-emotional_deprivation) → CoreChildSection (יורד אם אין נתונים — מציג "לא מספיק" appearances + needs_expressed) → OpenQuestion (קבוע פר scope+week דרך hash). reviewAggregator קורא 7 paths של Firebase במקביל, מסנן לפי טווח, וחושב את כל הסקציות בלקוח.
- **Step 8: ממתין.**
  - Step 8: TavorOS / Telegram integration.

### Design System v2 — "Architect's Workbench" (Iterations 1–3 of 4 הושלמו)

**Iteration 1 (HomeScreen):** tokens.css, grain.svg, components/icons/, class-ים `.ds2-*`. HomeScreen ב-`.ds2-page`.

**Iteration 2 (Emergency + Repository + Review):** `.ds2-themed` הוסף לשורש של EmergencyFlow, RepositoryHub, ImportScreen, AnalysisDetail, ReviewScreen.

**Iteration 3 (Toolbox + Tools + Checkin):** הושלם 2026-05-02. `.ds2-themed` הוסף לשורש של 13 מסכים נוספים:
- Toolbox: ToolboxHub, SchemaProfile, AttachmentProfile, ModesMap, SelfLetter
- Tools: ToolsHub, TriggerTracker, ModeCheck, CatastropheCheck
- Checkin: CheckinHub, MorningCheckin, EveningCheckin, CheckinHistory

**כעת כל המסכים באפליקציה ב-DS2** — אין יותר "iteration boundary jarring."

**Terra moments מאושרים** (תקפים לכל האפליקציה):
1. HomeScreen `עכשיו קשה לי` button
2. EmergencyFlow current-phase progress dot
3. EmergencyFlow Phase 6 closing button (`סיימתי`)
4. AnalysisDetail delete-confirm primary button (`כן, מחק`)
5. MetaAnalysisDetail `central_sentence` callout
6. MetaAnalysisDetail `open_question` callout
7. ReviewScreen `OpenQuestion` (bottom)
8. ReviewScreen `CoreChildSection`
9. **ModesMap core card** (terra-soft bg + 2px solid terra) — איטרציה 3

**Iteration 4 (פולישינג סופי): הושלם.** הוספות:
- `<Modal />` ראשוני ב-[src/components/ui/Modal.jsx](src/components/ui/Modal.jsx) — Esc + click-backdrop לסגירה, body-scroll lock, backdrop blur, slide-up במובייל וcenter בטאבלט.
  - מוחל על EmergencyFlow Phase 6 ("אנשים שיענו לך"). AnalysisDetail delete confirm נשאר inline (החלטה מודעת — destructive confirmations שקטים נעימים יותר).
- `<Loading />` ב-[src/components/ui/Loading.jsx](src/components/ui/Loading.jsx) עם נקודה דופקת ב-`--lichen` במקום `טוען…` שטוח. הוחלף ב-4 מקומות (RepositoryHub, AnalysisDetail, CheckinHistory, ReviewScreen).
- אנימציות: page fade-in (0.6→1, 250ms), bar-fill ב-Review (600ms), sparkline draw (800ms forward), modal rise (24px → 0). הכל מכבדים `prefers-reduced-motion`.
- A11y: `:focus-visible` rings ב-`--lichen` רק במקלדת, skip-nav link ראשון בתוך BrowserRouter (`#main-content`), דרישות ARIA הקיימות נבדקו.
- ניקוי קוד מורשת (Option B): ה-:root הישן ב-styles.css עכשיו aliases ל-DS2 tokens (`--accent → --lichen`, `--bg → --canvas`, `--text → --ink`, וכו'). שמירה על תאימות לאחור עבור inline-style references ב-JSX (ב-MessageHold, BreathingExercise, CheckinRhythm sparkline). שום ערך פלטה ישן לא נשאר בעיצוב.
- Touch-target audit: link-btn 44px, scope/pace/emotion pills 36px (segmented standard).
- Offline toast עברה ל-`--clay-soft` pill, מרכז במורד המסך, 3s fade-out auto, מכבדת reduced-motion.

**ניתוח קונטרסט WCAG (מאומת):**
- ink → canvas: 13.58:1 ✓ AA
- ink → surface: 14.53:1 ✓ AA
- ink-muted → surface: 5.03:1 ✓ AA
- ink-muted → canvas: 4.71:1 ✓ AA
- surface → lichen: 4.54:1 ✓ AA
- surface → terra: 4.46:1 (Large Text AA ב-3:1 — כפתורי 17px medium-weight עוברים)
- surface → clay: 4.51:1 ✓ AA
- ink-soft → canvas/surface: 2.4-2.5 (כשל מכוון — בשימוש רק לטקסט דקורטיבי לא-חיוני: app tag, watermark status, decorative dividers, footnotes)

**App מצב סופי:** כל 19 המסלולים עטופים ב-DS2. JS 649KB, CSS 116KB. אין יותר iteration boundaries.

## 8b. Factory Reset (/admin/reset)

מסך לא-מקושר [src/screens/admin/FactoryReset.jsx](src/screens/admin/FactoryReset.jsx) שמתנקש את כל נתוני המשתמש חוץ מהניתוחים. שני שלבים: confirm → "כן, מחק הכל" → לוג בזמן אמת → "חזור לבית". **מוחק** מ-Firebase: `checkins`, `emergency_sessions`, `trigger_analyses`, `triggers`, `mode_checks`, `catastrophe_checks`, `somatic_sessions`, `therapy_frames`, `something_waiting`, וכל `tavormindLiveHr/{uid}`. **מוחק** מ-localStorage: כל ה-`tavor_mind_pending_*`, דגלי onboarding (62, containment, seen_home), `hr_setup_done`, `wearing_watch`, `option_frequencies`. **שומר**: `tavormind/{uid}/analyses`, `tavor_mind_auth_uid`, `tavor_mind_therapy_dow`, `tavor_mind_last_therapist_export`. הגישה רק על-ידי הקלדת ה-URL ידנית.

## 9. כללי עבודה כלליים

- עברית RTL בכל מקום.
- אל תוסיף dependencies מבלי שהתבקשת.
- הפלטה היא DS3 "Apple Health Vivid" (סעיף 5). אל תשנה אותה ללא אישור מפורש מהמשתמש — זו זהות המוצר.
- אל תוסיף Tailwind / framework / TypeScript.
- אל תכפיל קוד מ-tavors-tasks — הפרויקטים שונים, גם אם stack דומה.
- כשמדווח על שינוי — דווח קצר, בעברית.

### Soft-delete pattern

כל מחיקה (analyses / checkins / tools / emergency sessions) מסומנת ב-`deletedAt: serverTimestamp()` במקום `remove()`. helpers ב-[src/utils/softDelete.js](src/utils/softDelete.js): `isSoftDeleted`, `isPurgeable`, `SOFT_DELETE_PURGE_DAYS=30`. כל read filter-im items עם `deletedAt`. lazy purge ב-list calls מוחק לצמיתות items שעברו 30 יום. כל storage חושף `restore*()` שמנקה `deletedAt`. UndoToast ב-[src/components/ui/UndoToast.jsx](src/components/ui/UndoToast.jsx) (6.5s, action button) מוצג אחרי מחיקה: ב-AnalysisDetail דרך `location.state.undo` ל-RepositoryHub; ב-Timeline (review) inline. Pending (offline-queued) items עדיין נמחקים hard — אין להם server presence לסמן ולכן undo לא חל.

**Recycle Bin:** [src/screens/repository/RecycleBin.jsx](src/screens/repository/RecycleBin.jsx) ב-`/repository/trash` — מציג ניתוחים + צ'ק-אינים שנמחקו, סורט לפי `deletedAt` desc. כל פריט מציג כמה ימים נשארו עד purge אוטומטי + כפתורי "שחזר" / "מחק לצמיתות" (purge מיידי). הגישה דרך כפתור "סל מחזור" ב-toolbar של RepositoryHub עם count badge. `listDeletedAnalyses` / `listDeletedMoodCheckins` ב-storage; `purgeAnalysis` / `purgeCheckinEntry` למחיקה לצמיתות. Tools ו-emergency sessions לא חשופים בסל הזה (גישה נשלטת מ-Timeline, scope של הניתוחים מתחזק את ההפרדה).

## 10. כלל קריטי ל-DOCX RTL (לשימוש עתידי)

אם יום אחד הפרויקט יצטרך לייצר קבצי Word (למשל ייצוא יומן), חובה:
- כל `w:pPr` חייב לכלול `<w:bidi w:val="1"/>`
- כל `w:rPr` חייב לכלול `<w:rtl w:val="1"/>`

חוסר באחד מהם = טקסט ייראה הפוך / שבור ב-Word על Windows.

## Auto-deploy workflow

This project deploys to GitHub Pages from the `main` branch via GitHub Actions.
Local-only changes are invisible to the user, who tests on
`https://tavorsharf-lang.github.io/tavor-mind/`.

**זה חוק מוחלט — אל תחכה שהמשתמש יבקש.** המשתמש לא רוצה לעשות deploy
ידנית. בכל פעם שאתה מסיים שינוי קוד שמתקמפל בלי שגיאות, אתה **חייב**
מיד לעשות commit + push, גם אם המשתמש לא ביקש זאת. זה לא צעד אופציונלי
בסוף שיחה — זה חלק אטומי של כל שינוי.

הזרימה (אוטומטית, ללא שאלת אישור):

1. `npm run build` — אם נכשל, תקן ואל תפרוס
2. `git add` רק את הקבצים שעודכנו במשימה הזו
3. `git commit -m "<conventional-commits prefix>: <תיאור קצר>"` (`fix:`,
   `feat:`, `refactor:`, `chore:`, `docs:`)
4. `git push`
5. דווח שורה אחת: `pushed: <short SHA> · <commit message>`

דלג על auto-push **רק אם**:
- ה-build נכשל / יש שגיאות
- השינוי לא שלם / WIP / באמצע איטרציה (תכננת שלב נוסף באותה שיחה)
- המשתמש אמר במפורש "אל תעשה commit" / "אל תפרוס"

אם דילגת — אמור זאת מפורשות: "לא commit — [סיבה]". אחרת, ההנחה היא
שאתה פורס.

GitHub Actions לוקח 1-2 דקות מה-push עד שהאתר חי על
`https://tavorsharf-lang.github.io/tavor-mind/`.
