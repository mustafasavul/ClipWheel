import React, { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Braces,
  CirclePause,
  Clipboard,
  Command,
  Copy,
  Eye,
  File,
  Globe2,
  Heart,
  Image,
  Link,
  LogIn,
  Monitor,
  Moon,
  MousePointer2,
  Palette,
  Pin,
  PinOff,
  QrCode,
  Search,
  Settings as SettingsIcon,
  Shield,
  Star,
  Sun,
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
import {
  createTranslator,
  fallbackMessages,
  getLanguageDirection,
  getLanguageLocale,
  languageMetadata,
  languageOptions,
  loadLocaleMessages,
  resolveLanguage,
  type I18nKey,
  type LanguageCode,
  type LanguageDirection,
  type LocaleMessages,
  type Translator,
} from '../shared/i18n';
import { appVersion } from '../shared/version';
import { getSegmentIndex } from '../shared/radialGeometry';
import { transformText, type TextAction } from '../shared/textActions';
import { qrColorsForTheme, resolveTheme, type ResolvedTheme } from '../shared/theme';
import { applyWheelAppearancePreset, defaultWheelAppearance, normalizeOpacity, wheelAppearancePresets, wheelAppearanceStyle, wheelSegmentStyle } from '../shared/wheelAppearance';
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
const settingsTabs = [
  { id: 'general', labelKey: 'general' },
  { id: 'wheelAppearance', labelKey: 'wheelAppearance' },
  { id: 'clipboard', labelKey: 'clipboard' },
  { id: 'privacy', labelKey: 'privacy' },
  { id: 'cleanup', labelKey: 'cleanup' },
  { id: 'shortcuts', labelKey: 'shortcuts' },
  { id: 'advanced', labelKey: 'advanced' },
] as const;
type SettingsTabId = (typeof settingsTabs)[number]['id'];
const defaultPageSize = 10;
const queryClient = new QueryClient();
const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();
const relativeTimeFormatters = new Map<string, Intl.RelativeTimeFormat>();
const maxWheelShortcutItems = 12;
type ShortcutTarget =
  | { kind: 'openWheel' }
  | { kind: 'selectActiveItem' }
  | { kind: 'back' }
  | { kind: 'wheelItem'; index: number };
type ShortcutScope = 'global' | 'wheel';

interface I18nView {
  language: LanguageCode;
  locale: string;
  direction: LanguageDirection;
  t: Translator;
}

const I18nContext = React.createContext<I18nView>({
  language: 'en',
  locale: 'en-US',
  direction: 'ltr',
  t: createTranslator(fallbackMessages),
});

function useI18n(): I18nView {
  return use(I18nContext);
}

function useLocale(language: LanguageCode): I18nView {
  const [localeState, setLocaleState] = useState<{ language: LanguageCode; messages: LocaleMessages }>({
    language: 'en',
    messages: fallbackMessages,
  });

  if (localeState.language !== language) {
    setLocaleState({ language, messages: fallbackMessages });
  }

  useEffect(() => {
    let disposed = false;
    if (language === 'en') {
      return () => {
        disposed = true;
      };
    }
    void loadLocaleMessages(language).then((nextMessages) => {
      if (!disposed) {
        setLocaleState((current) => current.language === language ? { language, messages: nextMessages } : current);
      }
    }).catch(() => {
      if (!disposed) {
        setLocaleState((current) => current.language === language ? { language, messages: fallbackMessages } : current);
      }
    });
    return () => {
      disposed = true;
    };
  }, [language]);

  const messages = localeState.language === language ? localeState.messages : fallbackMessages;
  return useMemo<I18nView>(() => ({
    language,
    locale: getLanguageLocale(language),
    direction: getLanguageDirection(language),
    t: createTranslator(messages),
  }), [language, messages]);
}

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
  const [tab, setTab] = useState<SettingsTabId>('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshRef = useRef<() => void>(() => undefined);
  const pageRef = useRef(page);
  const refreshRequestRef = useRef(0);

  const selected = items.find((item) => item.id === selectedId) ?? items[0] ?? null;
  const pagedQuery = useMemo(() => ({ ...query, limit: pageSize, offset: (page - 1) * pageSize }), [page, pageSize, query]);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const resolvedTheme = useResolvedTheme(settings.theme);
  const language = resolveLanguage(settings.language);
  const i18n = useLocale(language);
  const { t } = i18n;

  useApplyTheme(resolvedTheme);
  useApplyLanguage(i18n.language, i18n.direction);

  const refresh = useCallback(async () => {
    const requestId = refreshRequestRef.current + 1;
    refreshRequestRef.current = requestId;
    try {
      setError(null);
      const [nextItems, nextSettings, nextTotal] = await Promise.all([clipwheelClient.getItems(pagedQuery), clipwheelClient.getSettings(), clipwheelClient.countItems(query)]);
      if (refreshRequestRef.current !== requestId) return;
      setItems(nextItems);
      setSettings(nextSettings);
      setTotalItems(nextTotal);
      if (page > 1 && nextTotal <= (page - 1) * pageSize) {
        setPage(Math.max(1, Math.ceil(nextTotal / pageSize)));
      }
      setSelectedId((current) => current && nextItems.some((item) => item.id === current) ? current : nextItems[0]?.id ?? null);
    } catch (refreshError) {
      if (refreshRequestRef.current !== requestId) return;
      setError(refreshError instanceof Error ? refreshError.message : t('unableToLoadClipWheelData'));
    } finally {
      if (refreshRequestRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [page, pageSize, pagedQuery, query, t]);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    refreshRef.current = () => void refresh();
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const refreshNow = () => refreshRef.current();
    const refreshForClipboardItem = () => {
      if (pageRef.current === 1) {
        refreshNow();
        return;
      }
      setPage(1);
    };
    const unlistenItemsChanged = clipwheelClient.onItemsChanged(refreshNow);
    const unlistenClipboardItem = clipwheelClient.onClipboardItem(refreshForClipboardItem);
    const visibilityHandler = () => {
      if (!document.hidden) refreshNow();
    };
    window.addEventListener('focus', refreshNow);
    document.addEventListener('visibilitychange', visibilityHandler);
    return () => {
      unlistenItemsChanged();
      unlistenClipboardItem();
      window.removeEventListener('focus', refreshNow);
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
  }, []);

  const updateSettings = async (patch: Partial<Settings>) => {
    const next = await clipwheelClient.updateSettings(patch);
    setSettings(next);
  };

  const openWheelAppearanceSettings = () => {
    setView('settings');
    setTab('wheelAppearance');
  };

  return (
    <I18nContext.Provider value={i18n}>
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <div className="brand-wheel"><Clipboard size={21} /></div>
          <div>
            <strong>ClipWheel</strong>
            <span>{t('localClipboardWheel')}</span>
          </div>
        </div>
        <button type="button" className={`nav-button ${view === 'history' ? 'active' : ''}`} onClick={() => setView('history')}><Clipboard size={18} /> {t('history')}</button>
        <button type="button" className={`nav-button ${view === 'settings' ? 'active' : ''}`} onClick={() => setView('settings')}><SettingsIcon size={18} /> {t('settings')}</button>
        <button type="button" className="nav-button" onClick={() => void clipwheelClient.showWindow('wheel')}><Command size={18} /> {t('openWheel')}</button>
        <div className="privacy-note">
          <Shield size={18} />
          <p>{t('privacyNote')}</p>
        </div>
        <div className="sidebar-version">
          <span>{t('appVersion')}</span>
          <strong>{appVersion.version}</strong>
        </div>
      </aside>

      <main className={view === 'settings' ? 'settings-page' : 'workspace'}>
        {view === 'history' ? (
          <>
            <section className="history-pane">
              <header className="section-header">
                <div>
                  <p className="eyebrow">{t('clipboardHistory')}</p>
                  <h1>{t('recentCaptures')}</h1>
                  {settings.pauseCapture && (
                    <span className="capture-paused-badge">
                      <CirclePause size={15} />
                      {t('pauseCapture')}
                    </span>
                  )}
                </div>
                <div className="header-actions">
                  <button type="button" className="secondary-button" onClick={openWheelAppearanceSettings}><Palette size={18} /> {t('customizeWheel')}</button>
                  <button type="button" className="primary-button" onClick={() => void clipwheelClient.showWindow('wheel')}><Command size={18} /> {t('wheel')}</button>
                </div>
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
              <PreviewPanel item={selected} onRefresh={refresh} resolvedTheme={resolvedTheme} />
            </section>
          </>
        ) : (
          <section className="settings-view">
            <header className="section-header">
              <div>
                <p className="eyebrow">{t('preferences')}</p>
                <h1>{t('settings')}</h1>
              </div>
            </header>
            <SettingsPanel settings={settings} updateSettings={updateSettings} activeTab={tab} setActiveTab={setTab} onRefresh={refresh} />
          </section>
        )}
      </main>
    </div>
    </I18nContext.Provider>
  );
}

function Filters({ query, setQuery, resetPage }: { query: HistoryQuery; setQuery: React.Dispatch<React.SetStateAction<HistoryQuery>>; resetPage: () => void }) {
  const { t } = useI18n();
  const updateQuery = (patch: Partial<HistoryQuery>) => {
    resetPage();
    setQuery((current) => ({ ...current, ...patch }));
  };

  return (
    <div className="filters">
      <label className="search-field">
        <Search size={17} />
        <input value={query.search ?? ''} onChange={(event) => updateQuery({ search: event.target.value })} placeholder={t('searchPlaceholder')} />
      </label>
      <select aria-label={t('clipboard')} value={query.type ?? 'all'} onChange={(event) => updateQuery({ type: event.target.value as ClipboardItemType | 'all' })}>
        {typeOptions.map((type) => <option key={type} value={type}>{labelForType(type, t)}</option>)}
      </select>
      <select aria-label={t('allDates')} value={query.dateFilter ?? 'all'} onChange={(event) => updateQuery({ dateFilter: event.target.value as HistoryQuery['dateFilter'] })}>
        <option value="all">{t('allDates')}</option>
        <option value="today">{t('today')}</option>
        <option value="last7">{t('last7Days')}</option>
        <option value="last30">{t('last30Days')}</option>
        <option value="custom">{t('custom')}</option>
      </select>
      {query.dateFilter === 'custom' && (
        <>
          <input aria-label={t('startDate')} type="date" onChange={(event) => updateQuery({ startDate: new Date(event.target.value).toISOString() })} />
          <input aria-label={t('endDate')} type="date" onChange={(event) => updateQuery({ endDate: new Date(event.target.value).toISOString() })} />
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
  const { t } = useI18n();
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(totalItems, page * pageSize);
  return (
    <div className="pagination-bar">
      <span>{start}-{end} / {totalItems}</span>
      <div className="pagination-controls">
        <select aria-label={t('itemsPerPage')} value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        <button type="button" onClick={() => setPage(1)} disabled={page === 1}>{t('first')}</button>
        <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>{t('prev')}</button>
        <strong>{page} / {totalPages}</strong>
        <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages}>{t('next')}</button>
        <button type="button" onClick={() => setPage(totalPages)} disabled={page === totalPages}>{t('last')}</button>
      </div>
    </div>
  );
}

function HistoryList({ items, selectedId, onSelect, onRefresh }: { items: ClipboardItem[]; selectedId: string | null; onSelect: (id: string) => void; onRefresh: () => Promise<void> }) {
  const { t } = useI18n();
  if (!items.length) {
    return (
      <div className="empty-state">
        <Clipboard size={38} />
        <h2>{t('noClipboardItems')}</h2>
        <p>{t('noClipboardItemsDescription')}</p>
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
            <IconButton label={t('copy')} onClick={async () => { await clipwheelClient.copyItem(item.id); await onRefresh(); }}><Copy size={16} /></IconButton>
            <IconButton label={item.isPinned ? t('unpin') : t('pin')} onClick={async () => { await clipwheelClient.togglePin(item.id); await onRefresh(); }}>{item.isPinned ? <PinOff size={16} /> : <Pin size={16} />}</IconButton>
            <IconButton label={item.isFavorite ? t('unfavorite') : t('favorite')} onClick={async () => { await clipwheelClient.toggleFavorite(item.id); await onRefresh(); }}><Heart size={16} fill={item.isFavorite ? 'currentColor' : 'none'} /></IconButton>
            <IconButton label={t('delete')} onClick={async () => { await clipwheelClient.deleteItem(item.id); await onRefresh(); }}><Trash2 size={16} /></IconButton>
          </span>
        </button>
      ))}
    </div>
  );
}

function PreviewPanel({ item, onRefresh, resolvedTheme }: { item: ClipboardItem | null; onRefresh: () => Promise<void>; resolvedTheme: ResolvedTheme }) {
  const { t } = useI18n();
  const [qr, setQr] = useState<{ itemId: string; value: string } | null>(null);
  const [regexPattern, setRegexPattern] = useState('');
  const [regexReplacement, setRegexReplacement] = useState('');

  if (!item) {
    return (
      <div className="preview-panel empty-state">
        <Eye size={34} />
        <h2>{t('selectAnItem')}</h2>
        <p>{t('selectAnItemDescription')}</p>
      </div>
    );
  }

  const text = item.contentText ?? item.url ?? item.previewText;
  const currentQr = qr?.itemId === item.id ? qr.value : null;
  const canTransform = ['plain_text', 'code', 'url', 'command', 'rich_text'].includes(item.type);
  const createQr = async () => {
    setQr({ itemId: item.id, value: await QRCode.toDataURL(text, { margin: 1, width: 320, color: qrColorsForTheme(resolvedTheme) }) });
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
          <p className="eyebrow">{labelForType(item.type, t)}</p>
          <h2>{item.title}</h2>
        </div>
        <button type="button" className="primary-button" onClick={() => void clipwheelClient.copyItem(item.id)}><Copy size={17} /> {t('copy')}</button>
      </header>
      <PreviewContent item={item} />
      <ItemMetadata item={item} />
      {canTransform && (
        <div className="tool-strip">
          <IconButton label={t('uppercase')} onClick={() => void applyAction({ type: 'uppercase' }, t('uppercaseTitle'))}><Type size={16} /></IconButton>
          <IconButton label={t('lowercase')} onClick={() => void applyAction({ type: 'lowercase' }, t('lowercaseTitle'))}><Type size={16} /></IconButton>
          <IconButton label={t('titleCase')} onClick={() => void applyAction({ type: 'titlecase' }, t('titleCaseTitle'))}><Wand2 size={16} /></IconButton>
          <IconButton label={t('trim')} onClick={() => void applyAction({ type: 'trim' }, t('trimmedTitle'))}><X size={16} /></IconButton>
          <IconButton label={t('dedupeSpaces')} onClick={() => void applyAction({ type: 'dedupe_spaces' }, t('spaceNormalizedTitle'))}><Braces size={16} /></IconButton>
          <IconButton label={t('slugify')} onClick={() => void applyAction({ type: 'slugify' }, t('slugifiedTitle'))}><Link size={16} /></IconButton>
          <IconButton label={t('jsonPretty')} onClick={() => void applyAction({ type: 'json_pretty' }, t('jsonPrettyTitle'))}><Braces size={16} /></IconButton>
          <IconButton label={t('jsonMinify')} onClick={() => void applyAction({ type: 'json_minify' }, t('jsonMinifyTitle'))}><Braces size={16} /></IconButton>
          <IconButton label={t('qrCode')} onClick={() => void createQr()}><QrCode size={16} /></IconButton>
        </div>
      )}
      {canTransform && (
        <div className="regex-row">
          <input aria-label={t('regexPattern')} placeholder={t('regexPattern')} value={regexPattern} onChange={(event) => setRegexPattern(event.target.value)} />
          <input aria-label={t('regexReplacement')} placeholder={t('regexReplacement')} value={regexReplacement} onChange={(event) => setRegexReplacement(event.target.value)} />
          <button type="button" onClick={() => void applyAction({ type: 'regex_replace', pattern: regexPattern, replacement: regexReplacement }, t('regexTransformTitle'))}>{t('save')}</button>
        </div>
      )}
      {currentQr && (
        <div className="modal-layer">
          <button type="button" className="modal-backdrop" aria-label={t('back')} onClick={() => setQr(null)} />
          <div className="qr-modal" onClick={(event) => event.stopPropagation()}>
            <img src={currentQr} alt={t('qrCode')} />
            <a className="secondary-button" download="clipwheel-qr.png" href={currentQr}>{t('saveQrImage')}</a>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemMetadata({ item }: { item: ClipboardItem }) {
  const { locale, t } = useI18n();
  const length = getContentLength(item);
  const lines = getLineCount(item);
  const formatLabels = formatInfoLabels(item, t);
  const signalLabels = item.contentSignals.map((signal) => labelForSignal(signal, t));
  const details = [
    { label: t('size'), value: formatBytes(item.sizeBytes, locale, t) },
    { label: t('length'), value: length === null ? t('notAvailable') : `${length.toLocaleString(locale)} ${t('chars')}` },
    { label: t('lines'), value: lines === null ? t('notAvailable') : lines.toLocaleString(locale) },
    { label: t('files'), value: item.filePaths.length.toLocaleString(locale) },
    { label: t('clipboardFormats'), value: formatLabels.length ? formatLabels.join(', ') : t('unknown') },
    { label: t('detectedContent'), value: signalLabels.length ? signalLabels.join(', ') : t('none') },
    { label: t('created'), value: formatDateTime(item.createdAt, locale) },
    { label: t('lastUsed'), value: item.lastUsedAt ? formatDateTime(item.lastUsedAt, locale) : t('never') },
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
        <div className="metadata-badges" aria-label={t('clipboardMetadata')}>
          {formatLabels.map((label) => <span key={`format-${label}`}>{label}</span>)}
          {signalLabels.map((label) => <span key={`signal-${label}`}>{label}</span>)}
        </div>
      )}
      {item.formatInfo.rawFormats.length > 0 && (
        <details className="raw-formats">
          <summary>{t('rawClipboardFormats')}</summary>
          <code>{item.formatInfo.rawFormats.join(', ')}</code>
        </details>
      )}
    </div>
  );
}

function PreviewContent({ item }: { item: ClipboardItem }) {
  const { t } = useI18n();
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
        setImageError(t('imageFileMissing'));
      }
    }).catch((error: unknown) => {
      if (!disposed) setImageError(error instanceof Error ? error.message : t('unableToLoadImagePreview'));
    });
    return () => {
      disposed = true;
    };
  }, [item.id, item.type, t]);

  if (item.type === 'image') {
    if (imageError) return <div className="image-preview image-preview-state">{imageError}</div>;
    if (!imageDataUrl) return <div className="image-preview image-preview-state">{t('loadingImagePreview')}</div>;
    return <img className="image-preview" src={imageDataUrl} alt={t('clipboardPreview')} />;
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
  activeTab: SettingsTabId;
  setActiveTab: (tab: SettingsTabId) => void;
  onRefresh: () => Promise<void>;
}) {
  const { t } = useI18n();
  const [recordingShortcut, setRecordingShortcut] = useState<string | null>(null);
  const [shortcutError, setShortcutError] = useState<string | null>(null);
  const shortcutKey = (target: ShortcutTarget) => target.kind === 'wheelItem' ? `wheelItem-${target.index}` : target.kind;
  const startShortcutRecording = async (target: ShortcutTarget) => {
    setShortcutError(null);
    if (target.kind === 'openWheel') {
      await clipwheelClient.setShortcutCaptureActive(true);
    }
    setRecordingShortcut(shortcutKey(target));
  };
  const cancelShortcutRecording = (target: ShortcutTarget) => {
    setRecordingShortcut(null);
    if (target.kind === 'openWheel') {
      void clipwheelClient.setShortcutCaptureActive(false);
    }
  };
  const updateShortcut = (target: ShortcutTarget, value: string) => {
    const isGlobal = target.kind === 'openWheel';
    if (isGlobal && value && !isValidGlobalShortcut(value)) {
      setShortcutError('Use at least one modifier plus one key.');
      return;
    }
    setShortcutError(null);
    updateSettings({ shortcuts: setShortcutValue(settings.shortcuts, target, value) });
    setRecordingShortcut(null);
    if (target.kind === 'openWheel' && !value) {
      void clipwheelClient.setShortcutCaptureActive(false);
    }
  };
  useEffect(() => () => {
    if (recordingShortcut === 'openWheel') {
      void clipwheelClient.setShortcutCaptureActive(false);
    }
  }, [recordingShortcut]);
  return (
    <div className="settings-panel">
      <div className="tabs">{settingsTabs.map((entry) => <button type="button" className={entry.id === activeTab ? 'active' : ''} key={entry.id} onClick={() => setActiveTab(entry.id)}>{t(entry.labelKey)}</button>)}</div>
      {activeTab === 'general' && (
        <SettingsGrid>
          <Toggle icon={<LogIn size={18} />} label={t('startAtLogin')} value={settings.startAtLogin} onChange={(value) => updateSettings({ startAtLogin: value })} />
          <Toggle icon={<Monitor size={18} />} label={t('showTrayIcon')} value={settings.showTrayIcon} onChange={(value) => updateSettings({ showTrayIcon: value })} />
          <SelectSetting icon={<MousePointer2 size={18} />} label={t('wheelPosition')} value={settings.wheelPosition} options={['center', 'cursor']} getOptionLabel={(value) => settingOptionLabel(value, t)} onChange={(value) => updateSettings({ wheelPosition: value as Settings['wheelPosition'] })} />
          <SelectSetting icon={settings.theme === 'light' ? <Sun size={18} /> : settings.theme === 'dark' ? <Moon size={18} /> : <Monitor size={18} />} label={t('theme')} value={settings.theme} options={['system', 'dark', 'light']} getOptionLabel={(value) => settingOptionLabel(value, t)} onChange={(value) => updateSettings({ theme: value as Settings['theme'] })} />
          <SelectSetting icon={<Globe2 size={18} />} label={t('language')} value={settings.language} options={languageOptions} getOptionLabel={(value) => languageOptionLabel(value, t)} onChange={(value) => updateSettings({ language: value as Settings['language'] })} />
        </SettingsGrid>
      )}
      {activeTab === 'wheelAppearance' && (
        <div className="appearance-settings">
          <WheelAppearancePreview appearance={settings.wheelAppearance} shortcuts={settings.shortcuts} />
          <div className="preset-panel">
            <span className="setting-label"><span className="setting-icon"><Palette size={18} /></span>{t('colorPresets')}</span>
            <div className="preset-grid">
              {wheelAppearancePresets.map((preset) => (
                <button
                  type="button"
                  className="preset-button"
                  key={preset.id}
                  onClick={() => updateSettings({ wheelAppearance: applyWheelAppearancePreset(settings.wheelAppearance, preset) })}
                >
                  <span className="preset-swatches" aria-hidden="true">
                    {preset.colors.slice(0, 8).map((color, index) => <span key={`${preset.id}-${color}-${index}`} style={{ background: color }} />)}
                  </span>
                  <strong>{preset.label}</strong>
                </button>
              ))}
            </div>
          </div>
          <SettingsGrid>
            <SelectSetting icon={<Palette size={18} />} label={t('colorMode')} value={settings.wheelAppearance.colorMode} options={['palette', 'single']} getOptionLabel={(value) => settingOptionLabel(value, t)} onChange={(value) => updateSettings({ wheelAppearance: { ...settings.wheelAppearance, colorMode: value as Settings['wheelAppearance']['colorMode'] } })} />
            <ColorSetting label={t('segmentColor')} value={settings.wheelAppearance.segmentColor} onChange={(value) => updateSettings({ wheelAppearance: { ...settings.wheelAppearance, segmentColor: value } })} />
            <RangeSetting label={t('segmentOpacity')} value={settings.wheelAppearance.segmentOpacity} onChange={(value) => updateSettings({ wheelAppearance: { ...settings.wheelAppearance, segmentOpacity: value } })} />
            <ColorSetting label={t('activeSlice')} value={settings.wheelAppearance.activeColor} onChange={(value) => updateSettings({ wheelAppearance: { ...settings.wheelAppearance, activeColor: value } })} />
            <RangeSetting label={t('activeOpacity')} value={settings.wheelAppearance.activeOpacity} onChange={(value) => updateSettings({ wheelAppearance: { ...settings.wheelAppearance, activeOpacity: value } })} />
            <ColorSetting label={t('activeLines')} value={settings.wheelAppearance.activeLineColor} onChange={(value) => updateSettings({ wheelAppearance: { ...settings.wheelAppearance, activeLineColor: value } })} />
            <ColorSetting label={t('ringLines')} value={settings.wheelAppearance.ringLineColor} onChange={(value) => updateSettings({ wheelAppearance: { ...settings.wheelAppearance, ringLineColor: value } })} />
            <ColorSetting label={t('centerPanel')} value={settings.wheelAppearance.panelColor} onChange={(value) => updateSettings({ wheelAppearance: { ...settings.wheelAppearance, panelColor: value } })} />
            <RangeSetting label={t('panelOpacity')} value={settings.wheelAppearance.panelOpacity} onChange={(value) => updateSettings({ wheelAppearance: { ...settings.wheelAppearance, panelOpacity: value } })} />
            <ColorSetting label={t('iconBackground')} value={settings.wheelAppearance.iconBackgroundColor} onChange={(value) => updateSettings({ wheelAppearance: { ...settings.wheelAppearance, iconBackgroundColor: value } })} />
            <ColorSetting label={t('labelColor')} value={settings.wheelAppearance.labelColor} onChange={(value) => updateSettings({ wheelAppearance: { ...settings.wheelAppearance, labelColor: value } })} />
            <button type="button" className="secondary-button" onClick={() => updateSettings({ wheelAppearance: defaultWheelAppearance })}><Palette size={17} /> {t('resetAppearance')}</button>
          </SettingsGrid>
        </div>
      )}
      {activeTab === 'clipboard' && (
        <SettingsGrid>
          <Toggle icon={<Type size={18} />} label={t('capturePlainText')} value={settings.capturePlainText} onChange={(value) => updateSettings({ capturePlainText: value })} />
          <Toggle icon={<Star size={18} />} label={t('captureRichText')} value={settings.captureRichText} onChange={(value) => updateSettings({ captureRichText: value })} />
          <Toggle icon={<Image size={18} />} label={t('captureImages')} value={settings.captureImages} onChange={(value) => updateSettings({ captureImages: value })} />
          <Toggle icon={<File size={18} />} label={t('captureFiles')} value={settings.captureFiles} onChange={(value) => updateSettings({ captureFiles: value })} />
          <Toggle icon={<Braces size={18} />} label={t('captureCode')} value={settings.captureCode} onChange={(value) => updateSettings({ captureCode: value })} />
          <Toggle icon={<Copy size={18} />} label={t('ignoreDuplicates')} value={settings.ignoreDuplicates} onChange={(value) => updateSettings({ ignoreDuplicates: value })} />
          <NumberSetting label={t('maxHistoryItems')} value={settings.maxHistoryItems} onChange={(value) => updateSettings({ maxHistoryItems: value })} />
          <NumberSetting label={t('maxImageSizeMb')} value={settings.maxImageSizeMb} onChange={(value) => updateSettings({ maxImageSizeMb: value })} />
        </SettingsGrid>
      )}
      {activeTab === 'privacy' && (
        <SettingsGrid>
          <Toggle icon={<Shield size={18} />} label={t('pauseCapture')} value={settings.pauseCapture} onChange={(value) => updateSettings({ pauseCapture: value })} />
          <Toggle icon={<Trash2 size={18} />} label={t('clearClipboardOnQuit')} value={settings.clearClipboardOnQuit} onChange={(value) => updateSettings({ clearClipboardOnQuit: value })} />
          <label className="setting-field wide"><span className="setting-label"><span className="setting-icon"><Shield size={18} /></span>{t('ignoredSourceApps')}</span><textarea value={settings.ignoredSourceApps.join('\n')} onChange={(event) => updateSettings({ ignoredSourceApps: event.target.value.split('\n').flatMap((line) => {
            const trimmed = line.trim();
            return trimmed ? [trimmed] : [];
          }) })} /></label>
        </SettingsGrid>
      )}
      {activeTab === 'cleanup' && (
        <SettingsGrid>
          <NumberSetting label={t('autoDeleteAfterDays')} value={settings.autoDeleteAfterDays} onChange={(value) => updateSettings({ autoDeleteAfterDays: value })} />
          <button type="button" className="danger-button" onClick={async () => { if (confirm(t('clearUnpinnedConfirm'))) { await clipwheelClient.cleanup({ mode: 'unpinned' }); await onRefresh(); } }}>{t('clearUnpinned')}</button>
          <button type="button" className="danger-button" onClick={async () => { if (confirm(t('clearAllHistoryConfirm'))) { await clipwheelClient.cleanup({ mode: 'all' }); await onRefresh(); } }}>{t('clearHistory')}</button>
          <button type="button" className="danger-button" onClick={async () => { if (confirm(t('purgeDeletedConfirm'))) { await clipwheelClient.cleanup({ mode: 'purge_deleted' }); await onRefresh(); } }}>{t('purgeDeleted')}</button>
        </SettingsGrid>
      )}
      {activeTab === 'shortcuts' && (
        <div className="shortcut-list">
          <section className="shortcut-section">
            <span className="shortcut-section-title">Global</span>
            <ShortcutRecorder
              active={recordingShortcut === shortcutKey({ kind: 'openWheel' })}
              error={shortcutError}
              label={t('openRadialWheel')}
              scope="global"
              value={settings.shortcuts.openWheel}
              onCancel={() => cancelShortcutRecording({ kind: 'openWheel' })}
              onClear={() => updateShortcut({ kind: 'openWheel' }, '')}
              onRecord={(value) => updateShortcut({ kind: 'openWheel' }, value)}
              onStart={() => startShortcutRecording({ kind: 'openWheel' })}
            />
          </section>
          <section className="shortcut-section">
            <span className="shortcut-section-title">{t('wheel')}</span>
            <ShortcutRecorder
              active={recordingShortcut === shortcutKey({ kind: 'selectActiveItem' })}
              label={`${t('selectWheelItem')} (${t('apply')})`}
              scope="wheel"
              value={settings.shortcuts.selectActiveItem}
              onCancel={() => setRecordingShortcut(null)}
              onClear={() => updateShortcut({ kind: 'selectActiveItem' }, '')}
              onRecord={(value) => updateShortcut({ kind: 'selectActiveItem' }, value)}
              onStart={() => {
                setShortcutError(null);
                setRecordingShortcut(shortcutKey({ kind: 'selectActiveItem' }));
              }}
            />
            <ShortcutRecorder
              active={recordingShortcut === shortcutKey({ kind: 'back' })}
              allowEscape
              label={t('back')}
              scope="wheel"
              value={settings.shortcuts.back}
              onCancel={() => setRecordingShortcut(null)}
              onClear={() => updateShortcut({ kind: 'back' }, '')}
              onRecord={(value) => updateShortcut({ kind: 'back' }, value)}
              onStart={() => {
                setShortcutError(null);
                setRecordingShortcut(shortcutKey({ kind: 'back' }));
              }}
            />
          </section>
          <section className="shortcut-section">
            <span className="shortcut-section-title">{t('selectWheelItem')}</span>
            <div className="shortcut-grid">
              {Array.from({ length: maxWheelShortcutItems }, (_, index) => (
                <ShortcutRecorder
                  compact
                  active={recordingShortcut === shortcutKey({ kind: 'wheelItem', index })}
                  key={index}
                  label={`Item ${index + 1}`}
                  scope="wheel"
                  value={settings.shortcuts.wheelItems[index] ?? ''}
                  onCancel={() => setRecordingShortcut(null)}
                  onClear={() => updateShortcut({ kind: 'wheelItem', index }, '')}
                  onRecord={(value) => updateShortcut({ kind: 'wheelItem', index }, value)}
                  onStart={() => {
                    setShortcutError(null);
                    setRecordingShortcut(shortcutKey({ kind: 'wheelItem', index }));
                  }}
                />
              ))}
            </div>
          </section>
        </div>
      )}
      {activeTab === 'advanced' && (
        <SettingsGrid>
          <Toggle icon={<Clipboard size={18} />} label={t('autoPasteAfterRestore')} value={settings.autoPaste} onChange={(value) => updateSettings({ autoPaste: value })} />
          <div className="setting-field app-version-card">
            <span>{t('updates')}</span>
            <strong>{labelFromToken(appVersion.updateMode, t)}</strong>
            <small>{t('updatesDescription')}</small>
          </div>
        </SettingsGrid>
      )}
    </div>
  );
}

