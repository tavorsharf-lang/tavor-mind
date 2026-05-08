import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Phase1Activation from './Phase1_Activation.jsx';
import Phase2Body from './Phase2_Body.jsx';
import Phase3Grounding from './Phase3_Grounding.jsx';
import Phase4Meditation from './Phase4_Meditation.jsx';
import Phase5Anchor from './Phase5_Anchor.jsx';
import Phase6Somatic from './Phase6_Somatic.jsx';
import Phase7Bridge from './Phase7_Bridge.jsx';
import Phase8Trigger from './Phase8_Trigger.jsx';
import Phase9Mode from './Phase9_Mode.jsx';
import Phase10Closing from './Phase10_Closing.jsx';
import {
  logEmergencySession,
  flushPendingSessions,
  logTriggerAnalysis,
  flushPendingTriggerAnalyses,
} from '../../utils/emergencyLog.js';
import { resolveModeId } from '../../data/modes.js';
import {
  buildEmergencyPrompt,
  buildTriggerAnalysisPrompt,
  getClaudeProjectUrl,
} from '../../utils/claudeHandoff.js';

const EMPTY_TRIGGER = {
  initialActivation: 5,
  event: '',
  sensations: [],
  thoughts: ['', '', ''],
  readBackFeeling: '',
  distortions: [],
  schemas: [],
  otherSchema: '',
  dominantSchema: null,
  childNeeds: '',
  healthyAdultMessage: '',
};

