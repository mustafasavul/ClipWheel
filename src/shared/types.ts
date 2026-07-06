export type ClipboardItemType =
  | 'plain_text'
  | 'rich_text'
  | 'code'
  | 'url'
  | 'image'
  | 'file_reference'
  | 'command';

export type CodeLanguage = 'javascript' | 'typescript' | 'json' | 'html' | 'css' | 'shell' | 'python' | 'unknown';

export type ClipboardPlatform = 'darwin' | 'win32' | 'linux' | 'unknown';

export interface ClipboardFormatInfo {
  rawFormats: string[];
  normalizedFormats: string[];
  hasText: boolean;
  hasHtml: boolean;
  hasRtf: boolean;
  hasImage: boolean;
  hasFiles: boolean;
  platform: ClipboardPlatform;
}

export type ContentSignalKind =
  | 'json'
  | 'json_fragment'
  | 'html'
  | 'url'
  | 'email'
  | 'hex_color'
  | 'markdown'
  | 'code'
  | 'code_block'
  | 'shell';

export interface ContentSignal {
  kind: ContentSignalKind;
  confidence: 'high' | 'medium' | 'low';
  language?: CodeLanguage;
  range?: { start: number; end: number };
  metadata?: Record<string, string | number | boolean>;
}

export interface ClipboardItem {
  id: string;
  type: ClipboardItemType;
  title: string;
  previewText: string;
  contentText: string | null;
  contentHtml: string | null;
  contentRtf: string | null;
  imagePath: string | null;
  thumbnailPath: string | null;
  filePaths: string[];
  formatInfo: ClipboardFormatInfo;
  contentSignals: ContentSignal[];
  url: string | null;
  codeLanguage: CodeLanguage | null;
  sourceApp: string | null;
  sizeBytes: number;
  contentHash: string;
  isPinned: boolean;
  isFavorite: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
  deletedAt: string | null;
}

export interface ClipboardItemInput {
  type: ClipboardItemType;
  title: string;
  previewText: string;
  contentText?: string | null;
  contentHtml?: string | null;
  contentRtf?: string | null;
  imagePath?: string | null;
  thumbnailPath?: string | null;
  filePaths?: string[];
  formatInfo?: ClipboardFormatInfo;
  contentSignals?: ContentSignal[];
  url?: string | null;
  codeLanguage?: CodeLanguage | null;
  sourceApp?: string | null;
  sizeBytes: number;
  contentHash: string;
}

export interface Settings {
  startAtLogin: boolean;
  showTrayIcon: boolean;
  wheelPosition: 'center' | 'cursor';
  wheelItemCount: 6 | 8 | 10 | 12;
  theme: 'system' | 'dark' | 'light';
  wheelAppearance: WheelAppearanceSettings;
  capturePlainText: boolean;
  captureRichText: boolean;
  captureImages: boolean;
  captureFiles: boolean;
  captureCode: boolean;
  ignoreDuplicates: boolean;
  maxHistoryItems: number;
  maxImageSizeMb: number;
  autoDeleteAfterDays: number;
  pauseCapture: boolean;
  ignoredSourceApps: string[];
  clearClipboardOnQuit: boolean;
  autoPaste: boolean;
}

export interface WheelAppearanceSettings {
  colorMode: 'palette' | 'single';
  paletteColors: string[];
  segmentColor: string;
  segmentOpacity: number;
  activeColor: string;
  activeOpacity: number;
  activeLineColor: string;
  ringLineColor: string;
  panelColor: string;
  panelOpacity: number;
  iconBackgroundColor: string;
  labelColor: string;
}

export interface HistoryQuery {
  search?: string;
  type?: ClipboardItemType | 'all';
  dateFilter?: 'all' | 'today' | 'last7' | 'last30' | 'custom';
  startDate?: string;
  endDate?: string;
  includeDeleted?: boolean;
  limit?: number;
  offset?: number;
}

export interface CleanupRequest {
  mode: 'all' | 'unpinned' | 'older_than' | 'between' | 'type' | 'purge_deleted';
  includePinned?: boolean;
  olderThan?: string;
  startDate?: string;
  endDate?: string;
  type?: ClipboardItemType;
}

export interface CleanupJob {
  id: string;
  action: string;
  criteriaJson: string;
  deletedCount: number;
  createdAt: string;
}

export interface ClipboardSnapshot {
  text: string;
  html: string;
  rtf: string;
  imageDataUrl: string | null;
  filePaths: string[];
  formats: string[];
}

export interface AppApi {
  getItems(query?: HistoryQuery): Promise<ClipboardItem[]>;
  countItems(query?: HistoryQuery): Promise<number>;
  getRecentWheelItems(count?: number): Promise<ClipboardItem[]>;
  copyItem(id: string): Promise<void>;
  deleteItem(id: string): Promise<void>;
  togglePin(id: string): Promise<ClipboardItem>;
  toggleFavorite(id: string): Promise<ClipboardItem>;
  saveTransformedItem(id: string, text: string, title: string): Promise<ClipboardItem>;
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<Settings>): Promise<Settings>;
  cleanup(request: CleanupRequest): Promise<CleanupJob>;
  clearSystemClipboard(): Promise<void>;
  getImageDataUrl(id: string): Promise<string | null>;
  showWindow(name: 'history' | 'settings' | 'wheel'): Promise<void>;
  closeWheel(): Promise<void>;
  onClipboardItem(handler: (item: ClipboardItem) => void): () => void;
  onItemsChanged(handler: () => void): () => void;
  onWheelOpened(handler: () => void): () => void;
}
