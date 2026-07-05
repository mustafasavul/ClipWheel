import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Braces,
  Clipboard,
  Command,
  Copy,
  Eye,
  File,
  Heart,
  Image,
  Link,
  Pin,
  PinOff,
  QrCode,
  Search,
  Settings as SettingsIcon,
  Shield,
  Star,
  Trash2,
  Type,
  Wand2,
  X,
} from 'lucide-react';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import cssLang from 'highlight.js/lib/languages/css';
import bash from 'highlight.js/lib/languages/bash';
import python from 'highlight.js/lib/languages/python';
import sanitizeHtml from 'sanitize-html';
import QRCode from 'qrcode';
import type { ClipboardItem, ClipboardItemType, HistoryQuery, Settings } from '../shared/types';
import { defaultSettings } from '../shared/settings';
import { appVersion } from '../shared/version';
import { getSegmentIndex, getSegmentTransform } from '../shared/radialGeometry';
import { transformText, type TextAction } from '../shared/textActions';
import { clipwheelClient } from './api/clipwheelClient';
import './styles/app.css';
import 'highlight.js/styles/atom-one-dark.css';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('css', cssLang);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('python', python);

const typeOptions: Array<ClipboardItemType | 'all'> = ['all', 'plain_text', 'rich_text', 'code', 'url', 'image', 'file_reference', 'command'];
const tabs = ['General', 'Clipboard', 'Privacy', 'Cleanup', 'Shortcuts', 'Advanced'] as const;
const defaultPageSize = 10;
const queryClient = new QueryClient();
const openWheelShortcut = isMacPlatform() ? 'Cmd+Shift+V' : 'Ctrl+Shift+V';
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function App() {
  const params = new URLSearchParams(window.location.search);
  const isWheel = params.get('surface') === 'wheel' || window.location.hash.includes('surface=wheel');
  return isWheel ? <WheelSurface /> : <MainSurface />;
}

function MainSurface() {
  const [view, setView] = useState<'history' | 'settings'>('history');
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [query, setQuery] = useState<HistoryQuery>({ type: 'all', dateFilter: 'all' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [totalItems, setTotalItems] = useState(0);
  const [tab, setTab] = useState<(typeof tabs)[number]>('General');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selected = items.find((item) => item.id === selectedId) ?? items[0] ?? null;
  const pagedQuery = useMemo(() => ({ ...query, limit: pageSize, offset: (page - 1) * pageSize }), [page, pageSize, query]);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [nextItems, nextSettings, nextTotal] = await Promise.all([clipwheelClient.getItems(pagedQuery), clipwheelClient.getSettings(), clipwheelClient.countItems(query)]);
      setItems(nextItems);
      setSettings(nextSettings);
      setTotalItems(nextTotal);
      if (page > 1 && nextTotal <= (page - 1) * pageSize) {
        setPage(Math.max(1, Math.ceil(nextTotal / pageSize)));
      }
      setSelectedId((current) => current && nextItems.some((item) => item.id === current) ? current : nextItems[0]?.id ?? null);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Unable to load ClipWheel data.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, pagedQuery, query]);

  useEffect(() => {
    void refresh();
    return clipwheelClient.onItemsChanged(() => void refresh());
  }, [refresh]);

  const updateSettings = async (patch: Partial<Settings>) => {
    const next = await clipwheelClient.updateSettings(patch);
    setSettings(next);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <div className="brand-wheel"><Clipboard size={21} /></div>
          <div>
            <strong>ClipWheel</strong>
            <span>Local clipboard wheel</span>
          </div>
        </div>
        <button type="button" className={`nav-button ${view === 'history' ? 'active' : ''}`} onClick={() => setView('history')}><Clipboard size={18} /> History</button>
        <button type="button" className={`nav-button ${view === 'settings' ? 'active' : ''}`} onClick={() => setView('settings')}><SettingsIcon size={18} /> Settings</button>
        <button type="button" className="nav-button" onClick={() => void clipwheelClient.showWindow('wheel')}><Command size={18} /> Open wheel</button>
        <div className="privacy-note">
          <Shield size={18} />
          <p>No telemetry, cloud sync, or external services. Data stays in the Electron userData folder.</p>
        </div>
      </aside>

      <main className={view === 'settings' ? 'settings-page' : 'workspace'}>
        {view === 'history' ? (
          <>
            <section className="history-pane">
              <header className="section-header">
                <div>
                  <p className="eyebrow">Clipboard history</p>
                  <h1>Recent captures</h1>
                </div>
                <button type="button" className="primary-button" onClick={() => void clipwheelClient.showWindow('wheel')}><Command size={18} /> Wheel</button>
              </header>
              <Filters query={query} setQuery={setQuery} resetPage={() => setPage(1)} />
              {error && <div className="error-state">{error}</div>}
              {loading ? <SkeletonList /> : <HistoryList items={items} selectedId={selected?.id ?? null} onSelect={setSelectedId} onRefresh={refresh} />}
              {!loading && totalItems > 0 && (
                <Pagination
                  page={page}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  totalPages={totalPages}
                  setPage={setPage}
                  setPageSize={(nextPageSize) => {
                    setPageSize(nextPageSize);
                    setPage(1);
                  }}
                />
              )}
            </section>

            <section className="detail-pane">
              <PreviewPanel item={selected} onRefresh={refresh} />
            </section>
          </>
        ) : (
          <section className="settings-view">
            <header className="section-header">
              <div>
                <p className="eyebrow">Preferences</p>
                <h1>Settings</h1>
              </div>
            </header>
            <SettingsPanel settings={settings} updateSettings={updateSettings} activeTab={tab} setActiveTab={setTab} onRefresh={refresh} />
          </section>
        )}
      </main>
    </div>
  );
}

