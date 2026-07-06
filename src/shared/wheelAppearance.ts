import type { CSSProperties } from 'react';
import type { WheelAppearanceSettings } from './types';

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
  const color = appearance.colorMode === 'palette' ? wheelPalette[index % wheelPalette.length] : appearance.segmentColor;
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
