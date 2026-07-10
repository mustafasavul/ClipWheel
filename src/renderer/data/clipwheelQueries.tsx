import { createContext, use, useEffect, useMemo, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AppApi, CleanupRequest, ClipboardFlagColor, ClipboardItem, HistoryQuery, Settings } from '../../shared/types';
import { clipwheelClient } from '../api/clipwheelClient';

export const clipwheelQueryKeys = {
  all: ['clipwheel'] as const,
  history: (query: HistoryQuery) => ['clipwheel', 'history', query] as const,
  historyCount: (query: HistoryQuery) => ['clipwheel', 'history-count', query] as const,
  settings: ['clipwheel', 'settings'] as const,
  wheelItems: (count: number) => ['clipwheel', 'wheel-items', count] as const,
  image: (id: string) => ['clipwheel', 'image', id] as const,
};

export const ClipwheelApiContext = createContext<AppApi>(clipwheelClient);

export function useClipwheelApi(): AppApi {
  return use(ClipwheelApiContext);
}

export function useHistoryItemsQuery(query: HistoryQuery) {
  const api = useClipwheelApi();
  return useQuery({
    queryKey: clipwheelQueryKeys.history(query),
    queryFn: () => api.getItems(query),
    refetchInterval: 1_500,
  });
}

export function useHistoryCountQuery(query: HistoryQuery) {
  const api = useClipwheelApi();
  return useQuery({
    queryKey: clipwheelQueryKeys.historyCount(query),
    queryFn: () => api.countItems(query),
    refetchInterval: 1_500,
  });
}

export function useSettingsQuery() {
  const api = useClipwheelApi();
  return useQuery({
    queryKey: clipwheelQueryKeys.settings,
    queryFn: () => api.getSettings(),
  });
}

export function useWheelItemsQuery(count: number) {
  const api = useClipwheelApi();
  return useQuery({
    queryKey: clipwheelQueryKeys.wheelItems(count),
    queryFn: () => api.getRecentWheelItems(count),
  });
}

export function useImageQuery(id: string, enabled = true) {
  const api = useClipwheelApi();
  return useQuery({
    enabled,
    queryKey: clipwheelQueryKeys.image(id),
    queryFn: () => api.getImageDataUrl(id),
  });
}

export function useSettingsMutation() {
  const api = useClipwheelApi();
  const queryClient = useQueryClient();
  const latestMutationId = useRef(0);
  return useMutation({
    mutationFn: (patch: Partial<Settings>) => api.updateSettings(patch),
    scope: { id: 'clipwheel-settings' },
    onMutate: async (patch) => {
      const mutationId = latestMutationId.current + 1;
      latestMutationId.current = mutationId;
      await queryClient.cancelQueries({ queryKey: clipwheelQueryKeys.settings });
      const previous = queryClient.getQueryData<Settings>(clipwheelQueryKeys.settings);
      if (previous) queryClient.setQueryData(clipwheelQueryKeys.settings, { ...previous, ...patch });
      return { mutationId, previous };
    },
    onError: (_error, _patch, context) => {
      if (context?.mutationId === latestMutationId.current && context.previous) {
        queryClient.setQueryData(clipwheelQueryKeys.settings, context.previous);
      }
    },
    onSuccess: (settings, _patch, context) => {
      if (context.mutationId === latestMutationId.current) queryClient.setQueryData(clipwheelQueryKeys.settings, settings);
    },
    onSettled: async (_data, _error, _patch, context) => {
      if (context?.mutationId !== latestMutationId.current) return;
      await queryClient.invalidateQueries({ queryKey: clipwheelQueryKeys.settings });
      await queryClient.invalidateQueries({ queryKey: ['clipwheel', 'wheel-items'] });
    },
  });
}

