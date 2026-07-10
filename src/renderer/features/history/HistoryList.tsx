import React from 'react';
import { Clipboard, Command, Copy, Heart, Trash2, X } from 'lucide-react';
import type { ClipboardItem } from '../../../shared/types';
import { useItemMutations } from '../../data/clipwheelQueries';
import { useI18n } from '../../i18n/I18nContext';
import { ClipboardTypeIcon } from '../../ui/ClipboardTypeIcon';
import { IconButton } from '../../ui/IconButton';

export function HistoryList({
  items,
  selectedId,
  wheelItemIds,
  onSelect,
  onRefresh,
  onToggleWheelItem,
}: {
  items: ClipboardItem[];
  selectedId: string | null;
  wheelItemIds: string[];
  onSelect: (id: string) => void;
  onRefresh: () => Promise<void>;
  onToggleWheelItem: (id: string) => Promise<void>;
}) {
  const { t } = useI18n();
  const mutations = useItemMutations();
  const isWheelFull = wheelItemIds.every(Boolean);
  if (!items.length) {
    return (
      <div className="empty-state">
        <Clipboard size={38} />
        <h2>{t('noClipboardItems')}</h2>
        <p>{t('noClipboardItemsDescription')}</p>
      </div>
    );
  }
  return (
    <div className="history-list">
      {items.map((item, index) => {
        const wheelSlot = wheelItemIds.indexOf(item.id);
        const isInWheel = wheelSlot >= 0;
        const wheelButtonDisabled = !isInWheel && isWheelFull;
        return (
          <div className={`history-row ${item.id === selectedId ? 'selected' : ''} ${isInWheel ? 'in-wheel' : ''}`} key={item.id} style={{ '--index': index } as React.CSSProperties}>
            <button type="button" className="history-select" onClick={() => onSelect(item.id)}>
              <span className="type-icon"><ClipboardTypeIcon type={item.type} /></span>
              <span className="row-content">
                <span className="row-title-line">
                  <strong>{item.title}</strong>
                  {isInWheel && <span className="wheel-slot-badge">{t('wheel')} {wheelSlot + 1}</span>}
                </span>
                <small>{item.previewText}</small>
              </span>
            </button>
            <span className="row-actions" onClick={(event) => event.stopPropagation()}>
              <IconButton
                label={isInWheel ? `${t('wheel')} ${wheelSlot + 1}` : t('wheel')}
                disabled={wheelButtonDisabled}
                onClick={() => onToggleWheelItem(item.id)}
              >
                {isInWheel ? <X size={16} /> : <Command size={16} />}
              </IconButton>
              <IconButton label={t('copy')} onClick={async () => { await mutations.copy.mutateAsync(item.id); await onRefresh(); }}><Copy size={16} /></IconButton>
              <IconButton label={item.isFavorite ? t('unfavorite') : t('favorite')} onClick={async () => { await mutations.toggleFavorite.mutateAsync(item.id); await onRefresh(); }}><Heart size={16} fill={item.isFavorite ? 'currentColor' : 'none'} /></IconButton>
              <IconButton label={t('delete')} onClick={async () => { if (isInWheel) await onToggleWheelItem(item.id); await mutations.remove.mutateAsync(item.id); await onRefresh(); }}><Trash2 size={16} /></IconButton>
            </span>
          </div>
        );
      })}
    </div>
  );
}