function Filters({ query, setQuery, resetPage }: { query: HistoryQuery; setQuery: React.Dispatch<React.SetStateAction<HistoryQuery>>; resetPage: () => void }) {
  const updateQuery = (patch: Partial<HistoryQuery>) => {
    resetPage();
    setQuery((current) => ({ ...current, ...patch }));
  };

  return (
    <div className="filters">
      <label className="search-field">
        <Search size={17} />
        <input value={query.search ?? ''} onChange={(event) => updateQuery({ search: event.target.value })} placeholder="Search title, preview, URL" />
      </label>
      <select aria-label="Clipboard type filter" value={query.type ?? 'all'} onChange={(event) => updateQuery({ type: event.target.value as ClipboardItemType | 'all' })}>
        {typeOptions.map((type) => <option key={type} value={type}>{labelForType(type)}</option>)}
      </select>
      <select aria-label="Clipboard date filter" value={query.dateFilter ?? 'all'} onChange={(event) => updateQuery({ dateFilter: event.target.value as HistoryQuery['dateFilter'] })}>
        <option value="all">All dates</option>
        <option value="today">Today</option>
        <option value="last7">Last 7 days</option>
        <option value="last30">Last 30 days</option>
        <option value="custom">Custom</option>
      </select>
      {query.dateFilter === 'custom' && (
        <>
          <input aria-label="Start date" type="date" onChange={(event) => updateQuery({ startDate: new Date(event.target.value).toISOString() })} />
          <input aria-label="End date" type="date" onChange={(event) => updateQuery({ endDate: new Date(event.target.value).toISOString() })} />
        </>
      )}
    </div>
  );
}

function Pagination({ page, pageSize, totalItems, totalPages, setPage, setPageSize }: {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setPageSize: (pageSize: number) => void;
}) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(totalItems, page * pageSize);
  return (
    <div className="pagination-bar">
      <span>{start}-{end} / {totalItems}</span>
      <div className="pagination-controls">
        <select aria-label="Items per page" value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        <button type="button" onClick={() => setPage(1)} disabled={page === 1}>First</button>
        <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>Prev</button>
        <strong>{page} / {totalPages}</strong>
        <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages}>Next</button>
        <button type="button" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</button>
      </div>
    </div>
  );
}

