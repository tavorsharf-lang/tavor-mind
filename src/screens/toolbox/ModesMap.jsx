import { useState } from 'react';
import ToolHeader from './components/ToolHeader.jsx';
import { coreMode, protectorModes, healthyAdult, fourAxes } from '../../data/modes.js';

export default function ModesMap() {
  const [openSet, setOpenSet] = useState(new Set());

  const toggle = (id) => {
    const next = new Set(openSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpenSet(next);
  };

  return (
    <div className="tool-page ds2-themed">
      <ToolHeader
        title="5 הקולות שלך"
        subtitle="המבוגר הבריא רואה. המגנים מגינים. הגרעין מחכה שיראו אותו."
      />
      <main className="tool-content">
        <div className="hier-flow">
          {/* Witness */}
          <section className="hier-section">
            <WitnessCard mode={healthyAdult} open={openSet.has(healthyAdult.id)} onToggle={() => toggle(healthyAdult.id)} />
          </section>

          <div className="hier-connector" aria-hidden="true" />

          {/* Protectors */}
          <section className="hier-section">
            <h3 className="hier-section-label">4 המגנים</h3>
            <ul className="protector-list">
              {protectorModes.map((m) => (
                <ProtectorCard key={m.id} mode={m} open={openSet.has(m.id)} onToggle={() => toggle(m.id)} />
              ))}
            </ul>
          </section>

          <div className="hier-connector" aria-hidden="true" />

          {/* Core */}
          <section className="hier-section">
            <h3 className="hier-section-label">הגרעין</h3>
            <CoreCard mode={coreMode} open={openSet.has(coreMode.id)} onToggle={() => toggle(coreMode.id)} />
          </section>
        </div>

        <hr className="section-rule" />

        <section className="axes-section">
          <h2 className="section-title">{fourAxes.title}</h2>
          <p className="section-intro">{fourAxes.intro}</p>
          <ol className="axis-list">
            {fourAxes.axes.map((a) => (
              <li key={a.n} className="axis-card">
                <span className="axis-num">{a.n}</span>
                <div className="axis-text">
                  <h3 className="axis-title">{a.title}</h3>
                  <p className="axis-body">{a.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}

function WitnessCard({ mode, open, onToggle }) {
  return (
    <article className={`witness-card ${open ? 'is-open' : ''}`} style={{ '--mode-color': mode.color }}>
      <span className="hier-chip witness-chip">{mode.subtitle}</span>
      <button type="button" className="witness-toggle" onClick={onToggle} aria-expanded={open}>
        <h3 className="witness-label">{mode.label}</h3>
        <p className="witness-cue">{mode.cue}</p>
      </button>
      <div className="witness-detail-wrap">
        <div className="witness-detail">
          <DetailRow label="תפקיד:">{mode.role}</DetailRow>
          {mode.description && <DetailRow label="תיאור:">{mode.description}</DetailRow>}
          <div className="mode-alt-callout">
            <h4 className="detail-label">איך הוא נכנס</h4>
            <p>{mode.healthy_alternative}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProtectorCard({ mode, open, onToggle }) {
  return (
    <li className={`mode-tile protector-card ${open ? 'is-open' : ''}`} style={{ '--mode-color': mode.color }}>
      <button type="button" className="mode-tile-toggle" onClick={onToggle} aria-expanded={open}>
        <h3 className="mode-tile-label">{mode.label}</h3>
        <p className="mode-tile-role">{mode.role}</p>
        <p className="mode-tile-cue">{mode.cue}</p>
      </button>
      <div className="mode-tile-detail-wrap">
        <div className="mode-tile-detail">
          <DetailRow label="ניזון מ:">{mode.fed_by}</DetailRow>
          <DetailRow label="טריגרים:">
            <div className="chip-row">
              {mode.triggers.map((t, i) => <span key={i} className="chip">{t}</span>)}
            </div>
          </DetailRow>
          <DetailRow label="תגובה אוטומטית:">{mode.automatic_response}</DetailRow>
          <div className="mode-alt-callout">
            <h4 className="detail-label">חלופה בריאה</h4>
            <p>{mode.healthy_alternative}</p>
          </div>
        </div>
      </div>
    </li>
  );
}

function CoreCard({ mode, open, onToggle }) {
  return (
    <article className={`core-card ${open ? 'is-open' : ''}`} style={{ '--mode-color': mode.color }}>
      <span className="hier-chip core-chip">הילד הגלותי</span>
      <button type="button" className="core-toggle" onClick={onToggle} aria-expanded={open}>
        <h3 className="core-label">{mode.label}</h3>
        <p className="core-role">{mode.role}</p>
        <p className="core-cue">{mode.cue}</p>
      </button>
      <div className="core-detail-wrap">
        <div className="core-detail">
          {mode.description && <DetailRow label="תיאור:">{mode.description}</DetailRow>}
          <div className="core-needs-callout">
            <h4 className="detail-label">מה הוא צריך</h4>
            <p>{mode.what_he_needs}</p>
          </div>
          <DetailRow label="טריגרים:">
            <div className="chip-row">
              {mode.triggers.map((t, i) => <span key={i} className="chip">{t}</span>)}
            </div>
          </DetailRow>
          <div className="mode-alt-callout">
            <h4 className="detail-label">איך נותנים לו מקום</h4>
            <p>{mode.healthy_response}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function DetailRow({ label, children }) {
  return (
    <div className="detail-row">
      <h4 className="detail-label">{label}</h4>
      {typeof children === 'string' ? <p>{children}</p> : children}
    </div>
  );
}
