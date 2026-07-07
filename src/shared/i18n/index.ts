import enMessages, { type LocaleMessages } from './locales/en';

export type { LocaleMessages };

export type LanguageCode =
  | 'en'
  | 'zh-Hans'
  | 'es'
  | 'ar'
  | 'hi'
  | 'fr'
  | 'ru'
  | 'pt-BR'
  | 'de'
  | 'ja'
  | 'id'
  | 'tr'
  | 'bn'
  | 'fa'
  | 'vi'
  | 'ko'
  | 'it'
  | 'pl'
  | 'uk'
  | 'th'
  | 'ro'
  | 'nl'
  | 'cs'
  | 'sv';

export type LanguageSetting = 'system' | LanguageCode;
export type I18nKey = keyof LocaleMessages;
export type Translator = (key: I18nKey) => string;
export type LanguageDirection = 'ltr' | 'rtl';

export interface LanguageMetadata {
  code: LanguageCode;
  nativeName: string;
  locale: string;
  direction: LanguageDirection;
}

export const languageMetadata: Record<LanguageCode, LanguageMetadata> = {
  en: { code: 'en', nativeName: 'English', locale: 'en-US', direction: 'ltr' },
  'zh-Hans': { code: 'zh-Hans', nativeName: '简体中文', locale: 'zh-Hans-CN', direction: 'ltr' },
  es: { code: 'es', nativeName: 'Español', locale: 'es-ES', direction: 'ltr' },
  ar: { code: 'ar', nativeName: 'العربية', locale: 'ar', direction: 'rtl' },
  hi: { code: 'hi', nativeName: 'हिन्दी', locale: 'hi-IN', direction: 'ltr' },
  fr: { code: 'fr', nativeName: 'Français', locale: 'fr-FR', direction: 'ltr' },
  ru: { code: 'ru', nativeName: 'Русский', locale: 'ru-RU', direction: 'ltr' },
  'pt-BR': { code: 'pt-BR', nativeName: 'Português', locale: 'pt-BR', direction: 'ltr' },
  de: { code: 'de', nativeName: 'Deutsch', locale: 'de-DE', direction: 'ltr' },
  ja: { code: 'ja', nativeName: '日本語', locale: 'ja-JP', direction: 'ltr' },
  id: { code: 'id', nativeName: 'Bahasa Indonesia', locale: 'id-ID', direction: 'ltr' },
  tr: { code: 'tr', nativeName: 'Türkçe', locale: 'tr-TR', direction: 'ltr' },
  bn: { code: 'bn', nativeName: 'বাংলা', locale: 'bn-BD', direction: 'ltr' },
  fa: { code: 'fa', nativeName: 'فارسی', locale: 'fa-IR', direction: 'rtl' },
  vi: { code: 'vi', nativeName: 'Tiếng Việt', locale: 'vi-VN', direction: 'ltr' },
  ko: { code: 'ko', nativeName: '한국어', locale: 'ko-KR', direction: 'ltr' },
  it: { code: 'it', nativeName: 'Italiano', locale: 'it-IT', direction: 'ltr' },
  pl: { code: 'pl', nativeName: 'Polski', locale: 'pl-PL', direction: 'ltr' },
  uk: { code: 'uk', nativeName: 'Українська', locale: 'uk-UA', direction: 'ltr' },
  th: { code: 'th', nativeName: 'ไทย', locale: 'th-TH', direction: 'ltr' },
  ro: { code: 'ro', nativeName: 'Română', locale: 'ro-RO', direction: 'ltr' },
  nl: { code: 'nl', nativeName: 'Nederlands', locale: 'nl-NL', direction: 'ltr' },
  cs: { code: 'cs', nativeName: 'Čeština', locale: 'cs-CZ', direction: 'ltr' },
  sv: { code: 'sv', nativeName: 'Svenska', locale: 'sv-SE', direction: 'ltr' },
};

export const supportedLanguages = Object.keys(languageMetadata) as LanguageCode[];
export const languageOptions: LanguageSetting[] = ['system', ...supportedLanguages];
export const fallbackLanguage: LanguageCode = 'en';
export const fallbackMessages = enMessages;

const localeLoaders: Record<LanguageCode, () => Promise<{ default: LocaleMessages }>> = {
  en: () => Promise.resolve({ default: enMessages }),
  'zh-Hans': () => import('./locales/zh-Hans'),
  es: () => import('./locales/es'),
  ar: () => import('./locales/ar'),
  hi: () => import('./locales/hi'),
  fr: () => import('./locales/fr'),
  ru: () => import('./locales/ru'),
  'pt-BR': () => import('./locales/pt-BR'),
  de: () => import('./locales/de'),
  ja: () => import('./locales/ja'),
  id: () => import('./locales/id'),
  tr: () => import('./locales/tr'),
  bn: () => import('./locales/bn'),
  fa: () => import('./locales/fa'),
  vi: () => import('./locales/vi'),
  ko: () => import('./locales/ko'),
  it: () => import('./locales/it'),
  pl: () => import('./locales/pl'),
  uk: () => import('./locales/uk'),
  th: () => import('./locales/th'),
  ro: () => import('./locales/ro'),
  nl: () => import('./locales/nl'),
  cs: () => import('./locales/cs'),
  sv: () => import('./locales/sv'),
};

export async function loadLocaleMessages(language: LanguageCode): Promise<LocaleMessages> {
  return (await localeLoaders[language]()).default;
}

export function resolveLanguage(setting: LanguageSetting, systemLanguage = getSystemLanguage()): LanguageCode {
  if (setting !== 'system') return normalizeLanguageCode(setting);
  return normalizeLanguageCode(systemLanguage);
}

export function normalizeLanguageCode(value: string): LanguageCode {
  const normalized = value.toLowerCase();
  if (normalized.startsWith('zh')) return 'zh-Hans';
  if (normalized.startsWith('pt')) return 'pt-BR';
  const base = normalized.split(/[-_]/)[0];
  const match = supportedLanguages.find((language) => language.toLowerCase() === normalized || language.toLowerCase() === base);
  return match ?? fallbackLanguage;
}

export function getSystemLanguage(): string {
  if (typeof navigator === 'undefined') return fallbackLanguage;
  return navigator.languages?.[0] ?? navigator.language ?? fallbackLanguage;
}

export function getLanguageLocale(language: LanguageCode): string {
  return languageMetadata[language].locale;
}

export function getLanguageDirection(language: LanguageCode): LanguageDirection {
  return languageMetadata[language].direction;
}

export function createTranslator(messages: LocaleMessages = fallbackMessages): Translator {
  return (key) => messages[key] ?? fallbackMessages[key] ?? key;
}
