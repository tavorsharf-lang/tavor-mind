import { useEffect, useRef, useState } from 'react';
import { orderModes, MODE_ORDER_BY_ACTIVATION } from '../../data/modes.js';
import { Phase9ModeIcon } from '../../components/icons/index.jsx';

const MODE_GLYPH = {
  manager:    'wedge',
  approval:   'ring',
  guardian:   'shield',
  sacrificer: 'arc',
  exile:      'dot',
};

function ModeGlyph({ kind, color, size = 32 }) {
  const s = { stroke: color, fill: 'none', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (kind === 'wedge') return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <path d="M6 28 L18 6 L30 28 Z" {...s}/>
      <path d="M12 22 L24 22" {...s} strokeOpacity="0.5"/>
    </svg>
  );
  if (kind === 'ring') return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="11" {...s}/>
      <circle cx="18" cy="18" r="5" {...s} strokeOpacity="0.5"/>
      <circle cx="18" cy="18" r="2" fill={color}/>
    </svg>
  );
  if (kind === 'shield') return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <path d="M18 6 L29 11 V20 C29 26 24 30 18 31 C12 30 7 26 7 20 V11 Z" {...s}/>
      <path d="M14 18 L18 22 L23 14" {...s} strokeOpacity="0.5"/>
    </svg>
  );
  if (kind === 'arc') return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <path d="M6 26 C6 14 14 6 26 6" {...s}/>
      <path d="M10 30 C10 18 18 10 30 10" {...s} strokeOpacity="0.5"/>
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="13" {...s} strokeOpacity="0.35"/>
      <circle cx="18" cy="18" r="4" fill={color}/>
    </svg>
  );
}

const MODE_TONE = {
  manager:    'var(--ink)',
  approval:   'var(--terra)',
  guardian:   'var(--lichen)',
  sacrificer: 'var(--ink-muted)',
  exile:      'var(--heart)',
};

