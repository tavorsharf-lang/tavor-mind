import { useEffect, useState } from 'react';

const DEFAULT_DURATION_MS = 6500;

export default function UndoToast({ message = 'נמחק', onUndo, onDismiss, durationMs = DEFAULT_DURATION_MS }) {
  const [visible, setVisible] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, durationMs);
    return () => clearTimeout(t);
  }, [visible, durationMs, onDismiss]);

  if (!visible) return null;

  const handleUndo = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onUndo?.();
    } finally {
      setBusy(false);
      setVisible(false);
    }
  };

  return (
    <div className="undo-toast" role="status" aria-live="polite">
      <span className="undo-toast-msg">{message}</span>
      <button
        type="button"
        className="undo-toast-action"
        onClick={handleUndo}
        disabled={busy}
      >
        {busy ? 'משחזר…' : 'בטל מחיקה'}
      </button>
    </div>
  );
}
