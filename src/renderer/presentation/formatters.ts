import type { ClipboardItem, ClipboardItemType, HistoryQuery } from '../../shared/types';
import { languageMetadata, type I18nKey, type LanguageCode, type Translator } from '../../shared/i18n';
import type { I18nView } from '../i18n/I18nContext';

export type CleanupActionId = 'all' | 'purge_deleted';

const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();
const relativeTimeFormatters = new Map<string, Intl.RelativeTimeFormat>();

export function wheelSegmentMeta(item: ClipboardItem, i18n: I18nView): string {
  return `${labelForType(item.type, i18n.t)} • ${formatRelativeTime(item.createdAt, i18n.locale, i18n.t)}`;
}

export function labelForType(type: ClipboardItemType | 'all', t: Translator): string {
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

export function labelForCollectionFilter(filter: NonNullable<HistoryQuery['collectionFilter']>, t: Translator): string {
  if (filter === 'wheel') return t('wheel');
  if (filter === 'favorites') return t('favorite');
  return t('all');
}

export function cleanupConfirmMessage(action: CleanupActionId, t: Translator): string {
  if (action === 'purge_deleted') return t('cleanupConfirmPurgeDeleted');
  return t('cleanupConfirmClearHistory');
}

export function formatInfoLabels(item: ClipboardItem, t: Translator): string[] {
  const labels: string[] = [];
  if (item.formatInfo.hasText) labels.push(t('plainText'));
  if (item.formatInfo.hasHtml) labels.push('HTML');
  if (item.formatInfo.hasRtf) labels.push('RTF');
  if (item.formatInfo.hasImage) labels.push(t('image'));
  if (item.formatInfo.hasFiles) labels.push(t('files'));
  return labels;
}

export function labelForSignal(signal: ClipboardItem['contentSignals'][number], t: Translator): string {
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

export function labelFromToken(value: string, t?: Translator): string {
  if (t) {
    const key = tokenLabelKey(value);
    if (key) return t(key);
  }
  return value.split('_').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ');
}

export function tokenLabelKey(value: string): I18nKey | null {
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

export function settingOptionLabel(value: string, t: Translator): string {
  return labelFromToken(value, t);
}

export function languageOptionLabel(value: string, t: Translator): string {
  if (value === 'system') return t('system');
  return languageMetadata[value as LanguageCode]?.nativeName ?? value;
}

export function safeDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function getContentLength(item: ClipboardItem): number | null {
  if (item.type === 'image') return null;
  if (item.type === 'file_reference') return item.filePaths.join('\n').length;
  return (item.contentText ?? item.url ?? item.previewText).length;
}

export function getLineCount(item: ClipboardItem): number | null {
  if (item.type === 'image') return null;
  const value = item.type === 'file_reference' ? item.filePaths.join('\n') : item.contentText ?? item.url ?? item.previewText;
  if (!value) return 0;
  return value.split(/\r\n|\r|\n/).length;
}

export function formatBytes(bytes: number, locale: string, t: Translator): string {
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

export function formatDateTime(value: string, locale: string): string {
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

export function formatRelativeTime(value: string, locale: string, t: Translator): string {
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

export function getRelativeTimeFormatter(locale: string): Intl.RelativeTimeFormat {
  let formatter = relativeTimeFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' });
    relativeTimeFormatters.set(locale, formatter);
  }
  return formatter;
}
