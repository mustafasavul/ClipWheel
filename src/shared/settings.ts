import type { Settings } from './types';

export const defaultSettings: Settings = {
  startAtLogin: false,
  showTrayIcon: true,
  wheelPosition: 'center',
  wheelItemCount: 8,
  theme: 'system',
  capturePlainText: true,
  captureRichText: true,
  captureImages: true,
  captureFiles: true,
  captureCode: true,
  ignoreDuplicates: true,
  maxHistoryItems: 5000,
  maxImageSizeMb: 25,
  autoDeleteAfterDays: 0,
  pauseCapture: false,
  ignoredSourceApps: ['1Password', 'Bitwarden', 'KeePass', 'Dashlane', 'LastPass'],
  clearClipboardOnQuit: false,
  autoPaste: false,
};
