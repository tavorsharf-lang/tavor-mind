import { Modal } from '../../../components/ui/Modal.jsx';
import { letterMeta, letterDefault } from '../../../data/selfLetter.js';

export default function LetterModal({ open, onClose }) {
  const titleId = 'letter-modal-title';
  const paragraphs = letterDefault.trim().split(/\n\n+/);
  return (
    <Modal open={open} onClose={onClose} ariaLabel={letterMeta.title}>
      <div className="modal-letter" aria-labelledby={titleId}>
        <h3 id={titleId} className="modal-title">{letterMeta.title}</h3>
        <p className="modal-letter-context">{letterMeta.context}</p>
        <div className="modal-letter-body modal-body">
          {paragraphs.map((p, i) => (
            <p key={i} className="modal-letter-paragraph">{p}</p>
          ))}
        </div>
        <div className="modal-actions">
          <button
            type="button"
            className="ds3-btn ds3-btn-cream"
            onClick={onClose}
            aria-label="סגור"
          >
            סיימתי לקרוא
          </button>
        </div>
      </div>
    </Modal>
  );
}