function HistoryList({ items, selectedId, onSelect, onRefresh }: { items: ClipboardItem[]; selectedId: string | null; onSelect: (id: string) => void; onRefresh: () => Promise<void> }) {
  if (!items.length) {
    return (
      <div className="empty-state">
        <Clipboard size={38} />
        <h2>No clipboard items yet</h2>
        <p>Copy text, code, a URL, a screenshot, or a file path. Captures appear here automatically.</p>
      </div>
    );
  }
  return (
    <div className="history-list">
      {items.map((item, index) => (
        <button type="button" className={`history-row ${item.id === selectedId ? 'selected' : ''}`} key={item.id} onClick={() => onSelect(item.id)} style={{ '--index': index } as React.CSSProperties}>
          <span className="type-icon">{iconForType(item.type)}</span>
          <span className="row-content">
            <strong>{item.title}</strong>
            <small>{item.previewText}</small>
          </span>
          <span className="row-actions" onClick={(event) => event.stopPropagation()}>
            <IconButton label="Copy" onClick={async () => { await clipwheelClient.copyItem(item.id); await onRefresh(); }}><Copy size={16} /></IconButton>
            <IconButton label={item.isPinned ? 'Unpin' : 'Pin'} onClick={async () => { await clipwheelClient.togglePin(item.id); await onRefresh(); }}>{item.isPinned ? <PinOff size={16} /> : <Pin size={16} />}</IconButton>
            <IconButton label={item.isFavorite ? 'Unfavorite' : 'Favorite'} onClick={async () => { await clipwheelClient.toggleFavorite(item.id); await onRefresh(); }}><Heart size={16} fill={item.isFavorite ? 'currentColor' : 'none'} /></IconButton>
            <IconButton label="Delete" onClick={async () => { await clipwheelClient.deleteItem(item.id); await onRefresh(); }}><Trash2 size={16} /></IconButton>
          </span>
        </button>
      ))}
    </div>
  );
}

