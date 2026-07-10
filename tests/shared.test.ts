import { describe, expect, it } from 'vitest';
import { createTranslator, getLanguageDirection, languageMetadata, languageOptions, loadLocaleMessages, resolveLanguage, supportedLanguages } from '../src/shared/i18n';
import { getSegmentIndex, getSegmentRotation } from '../src/shared/radialGeometry';
import { defaultSettings } from '../src/shared/settings';
import { resolveTheme } from '../src/shared/theme';
import { applyWheelAppearancePreset, createCustomWheelAppearancePreset, defaultWheelAppearance, normalizeOpacity, wheelAppearancePresetColors, wheelAppearancePresets, wheelAppearanceStyle, wheelSegmentStyle } from '../src/shared/wheelAppearance';

describe('radial wheel geometry', () => {
  it('maps cardinal directions to stable segment indices', () => {
    const center = { x: 100, y: 100 };
    expect(getSegmentIndex(center, { x: 100, y: 0 }, 8)).toBe(0);
    expect(getSegmentIndex(center, { x: 200, y: 100 }, 8)).toBe(2);
    expect(getSegmentIndex(center, { x: 100, y: 200 }, 8)).toBe(4);
  });

  it('aligns every supported wheel item with its hover rotation', () => {
    const center = { x: 100, y: 100 };
    for (let count = 4; count <= 12; count += 1) {
      for (let index = 0; index < count; index += 1) {
        const rotation = getSegmentRotation(index, count);
        const radians = (rotation - 90) * (Math.PI / 180);
        const point = { x: center.x + Math.cos(radians) * 80, y: center.y + Math.sin(radians) * 80 };
        expect(getSegmentIndex(center, point, count)).toBe(index);
      }
    }
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
  it('starts without custom presets and snapshots custom appearance values', () => {
    expect(defaultSettings.wheelAppearancePresets).toEqual([]);
    const preset = createCustomWheelAppearancePreset('focus-lime', '  Focus Lime  ', defaultWheelAppearance);
    expect(preset.name).toBe('Focus Lime');
    expect(preset.appearance).not.toBe(defaultWheelAppearance);
    expect(preset.appearance.paletteColors).not.toBe(defaultWheelAppearance.paletteColors);
    expect(wheelAppearancePresetColors(preset.appearance)).toEqual([defaultWheelAppearance.segmentColor]);
  });

  it('normalizes opacity values into the CSS range', () => {
    expect(normalizeOpacity(-1)).toBe(0);
    expect(normalizeOpacity(0.42)).toBe(0.42);
    expect(normalizeOpacity(2)).toBe(1);
  });

  it('converts saved wheel colors into CSS variables', () => {
    expect(wheelAppearanceStyle(defaultWheelAppearance)).toMatchObject({
      '--wheel-ring-line': 'rgba(44, 55, 64, 0.2)',
      '--wheel-active': 'rgba(142, 180, 90, 0.38)',
      '--wheel-active-line': 'rgba(184, 239, 122, 0.88)',
      '--wheel-label': '#e8edf0',
      '--wheel-panel': 'rgba(9, 17, 22, 0.96)',
      '--wheel-panel-solid': '#091116',
      '--wheel-chip-text': '#091116',
      '--wheel-icon-bg': '#151e24',
    });
  });

  it('uses mono color by default and palette colors when requested', () => {
    expect(defaultWheelAppearance.colorMode).toBe('single');
    expect(wheelSegmentStyle(1, 8, defaultWheelAppearance)).toMatchObject({
      '--wheel-segment-fill': 'rgba(28, 37, 44, 0.94)',
      '--wheel-segment-rotation': '45deg',
    });
    expect(wheelSegmentStyle(1, 8, { ...defaultWheelAppearance, colorMode: 'palette', paletteColors: ['#123456', '#abcdef'], segmentOpacity: 0.5 })).toMatchObject({
      '--wheel-segment-fill': 'rgba(171, 205, 239, 0.5)',
    });
  });

  it('applies preset palette and mono values', () => {
    expect(wheelAppearancePresets).toHaveLength(13);
    expect(wheelAppearancePresets[0]).toMatchObject({ id: 'mono-slate', values: { colorMode: 'single' } });
    expect(wheelAppearancePresets[0]?.id).not.toBe('rainbow');

    const cool = wheelAppearancePresets.find((preset) => preset.id === 'cool');
    expect(cool).toBeDefined();
    const coolAppearance = applyWheelAppearancePreset(defaultWheelAppearance, cool!);
    expect(coolAppearance.colorMode).toBe('palette');
    expect(wheelSegmentStyle(1, 8, coolAppearance)).toMatchObject({
      '--wheel-segment-fill': 'rgba(28, 126, 158, 0.94)',
    });

    const mono = wheelAppearancePresets.find((preset) => preset.id === 'mono-slate');
    expect(mono).toBeDefined();
    expect(applyWheelAppearancePreset(defaultWheelAppearance, mono!).colorMode).toBe('single');
  });

  it('keeps new color presets usable for wheel segments and preview swatches', () => {
    const aurora = wheelAppearancePresets.find((preset) => preset.id === 'aurora');
    const monoRose = wheelAppearancePresets.find((preset) => preset.id === 'mono-rose');
    const monoInk = wheelAppearancePresets.find((preset) => preset.id === 'mono-ink');
    const monoPaper = wheelAppearancePresets.find((preset) => preset.id === 'mono-paper');
    expect(aurora).toBeDefined();
    expect(monoRose).toBeDefined();
    expect(monoInk).toBeDefined();
    expect(monoPaper).toBeDefined();
    expect(aurora!.colors).toHaveLength(8);
    expect(monoRose!.colors).toEqual(['#fb7185']);
    expect(monoInk!.values.labelColor).toBe('#f8fafc');
    expect(monoPaper!.values.labelColor).toBe('#111827');

    const auroraAppearance = applyWheelAppearancePreset(defaultWheelAppearance, aurora!);
    expect(auroraAppearance.paletteColors).toEqual(aurora!.colors);
    expect(wheelSegmentStyle(3, 8, auroraAppearance)).toMatchObject({
      '--wheel-segment-fill': 'rgba(192, 132, 252, 0.94)',
    });

    const roseAppearance = applyWheelAppearancePreset(defaultWheelAppearance, monoRose!);
    expect(roseAppearance.paletteColors).toEqual(defaultWheelAppearance.paletteColors);
    expect(wheelSegmentStyle(3, 8, roseAppearance)).toMatchObject({
      '--wheel-segment-fill': 'rgba(251, 113, 133, 0.94)',
    });
  });
});
