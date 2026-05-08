import { useState } from 'react';
import PhaseHeader from './components/PhaseHeader.jsx';
import SoftButton from './components/SoftButton.jsx';
import LetterModal from './components/LetterModal.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { EMERGENCY_TO_LETTER } from '../../data/emergencyLetterMap.js';

function moodForScore(s) {
  if (s <= 3) return 'עדיין כבד';
  if (s <= 6) return 'מתחיל להירגע';
  if (s <= 8) return 'קל יותר';
  return 'במקום טוב';
}

// Stage A = calm finish (didn't analyze). Stage B = analyzed (offers Claude handoff).
// Stage label and progress dots adapt accordingly.
export default function Phase10Closing({
  activation,
  analyzed,
  score,
  setScore,
  note,
  setNote,
  onFinish,
  onContinueWithClaude,
  onExit,
  savingState,
}) {
  const [showCallModal, setShowCallModal] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const letter = activation ? EMERGENCY_TO_LETTER[activation] : null;
  const saving = savingState === 'saving';
  const saved = savingState === 'saved';
  const inFlight = saving || saved;

  const stageLabel = analyzed ? 'שלב 2 — לנתח' : 'שלב 1 — להירגע';
  const total = analyzed ? 10 : 7;
  const phase = analyzed ? 10 : 7;

  return (
    <div className="phase phase-closing">
      <PhaseHeader phase={phase} total={total} stageLabel={stageLabel} onExit={onExit} />
      <main className="phase-content">
        <h1 className="phase-title">איך אתה עכשיו?</h1>

        <div className="score-mood" key={moodForScore(score)} aria-hidden="true">
          {moodForScore(score)}
        </div>
        <div className="score-display" aria-hidden="true">{score}</div>

        <div className="score-slider-wrap">
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value, 10))}
            className="score-slider"
            aria-label="איך אתה עכשיו, מ-1 עד 10"
          />
          <div className="score-labels">
            <span className="score-label-low">עדיין קשה מאוד</span>
            <span className="score-label-high">הרבה יותר טוב</span>
          </div>
        </div>

        <label className="note-label">
          משהו שתרצה לכתוב? (לא חובה)
          <textarea
            className="note-textarea"
            rows={3}
            placeholder="מה קרה? מה עזר? מה לא?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
      </main>

      <footer className="phase-footer phase-footer-stack">
        {!analyzed && letter && (
          <div className="phase-letter">
            <p className="phase-letter-lead">או — להזכיר לעצמי מה כבר יש:</p>
            <button
              type="button"
              className="phase-letter-card"
              onClick={() => setShowLetter(true)}
              disabled={inFlight}
            >
              <span className="phase-letter-name">{letter.title}</span>
              <span className="phase-letter-question">{letter.subtitle}</span>
            </button>
          </div>
        )}
        {analyzed && onContinueWithClaude && (
          <button
            type="button"
            className="claude-handoff-btn"
            onClick={onContinueWithClaude}
            disabled={inFlight}
          >
            <span className="claude-handoff-primary">המשך לעבוד עם זה</span>
            <span className="claude-handoff-secondary">פותח שיחה חדשה עם Claude</span>
          </button>
        )}
        <SoftButton onClick={onFinish} disabled={inFlight}>
          {saving ? (
            <span className="soft-btn-status">
              <span className="soft-btn-pulse" aria-hidden="true" />
              <span>שומר…</span>
            </span>
          ) : saved ? (
            <span className="soft-btn-status">
              <svg className="soft-btn-check" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="5 12 10 17 19 7" />
              </svg>
              <span>נשמר</span>
            </span>
          ) : 'סיימתי'}
        </SoftButton>
        <button type="button" className="link-btn" onClick={() => setShowCallModal(true)}>
          אני צריך לדבר עם מישהו
        </button>
      </footer>

      <Modal
        open={showCallModal}
        onClose={() => setShowCallModal(false)}
        ariaLabel="רשימת אנשים לקריאה"
      >
        <div className="modal-call">
          <h3 className="modal-title">אנשים שיענו לך</h3>
          <ul className="modal-call-list">
            <li>
              <a href="tel:0527501671" className="modal-call-item">
                <span className="modal-call-name">רועי</span>
                <span className="modal-call-phone">052-750-1671</span>
              </a>
            </li>
            <li>
              <a href="tel:0528017155" className="modal-call-item">
                <span className="modal-call-name">נעם</span>
                <span className="modal-call-phone">052-801-7155</span>
              </a>
            </li>
            <li>
              <a href="tel:0552284567" className="modal-call-item">
                <span className="modal-call-name">דן</span>
                <span className="modal-call-phone">055-228-4567</span>
              </a>
            </li>
            <li>
              <a href="tel:0543388417" className="modal-call-item">
                <span className="modal-call-name">יובל</span>
                <span className="modal-call-phone">054-338-8417</span>
              </a>
            </li>
          </ul>
          <p className="modal-hint">אחד מהם יענה. תתקשר.</p>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => setShowCallModal(false)}
            aria-label="סגור"
          >
            סגור
          </button>
        </div>
      </Modal>

      <LetterModal open={showLetter} onClose={() => setShowLetter(false)} />
    </div>
  );
}
