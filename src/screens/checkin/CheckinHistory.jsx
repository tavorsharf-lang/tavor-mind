import { useEffect, useState } from 'react';
import ToolHeader from '../toolbox/components/ToolHeader.jsx';
import { Loading } from '../../components/ui/Loading.jsx';
import DayCard from './components/DayCard.jsx';
import { getCheckinsRange } from '../../utils/checkinStorage.js';

export default function CheckinHistory() {
  const [days, setDays] = useState(null);

  useEffect(() => {
    getCheckinsRange(7).then(setDays);
  }, []);

  const allEmpty = days && days.every((d) => !d.entries.length);

  return (
    <div className="tool-page ds2-themed">
      <ToolHeader title="7 הימים האחרונים" backTo="/checkin" />
      <main className="tool-content">
        {!days && <Loading />}
        {days && allEmpty && (
          <p className="ck-empty">
            עוד אין היסטוריה. הרישום הראשון שלך מתחיל את הסיפור.
          </p>
        )}
        {days && !allEmpty && (
          <ul className="day-list">
            {days.map((d) => <DayCard key={d.date} day={d} />)}
          </ul>
        )}
      </main>
    </div>
  );
}
