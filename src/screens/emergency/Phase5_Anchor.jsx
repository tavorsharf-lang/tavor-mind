import { useState } from 'react';
import PhaseHeader from './components/PhaseHeader.jsx';
import SoftButton from './components/SoftButton.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { anchors } from '../../data/anchors.js';

const STAGE_TOTAL = 7;
const STAGE_LABEL = 'שלב 1 — להירגע';

export default function Phase5Anchor({ onNext, onExit }) {
  const [openImage, setOpenImage] = useState(null);

  return (
    <div className="phase phase-anchor">
      <PhaseHeader phase={5} total={STAGE_TOTAL} stageLabel={STAGE_LABEL} onExit={onExit} />
      <main className="phase-content">
        <h1 className="phase-title">תזכורות — דברים שאמיתיים גם עכשיו</h1>
        <ul className="anchor-list">
          {anchors.map((a) => (
            <li key={a.id} className="anchor-card">
              <span className="anchor-icon" aria-hidden="true">{a.icon}</span>
              <div className="anchor-text">
                <h3 className="anchor-title">{a.title}</h3>
                <p className="anchor-body">{a.body}</p>
                {a.image && (
                  <button
                    type="button"
                    className="link-btn anchor-image-btn"
                    onClick={() => setOpenImage(a.image)}
                  >
                    הצג תמונה
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </main>
      <footer className="phase-footer">
        <SoftButton onClick={onNext}>הלאה</SoftButton>
      </footer>

      <Modal
        open={!!openImage}
        onClose={() => setOpenImage(null)}
        ariaLabel={openImage?.alt || 'תמונה'}
      >
        {openImage && (
          <div className="anchor-image-modal">
            <img src={openImage.src} alt={openImage.alt} />
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setOpenImage(null)}
              aria-label="סגור"
            >
              סגור
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