function WheelSurface() {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const isShiftPressedRef = useRef(false);
  const refreshRef = useRef<() => void>(() => undefined);
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
  const resolvedTheme = useResolvedTheme(settings.theme);
  const language = resolveLanguage(settings.language);
  const i18n = useLocale(language);
  const { t } = i18n;

  useApplyTheme(resolvedTheme);
  useApplyLanguage(i18n.language, i18n.direction);

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
    const nextItems = await clipwheelClient.getRecentWheelItems(nextSettings.wheelItemCount);
    setSettings(nextSettings);
    setItems(nextItems);
    setActiveIndex((current) => Math.min(current, Math.max(0, nextItems.length - 1)));
  }, []);

  useEffect(() => {
    refreshRef.current = () => void refresh();
  }, [refresh]);

  useEffect(() => {
    refreshRef.current();
    overlayRef.current?.focus();
    const refreshNow = () => refreshRef.current();
    const unsub = clipwheelClient.onWheelOpened(() => {
      refreshNow();
      window.setTimeout(() => overlayRef.current?.focus(), 0);
    });
    const unlistenItemsChanged = clipwheelClient.onItemsChanged(refreshNow);
    const unlistenClipboardItem = clipwheelClient.onClipboardItem(refreshNow);
    const visibilityHandler = () => {
      if (!document.hidden) refreshNow();
    };
    window.addEventListener('focus', refreshNow);
    document.addEventListener('visibilitychange', visibilityHandler);
    return () => {
      unsub();
      unlistenItemsChanged();
      unlistenClipboardItem();
      window.removeEventListener('focus', refreshNow);
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (isShiftEvent(event)) {
        isShiftPressedRef.current = true;
        setQuickLookVisible(true);
      }
      if (matchesShortcut(event, settings.shortcuts.back)) {
        event.preventDefault();
        void clipwheelClient.closeWheel();
        return;
      }
      if (activeItem && matchesShortcut(event, settings.shortcuts.selectActiveItem)) {
        event.preventDefault();
        void clipwheelClient.copyItem(activeItem.id);
        return;
      }
      const itemIndex = settings.shortcuts.wheelItems
        .slice(0, count)
        .findIndex((shortcut) => matchesShortcut(event, shortcut));
      if (itemIndex >= 0 && wheelItems[itemIndex]) {
        event.preventDefault();
        void clipwheelClient.copyItem(wheelItems[itemIndex].id);
      }
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
  }, [activeItem, count, settings.shortcuts, wheelItems]);

  return (
    <div
      ref={overlayRef}
      className="wheel-overlay"
      style={wheelAppearanceStyle(settings.wheelAppearance)}
      role="application"
      aria-label={t('wheelAria')}
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
              style={wheelSegmentStyle(index, count, settings.wheelAppearance)}
              onClick={() => item && void clipwheelClient.copyItem(item.id)}
            >
              <span className="wheel-segment-content">
                <span className="wheel-index">{index + 1}</span>
                <span className="wheel-icon">{item ? iconForType(item.type) : <Clipboard size={22} />}</span>
                <strong>{item ? item.title : t('empty')}</strong>
                <small>{item ? wheelSegmentMeta(item, i18n) : t('noItem')}</small>
              </span>
            </button>
          );
        })}
        <div className="wheel-center">
          {activeItem ? (
            <>
              <span className="type-chip">{labelForType(activeItem.type, t)}</span>
              <strong>{activeItem.title}</strong>
              <small className="wheel-center-meta">{wheelSegmentMeta(activeItem, i18n)}</small>
              <div className="wheel-hints"><span><kbd>{formatShortcutForPlatform(settings.shortcuts.selectActiveItem || 'Enter')}</kbd> {t('apply')}</span><span><kbd>{formatShortcutForPlatform(settings.shortcuts.back || 'Escape')}</kbd> {t('back')}</span><span><kbd>Shift</kbd> {t('quicklook')}</span></div>
            </>
          ) : (
            <>
              <Clipboard size={30} />
              <strong>{t('noCaptures')}</strong>
              <div className="wheel-hints"><span><kbd>{formatShortcutForPlatform(settings.shortcuts.back || 'Escape')}</kbd> {t('back')}</span></div>
            </>
          )}
        </div>
        {activeItem && isQuickLookVisible && (
          <I18nContext.Provider value={i18n}>
            <WheelQuickLook item={activeItem} side={quickLookSide} />
          </I18nContext.Provider>
        )}
      </div>
    </div>
  );
}

