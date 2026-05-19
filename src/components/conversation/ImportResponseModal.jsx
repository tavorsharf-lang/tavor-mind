import { useState } from 'react';
import Modal from '../ui/Modal.jsx';

// Modal for pasting Claude's response. Tries to JSON.parse; on success stores
// the parsed payload. On failure stores rawText only with a parse error so
// the user is never blocked.

function messageForResult(result) {
  if (!result) return 'שגיאה לא ידועה בשמירה';
  switch (result.reason) {
    case 'no-uid':
      return 'אין משתמש מחובר — נסה לרענן את הדף';
    case 'offline':
      return 'אין חיבור — נסה שוב כשתחזור לרשת';
    case 'error': {
      const code = result.code ? ` [${result.code}]` : '';
      const msg = result.message || 'שגיאה לא מוסברת';
      return `שמירה ב-Firebase נכשלה${code}: ${msg}`;
    }
    default:
      return `שגיאה: ${result.reason || 'unknown'}`;
  }
}

function tryParse(rawText) {
  const trimmed = (rawText || '').trim();
  if (!trimmed) {
    return { payload: null, parseError: 'empty', warning: null };
  }
  try {
    const parsed = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { payload: null, parseError: 'not_an_object', warning: null };
    }
    const missing = [];
    if (!parsed.session_type) missing.push('session_type');
    if (parsed.generated_at == null) missing.push('generated_at');
    const warning = missing.length ? `missing:${missing.join(',')}` : null;
    return { payload: parsed, parseError: null, warning };
  } catch (err) {
    return { payload: null, parseError: err?.message || 'invalid_json', warning: null };
  }
}

export default function ImportResponseModal({ open, onClose, onSave }) {
  const [rawText, setRawText] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const reset = () => {
    setRawText('');
    setFeedback(null);
  };

  const close = () => {
    if (busy) return;
    reset();
    onClose();
  };

  const handleSave = async () => {
    if (!rawText.trim()) {
      setFeedback({ kind: 'error', text: 'הדבק טקסט תחילה' });
      return;
    }
    setBusy(true);

    // Parse and save are two independent layers. A parse failure is NOT a
    // save failure — we still persist rawText so the user never loses what
    // they pasted. Parse outcome is folded into the saved record as
    // payload/parseError; the save itself is what determines UI success.
    const { payload, parseError, warning } = tryParse(rawText);
    const importedResponse = {
      importedAt: Date.now(),
      rawText,
      payload,
      parseError,
      warning: warning || undefined,
    };

    try {
      const result = await onSave(importedResponse);
      if (result?.ok) {
        setBusy(false);
        reset();
        onClose();
        return;
      }
      // Save did not succeed — surface a reason-specific message.
      console.error('[ImportResponseModal] save returned non-ok:', result);
      const text = messageForResult(result);
      setFeedback({ kind: 'error', text });
      setBusy(false);
    } catch (err) {
      console.error('[ImportResponseModal] save threw:', err);
      const text = err?.message
        ? `שגיאה: ${err.message}`
        : 'שגיאה לא צפויה בשמירה';
      setFeedback({ kind: 'error', text });
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={close} ariaLabel="ייבוא תגובה מקלוד">
      <div className="cs-import-modal">
        <h2 className="cs-import-title">ייבוא תגובה מקלוד</h2>
        <p className="cs-import-help">הדבק את התגובה. אם זה JSON תקין הוא ייפרס אוטומטית; אחרת יישמר טקסט גולמי.</p>
        <textarea
          className="cs-text-input cs-import-textarea"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={10}
          placeholder='{"session_type":"...","generated_at":..., ...}'
        />
        {feedback && (
          <div className={`cs-import-feedback cs-feedback-${feedback.kind}`}>{feedback.text}</div>
        )}
        <div className="cs-import-actions">
          <button type="button" className="cs-btn cs-btn-ghost" onClick={close} disabled={busy}>
            ביטול
          </button>
          <button type="button" className="cs-btn cs-btn-primary" onClick={handleSave} disabled={busy}>
            {busy ? 'שומר…' : 'שמור'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
