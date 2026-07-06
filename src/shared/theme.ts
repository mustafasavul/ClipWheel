import type { Settings } from './types';

export type ResolvedTheme = 'dark' | 'light';

export function resolveTheme(theme: Settings['theme'], prefersDark: boolean): ResolvedTheme {
  if (theme === 'system') return prefersDark ? 'dark' : 'light';
  return theme;
}

export function qrColorsForTheme(theme: ResolvedTheme): { dark: string; light: string } {
  return theme === 'dark'
    ? { dark: '#182018', light: '#f4f7ef' }
    : { dark: '#172018', light: '#fbfcf8' };
}
