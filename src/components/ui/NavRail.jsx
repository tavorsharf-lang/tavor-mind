import { useLocation, useNavigate } from 'react-router-dom';
import { useNav } from '../../utils/navContext.jsx';

export default function NavRail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { back } = useNav();

  if (location.pathname === '/') return null;

  const goBack = () => {
    if (typeof back === 'function') {
      back();
      return;
    }
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="ds2-navrail" aria-label="ניווט גלובלי">
      <button
        type="button"
        className="ds2-navrail-btn"
        aria-label="הקודם"
        title="הקודם"
        onClick={goBack}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </button>
      <span className="ds2-navrail-divider" aria-hidden="true" />
      <button
        type="button"
        className="ds2-navrail-btn"
        aria-label="חזרה לעמוד הבית"
        title="בית"
        onClick={() => navigate('/')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 11 L12 4 L20 11" />
          <path d="M6 10 V20 H18 V10" />
        </svg>
      </button>
    </nav>
  );
}
