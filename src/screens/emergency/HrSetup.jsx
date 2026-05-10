import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentUid,
  generateHrSessionId,
  buildShortcutWriteBase,
  buildRunShortcutUrl,
  getHrSessionSnapshot,
  isHrSetupDone,
  markHrSetupDone,
  clearHrSetup,
  FIREBASE_DB_URL,
  LIVE_HR_ROOT,
  SHORTCUT_NAME,
  SHORTCUT_NAME_START,
} from '../../utils/liveHr.js';

const TEST_TIMEOUT_MS = 90000;

export default function HrSetup() {
  const navigate = useNavigate();
  const [done, setDone] = useState(isHrSetupDone());
  const [probeId, setProbeId] = useState(() => `probe-${generateHrSessionId()}`);
  const [testStatus, setTestStatus] = useState('idle'); // idle|launching|waiting|ok|fail
  const [copied, setCopied] = useState(null);
  const uid = getCurrentUid();
  const writeBase = buildShortcutWriteBase(probeId);

  useEffect(() => {
    if (testStatus !== 'waiting' || !probeId) return undefined;
    let cancelled = false;
    const startedAt = Date.now();
    const tick = async () => {
      if (cancelled) return;
      const snap = await getHrSessionSnapshot(probeId);
      if (cancelled) return;
      if (snap?.samples?.length > 0) {
        setTestStatus('ok');
        return;
      }
      if (Date.now() - startedAt > TEST_TIMEOUT_MS) {
        setTestStatus('fail');
        return;
      }
      setTimeout(tick, 2000);
    };
    tick();
    return () => { cancelled = true; };
  }, [testStatus, probeId]);

  const copyText = async (key, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  // The button is an <a href={shortcuts://...}> — iOS Safari refuses to launch
  // custom URL schemes from JS-triggered iframes, but a real user-initiated
  // anchor click works reliably. onClick only flips state to start polling;
  // the href is what actually opens Shortcuts.
  const handleTestClick = () => {
    setTestStatus('waiting');
  };

  const handleRetryReset = () => {
    setProbeId(`probe-${generateHrSessionId()}`);
    setTestStatus('idle');
  };

  const handleConfirmDone = () => {
    markHrSetupDone();
    setDone(true);
  };

  const handleReset = () => {
    clearHrSetup();
    setDone(false);
  };

  return (
    <div className="ds3-screen ds2-themed">
      <div className="ds3-topbar">
        <span className="ds3-topbar-spacer" />
        <span className="ds3-topbar-label">מעקב דופק</span>
        <button
          type="button"
          className="ds3-topbar-back"
          aria-label="חזרה"
          onClick={() => navigate(-1)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <main className="ds3-screen-content ds3-stack-4" style={{ paddingBottom: 24 }}>
        <div className="ds3-stack-2" style={{ marginTop: 8 }}>
          <h1 className="ds3-h1">חיבור Apple Watch</h1>
          <p className="ds3-body ds3-text-muted">
            iOS לא חושף דופק חי מ-workout ל-Shortcuts (מגבלת אפל). במקום זה — אתה מתחיל workout בשעון לפני סשן, רץ דרך הסשן, ובסוף ה-Shortcut קורא את כל הדגימות מ-HealthKit ושולח לאפליקציה. תקבל גרף + סיכום בסוף הסשן.
          </p>
        </div>

        {done && (
          <div className="hr-setup-status is-ok">
            ההגדרה הושלמה ✓ הסיכום יופיע בסוף סשן חירום
          </div>
        )}

        <Step num={1} title="צור Shortcut באייפון">
          <p className="hr-setup-step-body">
            פתח את אפליקציית <b>Shortcuts</b> באייפון. אם יש לך כבר Shortcut קיים בשם "TavorMind HR" — מחק אותו ותיצור חדש. צור חדש עם השם בדיוק:
          </p>
          <CopyRow
            label="copy-name"
            value={SHORTCUT_NAME}
            copied={copied === 'copy-name'}
            onCopy={() => copyText('copy-name', SHORTCUT_NAME)}
          />
        </Step>

        <Step num={2} title="הוסף את הפעולות (לפי הסדר)">
          <ol style={{ margin: '4px 0 0 0', paddingInlineStart: 18, fontSize: 14, lineHeight: 1.7, color: 'var(--ink-soft)' }}>
            <li><b>קבלת מלל מ:</b> בחר "קלט של קיצור" — מקבל את ה-sessionId שעובר ב-URL.</li>
            <li><b>מלל</b> (Text) — הדבק כאן את ה-BaseUrl מצעד 3, ובסוף הוסף את משתנה ה-"מלל" מהפעולה הקודמת.</li>
            <li><b>הגדרת המשתנה</b> בשם <span style={{fontFamily:'monospace'}}>BaseUrl</span>, הערך = פלט פעולה 2.</li>
            <li><b>חיפוש דגימות בריאות</b> — Type: <b>Heart Rate</b>, תאריך התחלה בטווח של <b>שעה</b> (או 30 דק' — תלוי באורך הסשנים שלך). <b>הגבלה: כבוי</b> (כדי לקבל הכל). מיון: תאריך התחלה, סדר: אפשר כל אחד.</li>
            <li><b>חזור עם כל אחד מהפריטים</b> (Repeat with Each) — תוך הלולאה:
              <ol style={{ margin: '4px 0 0 0', paddingInlineStart: 16 }}>
                <li><b>קבלת ערך מתוך דגימת בריאות</b> — Attribute: <b>תאריך התחלה</b>. שם המשתנה: <span style={{fontFamily:'monospace'}}>SampleDate</span>.</li>
                <li><b>קבלת התוכן של URL</b>: URL = <span style={{fontFamily:'monospace'}}>{'{BaseUrl}/samples.json'}</span>, Method: <b>POST</b>, Request Body: <b>JSON</b>.<br/>שדות:<br/>
                  • <span style={{fontFamily:'monospace'}}>bpm</span> = משתנה <b>"פריט החזרה"</b> (Repeat Item) — זו הדגימה עצמה (Shortcuts יחלץ את הערך כמספר אוטומטית)<br/>
                  • <span style={{fontFamily:'monospace'}}>ts</span> = משתנה <span style={{fontFamily:'monospace'}}>SampleDate</span></li>
              </ol>
            </li>
          </ol>
          <p className="hr-setup-step-body" style={{ marginTop: 8, fontSize: 13, color: 'var(--ink-muted)' }}>
            הערה: לא צריך Start/End Workout בתוך ה-Shortcut הזה. את ה-workout אתה תתחיל ידנית בשעון לפני הסשן ותסיים אחריו.
          </p>
        </Step>

        <Step num={3} title="ה-BaseUrl שלך">
          <p className="hr-setup-step-body">
            הדבק את זה לפעולה השנייה (מלל), ואחריו הוסף את משתנה ה-"מלל" מהפעולה הראשונה:
          </p>
          {writeBase ? (
            <CopyRow
              label="copy-url"
              value={`${FIREBASE_DB_URL}/${LIVE_HR_ROOT}/${uid}/`}
              copied={copied === 'copy-url'}
              onCopy={() => copyText('copy-url', `${FIREBASE_DB_URL}/${LIVE_HR_ROOT}/${uid}/`)}
            />
          ) : (
            <div className="hr-setup-code">UID לא זמין — רענן את הדף</div>
          )}
        </Step>

        <Step num={4} title="כללי Firebase (אם עוד לא עדכנת)">
          <p className="hr-setup-step-body">
            בקונסולת Firebase → Realtime Database → Rules, ודא שיש את הענף:
          </p>
          <CopyRow
            label="copy-rules"
            value={`"${LIVE_HR_ROOT}": { "$uid": { ".read": true, ".write": true } }`}
            copied={copied === 'copy-rules'}
            onCopy={() => copyText('copy-rules', `"${LIVE_HR_ROOT}": {\n  "$uid": {\n    ".read": true,\n    ".write": true\n  }\n}`)}
          />
        </Step>

        <Step num={5} title="בדיקה">
          <p className="hr-setup-step-body">
            ודא שיש לך לפחות דגימת Heart Rate אחת ב-HealthKit מהשעה האחרונה (אם לא — שב 5 דקות עם השעון על היד, או הפעל workout קצר ועצור). לחץ "הפעל בדיקה" — ה-Shortcut יקרא את הדגימות וישלח. תוך 15-30 שניות תראה ✓.
          </p>
          {(testStatus === 'idle' || testStatus === 'waiting') && (
            <a
              href={buildRunShortcutUrl(probeId)}
              className="ds3-btn ds3-btn-blue"
              onClick={handleTestClick}
              style={{
                width: '100%', height: 48, borderRadius: 24, marginTop: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none',
                opacity: testStatus === 'waiting' ? 0.7 : 1,
                pointerEvents: testStatus === 'waiting' ? 'none' : 'auto',
              }}
            >
              {testStatus === 'idle' && 'הפעל בדיקה'}
              {testStatus === 'waiting' && 'ממתין לדגימה ראשונה…'}
            </a>
          )}
          {(testStatus === 'ok' || testStatus === 'fail') && (
            <button
              type="button"
              className="ds3-btn ds3-btn-blue"
              onClick={handleRetryReset}
              style={{ width: '100%', height: 48, borderRadius: 24, marginTop: 6 }}
            >
              {testStatus === 'ok' ? 'בדיקה הצליחה ✓ — בדוק שוב' : 'נסה שוב'}
            </button>
          )}

          {testStatus === 'ok' && (
            <div className="hr-setup-status is-ok">
              דגימות התקבלו. ה-Shortcut עובד.
            </div>
          )}
          {testStatus === 'fail' && (
            <div className="hr-setup-status is-fail">
              לא התקבלו דגימות תוך {TEST_TIMEOUT_MS/1000} שניות. ודא שיש דגימות Heart Rate ב-HealthKit ושה-Firebase rules עודכנו.
            </div>
          )}
        </Step>

        <Step num={6} title='Shortcut נוסף — "TavorMind HR Start" (אופציונלי)'>
          <p className="hr-setup-step-body">
            כדי לחסוך לך התעסקות עם השעון בכל סשן, אפשר ליצור Shortcut קטן שמתחיל workout בלחיצה אחת מ-tavor-mind.
          </p>
          <p className="hr-setup-step-body" style={{ marginTop: 4 }}>
            <b>שם:</b>
          </p>
          <CopyRow
            label="copy-start-name"
            value={SHORTCUT_NAME_START}
            copied={copied === 'copy-start-name'}
            onCopy={() => copyText('copy-start-name', SHORTCUT_NAME_START)}
          />
          <p className="hr-setup-step-body" style={{ marginTop: 8 }}>
            <b>פעולה יחידה:</b> "התחלת אימון" (Start Workout) — Type: <b>Other</b>, Goal: <b>Open</b>.
          </p>
          <p className="hr-setup-step-body" style={{ marginTop: 4, fontSize: 13, color: 'var(--ink-muted)' }}>
            ברגע שתיצור אותו, ב-Phase 1 של "עכשיו קשה לי" יופיע לינק "התחל מעקב דופק בשעון" שמפעיל אותו.
          </p>
        </Step>

        <Step num={7} title="זרימת השימוש בפועל">
          <ol style={{ margin: '4px 0 0 0', paddingInlineStart: 18, fontSize: 14, lineHeight: 1.7, color: 'var(--ink-soft)' }}>
            <li>לפני/בתחילת סשן: <b>התחל workout בשעון</b>. או דרך אפליקציית Workout בשעון, או מ-tavor-mind ב-Phase 1 (אם הגדרת את ה-Shortcut השני).</li>
            <li>פתח tavor-mind, רוץ דרך כל הסשן רגיל.</li>
            <li>בסוף הסשן (לפני "סיימתי"): <b>עצור את ה-workout בשעון</b>.</li>
            <li>במסך הסיכום של tavor-mind, לחץ "טען נתוני דופק". ה-Shortcut יקרא הכל ויציג גרף.</li>
          </ol>
        </Step>

        <div className="ds3-stack-3" style={{ paddingTop: 8 }}>
          {!done ? (
            <button
              type="button"
              className="ds3-btn ds3-btn-primary"
              onClick={handleConfirmDone}
              disabled={testStatus !== 'ok'}
            >
              סיימתי להגדיר
            </button>
          ) : (
            <button
              type="button"
              className="ds3-btn-quiet"
              onClick={handleReset}
            >
              איפוס הגדרה
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function Step({ num, title, children }) {
  return (
    <div className="hr-setup-step">
      <div className="hr-setup-step-title">
        <span className="hr-setup-step-num">{num}</span>
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

function CopyRow({ value, onCopy, copied }) {
  return (
    <div className="hr-setup-code">
      <span style={{ flex: 1, minWidth: 0 }}>{value}</span>
      <button
        type="button"
        className={`hr-setup-copy ${copied ? 'is-done' : ''}`}
        onClick={onCopy}
      >
        {copied ? 'הועתק ✓' : 'העתק'}
      </button>
    </div>
  );
}
