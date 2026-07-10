import { fallbackMessages, type Translator } from './i18n';
import type { Settings } from './types';
import { maxWheelItems } from './wheelLimits';

export type ShortcutTarget =
  | { kind: 'openWheel' }
  | { kind: 'selectActiveItem' }
  | { kind: 'back' }
  | { kind: 'wheelItem'; index: number };
export type ShortcutScope = 'global' | 'wheel';

export function shortcutKey(target: ShortcutTarget): string {
  return target.kind === 'wheelItem' ? `wheelItem-${target.index}` : target.kind;
}

export function isShiftEvent(event: KeyboardEvent): boolean {
  return event.key === 'Shift' || event.code === 'ShiftLeft' || event.code === 'ShiftRight';
}

export function matchesShortcut(event: KeyboardEvent, shortcut: string | undefined): boolean {
  const parts = normalizedShortcutParts(shortcut);
  if (!parts.length) return false;
  const key = parts.at(-1);
  const modifiers = new Set(parts.slice(0, -1));
  const expectedMeta = modifiers.has('cmd') || modifiers.has('meta') || modifiers.has('super') || (modifiers.has('cmdorctrl') && isMacPlatform());
  const expectedCtrl = modifiers.has('ctrl') || modifiers.has('control') || (modifiers.has('cmdorctrl') && !isMacPlatform());
  const expectedAlt = modifiers.has('alt') || modifiers.has('option');
  const expectedShift = modifiers.has('shift');
  if (event.metaKey !== expectedMeta || event.ctrlKey !== expectedCtrl || event.altKey !== expectedAlt || event.shiftKey !== expectedShift) return false;
  return key !== undefined && eventShortcutKeys(event).includes(key);
}

export function eventToShortcut(event: KeyboardEvent, scope: ShortcutScope): string | null {
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

export function formatShortcutForPlatform(shortcut: string, t?: Translator): string {
  const parts = shortcut.split('+').flatMap((part) => part.trim() ? [part.trim()] : []);
  if (!parts.length) return t ? t('notSet') : fallbackMessages.notSet;
  return parts.map((part) => {
    const normalized = normalizeShortcutToken(part);
    if (normalized === 'cmdorctrl') return isMacPlatform() ? 'Command' : 'CTRL';
    if (['cmd', 'command', 'meta', 'super'].includes(normalized)) return 'Command';
    if (['ctrl', 'control'].includes(normalized)) return 'CTRL';
    if (['alt', 'option'].includes(normalized)) return 'Option';
    if (normalized === 'shift') return 'Shift';
    if (normalized === 'esc') return 'Escape';
    if (normalized.startsWith('arrow')) return `Arrow ${normalized.slice(5)[0].toUpperCase()}${normalized.slice(6)}`;
    return part.length === 1 ? part.toUpperCase() : part;
  }).join(' + ');
}

export function isValidGlobalShortcut(shortcut: string): boolean {
  const parts = normalizedShortcutParts(shortcut);
  if (parts.length < 2) return false;
  const modifiers = new Set(parts.slice(0, -1));
  return ['alt', 'cmd', 'cmdorctrl', 'command', 'control', 'ctrl', 'meta', 'option', 'shift', 'super'].some((modifier) => modifiers.has(modifier));
}

export function setShortcutValue(shortcuts: Settings['shortcuts'], target: ShortcutTarget, value: string): Settings['shortcuts'] {
  const next = { ...shortcuts, wheelItems: normalizeWheelItemShortcuts(shortcuts.wheelItems) };
  if (target.kind === 'openWheel') return { ...next, openWheel: value };
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

export function normalizeWheelItemShortcuts(value: string[]): string[] {
  return Array.from({ length: maxWheelItems }, (_, index) => value[index] ?? '');
}

export function normalizeWheelItemIds(value: string[]): string[] {
  return Array.from({ length: maxWheelItems }, (_, index) => value[index] ?? '');
}

function shortcutKeyFromEvent(event: KeyboardEvent): string | null {
  if (['Alt', 'Control', 'Meta', 'Shift'].includes(event.key)) return null;
  if (/^Key[A-Z]$/.test(event.code)) return event.code.slice(3);
  if (/^Digit[0-9]$/.test(event.code)) return event.code.slice(5);
  if (/^Numpad[0-9]$/.test(event.code)) return event.code.slice(6);
  const aliases: Record<string, string> = {
    Backquote: '`', Backslash: '\\', BracketLeft: '[', BracketRight: ']', Comma: ',', Equal: '=', Minus: '-', Period: '.', Quote: "'", Semicolon: ';', Slash: '/',
    ArrowDown: 'ArrowDown', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight', ArrowUp: 'ArrowUp', Escape: 'Escape', Enter: 'Enter', Space: 'Space', Tab: 'Tab',
  };
  if (aliases[event.code]) return aliases[event.code];
  if (/^F([1-9]|1[0-9]|2[0-4])$/.test(event.key)) return event.key.toUpperCase();
  return event.key.length === 1 ? event.key.toUpperCase() : event.key;
}

function shortcutsEqual(left: string | undefined, right: string | undefined): boolean {
  return normalizeShortcutValue(left) === normalizeShortcutValue(right);
}

function normalizeShortcutValue(value: string | undefined): string {
  return normalizedShortcutParts(value).join('+');
}

function normalizedShortcutParts(value: string | undefined): string[] {
  return value?.split('+').flatMap((part) => {
    const normalized = normalizeShortcutToken(part);
    return normalized ? [normalized] : [];
  }) ?? [];
}

function normalizeShortcutToken(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '');
}

function eventShortcutKeys(event: KeyboardEvent): string[] {
  const keys = new Set<string>([normalizeShortcutToken(event.key)]);
  if (/^Key[A-Z]$/.test(event.code)) keys.add(event.code.slice(3).toLowerCase());
  if (/^Digit[0-9]$/.test(event.code)) keys.add(event.code.slice(5));
  if (/^Numpad[0-9]$/.test(event.code)) keys.add(event.code.slice(6));
  const aliases: Record<string, string[]> = {
    Backquote: ['`'], Backslash: ['\\'], BracketLeft: ['['], BracketRight: [']'], Comma: [','], Equal: ['='], Minus: ['-'], Period: ['.'], Quote: ["'"], Semicolon: [';'], Slash: ['/'],
    ArrowDown: ['down'], ArrowLeft: ['left'], ArrowRight: ['right'], ArrowUp: ['up'], Escape: ['esc', 'escape'], Enter: ['enter', 'return'], Space: ['space'], Tab: ['tab'],
  };
  for (const alias of aliases[event.code] ?? []) keys.add(alias);
  return [...keys];
}

function isMacPlatform(): boolean {
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}
