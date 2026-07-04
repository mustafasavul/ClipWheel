import type { CleanupRequest, ClipboardItem } from './types';

export function matchesCleanupRequest(item: ClipboardItem, request: CleanupRequest): boolean {
  if (item.isPinned && !request.includePinned && request.mode !== 'purge_deleted') return false;
  switch (request.mode) {
    case 'all':
      return !item.isDeleted;
    case 'unpinned':
      return !item.isPinned && !item.isDeleted;
    case 'older_than':
      return Boolean(request.olderThan && !item.isDeleted && item.createdAt < request.olderThan);
    case 'between':
      return Boolean(request.startDate && request.endDate && !item.isDeleted && item.createdAt >= request.startDate && item.createdAt <= request.endDate);
    case 'type':
      return Boolean(request.type && !item.isDeleted && item.type === request.type);
    case 'purge_deleted':
      return item.isDeleted;
  }
}