function WheelAppearancePreview({ appearance, shortcuts }: { appearance: Settings['wheelAppearance']; shortcuts: Settings['shortcuts'] }) {
  const { t } = useI18n();
  const count = 8;
  const segmentDeg = 360 / count;
  return (
    <div className="wheel-preview-shell" style={wheelAppearanceStyle(appearance)}>
      <div className="wheel-preview-ring" style={{ '--segment-deg': `${segmentDeg}deg` } as React.CSSProperties}>
        <div className="wheel-active-slice" />
        <div className="wheel-inner-border" />
        {Array.from({ length: count }).map((_, index) => (
          <span className={`wheel-segment wheel-preview-segment ${index === 0 ? 'active' : ''}`} style={wheelSegmentStyle(index, count, appearance)} key={index}>
            <span className="wheel-segment-content">
              <span className="wheel-index">{index + 1}</span>
              <span className="wheel-icon">{index % 3 === 0 ? <Image size={16} /> : <Type size={16} />}</span>
              <strong>{index === 0 ? t('selectedClip') : t('clipboard')}</strong>
              <small>{index === 0 ? `${t('plainText')} • ${t('now')}` : `${t('item')} • 5m ago`}</small>
            </span>
          </span>
        ))}
        <div className="wheel-center">
          <span className="type-chip">{t('plainText')}</span>
          <strong>{t('livePreview')}</strong>
          <small className="wheel-center-meta">{t('plainText')} • {t('now')}</small>
          <div className="wheel-hints"><span><kbd>{formatShortcutForPlatform(shortcuts.selectActiveItem || 'Enter')}</kbd> {t('apply')}</span><span><kbd>{formatShortcutForPlatform(shortcuts.back || 'Escape')}</kbd> {t('back')}</span></div>
        </div>
      </div>
    </div>
  );
}

