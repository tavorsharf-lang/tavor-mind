import { Modal } from './Modal.jsx';

const CONTACTS = [
  { name: 'רועי', phone: '0527501671' },
  { name: 'נעם',  phone: '0528017155' },
  { name: 'דן',   phone: '0552284567' },
  { name: 'יובל', phone: '0543388417' },
];

function formatPhone(p) {
  return `${p.slice(0, 3)}-${p.slice(3, 6)}-${p.slice(6)}`;
}

export default function CallSomeoneModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} ariaLabel="רשימת אנשים לקריאה">
      <div className="modal-call">
        <h3 className="modal-title">אנשים שיענו לך</h3>
        <ul className="modal-call-list">
          {CONTACTS.map((c) => (
            <li key={c.phone}>
              <a href={`tel:${c.phone}`} className="modal-call-item">
                <span className="modal-call-name">{c.name}</span>
                <span className="modal-call-phone">{formatPhone(c.phone)}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="modal-hint">אחד מהם יענה. תתקשר.</p>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="סגור"
        >
          סגור
        </button>
      </div>
    </Modal>
  );
}
