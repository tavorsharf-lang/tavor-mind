import { useState } from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus.js';
import StuckItemsModal from './StuckItemsModal.jsx';

export default function SyncStatusBadge() {
  const { online, pendingCount, stuckCount, activeCount } = useNetworkStatus();
  const [open, setOpen] = useState(false);

  if (online && pendingCount === 0) return null;

  if (!online) {
    return (
      <div className="sync-badge sync-badge-offline" role="status" aria-live="polite">
        <span className="sync-dot sync-dot-offline" aria-hidden="true" />
        <span>
          לא מקוון{pendingCount > 0 ? ` · ${pendingCount} ממתינים לסנכרון` : ''}
        </span>
      </div>
    );
  }

  if (stuckCount > 0) {
    return (
      <>
        <button
          type="button"
          className="sync-badge sync-badge-stuck"
          onClick={() => setOpen(true)}
          aria-label={`${stuckCount} פריטים לא הועלו, פתח פרטים`}
        >
          <span className="sync-dot sync-dot-stuck" aria-hidden="true" />
          <span>{stuckCount} לא הועלו · הצג</span>
        </button>
        <StuckItemsModal open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  return (
    <div className="sync-badge sync-badge-syncing" role="status" aria-live="polite">
      <span className="sync-dot sync-dot-syncing" aria-hidden="true" />
      <span>מסנכרן {activeCount}…</span>
    </div>
  );
}
