import { Modal } from '../../../components/ui/Modal.jsx';
import { letterMeta, letterDefault } from '../../../data/selfLetter.js';

export default function LetterModal({ open, onClose }) {
  const paragraphs = letterDefault.trim().split(/\n\n+/);
  return (
    <Modal open={open} onClose={onClose} ariaLabel={letterMeta.title}>
      <div className="modal-letter">
        <h3 className="modal-title">{letterMeta.title}</h3>
        <p className="modal-letter-context">{letterMeta.context}</p>
        <div className="modal-letter-body">
          {paragraphs.map((p, i) => (
            <p key={i} className="modal-letter-paragraph">{p}</p>
          ))}
        </div>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="סגור"
        >
          סיימתי לקרוא
        </button>
      </div>
    </Modal>
  );
}