function PreviewPanel({ item, onRefresh }: { item: ClipboardItem | null; onRefresh: () => Promise<void> }) {
  const [qr, setQr] = useState<{ itemId: string; value: string } | null>(null);
  const [regexPattern, setRegexPattern] = useState('');
  const [regexReplacement, setRegexReplacement] = useState('');

  if (!item) {
    return (
      <div className="preview-panel empty-state">
        <Eye size={34} />
        <h2>Select an item</h2>
        <p>The detail panel shows sanitized previews, metadata, transformations, and QR actions.</p>
      </div>
    );
  }

  const text = item.contentText ?? item.url ?? item.previewText;
  const currentQr = qr?.itemId === item.id ? qr.value : null;
  const canTransform = ['plain_text', 'code', 'url', 'command', 'rich_text'].includes(item.type);
  const createQr = async () => {
    setQr({ itemId: item.id, value: await QRCode.toDataURL(text, { margin: 1, width: 320, color: { dark: '#1f2520', light: '#f4f6f2' } }) });
  };
  const applyAction = async (action: TextAction, title: string) => {
    const result = transformText(text, action);
    await clipwheelClient.saveTransformedItem(item.id, result, title);
    await onRefresh();
  };

  return (
    <div className="preview-panel">
      <header className="preview-header">
        <div>
          <p className="eyebrow">{labelForType(item.type)}</p>
          <h2>{item.title}</h2>
        </div>
        <button type="button" className="primary-button" onClick={() => void clipwheelClient.copyItem(item.id)}><Copy size={17} /> Copy</button>
      </header>
      <PreviewContent item={item} />
      <ItemMetadata item={item} />
      {canTransform && (
        <div className="tool-strip">
          <IconButton label="Uppercase" onClick={() => void applyAction({ type: 'uppercase' }, 'Uppercase transform')}><Type size={16} /></IconButton>
          <IconButton label="Lowercase" onClick={() => void applyAction({ type: 'lowercase' }, 'Lowercase transform')}><Type size={16} /></IconButton>
          <IconButton label="Title case" onClick={() => void applyAction({ type: 'titlecase' }, 'Title case transform')}><Wand2 size={16} /></IconButton>
          <IconButton label="Trim" onClick={() => void applyAction({ type: 'trim' }, 'Trimmed text')}><X size={16} /></IconButton>
          <IconButton label="Dedupe spaces" onClick={() => void applyAction({ type: 'dedupe_spaces' }, 'Space-normalized text')}><Braces size={16} /></IconButton>
          <IconButton label="Slugify" onClick={() => void applyAction({ type: 'slugify' }, 'Slugified text')}><Link size={16} /></IconButton>
          <IconButton label="JSON pretty" onClick={() => void applyAction({ type: 'json_pretty' }, 'Pretty JSON')}><Braces size={16} /></IconButton>
          <IconButton label="JSON minify" onClick={() => void applyAction({ type: 'json_minify' }, 'Minified JSON')}><Braces size={16} /></IconButton>
          <IconButton label="QR code" onClick={() => void createQr()}><QrCode size={16} /></IconButton>
        </div>
      )}
      {canTransform && (
        <div className="regex-row">
          <input aria-label="Regex pattern" placeholder="Regex pattern" value={regexPattern} onChange={(event) => setRegexPattern(event.target.value)} />
          <input aria-label="Regex replacement" placeholder="Replacement" value={regexReplacement} onChange={(event) => setRegexReplacement(event.target.value)} />
          <button type="button" onClick={() => void applyAction({ type: 'regex_replace', pattern: regexPattern, replacement: regexReplacement }, 'Regex transform')}>Save</button>
        </div>
      )}
      {currentQr && (
        <div className="modal-layer">
          <button type="button" className="modal-backdrop" aria-label="Close QR modal" onClick={() => setQr(null)} />
          <div className="qr-modal" onClick={(event) => event.stopPropagation()}>
            <img src={currentQr} alt="QR for selected clipboard content" />
            <a className="secondary-button" download="clipwheel-qr.png" href={currentQr}>Save QR image</a>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemMetadata({ item }: { item: ClipboardItem }) {
  const length = getContentLength(item);
  const lines = getLineCount(item);
  const formatLabels = formatInfoLabels(item);
  const signalLabels = item.contentSignals.map(labelForSignal);
  const details = [
    { label: 'Size', value: formatBytes(item.sizeBytes) },
    { label: 'Length', value: length === null ? 'N/A' : `${length.toLocaleString()} chars` },
    { label: 'Lines', value: lines === null ? 'N/A' : lines.toLocaleString() },
    { label: 'Files', value: item.filePaths.length.toLocaleString() },
    { label: 'Clipboard formats', value: formatLabels.length ? formatLabels.join(', ') : 'Unknown' },
    { label: 'Detected content', value: signalLabels.length ? signalLabels.join(', ') : 'None' },
    { label: 'Created', value: formatDateTime(item.createdAt) },
    { label: 'Last used', value: item.lastUsedAt ? formatDateTime(item.lastUsedAt) : 'Never' },
  ];

  return (
    <div className="metadata-stack">
      <dl className="metadata-grid">
        {details.map((detail) => (
          <div key={detail.label}>
            <dt>{detail.label}</dt>
            <dd title={detail.value}>{detail.value}</dd>
          </div>
        ))}
      </dl>
      {(formatLabels.length > 0 || signalLabels.length > 0) && (
        <div className="metadata-badges" aria-label="Clipboard metadata">
          {formatLabels.map((label) => <span key={`format-${label}`}>{label}</span>)}
          {signalLabels.map((label) => <span key={`signal-${label}`}>{label}</span>)}
        </div>
      )}
      {item.formatInfo.rawFormats.length > 0 && (
        <details className="raw-formats">
          <summary>Raw clipboard formats</summary>
          <code>{item.formatInfo.rawFormats.join(', ')}</code>
        </details>
      )}
    </div>
  );
}

function PreviewContent({ item }: { item: ClipboardItem }) {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    setImageDataUrl(null);
    setImageError(null);
    if (item.type !== 'image') return () => {
      disposed = true;
    };
    void clipwheelClient.getImageDataUrl(item.id).then((dataUrl) => {
      if (disposed) return;
      if (dataUrl) {
        setImageDataUrl(dataUrl);
      } else {
        setImageError('Image file is no longer available on disk.');
      }
    }).catch((error: unknown) => {
      if (!disposed) setImageError(error instanceof Error ? error.message : 'Unable to load image preview.');
    });
    return () => {
      disposed = true;
    };
  }, [item.id, item.type]);

  if (item.type === 'image') {
    if (imageError) return <div className="image-preview image-preview-state">{imageError}</div>;
    if (!imageDataUrl) return <div className="image-preview image-preview-state">Loading image preview...</div>;
    return <img className="image-preview" src={imageDataUrl} alt="Clipboard preview" />;
  }
  if (item.type === 'file_reference') {
    return <pre className="preview-code">{item.filePaths.join('\n')}</pre>;
  }
  if (item.type === 'rich_text' && item.contentHtml) {
    return <div className="rich-preview" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.contentHtml, { allowedTags: sanitizeHtml.defaults.allowedTags.filter((tag) => tag !== 'script'), allowedAttributes: { a: ['href', 'title'], img: ['src', 'alt'] } }) }} />;
  }
  if (item.type === 'code' || item.type === 'command') {
    const language = item.codeLanguage ?? 'plaintext';
    const value = item.contentText ?? item.previewText;
    const highlighted = hljs.getLanguage(language) ? hljs.highlight(value, { language }).value : hljs.highlightAuto(value).value;
    return <pre className="preview-code"><code dangerouslySetInnerHTML={{ __html: highlighted }} /></pre>;
  }
  if (item.type === 'url') {
    const url = item.url ?? item.contentText ?? '';
    return <div className="url-preview"><Link size={22} /><strong>{safeDomain(url)}</strong><span>{url}</span></div>;
  }
  return <pre className="preview-text">{item.contentText ?? item.previewText}</pre>;
}

