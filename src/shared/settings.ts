import type { Settings } from './types';
import { defaultWheelAppearance } from './wheelAppearance';
import { defaultWheelItems } from './wheelLimits';

export const defaultSettings: Settings = {
  startAtLogin: false,
  showTrayIcon: true,
  wheelPosition: 'center',
  wheelItemCount: defaultWheelItems,
  wheelItemIds: [],
  theme: 'system',
  language: 'system',
  shortcuts: {
    openWheel: 'CmdOrCtrl+Shift+V',
    selectActiveItem: 'Enter',
    back: 'Escape',
    wheelItems: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  },
  wheelAppearance: defaultWheelAppearance,
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
  autoPaste: false,
};
