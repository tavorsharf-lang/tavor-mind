import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckinIcon,
  ToolsIcon,
  MirrorIcon,
  TherapyIcon,
  Phase8TriggerIcon,
} from '../components/icons/index.jsx';
import { getTherapyDayOfWeek, getRelevantFrameDate } from '../utils/therapyDay.js';
import { getFrame } from '../utils/therapyStorage.js';
import { countWaitingItems, flushPendingWaitingItems } from '../utils/somethingWaitingStorage.js';
import { isHrSetupDone, isWearingWatch, setWearingWatch } from '../utils/liveHr.js';
import SyncStatusBadge from '../components/ui/SyncStatusBadge.jsx';

const FIRST_RUN_KEY = 'tavor_mind_seen_home_v1';
const LAST_VISIT_KEY = 'tavor_mind_last_visit_v1';

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'בוקר טוב';
  if (h >= 12 && h < 18) return 'צהריים טובים';
  if (h >= 18 && h < 23) return 'ערב טוב';
  return 'לילה טוב';
}

function readFirstRun() {
  try { return !localStorage.getItem(FIRST_RUN_KEY); } catch { return false; }
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
  const [waitingCount, setWaitingCount] = useState(0);
  const [hrReady, setHrReady] = useState(false);
  const [wearingWatch, setWearingWatchState] = useState(false);

  useEffect(() => {
    setHrReady(isHrSetupDone());
    setWearingWatchState(isWearingWatch());
  }, []);

  const toggleWearingWatch = () => {
    const next = !wearingWatch;
    setWearingWatch(next);
    setWearingWatchState(next);
  };

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
    } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const dow = await getTherapyDayOfWeek();
      if (cancelled) return;
      if (dow == null) return setTherapyState({ show: false, mode: null });
      const frameDate = getRelevantFrameDate(dow);
      if (!frameDate) return setTherapyState({ show: false, mode: null });
      const frame = await getFrame(frameDate);
      if (cancelled) return;
      const hasPrep = Boolean(frame?.prepText && frame.prepText.trim());
      const hasDebrief = Boolean(frame?.debriefText && frame.debriefText.trim());
      if (!hasPrep) setTherapyState({ show: true, mode: 'prep' });
      else if (!hasDebrief) setTherapyState({ show: true, mode: 'debrief' });
      else setTherapyState({ show: false, mode: null });
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await flushPendingWaitingItems();
      const n = await countWaitingItems();
      if (!cancelled) setWaitingCount(n);
    })();
    return () => { cancelled = true; };
  }, []);

  const goTo = (route, options) => {
    if (firstRun) {
      try { localStorage.setItem(FIRST_RUN_KEY, String(Date.now())); } catch {}
      setFirstRun(false);
    }
    navigate(route, options);
  };

  return (
    <div className="ds3-screen ds3-home">
      <div className="ds3-ambient" aria-hidden="true" />

      <div className="ds3-home-greeting">
        <h1 className="ds3-home-greeting-text">
          {greeting}, <span className="ds3-home-greeting-name">תבור</span>
        </h1>
        {continuity && <p className="ds3-home-continuity">{continuity}</p>}
        <button
          type="button"
          className="ds3-home-profile-link"
          onClick={() => goTo('/toolbox')}
        >
          הפרופיל שלי ←
        </button>
      </div>

      {/* Big breathing button — design's signature home moment */}
      <div className="ds3-home-hero">
        <button
          type="button"
          className="ds3-home-hero-btn"
          onClick={() => goTo('/emergency')}
          aria-label="עכשיו קשה לי"
        >
          <span className="ds3-home-hero-pulse" aria-hidden="true" />
          <span className="ds3-home-hero-pulse ds3-home-hero-pulse-2" aria-hidden="true" />
          <span className="ds3-home-hero-core">
            <span>עכשיו</span>
            <span>קשה&nbsp;לי</span>
          </span>
        </button>
      </div>

      {waitingCount > 0 && (
        <div className="ds3-home-waiting">
          <button
            type="button"
            className="ds3-home-waiting-btn"
            onClick={() => navigate('/something-waiting')}
          >
            יש לך {waitingCount === 1 ? 'דבר אחד שממתין' : `${waitingCount} דברים שממתינים`}
          </button>
        </div>
      )}

      <div className="ds3-home-grid">
        <HomeTile
          tone="orange"
          icon={<CheckinIcon />}
          title="צ'ק-אין יומי"
          badge={firstRun ? 'התחל כאן' : null}
          onClick={() => goTo('/checkin')}
        />
        {therapyState.show && (
          <HomeTile
            tone="indigo"
            icon={<TherapyIcon />}
            title={therapyState.mode === 'prep' ? 'הכנה לטיפול' : 'דיבריף'}
            onClick={() => goTo('/therapy/frame')}
          />
        )}
        <HomeTile
          tone="coral"
          icon={<ToolsIcon />}
          title="כלים"
          onClick={() => goTo('/tools')}
        />
        <HomeTile
          tone="green"
          icon={<Phase8TriggerIcon />}
          title="ניתוח מקרה"
          onClick={() => goTo('/emergency', { state: { startAtAnalysis: true } })}
        />
        <HomeTile
          tone="indigo"
          icon={<MirrorIcon />}
          title="המראה"
          onClick={() => goTo('/review')}
        />
      </div>

      <footer className="ds3-home-footer">
        {hrReady && (
          <button
            type="button"
            className={`ds3-watch-toggle ${wearingWatch ? 'is-on' : 'is-off'}`}
            onClick={toggleWearingWatch}
            aria-pressed={wearingWatch}
          >
            <span className="ds3-watch-toggle-label">אני עונד שעון</span>
            <span className="ds3-watch-toggle-pill">{wearingWatch ? 'כן' : 'לא'}</span>
          </button>
        )}
        <div className="ds3-home-footer-row">
          {authError ? (
            <span className="ds3-micro ds3-text-coral">לא מחובר</span>
          ) : (
            <span className="ds3-micro ds3-text-soft">מחובר ✓</span>
          )}
          <SyncStatusBadge />
        </div>
      </footer>
    </div>
  );
}

function HomeTile({ tone = 'blue', icon, title, badge, onClick }) {
  return (
    <button type="button" className="ds3-home-tile" onClick={onClick}>
      <span className={`ds3-icon-tile ds3-icon-tile-${tone}`} aria-hidden="true">
        {icon}
      </span>
      <div className="ds3-home-tile-text">
        <div className="ds3-home-tile-title">
          <span>{title}</span>
          {badge && <span className="ds3-home-tile-badge">{badge}</span>}
        </div>
      </div>
    </button>
  );
}
