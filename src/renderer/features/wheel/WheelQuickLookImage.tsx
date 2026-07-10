import type { ClipboardItem } from '../../../shared/types';
import { useImageQuery } from '../../data/clipwheelQueries';
import { useI18n } from '../../i18n/I18nContext';

export function WheelQuickLookImage({ item }: { item: ClipboardItem }) {
  const { t } = useI18n();
  const imageQuery = useImageQuery(item.id);
  if (imageQuery.error) return <div className="wheel-quicklook-image-state">{t('unableToLoadImagePreview')}</div>;
  if (imageQuery.isLoading) return <div className="wheel-quicklook-image-state">{t('loadingPreview')}</div>;
  if (!imageQuery.data) return <div className="wheel-quicklook-image-state">{t('imagePreviewUnavailable')}</div>;
  return <img className="wheel-quicklook-image" src={imageQuery.data} alt={t('clipboardQuicklookPreview')} />;
}