function isShiftEvent(event: KeyboardEvent): boolean {
  return event.key === 'Shift' || event.code === 'ShiftLeft' || event.code === 'ShiftRight';
}

function matchesShortcut(event: KeyboardEvent, shortcut: string | undefined): boolean {
  const parts = shortcut?.split('+').map((part) => normalizeShortcutToken(part)).filter(Boolean) ?? [];
  if (!parts.length) return false;
  const key = parts.at(-1);
  const modifiers = new Set(parts.slice(0, -1));
  const expectedMeta = modifiers.has('cmd') || modifiers.has('meta') || modifiers.has('super') || (modifiers.has('cmdorctrl') && isMacPlatform());
  const expectedCtrl = modifiers.has('ctrl') || modifiers.has('control') || (modifiers.has('cmdorctrl') && !isMacPlatform());
  const expectedAlt = modifiers.has('alt') || modifiers.has('option');
  const expectedShift = modifiers.has('shift');
  if (event.metaKey !== expectedMeta || event.ctrlKey !== expectedCtrl || event.altKey !== expectedAlt || event.shiftKey !== expectedShift) {
    return false;
  }
  return key !== undefined && eventShortcutKeys(event).includes(key);
}

function eventToShortcut(event: KeyboardEvent, scope: ShortcutScope): string | null {
  const key = shortcutKeyFromEvent(event);
  if (!key) return null;
  const modifiers: string[] = [];
  if (event.metaKey) modifiers.push(isMacPlatform() ? 'CmdOrCtrl' : 'Cmd');
  if (event.ctrlKey) modifiers.push(isMacPlatform() ? 'Ctrl' : 'CmdOrCtrl');
  if (event.altKey) modifiers.push('Alt');
  if (event.shiftKey) modifiers.push('Shift');
  if (scope === 'global' && modifiers.length === 0) return key;
  return [...modifiers, key].join('+');
}

