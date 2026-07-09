import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type { AppApi, CleanupRequest, ClipboardItem, HistoryQuery, Settings } from '../../shared/types';

export const clipwheelClient: AppApi = {
  getItems: (query?: HistoryQuery) => invoke<ClipboardItem[]>('get_items', { query }),
  countItems: (query?: HistoryQuery) => invoke<number>('count_items', { query }),
  getRecentWheelItems: (count?: number) => invoke<ClipboardItem[]>('get_recent_wheel_items', { count }),
  copyItem: (id: string) => invoke<void>('copy_item', { id }),
  deleteItem: (id: string) => invoke<void>('delete_item', { id }),
  togglePin: (id: string) => invoke<ClipboardItem>('toggle_pin', { id }),
  toggleFavorite: (id: string) => invoke<ClipboardItem>('toggle_favorite', { id }),
  saveTransformedItem: (id: string, text: string, title: string) => invoke<ClipboardItem>('save_transformed_item', { id, text, title }),
  getSettings: () => invoke<Settings>('get_settings'),
  updateSettings: (settings: Partial<Settings>) => invoke<Settings>('update_settings', { settings }),
  setShortcutCaptureActive: (active: boolean) => invoke<void>('set_shortcut_capture_active', { active }),
  cleanup: (request: CleanupRequest) => invoke('cleanup', { request }),
  clearSystemClipboard: () => invoke<void>('clear_system_clipboard'),
  getImageDataUrl: (id: string) => invoke<string | null>('get_image_data_url', { id }),
  showWindow: (name: 'history' | 'settings' | 'wheel') => invoke<void>('show_window', { name }),
  closeWheel: () => invoke<void>('close_wheel'),
  onClipboardItem: (handler: (item: ClipboardItem) => void) => subscribe<ClipboardItem>('clipboard-item', handler),
  onItemsChanged: (handler: () => void) => subscribe('items-changed', handler),
  onWheelOpened: (handler: () => void) => subscribe('wheel-opened', handler),
};

function subscribe<T>(event: string, handler: (payload: T) => void): () => void {
  let unlisten: (() => void) | null = null;
  void listen<T>(event, (message) => handler(message.payload)).then((next) => {
    unlisten = next;
  });
  return () => unlisten?.();
}
