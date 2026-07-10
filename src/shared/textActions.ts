export type TextAction =
  | { type: 'uppercase' }
  | { type: 'lowercase' }
  | { type: 'titlecase' }
  | { type: 'trim' };

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
  }
}
