import { useEffect } from 'react';
import { Modal } from './Modal.jsx';

const AUTO_CLOSE_MS = 1100;

export function SavedConfirm({ open, onClose, message = 'נשמר' }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, AUTO_CLOSE_MS);
    return () => clearTimeout(t);
  }, [open, onClose]);

  return (
    <Modal open={open} onClose={onClose} ariaLabel={message}>
      <div className="saved-confirm" role="status" aria-live="polite">
        <div className="saved-confirm-mark" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12.5L10 17.5L19 7.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="saved-confirm-text">{message}</p>
      </div>
    </Modal>
  );
}

export default SavedConfirm;
