import { useState } from 'react';
import Modal from '../../components/ui/Modal.jsx';
import { anchors } from '../../data/anchors.js';
import { ActionAnchor as Phase5AnchorIcon } from '../../components/icons/system.jsx';

export default function Phase5Anchor({ onNext, onExit }) {
  const [openImage, setOpenImage] = useState(null);

  return (
    <div className="ds3-screen">
      <div className="ds3-topbar">
        <span className="ds3-topbar-spacer" />
        <span className="ds3-topbar-label">
          <span className="ds3-topbar-label-icon color-tone-body" aria-hidden="true"><Phase5AnchorIcon /></span>
          שלב 1 · להירגע · עוגנים
        </span>
        <button type="button" className="ds3-topbar-back" aria-label="צא" onClick={onExit}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <main className="ds3-screen-content">
        <div className="ds3-stack-2" style={{ marginTop: 8 }}>
          <p className="ds3-caption ds3-text-muted">דברים שאמיתיים גם עכשיו</p>
          <h1 className="ds3-h1">תזכורות</h1>
        </div>

        <div className="ds3-stack-3" style={{ marginTop: 18 }}>
          {anchors.map((a) => (
            <div key={a.id} className="ds3-card-loose" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span aria-hidden="true" style={{ fontSize: 28, flexShrink: 0, marginTop: 2 }}>
                {a.icon}
              </span>
              <div className="ds3-stack-2" style={{ flex: 1 }}>
                <h3 className="ds3-h3" style={{ margin: 0 }}>{a.title}</h3>
                <p className="ds3-body ds3-text-muted" style={{ margin: 0, lineHeight: 1.55 }}>{a.body}</p>
                {a.image && (
                  <button
                    type="button"
                    className="ds3-btn-quiet"
                    style={{
                      height: 'auto', width: 'auto', padding: '6px 0',
                      fontSize: 14, color: 'var(--lichen)',
                      textDecoration: 'underline', textUnderlineOffset: 3,
                      alignSelf: 'flex-start',
                    }}
                    onClick={() => setOpenImage(a.image)}
                  >
                    הצג תמונה
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="ds3-screen-footer">
        <button type="button" className="ds3-btn ds3-btn-primary" onClick={onNext}>הלאה</button>
      </footer>

      <Modal
        open={!!openImage}
        onClose={() => setOpenImage(null)}
        ariaLabel={openImage?.alt || 'תמונה'}
      >
        {openImage && (
          <div style={{ background: '#000', borderRadius: 22, overflow: 'hidden', position: 'relative' }}>
            <img src={openImage.src} alt={openImage.alt} style={{ width: '100%', display: 'block' }} />
            <button
              type="button"
              onClick={() => setOpenImage(null)}
              aria-label="סגור"
              style={{
                position: 'absolute', top: 12, left: 12,
                width: 36, height: 36, borderRadius: 18,
                background: 'rgba(0,0,0,0.6)', color: '#fff',
                border: 'none', cursor: 'pointer',
                display: 'grid', placeItems: 'center',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
              }}
            >
              ✕
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