function shortcutKeyFromEvent(event: KeyboardEvent): string | null {
  if (['Alt', 'Control', 'Meta', 'Shift'].includes(event.key)) return null;
  if (/^Key[A-Z]$/.test(event.code)) return event.code.slice(3);
  if (/^Digit[0-9]$/.test(event.code)) return event.code.slice(5);
  if (/^Numpad[0-9]$/.test(event.code)) return event.code.slice(6);
  const codeAliases: Record<string, string> = {
    Backquote: '`',
    Backslash: '\\',
    BracketLeft: '[',
    BracketRight: ']',
    Comma: ',',
    Equal: '=',
    Minus: '-',
    Period: '.',
    Quote: "'",
    Semicolon: ';',
    Slash: '/',
    ArrowDown: 'ArrowDown',
    ArrowLeft: 'ArrowLeft',
    ArrowRight: 'ArrowRight',
    ArrowUp: 'ArrowUp',
    Escape: 'Escape',
    Enter: 'Enter',
    Space: 'Space',
    Tab: 'Tab',
  };
  if (codeAliases[event.code]) return codeAliases[event.code];
  if (/^F([1-9]|1[0-9]|2[0-4])$/.test(event.key)) return event.key.toUpperCase();
  return event.key.length === 1 ? event.key.toUpperCase() : event.key;
}