function SettingsPanel({ settings, updateSettings, activeTab, setActiveTab, onRefresh }: {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  activeTab: (typeof tabs)[number];
  setActiveTab: (tab: (typeof tabs)[number]) => void;
  onRefresh: () => Promise<void>;
}) {
  return (
    <div className="settings-panel">
      <div className="tabs">{tabs.map((entry) => <button type="button" className={entry === activeTab ? 'active' : ''} key={entry} onClick={() => setActiveTab(entry)}>{entry}</button>)}</div>
      {activeTab === 'General' && (
        <SettingsGrid>
          <Toggle label="Start at login" value={settings.startAtLogin} onChange={(value) => updateSettings({ startAtLogin: value })} />
          <Toggle label="Show tray icon" value={settings.showTrayIcon} onChange={(value) => updateSettings({ showTrayIcon: value })} />
          <SelectSetting label="Wheel position" value={settings.wheelPosition} options={['center', 'cursor']} onChange={(value) => updateSettings({ wheelPosition: value as Settings['wheelPosition'] })} />
          <SelectSetting label="Theme" value={settings.theme} options={['system', 'dark', 'light']} onChange={(value) => updateSettings({ theme: value as Settings['theme'] })} />
        </SettingsGrid>
      )}
      {activeTab === 'Clipboard' && (
        <SettingsGrid>
          <Toggle label="Capture plain text" value={settings.capturePlainText} onChange={(value) => updateSettings({ capturePlainText: value })} />
          <Toggle label="Capture rich text" value={settings.captureRichText} onChange={(value) => updateSettings({ captureRichText: value })} />
          <Toggle label="Capture images" value={settings.captureImages} onChange={(value) => updateSettings({ captureImages: value })} />
          <Toggle label="Capture files" value={settings.captureFiles} onChange={(value) => updateSettings({ captureFiles: value })} />
          <Toggle label="Capture code" value={settings.captureCode} onChange={(value) => updateSettings({ captureCode: value })} />
          <Toggle label="Ignore duplicates" value={settings.ignoreDuplicates} onChange={(value) => updateSettings({ ignoreDuplicates: value })} />
          <NumberSetting label="Max history items" value={settings.maxHistoryItems} onChange={(value) => updateSettings({ maxHistoryItems: value })} />
          <NumberSetting label="Max image size MB" value={settings.maxImageSizeMb} onChange={(value) => updateSettings({ maxImageSizeMb: value })} />
        </SettingsGrid>
      )}
      {activeTab === 'Privacy' && (
        <SettingsGrid>
          <Toggle label="Pause capture" value={settings.pauseCapture} onChange={(value) => updateSettings({ pauseCapture: value })} />
          <Toggle label="Clear clipboard on quit" value={settings.clearClipboardOnQuit} onChange={(value) => updateSettings({ clearClipboardOnQuit: value })} />
          <label className="setting-field wide"><span>Ignored source apps</span><textarea value={settings.ignoredSourceApps.join('\n')} onChange={(event) => updateSettings({ ignoredSourceApps: event.target.value.split('\n').flatMap((line) => {
            const trimmed = line.trim();
            return trimmed ? [trimmed] : [];
          }) })} /></label>
        </SettingsGrid>
      )}
      {activeTab === 'Cleanup' && (
        <SettingsGrid>
          <NumberSetting label="Auto delete after days" value={settings.autoDeleteAfterDays} onChange={(value) => updateSettings({ autoDeleteAfterDays: value })} />
          <button type="button" className="danger-button" onClick={async () => { if (confirm('Clear all unpinned history?')) { await clipwheelClient.cleanup({ mode: 'unpinned' }); await onRefresh(); } }}>Clear unpinned</button>
          <button type="button" className="danger-button" onClick={async () => { if (confirm('Clear all history, excluding pinned items?')) { await clipwheelClient.cleanup({ mode: 'all' }); await onRefresh(); } }}>Clear history</button>
          <button type="button" className="danger-button" onClick={async () => { if (confirm('Permanently purge soft-deleted items?')) { await clipwheelClient.cleanup({ mode: 'purge_deleted' }); await onRefresh(); } }}>Purge deleted</button>
        </SettingsGrid>
      )}
      {activeTab === 'Shortcuts' && (
        <div className="shortcut-list">
          <span>Open radial wheel</span><kbd>{openWheelShortcut}</kbd>
          <span>Select wheel item</span><kbd>1-8 / Enter</kbd>
          <span>Close wheel</span><kbd>Escape</kbd>
        </div>
      )}
      {activeTab === 'Advanced' && (
        <SettingsGrid>
          <Toggle label="Auto paste after restore" value={settings.autoPaste} onChange={(value) => updateSettings({ autoPaste: value })} />
          <div className="setting-field app-version-card">
            <span>App version</span>
            <strong>{appVersion.version}</strong>
            <small>{appVersion.channel} channel</small>
          </div>
          <div className="setting-field app-version-card">
            <span>Updates</span>
            <strong>{labelFromToken(appVersion.updateMode)}</strong>
            <small>Install newer local releases over this app.</small>
          </div>
        </SettingsGrid>
      )}
    </div>
  );
}

