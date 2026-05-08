import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatHebrewDate, getIsraelDateString } from '../../utils/dateHelpers.js';
import { flushPendingCheckins } from '../../utils/checkinStorage.js';

const ICONS = {
  log: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="16" r="11" />
      <path d="M11 17 q 5 5 10 0" />
      <circle cx="12" cy="13" r="1" fill="currentColor" />
      <circle cx="20" cy="13" r="1" fill="currentColor" />
    </svg>
  ),
  history: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="8" width="20" height="18" rx="2" />
      <line x1="6" y1="13" x2="26" y2="13" />
      <line x1="11" y1="5" x2="11" y2="11" />
      <line x1="21" y1="5" x2="21" y2="11" />
    </svg>
  ),
};

export default function CheckinHub() {
  const navigate = useNavigate();
  const today = getIsraelDateString();

  useEffect(() => {
    flushPendingCheckins().catch(() => {});
  }, []);

  return (
    <div className="ck-hub ds2-themed">
      <header className="ck-hub-header">
        <button
          type="button"
          className="tool-back"
          aria-label="חזרה"
          onClick={() => navigate('/')}
        >
          <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
        <div className="ck-hub-title-block">
          <h1 className="ck-hub-title">צ'ק-אין רגשי</h1>
          <p className="ck-hub-date">{formatHebrewDate(today)}</p>
        </div>
      </header>

      <main className="ck-hub-main">
        <button
          type="button"
          className="ck-card ck-card-primary"
          onClick={() => navigate('/checkin/mood')}
        >
          <span className="ck-card-icon" aria-hidden="true">{ICONS.log}</span>
          <span className="ck-card-text">
            <span className="ck-card-title">תיעוד מצב רוח</span>
            <span className="ck-card-sub">איך אתה כרגע, או איך היה היום</span>
          </span>
        </button>

        <button
          type="button"
          className="ck-card ck-card-tertiary"
          onClick={() => navigate('/checkin/history')}
        >
          <span className="ck-card-icon" aria-hidden="true">{ICONS.history}</span>
          <span className="ck-card-text">
            <span className="ck-card-title">היסטוריה</span>
            <span className="ck-card-sub">7 הימים האחרונים</span>
          </span>
        </button>
      </main>
    </div>
  );
}
