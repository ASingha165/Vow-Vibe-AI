"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (options: { type?: "success" | "error" | "info"; title: string; message?: string }) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback(
    ({ type = "success", title, message }: { type?: "success" | "error" | "info"; title: string; message?: string }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />,
            error: <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />,
            info: <Info className="h-5 w-5 text-[#3B1242] shrink-0 mt-0.5" />,
          };

          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-start space-x-3 rounded-xl border border-[#E5D5B5] bg-white p-4 shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-3"
              )}
            >
              {icons[t.type]}
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#22092C]">{t.title}</p>
                {t.message && <p className="mt-0.5 text-xs text-[#5E4B66]">{t.message}</p>}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-[#A18F9F] hover:text-[#22092C] transition-colors p-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

const fallbackToastContext: ToastContextType = {
  toast: ({ title, message }: { type?: "success" | "error" | "info"; title: string; message?: string }) => {
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
      console.log(`[Toast] ${title}: ${message || ""}`);
    }
  },
};

export function useToast(): ToastContextType {
  const context = React.useContext(ToastContext);
  return context || fallbackToastContext;
}
