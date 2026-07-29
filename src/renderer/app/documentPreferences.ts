import { useEffect, useState } from 'react';
import type { LanguageCode, LanguageDirection, Translator } from '../../shared/i18n';
import { resolveTheme, type ResolvedTheme } from '../../shared/theme';
import type { AppApi, Settings } from '../../shared/types';

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

/**
 * Tray menu and capture-generated titles are built in Rust, which has no access
 * to the renderer's message catalogue. Push the translated strings down whenever
 * the language changes so the native surfaces follow the app language.
 */
export function useApplyLocaleStrings(api: Pick<AppApi, 'setLocaleStrings'>, t: Translator) {
  useEffect(() => {
    void api.setLocaleStrings({
      trayOpen: t('trayOpen'),
      trayWheel: t('trayWheel'),
      traySettings: t('settings'),
      trayQuit: t('trayQuit'),
      trayRecentCaptures: t('recentCaptures'),
      trayNoRecentCaptures: t('trayNoRecentCaptures'),
      trayUntitledCapture: t('trayUntitledCapture'),
      image: t('image'),
      files: t('fileReference'),
      url: t('url'),
      captureImageTitle: t('captureImageTitle'),
      captureImagePreview: t('captureImagePreview'),
      captureFileCountOne: t('captureFileCountOne'),
      captureFileCountOther: t('captureFileCountOther'),
    }).catch(() => {
      // Native labels stay on their previous value; not worth surfacing.
    });
  }, [api, t]);
}
