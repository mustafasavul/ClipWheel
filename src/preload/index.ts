import { contextBridge, ipcRenderer } from 'electron';
import type { AppApi, CleanupRequest, ClipboardItem, HistoryQuery, Settings } from '../shared/types';

const api: AppApi = {
  getItems: (query?: HistoryQuery) => ipcRenderer.invoke('items:list', query) as Promise<ClipboardItem[]>,
  countItems: (query?: HistoryQuery) => ipcRenderer.invoke('items:count', query) as Promise<number>,
  getRecentWheelItems: (count?: number) => ipcRenderer.invoke('items:wheel', count) as Promise<ClipboardItem[]>,
  copyItem: (id: string) => ipcRenderer.invoke('items:copy', id) as Promise<void>,
  deleteItem: (id: string) => ipcRenderer.invoke('items:delete', id) as Promise<void>,
  togglePin: (id: string) => ipcRenderer.invoke('items:pin', id) as Promise<ClipboardItem>,
  toggleFavorite: (id: string) => ipcRenderer.invoke('items:favorite', id) as Promise<ClipboardItem>,
  saveTransformedItem: (id: string, text: string, title: string) => ipcRenderer.invoke('items:save-transformed', id, text, title) as Promise<ClipboardItem>,
  getSettings: () => ipcRenderer.invoke('settings:get') as Promise<Settings>,
  updateSettings: (settings: Partial<Settings>) => ipcRenderer.invoke('settings:update', settings) as Promise<Settings>,
  cleanup: (request: CleanupRequest) => ipcRenderer.invoke('cleanup:run', request),
  clearSystemClipboard: () => ipcRenderer.invoke('system:clear-clipboard') as Promise<void>,
  getImageDataUrl: (id: string) => ipcRenderer.invoke('image:data-url', id) as Promise<string | null>,
  extractImageText: (id: string) => ipcRenderer.invoke('ocr:extract', id),
  showWindow: (name: 'history' | 'settings' | 'wheel') => ipcRenderer.invoke('window:show', name) as Promise<void>,
  closeWheel: () => ipcRenderer.invoke('wheel:close') as Promise<void>,
  onClipboardItem: (handler: (item: ClipboardItem) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, item: ClipboardItem) => handler(item);
    ipcRenderer.on('clipboard-item', listener);
    return () => ipcRenderer.removeListener('clipboard-item', listener);
  },
  onItemsChanged: (handler: () => void) => {
    const listener = () => handler();
    ipcRenderer.on('items-changed', listener);
    return () => ipcRenderer.removeListener('items-changed', listener);
  },
  onWheelOpened: (handler: () => void) => {
    const listener = () => handler();
    ipcRenderer.on('wheel-opened', listener);
    return () => ipcRenderer.removeListener('wheel-opened', listener);
  },
};

contextBridge.exposeInMainWorld('clipwheel', api);