function formatShortcutForPlatform(shortcut: string): string {
  const parts = shortcut.split('+').map((part) => part.trim()).filter(Boolean);
  if (!parts.length) return 'Not set';
  return parts.map((part) => {
    const normalized = normalizeShortcutToken(part);
    if (normalized === 'cmdorctrl') return isMacPlatform() ? 'Command' : 'CTRL';
    if (['cmd', 'command', 'meta', 'super'].includes(normalized)) return 'Command';
    if (['ctrl', 'control'].includes(normalized)) return 'CTRL';
    if (['alt', 'option'].includes(normalized)) return 'Option';
    if (normalized === 'shift') return 'Shift';
    if (normalized === 'esc') return 'Escape';
    if (normalized === 'arrowup') return 'Arrow Up';
    if (normalized === 'arrowdown') return 'Arrow Down';
    if (normalized === 'arrowleft') return 'Arrow Left';
    if (normalized === 'arrowright') return 'Arrow Right';
    return part.length === 1 ? part.toUpperCase() : part;
  }).join(' + ');
}

function isValidGlobalShortcut(shortcut: string): boolean {
  const parts = shortcut.split('+').map((part) => normalizeShortcutToken(part)).filter(Boolean);
  if (parts.length < 2) return false;
  const modifiers = new Set(parts.slice(0, -1));
  return ['alt', 'cmd', 'cmdorctrl', 'command', 'control', 'ctrl', 'meta', 'option', 'shift', 'super'].some((modifier) => modifiers.has(modifier));
}

