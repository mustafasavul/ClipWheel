import { useEffect, useState } from 'react';
import {
  Braces, Clipboard, Copy, File, Globe2, Image, LogIn, Monitor, Moon,
  MousePointer2, Palette, Shield, Star, Sun, Trash2, Type,
} from 'lucide-react';
import type { Settings } from '../../../shared/types';
import { appVersion } from '../../../shared/version';
import { languageOptions } from '../../../shared/i18n';
import { applyWheelAppearancePreset, defaultWheelAppearance, wheelAppearancePresets } from '../../../shared/wheelAppearance';
import { clampWheelItemCount, maxWheelItems, wheelItemCountOptions } from '../../../shared/wheelLimits';
import { isValidGlobalShortcut, setShortcutValue, shortcutKey, type ShortcutTarget } from '../../../shared/shortcuts';
import { useCleanupMutation, useDesktopActions } from '../../data/clipwheelQueries';
import { useI18n } from '../../i18n/I18nContext';
import { cleanupConfirmMessage, languageOptionLabel, labelFromToken, settingOptionLabel, type CleanupActionId } from '../../presentation/formatters';
import { ColorSetting } from '../../ui/ColorSetting';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { NumberSetting } from '../../ui/NumberSetting';
import { RangeSetting } from '../../ui/RangeSetting';
import { SelectSetting } from '../../ui/SelectSetting';
import { SettingsGrid } from '../../ui/SettingsGrid';
import { ShortcutRecorder } from '../../ui/ShortcutRecorder';
import { Toggle } from '../../ui/Toggle';
import { WheelAppearancePreview } from './WheelAppearancePreview';
import { settingsTabs, type SettingsTabId } from './settingsConfig';
const maxWheelShortcutItems = maxWheelItems;

