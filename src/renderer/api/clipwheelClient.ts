import { invoke } from '@tauri-apps/api/core';
import { listen, type Event } from '@tauri-apps/api/event';
import type { AppApi, CleanupRequest, ClipboardFlagColor, ClipboardItem, HistoryQuery, Settings } from '../../shared/types';

type InvokeFn = <T>(command: string, args?: Record<string, unknown>) => Promise<T>;
type ListenFn = <T>(event: string, handler: (event: Event<T>) => void) => Promise<() => void>;

export function createClipwheelClient(dependencies: { invoke: InvokeFn; listen: ListenFn }): AppApi {
  const invokeCommand = dependencies.invoke;
  const listenEvent = dependencies.listen;
  return {
    getItems: (query?: HistoryQuery) => invokeCommand<ClipboardItem[]>('get_items', { query }),
    countItems: (query?: HistoryQuery) => invokeCommand<number>('count_items', { query }),
    getRecentWheelItems: (count?: number) => invokeCommand<ClipboardItem[]>('get_recent_wheel_items', { count }),
    copyItem: (id: string) => invokeCommand<void>('copy_item', { id }),
    deleteItem: (id: string) => invokeCommand<void>('delete_item', { id }),
    togglePin: (id: string) => invokeCommand<ClipboardItem>('toggle_pin', { id }),
    toggleFavorite: (id: string) => invokeCommand<ClipboardItem>('toggle_favorite', { id }),
    updateItemTitle: (id: string, title: string) => invokeCommand<ClipboardItem>('update_item_title', { id, title }),
    setItemFlag: (id: string, flag: ClipboardFlagColor | null) => invokeCommand<ClipboardItem>('set_item_flag', { id, flag }),
    saveTransformedItem: (id: string, text: string, title: string) => invokeCommand<ClipboardItem>('save_transformed_item', { id, text, title }),
    getSettings: () => invokeCommand<Settings>('get_settings'),
    updateSettings: (settings: Partial<Settings>) => invokeCommand<Settings>('update_settings', { settings }),
    setShortcutCaptureActive: (active: boolean) => invokeCommand<void>('set_shortcut_capture_active', { active }),
    cleanup: (request: CleanupRequest) => invokeCommand('cleanup', { request }),
    getImageDataUrl: (id: string) => invokeCommand<string | null>('get_image_data_url', { id }),
    showWindow: (name: 'history' | 'settings' | 'wheel') => invokeCommand<void>('show_window', { name }),
    closeWheel: () => invokeCommand<void>('close_wheel'),
    onClipboardItem: (handler: (item: ClipboardItem) => void) => subscribe(listenEvent, 'clipboard-item', handler),
    onItemsChanged: (handler: () => void) => subscribe(listenEvent, 'items-changed', handler),
    onWheelOpened: (handler: () => void) => subscribe(listenEvent, 'wheel-opened', handler),
  };
}

export const clipwheelClient = createClipwheelClient({ invoke, listen });

function subscribe<T>(listenEvent: ListenFn, event: string, handler: (payload: T) => void): () => void {
  let disposed = false;
  let unlisten: (() => void) | null = null;
  let retryTimer: number | undefined;
  const attach = () => {
    void listenEvent<T>(event, (message) => handler(message.payload)).then((next) => {
      if (disposed) {
        next();
        return;
      }
      unlisten = next;
    }).catch(() => {
      if (!disposed) retryTimer = window.setTimeout(attach, 1_000);
    });
  };
  attach();
  return () => {
    disposed = true;
    window.clearTimeout(retryTimer);
    unlisten?.();
  };
}