function setShortcutValue(shortcuts: Settings['shortcuts'], target: ShortcutTarget, value: string): Settings['shortcuts'] {
  const next = {
    ...shortcuts,
    wheelItems: normalizeWheelItemShortcuts(shortcuts.wheelItems),
  };
  if (target.kind === 'openWheel') {
    return { ...next, openWheel: value };
  }
  if (value) {
    if (target.kind !== 'selectActiveItem' && shortcutsEqual(next.selectActiveItem, value)) next.selectActiveItem = '';
    if (target.kind !== 'back' && shortcutsEqual(next.back, value)) next.back = '';
    next.wheelItems = next.wheelItems.map((shortcut, index) => target.kind === 'wheelItem' && target.index === index ? shortcut : shortcutsEqual(shortcut, value) ? '' : shortcut);
  }
  if (target.kind === 'selectActiveItem') return { ...next, selectActiveItem: value };
  if (target.kind === 'back') return { ...next, back: value };
  const wheelItems = normalizeWheelItemShortcuts(next.wheelItems);
  wheelItems[target.index] = value;
  return { ...next, wheelItems };
}

function shortcutsEqual(left: string | undefined, right: string | undefined): boolean {
  return normalizeShortcutValue(left) === normalizeShortcutValue(right);
}

function normalizeShortcutValue(value: string | undefined): string {
  return value?.split('+').map((part) => normalizeShortcutToken(part)).filter(Boolean).join('+') ?? '';
}

function normalizeShortcutToken(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '');
}

function eventShortcutKeys(event: KeyboardEvent): string[] {
  const keys = new Set<string>([normalizeShortcutToken(event.key)]);
  if (/^Key[A-Z]$/.test(event.code)) keys.add(event.code.slice(3).toLowerCase());
  if (/^Digit[0-9]$/.test(event.code)) keys.add(event.code.slice(5));
  if (/^Numpad[0-9]$/.test(event.code)) keys.add(event.code.slice(6));
  const codeAliases: Record<string, string[]> = {
    Backquote: ['`'],
    Backslash: ['\\'],
    BracketLeft: ['['],
    BracketRight: [']'],
    Comma: [','],
    Equal: ['='],
    Minus: ['-'],
    Period: ['.'],
    Quote: ["'"],
    Semicolon: [';'],
    Slash: ['/'],
    ArrowDown: ['down'],
    ArrowLeft: ['left'],
    ArrowRight: ['right'],
    ArrowUp: ['up'],
    Escape: ['esc', 'escape'],
    Enter: ['enter', 'return'],
    Space: ['space'],
    Tab: ['tab'],
  };
  for (const alias of codeAliases[event.code] ?? []) {
    keys.add(alias);
  }
  return [...keys];
}

function wheelSegmentMeta(item: ClipboardItem, i18n: I18nView): string {
  return `${labelForType(item.type, i18n.t)} • ${formatRelativeTime(item.createdAt, i18n.locale, i18n.t)}`;
}

function useResolvedTheme(theme: Settings['theme']): ResolvedTheme {
  const [prefersDark, setPrefersDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setPrefersDark(media.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  return resolveTheme(theme, prefersDark);
}

function useApplyTheme(theme: ResolvedTheme) {
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
}

function useApplyLanguage(language: LanguageCode, direction: LanguageDirection) {
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [direction, language]);
}

function WheelQuickLook({ item, side }: { item: ClipboardItem; side: 'left' | 'right' }) {
  const { locale, t } = useI18n();
  return (
    <aside className={`wheel-quicklook ${side}`}>
      <span className="type-chip">{labelForType(item.type, t)}</span>
      <strong>{item.title}</strong>
      <time className="wheel-quicklook-created" dateTime={item.createdAt}>
        <span>{t('created')}</span>
        <strong>{formatDateTime(item.createdAt, locale)}</strong>
      </time>
      {item.type === 'image' && <WheelQuickLookImage item={item} />}
      <div className="wheel-quicklook-body">
        <p>{item.previewText}</p>
        {item.url && <small>{item.url}</small>}
        {item.filePaths.length > 0 && <small>{item.filePaths.join('\n')}</small>}
      </div>
    </aside>
  );
}

function WheelQuickLookImage({ item }: { item: ClipboardItem }) {
  const { t } = useI18n();
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
        setImageError(t('imagePreviewUnavailable'));
      }
    }).catch((error: unknown) => {
      if (!disposed) setImageError(error instanceof Error ? error.message : t('unableToLoadImagePreview'));
    });
    return () => {
      disposed = true;
    };
  }, [item.id, t]);

  if (imageError) return <div className="wheel-quicklook-image-state">{imageError}</div>;
  if (!imageDataUrl) return <div className="wheel-quicklook-image-state">{t('loadingPreview')}</div>;
  return <img className="wheel-quicklook-image" src={imageDataUrl} alt={t('clipboardQuicklookPreview')} />;
}

function SettingsGrid({ children }: { children: React.ReactNode }) {
  return <div className="settings-grid">{children}</div>;
}