export default function Phase9Mode({
  selected,
  setSelected,
  activation,
  initialExpandedMode = null,
  customModeDescription,
  setCustomModeDescription,
  identificationPath,
  setIdentificationPath,
  modeOrderingUsed,
  setModeOrderingUsed,
  setFirstSuggestedMode,
  onNext,
  onSkip,
  onExit,
}) {
  const initialStage = initialExpandedMode ? 'list' : 'identify_choice';
  const [stage, setStage] = useState(initialStage);
  const [expandedModeId, setExpandedModeId] = useState(initialExpandedMode);
  const itemRefs = useRef({});

  useEffect(() => {
    const order = MODE_ORDER_BY_ACTIVATION[activation] || null;
    if (order && order.length > 0 && setFirstSuggestedMode) {
      setFirstSuggestedMode(order[0]);
    }
  }, [activation, setFirstSuggestedMode]);

  const orderedModes = orderModes(modeOrderingUsed || 'activation', activation);

  const toggleSelected = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const enabled = selected.size > 0;

  // ── Stage 1 — Pre-list invitation ──────────────────────────────────
  if (stage === 'identify_choice') {
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} label="שלב 2 · לנתח" />
        <main className="ds3-screen-content ds3-screen-content-center">
          <div className="ds3-stack-5 ds3-text-center" style={{ padding: '0 8px' }}>
            <h1 className="ds3-h1">לפני שתסתכל על הרשימה</h1>
            <p className="ds3-body-lg ds3-text-muted" style={{ lineHeight: 1.55 }}>
              מי הקול שדיבר אליך עכשיו?<br/>
              נסה להקשיב לרגע.
            </p>
          </div>
        </main>
        <footer className="ds3-screen-footer ds3-stack-3">
          <button
            type="button"
            className="ds3-btn ds3-btn-primary"
            onClick={() => {
              if (setIdentificationPath) setIdentificationPath('self_first');
              setStage('self_describe');
            }}
          >
            נסה לזהות לבד
          </button>
          <button
            type="button"
            className="ds3-btn ds3-btn-outline-terra"
            onClick={() => {
              if (setIdentificationPath) setIdentificationPath('list_first');
              setStage('list');
            }}
          >
            הראה לי את הרשימה
          </button>
        </footer>
      </div>
    );
  }

  // ── Stage 1b — Self-describe ──────────────────────────────────────
  if (stage === 'self_describe') {
    return (
      <div className="ds3-screen">
        <Topbar onExit={onExit} label="שלב 2 · לנתח" />
        <main className="ds3-screen-content">
          <div className="ds3-stack-3" style={{ marginTop: 16 }}>
            <h1 className="ds3-h1">תאר את הקול ב-2 משפטים</h1>
            <p className="ds3-body ds3-text-muted">במילים שלך. אין נכון או לא נכון.</p>
          </div>
          <div style={{ marginTop: 22 }}>
            <textarea
              className="ds3-textarea"
              rows={5}
              value={customModeDescription || ''}
              onChange={(e) => setCustomModeDescription && setCustomModeDescription(e.target.value)}
              placeholder='לדוגמה: "הוא אמר שאני לא משקיע מספיק..."'
              autoFocus
            />
          </div>
        </main>
        <footer className="ds3-screen-footer ds3-stack-3">
          <button type="button" className="ds3-btn ds3-btn-primary" onClick={() => setStage('list')}>
            המשך לרשימה
          </button>
          <button
            type="button"
            className="ds3-btn-quiet"
            onClick={() => {
              if (setCustomModeDescription) setCustomModeDescription('');
              setStage('list');
            }}
          >
            דלג
          </button>
        </footer>
      </div>
    );
  }

  // ── Stage 2 — Selection list ───────────────────────────────────────
  const showSelfDescribed = !!(customModeDescription && customModeDescription.trim());
  const ordering = modeOrderingUsed || 'activation';

  return (
    <div className="ds3-screen">
      <Topbar onExit={onExit} label="שלב 2 · לנתח" />
      <main className="ds3-screen-content">
        <div className="ds3-stack-2" style={{ marginTop: 4 }}>
          <h1 className="ds3-h1">מי פעיל עכשיו?</h1>
          <p className="ds3-body ds3-text-muted">אפשר לבחור יותר מאחד</p>
        </div>

        {showSelfDescribed && (
          <div style={{
            marginTop: 18, padding: '12px 14px',
            background: 'var(--terra-soft)',
            borderRadius: 14,
            borderRight: '3px solid var(--terra)',
          }}>
            <p className="ds3-caption" style={{ color: 'var(--terra)', fontWeight: 700, marginBottom: 4 }}>
              מה כתבת:
            </p>
            <p className="ds3-body" style={{ margin: 0, lineHeight: 1.5 }}>
              {customModeDescription}
            </p>
          </div>
        )}

        <div className="ds3-stack-3" style={{ marginTop: 18 }}>
          {orderedModes.map((m) => {
            const isSel = selected.has(m.id);
            const glyphKind = MODE_GLYPH[m.id] || 'dot';
            const tone = MODE_TONE[m.id] || 'var(--ink)';
            return (
              <button
                key={m.id}
                type="button"
                className={`ds3-mode-card ${isSel ? 'is-selected' : ''}`}
                onClick={() => toggleSelected(m.id)}
                aria-pressed={isSel}
              >
                <div className="ds3-mode-card-glyph">
                  <ModeGlyph kind={glyphKind} color={tone} />
                </div>
                <div className="ds3-mode-card-text">
                  <div className="ds3-mode-card-name">{m.label}</div>
                  <div className="ds3-mode-card-desc">{m.description}</div>
                </div>
                <div className="ds3-mode-card-checkbox">
                  {isSel && (
                    <svg width="12" height="12" viewBox="0 0 12 12">
                      <path d="M2 6 L5 9 L10 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', padding: '18px 0 4px' }}>
          <button
            type="button"
            className="ds3-btn-quiet"
            style={{ height: 'auto', textDecoration: 'underline', textUnderlineOffset: 4, fontSize: 14 }}
            onClick={() => setModeOrderingUsed && setModeOrderingUsed(
              ordering === 'alphabetical' ? 'activation' : 'alphabetical'
            )}
          >
            {ordering === 'alphabetical' ? 'סדר מומלץ' : 'סדר אלפביתי'}
          </button>
        </div>
      </main>

      <footer className="ds3-screen-footer ds3-stack-2">
        <button
          type="button"
          className={`ds3-btn ${enabled ? 'ds3-btn-primary' : 'ds3-btn-cream'}`}
          disabled={!enabled}
          onClick={onNext}
        >
          המשך{enabled ? ` · ${selected.size}` : ''}
        </button>
        <button type="button" className="ds3-btn-quiet" onClick={onSkip}>
          דלג לשלב הבא
        </button>
      </footer>
    </div>
  );
}

function Topbar({ onExit, label }) {
  return (
    <div className="ds3-topbar">
      <span className="ds3-topbar-spacer" />
      <span className="ds3-topbar-label">
        <span className="ds3-topbar-label-icon color-tone-self" aria-hidden="true"><Phase9ModeIcon /></span>
        {label}
      </span>
      <button type="button" className="ds3-topbar-back" aria-label="צא" onClick={onExit}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
