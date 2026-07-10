import { useEffect, useRef } from 'react';
import { useI18n } from '../i18n/I18nContext';

export function ConfirmDialog({ body, cancelLabel, confirmLabel, onCancel, onConfirm, title }: {
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}) {
  const { t } = useI18n();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);
  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby="confirm-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <div>
        <p className="eyebrow">{t('cleanupWarning')}</p>
        <h2 id="confirm-dialog-title">{title}</h2>
        <p>{body}</p>
      </div>
      <div className="confirm-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>{cancelLabel}</button>
        <button type="button" className="danger-button" onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </dialog>
  );
}