function WheelSurface() {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const isShiftPressedRef = useRef(false);
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isQuickLookVisible, setQuickLookVisible] = useState(false);
  const count = settings.wheelItemCount;
  const wheelItems = items.slice(0, count);
  const activeItem = wheelItems[activeIndex] ?? null;
  const segmentDeg = 360 / count;
  const activeAngle = activeIndex * segmentDeg - 90;
  const quickLookSide = Math.cos((activeAngle * Math.PI) / 180) >= 0 ? 'left' : 'right';

  useEffect(() => {
    document.documentElement.classList.add('wheel-html');
    document.body.classList.add('wheel-body');
    return () => {
      document.documentElement.classList.remove('wheel-html');
      document.body.classList.remove('wheel-body');
    };
  }, []);

  const refresh = useCallback(async () => {
    const nextSettings = await clipwheelClient.getSettings();
    setSettings(nextSettings);
    setItems(await clipwheelClient.getRecentWheelItems(nextSettings.wheelItemCount));
  }, []);

  useEffect(() => {
    void refresh();
    overlayRef.current?.focus();
    const unsub = clipwheelClient.onWheelOpened(() => {
      void refresh();
      window.setTimeout(() => overlayRef.current?.focus(), 0);
    });
    return unsub;
  }, [refresh]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (isShiftEvent(event)) {
        isShiftPressedRef.current = true;
        setQuickLookVisible(true);
      }
      if (event.key === 'Escape') void clipwheelClient.closeWheel();
      if (event.key === 'Enter' && activeItem) void clipwheelClient.copyItem(activeItem.id);
      const number = Number(event.key);
      if (number >= 1 && number <= count && wheelItems[number - 1]) void clipwheelClient.copyItem(wheelItems[number - 1].id);
    };
    const upHandler = (event: KeyboardEvent) => {
      if (isShiftEvent(event)) {
        isShiftPressedRef.current = false;
        setQuickLookVisible(false);
      }
    };
    const blurHandler = () => {
      isShiftPressedRef.current = false;
      setQuickLookVisible(false);
    };
    window.addEventListener('keydown', handler);
    window.addEventListener('keyup', upHandler);
    window.addEventListener('blur', blurHandler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('keyup', upHandler);
      window.removeEventListener('blur', blurHandler);
    };
  }, [activeItem, count, wheelItems]);

  return (
    <div
      ref={overlayRef}
      className="wheel-overlay"
      role="application"
      aria-label="ClipWheel radial clipboard wheel"
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === 'Shift' || event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
          isShiftPressedRef.current = true;
          setQuickLookVisible(true);
        }
      }}
      onKeyUp={(event) => {
        if (event.key === 'Shift' || event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
          isShiftPressedRef.current = false;
          setQuickLookVisible(false);
        }
      }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setActiveIndex(getSegmentIndex({ x: rect.width / 2, y: rect.height / 2 }, { x: event.clientX - rect.left, y: event.clientY - rect.top }, count));
        setQuickLookVisible(event.shiftKey || event.getModifierState('Shift') || isShiftPressedRef.current);
      }}
      onMouseLeave={() => {
        if (!isShiftPressedRef.current) setQuickLookVisible(false);
      }}
    >
      <div className="wheel-ring" style={{ '--segment-deg': `${segmentDeg}deg` } as React.CSSProperties}>
        <div className="wheel-active-slice" style={{ transform: `rotate(${activeIndex * segmentDeg}deg)` }} />
        <div className="wheel-inner-border" />
        {Array.from({ length: count }).map((_, index) => {
          const item = wheelItems[index];
          return (
            <button
              type="button"
              key={index}
              className={`wheel-segment ${index === activeIndex ? 'active' : ''}`}
              style={{ transform: getSegmentTransform(index, count, 250) }}
              onClick={() => item && void clipwheelClient.copyItem(item.id)}
            >
              <span className="wheel-index">{index + 1}</span>
              <span className="wheel-icon">{item ? iconForType(item.type) : <Clipboard size={22} />}</span>
              <small>{item ? item.title : 'Empty'}</small>
            </button>
          );
        })}
        <div className="wheel-center">
          {activeItem ? (
            <>
              <span className="type-chip">{labelForType(activeItem.type)}</span>
              <strong>{activeItem.title}</strong>
              <div className="wheel-hints"><span><kbd>Enter</kbd> Apply</span><span><kbd>Esc</kbd> Back</span><span><kbd>Shift</kbd> Quicklook</span></div>
            </>
          ) : (
            <>
              <Clipboard size={30} />
              <strong>No captures</strong>
              <div className="wheel-hints"><span><kbd>Esc</kbd> Back</span></div>
            </>
          )}
        </div>
        {activeItem && isQuickLookVisible && <WheelQuickLook item={activeItem} side={quickLookSide} />}
      </div>
    </div>
  );
}

