"use client";

import * as React from "react";
import { AlertTriangle, RotateCcw, ArrowLeft, Sparkles } from "lucide-react";
import { StorageService } from "@/services/storageService";

export default function DashboardErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Dashboard caught unhandled runtime exception:", error);
  }, [error]);

  const handleResetToDemo = () => {
    try {
      StorageService.resetDemoEvent();
      window.location.reload();
    } catch {
      window.location.href = "/plan";
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 sm:p-6 text-on-surface">
      <div className="max-w-md w-full bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-lg border border-primary-container/10 flex flex-col items-center text-center space-y-4 animate-in fade-in-50">
        <div className="w-12 h-12 rounded-xl bg-error-container/20 text-error flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-error" />
        </div>

        <div className="space-y-1.5">
          <h2 className="font-headline-sm text-xl text-primary font-bold">
            Dashboard View Recovery
          </h2>
          <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
            We encountered a temporary rendering issue while displaying this event blueprint. Your saved data is protected.
          </p>
        </div>

        {error?.message && (
          <div className="w-full p-2.5 rounded-lg bg-surface-container font-mono text-[11px] text-on-surface-variant text-left overflow-x-auto border border-outline-variant/30">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 w-full pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 py-2.5 px-3 rounded-xl bg-primary-container text-on-primary font-label-md text-xs font-semibold hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reload View</span>
          </button>

          <button
            type="button"
            onClick={handleResetToDemo}
            className="flex-1 py-2.5 px-3 rounded-xl bg-secondary-container text-on-secondary-container font-label-md text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Load Demo Event</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => (window.location.href = "/plan")}
          className="text-xs text-secondary hover:text-primary transition-colors flex items-center gap-1 pt-1 font-medium cursor-pointer"
        >
          <ArrowLeft className="h-3 w-3" />
          <span>Return to Event Planning Wizard</span>
        </button>
      </div>
    </div>
  );
}
