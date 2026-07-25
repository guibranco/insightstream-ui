import React from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, X, RotateCcw } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-2 pointer-events-none"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border text-sm transition-all duration-300 animate-slide-up ${
              isSuccess
                ? 'bg-slate-900 text-white border-slate-800 dark:bg-slate-800 dark:border-slate-700'
                : isError
                ? 'bg-rose-950 text-rose-100 border-rose-800'
                : 'bg-slate-800 text-slate-100 border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3 pr-2 min-w-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-brand-lime shrink-0" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-purple-400 shrink-0" />}
              <span className="font-medium truncate leading-snug">{toast.message}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {toast.actionLabel && toast.onAction && (
                <button
                  onClick={() => {
                    toast.onAction?.();
                    dismissToast(toast.id);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-purple hover:bg-brand-purple-dark text-white flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-purple"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {toast.actionLabel}
                </button>
              )}
              <button
                onClick={() => dismissToast(toast.id)}
                aria-label="Close notification"
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
