import { describe, expect, it } from 'vitest';
import { matchesCleanupRequest } from '../src/shared/cleanupFilters';
import { detectClipboardType, detectCodeLanguage, detectContentSignals, isUrl, normalizeClipboardFormats } from '../src/shared/detection';
import { hashContent, normalizeContent } from '../src/shared/hash';
import { createTranslator, getLanguageDirection, languageMetadata, languageOptions, loadLocaleMessages, resolveLanguage, supportedLanguages } from '../src/shared/i18n';
import { getSegmentIndex } from '../src/shared/radialGeometry';
import { defaultSettings } from '../src/shared/settings';
import { qrColorsForTheme, resolveTheme } from '../src/shared/theme';
import type { ClipboardItem } from '../src/shared/types';
import { applyWheelAppearancePreset, defaultWheelAppearance, normalizeOpacity, wheelAppearancePresets, wheelAppearanceStyle, wheelSegmentStyle } from '../src/shared/wheelAppearance';

describe('normalization and hashing', () => {
  it('normalizes trailing whitespace and line endings', () => {
    expect(normalizeContent(' hello \r\nworld  \n')).toBe('hello\nworld');
  });

  it('hashes normalized equivalent content consistently', () => {
    expect(hashContent([normalizeContent('a\r\n')])).toBe(hashContent([normalizeContent('a\n')]));
  });
});

describe('type detection', () => {
  it('detects URLs', () => {
    expect(isUrl('https://example.com/a')).toBe(true);
    expect(detectClipboardType({ text: 'www.example.com' }).type).toBe('url');
  });

  it('detects code languages', () => {
    expect(detectCodeLanguage('const value: string = "x";\nexport type Demo = { value: string }')).toBe('typescript');
    expect(detectCodeLanguage('{"ok": true}')).toBe('json');
    expect(detectCodeLanguage('def run():\n    print("ok")')).toBe('python');
  });

  it('keeps mixed JSON as text but adds a JSON fragment signal', () => {
    const text = 'Config follows:\n{"ok": true}\nUse carefully.';
    expect(detectClipboardType({ text }).type).toBe('plain_text');
    expect(detectContentSignals({ text }).some((signal) => signal.kind === 'json_fragment')).toBe(true);
  });

  it('detects rich text from clipboard formats after stronger text classifications', () => {
    expect(detectClipboardType({ text: 'Hello', html: '<b>Hello</b>' }).type).toBe('rich_text');
    expect(detectClipboardType({ text: '{"ok": true}', html: '<b>{"ok": true}</b>' })).toMatchObject({ type: 'code', codeLanguage: 'json' });
  });

  it('adds URL signals only for embedded links', () => {
    const text = 'Read https://example.com/docs before shipping.';
    expect(detectClipboardType({ text }).type).toBe('plain_text');
    expect(detectContentSignals({ text }).some((signal) => signal.kind === 'url')).toBe(true);
  });

  it('detects terminal commands', () => {
    expect(detectClipboardType({ text: 'pnpm install' }).type).toBe('command');
    expect(detectClipboardType({ text: 'Run this command:\npnpm install\nthen continue.' }).type).toBe('plain_text');
    expect(detectContentSignals({ text: 'pnpm install' }).some((signal) => signal.kind === 'shell')).toBe(true);
  });

  it('normalizes common platform clipboard formats', () => {
    const mac = normalizeClipboardFormats({ rawFormats: ['public.utf8-plain-text', 'public.html', 'public.png'], platform: 'darwin' });
    expect(mac).toMatchObject({ hasText: true, hasHtml: true, hasImage: true, platform: 'darwin' });
    const windows = normalizeClipboardFormats({ rawFormats: ['CF_UNICODETEXT', 'HTML Format', 'CF_HDROP'], platform: 'win32' });
    expect(windows).toMatchObject({ hasText: true, hasHtml: true, hasFiles: true, platform: 'win32' });
    const linux = normalizeClipboardFormats({ rawFormats: ['text/plain;charset=utf-8', 'text/uri-list'], platform: 'linux' });
    expect(linux).toMatchObject({ hasText: true, hasFiles: true, platform: 'linux' });
  });
});

describe('cleanup filters', () => {
  const item: ClipboardItem = {
    id: '1',
    type: 'plain_text',
    title: 'a',
    previewText: 'a',
    contentText: 'a',
    contentHtml: null,
    contentRtf: null,
    imagePath: null,
    thumbnailPath: null,
    filePaths: [],
    formatInfo: {
      rawFormats: [],
      normalizedFormats: [],
      hasText: false,
      hasHtml: false,
      hasRtf: false,
      hasImage: false,
      hasFiles: false,
      platform: 'unknown',
    },
    contentSignals: [],
    url: null,
    codeLanguage: null,
    sourceApp: null,
    sizeBytes: 1,
    contentHash: 'hash',
    isPinned: true,
    isFavorite: false,
    isDeleted: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    lastUsedAt: null,
    deletedAt: null,
  };

  it('preserves pinned items unless explicitly included', () => {
    expect(matchesCleanupRequest(item, { mode: 'all' })).toBe(false);
    expect(matchesCleanupRequest(item, { mode: 'all', includePinned: true })).toBe(true);
  });
});

