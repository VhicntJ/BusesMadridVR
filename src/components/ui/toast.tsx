"use client";

import { useEffect } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastProps = {
  variant: "success" | "error";
  message: string;
  onClose: () => void;
};

export function Toast({ variant, message, onClose }: ToastProps) {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timeoutId);
  }, [onClose]);

  const isSuccess = variant === "success";

  return (
    <div className="fixed right-4 top-4 z-[60]">
      <div
        className={cn(
          "flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg",
          isSuccess
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-red-200 bg-red-50 text-red-900"
        )}
        role="status"
        aria-live="polite"
      >
        {isSuccess ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5" />
        ) : (
          <AlertCircle className="mt-0.5 h-5 w-5" />
        )}
        <div className="text-sm font-medium">{message}</div>
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "ml-2 rounded p-1 transition-colors",
            isSuccess ? "text-emerald-700 hover:bg-emerald-100" : "text-red-700 hover:bg-red-100"
          )}
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
