import type { Settings } from './types';

export type ResolvedTheme = 'dark' | 'light';

export function resolveTheme(theme: Settings['theme'], prefersDark: boolean): ResolvedTheme {
  if (theme === 'system') return prefersDark ? 'dark' : 'light';
  return theme;
}
