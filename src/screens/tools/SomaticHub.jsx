import { useNavigate } from 'react-router-dom';
import ToolHeader from '../toolbox/components/ToolHeader.jsx';
import { SOMATIC_EXERCISES } from '../../data/somatic.js';
import {
  ButterflyHugIcon,
  VagalHummingIcon,
} from '../../components/icons/index.jsx';
import {
  PhaseBreath as PhysioSighIcon,
  ActionAnchor as ColdAnchorIcon,
  PhaseSomatic as BodyScanIcon,
} from '../../components/icons/system.jsx';

const ICONS = {
  physio_sigh:   <PhysioSighIcon />,
  butterfly_hug: <ButterflyHugIcon />,
  cold_anchor:   <ColdAnchorIcon />,
  vagal_humming: <VagalHummingIcon />,
  body_scan:     <BodyScanIcon />,
};

export default function SomaticHub() {
  const navigate = useNavigate();
  return (
    <div className="tool-page ds2-themed">
      <ToolHeader
        title="ויסות בגוף"
        subtitle="תרגילים מהירים שמדברים ישירות לגוף - לפני שהראש מספיק להבין"
        backTo="/tools"
      />
      <main className="tool-content">
        <ul className="tools-list">
          {SOMATIC_EXERCISES.map((ex) => (
            <li key={ex.id}>
              <button
                type="button"
                className="tools-card"
                onClick={() => navigate(`/tools/somatic/${ex.id}`)}
              >
                <span className="tools-card-icon icon-tone-body" aria-hidden="true">{ICONS[ex.id]}</span>
                <span className="tools-card-text">
                  <span className="tools-card-title">{ex.title}</span>
                  <span className="tools-card-sub">{ex.subtitle}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="tools-history-link-wrap">
          <button type="button" className="link-btn tools-history-link" onClick={() => navigate('/tools/history')}>
            היסטוריה ←
          </button>
        </div>
      </main>
    </div>
  );
}
