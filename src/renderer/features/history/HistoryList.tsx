import React, { useState } from 'react';
import { Check, Clipboard, Command, Copy, Flag, Heart, Pencil, Trash2, Undo2, X } from 'lucide-react';
import { clipboardFlagColors, type ClipboardFlagColor, type ClipboardItem } from '../../../shared/types';
import { useItemMutations } from '../../data/clipwheelQueries';
import { useI18n } from '../../i18n/I18nContext';
import { labelForFlag } from '../../presentation/formatters';
import { ClipboardTypeIcon } from '../../ui/ClipboardTypeIcon';
import { IconButton } from '../../ui/IconButton';

export function HistoryList({
  items,
  selectedId,
  wheelItemIds,
  wheelSlotTitles = [],
  isTrash = false,
  onSelect,
  onRefresh,
  onToggleWheelItem,
}: {
  items: ClipboardItem[];
  selectedId: string | null;
  wheelItemIds: string[];
  wheelSlotTitles?: Array<string | null>;
  isTrash?: boolean;
  onSelect: (id: string) => void;
  onRefresh: () => Promise<void>;
  onToggleWheelItem: (id: string, targetSlot?: number) => Promise<void>;
}) {
  const { t } = useI18n();
  const mutations = useItemMutations();
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState('');
  const [flagPickerId, setFlagPickerId] = useState<string | null>(null);
  const [slotPickerId, setSlotPickerId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);
  const isWheelFull = wheelItemIds.every(Boolean);

  const startTitleEdit = (item: ClipboardItem) => {
    onSelect(item.id);
    setFlagPickerId(null);
    setRowError(null);
    setEditingTitleId(item.id);
    setTitleDraft(item.title);
  };

  const saveTitle = async (item: ClipboardItem) => {
    const title = titleDraft.trim();
    if (!title) {
      setRowError({ id: item.id, message: t('itemNameRequired') });
      return;
    }
    try {
      await mutations.updateTitle.mutateAsync({ id: item.id, title });
      setEditingTitleId(null);
      setRowError(null);
      await onRefresh();
    } catch (error) {
      setRowError({ id: item.id, message: error instanceof Error ? error.message : String(error) });
    }
  };

  const setFlag = async (item: ClipboardItem, flag: ClipboardFlagColor | null) => {
    try {
      await mutations.setFlag.mutateAsync({ id: item.id, flag });
      setFlagPickerId(null);
      setRowError(null);
      await onRefresh();
    } catch (error) {
      setRowError({ id: item.id, message: error instanceof Error ? error.message : String(error) });
    }
  };
  if (!items.length) {
    return (
      <div className="empty-state">
        {isTrash ? <Trash2 size={38} /> : <Clipboard size={38} />}
        <h2>{isTrash ? t('trashEmpty') : t('noClipboardItems')}</h2>
        <p>{isTrash ? t('trashEmptyDescription') : t('noClipboardItemsDescription')}</p>
      </div>
    );
  }
  return (
    <div className="history-list">
      {items.map((item, index) => {
        const wheelSlot = wheelItemIds.indexOf(item.id);
        const isInWheel = wheelSlot >= 0;
        return (
          <div className={`history-row ${item.id === selectedId ? 'selected' : ''} ${isInWheel ? 'in-wheel' : ''} ${flagPickerId === item.id || slotPickerId === item.id ? 'flag-editing' : ''} ${item.isDeleted ? 'trashed' : ''}`} key={item.id} style={{ '--index': index } as React.CSSProperties}>
            {editingTitleId === item.id ? (
            <div className="history-select inline-editing">
              <span className="type-icon"><ClipboardTypeIcon type={item.type} /></span>
              <span className="row-content">
                <form className="inline-title-editor" onSubmit={(event) => { event.preventDefault(); void saveTitle(item); }}>
                  <input
                    id={`title-${item.id}`}
                    aria-label={t('itemName')}
                    autoFocus
                    maxLength={120}
                    value={titleDraft}
                    onChange={(event) => setTitleDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') {
                        event.preventDefault();
                        setEditingTitleId(null);
                        setRowError(null);
                      }
                    }}
                  />
                  <button type="submit" aria-label={t('save')}><Check size={15} /></button>
                  <button type="button" aria-label={t('cancel')} onClick={() => { setEditingTitleId(null); setRowError(null); }}><X size={15} /></button>
                </form>
                <span className="row-subline">
                  <small>{item.previewText}</small>
                </span>
              </span>
            </div>
            ) : (
            <button type="button" className="history-select" onClick={() => onSelect(item.id)}>
              <span className="type-icon"><ClipboardTypeIcon type={item.type} /></span>
              <span className="row-content">
                <span className="row-title-line">
                  <strong>{item.title}</strong>
                  {item.priorityFlag && <span className="priority-flag-indicator" data-flag={item.priorityFlag} title={labelForFlag(item.priorityFlag, t)}><Flag size={13} fill="currentColor" /></span>}
                  {isInWheel && <span className="wheel-slot-badge">{t('wheel')} {wheelSlot + 1}</span>}
                </span>
                <span className="row-subline"><small>{item.previewText}</small></span>
              </span>
            </button>
            )}
            <span className="row-actions" onClick={(event) => event.stopPropagation()}>
              {item.isDeleted ? (
              <>
                <IconButton label={t('restore')} onClick={async () => { await mutations.restore.mutateAsync(item.id); await onRefresh(); }}><Undo2 size={16} /></IconButton>
                <IconButton label={t('deleteForever')} onClick={async () => { if (!window.confirm(t('deleteForeverConfirm'))) return; await mutations.purge.mutateAsync(item.id); await onRefresh(); }}><Trash2 size={16} /></IconButton>
              </>
              ) : (
              <>
              <span className="flag-action" data-flag={item.priorityFlag ?? 'none'}>
                <IconButton label={item.priorityFlag ? labelForFlag(item.priorityFlag, t) : t('flag')} onClick={() => { onSelect(item.id); setEditingTitleId(null); setRowError(null); setSlotPickerId(null); setFlagPickerId((current) => current === item.id ? null : item.id); }}><Flag size={16} fill={item.priorityFlag ? 'currentColor' : 'none'} /></IconButton>
                {flagPickerId === item.id && (
                  <span className="flag-popover" role="menu" aria-label={t('flag')}>
                    <button type="button" role="menuitemradio" aria-checked={item.priorityFlag === null} className={`flag-choice no-flag ${item.priorityFlag === null ? 'active' : ''}`} aria-label={t('noFlag')} title={t('noFlag')} onClick={() => void setFlag(item, null)}><X size={14} /></button>
                    {clipboardFlagColors.map((flag) => (
                      <button
                        type="button"
                        role="menuitemradio"
                        aria-checked={item.priorityFlag === flag}
                        className={`flag-choice ${item.priorityFlag === flag ? 'active' : ''}`}
                        data-flag={flag}
                        aria-label={labelForFlag(flag, t)}
                        title={labelForFlag(flag, t)}
                        key={flag}
                        onClick={() => void setFlag(item, flag)}
                      ><Flag size={15} fill="currentColor" /></button>
                    ))}
                  </span>
                )}
              </span>
              <IconButton label={t('editItem')} onClick={() => startTitleEdit(item)}><Pencil size={16} /></IconButton>
              <span className="slot-action">
                <IconButton
                  label={isInWheel ? `${t('wheel')} ${wheelSlot + 1}` : t('wheel')}
                  onClick={() => {
                    if (isInWheel || !isWheelFull) {
                      void onToggleWheelItem(item.id);
                      return;
                    }
                    setFlagPickerId(null);
                    setSlotPickerId((current) => current === item.id ? null : item.id);
                  }}
                >
                  {isInWheel ? <X size={16} /> : <Command size={16} />}
                </IconButton>
                {slotPickerId === item.id && (
                  <span className="flag-popover slot-popover" role="menu" aria-label={t('replaceWheelSlot')}>
                    <small>{t('replaceWheelSlot')}</small>
                    {wheelItemIds.map((_, slot) => (
                      <button
                        type="button"
                        role="menuitem"
                        className="slot-choice"
                        key={slot}
                        onClick={async () => { setSlotPickerId(null); await onToggleWheelItem(item.id, slot); await onRefresh(); }}
                      >
                        <span className="slot-index">{slot + 1}</span>
                        <span className="slot-title">{wheelSlotTitles[slot] ?? t('empty')}</span>
                      </button>
                    ))}
                  </span>
                )}
              </span>
              <IconButton label={t('copy')} onClick={async () => { await mutations.copy.mutateAsync(item.id); await onRefresh(); }}><Copy size={16} /></IconButton>
              <IconButton label={item.isFavorite ? t('unfavorite') : t('favorite')} onClick={async () => { await mutations.toggleFavorite.mutateAsync(item.id); await onRefresh(); }}><Heart size={16} fill={item.isFavorite ? 'currentColor' : 'none'} /></IconButton>
              <IconButton label={t('delete')} onClick={async () => { if (isInWheel) await onToggleWheelItem(item.id); await mutations.remove.mutateAsync(item.id); await onRefresh(); }}><Trash2 size={16} /></IconButton>
              </>
              )}
            </span>
            {rowError?.id === item.id && <p className="row-inline-error" role="alert">{rowError.message}</p>}
          </div>
        );
      })}
    </div>
  );
}
