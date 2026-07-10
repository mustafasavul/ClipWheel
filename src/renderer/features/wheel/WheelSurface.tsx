import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Clipboard } from 'lucide-react';
import { defaultSettings } from '../../../shared/settings';
import { resolveLanguage } from '../../../shared/i18n';
import { getSegmentIndex } from '../../../shared/radialGeometry';
import { wheelAppearanceStyle, wheelSegmentStyle } from '../../../shared/wheelAppearance';
import { clampWheelItemCount } from '../../../shared/wheelLimits';
import { formatShortcutForPlatform, isShiftEvent, matchesShortcut } from '../../../shared/shortcuts';
import { useClipwheelEvents, useDesktopActions, useItemMutations, useSettingsQuery, useWheelItemsQuery } from '../../data/clipwheelQueries';
import { useApplyLanguage, useApplyTheme, useResolvedTheme } from '../../app/documentPreferences';
import { I18nContext, useLocale } from '../../i18n/I18nContext';
import { labelForType, wheelSegmentMeta } from '../../presentation/formatters';
import { ClipboardTypeIcon } from '../../ui/ClipboardTypeIcon';
import { WheelQuickLook } from './WheelQuickLook';

export function WheelSurface() {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const isShiftPressedRef = useRef(false);
  const mutations = useItemMutations();
  const desktop = useDesktopActions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isQuickLookVisible, setQuickLookVisible] = useState(false);
  const settingsQuery = useSettingsQuery();
  const settings = settingsQuery.data ?? defaultSettings;
  const count = clampWheelItemCount(settings.wheelItemCount);
  const wheelItemsQuery = useWheelItemsQuery(count);
  const items = wheelItemsQuery.data ?? [];
  const wheelItems = items.slice(0, count);
  const activeItem = wheelItems[activeIndex] ?? null;
  const segmentDeg = 360 / count;
  const activeAngle = activeIndex * segmentDeg - 90;
  const quickLookSide = Math.cos((activeAngle * Math.PI) / 180) >= 0 ? 'left' : 'right';
  const resolvedTheme = useResolvedTheme(settings.theme);
  const language = resolveLanguage(settings.language);
  const i18n = useLocale(language);
  const { t } = i18n;

  useApplyTheme(resolvedTheme);
  useApplyLanguage(i18n.language, i18n.direction);

  useEffect(() => {
    document.documentElement.classList.add('wheel-html');
    document.body.classList.add('wheel-body');
    return () => {
      document.documentElement.classList.remove('wheel-html');
      document.body.classList.remove('wheel-body');
    };
  }, []);

  const refresh = useCallback(async () => {
    const [, result] = await Promise.all([settingsQuery.refetch(), wheelItemsQuery.refetch()]);
    setActiveIndex((current) => Math.min(current, Math.max(0, (result.data?.length ?? 0) - 1)));
  }, [settingsQuery, wheelItemsQuery]);
  const onWheelOpened = useCallback(() => {
    void refresh();
    window.setTimeout(() => overlayRef.current?.focus(), 0);
  }, [refresh]);
  useClipwheelEvents({ onClipboardItem: refresh, onWheelOpened });

  useEffect(() => {
    overlayRef.current?.focus();
    const visibilityHandler = () => {
      if (!document.hidden) void refresh();
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', visibilityHandler);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
  }, [refresh]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (isShiftEvent(event)) {
        isShiftPressedRef.current = true;
        setQuickLookVisible(true);
      }
      if (matchesShortcut(event, settings.shortcuts.back)) {
        event.preventDefault();
        void desktop.closeWheel();
        return;
      }
      if (activeItem && matchesShortcut(event, settings.shortcuts.selectActiveItem)) {
        event.preventDefault();
        void mutations.copy.mutateAsync(activeItem.id);
        return;
      }
      const itemIndex = settings.shortcuts.wheelItems
        .slice(0, count)
        .findIndex((shortcut) => matchesShortcut(event, shortcut));
      if (itemIndex >= 0 && wheelItems[itemIndex]) {
        event.preventDefault();
        void mutations.copy.mutateAsync(wheelItems[itemIndex].id);
      }
    };
    const upHandler = (event: KeyboardEvent) => {
      if (isShiftEvent(event)) {
        isShiftPressedRef.current = false;
        setQuickLookVisible(false);
      }
    };
    const blurHandler = () => {
      isShiftPressedRef.current = false;
      setQuickLookVisible(false);
    };
    window.addEventListener('keydown', handler);
    window.addEventListener('keyup', upHandler);
    window.addEventListener('blur', blurHandler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('keyup', upHandler);
      window.removeEventListener('blur', blurHandler);
    };
  }, [activeItem, count, desktop, mutations.copy, settings.shortcuts, wheelItems]);

  return (
    <div
      ref={overlayRef}
      className="wheel-overlay"
      style={wheelAppearanceStyle(settings.wheelAppearance)}
      role="application"
      aria-label={t('wheelAria')}
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === 'Shift' || event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
          isShiftPressedRef.current = true;
          setQuickLookVisible(true);
        }
      }}
      onKeyUp={(event) => {
        if (event.key === 'Shift' || event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
          isShiftPressedRef.current = false;
          setQuickLookVisible(false);
        }
      }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setActiveIndex(getSegmentIndex({ x: rect.width / 2, y: rect.height / 2 }, { x: event.clientX - rect.left, y: event.clientY - rect.top }, count));
        setQuickLookVisible(event.shiftKey || event.getModifierState('Shift') || isShiftPressedRef.current);
      }}
      onMouseLeave={() => {
        if (!isShiftPressedRef.current) setQuickLookVisible(false);
      }}
    >
      <div className="wheel-ring" style={{ '--segment-deg': `${segmentDeg}deg`, '--wheel-item-count': count } as React.CSSProperties}>
        <div className="wheel-active-slice" style={{ transform: `rotate(${activeIndex * segmentDeg}deg)` }} />
        <div className="wheel-inner-border" />
        {Array.from({ length: count }).map((_, index) => {
          const item = wheelItems[index];
          return (
            <button
              type="button"
              key={index}
              className={`wheel-segment ${index === activeIndex ? 'active' : ''}`}
              style={wheelSegmentStyle(index, count, settings.wheelAppearance)}
              onClick={() => item && void mutations.copy.mutateAsync(item.id)}
            >
              <span className="wheel-segment-content">
                <span className="wheel-index">{index + 1}</span>
                <span className="wheel-icon">{item ? <ClipboardTypeIcon type={item.type} /> : <Clipboard size={22} />}</span>
                <strong>{item ? item.title : t('empty')}</strong>
                <small>{item ? wheelSegmentMeta(item, i18n) : t('noItem')}</small>
              </span>
            </button>
          );
        })}
        <div className="wheel-center">
          {activeItem ? (
            <>
              <span className="type-chip">{labelForType(activeItem.type, t)}</span>
              <strong>{activeItem.title}</strong>
              <small className="wheel-center-meta">{wheelSegmentMeta(activeItem, i18n)}</small>
              <div className="wheel-hints"><span><kbd>{formatShortcutForPlatform(settings.shortcuts.selectActiveItem || 'Enter')}</kbd> {t('apply')}</span><span><kbd>{formatShortcutForPlatform(settings.shortcuts.back || 'Escape')}</kbd> {t('back')}</span><span><kbd>Shift</kbd> {t('quicklook')}</span></div>
            </>
          ) : (
            <>
              <Clipboard size={30} />
              <strong>{t('noCaptures')}</strong>
              <div className="wheel-hints"><span><kbd>{formatShortcutForPlatform(settings.shortcuts.back || 'Escape')}</kbd> {t('back')}</span></div>
            </>
          )}
        </div>
        {activeItem && isQuickLookVisible && (
          <I18nContext.Provider value={i18n}>
            <WheelQuickLook item={activeItem} side={quickLookSide} />
          </I18nContext.Provider>
        )}
      </div>
    </div>
  );
}