function Toggle({ icon, label, value, onChange }: { icon: React.ReactNode; label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="toggle-row">
      <span className="setting-label"><span className="setting-icon">{icon}</span>{label}</span>
      <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function NumberSetting({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="setting-field"><span className="setting-label">{label}</span><input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function RangeSetting({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="setting-field">
      <span className="setting-label">{label}<strong>{Math.round(normalizeOpacity(value) * 100)}%</strong></span>
      <input type="range" min="0" max="1" step="0.01" value={normalizeOpacity(value)} onChange={(event) => onChange(normalizeOpacity(Number(event.target.value)))} />
    </label>
  );
}

function ColorSetting({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const colorValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000';
  return (
    <label className="setting-field color-setting">
      <span className="setting-label">{label}</span>
      <span className="color-setting-control">
        <input type="color" aria-label={`${label} color picker`} title={`${label} color picker`} value={colorValue} onChange={(event) => onChange(event.target.value)} />
        <input type="text" value={value} onChange={(event) => onChange(event.target.value)} />
      </span>
    </label>
  );
}

function ShortcutRecorder({
  active,
  allowEscape = false,
  compact = false,
  error,
  label,
  scope,
  value,
  onCancel,
  onClear,
  onRecord,
  onStart,
}: {
  active: boolean;
  allowEscape?: boolean;
  compact?: boolean;
  error?: string | null;
  label: string;
  scope: ShortcutScope;
  value: string;
  onCancel: () => void;
  onClear: () => void;
  onRecord: (value: string) => void;
  onStart: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const recordKeyboardEvent = useCallback((event: KeyboardEvent) => {
    if (!active) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.key === 'Backspace') {
      onClear();
      return;
    }
    if (event.key === 'Escape' && !allowEscape) {
      onCancel();
      return;
    }
    const shortcut = eventToShortcut(event, scope);
    if (shortcut) {
      onRecord(shortcut);
    }
  }, [active, allowEscape, onCancel, onClear, onRecord, scope]);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    recordKeyboardEvent(event.nativeEvent);
  };
  useEffect(() => {
    if (!active) return undefined;
    buttonRef.current?.focus();
    const handleWindowKeyDown = (event: KeyboardEvent) => recordKeyboardEvent(event);
    window.addEventListener('keydown', handleWindowKeyDown, true);
    return () => window.removeEventListener('keydown', handleWindowKeyDown, true);
  }, [active, recordKeyboardEvent]);
  return (
    <label className={`shortcut-setting ${compact ? 'compact' : ''}`}>
      <span>{label}</span>
      <span className="shortcut-recorder-wrap">
        <button
          type="button"
          className={`shortcut-recorder ${active ? 'recording' : ''} ${error ? 'invalid' : ''}`}
          aria-label={label}
          ref={buttonRef}
          onBlur={() => {
            if (active) return;
            window.setTimeout(() => {
              if (buttonRef.current && document.activeElement !== buttonRef.current) {
                onCancel();
              }
            }, 0);
          }}
          onClick={onStart}
          onKeyDown={handleKeyDown}
        >
          {active ? 'Press shortcut...' : formatShortcutForPlatform(value)}
        </button>
        {value && (
          <button type="button" className="shortcut-clear" aria-label={`Clear ${label}`} onClick={onClear}>
            <X size={14} />
          </button>
        )}
      </span>
      {error && <small className="shortcut-error">{error}</small>}
    </label>
  );
}

function normalizeWheelItemShortcuts(value: string[]): string[] {
  return Array.from({ length: maxWheelShortcutItems }, (_, index) => value[index] ?? '');
}

function SelectSetting({ icon, label, value, options, getOptionLabel, onChange }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  options: readonly string[];
  getOptionLabel?: (value: string) => string;
  onChange: (value: string) => void;
}) {
  return <label className="setting-field"><span className="setting-label"><span className="setting-icon">{icon}</span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{getOptionLabel ? getOptionLabel(option) : labelFromToken(option)}</option>)}</select></label>;
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

function labelForType(type: ClipboardItemType | 'all', t: Translator): string {
  const labels: Record<ClipboardItemType | 'all', I18nKey> = {
    all: 'all',
    plain_text: 'plainText',
    rich_text: 'richText',
    code: 'code',
    url: 'url',
    image: 'image',
    file_reference: 'fileReference',
    command: 'command',
  };
  return t(labels[type]);
}

function formatInfoLabels(item: ClipboardItem, t: Translator): string[] {
  const labels: string[] = [];
  if (item.formatInfo.hasText) labels.push(t('plainText'));
  if (item.formatInfo.hasHtml) labels.push('HTML');
  if (item.formatInfo.hasRtf) labels.push('RTF');
  if (item.formatInfo.hasImage) labels.push(t('image'));
  if (item.formatInfo.hasFiles) labels.push(t('files'));
  return labels;
}

function labelForSignal(signal: ClipboardItem['contentSignals'][number], t: Translator): string {
  switch (signal.kind) {
    case 'json':
      return 'JSON';
    case 'json_fragment':
      return t('jsonFragment');
    case 'html':
      return 'HTML';
    case 'url':
      return 'URL';
    case 'email':
      return t('email');
    case 'hex_color':
      return signal.metadata?.value ? `Hex ${signal.metadata.value}` : t('hexColor');
    case 'markdown':
      return t('markdown');
    case 'code':
      return signal.language && signal.language !== 'unknown' ? labelFromToken(signal.language, t) : t('code');
    case 'code_block':
      return t('codeBlock');
    case 'shell':
      return t('shell');
    default:
      return signal.kind;
  }
}

function labelFromToken(value: string, t?: Translator): string {
  if (t) {
    const key = tokenLabelKey(value);
    if (key) return t(key);
  }
  return value.split('_').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ');
}

function tokenLabelKey(value: string): I18nKey | null {
  const labels: Record<string, I18nKey> = {
    system: 'system',
    dark: 'dark',
    light: 'light',
    center: 'center',
    cursor: 'cursor',
    palette: 'palette',
    single: 'single',
  };
  return labels[value] ?? null;
}

function settingOptionLabel(value: string, t: Translator): string {
  return labelFromToken(value, t);
}

function languageOptionLabel(value: string, t: Translator): string {
  if (value === 'system') return t('system');
  return languageMetadata[value as LanguageCode]?.nativeName ?? value;
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

function formatBytes(bytes: number, locale: string, t: Translator): string {
  if (!Number.isFinite(bytes) || bytes < 0) return t('notAvailable');
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toLocaleString(locale, { maximumFractionDigits: value >= 10 ? 1 : 2 })} ${units[unitIndex]}`;
}

function formatDateTime(value: string, locale: string): string {
  let formatter = dateTimeFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    dateTimeFormatters.set(locale, formatter);
  }
  return formatter.format(new Date(value));
}

function formatRelativeTime(value: string, locale: string, t: Translator): string {
  const deltaSeconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (deltaSeconds < 60) return t('now');
  const deltaMinutes = Math.floor(deltaSeconds / 60);
  const formatter = getRelativeTimeFormatter(locale);
  if (deltaMinutes < 60) return formatter.format(-deltaMinutes, 'minute');
  const deltaHours = Math.floor(deltaMinutes / 60);
  if (deltaHours < 24) return formatter.format(-deltaHours, 'hour');
  const deltaDays = Math.floor(deltaHours / 24);
  return formatter.format(-deltaDays, 'day');
}

function getRelativeTimeFormatter(locale: string): Intl.RelativeTimeFormat {
  let formatter = relativeTimeFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' });
    relativeTimeFormatters.set(locale, formatter);
  }
  return formatter;
}

function isMacPlatform(): boolean {
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
