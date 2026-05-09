import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ToolHeader from '../toolbox/components/ToolHeader.jsx';
import AnalysisListItem from './components/AnalysisListItem.jsx';
import MoodListItem from './components/MoodListItem.jsx';
import { Loading } from '../../components/ui/Loading.jsx';
import UndoToast from '../../components/ui/UndoToast.jsx';
import { ImportIcon, FilterIcon, TrashIcon } from '../../components/icons/index.jsx';
import { listAnalyses, restoreAnalysis, listDeletedAnalyses } from '../../utils/analysisStorage.js';
import { listAllMoodCheckins, listDeletedMoodCheckins } from '../../utils/checkinStorage.js';
import { ANALYSIS_TYPES, ANALYSIS_TYPE_IDS, SCHEMA_LABELS, SCHEMA_IDS, PATTERN_LABELS, PATTERN_IDS } from '../../data/analysisSchemas.js';
import { emotionLabelById, VALENCE_LABELS } from '../../data/emotionsCorpus.js';

const MOOD_TYPE_ID = 'mood_checkin';

function tsOf(item) {
  if (item._kind === 'mood') return item._ts || 0;
  return item.occurredAt ? new Date(item.occurredAt).getTime() : 0;
}

export default function RepositoryHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const [analyses, setAnalyses] = useState(null);
  const [moodEntries, setMoodEntries] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState(new Set());
  const [schemaFilter, setSchemaFilter] = useState(new Set());
  const [patternFilter, setPatternFilter] = useState(new Set());
  const [searchText, setSearchText] = useState('');
  const [undoInfo, setUndoInfo] = useState(() => location.state?.undo || null);
  const [deletedCount, setDeletedCount] = useState(0);

  const reload = () => {
    Promise.all([
      listAnalyses(),
      listAllMoodCheckins(),
      listDeletedAnalyses(),
      listDeletedMoodCheckins(),
    ]).then(([a, m, da, dm]) => {
      setAnalyses(a || []);
      setMoodEntries(m || []);
      setDeletedCount((da?.length || 0) + (dm?.length || 0));
    });
  };

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    // Clear router state once consumed so a back-nav doesn't re-trigger the toast.
    if (location.state?.undo) {
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUndo = async () => {
    if (!undoInfo) return;
    if (undoInfo.kind === 'analysis') {
      await restoreAnalysis(undoInfo.id);
      reload();
    }
  };

  const ready = analyses !== null && moodEntries !== null;

  const merged = useMemo(() => {
    if (!ready) return null;
    const items = [
      ...analyses.map((a) => ({ ...a, _kind: 'analysis' })),
      ...moodEntries.map((m) => ({ ...m, _kind: 'mood' })),
    ];
    items.sort((a, b) => tsOf(b) - tsOf(a));
    return items;
  }, [ready, analyses, moodEntries]);

  const visible = useMemo(() => {
    if (!merged) return null;
    const wantsMood = typeFilter.has(MOOD_TYPE_ID);
    const wantsAnalysisType = Array.from(typeFilter).some((t) => t !== MOOD_TYPE_ID);
    const schemaOrPatternActive = schemaFilter.size > 0 || patternFilter.size > 0;
    const needle = searchText.trim().toLowerCase();

    return merged.filter((item) => {
      if (item._kind === 'mood') {
        if (typeFilter.size > 0 && !wantsMood) return false;
        if (schemaOrPatternActive) return false;
        if (needle) {
          const valenceText = VALENCE_LABELS[item.valence] || '';
          const emoText = (item.emotions || []).map(emotionLabelById).join(' ');
          const haystack = `${valenceText} ${emoText}`.toLowerCase();
          if (!haystack.includes(needle)) return false;
        }
        return true;
      }
      if (typeFilter.size > 0 && wantsAnalysisType && !typeFilter.has(item.type)) return false;
      if (typeFilter.size > 0 && !wantsAnalysisType && wantsMood) return false;
      if (schemaFilter.size > 0) {
        const arr = Array.isArray(item.schemas_activated) ? item.schemas_activated : [];
        if (!arr.some((s) => schemaFilter.has(s))) return false;
      }
      if (patternFilter.size > 0) {
        const p = item.patterns || {};
        const anyTrue = Array.from(patternFilter).some((k) => p[k] === true);
        if (!anyTrue) return false;
      }
      if (needle) {
        const haystack = [
          item.title,
          item.summary,
          Array.isArray(item.tags) ? item.tags.join(' ') : '',
          item.payload?.insight,
          item.payload?.central_sentence,
        ].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [merged, typeFilter, schemaFilter, patternFilter, searchText]);

  const totalCount = merged?.length ?? 0;
  const filteredCount = visible?.length ?? 0;
  const isFiltered = typeFilter.size + schemaFilter.size + patternFilter.size > 0 || searchText.trim().length > 0;
  const activeFilterCount = typeFilter.size + schemaFilter.size + patternFilter.size + (searchText.trim() ? 1 : 0);

  const toggleSet = (set, setSet, id) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSet(next);
  };

  const resetFilters = () => {
    setTypeFilter(new Set());
    setSchemaFilter(new Set());
    setPatternFilter(new Set());
    setSearchText('');
  };

  const subtitle =
    !ready ? 'טוען…' :
    totalCount === 0 ? 'אין רישומים — לחץ "ייבא" כדי להתחיל' :
    `${totalCount} רישומים${isFiltered ? ` · מציג ${filteredCount}` : ''}`;

  return (
    <div className="tool-page ds2-themed">
      <ToolHeader title="המאגר" subtitle={subtitle} backTo="/" />
      <main className="tool-content repo-content">
        <div className="repo-toolbar">
          <button type="button" className="repo-import-btn" onClick={() => navigate('/repository/import')}>
            <ImportIcon size={18} />
            ייבא ניתוח
          </button>
          <button
            type="button"
            className={`repo-filter-btn ${filtersOpen ? 'is-open' : ''}`}
            onClick={() => setFiltersOpen(!filtersOpen)}
            aria-expanded={filtersOpen}
          >
            <FilterIcon size={20} />
            סינון
            {activeFilterCount > 0 && <span className="filter-count-badge">{activeFilterCount}</span>}
          </button>
          <button
            type="button"
            className="repo-trash-btn"
            onClick={() => navigate('/repository/trash')}
            aria-label="סל מחזור"
          >
            <TrashIcon size={20} />
            סל מחזור
            {deletedCount > 0 && <span className="filter-count-badge">{deletedCount}</span>}
          </button>
        </div>

        {filtersOpen && (
          <div className="repo-filter-panel">
            <FilterBlock label="סוג">
              <button
                type="button"
                className={`pace-pill ${typeFilter.has(MOOD_TYPE_ID) ? 'is-active' : ''}`}
                onClick={() => toggleSet(typeFilter, setTypeFilter, MOOD_TYPE_ID)}
                aria-pressed={typeFilter.has(MOOD_TYPE_ID)}
              >
                צ'ק-אין רגשי
              </button>
              {ANALYSIS_TYPE_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`pace-pill ${typeFilter.has(id) ? 'is-active' : ''}`}
                  onClick={() => toggleSet(typeFilter, setTypeFilter, id)}
                  aria-pressed={typeFilter.has(id)}
                >
                  {ANALYSIS_TYPES[id].label}
                </button>
              ))}
            </FilterBlock>
            <FilterBlock label="סכמות">
              {SCHEMA_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`pace-pill ${schemaFilter.has(id) ? 'is-active' : ''}`}
                  onClick={() => toggleSet(schemaFilter, setSchemaFilter, id)}
                  aria-pressed={schemaFilter.has(id)}
                >
                  {SCHEMA_LABELS[id]}
                </button>
              ))}
            </FilterBlock>
            <FilterBlock label="דפוסים">
              {PATTERN_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`pace-pill ${patternFilter.has(id) ? 'is-active' : ''}`}
                  onClick={() => toggleSet(patternFilter, setPatternFilter, id)}
                  aria-pressed={patternFilter.has(id)}
                >
                  {PATTERN_LABELS[id]}
                </button>
              ))}
            </FilterBlock>
            <FilterBlock label="חיפוש חופשי">
              <input
                type="search"
                className="thought-input repo-search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="חיפוש בכותרות, סיכומים, תיוגים, תובנות, רגשות"
              />
            </FilterBlock>
            {isFiltered && (
              <button type="button" className="link-btn" onClick={resetFilters}>
                איפוס סינון
              </button>
            )}
          </div>
        )}

        {!ready && <Loading />}
        {ready && totalCount === 0 && (
          <div className="repo-empty">
            <p className="ck-empty">המאגר ריק. ייבא ניתוח או רשום צ'ק-אין רגשי ראשון.</p>
          </div>
        )}
        {ready && totalCount > 0 && filteredCount === 0 && (
          <p className="ck-empty">אין רישומים שתואמים לסינון. נסה לשנות את התנאים.</p>
        )}
        {ready && filteredCount > 0 && (
          <ul className="analysis-list">
            {visible.map((item) => (
              item._kind === 'mood'
                ? <MoodListItem key={`mood-${item._date}-${item._ts}`} entry={item} />
                : <AnalysisListItem key={item._id} analysis={item} />
            ))}
          </ul>
        )}
      </main>
      {undoInfo && (
        <UndoToast
          message={undoInfo.title ? `נמחק: ${undoInfo.title}` : 'הניתוח נמחק'}
          onUndo={handleUndo}
          onDismiss={() => setUndoInfo(null)}
        />
      )}
    </div>
  );
}

function FilterBlock({ label, children }) {
  return (
    <div className="filter-block">
      <h4 className="detail-label">{label}</h4>
      <div className="filter-block-row">{children}</div>
    </div>
  );
}
