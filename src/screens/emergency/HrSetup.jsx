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
} from '../../utils/liveHr.js';

const TEST_TIMEOUT_MS = 60000;

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

  const handleTest = () => {
    // Fresh probe each click — otherwise stale samples from a prior test
    // would show ✓ immediately without proving the Shortcut just ran.
    const fresh = `probe-${generateHrSessionId()}`;
    setProbeId(fresh);
    setTestStatus('launching');
    setTimeout(() => {
      setTestStatus('waiting');
      window.location.href = buildRunShortcutUrl(fresh);
    }, 200);
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
            כדי לראות את הדופק זז תוך כדי סשן, נצטרך Shortcut באייפון שמקריא דגימות
            מ-HealthKit ושולח ל-Firebase. הגדרה חד-פעמית — חינם, בלי App Store.
          </p>
        </div>

        {done && (
          <div className="hr-setup-status is-ok">
            ההגדרה הושלמה ✓ אפשר להפעיל מעקב מתוך סשן חירום
          </div>
        )}

        <Step num={1} title="צור Shortcut חדש באייפון">
          <p className="hr-setup-step-body">
            פתח את אפליקציית <b>Shortcuts</b> → לחץ על <b>+</b> בפינה. תן לו שם בדיוק:
          </p>
          <CopyRow
            label="copy-name"
            value={SHORTCUT_NAME}
            copied={copied === 'copy-name'}
            onCopy={() => copyText('copy-name', SHORTCUT_NAME)}
          />
          <p className="hr-setup-step-body" style={{ marginTop: 4, fontSize: 13 }}>
            השם חייב להיות מדויק — האפליקציה משתמשת בו כדי לפתוח את ה-Shortcut.
          </p>
        </Step>

        <Step num={2} title="הוסף את הפעולות הבאות (לפי הסדר)">
          <ol style={{ margin: '4px 0 0 0', paddingInlineStart: 18, fontSize: 14, lineHeight: 1.7, color: 'var(--ink-soft)' }}>
            <li><b>Receive Input</b> — Type: Text. Set as variable <span style={{fontFamily:'monospace'}}>SessionId</span>.</li>
            <li><b>Text</b> — value הדבק בו את ה-URL שלמטה. Set as variable <span style={{fontFamily:'monospace'}}>BaseUrl</span>.</li>
            <li><b>Start Workout</b> — Type: Other. (פעולה מ-Apple Watch — תצא לאייפון אבל מפעילה את השעון).</li>
            <li><b>Repeat</b> — 200 times. בתוך הלולאה:
              <ol style={{ margin: '4px 0 0 0', paddingInlineStart: 16 }}>
                <li><b>Wait</b> — 5 seconds.</li>
                <li><b>Find Health Samples where</b> — Type: Heart Rate, Sort by Start Date Latest First, Limit 1.</li>
                <li><b>Get Value from Health Sample</b> — מחלץ את ה-BPM כמספר.</li>
                <li><b>Get Contents of URL</b>: URL = <span style={{fontFamily:'monospace'}}>{'{BaseUrl}/samples.json'}</span>, Method: <b>POST</b>, Request Body: JSON, שדה: <span style={{fontFamily:'monospace'}}>bpm</span> = ה-BPM שחילצת.</li>
              </ol>
            </li>
            <li><b>End Workout</b>.</li>
          </ol>
          <p className="hr-setup-step-body" style={{ marginTop: 8, fontSize: 13, color: 'var(--ink-muted)' }}>
            טיפ: ב-"Get Contents of URL" → Show More → Method: PUT, Request Body: JSON, ובחר את ה-BPM כ-Top-Level Item.
          </p>
        </Step>

        <Step num={3} title="הדבק את ה-BaseUrl לתוך ה-Text action">
          <p className="hr-setup-step-body">
            זה ה-URL הייחודי שלך (כולל ה-UID האנונימי שלך + ה-SessionId כמשתנה):
          </p>
          {writeBase ? (
            <CopyRow
              label="copy-url"
              value={`${FIREBASE_DB_URL}/${LIVE_HR_ROOT}/${uid}/[SessionId]`}
              copied={copied === 'copy-url'}
              onCopy={() => copyText('copy-url', `${FIREBASE_DB_URL}/${LIVE_HR_ROOT}/${uid}/`)}
            />
          ) : (
            <div className="hr-setup-code">UID לא זמין — רענן את הדף</div>
          )}
          <p className="hr-setup-step-body" style={{ marginTop: 4, fontSize: 13, color: 'var(--ink-muted)' }}>
            בתוך ה-Text action, לאחר ההדבקה — מחק את <span style={{fontFamily:'monospace'}}>[SessionId]</span> והכנס במקומו את משתנה <span style={{fontFamily:'monospace'}}>SessionId</span> מצעד 2.1.
          </p>
        </Step>

        <Step num={4} title="עדכן את כללי Firebase">
          <p className="hr-setup-step-body">
            בקונסולת Firebase ({'>'} Realtime Database {'>'} Rules), הוסף את הענף הבא בנוסף לכללים הקיימים:
          </p>
          <CopyRow
            label="copy-rules"
            value={`"${LIVE_HR_ROOT}": { "$uid": { ".read": true, ".write": true } }`}
            copied={copied === 'copy-rules'}
            onCopy={() => copyText('copy-rules', `"${LIVE_HR_ROOT}": {\n  "$uid": {\n    ".read": true,\n    ".write": true\n  }\n}`)}
          />
          <p className="hr-setup-step-body" style={{ marginTop: 4, fontSize: 13, color: 'var(--ink-muted)' }}>
            ה-UID שלך הוא 28 תווים אקראיים — זה ה"סיסמה" של הנתיב. רק מי שיודע אותו יכול לכתוב.
          </p>
        </Step>

        <Step num={5} title="בדיקה מהירה">
          <p className="hr-setup-step-body">
            לחץ על הכפתור — האפליקציה תפעיל את ה-Shortcut עם session ID לבדיקה. אם הכל תקין,
            תוך כ-15 שניות נראה כאן ✓.
          </p>
          <button
            type="button"
            className="ds3-btn ds3-btn-blue"
            onClick={handleTest}
            disabled={testStatus === 'launching' || testStatus === 'waiting'}
            style={{ width: '100%', height: 48, borderRadius: 24, marginTop: 6 }}
          >
            {testStatus === 'idle' && 'הפעל בדיקה'}
            {testStatus === 'launching' && 'פותח את Shortcuts…'}
            {testStatus === 'waiting' && 'ממתין לדגימה ראשונה…'}
            {testStatus === 'ok' && 'בדיקה הצליחה ✓'}
            {testStatus === 'fail' && 'נסה שוב'}
          </button>

          {testStatus === 'ok' && (
            <div className="hr-setup-status is-ok">
              דגימה התקבלה. ה-Shortcut עובד.
            </div>
          )}
          {testStatus === 'fail' && (
            <div className="hr-setup-status is-fail">
              לא התקבלה דגימה תוך {TEST_TIMEOUT_MS/1000} שניות. בדוק שהשם של ה-Shortcut הוא בדיוק "{SHORTCUT_NAME}",
              שה-BaseUrl מכיל את ה-SessionId, ושה-Firebase rules עודכנו.
            </div>
          )}
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
