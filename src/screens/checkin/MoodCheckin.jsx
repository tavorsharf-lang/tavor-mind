import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckinHeader from './components/CheckinHeader.jsx';
import MoodPhase1Scope from './components/MoodPhase1_Scope.jsx';
import MoodPhase2Slider from './components/MoodPhase2_Slider.jsx';
import MoodPhase3Emotions from './components/MoodPhase3_Emotions.jsx';
import SoftButton from '../emergency/components/SoftButton.jsx';
import SavedConfirm from '../../components/ui/SavedConfirm.jsx';
import { saveMoodCheckin } from '../../utils/checkinStorage.js';
import { useBackHandler } from '../../utils/navContext.jsx';

const TOTAL = 3;

export default function MoodCheckin() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(1);
  const [scope, setScope] = useState(null);
  const [valence, setValence] = useState(3);
  const [selectedEmotions, setSelectedEmotions] = useState(() => new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const exit = () => navigate('/checkin', { replace: true });

  useBackHandler(() => {
    if (phase > 1) setPhase(phase - 1);
    else navigate(-1);
  });

  const handleSave = async () => {
    setSaving(true);
    await saveMoodCheckin({
      scope,
      valence,
      emotions: Array.from(selectedEmotions),
    });
    setSaving(false);
    setSaved(true);
  };

  const canAdvance = phase === 1 ? !!scope : true;

  return (
    <div className="phase ck-step mood-checkin ds2-themed">
      <CheckinHeader step={phase} total={TOTAL} onExit={exit} />
      <main className="phase-content">
        {phase === 1 && <MoodPhase1Scope value={scope} onChange={setScope} />}
        {phase === 2 && <MoodPhase2Slider scope={scope} value={valence} onChange={setValence} />}
        {phase === 3 && (
          <MoodPhase3Emotions
            valence={valence}
            value={selectedEmotions}
            onChange={setSelectedEmotions}
          />
        )}
      </main>
      <footer className="phase-footer">
        {phase < TOTAL && (
          <SoftButton onClick={() => setPhase(phase + 1)} disabled={!canAdvance}>
            הבא
          </SoftButton>
        )}
        {phase === TOTAL && (
          <SoftButton onClick={handleSave} disabled={saving || saved}>
            {saving ? 'שומר…' : 'שמור'}
          </SoftButton>
        )}
      </footer>
      <SavedConfirm
        open={saved}
        onClose={() => navigate('/checkin', { replace: true })}
      />
    </div>
  );
}
