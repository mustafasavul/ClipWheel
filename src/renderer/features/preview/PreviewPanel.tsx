import { CaseLower, CaseUpper, Copy, Eye, Heading, Scissors } from 'lucide-react';
import type { ClipboardItem } from '../../../shared/types';
import { transformText, type TextAction } from '../../../shared/textActions';
import { useItemMutations } from '../../data/clipwheelQueries';
import { useI18n } from '../../i18n/I18nContext';
import { labelForType } from '../../presentation/formatters';
import { IconButton } from '../../ui/IconButton';
import { ItemMetadata } from './ItemMetadata';
import { PreviewContent } from './PreviewContent';

export function PreviewPanel({ item, onRefresh }: { item: ClipboardItem | null; onRefresh: () => Promise<void> }) {
  const { t } = useI18n();
  const mutations = useItemMutations();

  if (!item) {
    return (
      <div className="preview-panel empty-state">
        <Eye size={34} />
        <h2>{t('selectAnItem')}</h2>
        <p>{t('selectAnItemDescription')}</p>
      </div>
    );
  }

  const text = item.contentText ?? item.url ?? item.previewText;
  const canTransform = ['plain_text', 'code', 'url', 'command', 'rich_text'].includes(item.type);
  const applyAction = async (action: TextAction, title: string) => {
    const result = transformText(text, action);
    await mutations.transform.mutateAsync({ id: item.id, text: result, title });
    await onRefresh();
  };

  return (
    <div className="preview-panel">
      <header className="preview-header">
        <div>
          <p className="eyebrow">{labelForType(item.type, t)}</p>
          <h2>{item.title}</h2>
        </div>
        <button type="button" className="primary-button" onClick={() => void mutations.copy.mutateAsync(item.id)}><Copy size={17} /> {t('copy')}</button>
      </header>
      <PreviewContent item={item} />
      <ItemMetadata item={item} />
      {canTransform && (
        <div className="tool-strip">
          <IconButton label={t('uppercase')} onClick={() => void applyAction({ type: 'uppercase' }, t('uppercaseTitle'))}><CaseUpper size={16} /></IconButton>
          <IconButton label={t('lowercase')} onClick={() => void applyAction({ type: 'lowercase' }, t('lowercaseTitle'))}><CaseLower size={16} /></IconButton>
          <IconButton label={t('titleCase')} onClick={() => void applyAction({ type: 'titlecase' }, t('titleCaseTitle'))}><Heading size={16} /></IconButton>
          <IconButton label={t('trim')} onClick={() => void applyAction({ type: 'trim' }, t('trimmedTitle'))}><Scissors size={16} /></IconButton>
        </div>
      )}
    </div>
  );
}
