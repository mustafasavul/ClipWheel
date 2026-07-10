import type React from 'react';
import { labelFromToken } from '../presentation/formatters';

export function SelectSetting({ icon, label, value, options, getOptionLabel, onChange }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  options: readonly string[];
  getOptionLabel?: (value: string) => string;
  onChange: (value: string) => void;
}) {
  return <label className="setting-field"><span className="setting-label"><span className="setting-icon">{icon}</span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{getOptionLabel ? getOptionLabel(option) : labelFromToken(option)}</option>)}</select></label>;
}

