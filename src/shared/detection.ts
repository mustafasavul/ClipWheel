import type { ClipboardFormatInfo, ClipboardItemType, ClipboardPlatform, CodeLanguage, ContentSignal } from './types';

const urlPattern = /^(https?:\/\/|www\.)[^\s/$.?#].[^\s]*$/i;
const embeddedUrlPattern = /\bhttps?:\/\/[^\s<>"']+|\bwww\.[^\s<>"']+/i;
const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const hexColorPattern = /(^|[^A-Fa-f0-9])#(?:[A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})(?![A-Fa-f0-9])/;
const shellPattern = /^\s*(npm|pnpm|yarn|git|cd|ls|mkdir|rm|cp|mv|curl|wget|docker|kubectl|ssh|scp|chmod|chown|brew|pip|python|node)\b/m;
const markdownPattern = /(^|\n)\s{0,3}(#{1,6}\s+\S|[-*+]\s+\S|\d+\.\s+\S|>\s+\S|```)/;

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
  if (isCommandSnippet(trimmed)) return 'shell';
  if (/\b(interface|type|enum|implements|readonly)\b/.test(trimmed) && /\b(import|export|const|let|function)\b/.test(trimmed)) return 'typescript';
  if (/\b(import|export|const|let|function|=>|console\.log|require\()\b/.test(trimmed)) return 'javascript';
  return 'unknown';
}

export function isCommandSnippet(text: string): boolean {
  const lines = text.trim().split('\n').map((line) => line.trim()).filter(Boolean);
  return lines.length > 0 && lines.length <= 4 && lines.every((line) => shellPattern.test(line)) && !/[{};]/.test(text.replace(/;?\s*$/, ''));
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

export function normalizeClipboardFormats(input: {
  rawFormats?: string[];
  hasText?: boolean;
  hasHtml?: boolean;
  hasRtf?: boolean;
  hasImage?: boolean;
  hasFiles?: boolean;
  platform?: NodeJS.Platform | ClipboardPlatform;
}): ClipboardFormatInfo {
  const rawFormats = Array.from(new Set((input.rawFormats ?? []).filter(Boolean)));
  const lowerFormats = rawFormats.map((format) => format.toLowerCase());
  const normalized = new Set<string>();

  if (input.hasText || lowerFormats.some((format) => /text\/plain|plain-text|utf8-plain-text|unicode text|cf_unicode/.test(format))) normalized.add('text/plain');
  if (input.hasHtml || lowerFormats.some((format) => /text\/html|public\.html|html format/.test(format))) normalized.add('text/html');
  if (input.hasRtf || lowerFormats.some((format) => /text\/rtf|public\.rtf|rich text|rtf/.test(format))) normalized.add('text/rtf');
  if (input.hasImage || lowerFormats.some((format) => /image\/|public\.(png|jpeg|tiff)|bitmap|dib|cf_dib/.test(format))) normalized.add('image');
  if (input.hasFiles || lowerFormats.some((format) => /file|uri-list|filename|nsfilenames|cf_hdrop/.test(format))) normalized.add('files');

  return {
    rawFormats,
    normalizedFormats: Array.from(normalized),
    hasText: normalized.has('text/plain'),
    hasHtml: normalized.has('text/html'),
    hasRtf: normalized.has('text/rtf'),
    hasImage: normalized.has('image'),
    hasFiles: normalized.has('files'),
    platform: normalizePlatform(input.platform),
  };
}

export function detectContentSignals(input: {
  text?: string;
  html?: string;
  rtf?: string;
  hasImage?: boolean;
  filePaths?: string[];
  codeLanguage?: CodeLanguage | null;
}): ContentSignal[] {
  const signals: ContentSignal[] = [];
  const text = input.text ?? '';
  const trimmed = text.trim();

  if (input.html?.trim()) signals.push({ kind: 'html', confidence: 'high' });
  if (input.codeLanguage && input.codeLanguage !== 'unknown') {
    signals.push({ kind: input.codeLanguage === 'shell' ? 'shell' : 'code', confidence: 'high', language: input.codeLanguage });
    if (input.codeLanguage === 'json') signals.push({ kind: 'json', confidence: 'high', language: 'json', range: { start: text.indexOf(trimmed), end: text.indexOf(trimmed) + trimmed.length } });
  }

  if (!trimmed) return dedupeSignals(signals);

  if (!signals.some((signal) => signal.kind === 'json')) {
    const jsonFragment = findJsonFragment(text);
    if (jsonFragment) signals.push({ kind: 'json_fragment', confidence: 'medium', language: 'json', range: jsonFragment });
  }

  const urlMatch = text.match(embeddedUrlPattern);
  if (urlMatch?.index !== undefined) signals.push({ kind: 'url', confidence: isUrl(trimmed) ? 'high' : 'medium', range: { start: urlMatch.index, end: urlMatch.index + urlMatch[0].length } });

  const emailMatch = text.match(emailPattern);
  if (emailMatch?.index !== undefined) signals.push({ kind: 'email', confidence: 'medium', range: { start: emailMatch.index, end: emailMatch.index + emailMatch[0].length } });

  const colorMatch = text.match(hexColorPattern);
  if (colorMatch?.index !== undefined) {
    const offset = colorMatch[1] ? colorMatch[1].length : 0;
    const color = colorMatch[0].slice(offset);
    signals.push({ kind: 'hex_color', confidence: 'medium', range: { start: colorMatch.index + offset, end: colorMatch.index + offset + color.length }, metadata: { value: color } });
  }

  if (markdownPattern.test(text)) signals.push({ kind: 'markdown', confidence: 'medium' });
  if (/```[\s\S]*?```/.test(text)) signals.push({ kind: 'code_block', confidence: 'medium' });
  if ((isCommandSnippet(text) || shellPattern.test(text)) && !signals.some((signal) => signal.kind === 'shell')) signals.push({ kind: 'shell', confidence: isCommandSnippet(text) ? 'high' : 'medium', language: 'shell' });

  return dedupeSignals(signals);
}

function isJson(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

function normalizePlatform(platform: NodeJS.Platform | ClipboardPlatform | undefined): ClipboardPlatform {
  if (platform === 'darwin' || platform === 'win32' || platform === 'linux') return platform;
  return 'unknown';
}

function dedupeSignals(signals: ContentSignal[]): ContentSignal[] {
  const seen = new Set<string>();
  return signals.filter((signal) => {
    const key = `${signal.kind}:${signal.language ?? ''}:${signal.range?.start ?? ''}:${signal.range?.end ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function findJsonFragment(text: string): { start: number; end: number } | null {
  for (let start = 0; start < text.length; start += 1) {
    const opener = text[start];
    if (opener !== '{' && opener !== '[') continue;
    const closer = opener === '{' ? '}' : ']';
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = start; index < text.length; index += 1) {
      const char = text[index];
      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (char === '\\') {
          escaped = true;
        } else if (char === '"') {
          inString = false;
        }
        continue;
      }
      if (char === '"') {
        inString = true;
      } else if (char === opener) {
        depth += 1;
      } else if (char === closer) {
        depth -= 1;
        if (depth === 0) {
          const end = index + 1;
          if (end - start < text.trim().length && isJson(text.slice(start, end))) return { start, end };
          break;
        }
      }
    }
  }
  return null;
}
