import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatHebrewDate, getIsraelDateString, formatTimeOfDay } from '../../utils/dateHelpers.js';
import { flushPendingCheckins } from '../../utils/checkinStorage.js';
import { HomeHistory, ChevronStart, Time, Calendar } from '../../components/icons/system.jsx';

export default function CheckinHub() {
  const navigate = useNavigate();
  const today = getIsraelDateString();
  const [now, setNow] = useState(() => formatTimeOfDay());

  useEffect(() => {
    flushPendingCheckins().catch(() => {});
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(formatTimeOfDay()), 30000);
    return () => clearInterval(id);
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
        <div className="ck-scope-row">
          <button
            type="button"
            className="ck-card ck-card-primary"
            onClick={() => navigate('/checkin/mood', { state: { scope: 'moment' } })}
          >
            <span className="ck-card-icon" aria-hidden="true"><Time /></span>
            <span className="ck-card-text">
              <span className="ck-card-title">איך אתה מרגיש כרגע</span>
              <span className="ck-card-sub">{now}</span>
            </span>
          </button>

          <button
            type="button"
            className="ck-card ck-card-primary"
            onClick={() => navigate('/checkin/mood', { state: { scope: 'day' } })}
          >
            <span className="ck-card-icon" aria-hidden="true"><Calendar /></span>
            <span className="ck-card-text">
              <span className="ck-card-title">איך הרגשת היום</span>
              <span className="ck-card-sub">סיכום של היום</span>
            </span>
          </button>
        </div>

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
