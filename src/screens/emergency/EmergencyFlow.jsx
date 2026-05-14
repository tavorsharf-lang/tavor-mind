import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBackHandler } from '../../utils/navContext.jsx';
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
import PhaseEarlyBridge from './PhaseEarlyBridge.jsx';
import PhaseSchemaModeBridge from './PhaseSchemaModeBridge.jsx';
import PhaseContainment from './PhaseContainment.jsx';
import PhaseSummary from './PhaseSummary.jsx';
import {
  logEmergencySession,
  flushPendingSessions,
  logTriggerAnalysis,
  flushPendingTriggerAnalyses,
  getMidEarlyBridgeStreak,
} from '../../utils/emergencyLog.js';
import { resolveModeId } from '../../data/modes.js';
import { getSchemaModesMapping } from '../../data/schemaToModes.js';
import {
  buildEmergencyPrompt,
  buildTriggerAnalysisPrompt,
  getClaudeProjectUrl,
} from '../../utils/claudeHandoff.js';
import {
  isWearingWatch,
  generateHrSessionId,
} from '../../utils/liveHr.js';

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
  heavinessCheck: null,
};

export default function EmergencyFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  // Direct-analysis mode: when entered from the home tile, skip the body/calming
  // phases entirely and start at Phase 8 (trigger analysis). The activation step
  // inside Phase 8 (step 0) still runs so initial activation is captured.
  const startAtAnalysis = !!location.state?.startAtAnalysis;
  const [phase, setPhase] = useState(startAtAnalysis ? 8 : 1);
  const [activation, setActivation] = useState(startAtAnalysis ? 'mid' : null);
  const [selectedModes, setSelectedModes] = useState(new Set());
  const [breathingNote, setBreathingNote] = useState('');
  const [breathingFelt62, setBreathingFelt62] = useState(null); // null | 'right' | 'almost' | 'too_much'
  const [score, setScore] = useState(5);
  const [note, setNote] = useState('');
  const [analyzed, setAnalyzed] = useState(startAtAnalysis);
  const [trigger, setTrigger] = useState(EMPTY_TRIGGER);
  // When set, Phase3 grounding "next" returns to Phase 8 instead of advancing to Phase 4.
  const [groundingReturnTo, setGroundingReturnTo] = useState(null);
  // initialStep for Phase 8 — controls where Phase 8 starts when (re)mounted.
  const [triggerInitialStep, setTriggerInitialStep] = useState(0);
  // Mid-path early bridge state (Phase 3.5). Marked 'direct' when the user
  // entered straight from the home "ניתוח מקרה" tile, so it's distinguishable
  // in trigger_analyses telemetry from the in-flow early bridge choices.
  const [earlyBridgeChoice, setEarlyBridgeChoice] = useState(startAtAnalysis ? 'direct' : null); // null | 'analyze' | 'continue' | 'direct'
  const [skipInitialActivation, setSkipInitialActivation] = useState(false);
  const [midStreak, setMidStreak] = useState(0);
  // Set when user chooses to interrupt analysis (heavier in safety check) — value is the
  // Phase 8 step to resume at after Phase 6 completes.
  const [analysisResumeStep, setAnalysisResumeStep] = useState(null);
  // Schema→mode bridge (phase 8.5) — captures user response and mode pre-selection.
  const [schemaModeBridgeResponse, setSchemaModeBridgeResponse] = useState(null);
  const [phase9InitialExpanded, setPhase9InitialExpanded] = useState(null);
  // Phase 9 self-identification + ordering tracking (Step 7).
  const [phase9CustomDescription, setPhase9CustomDescription] = useState('');
  const [phase9IdentificationPath, setPhase9IdentificationPath] = useState(null);
  const [phase9OrderingUsed, setPhase9OrderingUsed] = useState('activation');
  const [phase9FirstSuggestedMode, setPhase9FirstSuggestedMode] = useState(null);
  // Body-regulation score captured at start of Phase 7 (rate stage).
  const [bodyRegulationScore, setBodyRegulationScore] = useState(null);
  // Containment side-trip state (Phase 8 step 0 → 8.1).
  const [containmentCountThisSession, setContainmentCountThisSession] = useState(0);
  const [savingState, setSavingState] = useState('idle');
  const startedAtRef = useRef(Date.now());

  // HR session id — generated lazily on first call when user has the
  // "אני עונד שעון" toggle on. Read live from localStorage so toggling the
  // switch inside Phase 1 (which mounts AFTER EmergencyFlow) takes effect
  // immediately instead of being stranded at the initial mount value.
  const hrSessionIdRef = useRef(null);
  const ensureHrSessionId = useCallback(() => {
    if (!isWearingWatch()) return null;
    if (!hrSessionIdRef.current) hrSessionIdRef.current = generateHrSessionId();
    return hrSessionIdRef.current;
  }, []);

  // Frozen endedAt — captured once when phase first transitions to 11 so the
  // HR summary's polling effect (which keys on endedAtMs) doesn't restart on
  // every render. Set in an effect (not the render body) so back-navigation
  // into Phase 11 doesn't pick up a stale render-time write.
  const endedAtMsRef = useRef(null);
  useEffect(() => {
    if (phase === 11 && endedAtMsRef.current === null) {
      endedAtMsRef.current = Date.now();
    }
  }, [phase]);

  // Phase history stack — each setPhase transition is recorded so the global
  // "previous" button can pop back to the prior phase. skipRecordRef lets
  // goBackPhase set the phase without re-recording the back-jump itself.
  const phaseHistoryRef = useRef([]);
  const prevPhaseRef = useRef(phase);
  const skipRecordRef = useRef(false);
  useEffect(() => {
    if (prevPhaseRef.current === phase) return;
    if (skipRecordRef.current) {
      skipRecordRef.current = false;
    } else {
      phaseHistoryRef.current.push(prevPhaseRef.current);
    }
    prevPhaseRef.current = phase;
  }, [phase]);

  const goBackPhase = useCallback(() => {
    if (phaseHistoryRef.current.length > 0) {
      const prev = phaseHistoryRef.current.pop();
      skipRecordRef.current = true;
      setPhase(prev);
    } else {
      navigate(-1);
    }
  }, [navigate]);
  useBackHandler(goBackPhase);

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

  // Fetch streak only once activation is locked to 'mid' — this drives the
  // optional meta-prompt inside the early bridge.
  useEffect(() => {
    if (activation !== 'mid') return;
    let cancelled = false;
    getMidEarlyBridgeStreak()
      .then((n) => { if (!cancelled) setMidStreak(n); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [activation]);

  // Emergency session payload — kept lean. Stage-2 detail goes to trigger_analyses.
  const buildSession = ({ partial = false, hrSessionId = null } = {}) => {
    const startedAt = startedAtRef.current;
    const session = {
      activation,
      modesIdentified: Array.from(selectedModes).map(resolveModeId).filter(Boolean),
      breathingNote: breathingNote.trim() || null,
      breathingFelt62: breathingFelt62 || null,
      closingScore: partial ? null : score,
      note: (note || '').trim() || null,
      durationSeconds: Math.round((Date.now() - startedAt) / 1000),
      startedAtClient: startedAt,
      stage2Completed: analyzed,
      earlyBridgeChoice,
      bodyRegulationScore: bodyRegulationScore != null ? bodyRegulationScore : null,
      hrTrack: hrSessionId ? { sessionId: hrSessionId } : null,
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
      earlyBridgeChoice,
      heavinessCheck: trigger.heavinessCheck || null,
      schemaModeBridgeResponse,
      phase9CustomDescription: phase9CustomDescription.trim() || null,
      phase9IdentificationPath: phase9IdentificationPath || null,
      phase9OrderingUsed: phase9OrderingUsed || 'activation',
      phase9FirstSuggestedMode: phase9FirstSuggestedMode
        ? resolveModeId(phase9FirstSuggestedMode)
        : null,
    };
  };

  const persistAll = async () => {
    // Always tag sessions with an hrSessionId so the chart in PhaseSummary
    // can poll for samples. If the user never tapped the start-workout link
    // / never set up the Shortcut, polling will simply time out and show the
    // empty state — non-blocking.
    const hrSessionId = ensureHrSessionId();
    const ops = [logEmergencySession(buildSession({ hrSessionId }))];
    if (analyzed) ops.push(logTriggerAnalysis(buildTriggerPayload()));
    const results = await Promise.all(ops);
    const allOk = results.every((r) => r?.ok);
    return { ok: allOk };
  };

  const handleFinish = async () => {
    setSavingState('saving');
    const result = await persistAll();
    setSavingState(result.ok ? 'saved' : 'offline');
    // Show summary screen instead of navigating immediately. Only navigate
    // home from the summary screen's "Back home" CTA.
    setTimeout(() => setPhase(11), result.ok ? 400 : 1000);
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
    const hrSessionId = ensureHrSessionId();
    const result = await logEmergencySession(buildSession({ partial: true, hrSessionId }));
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

  // Phase 8 step 0 → containment side-trip → return to Phase 8 step 0 (rate again).
  const goToContainmentFromTrigger = () => {
    setPhase(8.1);
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
          breathingFelt62={breathingFelt62}
          setBreathingFelt62={setBreathingFelt62}
          onNext={() => setPhase(3)}
          onSkip={() => setPhase(3)}
          onExit={handleSaveAndExit}
          onRestart={() => {
            setActivation(null);
            setBreathingNote('');
            setBreathingFelt62(null);
            setPhase(1);
          }}
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
            } else if (activation === 'mid' && earlyBridgeChoice === null) {
              setPhase(3.5);
            } else {
              setPhase(4);
            }
          }}
          onExit={handleSaveAndExit}
        />
      )}
      {phase === 3.5 && (
        <PhaseEarlyBridge
          midStreak={midStreak}
          onAnalyze={() => {
            setEarlyBridgeChoice('analyze');
            setAnalyzed(true);
            setSkipInitialActivation(true);
            setTriggerInitialStep(1);
            setPhase(8);
          }}
          onContinue={() => {
            setEarlyBridgeChoice('continue');
            setPhase(4);
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
          activation={activation}
          onNext={() => {
            if (analysisResumeStep !== null) {
              const resumeAt = analysisResumeStep;
              setAnalysisResumeStep(null);
              setTriggerInitialStep(resumeAt);
              setPhase(8);
            } else {
              setPhase(7);
            }
          }}
          onSkip={() => {
            if (analysisResumeStep !== null) {
              const resumeAt = analysisResumeStep;
              setAnalysisResumeStep(null);
              setTriggerInitialStep(resumeAt);
              setPhase(8);
            } else {
              setPhase(7);
            }
          }}
          onExit={handleSaveAndExit}
        />
      )}
      {phase === 7 && (
        <Phase7Bridge
          earlyBridgeChoice={earlyBridgeChoice}
          bodyRegulationScore={bodyRegulationScore}
          setBodyRegulationScore={setBodyRegulationScore}
          onCalmFinish={() => { setAnalyzed(false); setPhase(10); }}
          onContinueToAnalyze={() => { setAnalyzed(true); setTriggerInitialStep(0); setSkipInitialActivation(false); setPhase(8); }}
          onExit={handleSaveAndExit}
        />
      )}
      {phase === 8 && (
        <Phase8Trigger
          data={trigger}
          setData={setTrigger}
          initialStep={triggerInitialStep}
          activation={activation}
          skipInitialActivation={skipInitialActivation}
          onNext={() => {
            const mapping = getSchemaModesMapping(trigger.dominantSchema);
            if (mapping) {
              setPhase(8.5);
            } else {
              setSchemaModeBridgeResponse('no_mapping');
              setPhase(9);
            }
          }}
          onGoToGrounding={goToGroundingFromTrigger}
          onGoToContainment={goToContainmentFromTrigger}
          onGoToRegulation={(resumeAt) => {
            setAnalysisResumeStep(resumeAt);
            setPhase(4);
          }}
          onBack={goBackPhase}
          onExit={handleSaveAndExit}
        />
      )}
      {phase === 8.1 && (
        <PhaseContainment
          activationAtTime={trigger.initialActivation}
          containmentCountSoFar={containmentCountThisSession}
          onComplete={() => {
            setContainmentCountThisSession((c) => c + 1);
            setTriggerInitialStep(0);
            setPhase(8);
          }}
          onAddToAnalysis={() => {
            setTriggerInitialStep(1);
            setPhase(8);
          }}
          onAbortToEnd={() => {
            setAnalyzed(true);
            setPhase(10);
          }}
          onExit={handleSaveAndExit}
        />
      )}
      {phase === 8.5 && (
        <PhaseSchemaModeBridge
          dominantSchema={trigger.dominantSchema}
          allSchemas={trigger.schemas || []}
          onAccept={(shortModeId, response) => {
            setSelectedModes((prev) => {
              const next = new Set(prev);
              next.add(shortModeId);
              return next;
            });
            setPhase9InitialExpanded(shortModeId);
            setSchemaModeBridgeResponse(response);
            setPhase(9);
          }}
          onSkip={(response) => {
            setSchemaModeBridgeResponse(response);
            setPhase(9);
          }}
          onExit={handleSaveAndExit}
        />
      )}
      {phase === 9 && (
        <Phase9Mode
          selected={selectedModes}
          setSelected={setSelectedModes}
          activation={activation}
          initialExpandedMode={phase9InitialExpanded}
          customModeDescription={phase9CustomDescription}
          setCustomModeDescription={setPhase9CustomDescription}
          identificationPath={phase9IdentificationPath}
          setIdentificationPath={setPhase9IdentificationPath}
          modeOrderingUsed={phase9OrderingUsed}
          setModeOrderingUsed={setPhase9OrderingUsed}
          setFirstSuggestedMode={setPhase9FirstSuggestedMode}
          onNext={() => setPhase(10)}
          onSkip={() => setPhase(10)}
          onExit={handleSaveAndExit}
        />
      )}
      {phase === 10 && (
        <Phase10Closing
          analyzed={analyzed}
          score={score}
          setScore={setScore}
          note={note}
          setNote={setNote}
          onFinish={handleFinish}
          onContinueWithClaude={analyzed ? handleContinueWithClaude : null}
          onExit={handleSaveAndExit}
          savingState={savingState}
          hrSessionId={ensureHrSessionId()}
        />
      )}
      {phase === 11 && (
        <PhaseSummary
          session={{
            analyzed,
            activation,
            breathingFelt62,
            breathingNote: breathingNote.trim() || null,
            bodyRegulationScore,
            modesIdentified: Array.from(selectedModes).map(resolveModeId).filter(Boolean),
            somaticRan: activation === 'hypo',
            hrSessionId: ensureHrSessionId(),
            startedAtMs: startedAtRef.current,
            endedAtMs: endedAtMsRef.current,
            trigger: analyzed ? buildTriggerPayload() : null,
          }}
          onShowRecords={() => navigate('/emergency/history')}
          onClose={() => navigate('/', { replace: true })}
        />
      )}
    </div>
  );
}
