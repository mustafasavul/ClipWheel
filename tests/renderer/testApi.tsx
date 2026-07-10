import type React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { defaultSettings } from '../../src/shared/settings';
import type { AppApi, ClipboardItem } from '../../src/shared/types';
import { ClipwheelApiProvider } from '../../src/renderer/data/ClipwheelApiProvider';

export const textItem: ClipboardItem = {
  id: 'item-1',
  type: 'plain_text',
  title: 'First capture',
  previewText: 'Hello world',
  contentText: 'Hello world',
  contentHtml: null,
  contentRtf: null,
  imagePath: null,
  thumbnailPath: null,
  filePaths: [],
  formatInfo: { rawFormats: [], normalizedFormats: [], hasText: true, hasHtml: false, hasRtf: false, hasImage: false, hasFiles: false, platform: 'unknown' },
  contentSignals: [],
  url: null,
  codeLanguage: null,
  sourceApp: null,
  sizeBytes: 11,
  contentHash: 'hash-1',
  isPinned: false,
  isFavorite: false,
  isDeleted: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  lastUsedAt: null,
  deletedAt: null,
};

export function createTestApi(overrides: Partial<AppApi> = {}) {
  const listeners = {
    clipboard: new Set<(item: ClipboardItem) => void>(),
    items: new Set<() => void>(),
    wheel: new Set<() => void>(),
  };
  const api: AppApi = {
    getItems: vi.fn(async () => [textItem]),
    countItems: vi.fn(async () => 1),
    getRecentWheelItems: vi.fn(async () => [textItem]),
    copyItem: vi.fn(async () => undefined),
    deleteItem: vi.fn(async () => undefined),
    togglePin: vi.fn(async () => textItem),
    toggleFavorite: vi.fn(async () => textItem),
    saveTransformedItem: vi.fn(async () => textItem),
    getSettings: vi.fn(async () => defaultSettings),
    updateSettings: vi.fn(async (patch) => ({ ...defaultSettings, ...patch })),
    setShortcutCaptureActive: vi.fn(async () => undefined),
    cleanup: vi.fn(async () => ({ id: 'cleanup-1', action: 'all', criteriaJson: '{}', deletedCount: 1, createdAt: '2026-01-01T00:00:00.000Z' })),
    getImageDataUrl: vi.fn(async () => null),
    showWindow: vi.fn(async () => undefined),
    closeWheel: vi.fn(async () => undefined),
    onClipboardItem: (handler) => { listeners.clipboard.add(handler); return () => listeners.clipboard.delete(handler); },
    onItemsChanged: (handler) => { listeners.items.add(handler); return () => listeners.items.delete(handler); },
    onWheelOpened: (handler) => { listeners.wheel.add(handler); return () => listeners.wheel.delete(handler); },
    ...overrides,
  };
  return {
    api,
    emitClipboard: (item = textItem) => listeners.clipboard.forEach((listener) => listener(item)),
    emitItemsChanged: () => listeners.items.forEach((listener) => listener()),
    emitWheelOpened: () => listeners.wheel.forEach((listener) => listener()),
  };
}

export function createTestWrapper(api: AppApi) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}><ClipwheelApiProvider api={api}>{children}</ClipwheelApiProvider></QueryClientProvider>;
  };
}
