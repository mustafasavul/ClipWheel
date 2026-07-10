import { useState } from 'react';
import { Braces, Copy, Eye, Link, QrCode, Type, Wand2, X } from 'lucide-react';
import type { ClipboardItem } from '../../../shared/types';
import { transformText, type TextAction } from '../../../shared/textActions';
import { qrColorsForTheme, type ResolvedTheme } from '../../../shared/theme';
import { useItemMutations } from '../../data/clipwheelQueries';
import { useI18n } from '../../i18n/I18nContext';
import { labelForType } from '../../presentation/formatters';
import { IconButton } from '../../ui/IconButton';
import { ItemMetadata } from './ItemMetadata';
import { PreviewContent } from './PreviewContent';

export function PreviewPanel({ item, onRefresh, resolvedTheme }: { item: ClipboardItem | null; onRefresh: () => Promise<void>; resolvedTheme: ResolvedTheme }) {
  const { t } = useI18n();
  const mutations = useItemMutations();
  const [qr, setQr] = useState<{ itemId: string; value: string } | null>(null);
  const [regexPattern, setRegexPattern] = useState('');
  const [regexReplacement, setRegexReplacement] = useState('');

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
  const currentQr = qr?.itemId === item.id ? qr.value : null;
  const canTransform = ['plain_text', 'code', 'url', 'command', 'rich_text'].includes(item.type);
  const createQr = async () => {
    const QRCode = await import('qrcode');
    setQr({ itemId: item.id, value: await QRCode.toDataURL(text, { margin: 1, width: 320, color: qrColorsForTheme(resolvedTheme) }) });
  };
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
          <IconButton label={t('uppercase')} onClick={() => void applyAction({ type: 'uppercase' }, t('uppercaseTitle'))}><Type size={16} /></IconButton>
          <IconButton label={t('lowercase')} onClick={() => void applyAction({ type: 'lowercase' }, t('lowercaseTitle'))}><Type size={16} /></IconButton>
          <IconButton label={t('titleCase')} onClick={() => void applyAction({ type: 'titlecase' }, t('titleCaseTitle'))}><Wand2 size={16} /></IconButton>
          <IconButton label={t('trim')} onClick={() => void applyAction({ type: 'trim' }, t('trimmedTitle'))}><X size={16} /></IconButton>
          <IconButton label={t('dedupeSpaces')} onClick={() => void applyAction({ type: 'dedupe_spaces' }, t('spaceNormalizedTitle'))}><Braces size={16} /></IconButton>
          <IconButton label={t('slugify')} onClick={() => void applyAction({ type: 'slugify' }, t('slugifiedTitle'))}><Link size={16} /></IconButton>
          <IconButton label={t('jsonPretty')} onClick={() => void applyAction({ type: 'json_pretty' }, t('jsonPrettyTitle'))}><Braces size={16} /></IconButton>
          <IconButton label={t('jsonMinify')} onClick={() => void applyAction({ type: 'json_minify' }, t('jsonMinifyTitle'))}><Braces size={16} /></IconButton>
          <IconButton label={t('qrCode')} onClick={() => void createQr()}><QrCode size={16} /></IconButton>
        </div>
      )}
      {canTransform && (
        <div className="regex-row">
          <input aria-label={t('regexPattern')} placeholder={t('regexPattern')} value={regexPattern} onChange={(event) => setRegexPattern(event.target.value)} />
          <input aria-label={t('regexReplacement')} placeholder={t('regexReplacement')} value={regexReplacement} onChange={(event) => setRegexReplacement(event.target.value)} />
          <button type="button" onClick={() => void applyAction({ type: 'regex_replace', pattern: regexPattern, replacement: regexReplacement }, t('regexTransformTitle'))}>{t('save')}</button>
        </div>
      )}
      {currentQr && (
        <div className="modal-layer">
          <button type="button" className="modal-backdrop" aria-label={t('back')} onClick={() => setQr(null)} />
          <div className="qr-modal" onClick={(event) => event.stopPropagation()}>
            <img src={currentQr} alt={t('qrCode')} />
            <a className="secondary-button" download="clipwheel-qr.png" href={currentQr}>{t('saveQrImage')}</a>
          </div>
        </div>
      )}
    </div>
  );
}

