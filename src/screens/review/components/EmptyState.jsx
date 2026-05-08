import { useNavigate } from 'react-router-dom';

function HorizonGlyph() {
  return (
    <svg
      className="review-empty-glyph"
      width="72"
      height="56"
      viewBox="0 0 72 56"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="36" cy="22" r="7" opacity="0.45" />
      <line x1="8" y1="40" x2="64" y2="40" opacity="0.55" />
      <line x1="18" y1="46" x2="54" y2="46" opacity="0.25" />
    </svg>
  );
}

export default function EmptyState({ inline = false, message }) {
  const navigate = useNavigate();
  if (inline) {
    return (
      <div className="review-empty-inline">
        <p>{message || 'עוד אין מספיק דאטה כאן. ייקח כמה ניתוחים נוספים כדי לראות דפוס.'}</p>
      </div>
    );
  }
  return (
    <div className="review-empty-full">
      <HorizonGlyph />
      <p className="review-empty-text">
        אין עדיין מספיק כדי לראות דפוס.
      </p>
      <p className="review-empty-sub">
        השלם עוד צ'ק-אינים, השתמש בכלים, או ייבא ניתוחים — והמראה תתחיל לדבר.
      </p>
      <div className="review-empty-actions">
        <button type="button" className="repo-import-btn" onClick={() => navigate('/repository/import')}>+ ייבא ניתוח</button>
        <button type="button" className="soft-btn soft-btn-secondary" onClick={() => navigate('/checkin')}>צ'ק-אין יומי</button>
        <button type="button" className="soft-btn soft-btn-secondary" onClick={() => navigate('/tools')}>כלים פנימיים</button>
      </div>
    </div>
  );
}
