import { normalizeOpacity } from '../../shared/wheelAppearance';

export function RangeSetting({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="setting-field">
      <span className="setting-label">{label}<strong>{Math.round(normalizeOpacity(value) * 100)}%</strong></span>
      <input type="range" min="0" max="1" step="0.01" value={normalizeOpacity(value)} onChange={(event) => onChange(normalizeOpacity(Number(event.target.value)))} />
    </label>
  );
}