export function SettingsPanel({ settings, updateSettings, activeTab, setActiveTab, onRefresh }: {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  activeTab: SettingsTabId;
  setActiveTab: (tab: SettingsTabId) => void;
  onRefresh: () => Promise<void>;
}) {
  const { t } = useI18n();
  const desktop = useDesktopActions();
  const cleanupMutation = useCleanupMutation();
  const [recordingShortcut, setRecordingShortcut] = useState<string | null>(null);
  const [shortcutError, setShortcutError] = useState<string | null>(null);
  const [pendingCleanup, setPendingCleanup] = useState<CleanupActionId | null>(null);
  const startShortcutRecording = async (target: ShortcutTarget) => {
    setShortcutError(null);
    if (target.kind === 'openWheel') {
      await desktop.setShortcutCaptureActive(true);
    }
    setRecordingShortcut(shortcutKey(target));
  };
  const cancelShortcutRecording = (target: ShortcutTarget) => {
    setRecordingShortcut(null);
    if (target.kind === 'openWheel') {
      void desktop.setShortcutCaptureActive(false);
    }
  };
  const updateShortcut = (target: ShortcutTarget, value: string) => {
    const isGlobal = target.kind === 'openWheel';
    if (isGlobal && value && !isValidGlobalShortcut(value)) {
      setShortcutError(t('shortcutValidationError'));
      return;
    }
    setShortcutError(null);
    updateSettings({ shortcuts: setShortcutValue(settings.shortcuts, target, value) });
    setRecordingShortcut(null);
    if (target.kind === 'openWheel' && !value) {
      void desktop.setShortcutCaptureActive(false);
    }
  };
  useEffect(() => () => {
    if (recordingShortcut === 'openWheel') {
      void desktop.setShortcutCaptureActive(false);
    }
  }, [desktop, recordingShortcut]);
  const cleanupActions: Array<{ id: CleanupActionId; label: string; description: string }> = [
    { id: 'all', label: t('clearHistory'), description: t('clearHistoryDescription') },
    { id: 'purge_deleted', label: t('purgeDeleted'), description: t('purgeDeletedDescription') },
  ];
  const activeCleanupAction = cleanupActions.find((action) => action.id === pendingCleanup) ?? null;
  const runCleanup = async (action: CleanupActionId) => {
    await cleanupMutation.mutateAsync({ mode: action });
    setPendingCleanup(null);
    await onRefresh();
  };
  return (
    <>
      <div className="settings-panel">
      <div className="tabs">{settingsTabs.map((entry) => {
        const TabIcon = entry.icon;
        return <button type="button" className={entry.id === activeTab ? 'active' : ''} key={entry.id} onClick={() => setActiveTab(entry.id)}><TabIcon size={15} /> {t(entry.labelKey)}</button>;
      })}</div>
      {activeTab === 'general' && (
        <SettingsGrid>
          <Toggle icon={<LogIn size={18} />} label={t('startAtLogin')} value={settings.startAtLogin} onChange={(value) => updateSettings({ startAtLogin: value })} />
          <Toggle icon={<Monitor size={18} />} label={t('showTrayIcon')} value={settings.showTrayIcon} onChange={(value) => updateSettings({ showTrayIcon: value })} />
          <SelectSetting icon={<MousePointer2 size={18} />} label={t('wheelPosition')} value={settings.wheelPosition} options={['center', 'cursor']} getOptionLabel={(value) => settingOptionLabel(value, t)} onChange={(value) => updateSettings({ wheelPosition: value as Settings['wheelPosition'] })} />
          <SelectSetting icon={<Clipboard size={18} />} label={t('wheelItem')} value={String(settings.wheelItemCount)} options={wheelItemCountOptions.map(String)} getOptionLabel={(value) => value} onChange={(value) => updateSettings({ wheelItemCount: clampWheelItemCount(Number(value)) })} />
          <SelectSetting icon={settings.theme === 'light' ? <Sun size={18} /> : settings.theme === 'dark' ? <Moon size={18} /> : <Monitor size={18} />} label={t('theme')} value={settings.theme} options={['system', 'dark', 'light']} getOptionLabel={(value) => settingOptionLabel(value, t)} onChange={(value) => updateSettings({ theme: value as Settings['theme'] })} />
          <SelectSetting icon={<Globe2 size={18} />} label={t('language')} value={settings.language} options={languageOptions} getOptionLabel={(value) => languageOptionLabel(value, t)} onChange={(value) => updateSettings({ language: value as Settings['language'] })} />
        </SettingsGrid>
      )}
      {activeTab === 'wheelAppearance' && (
        <div className="appearance-settings">
          <WheelAppearancePreview appearance={settings.wheelAppearance} count={settings.wheelItemCount} shortcuts={settings.shortcuts} />
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
        </SettingsGrid>
      )}
      {activeTab === 'cleanup' && (
        <div className="cleanup-panel">
          <NumberSetting label={t('autoDeleteAfterDays')} value={settings.autoDeleteAfterDays} onChange={(value) => updateSettings({ autoDeleteAfterDays: value })} />
          <div className="cleanup-actions">
            {cleanupActions.map((action) => (
              <button type="button" className="cleanup-action danger-button" key={action.id} onClick={() => setPendingCleanup(action.id)}>
                <Trash2 size={18} />
                <span>
                  <strong>{action.label}</strong>
                  <small>{action.description}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'shortcuts' && (
        <div className="shortcut-list">
          <section className="shortcut-section">
            <span className="shortcut-section-title">{t('global')}</span>
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
                  label={`${t('item')} ${index + 1}`}
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
      {activeCleanupAction && (
        <ConfirmDialog
          title={t('confirmCleanup')}
          body={cleanupConfirmMessage(activeCleanupAction.id, t)}
          confirmLabel={t('continue')}
          cancelLabel={t('cancel')}
          onCancel={() => setPendingCleanup(null)}
          onConfirm={() => void runCleanup(activeCleanupAction.id)}
        />
      )}
    </>
  );
}