function isShiftEvent(event: KeyboardEvent): boolean {
  return event.key === 'Shift' || event.code === 'ShiftLeft' || event.code === 'ShiftRight';
}

function WheelQuickLook({ item, side }: { item: ClipboardItem; side: 'left' | 'right' }) {
  return (
    <aside className={`wheel-quicklook ${side}`}>
      <span className="type-chip">{labelForType(item.type)}</span>
      <strong>{item.title}</strong>
      {item.type === 'image' && <WheelQuickLookImage item={item} />}
      <p>{item.previewText}</p>
      {item.url && <small>{item.url}</small>}
      {item.filePaths.length > 0 && <small>{item.filePaths.join('\n')}</small>}
    </aside>
  );
}

function WheelQuickLookImage({ item }: { item: ClipboardItem }) {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    setImageDataUrl(null);
    setImageError(null);
    void clipwheelClient.getImageDataUrl(item.id).then((dataUrl) => {
      if (disposed) return;
      if (dataUrl) {
        setImageDataUrl(dataUrl);
      } else {
        setImageError('Image preview unavailable.');
      }
    }).catch((error: unknown) => {
      if (!disposed) setImageError(error instanceof Error ? error.message : 'Unable to load image preview.');
    });
    return () => {
      disposed = true;
    };
  }, [item.id]);

  if (imageError) return <div className="wheel-quicklook-image-state">{imageError}</div>;
  if (!imageDataUrl) return <div className="wheel-quicklook-image-state">Loading preview...</div>;
  return <img className="wheel-quicklook-image" src={imageDataUrl} alt="Clipboard quicklook preview" />;
}

