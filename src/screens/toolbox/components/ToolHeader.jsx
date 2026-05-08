import { useNavigate } from 'react-router-dom';

export default function ToolHeader({ title, subtitle, subtitleItalic = false, backTo = '/toolbox' }) {
  const navigate = useNavigate();
  return (
    <header className="tool-header">
      <button
        type="button"
        className="tool-back"
        aria-label="חזרה"
        onClick={() => navigate(backTo)}
      >
        <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </button>
      <div className="tool-header-text">
        <h1 className="tool-title">{title}</h1>
        {subtitle && <p className={`tool-subtitle ${subtitleItalic ? 'is-italic' : ''}`}>{subtitle}</p>}
      </div>
    </header>
  );
}
