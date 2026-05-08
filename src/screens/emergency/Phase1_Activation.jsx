import { useNavigate } from 'react-router-dom';
import PhaseHeader from './components/PhaseHeader.jsx';

const OPTIONS = [
  { id: 'hyper', label: 'הופעלתי',                   subtitle: 'לב פועם מהר, מחשבות רצות, אי-שקט' },
  { id: 'hypo',  label: 'מרוקן',                     subtitle: 'כבדות, ניתוק רגשי, אין כוח לזוז' },
  { id: 'mid',   label: 'עוד טריגר אחד — ואני מופעל', subtitle: 'מוצף אבל מתפקד, על הסף' },
];

export default function Phase1Activation({ onPick, onSkip, onExit }) {
  const navigate = useNavigate();
  return (
    <div className="phase phase-activation">
      <PhaseHeader
        phase={1}
        total={7}
        stageLabel="שלב 1 — להירגע"
        onExit={onExit}
        extra={
          <button
            type="button"
            className="phase-history-link"
            onClick={() => navigate('/emergency/history')}
          >
            להיסטוריה
          </button>
        }
      />
      <main className="phase-content">
        <h1 className="phase-title">איפה אני עכשיו?</h1>
        <div className="activation-options">
          {OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className="activation-btn"
              onClick={() => onPick(opt.id)}
            >
              <span className="activation-label">{opt.label}</span>
              <span className="activation-sub">{opt.subtitle}</span>
            </button>
          ))}
        </div>
        <p className="phase-footnote">אין תשובה לא נכונה</p>
      </main>
      <footer className="phase-footer">
        <button type="button" className="link-btn phase-skip" onClick={onSkip}>
          דלג לשלב הבא
        </button>
      </footer>
    </div>
  );
}