function SettingsGrid({ children }: { children: React.ReactNode }) {
  return <div className="settings-grid">{children}</div>;
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function NumberSetting({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="setting-field"><span>{label}</span><input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function SelectSetting({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="setting-field"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" className="icon-button" aria-label={label} title={label} onClick={onClick}>{children}</button>;
}

function SkeletonList() {
  return <div className="history-list">{Array.from({ length: 7 }).map((_, index) => <div className="skeleton-row" key={index} />)}</div>;
}

function iconForType(type: ClipboardItemType) {
  const props = { size: 20 };
  switch (type) {
    case 'code': return <Braces {...props} />;
    case 'url': return <Link {...props} />;
    case 'image': return <Image {...props} />;
    case 'file_reference': return <File {...props} />;
    case 'command': return <Command {...props} />;
    case 'rich_text': return <Star {...props} />;
    default: return <Type {...props} />;
  }
}

function labelForType(type: ClipboardItemType | 'all'): string {
  return labelFromToken(type);
}

function formatInfoLabels(item: ClipboardItem): string[] {
  const labels: string[] = [];
  if (item.formatInfo.hasText) labels.push('Plain text');
  if (item.formatInfo.hasHtml) labels.push('HTML');
  if (item.formatInfo.hasRtf) labels.push('RTF');
  if (item.formatInfo.hasImage) labels.push('Image');
  if (item.formatInfo.hasFiles) labels.push('Files');
  return labels;
}

function labelForSignal(signal: ClipboardItem['contentSignals'][number]): string {
  switch (signal.kind) {
    case 'json':
      return 'JSON';
    case 'json_fragment':
      return 'JSON fragment';
    case 'html':
      return 'HTML';
    case 'url':
      return 'URL';
    case 'email':
      return 'Email';
    case 'hex_color':
      return signal.metadata?.value ? `Hex ${signal.metadata.value}` : 'Hex color';
    case 'markdown':
      return 'Markdown';
    case 'code':
      return signal.language && signal.language !== 'unknown' ? labelFromToken(signal.language) : 'Code';
    case 'code_block':
      return 'Code block';
    case 'shell':
      return 'Shell';
    default:
      return signal.kind;
  }
}

function labelFromToken(value: string): string {
  return value.split('_').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ');
}

function safeDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function getContentLength(item: ClipboardItem): number | null {
  if (item.type === 'image') return null;
  if (item.type === 'file_reference') return item.filePaths.join('\n').length;
  return (item.contentText ?? item.url ?? item.previewText).length;
}

function getLineCount(item: ClipboardItem): number | null {
  if (item.type === 'image') return null;
  const value = item.type === 'file_reference' ? item.filePaths.join('\n') : item.contentText ?? item.url ?? item.previewText;
  if (!value) return 0;
  return value.split(/\r\n|\r|\n/).length;
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return 'N/A';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toLocaleString(undefined, { maximumFractionDigits: value >= 10 ? 1 : 2 })} ${units[unitIndex]}`;
}

function formatDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

function isMacPlatform(): boolean {
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
