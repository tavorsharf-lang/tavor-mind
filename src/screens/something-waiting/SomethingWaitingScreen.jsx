import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ToolHeader from '../toolbox/components/ToolHeader.jsx';
import { Loading } from '../../components/ui/Loading.jsx';
import {
  listWaitingItems,
  markHandled,
  markChanged,
  deriveStatus,
  flushPendingWaitingItems,
} from '../../utils/somethingWaitingStorage.js';
import { formatHebrewDate, getIsraelDateString } from '../../utils/dateHelpers.js';

const STATUS_LABELS = {
  fresh: null,
  old: 'ישן',
  long_waited: 'המתין הרבה זמן',
};

const STRUCTURE_LABELS = {
  box: 'קופסה עם מכסה',
  cabinet: 'ארון נעול',
  lake: 'אגם רחוק',
  cloud: 'ענן בשמיים',
  custom: 'מבנה מותאם',
};

export default function SomethingWaitingScreen() {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [activeChange, setActiveChange] = useState(null);
  const [changeNote, setChangeNote] = useState('');

  const reload = async () => {
    await flushPendingWaitingItems();
    const list = await listWaitingItems();
    setItems(list);
  };

  useEffect(() => { reload(); }, []);

  const handleHandled = async (id) => {
    await markHandled(id);
    reload();
  };

  const handleChanged = async (id) => {
    await markChanged(id, changeNote);
    setActiveChange(null);
    setChangeNote('');
    reload();
  };

  return (
    <div className="tool-page ds2-themed">
      <ToolHeader title="משהו ממתין" subtitle="דברים שהנחת בקונטיינר ועוד לא חזרת אליהם" backTo="/" />
      <main className="tool-content">
        {items === null && <Loading />}
        {items?.length === 0 && (
          <p className="ck-empty">אין כרגע דברים שממתינים. כל מה שתשים בקונטיינר — יופיע פה.</p>
        )}
        {items?.length > 0 && (
          <ul className="waiting-list">
            {items.map((item) => {
              const status = deriveStatus(item);
              return (
                <li key={item._id} className={`waiting-item waiting-item-${status}`}>
                  <p className="waiting-item-sentence">"{item.sentence}"</p>
                  <div className="waiting-item-meta">
                    <span>{STRUCTURE_LABELS[item.structure] || item.customStructure || '—'}</span>
                    <span>·</span>
                    <span>{formatHebrewDate(getIsraelDateString(new Date(item.createdAt)))}</span>
                    {STATUS_LABELS[status] && (
                      <>
                        <span>·</span>
                        <span className="waiting-item-status">{STATUS_LABELS[status]}</span>
                      </>
                    )}
                  </div>
                  {status === 'long_waited' && (
                    <p className="waiting-item-prompt">האם זה עדיין רלוונטי? אפשר לבדוק עם עצמך — לפתוח, להסיר, או להשאיר עוד זמן.</p>
                  )}
                  <div className="waiting-item-actions">
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => navigate('/tools/triggers', { state: { fromWaitingItem: item._id, seedEvent: item.sentence } })}
                    >
                      פתח לניתוח
                    </button>
                    <button type="button" className="link-btn" onClick={() => handleHandled(item._id)}>
                      טופל
                    </button>
                    <button type="button" className="link-btn" onClick={() => setActiveChange(item._id)}>
                      השתנה
                    </button>
                  </div>
                  {activeChange === item._id && (
                    <div className="waiting-item-change-form">
                      <textarea
                        className="ck-textarea"
                        rows={2}
                        placeholder="במה זה השתנה?"
                        value={changeNote}
                        onChange={(e) => setChangeNote(e.target.value)}
                      />
                      <div className="waiting-item-change-actions">
                        <button type="button" className="link-btn" onClick={() => handleChanged(item._id)}>שמור</button>
                        <button type="button" className="link-btn" onClick={() => { setActiveChange(null); setChangeNote(''); }}>ביטול</button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
