import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showSuccess = useCallback((msg) => addToast(msg, "success"), [addToast]);
  const showError = useCallback((msg) => addToast(msg, "error"), [addToast]);
  const showInfo = useCallback((msg) => addToast(msg, "info"), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, showSuccess, showError, showInfo }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === "success" && <CheckCircle2 size={18} className="toast-icon" />}
            {toast.type === "error" && <AlertCircle size={18} className="toast-icon" />}
            {toast.type === "info" && <Info size={18} className="toast-icon" />}
            <span className="toast-message">{toast.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(toast.id)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
