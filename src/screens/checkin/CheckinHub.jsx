import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatHebrewDate, getIsraelDateString } from '../../utils/dateHelpers.js';
import { flushPendingCheckins } from '../../utils/checkinStorage.js';
import { HomePulse, HomeHistory, ChevronStart } from '../../components/icons/system.jsx';

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
          <ChevronStart size={22} />
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
          <span className="ck-card-icon icon-tone-warmth" aria-hidden="true"><HomePulse /></span>
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
          <span className="ck-card-icon icon-tone-reflect" aria-hidden="true"><HomeHistory /></span>
          <span className="ck-card-text">
            <span className="ck-card-title">היסטוריה</span>
            <span className="ck-card-sub">7 הימים האחרונים</span>
          </span>
        </button>
      </main>
    </div>
  );
}
