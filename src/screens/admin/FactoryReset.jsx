import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, remove } from 'firebase/database';
import { db, auth, ROOM, AUTH_UID_KEY } from '../../firebase.js';

const FIREBASE_NODES_TO_WIPE = [
  'checkins',
  'emergency_sessions',
  'trigger_analyses',
  'triggers',
  'mode_checks',
  'catastrophe_checks',
  'somatic_sessions',
  'therapy_frames',
  'something_waiting',
  'conversation_sessions',
  'choice_frequency',
  'custom_options',
];

const LOCAL_STORAGE_KEYS_TO_WIPE = [
  'tavor_mind_pending_sessions',
  'tavor_mind_pending_trigger_analyses',
  'tavor_mind_pending_checkins',
  'tavor_mind_pending_tools',
  'tavor_mind_pending_analyses',
  'tavor_mind_pending_frames',
  'tavor_mind_pending_waiting_items_v1',
  'tavor_mind_pending_conversation_sessions',
  'tavor_mind_conversation_choice_frequency',
  'tavor_mind_hr_setup_done',
  'tavor_mind_wearing_watch',
  'tavor_mind_62_onboarded_v1',
  'tavor_mind_62_recent_responses_v1',
  'tavor_mind_containment_onboarded_v1',
  'tavor_mind_seen_home_v1',
  'tavor_mind_last_visit_v1',
  'tavor_mind_option_frequencies',
];

function getUid() {
  return auth.currentUser?.uid || localStorage.getItem(AUTH_UID_KEY);
}

export default function FactoryReset() {
  const navigate = useNavigate();
  const [stage, setStage] = useState('idle'); // idle | confirming | working | done | error
  const [log, setLog] = useState([]);
  const [error, setError] = useState(null);

  const appendLog = (line) => setLog((prev) => [...prev, line]);

  const runReset = async () => {
    setStage('working');
    setLog([]);
    setError(null);

    const uid = getUid();
    if (!uid) {
      setError('אין uid — לא ניתן לאפס');
      setStage('error');
      return;
    }

    try {
      for (const node of FIREBASE_NODES_TO_WIPE) {
        try {
          await remove(ref(db, `${ROOM}/${uid}/${node}`));
          appendLog(`✓ נמחק: ${node}`);
        } catch (err) {
          appendLog(`✗ כשל ${node}: ${err?.message || err}`);
        }
      }

      try {
        await remove(ref(db, `tavormindLiveHr/${uid}`));
        appendLog('✓ נמחק: tavormindLiveHr');
      } catch (err) {
        appendLog(`✗ כשל tavormindLiveHr: ${err?.message || err}`);
      }

      let wipedKeys = 0;
      for (const key of LOCAL_STORAGE_KEYS_TO_WIPE) {
        if (localStorage.getItem(key) != null) {
          localStorage.removeItem(key);
          wipedKeys += 1;
        }
      }
      appendLog(`✓ ניקיתי ${wipedKeys} מפתחות localStorage`);
      appendLog('✓ ניתוחים נשמרו (לא נמחקו)');
      appendLog('✓ זהות (uid) נשמרה');

      setStage('done');
    } catch (err) {
      setError(err?.message || String(err));
      setStage('error');
    }
  };

  return (
    <div className="ds2-themed" style={{ minHeight: '100vh', padding: '24px 20px', maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>איפוס מפעל</h1>
      <p style={{ color: 'var(--ink-muted)', marginBottom: 24 }}>
        פעולה לא הפיכה. תמחק את כל הנתונים שלך חוץ מהניתוחים במאגר.
      </p>

      <section style={{ background: 'var(--surface)', borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: 'var(--shadow-soft)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>יימחק:</h2>
        <ul style={{ paddingInlineStart: 18, lineHeight: 1.7, color: 'var(--ink)' }}>
          <li>כל הצ׳ק-אינים הרגשיים</li>
          <li>כל סשני "עכשיו קשה לי"</li>
          <li>כל ניתוחי הטריגר העמוקים</li>
          <li>כל הכלים הפנימיים (טריגרים / מודים / קטסטרופה / סומאטי)</li>
          <li>כל מסגרות הטיפול (הכנה / דיברוף)</li>
          <li>כל הפריטים בקונטיינר</li>
          <li>כל השיחות המובנות (סשנים + תגובות מיובאות)</li>
          <li>תדירות בחירות + אופציות מותאמות אישית (סדר ותכנים ב-wizard)</li>
          <li>כל דגימות הדופק</li>
          <li>כל תורי ה-offline + דגלי onboarding</li>
        </ul>
      </section>

      <section style={{ background: 'var(--surface)', borderRadius: 16, padding: 16, marginBottom: 24, boxShadow: 'var(--shadow-soft)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>יישאר:</h2>
        <ul style={{ paddingInlineStart: 18, lineHeight: 1.7, color: 'var(--ink)' }}>
          <li>כל הניתוחים במאגר (סשני תרפיה, זיהוי רגשות וכו׳)</li>
          <li>הזהות שלך (uid) — הנתונים הבאים יישמרו עליה</li>
          <li>הגדרת יום הטיפול</li>
        </ul>
      </section>

      {stage === 'idle' && (
        <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
          <button
            type="button"
            onClick={() => setStage('confirming')}
            style={{ height: 52, borderRadius: 28, border: 'none', background: 'var(--terra)', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
          >
            התחל איפוס
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{ height: 44, borderRadius: 22, border: '1px solid var(--line)', background: 'transparent', color: 'var(--ink)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
          >
            ביטול
          </button>
        </div>
      )}

      {stage === 'confirming' && (
        <div style={{ background: 'var(--terra-soft)', padding: 16, borderRadius: 16, marginBottom: 12 }}>
          <p style={{ fontWeight: 600, marginBottom: 12 }}>בטוח? אי אפשר לבטל.</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={runReset}
              style={{ flex: 1, height: 48, borderRadius: 24, border: 'none', background: 'var(--terra)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
            >
              כן, מחק הכל
            </button>
            <button
              type="button"
              onClick={() => setStage('idle')}
              style={{ flex: 1, height: 48, borderRadius: 24, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
            >
              לא, חזור
            </button>
          </div>
        </div>
      )}

      {(stage === 'working' || stage === 'done' || stage === 'error') && (
        <section style={{ background: 'var(--surface)', borderRadius: 16, padding: 16, fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          {log.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
          {stage === 'working' && <div style={{ color: 'var(--ink-muted)' }}>... עובד</div>}
          {error && <div style={{ color: 'var(--terra)' }}>שגיאה: {error}</div>}
        </section>
      )}

      {stage === 'done' && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ fontWeight: 600, marginBottom: 16, color: 'var(--ink)' }}>סיימנו. הכל איפוסה והניתוחים נשארו.</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{ height: 48, padding: '0 28px', borderRadius: 24, border: 'none', background: 'var(--lichen)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
          >
            חזור לבית
          </button>
        </div>
      )}
    </div>
  );
}
