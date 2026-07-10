import React, { lazy, Suspense, useCallback, useMemo, useReducer } from 'react';
import { CirclePause, Clipboard, Command, Palette, Settings as SettingsIcon, Shield } from 'lucide-react';
import type { Settings } from '../../../shared/types';
import { defaultSettings } from '../../../shared/settings';
import { resolveLanguage } from '../../../shared/i18n';
import { appVersion } from '../../../shared/version';
import { clampWheelItemCount } from '../../../shared/wheelLimits';
import { normalizeWheelItemIds } from '../../../shared/shortcuts';
import { useApplyLanguage, useApplyTheme, useResolvedTheme } from '../../app/documentPreferences';
import { useClipwheelEvents, useDesktopActions, useHistoryCountQuery, useHistoryItemsQuery, useSettingsMutation, useSettingsQuery } from '../../data/clipwheelQueries';
import { I18nContext, useLocale } from '../../i18n/I18nContext';
import { SkeletonList } from '../../ui/SkeletonList';
import { Filters } from './Filters';
import { HistoryList } from './HistoryList';
import { Pagination } from './Pagination';
import { historyUiReducer, initialHistoryUiState } from './historyState';

const PreviewPanel = lazy(() => import('../preview/PreviewPanel').then((module) => ({ default: module.PreviewPanel })));
const SettingsPanel = lazy(() => import('../settings/SettingsPanel').then((module) => ({ default: module.SettingsPanel })));
export function MainSurface() {
  const desktop = useDesktopActions();
  const [ui, dispatch] = useReducer(historyUiReducer, initialHistoryUiState);
  const { page, pageSize, query, selectedId, settingsTab: tab, view } = ui;
  const countQuery = useHistoryCountQuery(query);
  const totalItems = countQuery.data ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const effectivePage = Math.min(page, totalPages);
  const pagedQuery = useMemo(() => ({ ...query, limit: pageSize, offset: (effectivePage - 1) * pageSize }), [effectivePage, pageSize, query]);
  const itemsQuery = useHistoryItemsQuery(pagedQuery);
  const settingsQuery = useSettingsQuery();
  const settingsMutation = useSettingsMutation();
  const items = itemsQuery.data ?? [];
  const settings = settingsQuery.data ?? defaultSettings;
  const selected = items.find((item) => item.id === selectedId) ?? items[0] ?? null;
  const wheelItemCount = clampWheelItemCount(settings.wheelItemCount);
  const activeWheelItemIds = normalizeWheelItemIds(settings.wheelItemIds).slice(0, wheelItemCount);
  const resolvedTheme = useResolvedTheme(settings.theme);
  const language = resolveLanguage(settings.language);
  const i18n = useLocale(language);
  const { t } = i18n;

  useApplyTheme(resolvedTheme);
  useApplyLanguage(i18n.language, i18n.direction);

  const onClipboardItem = useCallback(() => dispatch({ type: 'clipboardItem' }), []);
  useClipwheelEvents({ onClipboardItem });

  const refresh = useCallback(async () => {
    await Promise.all([itemsQuery.refetch(), countQuery.refetch(), settingsQuery.refetch()]);
  }, [countQuery, itemsQuery, settingsQuery]);

  const updateSettings = async (patch: Partial<Settings>) => {
    await settingsMutation.mutateAsync(patch);
  };

  const toggleWheelItem = async (itemId: string) => {
    const nextWheelItemIds = normalizeWheelItemIds(settings.wheelItemIds);
    const currentSlot = nextWheelItemIds.slice(0, wheelItemCount).indexOf(itemId);
    if (currentSlot >= 0) {
      nextWheelItemIds[currentSlot] = '';
      await updateSettings({ wheelItemIds: nextWheelItemIds });
      return;
    }
    for (let index = 0; index < nextWheelItemIds.length; index += 1) {
      if (nextWheelItemIds[index] === itemId) nextWheelItemIds[index] = '';
    }
    const activeIds = nextWheelItemIds.slice(0, wheelItemCount);
    const emptySlot = activeIds.findIndex((id) => !id);
    if (emptySlot < 0) return;
    nextWheelItemIds[emptySlot] = itemId;
    await updateSettings({ wheelItemIds: nextWheelItemIds });
  };

  const openWheelAppearanceSettings = () => {
    dispatch({ type: 'show', view: 'settings' });
    dispatch({ type: 'settingsTab', tab: 'wheelAppearance' });
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
        <button type="button" className={`nav-button ${view === 'history' ? 'active' : ''}`} onClick={() => dispatch({ type: 'show', view: 'history' })}><Clipboard size={18} /> {t('history')}</button>
        <button type="button" className={`nav-button ${view === 'settings' ? 'active' : ''}`} onClick={() => dispatch({ type: 'show', view: 'settings' })}><SettingsIcon size={18} /> {t('settings')}</button>
        <button type="button" className="nav-button" onClick={() => void desktop.showWindow('wheel')}><Command size={18} /> {t('openWheel')}</button>
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
                  <button type="button" className="primary-button" onClick={() => void desktop.showWindow('wheel')}><Command size={18} /> {t('wheel')}</button>
                </div>
              </header>
              <Filters query={query} onChange={(patch) => dispatch({ type: 'query', patch })} />
              {(itemsQuery.error || countQuery.error || settingsQuery.error) && <div className="error-state">{t('unableToLoadClipWheelData')}</div>}
              {itemsQuery.isLoading || countQuery.isLoading || settingsQuery.isLoading ? <SkeletonList /> : (
                <HistoryList
                  items={items}
                  selectedId={selected?.id ?? null}
                  wheelItemIds={activeWheelItemIds}
                  onSelect={(id) => dispatch({ type: 'select', id })}
                  onRefresh={refresh}
                  onToggleWheelItem={toggleWheelItem}
                />
              )}
              {!itemsQuery.isLoading && totalItems > 0 && (
                <Pagination
                  page={effectivePage}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  totalPages={totalPages}
                  onPageChange={(nextPage) => dispatch({ type: 'page', page: nextPage })}
                  onPageSizeChange={(nextPageSize) => dispatch({ type: 'pageSize', pageSize: nextPageSize })}
                />
              )}
            </section>

            <section className="detail-pane">
              <Suspense fallback={<div className="preview-panel" />}><PreviewPanel item={selected} onRefresh={refresh} resolvedTheme={resolvedTheme} /></Suspense>
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
            <Suspense fallback={<SkeletonList />}><SettingsPanel settings={settings} updateSettings={updateSettings} activeTab={tab} setActiveTab={(nextTab) => dispatch({ type: 'settingsTab', tab: nextTab })} onRefresh={refresh} /></Suspense>
          </section>
        )}
      </main>
    </div>
    </I18nContext.Provider>
  );
}
