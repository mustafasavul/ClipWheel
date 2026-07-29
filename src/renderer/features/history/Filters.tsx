import { Search } from 'lucide-react';
import { clipboardFlagColors, type ClipboardFlagColor, type ClipboardItemType, type HistoryQuery } from '../../../shared/types';
import { useI18n } from '../../i18n/I18nContext';
import { labelForCollectionFilter, labelForFlag, labelForType } from '../../presentation/formatters';

const typeOptions: Array<ClipboardItemType | 'all'> = ['all', 'plain_text', 'rich_text', 'code', 'url', 'image', 'file_reference', 'command'];
const collectionFilterOptions: Array<NonNullable<HistoryQuery['collectionFilter']>> = ['all', 'wheel', 'favorites'];

export function Filters({ query, onChange }: { query: HistoryQuery; onChange: (patch: Partial<HistoryQuery>) => void }) {
  const { t } = useI18n();
  const updateQuery = (patch: Partial<HistoryQuery>) => {
    onChange(patch);
  };

  return (
    <div className="filters">
      <label className="search-field">
        <Search size={17} />
        <input value={query.search ?? ''} onChange={(event) => updateQuery({ search: event.target.value })} placeholder={t('searchPlaceholder')} />
      </label>
      <select aria-label={t('clipboard')} value={query.type ?? 'all'} onChange={(event) => updateQuery({ type: event.target.value as ClipboardItemType | 'all' })}>
        {typeOptions.map((type) => <option key={type} value={type}>{labelForType(type, t)}</option>)}
      </select>
      <select aria-label={t('filter')} disabled={query.collectionFilter === 'trash'} value={query.collectionFilter === 'trash' ? 'all' : query.collectionFilter ?? 'all'} onChange={(event) => updateQuery({ collectionFilter: event.target.value as HistoryQuery['collectionFilter'] })}>
        {collectionFilterOptions.map((filter) => <option key={filter} value={filter}>{labelForCollectionFilter(filter, t)}</option>)}
      </select>
      <select aria-label={t('flag')} value={query.flagFilter ?? 'all'} onChange={(event) => updateQuery({ flagFilter: event.target.value as ClipboardFlagColor | 'all' | 'none' })}>
        <option value="all">{t('allFlags')}</option>
        <option value="none">{t('noFlag')}</option>
        {clipboardFlagColors.map((flag) => <option key={flag} value={flag}>{labelForFlag(flag, t)}</option>)}
      </select>
      <select aria-label={t('allDates')} value={query.dateFilter ?? 'all'} onChange={(event) => updateQuery({ dateFilter: event.target.value as HistoryQuery['dateFilter'] })}>
        <option value="all">{t('allDates')}</option>
        <option value="today">{t('today')}</option>
        <option value="last7">{t('last7Days')}</option>
        <option value="last30">{t('last30Days')}</option>
        <option value="custom">{t('custom')}</option>
      </select>
      {query.dateFilter === 'custom' && (
        <>
          <input aria-label={t('startDate')} type="date" onChange={(event) => updateQuery({ startDate: new Date(event.target.value).toISOString() })} />
          <input aria-label={t('endDate')} type="date" onChange={(event) => updateQuery({ endDate: new Date(event.target.value).toISOString() })} />
        </>
      )}
    </div>
  );
}
