import { useState } from 'react';
import ToolHeader from '../toolbox/components/ToolHeader.jsx';
import MeditationPlayer from '../emergency/components/MeditationPlayer.jsx';
import { MEDITATIONS } from '../../data/meditations.js';
import {
  MorningIcon,
  OnEdgeIcon,
  ActivatedIcon,
  DepletedIcon,
  MidBalanceIcon,
} from '../../components/icons/index.jsx';

// Map each recording id to a Phosphor Duotone category icon + tone.
// Categories match the meditation's intent, not just the title.
const CATEGORY = {
  'morning-short':   { icon: <MorningIcon />,     tone: 'warmth' },
  'morning-long':    { icon: <MorningIcon />,     tone: 'warmth' },
  'on-edge-short':   { icon: <OnEdgeIcon />,      tone: 'calm' },
  'activated-short': { icon: <ActivatedIcon />,   tone: 'crisis' },
  'depleted-short':  { icon: <DepletedIcon />,    tone: 'mind' },
  'mid':             { icon: <MidBalanceIcon />,  tone: 'warmth' },
  'hyper':           { icon: <ActivatedIcon />,   tone: 'crisis' },
  'hypo':            { icon: <DepletedIcon />,    tone: 'mind' },
};

export default function MindfulnessHub() {
  const [active, setActive] = useState(null);

  return (
    <div className="tool-page ds2-themed">
      <ToolHeader
        title="מיינדפולנס"
        subtitle="הקלטות מדיטציה לרגעי שקט, איזון, או חזרה לגוף"
        backTo="/"
      />
      <main className="tool-content">
        <ul className="tools-list">
          {MEDITATIONS.map((m) => {
            const cat = CATEGORY[m.id] || { icon: <MidBalanceIcon />, tone: 'calm' };
            return (
              <li key={m.id}>
                <button
                  type="button"
                  className="tools-card"
                  onClick={() => setActive(m)}
                  aria-label={`נגן: ${m.title}`}
                >
                  <span className={`tools-card-icon icon-tone-${cat.tone}`} aria-hidden="true">{cat.icon}</span>
                  <span className="tools-card-text">
                    <span className="tools-card-title">{m.title}</span>
                    <span className="tools-card-sub">{m.description || m.subtitle}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </main>

      {active && (
        <MeditationPlayer
          open={!!active}
          src={active.src}
          title={active.title}
          subtitle={active.subtitle}
          onClose={() => setActive(null)}
          onComplete={() => setActive(null)}
        />
      )}
    </div>
  );
}
