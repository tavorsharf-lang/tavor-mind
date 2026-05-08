import { useEffect, useState } from 'react';
import ToolHeader from '../toolbox/components/ToolHeader.jsx';
import ScopeSelector from './components/ScopeSelector.jsx';
import ExportPrompterModal from '../../components/therapy/ExportPrompterModal.jsx';
import EmptyState from './components/EmptyState.jsx';
import ReviewSkeleton from './components/ReviewSkeleton.jsx';
import MoodRhythm from './components/MoodRhythm.jsx';
import EmotionalLandscape from './components/EmotionalLandscape.jsx';
import TriggersList from './components/TriggersList.jsx';
import PatternsPresence from './components/PatternsPresence.jsx';
import ModesActive from './components/ModesActive.jsx';
import SchemasActivated from './components/SchemasActivated.jsx';
import CoreChildSection from './components/CoreChildSection.jsx';
import OpenQuestion from './components/OpenQuestion.jsx';
import Timeline from './components/Timeline.jsx';
import { aggregateReview } from '../../utils/reviewAggregator.js';

export default function ReviewScreen() {
  const [scope, setScope] = useState('week');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    aggregateReview(scope).then((result) => {
      if (cancelled) return;
      setData(result);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [scope]);

  return (
    <div className="tool-page review-page ds2-themed">
      <ToolHeader
        title="המראה"
        subtitle="מה שראית, לא ראית, ומה ביקש את תשומת הלב"
        subtitleItalic
        backTo="/"
      />
      <div className="review-scope-bar">
        <ScopeSelector value={scope} onChange={setScope} />
        <button
          type="button"
          className="link-btn review-export-btn"
          onClick={() => setExportOpen(true)}
        >
          ייצא לטיפול ←
        </button>
      </div>
      <main className="tool-content review-content">
        {loading && <ReviewSkeleton />}
        {!loading && data && !data.hasEnoughData && <EmptyState />}
        {!loading && data && data.hasEnoughData && (
          <>
            <MoodRhythm data={data.moodRhythm} />
            <EmotionalLandscape data={data.emotions} />
            <TriggersList data={data.triggers} scope={data.scope} />
            <PatternsPresence data={data.patterns} />
            <ModesActive data={data.modes} />
            <SchemasActivated data={data.schemas} />
            <CoreChildSection data={data.coreChild} />
            <OpenQuestion aggregate={data} />
            <Timeline scope={scope} />
          </>
        )}
        {!loading && data && !data.hasEnoughData && (
          <Timeline scope={scope} />
        )}
      </main>
      <ExportPrompterModal open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}
