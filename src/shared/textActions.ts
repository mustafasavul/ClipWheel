export type TextAction =
  | { type: 'uppercase' }
  | { type: 'lowercase' }
  | { type: 'titlecase' }
  | { type: 'trim' }
  | { type: 'dedupe_spaces' }
  | { type: 'slugify' }
  | { type: 'json_pretty' }
  | { type: 'json_minify' }
  | { type: 'regex_replace'; pattern: string; replacement: string; flags?: string };

export function transformText(text: string, action: TextAction): string {
  switch (action.type) {
    case 'uppercase':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    case 'titlecase':
      return text.toLowerCase().replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
    case 'trim':
      return text.trim();
    case 'dedupe_spaces':
      return text.replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n');
    case 'slugify':
      return text
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    case 'json_pretty':
      return JSON.stringify(JSON.parse(text), null, 2);
    case 'json_minify':
      return JSON.stringify(JSON.parse(text));
    case 'regex_replace':
      return text.replace(new RegExp(action.pattern, action.flags ?? 'g'), action.replacement);
  }
}
