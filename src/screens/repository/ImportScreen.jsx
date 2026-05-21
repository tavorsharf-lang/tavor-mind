import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ToolHeader from '../toolbox/components/ToolHeader.jsx';
import SoftButton from '../emergency/components/SoftButton.jsx';
import SavedConfirm from '../../components/ui/SavedConfirm.jsx';
import { validateAnalysis, applyDateOverride } from '../../utils/analysisValidation.js';
import { saveAnalysis } from '../../utils/analysisStorage.js';
import { ANALYSIS_TYPES, PATTERN_LABELS } from '../../data/analysisSchemas.js';

const VALIDATE_DEBOUNCE_MS = 500;

export default function ImportScreen() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [validation, setValidation] = useState(null);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideDate, setOverrideDate] = useState('');
  const [overrideTime, setOverrideTime] = useState('');
  const [saving, setSaving] = useState(false);
  const [resultToast, setResultToast] = useState(null);
  const [savedTarget, setSavedTarget] = useState(null);
  const [savedMessage, setSavedMessage] = useState('נשמר');

  // Debounced validation
  useEffect(() => {
    if (!text.trim()) {
      setValidation(null);
      return;
    }
    const t = setTimeout(() => {
      setValidation(validateAnalysis(text));
    }, VALIDATE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [text]);

  const previewAnalysis = useMemo(() => {
    if (!validation || !validation.ok) return null;
    return applyDateOverride(validation.normalized, overrideDate, overrideTime);
  }, [validation, overrideDate, overrideTime]);

  const handlePaste = async () => {
    if (!navigator.clipboard?.readText) return;
    try {
      const t = await navigator.clipboard.readText();
      setText(t);
    } catch {
      // user denied — silent
    }
  };

  const handleClear = () => setText('');

  const handleImport = async () => {
    const finalValidation = text.trim() ? validateAnalysis(text) : null;
    if (!finalValidation || !finalValidation.ok) {
      setValidation(finalValidation || { ok: false, errors: ['JSON ריק'] });
      return;
    }
    const final = applyDateOverride(finalValidation.normalized, overrideDate, overrideTime);
    setSaving(true);
    const result = await saveAnalysis(final);
    setSaving(false);
    if (result.ok) {
      setSavedMessage('הניתוח נשמר');
      setSavedTarget(`/repository/${result.id}`);
    } else if (result.reason === 'offline') {
      setSavedMessage('נשמר מקומית · יסונכרן ברשת');
      setSavedTarget('/repository');
    } else {
      const detail = result.code || result.message || '';
      setResultToast(`שמירה נכשלה: ${detail}`);
    }
  };

  const canImport = validation?.ok === true && !saving && !savedTarget;

  return (
    <div className="tool-page ds2-themed">
      <ToolHeader
        title="ייבוא ניתוח"
        subtitle="הדבק JSON של ניתוח מצ'אט עם Claude. ניתן לייבא גם ניתוחים ישנים - הזן את התאריך המקורי."
        backTo="/repository"
      />
      <main className="tool-content">
        {/* Section 1 — date override */}
        <section className="import-section">
          <button
            type="button"
            className="link-btn override-toggle"
            onClick={() => setOverrideOpen(!overrideOpen)}
            aria-expanded={overrideOpen}
          >
            {overrideOpen ? '▾' : '▸'} זה ניתוח ישן? קבע תאריך ידנית
          </button>
          {overrideOpen && (
            <div className="override-fields">
              <label className="ck-field-label">
                תאריך
                <input
                  type="date"
                  className="thought-input"
                  value={overrideDate}
                  onChange={(e) => setOverrideDate(e.target.value)}
                />
              </label>
              <label className="ck-field-label">
                שעה (אופציונלי)
                <input
                  type="time"
                  className="thought-input"
                  value={overrideTime}
                  onChange={(e) => setOverrideTime(e.target.value)}
                />
              </label>
              <p className="override-note">
                יחליף את שדה occurredAt ב-JSON. createdAt תמיד יישמר ל"עכשיו".
              </p>
            </div>
          )}
        </section>

        {/* Section 2 — JSON input */}
        <section className="import-section">
          <h3 className="form-section-label">JSON של הניתוח</h3>
          <textarea
            className="ck-textarea import-textarea"
            rows={12}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={'{\n  "type": "emotion_recognition",\n  ...\n}'}
            spellCheck={false}
          />
          <div className="import-helper-row">
            <button type="button" className="link-btn" onClick={handleClear}>נקה</button>
            <button type="button" className="link-btn" onClick={handlePaste}>הדבק מהלוח</button>
          </div>
        </section>

        {/* Section 3 — validation feedback */}
        {validation && !validation.ok && (
          <section className="import-section validation-errors">
            <h3 className="form-section-label">
              <ErrorHeaderIcon />
              <span>שגיאות ייבוא</span>
              <span className="error-count">{validation.errors.length}</span>
            </h3>
            <ul className="error-list">
              {validation.errors.map((e, i) => (
                <li key={i}>
                  <ErrorItemIcon />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {previewAnalysis && (
          <section className="import-section validation-preview">
            <h3 className="form-section-label">תצוגה מקדימה</h3>
            <PreviewCard analysis={previewAnalysis} />
          </section>
        )}

        {resultToast && <div className="toast" role="status">{resultToast}</div>}
      </main>
      <SavedConfirm
        open={!!savedTarget}
        message={savedMessage}
        onClose={() => navigate(savedTarget, { replace: true })}
      />
      <footer className="phase-footer phase-footer-stack">
        <SoftButton onClick={handleImport} disabled={!canImport}>
          {saving ? (
            <span className="soft-btn-status">
              <span className="soft-btn-pulse" aria-hidden="true" />
              <span>שומר…</span>
            </span>
          ) : 'ייבא ושמור'}
        </SoftButton>
        <button type="button" className="link-btn" onClick={() => navigate('/repository')}>
          ביטול
        </button>
      </footer>
    </div>
  );
}

function ErrorHeaderIcon() {
  return (
    <svg className="error-header-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2 L22 20 L2 20 Z" />
      <line x1="12" y1="10" x2="12" y2="14" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" />
    </svg>
  );
}

function ErrorItemIcon() {
  return (
    <svg className="error-item-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="13" />
      <circle cx="12" cy="16.4" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PreviewCard({ analysis }) {
  const meta = ANALYSIS_TYPES[analysis.type];
  const truePatterns = Object.entries(PATTERN_LABELS).filter(([k]) => analysis.patterns?.[k] === true);
  return (
    <div className="preview-card">
      <div className="preview-row">
        {meta && (
          <span className={`type-chip type-chip-sm icon-tone-${meta.tone || 'reflect'}`}>
            {meta.label}
          </span>
        )}
        <span className="preview-date">{analysis.occurredAt || '-'}</span>
      </div>
      <h4 className="preview-title">{analysis.title || '-'}</h4>
      <p className="preview-summary">{analysis.summary || ''}</p>
      {Array.isArray(analysis.tags) && analysis.tags.length > 0 && (
        <div className="chip-row">
          {analysis.tags.map((t, i) => <span key={i} className="chip chip-tiny">{t}</span>)}
        </div>
      )}
      {truePatterns.length > 0 && (
        <div className="pattern-pills is-compact">
          {truePatterns.map(([k, l]) => <span key={k} className="pattern-chip">{l}</span>)}
        </div>
      )}
    </div>
  );
}
