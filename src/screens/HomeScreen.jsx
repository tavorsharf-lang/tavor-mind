import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EmergencyIcon,
  CheckinIcon,
  ToolboxIcon,
  ToolsIcon,
  RepositoryIcon,
  MirrorIcon,
  MindfulnessIcon,
  ChevronEnd,
} from '../components/icons/index.jsx';
import { getTherapyDayOfWeek, getRelevantFrameDate } from '../utils/therapyDay.js';
import { getFrame } from '../utils/therapyStorage.js';

const FIRST_RUN_KEY = 'tavor_mind_seen_home_v1';
const LAST_VISIT_KEY = 'tavor_mind_last_visit_v1';

function getGreeting() {
  const h = new Date().getHours();
  let prefix;
  if (h >= 5 && h < 12) prefix = 'בוקר טוב';
  else if (h >= 12 && h < 18) prefix = 'צהריים טובים';
  else if (h >= 18 && h < 23) prefix = 'ערב טוב';
  else prefix = 'לילה טוב';
  return prefix;
}

function readFirstRun() {
  try {
    return !localStorage.getItem(FIRST_RUN_KEY);
  } catch {
    return false;
  }
}

function continuityHint(prev, now) {
  if (!prev) return null;
  const hours = (now - prev) / (1000 * 60 * 60);
  if (hours < 6) return null;
  const days = Math.floor(hours / 24);
  if (days === 0) return 'טוב לראותך שוב היום';
  if (days === 1) return 'נפגשנו אתמול';
  if (days < 7) return `נפגשנו לפני ${days} ימים`;
  if (days < 30) return 'חזרת אחרי שבוע ויותר';
  return 'חזרת אחרי הפסקה';
}

export default function HomeScreen({ authError }) {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState(getGreeting());
  const [firstRun, setFirstRun] = useState(readFirstRun);
  const [continuity, setContinuity] = useState(null);
  const [therapyState, setTherapyState] = useState({ show: false, mode: null });

  useEffect(() => {
    const id = setInterval(() => setGreeting(getGreeting()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_VISIT_KEY);
      const prev = raw ? Number(raw) : null;
      const now = Date.now();
      setContinuity(continuityHint(prev, now));
      localStorage.setItem(LAST_VISIT_KEY, String(now));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const dow = await getTherapyDayOfWeek();
      if (cancelled) return;
      if (dow == null) {
        setTherapyState({ show: false, mode: null });
        return;
      }
      const frameDate = getRelevantFrameDate(dow);
      if (!frameDate) {
        setTherapyState({ show: false, mode: null });
        return;
      }
      const frame = await getFrame(frameDate);
      if (cancelled) return;
      const hasPrep = Boolean(frame?.prepText && frame.prepText.trim());
      const hasDebrief = Boolean(frame?.debriefText && frame.debriefText.trim());
      if (!hasPrep) {
        setTherapyState({ show: true, mode: 'prep' });
      } else if (!hasDebrief) {
        setTherapyState({ show: true, mode: 'debrief' });
      } else {
        setTherapyState({ show: false, mode: null });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const goTo = (route) => {
    if (firstRun) {
      try { localStorage.setItem(FIRST_RUN_KEY, String(Date.now())); } catch {}
      setFirstRun(false);
    }
    navigate(route);
  };

  return (
    <div className="ds2-page">
      <span className="ds2-app-tag">tavor-mind</span>

      <div className="ds2-greeting-block">
        <h1 className="ds2-greeting">
          {greeting}, <span className="ds2-greeting-name">תבור</span>
        </h1>
        <p className="ds2-subtitle">המרחב שלך לרגעים קשים ולעבודה פנימית</p>
        {continuity && <p className="ds2-continuity">{continuity}</p>}
      </div>

      <button
        type="button"
        className="ds2-emergency-card"
        onClick={() => goTo('/emergency')}
      >
        <span className="ds2-icon-tile ds2-icon-tile-terra" aria-hidden="true">
          <EmergencyIcon />
        </span>
        <span className="ds2-card-text">
          <span className="ds2-card-title">עכשיו קשה לי</span>
          <span className="ds2-card-sub">גישה מיידית להכלה</span>
        </span>
      </button>

      <SectionDivider label="כל יום" />

      <div className="ds2-stack">
        <StackItem
          icon={<CheckinIcon />}
          title="צ'ק-אין יומי"
          subtitle="בוקר וערב"
          badge={firstRun ? 'התחל כאן' : null}
          onClick={() => goTo('/checkin')}
        />
        {therapyState.show && (
          <StackItem
            icon={<TherapyIcon />}
            title={therapyState.mode === 'prep' ? 'הכנה לטיפול' : 'דיבריף מהטיפול'}
            subtitle={therapyState.mode === 'prep' ? 'מה אני רוצה להביא?' : 'מה התרחש שם?'}
            onClick={() => goTo('/therapy/frame')}
          />
        )}
        <StackItem
          icon={<MindfulnessIcon />}
          title="מיינדפולנס"
          subtitle="הקלטות מדיטציה"
          onClick={() => goTo('/mindfulness')}
        />
      </div>

      <SectionDivider label="כלים לרגע" />

      <div className="ds2-stack">
        <StackItem
          icon={<ToolsIcon />}
          title="כלים פנימיים"
          subtitle="זיהוי, עצירה, בחינה מחדש"
          onClick={() => goTo('/tools')}
        />
      </div>

      <SectionDivider label="מי אני, לאורך זמן" />

      <div className="ds2-stack">
        <StackItem
          icon={<ToolboxIcon />}
          title="הפרופיל שלי"
          subtitle="הידע שצברת על עצמך"
          onClick={() => goTo('/toolbox')}
        />
        <StackItem
          icon={<RepositoryIcon />}
          title="מאגר הניתוחים"
          subtitle="סשנים מובנים"
          onClick={() => goTo('/repository')}
        />
        <StackItem
          icon={<MirrorIcon />}
          title="המראה"
          subtitle="סקירת השבוע"
          onClick={() => goTo('/review')}
        />
      </div>

      <footer className="ds2-footer">
        {authError ? (
          <span className="ds2-status ds2-status-error">לא מחובר</span>
        ) : (
          <span className="ds2-status">מחובר ✓</span>
        )}
        <button
          type="button"
          className="link-btn ds2-footer-link"
          onClick={() => navigate('/settings/therapy-day')}
        >
          הגדרת יום טיפול
        </button>
      </footer>
    </div>
  );
}

function SectionDivider({ label }) {
  return (
    <div className="ds2-section-divider" aria-hidden="true">
      <span className="ds2-section-divider-line" />
      <span className="ds2-section-divider-label">{label}</span>
      <span className="ds2-section-divider-line" />
    </div>
  );
}

function TherapyIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4 5 H20 V19 H14 L12 21 L10 19 H4 Z" />
    </svg>
  );
}

function StackItem({ icon, title, subtitle, onClick, badge }) {
  return (
    <button type="button" className="ds2-stack-item" onClick={onClick}>
      <span className="ds2-icon-tile ds2-icon-tile-lichen" aria-hidden="true">
        {icon}
      </span>
      <span className="ds2-card-text">
        <span className="ds2-card-title">
          <span>{title}</span>
          {badge && <span className="ds2-stack-badge">{badge}</span>}
        </span>
        <span className="ds2-card-sub">{subtitle}</span>
      </span>
      <span className="ds2-chevron" aria-hidden="true">
        <ChevronEnd />
      </span>
    </button>
  );
}
