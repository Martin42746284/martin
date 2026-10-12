import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type Kind = 'ok' | 'error';
interface Toast {
  id: number;
  kind: Kind;
  text: string;
}

const ToastContext = createContext<(text: string, kind?: Kind) => void>(() => undefined);

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((text: string, kind: Kind = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, kind, text }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), kind === 'error' ? 7000 : 3500);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <p key={toast.id} className="toast" data-kind={toast.kind}>
            {toast.text}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
