import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ToolHeader from '../toolbox/components/ToolHeader.jsx';
import SoftButton from '../emergency/components/SoftButton.jsx';
import SavedConfirm from '../../components/ui/SavedConfirm.jsx';
import { modes, getModeById, resolveModeId } from '../../data/modes.js';

export default function ModeCheck() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState(() => {
    const incoming = location.state?.selectedModes;
    if (!Array.isArray(incoming)) return new Set();
    return new Set(incoming.map(resolveModeId).filter(Boolean));
  });
  const [note, setNote] = useState('');
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleSave = () => {
    setSaving(true);
    setSaving(false);
    setSaved(true);
  };

  const selectedModes = Array.from(selected)
    .map((id) => getModeById(id))
    .filter(Boolean);

  return (
    <div className="tool-page ds2-themed">
      <ToolHeader
        title="איזה קול מדבר עכשיו?"
        subtitle="סמן אחד או יותר - מהירה, לא מחייב הסבר"
        backTo="/tools"
      />
      <main className="tool-content">
        <ul className="mode-pick-list">
          {modes.map((m) => {
            const isSel = selected.has(m.id);
            return (
              <li key={m.id}>
                <button
                  type="button"
                  className={`mode-pick ${isSel ? 'is-selected' : ''}`}
                  style={{ '--mode-color': m.color }}
                  aria-pressed={isSel}
                  onClick={() => toggle(m.id)}
                >
                  <span className="mode-pick-label">{m.label}</span>
                  <span className="mode-pick-cue">{m.cue}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <label className="ck-field-label">
          אם בא לך לכתוב מה הוא אומר עכשיו...
          <textarea
            className="ck-textarea"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        {selected.size > 0 && (
          <button
            type="button"
            className="link-btn alt-toggle-btn"
            onClick={() => setShowAlternatives(!showAlternatives)}
          >
            {showAlternatives ? 'סגור' : 'מה לעשות עכשיו?'}
          </button>
        )}
        {showAlternatives && (
          <ul className="alt-list">
            {selectedModes.map((m) => (
              <li key={m.id} className="alt-card" style={{ '--mode-color': m.color }}>
                <h4 className="alt-label">{m.label}</h4>
                <p className="alt-text">{m.healthy_alternative}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
      <footer className="phase-footer">
        <SoftButton onClick={handleSave} disabled={saving || saved}>
          {saving ? 'שומר…' : 'שמור'}
        </SoftButton>
      </footer>
      <SavedConfirm
        open={saved}
        onClose={() => navigate('/tools', { replace: true })}
      />
    </div>
  );
}
