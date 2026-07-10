import type React from 'react';

export function Toggle({ icon, label, value, onChange }: { icon: React.ReactNode; label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="toggle-row">
      <span className="setting-label"><span className="setting-icon">{icon}</span>{label}</span>
      <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

