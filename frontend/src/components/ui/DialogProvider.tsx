import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

interface ConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface AlertOptions {
  title?: string;
  confirmText?: string;
}

interface DialogContextValue {
  confirm: (message: string, opts?: ConfirmOptions) => Promise<boolean>;
  alert: (message: string, opts?: AlertOptions) => Promise<void>;
}

interface DialogState {
  type: 'confirm' | 'alert';
  message: string;
  opts: ConfirmOptions;
  resolve: (value: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const confirm = useCallback(
    (message: string, opts: ConfirmOptions = {}) =>
      new Promise<boolean>((resolve) => {
        setDialog({ type: 'confirm', message, opts, resolve });
      }),
    []
  );

  const alert = useCallback(
    (message: string, opts: AlertOptions = {}) =>
      new Promise<void>((resolve) => {
        setDialog({ type: 'alert', message, opts, resolve: () => resolve() });
      }),
    []
  );

  const close = (result: boolean) => {
    if (!dialog) return;
    dialog.resolve(result);
    setDialog(null);
  };

  // ESC = 취소, Enter = 확인.
  useEffect(() => {
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
      else if (e.key === 'Enter') close(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog]);

  const opts = dialog?.opts ?? {};

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      {dialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={() => close(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {opts.title && (
              <h3 className="mb-2 text-base font-semibold text-gray-800">{opts.title}</h3>
            )}
            <p className="mb-5 whitespace-pre-wrap text-sm text-gray-700">{dialog.message}</p>
            <div className="flex justify-end gap-2">
              {dialog.type === 'confirm' && (
                <button
                  type="button"
                  onClick={() => close(false)}
                  className="rounded border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {opts.cancelText || '취소'}
                </button>
              )}
              <button
                type="button"
                autoFocus
                onClick={() => close(true)}
                className={`rounded px-4 py-2 text-sm font-medium text-white ${
                  opts.danger
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {opts.confirmText || '확인'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('useDialog must be used within DialogProvider');
  }
  return ctx;
}
