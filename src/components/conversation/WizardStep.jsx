import { useEffect, useMemo, useState } from 'react';
import ScoreSlider from '../ui/ScoreSlider.jsx';
import { getCounts, sortOptionsByCounts } from '../../services/choiceFrequencyService.js';
import {
  listCustomOptions,
  customOptionIdFromLabel,
  isCustomOptionId,
} from '../../services/customOptionsService.js';

// Renders a single wizard question. Reads frequency counts + custom options
// once on mount so the order doesn't reshuffle while the user is interacting.
//
// Value shape per question type:
//   single_select        : string (option id) | null
//   multi_select         : string[] | null
//   text                 : string | null
//   scale                : number | null
//   select_with_custom   : { selected, sub_inputs, custom_labels } | null
//                          where selected is string (multi:false) or string[] (multi:true)

export default function WizardStep({
  sessionType,
  question,
  value,
  onChange,
  onSkip,
}) {
  const [customOptions, setCustomOptions] = useState([]);
  const [counts, setCounts] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [draftCustom, setDraftCustom] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setDraftCustom('');
    const isSelectish = ['single_select', 'multi_select', 'select_with_custom'].includes(question?.type);
    if (!isSelectish) {
      setCustomOptions([]);
      setCounts({});
      setLoaded(true);
      return () => { cancelled = true; };
    }
    Promise.all([
      getCounts(sessionType, question.id),
      question.type === 'select_with_custom' ? listCustomOptions(sessionType, question.id) : Promise.resolve([]),
    ]).then(([c, custom]) => {
      if (cancelled) return;
      setCounts(c || {});
      setCustomOptions(custom || []);
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [sessionType, question?.id, question?.type]);

  // Merge static + user-custom + value-embedded custom_labels (for items added
  // this session that haven't been persisted yet). Sort by combined count.
  const mergedOptions = useMemo(() => {
    if (!question) return [];
    const staticOpts = Array.isArray(question.options) ? question.options : [];
    const merged = staticOpts.map((o) => ({ ...o, _custom: false }));

    const seen = new Set(merged.map((o) => o.id));
    for (const co of customOptions) {
      if (seen.has(co.id)) continue;
      merged.push({ id: co.id, label: co.label, _custom: true, _customCount: co.count });
      seen.add(co.id);
    }

    // Pull labels embedded in the live value (covers freshly-added customs
    // before Firebase write resolves and across page reloads of unsaved state).
    if (question.type === 'select_with_custom' && value && typeof value === 'object') {
      const customLabels = value.custom_labels || {};
      for (const [id, label] of Object.entries(customLabels)) {
        if (seen.has(id)) continue;
        merged.push({ id, label, _custom: true, _customCount: 0 });
        seen.add(id);
      }
    }

    const combinedCounts = {};
    for (const opt of merged) {
      const fromFreq = Number(counts[opt.id]) || 0;
      const fromCustom = opt._custom ? Number(opt._customCount) || 0 : 0;
      combinedCounts[opt.id] = fromFreq + fromCustom;
    }

    return sortOptionsByCounts(merged, combinedCounts);
  }, [question, customOptions, counts, value]);

  if (!question) return null;

  const showSkip = !question.required && typeof onSkip === 'function';

  return (
    <div className="cs-step">
      <h2 className="cs-step-title">{question.label}</h2>
      {question.help && <p className="cs-step-help">{question.help}</p>}
      {question.hint && <p className="cs-step-hint">{question.hint}</p>}

      {!loaded ? (
        <div className="cs-step-loading" aria-hidden="true" />
      ) : (
        renderInput({
          question,
          options: mergedOptions,
          value,
          onChange,
          draftCustom,
          setDraftCustom,
        })
      )}

      {showSkip && (
        <button
          type="button"
          className="cs-skip-link"
          onClick={onSkip}
        >
          דלג על שאלה זו
        </button>
      )}
    </div>
  );
}

function renderInput({ question, options, value, onChange, draftCustom, setDraftCustom }) {
  switch (question.type) {
    case 'single_select':
      if (questionUsesSubInputs(question)) {
        return renderSingleSelectStructured({ question, options, value, onChange });
      }
      return (
        <div className="cs-options" role="radiogroup" aria-label={question.label}>
          {options.map((opt) => {
            const selected = value === opt.id;
            return (
              <button
                type="button"
                key={opt.id}
                className={`cs-option${selected ? ' is-selected' : ''}`}
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(opt.id)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      );

    case 'multi_select': {
      if (questionUsesSubInputs(question)) {
        return renderMultiSelectStructured({ question, options, value, onChange });
      }
      const selectedSet = new Set(Array.isArray(value) ? value : []);
      const toggle = (id) => {
        const next = new Set(selectedSet);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        onChange(Array.from(next));
      };
      return (
        <div className="cs-options" role="group" aria-label={question.label}>
          {options.map((opt) => {
            const selected = selectedSet.has(opt.id);
            return (
              <button
                type="button"
                key={opt.id}
                className={`cs-option${selected ? ' is-selected' : ''}`}
                aria-pressed={selected}
                onClick={() => toggle(opt.id)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      );
    }

    case 'select_with_custom':
      return renderSelectWithCustom({ question, options, value, onChange, draftCustom, setDraftCustom });

    case 'text':
      return (
        <textarea
          className="cs-text-input"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder || ''}
          maxLength={question.maxLength}
          rows={5}
        />
      );

    case 'scale':
      return renderScale({ question, value, onChange });

    default:
      return null;
  }
}

// A single_select option may declare sub_input — when so, its value shape
// upgrades from `'id'` to `{ selected: 'id', sub_inputs: {...} }`. Detection
// is config-driven (any option carries sub_input → structured).
function questionUsesSubInputs(question) {
  return Array.isArray(question?.options) && question.options.some((o) => o?.sub_input);
}

function normalizeSingleStructured(value) {
  if (!value || typeof value !== 'object') {
    return { selected: typeof value === 'string' ? value : null, sub_inputs: {} };
  }
  return {
    selected: typeof value.selected === 'string' ? value.selected : null,
    sub_inputs: value.sub_inputs && typeof value.sub_inputs === 'object' ? value.sub_inputs : {},
  };
}

function normalizeMultiStructured(value) {
  if (Array.isArray(value)) return { selected: value, sub_inputs: {} };
  if (!value || typeof value !== 'object') return { selected: [], sub_inputs: {} };
  return {
    selected: Array.isArray(value.selected) ? value.selected : [],
    sub_inputs: value.sub_inputs && typeof value.sub_inputs === 'object' ? value.sub_inputs : {},
  };
}

function renderMultiSelectStructured({ question, options, value, onChange }) {
  const v = normalizeMultiStructured(value);
  const selectedSet = new Set(v.selected);

  const toggle = (id) => {
    const next = new Set(selectedSet);
    if (next.has(id)) {
      next.delete(id);
      // Deselecting an option clears its sub_input so stale text doesn't leak.
      const opt = options.find((o) => o.id === id);
      if (opt?.sub_input) {
        const remaining = { ...v.sub_inputs };
        delete remaining[opt.sub_input.id];
        onChange({ selected: Array.from(next), sub_inputs: remaining });
        return;
      }
    } else {
      next.add(id);
    }
    onChange({ ...v, selected: Array.from(next) });
  };

  const setSubInput = (subId, text) => {
    onChange({ ...v, sub_inputs: { ...v.sub_inputs, [subId]: text } });
  };

  return (
    <div className="cs-options" role="group" aria-label={question.label}>
      {options.map((opt) => {
        const selected = selectedSet.has(opt.id);
        const subInput = opt.sub_input || null;
        return (
          <div key={opt.id} className="cs-option-row">
            <button
              type="button"
              className={`cs-option${selected ? ' is-selected' : ''}`}
              aria-pressed={selected}
              onClick={() => toggle(opt.id)}
            >
              {opt.label}
            </button>
            {selected && subInput && (
              <div className="cs-sub-input">
                <label className="cs-sub-input-label" htmlFor={`sub-${opt.id}-${subInput.id}`}>
                  {subInput.label}
                </label>
                <input
                  id={`sub-${opt.id}-${subInput.id}`}
                  type="text"
                  className="cs-text-input cs-sub-input-field"
                  value={v.sub_inputs[subInput.id] || ''}
                  onChange={(e) => setSubInput(subInput.id, e.target.value)}
                  placeholder={subInput.placeholder || ''}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function renderSingleSelectStructured({ question, options, value, onChange }) {
  const v = normalizeSingleStructured(value);
  const pick = (id) => {
    // Picking a new option clears stale sub_inputs from the previously-picked
    // option so they don't leak into the value payload.
    onChange({ selected: id, sub_inputs: {} });
  };
  const setSubInput = (subId, text) => {
    onChange({ ...v, sub_inputs: { ...v.sub_inputs, [subId]: text } });
  };
  return (
    <div className="cs-options" role="radiogroup" aria-label={question.label}>
      {options.map((opt) => {
        const selected = v.selected === opt.id;
        const subInput = opt.sub_input || null;
        return (
          <div key={opt.id} className="cs-option-row">
            <button
              type="button"
              className={`cs-option${selected ? ' is-selected' : ''}`}
              role="radio"
              aria-checked={selected}
              onClick={() => pick(opt.id)}
            >
              {opt.label}
            </button>
            {selected && subInput && (
              <div className="cs-sub-input">
                <label className="cs-sub-input-label" htmlFor={`sub-${opt.id}-${subInput.id}`}>
                  {subInput.label}
                </label>
                <input
                  id={`sub-${opt.id}-${subInput.id}`}
                  type="text"
                  className="cs-text-input cs-sub-input-field"
                  value={v.sub_inputs[subInput.id] || ''}
                  onChange={(e) => setSubInput(subInput.id, e.target.value)}
                  placeholder={subInput.placeholder || ''}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function defaultSelectWithCustomValue(multi) {
  return multi
    ? { selected: [], sub_inputs: {}, custom_labels: {} }
    : { selected: null, sub_inputs: {}, custom_labels: {} };
}

function normalizeSelectWithCustom(value, multi) {
  if (!value || typeof value !== 'object') return defaultSelectWithCustomValue(multi);
  return {
    selected: multi
      ? (Array.isArray(value.selected) ? value.selected : [])
      : (value.selected ?? null),
    sub_inputs: value.sub_inputs && typeof value.sub_inputs === 'object' ? value.sub_inputs : {},
    custom_labels: value.custom_labels && typeof value.custom_labels === 'object' ? value.custom_labels : {},
  };
}

function renderSelectWithCustom({ question, options, value, onChange, draftCustom, setDraftCustom }) {
  const multi = !!question.multi;
  const v = normalizeSelectWithCustom(value, multi);
  const selectedSet = new Set(multi ? v.selected : (v.selected ? [v.selected] : []));

  const setSelected = (selected) => {
    onChange({ ...v, selected });
  };

  const togglePick = (id) => {
    if (multi) {
      const next = new Set(selectedSet);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setSelected(Array.from(next));
    } else {
      setSelected(v.selected === id ? null : id);
    }
  };

  const setSubInput = (subId, text) => {
    onChange({
      ...v,
      sub_inputs: { ...v.sub_inputs, [subId]: text },
    });
  };

  const addCustom = () => {
    const label = draftCustom.trim();
    if (!label) return;
    const id = customOptionIdFromLabel(label);
    if (!id) return;
    const nextCustomLabels = { ...v.custom_labels, [id]: label };
    let nextSelected;
    if (multi) {
      const set = new Set(selectedSet);
      set.add(id);
      nextSelected = Array.from(set);
    } else {
      nextSelected = id;
    }
    onChange({
      ...v,
      selected: nextSelected,
      custom_labels: nextCustomLabels,
    });
    setDraftCustom('');
  };

  return (
    <div className="cs-options-wrap">
      <div className="cs-options" role={multi ? 'group' : 'radiogroup'} aria-label={question.label}>
        {options.map((opt) => {
          const selected = selectedSet.has(opt.id);
          const subInput = opt.sub_input || null;
          return (
            <div key={opt.id} className="cs-option-row">
              <button
                type="button"
                className={`cs-option${selected ? ' is-selected' : ''}${opt._custom ? ' is-custom' : ''}`}
                role={multi ? undefined : 'radio'}
                aria-checked={multi ? undefined : selected}
                aria-pressed={multi ? selected : undefined}
                onClick={() => togglePick(opt.id)}
              >
                {opt.label}
                {opt._custom && <span className="cs-option-tag">משלך</span>}
              </button>
              {selected && subInput && (
                <div className="cs-sub-input">
                  <label className="cs-sub-input-label" htmlFor={`sub-${opt.id}-${subInput.id}`}>
                    {subInput.label}
                  </label>
                  <input
                    id={`sub-${opt.id}-${subInput.id}`}
                    type="text"
                    className="cs-text-input cs-sub-input-field"
                    value={v.sub_inputs[subInput.id] || ''}
                    onChange={(e) => setSubInput(subInput.id, e.target.value)}
                    placeholder={subInput.placeholder || ''}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="cs-custom-add">
        <input
          type="text"
          className="cs-text-input cs-custom-add-field"
          value={draftCustom}
          onChange={(e) => setDraftCustom(e.target.value)}
          placeholder="אופציה משלך…"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addCustom();
            }
          }}
        />
        <button
          type="button"
          className="cs-btn cs-btn-ghost cs-custom-add-btn"
          onClick={addCustom}
          disabled={!draftCustom.trim()}
        >
          הוסף
        </button>
      </div>
    </div>
  );
}

function renderScale({ question, value, onChange }) {
  const cfg = question.config || question;
  const min = cfg.min ?? question.min ?? 0;
  const max = cfg.max ?? question.max ?? 10;
  const left = cfg.leftLabel ?? question.minLabel ?? String(min);
  const mid = cfg.midLabel ?? question.midLabel ?? null;
  const right = cfg.rightLabel ?? question.maxLabel ?? String(max);
  const current = typeof value === 'number' ? value : Math.round((min + max) / 2);
  const labels = mid ? [left, mid, right] : [left, right];
  return (
    <div className="cs-scale-wrap">
      <ScoreSlider
        value={current}
        onChange={(n) => onChange(Number(n))}
        min={min}
        max={max}
        polarity="static"
        labels={labels}
        ariaLabel={question.label}
      />
    </div>
  );
}

export function isAnswered(question, value) {
  if (!question) return false;
  if (value === null) return false; // skipped — handled separately by wizard
  switch (question.type) {
    case 'single_select':
      if (questionUsesSubInputs(question)) {
        return !!value && typeof value === 'object' && typeof value.selected === 'string' && value.selected !== '';
      }
      return typeof value === 'string' && value !== '';
    case 'multi_select':
      if (questionUsesSubInputs(question)) {
        return !!value && typeof value === 'object'
          && Array.isArray(value.selected) && value.selected.length > 0;
      }
      return Array.isArray(value) && value.length > 0;
    case 'select_with_custom': {
      if (!value || typeof value !== 'object') return false;
      if (question.multi) return Array.isArray(value.selected) && value.selected.length > 0;
      return typeof value.selected === 'string' && value.selected !== '';
    }
    case 'text':
      return typeof value === 'string' && value.trim().length > 0;
    case 'scale':
      return typeof value === 'number';
    default:
      return false;
  }
}

// Returns the option ids selected in this answer (across all select-style
// types). Used by frequency bumping. Returns [] for non-select / skipped /
// empty.
export function selectedOptionIds(question, value) {
  if (!question || value == null) return [];
  if (question.type === 'single_select') {
    if (questionUsesSubInputs(question)) {
      return value && typeof value === 'object' && typeof value.selected === 'string' && value.selected
        ? [value.selected]
        : [];
    }
    return typeof value === 'string' && value ? [value] : [];
  }
  if (question.type === 'multi_select') {
    if (questionUsesSubInputs(question)) {
      if (!value || typeof value !== 'object') return [];
      return Array.isArray(value.selected) ? value.selected.slice() : [];
    }
    return Array.isArray(value) ? value.slice() : [];
  }
  if (question.type === 'select_with_custom') {
    if (!value || typeof value !== 'object') return [];
    if (question.multi) return Array.isArray(value.selected) ? value.selected.slice() : [];
    return typeof value.selected === 'string' && value.selected ? [value.selected] : [];
  }
  return [];
}

// For each id that was a fresh custom (i.e. appears in custom_labels), return
// {id, label} so we can persist it to custom_options on submit.
export function freshCustomSelections(question, value) {
  if (question?.type !== 'select_with_custom') return [];
  if (!value || typeof value !== 'object') return [];
  const selected = new Set(question.multi
    ? (Array.isArray(value.selected) ? value.selected : [])
    : (value.selected ? [value.selected] : []));
  const labels = value.custom_labels || {};
  const out = [];
  for (const id of selected) {
    if (isCustomOptionId(id) && labels[id]) {
      out.push({ id, label: labels[id] });
    }
  }
  return out;
}

export { isCustomOptionId, questionUsesSubInputs };
