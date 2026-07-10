import type { ClipboardItem } from '../../../shared/types';
import { useI18n } from '../../i18n/I18nContext';
import { formatBytes, formatDateTime, formatInfoLabels, getContentLength, getLineCount, labelForSignal } from '../../presentation/formatters';

export function ItemMetadata({ item }: { item: ClipboardItem }) {
  const { locale, t } = useI18n();
  const length = getContentLength(item);
  const lines = getLineCount(item);
  const formatLabels = formatInfoLabels(item, t);
  const signalLabels = item.contentSignals.map((signal) => labelForSignal(signal, t));
  const details = [
    { label: t('size'), value: formatBytes(item.sizeBytes, locale, t) },
    { label: t('length'), value: length === null ? t('notAvailable') : `${length.toLocaleString(locale)} ${t('chars')}` },
    { label: t('lines'), value: lines === null ? t('notAvailable') : lines.toLocaleString(locale) },
    { label: t('files'), value: item.filePaths.length.toLocaleString(locale) },
    { label: t('clipboardFormats'), value: formatLabels.length ? formatLabels.join(', ') : t('unknown') },
    { label: t('detectedContent'), value: signalLabels.length ? signalLabels.join(', ') : t('none') },
    { label: t('created'), value: formatDateTime(item.createdAt, locale) },
    { label: t('lastUsed'), value: item.lastUsedAt ? formatDateTime(item.lastUsedAt, locale) : t('never') },
  ];

  return (
    <div className="metadata-stack">
      <dl className="metadata-grid">
        {details.map((detail) => (
          <div key={detail.label}>
            <dt>{detail.label}</dt>
            <dd title={detail.value}>{detail.value}</dd>
          </div>
        ))}
      </dl>
      {(formatLabels.length > 0 || signalLabels.length > 0) && (
        <div className="metadata-badges" aria-label={t('clipboardMetadata')}>
          {formatLabels.map((label) => <span key={`format-${label}`}>{label}</span>)}
          {signalLabels.map((label) => <span key={`signal-${label}`}>{label}</span>)}
        </div>
      )}
      {item.formatInfo.rawFormats.length > 0 && (
        <details className="raw-formats">
          <summary>{t('rawClipboardFormats')}</summary>
          <code>{item.formatInfo.rawFormats.join(', ')}</code>
        </details>
      )}
    </div>
  );
}

