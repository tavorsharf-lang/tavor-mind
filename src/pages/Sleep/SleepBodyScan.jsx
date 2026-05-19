import { BodyScanAnim } from '../../screens/tools/components/somatic/SomaticAnimations.jsx';

const DURATION_SEC = 140;

export default function SleepBodyScan({ onComplete, onStop }) {
  return (
    <div className="sleep-page">
      <button type="button" className="sleep-stop" onClick={onStop}>עצור</button>

      <div className="sleep-bodyscan-stage">
        <BodyScanAnim durationSec={DURATION_SEC} onComplete={onComplete} />
      </div>
    </div>
  );
}
