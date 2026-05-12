import { useNavigate } from 'react-router-dom';
import { ChevronStart } from '../../../components/icons/system.jsx';

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
        <ChevronStart size={22} />
      </button>
      <div className="tool-header-text">
        <h1 className="tool-title">{title}</h1>
        {subtitle && <p className={`tool-subtitle ${subtitleItalic ? 'is-italic' : ''}`}>{subtitle}</p>}
      </div>
    </header>
  );
}
