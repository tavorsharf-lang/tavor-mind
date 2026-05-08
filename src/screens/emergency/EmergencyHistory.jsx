import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ToolHeader from '../toolbox/components/ToolHeader.jsx';
import { Loading } from '../../components/ui/Loading.jsx';
import { getRecentEmergencySessions } from '../../utils/emergencyLog.js';
import { getModeById } from '../../data/modes.js';

const ACTIVATION_DOT = {
  hyper: 'var(--clay)',
  hypo:  'var(--lichen)',
  mid:   'var(--ink-soft)',
};

const ACTIVATION_LABELS = {
  hyper: 'הופעלתי',
  hypo:  'מרוקן',
  mid:   'עוד טריגר אחד',
};

function formatHebrewDateTime(value) {
  if (value == null) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('he-IL', {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function modesText(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return '';
  return ids.map((id) => getModeById(id)?.label || id).join(', ');
}

function sessionTimestamp(s) {
  return s.clientTs || s.endedAt || s.startedAtClient || 0;
}

function SessionRow({ session, onClick }) {
  const ts = sessionTimestamp(session);
  const modes = modesText(session.modesIdentified);
  const dot = ACTIVATION_DOT[session.activation] || 'var(--ink-soft)';
  const label = ACTIVATION_LABELS[session.activation] || '';
  return (
    <button type="button" className="emergency-history-row" onClick={onClick}>
      <span className="emergency-history-row-text">
        <span className="emergency-history-row-date">{formatHebrewDateTime(ts)}</span>
        {modes && <span className="emergency-history-row-modes">{modes}</span>}
      </span>
      <span
        className="emergency-history-row-dot"
        style={{ background: dot }}
        aria-label={label}
      />
    </button>
  );
}

export default function EmergencyHistory() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState(null);

  useEffect(() => {
    getRecentEmergencySessions(30).then(setSessions);
  }, []);

  return (
    <div className="tool-page ds2-themed">
      <ToolHeader title="סשנים קודמים" backTo="/" />
      <main className="tool-content">
        {!sessions && <Loading />}
        {sessions && sessions.length === 0 && (
          <p className="ck-empty">עדיין לא היו סשנים.</p>
        )}
        {sessions && sessions.length > 0 && (
          <ul className="emergency-history-list">
            {sessions.map((s) => (
              <li key={s.sessionId}>
                <SessionRow
                  session={s}
                  onClick={() => navigate(`/emergency/history/${s.sessionId}`)}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
