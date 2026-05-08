// Shared helpers for soft-delete pattern (deletedAt field + 30-day undo window).
//
// Convention: an item is soft-deleted when it has a numeric `deletedAt` timestamp.
// Reads filter these out. After SOFT_DELETE_PURGE_DAYS, a lazy purge hard-removes
// them on the next list call. Pending (offline-queued) items are hard-deleted
// since they have no server presence to soft-delete and undo would have no payload.

export const SOFT_DELETE_PURGE_DAYS = 30;
export const SOFT_DELETE_PURGE_MS = SOFT_DELETE_PURGE_DAYS * 24 * 60 * 60 * 1000;

export function isSoftDeleted(item) {
  return item != null && typeof item.deletedAt === 'number' && item.deletedAt > 0;
}

export function isPurgeable(item, now = Date.now()) {
  if (!isSoftDeleted(item)) return false;
  return now - item.deletedAt > SOFT_DELETE_PURGE_MS;
}
