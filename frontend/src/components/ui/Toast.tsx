import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type ToastTone = "success" | "error" | "info";
interface ToastItem {
  id: number;
  tone: ToastTone;
  message: ReactNode;
}

const ToastContext = createContext<(tone: ToastTone, message: ReactNode) => void>(() => {});
const ICONS = { success: CheckCircle2, error: XCircle, info: Info };
let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  const push = useCallback((tone: ToastTone, message: ReactNode) => {
    const id = nextId++;
    setToasts((t) => [...t.slice(-3), { id, tone, message }]);
    setTimeout(() => dismiss(id), tone === "error" ? 8000 : 4000);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toasts" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => {
          const Icon = ICONS[t.tone];
          return (
            <div key={t.id} className={`toast toast--${t.tone}`} role={t.tone === "error" ? "alert" : "status"}>
              <Icon aria-hidden />
              <div style={{ flex: 1 }}>{t.message}</div>
              <button className="btn btn--ghost btn--sm" style={{ minHeight: 24, padding: 2 }} aria-label="Dismiss notification" onClick={() => dismiss(t.id)}>
                <X size={14} aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
