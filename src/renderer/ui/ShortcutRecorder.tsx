import React, { useCallback, useEffect, useRef, useEffectEvent } from 'react';
import { X } from 'lucide-react';
import { eventToShortcut, formatShortcutForPlatform, type ShortcutScope } from '../../shared/shortcuts';
import { useI18n } from '../i18n/I18nContext';

export function ShortcutRecorder({
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
  const { t } = useI18n();
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
  const recordWindowKeyboardEvent = useEffectEvent(recordKeyboardEvent);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    recordKeyboardEvent(event.nativeEvent);
  };
  useEffect(() => {
    if (!active) return undefined;
    buttonRef.current?.focus();
    const handleWindowKeyDown = (event: KeyboardEvent) => recordWindowKeyboardEvent(event);
    window.addEventListener('keydown', handleWindowKeyDown, true);
    return () => window.removeEventListener('keydown', handleWindowKeyDown, true);
  // Effect Events intentionally stay out of dependency arrays and always see current props.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
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
          {active ? t('pressShortcut') : formatShortcutForPlatform(value, t)}
        </button>
        {value && (
          <button type="button" className="shortcut-clear" aria-label={`${t('clearShortcut')} ${label}`} onClick={onClear}>
            <X size={14} />
          </button>
        )}
      </span>
      {error && <small className="shortcut-error">{error}</small>}
    </label>
  );
}
