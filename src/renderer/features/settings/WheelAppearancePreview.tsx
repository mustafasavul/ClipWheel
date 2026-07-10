import React from 'react';
import { Image, Type } from 'lucide-react';
import type { Settings } from '../../../shared/types';
import { clampWheelItemCount } from '../../../shared/wheelLimits';
import { wheelAppearanceStyle, wheelSegmentStyle } from '../../../shared/wheelAppearance';
import { formatShortcutForPlatform } from '../../../shared/shortcuts';
import { useI18n } from '../../i18n/I18nContext';

export function WheelAppearancePreview({ appearance, count, shortcuts }: { appearance: Settings['wheelAppearance']; count: Settings['wheelItemCount']; shortcuts: Settings['shortcuts'] }) {
  const { t } = useI18n();
  const previewCount = clampWheelItemCount(count);
  const segmentDeg = 360 / previewCount;
  return (
    <div className="wheel-preview-shell" style={wheelAppearanceStyle(appearance)}>
      <div className="wheel-preview-ring" style={{ '--segment-deg': `${segmentDeg}deg`, '--wheel-item-count': previewCount, '--wheel-active-rotation': '0deg' } as React.CSSProperties}>
        <div className="wheel-active-slice" />
        <div className="wheel-inner-border" />
        {Array.from({ length: previewCount }).map((_, index) => (
          <span className={`wheel-segment wheel-preview-segment ${index === 0 ? 'active' : ''}`} style={wheelSegmentStyle(index, previewCount, appearance)} key={index}>
            <span className="wheel-segment-content">
              <span className="wheel-index">{formatShortcutForPlatform(shortcuts.wheelItems[index] || String(index + 1))}</span>
              <span className="wheel-icon">{index % 3 === 0 ? <Image size={16} /> : <Type size={16} />}</span>
              <strong>{index === 0 ? t('selectedClip') : `${t('item')} ${index + 1}`}</strong>
              <small>{index === 0 ? `${t('plainText')} • ${t('now')}` : t('clipboard')}</small>
            </span>
          </span>
        ))}
        <div className="wheel-center">
          <span className="type-chip">{t('plainText')}</span>
          <strong>{t('livePreview')}</strong>
          <small className="wheel-center-meta">{t('plainText')} • {t('now')}</small>
          <div className="wheel-hints"><span><kbd>{formatShortcutForPlatform(shortcuts.selectActiveItem || 'Enter')}</kbd> {t('apply')}</span><span><kbd>{formatShortcutForPlatform(shortcuts.back || 'Escape')}</kbd> {t('back')}</span></div>
        </div>
      </div>
    </div>
  );
}
