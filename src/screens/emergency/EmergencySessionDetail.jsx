import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ToolHeader from '../toolbox/components/ToolHeader.jsx';
import { Loading } from '../../components/ui/Loading.jsx';
import { getEmergencySession } from '../../utils/emergencyLog.js';
import { getModeById } from '../../data/modes.js';
import { buildEmergencyPrompt, getClaudeProjectUrl } from '../../utils/claudeHandoff.js';
import HrHistoryView from './components/HrHistoryView.jsx';

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

function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs} שניות`;
  if (secs === 0) return `${mins} דקות`;
  return `${mins} דקות ו-${secs} שניות`;
}

function modesText(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return '';
  return ids.map((id) => getModeById(id)?.label || id).join(', ');
}

function sessionTimestamp(s) {
  return s.clientTs || s.endedAt || s.startedAtClient || 0;
}

function Field({ label, value }) {
  return (
    <div className="emergency-detail-row">
      <span className="emergency-detail-label">{label}</span>
      <span className="emergency-detail-value">{value}</span>
    </div>
  );
}

export default function EmergencySessionDetail() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let alive = true;
    getEmergencySession(sessionId).then((data) => {
      if (!alive) return;
      if (!data) setNotFound(true);
      else setSession(data);
    });
    return () => { alive = false; };
  }, [sessionId]);

  const handleReprocess = () => {
    if (!session) return;
    const prompt = buildEmergencyPrompt(session);
    navigator.clipboard.writeText(prompt).catch(() => {});
    window.open(getClaudeProjectUrl(), '_blank', 'noopener');
  };

  return (
    <div className="tool-page ds2-themed">
      <ToolHeader title="פרטי סשן" backTo="/emergency/history" />
      <main className="tool-content">
        {!session && !notFound && <Loading />}
        {notFound && (
          <p className="ck-empty">הסשן לא נמצא.</p>
        )}
        {session && (
          <>
            <h2 className="emergency-detail-title">
              {formatHebrewDateTime(sessionTimestamp(session))}
            </h2>
            <div className="emergency-detail-fields">
              <Field
                label="רמת הפעלה"
                value={ACTIVATION_LABELS[session.activation] || session.activation || '—'}
              />
              <Field label="משך" value={formatDuration(session.durationSeconds)} />
              {modesText(session.modesIdentified) && (
                <Field label="מודים שזיהיתי" value={modesText(session.modesIdentified)} />
              )}
              {session.breathingNote && (
                <Field label="הערת נשימה" value={session.breathingNote} />
              )}
              <Field
                label="ציון סגירה"
                value={session.closingScore == null ? '—' : `${session.closingScore}/10`}
              />
              {session.note && (
                <Field label="הערה אישית" value={session.note} />
              )}
            </div>
            {session.hrTrack?.sessionId && (
              <HrHistoryView sessionId={session.hrTrack.sessionId} />
            )}
            <button
              type="button"
              className="emergency-detail-reprocess"
              onClick={handleReprocess}
            >
              לעבד מחדש את הסשן
            </button>
          </>
        )}
      </main>
    </div>
  );
}
