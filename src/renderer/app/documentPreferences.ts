import { useEffect, useState } from 'react';
import type { LanguageCode, LanguageDirection } from '../../shared/i18n';
import { resolveTheme, type ResolvedTheme } from '../../shared/theme';
import type { Settings } from '../../shared/types';

export function useResolvedTheme(theme: Settings['theme']): ResolvedTheme {
  const [prefersDark, setPrefersDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setPrefersDark(media.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);
  return resolveTheme(theme, prefersDark);
}

export function useApplyTheme(theme: ResolvedTheme) {
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
}

export function useApplyLanguage(language: LanguageCode, direction: LanguageDirection) {
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [direction, language]);
}
