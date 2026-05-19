import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ToolHeader from '../../screens/toolbox/components/ToolHeader.jsx';
import { Loading } from '../../components/ui/Loading.jsx';
import ImportResponseModal from '../../components/conversation/ImportResponseModal.jsx';
import { getSessionType } from '../../config/sessionTypes.js';
import { buildSessionPrompt } from '../../services/promptBuilder.js';
import {
  getSession,
  markExported,
  saveImportedResponse,
} from '../../services/conversationSessionsService.js';
import { copyAndOpen, CLAUDE_CONVERSATION_PROJECT_URL } from '../../utils/handoffToClaude.js';

export default function SessionResult() {
  const { type, sessionId } = useParams();
  const navigate = useNavigate();
  const def = getSessionType(type);

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [exportFeedback, setExportFeedback] = useState(null);

  const reload = () => {
    setLoading(true);
    getSession(sessionId).then((s) => {
      setSession(s);
      setLoading(false);
    });
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const prompt = useMemo(() => {
    if (!session) return '';
    const createdAtIso = session.createdAt
      ? new Date(session.createdAt).toISOString()
      : null;
    return buildSessionPrompt({
      type: session.type,
      variables: session.variables,
      meta: { createdAt: createdAtIso, sessionId: session.sessionId },
    });
  }, [session]);

  if (loading) {
    return (
      <div className="tool-page ds2-themed">
        <ToolHeader title={def?.label || 'תוצאה'} subtitle="" backTo={`/sessions/${type}`} />
        <main className="tool-content"><Loading /></main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="tool-page ds2-themed">
        <ToolHeader title="לא נמצא" subtitle="הסשן לא קיים" backTo={`/sessions/${type}`} />
        <main className="tool-content"><p>הסשן הזה לא נמצא.</p></main>
      </div>
    );
  }

  const handleExport = () => {
    copyAndOpen(prompt, CLAUDE_CONVERSATION_PROJECT_URL);
    setExportFeedback('הפרומפט הועתק, נפתח טאב חדש לקלוד');
    markExported(sessionId).then(() => reload()).catch(() => {});
    setTimeout(() => setExportFeedback(null), 4000);
  };

  const handleImportSave = async (importedResponse) => {
    const res = await saveImportedResponse(sessionId, importedResponse);
    if (res?.ok || res?.reason === 'offline') {
      reload();
    }
    return res;
  };

  const hasImported = !!session.importedResponse;

  return (
    <div className="tool-page conversation-sessions-page ds2-themed">
      <ToolHeader
        title={def?.label || 'תוצאה'}
        subtitle="פרומפט מובנה מוכן לקלוד"
        backTo={`/sessions/${type}/history`}
      />
      <main className="tool-content">
        <section className="cs-result-section">
          <div className="cs-result-meta">
            {session.exportedAt && <span>יוצא: {formatTime(session.exportedAt)}</span>}
            {hasImported && <span>תגובה יובאה: {formatTime(session.importedResponse.importedAt)}</span>}
          </div>
          <pre className="cs-prompt-block" dir="rtl">{prompt}</pre>
        </section>

        <div className="cs-result-actions">
          <button type="button" className="cs-btn cs-btn-primary cs-btn-block" onClick={handleExport}>
            ייצא לקלוד
          </button>
          <button type="button" className="cs-btn cs-btn-ghost cs-btn-block" onClick={() => setImportOpen(true)}>
            {hasImported ? 'ייבא תגובה חדשה מקלוד' : 'ייבא תגובה מקלוד'}
          </button>
          {exportFeedback && <div className="cs-feedback-success cs-import-feedback">{exportFeedback}</div>}
        </div>

        {hasImported && (
          <section className="cs-imported-section">
            <h3 className="section-title cs-imported-title">תגובה שיובאה</h3>
            {session.importedResponse.parseError && (
              <div className="cs-imported-error">
                לא הצלחנו לפרסר JSON ({session.importedResponse.parseError}). שמרנו טקסט גולמי.
              </div>
            )}
            {session.importedResponse.warning && (
              <div className="cs-imported-warning">אזהרה: {session.importedResponse.warning}</div>
            )}
            <pre className="cs-imported-block" dir="rtl">
              {session.importedResponse.payload
                ? JSON.stringify(session.importedResponse.payload, null, 2)
                : session.importedResponse.rawText}
            </pre>
            <button
              type="button"
              className="cs-btn cs-btn-ghost"
              onClick={() => navigate('/review')}
            >
              צפה במראה ←
            </button>
          </section>
        )}
      </main>
      <ImportResponseModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSave={handleImportSave}
      />
    </div>
  );
}

function formatTime(ms) {
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
