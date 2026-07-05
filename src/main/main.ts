import 'electron-squirrel-startup';
import fs from 'node:fs';
import path from 'node:path';
import { app, BrowserWindow, clipboard, dialog, globalShortcut, ipcMain, Menu, nativeImage, screen, Tray } from 'electron';
import type { ClipboardItem, CleanupRequest, HistoryQuery, Settings } from '../shared/types';
import { ClipRepository } from './repository';
import { ClipboardService } from './clipboardService';
import { CleanupService } from './cleanupService';
import { OCRService } from './ocrService';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

let repository: ClipRepository;
let clipboardService: ClipboardService;
let cleanupService: CleanupService;
let ocrService: OCRService;
let mainWindow: BrowserWindow | null = null;
let wheelWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let quitting = false;
const wheelWindowWidth = 1360;
const wheelWindowHeight = 760;
const wheelWindowOffsetX = wheelWindowWidth / 2;
const wheelWindowOffsetY = wheelWindowHeight / 2;

const rendererUrl = typeof MAIN_WINDOW_VITE_DEV_SERVER_URL === 'string' ? MAIN_WINDOW_VITE_DEV_SERVER_URL : undefined;
const preloadPath = path.join(__dirname, 'index.js');

async function createMainWindow(): Promise<BrowserWindow> {
  const window = new BrowserWindow({
    width: 1160,
    height: 760,
    minWidth: 960,
    minHeight: 620,
    show: false,
    title: 'ClipWheel',
    backgroundColor: '#111214',
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  await loadRenderer(window, '/');
  window.once('ready-to-show', () => window.show());
  window.on('close', (event) => {
    if (!quitting) {
      event.preventDefault();
      window.hide();
    }
  });
  mainWindow = window;
  return window;
}

async function createWheelWindow(): Promise<BrowserWindow> {
  const window = new BrowserWindow({
    width: wheelWindowWidth,
    height: wheelWindowHeight,
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  await loadRenderer(window, '/?surface=wheel');
  window.on('blur', () => window.hide());
  wheelWindow = window;
  return window;
}

async function loadRenderer(window: BrowserWindow, route: string): Promise<void> {
  if (rendererUrl) {
    await window.loadURL(`${rendererUrl}${route}`);
  } else {
    await window.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`), { hash: route.replace(/^\//, '') });
  }
}

function registerShortcut(): void {
  const accelerator = process.platform === 'darwin' ? 'CommandOrControl+Shift+V' : 'Control+Shift+V';
  globalShortcut.register(accelerator, () => {
    void showWheel();
  });
}

async function showWheel(): Promise<void> {
  const window = wheelWindow ?? (await createWheelWindow());
  const settings = repository.getSettings();
  if (settings.wheelPosition === 'center') {
    const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    const x = Math.round(display.workArea.x + display.workArea.width / 2 - wheelWindowOffsetX);
    const y = Math.round(display.workArea.y + display.workArea.height / 2 - wheelWindowOffsetY);
    window.setPosition(x, y);
  } else {
    const point = screen.getCursorScreenPoint();
    window.setPosition(point.x - wheelWindowOffsetX, point.y - wheelWindowOffsetY);
  }
  window.show();
  window.focus();
  window.webContents.send('wheel-opened');
}

function createTray(): void {
  const icon = nativeImage.createFromDataURL(
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" rx="16" fill="%23d4e7b8"/><path d="M16 7a9 9 0 1 1 0 18a9 9 0 0 1 0-18zm0 4a5 5 0 1 0 0 10a5 5 0 0 0 0-10z" fill="%23162015"/></svg>',
  );
  tray = new Tray(icon);
  tray.setToolTip('ClipWheel');
  refreshTrayMenu();
}

function refreshTrayMenu(): void {
  if (!tray) return;
  const settings = repository.getSettings();
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Open ClipWheel', click: () => void showMain() },
      { label: 'Open History', click: () => void showMain() },
      { label: settings.pauseCapture ? 'Resume Capture' : 'Pause Capture', click: () => void updateSettings({ pauseCapture: !settings.pauseCapture }) },
      { type: 'separator' },
      { label: 'Clear Current Clipboard', click: () => clipboard.clear() },
      { label: 'Clear History', click: () => confirmAndCleanup({ mode: 'all' }) },
      { type: 'separator' },
      { label: 'Settings', click: () => void showMain() },
      { label: 'Quit', click: () => quitApp() },
    ]),
  );
}

async function showMain(): Promise<void> {
  const window = mainWindow ?? (await createMainWindow());
  window.show();
  window.focus();
}

async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const settings = repository.updateSettings(patch);
  app.setLoginItemSettings({ openAtLogin: settings.startAtLogin });
  refreshTrayMenu();
  broadcastItemsChanged();
  return settings;
}

function confirmAndCleanup(request: CleanupRequest): void {
  if (!mainWindow) return;
  const result = dialog.showMessageBoxSync(mainWindow, {
    type: 'warning',
    buttons: ['Cancel', 'Delete'],
    defaultId: 0,
    cancelId: 0,
    message: 'Delete clipboard history?',
    detail: 'This action uses soft delete unless you purge deleted items.',
  });
  if (result === 1) {
    cleanupService.run(request);
    broadcastItemsChanged();
  }
}

function quitApp(): void {
  quitting = true;
  if (repository.getSettings().clearClipboardOnQuit) clipboard.clear();
  app.quit();
}

function registerIpc(): void {
  ipcMain.handle('items:list', (_event, query?: HistoryQuery) => repository.listItems(query));
  ipcMain.handle('items:count', (_event, query?: HistoryQuery) => repository.countItems(query));
  ipcMain.handle('items:wheel', (_event, count?: number) => repository.listItems({ limit: count ?? repository.getSettings().wheelItemCount }));
  ipcMain.handle('items:copy', (_event, id: string) => {
    clipboardService.restore(repository.getItem(id));
    wheelWindow?.hide();
    broadcastItemsChanged();
  });
  ipcMain.handle('items:delete', (_event, id: string) => {
    repository.softDelete(id);
    broadcastItemsChanged();
  });
  ipcMain.handle('items:pin', (_event, id: string) => {
    const item = repository.getItem(id);
    const updated = repository.updateFlags(id, { isPinned: !item.isPinned });
    broadcastItemsChanged();
    return updated;
  });
  ipcMain.handle('items:favorite', (_event, id: string) => {
    const item = repository.getItem(id);
    const updated = repository.updateFlags(id, { isFavorite: !item.isFavorite });
    broadcastItemsChanged();
    return updated;
  });
  ipcMain.handle('items:save-transformed', (_event, id: string, text: string, title: string) => {
    const source = repository.getItem(id);
    const item = repository.createItem({
      type: source.type === 'url' ? 'url' : source.type === 'command' ? 'command' : 'plain_text',
      title,
      previewText: text.slice(0, 600),
      contentText: text,
      sizeBytes: Buffer.byteLength(text),
      contentHash: `${source.contentHash}:${Date.now()}`,
    });
    broadcastItemsChanged();
    return item;
  });
  ipcMain.handle('settings:get', () => repository.getSettings());
  ipcMain.handle('settings:update', (_event, settings: Partial<Settings>) => updateSettings(settings));
  ipcMain.handle('cleanup:run', (_event, request: CleanupRequest) => {
    const job = cleanupService.run(request);
    broadcastItemsChanged();
    return job;
  });
  ipcMain.handle('system:clear-clipboard', () => clipboard.clear());
  ipcMain.handle('image:data-url', (_event, id: string) => {
    const item = repository.getItem(id);
    const imagePath = item.thumbnailPath ?? item.imagePath;
    if (!imagePath || !fs.existsSync(imagePath)) return null;
    return `data:image/png;base64,${fs.readFileSync(imagePath).toString('base64')}`;
  });
  ipcMain.handle('ocr:extract', (_event, id: string) => ocrService.extractText(id));
  ipcMain.handle('window:show', (_event, name: 'history' | 'settings' | 'wheel') => (name === 'wheel' ? showWheel() : showMain()));
  ipcMain.handle('wheel:close', () => wheelWindow?.hide());
}

function broadcastItemsChanged(): void {
  BrowserWindow.getAllWindows().forEach((window) => window.webContents.send('items-changed'));
}

app.whenReady().then(async () => {
  repository = new ClipRepository();
  clipboardService = new ClipboardService(repository);
  cleanupService = new CleanupService(repository);
  ocrService = new OCRService(repository);
  registerIpc();
  clipboardService.on('captured', (item: ClipboardItem) => {
    BrowserWindow.getAllWindows().forEach((window) => window.webContents.send('clipboard-item', item));
    broadcastItemsChanged();
  });
  await createMainWindow();
  await createWheelWindow();
  registerShortcut();
  createTray();
  clipboardService.start();
});

app.on('activate', () => void showMain());
app.on('window-all-closed', () => {
  // Keep the tray-resident app alive until the explicit Quit menu item is used.
});
app.on('before-quit', () => {
  quitting = true;
  clipboardService?.stop();
  globalShortcut.unregisterAll();
  repository?.close();
});
