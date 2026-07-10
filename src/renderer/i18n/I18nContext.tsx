import React, { use, useEffect, useMemo, useState } from 'react';
import {
  createTranslator,
  fallbackMessages,
  getLanguageDirection,
  getLanguageLocale,
  loadLocaleMessages,
  type LanguageCode,
  type LanguageDirection,
  type LocaleMessages,
  type Translator,
} from '../../shared/i18n';

export interface I18nView {
  language: LanguageCode;
  locale: string;
  direction: LanguageDirection;
  t: Translator;
}

export const I18nContext = React.createContext<I18nView>({
  language: 'en',
  locale: 'en-US',
  direction: 'ltr',
  t: createTranslator(fallbackMessages),
});

export function useI18n(): I18nView {
  return use(I18nContext);
}

export function useLocale(language: LanguageCode): I18nView {
  const [localeState, setLocaleState] = useState<{ language: LanguageCode; messages: LocaleMessages }>({
    language: 'en',
    messages: fallbackMessages,
  });

  useEffect(() => {
    let disposed = false;
    setLocaleState({ language, messages: fallbackMessages });
    if (language === 'en') return () => { disposed = true; };
    void loadLocaleMessages(language).then((messages) => {
      if (!disposed) setLocaleState({ language, messages });
    }).catch(() => {
      if (!disposed) setLocaleState({ language, messages: fallbackMessages });
    });
    return () => { disposed = true; };
  }, [language]);

  const messages = localeState.language === language ? localeState.messages : fallbackMessages;
  return useMemo(() => ({
    language,
    locale: getLanguageLocale(language),
    direction: getLanguageDirection(language),
    t: createTranslator(messages),
  }), [language, messages]);
}
