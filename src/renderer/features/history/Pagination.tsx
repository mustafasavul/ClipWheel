import { useI18n } from '../../i18n/I18nContext';

export function Pagination({ page, pageSize, totalItems, totalPages, onPageChange, onPageSizeChange }: {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const { t } = useI18n();
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(totalItems, page * pageSize);
  return (
    <div className="pagination-bar">
      <span>{start}-{end} / {totalItems}</span>
      <div className="pagination-controls">
        <select aria-label={t('itemsPerPage')} value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        <button type="button" onClick={() => onPageChange(1)} disabled={page === 1}>{t('first')}</button>
        <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}>{t('prev')}</button>
        <strong>{page} / {totalPages}</strong>
        <button type="button" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}>{t('next')}</button>
        <button type="button" onClick={() => onPageChange(totalPages)} disabled={page === totalPages}>{t('last')}</button>
      </div>
    </div>
  );
}
