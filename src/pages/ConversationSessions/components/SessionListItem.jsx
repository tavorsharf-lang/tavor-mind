import { getSessionTypeLabel } from '../../../config/sessionTypes.js';

function formatDate(ms) {
  if (!ms) return '';
  try {
    return new Date(ms).toLocaleString('he-IL', {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function SessionListItem({ session, showType, onClick }) {
  if (!session) return null;
  const exported = !!session.exportedAt;
  const imported = !!session.importedResponse;
  return (
    <li className="cs-history-item">
      <button type="button" className="cs-history-item-btn" onClick={onClick}>
        <div className="cs-history-item-head">
          {showType && (
            <span className="cs-history-type-tag">{getSessionTypeLabel(session.type)}</span>
          )}
          <span className="cs-history-date">{formatDate(session.createdAt)}</span>
        </div>
        <div className="cs-history-item-status">
          <span className={`cs-status-dot${exported ? ' is-on' : ''}`} aria-hidden="true" />
          <span className="cs-status-label">{exported ? 'יוצא' : 'לא יוצא'}</span>
          <span className="cs-status-sep" aria-hidden="true">·</span>
          <span className={`cs-status-dot${imported ? ' is-on' : ''}`} aria-hidden="true" />
          <span className="cs-status-label">{imported ? 'תגובה יובאה' : 'אין תגובה'}</span>
          {session._pending && (
            <>
              <span className="cs-status-sep" aria-hidden="true">·</span>
              <span className="cs-status-label cs-status-pending">לא סונכרן</span>
            </>
          )}
        </div>
      </button>
    </li>
  );
}