describe('radial wheel geometry', () => {
  it('maps cardinal directions to stable segment indices', () => {
    const center = { x: 100, y: 100 };
    expect(getSegmentIndex(center, { x: 100, y: 0 }, 8)).toBe(0);
    expect(getSegmentIndex(center, { x: 200, y: 100 }, 8)).toBe(2);
    expect(getSegmentIndex(center, { x: 100, y: 200 }, 8)).toBe(4);
  });
});

describe('theme resolution', () => {
  it('resolves explicit themes before system preference', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('light', true)).toBe('light');
  });

  it('resolves system theme from the device preference', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('keeps QR colors high contrast for both themes', () => {
    expect(qrColorsForTheme('dark')).toMatchObject({ dark: '#182018', light: '#f4f7ef' });
    expect(qrColorsForTheme('light')).toMatchObject({ dark: '#172018', light: '#fbfcf8' });
  });
});

describe('localization', () => {
  it('defaults language selection to system and resolves supported locales', () => {
    expect(defaultSettings.language).toBe('system');
    expect(resolveLanguage('system', 'tr-TR')).toBe('tr');
    expect(resolveLanguage('system', 'de-DE')).toBe('de');
    expect(resolveLanguage('system', 'zh-CN')).toBe('zh-Hans');
    expect(resolveLanguage('system', 'pt-PT')).toBe('pt-BR');
    expect(resolveLanguage('system', 'zz-ZZ')).toBe('en');
    expect(resolveLanguage('en', 'tr-TR')).toBe('en');
  });

  it('loads supported locales and translates app-owned labels', async () => {
    expect(languageOptions).toHaveLength(25);
    expect(supportedLanguages).toHaveLength(24);
    expect(Object.keys(languageMetadata)).toHaveLength(24);
    const tr = createTranslator(await loadLocaleMessages('tr'));
    const ar = createTranslator(await loadLocaleMessages('ar'));
    expect(tr('wheelAppearance')).toBe('Tekerlek Görünümü');
    expect(tr('quicklook')).toBe('Hızlı Önizleme');
    expect(ar('settings')).toBe('الإعدادات');
    expect(getLanguageDirection('ar')).toBe('rtl');
    expect(getLanguageDirection('fa')).toBe('rtl');
    expect(getLanguageDirection('tr')).toBe('ltr');
  });
});

describe('wheel appearance', () => {
  it('normalizes opacity values into the CSS range', () => {
    expect(normalizeOpacity(-1)).toBe(0);
    expect(normalizeOpacity(0.42)).toBe(0.42);
    expect(normalizeOpacity(2)).toBe(1);
  });

  it('converts saved wheel colors into CSS variables', () => {
    expect(wheelAppearanceStyle(defaultWheelAppearance)).toMatchObject({
      '--wheel-active': 'rgba(200, 223, 159, 0.34)',
      '--wheel-icon-bg': '#151c1f',
    });
  });

  it('uses palette colors by default and single color when requested', () => {
    expect(wheelSegmentStyle(1, 8, defaultWheelAppearance)).toMatchObject({
      '--wheel-segment-fill': 'rgba(219, 114, 24, 0.86)',
      '--wheel-segment-rotation': '45deg',
    });
    expect(wheelSegmentStyle(1, 8, { ...defaultWheelAppearance, colorMode: 'single', segmentColor: '#123456', segmentOpacity: 0.5 })).toMatchObject({
      '--wheel-segment-fill': 'rgba(18, 52, 86, 0.5)',
    });
  });

  it('applies preset palette and mono values', () => {
    const cool = wheelAppearancePresets.find((preset) => preset.id === 'cool');
    expect(cool).toBeDefined();
    const coolAppearance = applyWheelAppearancePreset(defaultWheelAppearance, cool!);
    expect(coolAppearance.colorMode).toBe('palette');
    expect(wheelSegmentStyle(1, 8, coolAppearance)).toMatchObject({
      '--wheel-segment-fill': 'rgba(28, 126, 158, 0.86)',
    });

    const mono = wheelAppearancePresets.find((preset) => preset.id === 'mono-slate');
    expect(mono).toBeDefined();
    expect(applyWheelAppearancePreset(defaultWheelAppearance, mono!).colorMode).toBe('single');
  });
});
