import { useI18n } from '../i18n/I18nContext';

export function ColorSetting({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const { t } = useI18n();
  const colorValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000';
  const pickerLabel = `${label} ${t('colorPicker')}`;
  return (
    <label className="setting-field color-setting">
      <span className="setting-label">{label}</span>
      <span className="color-setting-control">
        <input type="color" aria-label={pickerLabel} title={pickerLabel} value={colorValue} onChange={(event) => onChange(event.target.value)} />
        <input type="text" value={value} onChange={(event) => onChange(event.target.value)} />
      </span>
    </label>
  );
}