export function useItemMutations() {
  const api = useClipwheelApi();
  const queryClient = useQueryClient();
  const invalidateItems = async () => queryClient.invalidateQueries({ queryKey: clipwheelQueryKeys.all });
  return {
    copy: useMutation({ mutationFn: (id: string) => api.copyItem(id), onSuccess: invalidateItems }),
    remove: useMutation({ mutationFn: (id: string) => api.deleteItem(id), onSuccess: invalidateItems }),
    togglePin: useMutation({ mutationFn: (id: string) => api.togglePin(id), onSuccess: invalidateItems }),
    toggleFavorite: useMutation({ mutationFn: (id: string) => api.toggleFavorite(id), onSuccess: invalidateItems }),
    updateTitle: useMutation({
      mutationFn: ({ id, title }: { id: string; title: string }) => api.updateItemTitle(id, title),
      onSuccess: invalidateItems,
    }),
    setFlag: useMutation({
      mutationFn: ({ id, flag }: { id: string; flag: ClipboardFlagColor | null }) => api.setItemFlag(id, flag),
      onSuccess: invalidateItems,
    }),
    transform: useMutation({
      mutationFn: ({ id, text, title }: { id: string; text: string; title: string }) => api.saveTransformedItem(id, text, title),
      onSuccess: invalidateItems,
    }),
  };
}

export function useCleanupMutation() {
  const api = useClipwheelApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CleanupRequest) => api.cleanup(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clipwheelQueryKeys.all }),
  });
}

export function useDesktopActions() {
  const api = useClipwheelApi();
  return useMemo(() => ({
    closeWheel: () => api.closeWheel(),
    setShortcutCaptureActive: (active: boolean) => api.setShortcutCaptureActive(active),
    showWindow: (name: 'history' | 'settings' | 'wheel') => api.showWindow(name),
  }), [api]);
}

export function useClipwheelEvents(callbacks: { onClipboardItem?: () => void; onWheelOpened?: () => void } = {}) {
  const api = useClipwheelApi();
  const queryClient = useQueryClient();
  const { onClipboardItem, onWheelOpened } = callbacks;
  useEffect(() => {
    const invalidateItems = () => void queryClient.invalidateQueries({ queryKey: clipwheelQueryKeys.all });
    const disposeItems = api.onItemsChanged(invalidateItems);
    const disposeClipboard = api.onClipboardItem((item) => {
      prependRecentCapture(queryClient, item);
      invalidateItems();
      onClipboardItem?.();
    });
    const disposeWheel = api.onWheelOpened(() => {
      invalidateItems();
      onWheelOpened?.();
    });
    return () => {
      disposeItems();
      disposeClipboard();
      disposeWheel();
    };
  }, [api, onClipboardItem, onWheelOpened, queryClient]);
}

function prependRecentCapture(queryClient: ReturnType<typeof useQueryClient>, item: ClipboardItem) {
  const historyQueries = queryClient.getQueryCache().findAll({ queryKey: ['clipwheel', 'history'] });
  const alreadyKnown = historyQueries.some((query) => queryClient.getQueryData<ClipboardItem[]>(query.queryKey)?.some((current) => current.id === item.id));
  for (const query of historyQueries) {
    const historyQuery = query.queryKey[2] as HistoryQuery | undefined;
    if (!isUnfilteredFirstPage(historyQuery)) continue;
    queryClient.setQueryData<ClipboardItem[]>(query.queryKey, (current = []) => [item, ...current.filter((entry) => entry.id !== item.id)]);
  }
  if (alreadyKnown) return;
  const countQueries = queryClient.getQueryCache().findAll({ queryKey: ['clipwheel', 'history-count'] });
  for (const query of countQueries) {
    const historyQuery = query.queryKey[2] as HistoryQuery | undefined;
    if (!isUnfilteredFirstPage(historyQuery)) continue;
    queryClient.setQueryData<number>(query.queryKey, (current = 0) => current + 1);
  }
}

function isUnfilteredFirstPage(query: HistoryQuery | undefined): boolean {
  return (query?.offset ?? 0) === 0
    && !query?.search?.trim()
    && (!query?.type || query.type === 'all')
    && (!query?.collectionFilter || query.collectionFilter === 'all')
    && (!query?.flagFilter || query.flagFilter === 'all')
    && (!query?.dateFilter || query.dateFilter === 'all')
    && query?.includeDeleted !== true;
}
