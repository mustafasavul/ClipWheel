import type { CSSProperties } from 'react';
import type { WheelAppearanceSettings } from './types';

export interface WheelAppearancePreset {
  id: string;
  label: string;
  colors: string[];
  values: Pick<WheelAppearanceSettings, 'colorMode' | 'paletteColors' | 'segmentColor' | 'activeColor' | 'activeLineColor' | 'ringLineColor' | 'panelColor' | 'iconBackgroundColor' | 'labelColor'>;
}

export const wheelPalette = [
  '#b22f2b',
  '#db7218',
  '#d6ad14',
  '#3f963f',
  '#0b8977',
  '#2569b8',
  '#554192',
  '#8b3fa1',
] as const;

export const defaultWheelAppearance: WheelAppearanceSettings = {
  colorMode: 'palette',
  paletteColors: [...wheelPalette],
  segmentColor: '#1f2a1d',
  segmentOpacity: 0.86,
  activeColor: '#c8df9f',
  activeOpacity: 0.34,
  activeLineColor: '#d8ecb8',
  ringLineColor: '#20272a',
  panelColor: '#11171a',
  panelOpacity: 0.94,
  iconBackgroundColor: '#151c1f',
  labelColor: '#eef4e9',
};

export const wheelAppearancePresets: WheelAppearancePreset[] = [
  createPreset('rainbow', 'Rainbow', [...wheelPalette], {
    colorMode: 'palette',
    segmentColor: '#1f2a1d',
    activeColor: '#c8df9f',
    activeLineColor: '#d8ecb8',
    ringLineColor: '#20272a',
    panelColor: '#11171a',
    iconBackgroundColor: '#151c1f',
    labelColor: '#eef4e9',
  }),
  createPreset('warm', 'Warm', ['#a92929', '#d95c20', '#e08824', '#d2a414', '#bf7a22', '#984429', '#7d2d35', '#b35045'], {
    colorMode: 'palette',
    segmentColor: '#9a3a20',
    activeColor: '#ffd08a',
    activeLineColor: '#ffe2a8',
    ringLineColor: '#261914',
    panelColor: '#15100d',
    iconBackgroundColor: '#211511',
    labelColor: '#fff4e4',
  }),
  createPreset('cool', 'Cool', ['#235d9f', '#1c7e9e', '#15918b', '#2b9b6b', '#4d86c7', '#3f5bb2', '#5b4bad', '#227c92'], {
    colorMode: 'palette',
    segmentColor: '#1f667d',
    activeColor: '#9ee7ff',
    activeLineColor: '#c5f1ff',
    ringLineColor: '#15222a',
    panelColor: '#0f171d',
    iconBackgroundColor: '#14222a',
    labelColor: '#eefaff',
  }),
  createPreset('forest', 'Forest', ['#456b2f', '#5f7f2f', '#7a8b32', '#3f7c4a', '#2f7d64', '#36715d', '#566b3a', '#6b6e32'], {
    colorMode: 'palette',
    segmentColor: '#456b2f',
    activeColor: '#c8df9f',
    activeLineColor: '#d8ecb8',
    ringLineColor: '#1e2718',
    panelColor: '#11170f',
    iconBackgroundColor: '#182112',
    labelColor: '#f0f7e6',
  }),
  createPreset('mono-lime', 'Mono Lime', ['#c8df9f'], {
    colorMode: 'single',
    segmentColor: '#c8df9f',
    activeColor: '#e1f4bf',
    activeLineColor: '#eefbd5',
    ringLineColor: '#26321f',
    panelColor: '#11170f',
    iconBackgroundColor: '#182112',
    labelColor: '#172114',
  }),
  createPreset('mono-slate', 'Mono Slate', ['#6f7d89'], {
    colorMode: 'single',
    segmentColor: '#6f7d89',
    activeColor: '#c3d0dc',
    activeLineColor: '#dce7f0',
    ringLineColor: '#20272d',
    panelColor: '#101519',
    iconBackgroundColor: '#182027',
    labelColor: '#f1f6fb',
  }),
];

export function applyWheelAppearancePreset(appearance: WheelAppearanceSettings, preset: WheelAppearancePreset): WheelAppearanceSettings {
  return {
    ...appearance,
    ...preset.values,
  };
}

export function wheelAppearanceStyle(appearance: WheelAppearanceSettings): CSSProperties {
  return {
    '--wheel-ring-line': hexToRgba(appearance.ringLineColor, 0.2),
    '--wheel-active': hexToRgba(appearance.activeColor, appearance.activeOpacity),
    '--wheel-active-line': hexToRgba(appearance.activeLineColor, 0.88),
    '--wheel-label': appearance.labelColor,
    '--wheel-panel': hexToRgba(appearance.panelColor, appearance.panelOpacity),
    '--wheel-icon-bg': appearance.iconBackgroundColor,
  } as CSSProperties;
}

export function wheelSegmentStyle(index: number, count: number, appearance: WheelAppearanceSettings): CSSProperties {
  const segmentDeg = 360 / count;
  const rotation = index * segmentDeg;
  const halfWidth = Math.min(29, Math.max(13, 168 / count));
  const palette = appearance.paletteColors.length > 0 ? appearance.paletteColors : wheelPalette;
  const color = appearance.colorMode === 'palette' ? palette[index % palette.length] : appearance.segmentColor;
  return {
    '--wheel-segment-rotation': `${rotation}deg`,
    '--wheel-segment-content-rotation': `${-rotation}deg`,
    '--wheel-slice-left': `${50 - halfWidth}%`,
    '--wheel-slice-right': `${50 + halfWidth}%`,
    '--wheel-segment-fill': hexToRgba(color, appearance.segmentOpacity),
  } as CSSProperties;
}

export function normalizeOpacity(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function createPreset(
  id: string,
  label: string,
  colors: string[],
  values: Omit<WheelAppearancePreset['values'], 'paletteColors'>,
): WheelAppearancePreset {
  return {
    id,
    label,
    colors,
    values: {
      ...values,
      paletteColors: values.colorMode === 'palette' ? colors : [...wheelPalette],
    },
  };
}

function hexToRgba(hex: string, opacity: number): string {
  const normalized = hex.trim().replace(/^#/, '');
  const expanded = normalized.length === 3
    ? normalized.split('').map((part) => `${part}${part}`).join('')
    : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return `rgba(0, 0, 0, ${normalizeOpacity(opacity)})`;
  }
  const value = Number.parseInt(expanded, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${normalizeOpacity(opacity)})`;
}
