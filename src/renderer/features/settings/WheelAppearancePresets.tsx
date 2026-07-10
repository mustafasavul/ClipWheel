import { useState, type FormEvent } from 'react';
import { Palette, Save, Trash2 } from 'lucide-react';
import type { Settings } from '../../../shared/types';
import {
  applyWheelAppearancePreset,
  createCustomWheelAppearancePreset,
  maxCustomWheelAppearancePresets,
  wheelAppearancePresetColors,
  wheelAppearancePresets,
} from '../../../shared/wheelAppearance';
import { useI18n } from '../../i18n/I18nContext';

interface WheelAppearancePresetsProps {
  settings: Pick<Settings, 'wheelAppearance' | 'wheelAppearancePresets'>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
}

export function WheelAppearancePresets({ settings, updateSettings }: WheelAppearancePresetsProps) {
  const { t } = useI18n();
  const [presetName, setPresetName] = useState('');
  const [presetError, setPresetError] = useState<string | null>(null);
  const [isSavingPreset, setSavingPreset] = useState(false);

  const saveAppearancePreset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = presetName.trim();
    if (!name) {
      setPresetError(t('presetNameRequired'));
      return;
    }
    if (settings.wheelAppearancePresets.some((preset) => preset.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      setPresetError(t('presetNameExists'));
      return;
    }
    if (settings.wheelAppearancePresets.length >= maxCustomWheelAppearancePresets) {
      setPresetError(t('presetLimitReached'));
      return;
    }

    setPresetError(null);
    setSavingPreset(true);
    try {
      const presetId = globalThis.crypto?.randomUUID?.() ?? `preset-${Date.now().toString(36)}`;
      const preset = createCustomWheelAppearancePreset(presetId, name, settings.wheelAppearance);
      await updateSettings({ wheelAppearancePresets: [...settings.wheelAppearancePresets, preset] });
      setPresetName('');
    } catch {
      setPresetError(t('presetSaveFailed'));
    } finally {
      setSavingPreset(false);
    }
  };

  const deleteAppearancePreset = async (id: string) => {
    await updateSettings({ wheelAppearancePresets: settings.wheelAppearancePresets.filter((preset) => preset.id !== id) });
  };

  return (
    <div className="preset-panel">
      <span className="setting-label"><span className="setting-icon"><Palette size={18} /></span>{t('colorPresets')}</span>
      <span className="preset-section-label">{t('builtInPresets')}</span>
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

      <div className="custom-preset-header">
        <span className="preset-section-label">{t('customPresets')}</span>
        <span>{settings.wheelAppearancePresets.length}/{maxCustomWheelAppearancePresets}</span>
      </div>
      {settings.wheelAppearancePresets.length > 0 ? (
        <div className="preset-grid custom-preset-grid">
          {settings.wheelAppearancePresets.map((preset) => (
            <div className="custom-preset-card" key={preset.id}>
              <button
                type="button"
                className="preset-button custom-preset-apply"
                onClick={() => updateSettings({ wheelAppearance: { ...preset.appearance, paletteColors: [...preset.appearance.paletteColors] } })}
              >
                <span className="preset-swatches" aria-hidden="true">
                  {wheelAppearancePresetColors(preset.appearance).slice(0, 8).map((color, index) => <span key={`${preset.id}-${color}-${index}`} style={{ background: color }} />)}
                </span>
                <strong>{preset.name}</strong>
              </button>
              <button type="button" className="preset-delete-button" aria-label={`${t('delete')} ${preset.name}`} onClick={() => void deleteAppearancePreset(preset.id)}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      ) : <p className="preset-empty-state">{t('noCustomPresets')}</p>}

      <form className="preset-save-form" onSubmit={saveAppearancePreset}>
        <label htmlFor="preset-name">{t('presetName')}</label>
        <div className="preset-save-row">
          <input
            id="preset-name"
            maxLength={48}
            placeholder={t('presetNamePlaceholder')}
            value={presetName}
            onChange={(event) => {
              setPresetName(event.target.value);
              setPresetError(null);
            }}
          />
          <button type="submit" className="primary-button" disabled={isSavingPreset || settings.wheelAppearancePresets.length >= maxCustomWheelAppearancePresets}>
            <Save size={16} /> {t('savePreset')}
          </button>
        </div>
        {presetError && <small className="field-error" role="alert">{presetError}</small>}
      </form>
    </div>
  );
}
