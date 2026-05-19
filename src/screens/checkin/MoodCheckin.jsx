import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CheckinHeader from './components/CheckinHeader.jsx';
import MoodPhase1Scope from './components/MoodPhase1_Scope.jsx';
import MoodPhase2Slider from './components/MoodPhase2_Slider.jsx';
import MoodPhase3Emotions from './components/MoodPhase3_Emotions.jsx';
import MoodPhase4Factors from './components/MoodPhase4_Factors.jsx';
import SoftButton from '../emergency/components/SoftButton.jsx';
import SavedConfirm from '../../components/ui/SavedConfirm.jsx';
import { saveMoodCheckin } from '../../utils/checkinStorage.js';
import { useBackHandler } from '../../utils/navContext.jsx';
import { incrementCounts } from '../../utils/optionFrequency.js';

const MAX_PHASE = 4;

export default function MoodCheckin() {
  const navigate = useNavigate();
  const location = useLocation();
  const presetScope = location.state?.scope ?? null;
  const minPhase = presetScope ? 2 : 1;
  const total = presetScope ? 3 : MAX_PHASE;
  const [phase, setPhase] = useState(minPhase);
  const [scope, setScope] = useState(presetScope);
  const [valence, setValence] = useState(4);
  const [selectedEmotions, setSelectedEmotions] = useState(() => new Set());
  const [selectedFactors, setSelectedFactors] = useState(() => new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const exit = () => navigate('/checkin', { replace: true });

  useBackHandler(() => {
    if (phase > minPhase) setPhase(phase - 1);
    else navigate(-1);
  });

  const handleSave = async () => {
    setSaving(true);
    await saveMoodCheckin({
      scope,
      valence,
      emotions: Array.from(selectedEmotions),
      factors: Array.from(selectedFactors),
    });
    incrementCounts('emotions', Array.from(selectedEmotions));
    incrementCounts('life_factors', Array.from(selectedFactors));
    setSaving(false);
    setSaved(true);
  };

  const advance = () => {
    if (phase === 1 && !scope) setScope('moment');
    setPhase(phase + 1);
  };

  return (
    <div className="phase ck-step mood-checkin ds2-themed">
      <CheckinHeader step={presetScope ? phase - 1 : phase} total={total} onExit={exit} />
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
        {phase === 4 && (
          <MoodPhase4Factors
            value={selectedFactors}
            onChange={setSelectedFactors}
          />
        )}
      </main>
      <footer className="phase-footer">
        {phase < MAX_PHASE && (
          <SoftButton onClick={advance}>הבא</SoftButton>
        )}
        {phase === MAX_PHASE && (
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