export default function EmergencyFlow() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(1);
  const [activation, setActivation] = useState(null);
  const [selectedModes, setSelectedModes] = useState(new Set());
  const [breathingNote, setBreathingNote] = useState('');
  const [score, setScore] = useState(5);
  const [note, setNote] = useState('');
  const [analyzed, setAnalyzed] = useState(false);
  const [trigger, setTrigger] = useState(EMPTY_TRIGGER);
  // When set, Phase3 grounding "next" returns to Phase 8 instead of advancing to Phase 4.
  const [groundingReturnTo, setGroundingReturnTo] = useState(null);
  // initialStep for Phase 8 — controls where Phase 8 starts when (re)mounted.
  const [triggerInitialStep, setTriggerInitialStep] = useState(0);
  const [savingState, setSavingState] = useState('idle');
  const startedAtRef = useRef(Date.now());

  useEffect(() => {
    flushPendingSessions().catch(() => {});
    flushPendingTriggerAnalyses().catch(() => {});
    const onOnline = () => {
      flushPendingSessions().catch(() => {});
      flushPendingTriggerAnalyses().catch(() => {});
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  // Emergency session payload — kept lean. Stage-2 detail goes to trigger_analyses.
  const buildSession = ({ partial = false } = {}) => {
    const startedAt = startedAtRef.current;
    const session = {
      activation,
      modesIdentified: Array.from(selectedModes).map(resolveModeId).filter(Boolean),
      breathingNote: breathingNote.trim() || null,
      closingScore: partial ? null : score,
      note: (note || '').trim() || null,
      durationSeconds: Math.round((Date.now() - startedAt) / 1000),
      startedAtClient: startedAt,
      stage2Completed: analyzed,
    };
    if (partial) {
      session.partial = true;
      session.lastPhase = phase;
    }
    return session;
  };

  // Trigger-analysis payload — full Stage 2 capture. Field names match the
  // buildTriggerAnalysisPrompt contract.
  const buildTriggerPayload = () => {
    const startedAt = startedAtRef.current;
    return {
      initialActivation: typeof trigger.initialActivation === 'number' ? trigger.initialActivation : null,
      event: trigger.event.trim() || null,
      bodySignals: trigger.sensations,
      thoughts: trigger.thoughts.map((t) => (t || '').trim()).filter(Boolean),
      readBackFeeling: trigger.readBackFeeling.trim() || null,
      distortions: trigger.distortions,
      schemas: trigger.schemas,
      otherSchemaText: trigger.otherSchema.trim() || null,
      dominantSchema: trigger.dominantSchema || null,
      childNeeds: trigger.childNeeds.trim() || null,
      healthyAdultMessage: trigger.healthyAdultMessage.trim() || null,
      identifiedModes: Array.from(selectedModes).map(resolveModeId).filter(Boolean),
      closingScore: score,
      closingNote: (note || '').trim() || null,
      durationSeconds: Math.round((Date.now() - startedAt) / 1000),
      startedAtClient: startedAt,
      activation,
    };
  };

  const persistAll = async () => {
    const ops = [logEmergencySession(buildSession())];
    if (analyzed) ops.push(logTriggerAnalysis(buildTriggerPayload()));
    const results = await Promise.all(ops);
    const allOk = results.every((r) => r?.ok);
    return { ok: allOk };
  };

  const handleFinish = async () => {
    setSavingState('saving');
    const result = await persistAll();
    setSavingState(result.ok ? 'saved' : 'offline');
    setTimeout(() => navigate('/', { replace: true }), result.ok ? 600 : 1400);
  };

  const handleContinueWithClaude = () => {
    const prompt = analyzed
      ? buildTriggerAnalysisPrompt(buildTriggerPayload())
      : buildEmergencyPrompt(buildSession());
    // No await before window.open — would break user gesture and pop-up would be blocked.
    navigator.clipboard.writeText(prompt).catch(() => {});
    window.open(getClaudeProjectUrl(), '_blank', 'noopener');
    handleFinish();
  };

  const handleSaveAndExit = async () => {
    if (savingState === 'saving') return;
    setSavingState('saving');
    const result = await logEmergencySession(buildSession({ partial: true }));
    // Partial trigger-analysis is also saved when applicable, so the rich state isn't lost.
    if (analyzed) {
      logTriggerAnalysis({ ...buildTriggerPayload(), partial: true, lastPhase: phase }).catch(() => {});
    }
    setSavingState(result.ok ? 'saved' : 'offline');
    setTimeout(() => navigate('/', { replace: true }), result.ok ? 400 : 1200);
  };

  // Phase 8 step 0 → grounding side-trip → return to Phase 8 step 1.
  const goToGroundingFromTrigger = () => {
    setGroundingReturnTo('trigger');
    setPhase(3);
  };

  return (
    <div className="emergency-flow ds2-themed">
      {savingState === 'offline' && (
        <div className="offline-toast" role="status">
          נשמר מקומית, יסונכרן כשתחזור לרשת
        </div>
      )}
      {phase === 1 && (
        <Phase1Activation
          onPick={(id) => { setActivation(id); setPhase(2); }}
          onSkip={() => { if (!activation) setActivation('mid'); setPhase(2); }}
          onExit={handleSaveAndExit}
        />
      )}
      {phase === 2 && (
        <Phase2Body
          activation={activation}
          breathingNote={breathingNote}
          setBreathingNote={setBreathingNote}
          onNext={() => setPhase(3)}
          onSkip={() => setPhase(3)}
          onExit={handleSaveAndExit}
        />
      )}
      {phase === 3 && (
        <Phase3Grounding
          activation={activation}
          onNext={() => {
            if (groundingReturnTo === 'trigger') {
              setGroundingReturnTo(null);
              setTriggerInitialStep(1);
              setPhase(8);
            } else {
              setPhase(4);
            }
          }}
          onExit={handleSaveAndExit}
        />
      )}
      {phase === 4 && (
        <Phase4Meditation
          activation={activation}
          onNext={() => setPhase(5)}
          onSkip={() => setPhase(5)}
          onExit={handleSaveAndExit}
        />
      )}
      {phase === 5 && (
        <Phase5Anchor
          onNext={() => setPhase(6)}
          onExit={handleSaveAndExit}
        />
      )}
      {phase === 6 && (
        <Phase6Somatic
          onNext={() => setPhase(7)}
          onSkip={() => setPhase(7)}
          onExit={handleSaveAndExit}
        />
      )}
      {phase === 7 && (
        <Phase7Bridge
          onCalmFinish={() => { setAnalyzed(false); setPhase(10); }}
          onContinueToAnalyze={() => { setAnalyzed(true); setTriggerInitialStep(0); setPhase(8); }}
          onExit={handleSaveAndExit}
        />
      )}
      {phase === 8 && (
        <Phase8Trigger
          data={trigger}
          setData={setTrigger}
          initialStep={triggerInitialStep}
          onNext={() => setPhase(9)}
          onGoToGrounding={goToGroundingFromTrigger}
          onExit={handleSaveAndExit}
        />
      )}
      {phase === 9 && (
        <Phase9Mode
          selected={selectedModes}
          setSelected={setSelectedModes}
          onNext={() => setPhase(10)}
          onSkip={() => setPhase(10)}
          onExit={handleSaveAndExit}
        />
      )}
      {phase === 10 && (
        <Phase10Closing
          activation={activation}
          analyzed={analyzed}
          score={score}
          setScore={setScore}
          note={note}
          setNote={setNote}
          onFinish={handleFinish}
          onContinueWithClaude={analyzed ? handleContinueWithClaude : null}
          onExit={handleSaveAndExit}
          savingState={savingState}
        />
      )}
    </div>
  );
}
