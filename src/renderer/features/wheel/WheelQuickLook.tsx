import type { ClipboardItem } from '../../../shared/types';
import { useI18n } from '../../i18n/I18nContext';
import { formatDateTime, labelForType } from '../../presentation/formatters';
import { WheelQuickLookImage } from './WheelQuickLookImage';

export function WheelQuickLook({ item, side }: { item: ClipboardItem; side: 'left' | 'right' }) {
  const { locale, t } = useI18n();
  return (
    <aside className={`wheel-quicklook ${side}`}>
      <span className="type-chip">{labelForType(item.type, t)}</span>
      <strong>{item.title}</strong>
      <time className="wheel-quicklook-created" dateTime={item.createdAt}>
        <span>{t('created')}</span>
        <strong>{formatDateTime(item.createdAt, locale)}</strong>
      </time>
      {item.type === 'image' && <WheelQuickLookImage item={item} />}
      <div className="wheel-quicklook-body">
        <p>{item.previewText}</p>
        {item.url && <small>{item.url}</small>}
        {item.filePaths.length > 0 && <small>{item.filePaths.join('\n')}</small>}
      </div>
    </aside>
  );
}

