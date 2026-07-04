import type { ClipboardItemType, CodeLanguage } from './types';

const urlPattern = /^(https?:\/\/|www\.)[^\s/$.?#].[^\s]*$/i;
const shellPattern = /^\s*(npm|pnpm|yarn|git|cd|ls|mkdir|rm|cp|mv|curl|wget|docker|kubectl|ssh|scp|chmod|chown|brew|pip|python|node)\b/m;

export function isUrl(text: string): boolean {
  return urlPattern.test(text.trim());
}

export function detectCodeLanguage(text: string): CodeLanguage {
  const trimmed = text.trim();
  if (!trimmed) return 'unknown';
  if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && isJson(trimmed)) return 'json';
  if (/<!doctype html|<\/?[a-z][\s\S]*>/i.test(trimmed)) return 'html';
  if (/^\s*([.#]?[\w-]+\s*\{|@media|:root\s*\{)/m.test(trimmed) && /[{}:;]/.test(trimmed)) return 'css';
  if (/^\s*(def|import|from|class)\s+\w+|print\(|if __name__ == ['"]__main__['"]/m.test(trimmed)) return 'python';
  if (shellPattern.test(trimmed)) return 'shell';
  if (/\b(interface|type|enum|implements|readonly)\b/.test(trimmed) && /\b(import|export|const|let|function)\b/.test(trimmed)) return 'typescript';
  if (/\b(import|export|const|let|function|=>|console\.log|require\()\b/.test(trimmed)) return 'javascript';
  return 'unknown';
}

export function isCommandSnippet(text: string): boolean {
  const lines = text.trim().split('\n');
  return lines.length <= 4 && shellPattern.test(text) && !/[{};]/.test(text.replace(/;?\s*$/, ''));
}

export function detectClipboardType(input: {
  text?: string;
  html?: string;
  rtf?: string;
  hasImage?: boolean;
  filePaths?: string[];
}): { type: ClipboardItemType; codeLanguage: CodeLanguage | null; url: string | null } {
  if (input.hasImage) return { type: 'image', codeLanguage: null, url: null };
  if (input.filePaths?.length) return { type: 'file_reference', codeLanguage: null, url: null };

  const text = input.text?.trim() ?? '';
  if (text && isUrl(text)) return { type: 'url', codeLanguage: null, url: text.startsWith('www.') ? `https://${text}` : text };
  if (text && isCommandSnippet(text)) return { type: 'command', codeLanguage: 'shell', url: null };

  const language = text ? detectCodeLanguage(text) : 'unknown';
  if (language !== 'unknown') return { type: 'code', codeLanguage: language, url: null };
  if (input.html || input.rtf) return { type: 'rich_text', codeLanguage: null, url: null };
  return { type: 'plain_text', codeLanguage: null, url: null };
}

function isJson(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}
