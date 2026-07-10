import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import cssLang from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import { Link } from 'lucide-react';
import sanitizeHtml from 'sanitize-html';
import type { ClipboardItem } from '../../../shared/types';
import { useImageQuery } from '../../data/clipwheelQueries';
import { useI18n } from '../../i18n/I18nContext';
import { safeDomain } from '../../presentation/formatters';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('css', cssLang);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('python', python);

export function PreviewContent({ item }: { item: ClipboardItem }) {
  const { t } = useI18n();
  const imageQuery = useImageQuery(item.id, item.type === 'image');
  if (item.type === 'image') {
    if (imageQuery.error) return <div className="image-preview image-preview-state">{t('unableToLoadImagePreview')}</div>;
    if (imageQuery.isLoading) return <div className="image-preview image-preview-state">{t('loadingImagePreview')}</div>;
    if (!imageQuery.data) return <div className="image-preview image-preview-state">{t('imageFileMissing')}</div>;
    return <img className="image-preview" src={imageQuery.data} alt={t('clipboardPreview')} />;
  }
  if (item.type === 'file_reference') return <pre className="preview-code">{item.filePaths.join('\n')}</pre>;
  if (item.type === 'rich_text' && item.contentHtml) {
    const html = sanitizeHtml(item.contentHtml, {
      allowedTags: sanitizeHtml.defaults.allowedTags.filter((tag) => tag !== 'script'),
      allowedAttributes: { a: ['href', 'title'], img: ['src', 'alt'] },
    });
    return <div className="rich-preview" dangerouslySetInnerHTML={{ __html: html }} />;
  }
  if (item.type === 'code' || item.type === 'command') {
    const language = item.codeLanguage ?? 'plaintext';
    const value = item.contentText ?? item.previewText;
    const highlighted = hljs.getLanguage(language) ? hljs.highlight(value, { language }).value : hljs.highlightAuto(value).value;
    return <pre className="preview-code"><code dangerouslySetInnerHTML={{ __html: highlighted }} /></pre>;
  }
  if (item.type === 'url') {
    const url = item.url ?? item.contentText ?? '';
    return <div className="url-preview"><Link size={22} /><strong>{safeDomain(url)}</strong><span>{url}</span></div>;
  }
  return <pre className="preview-text">{item.contentText ?? item.previewText}</pre>;
}
