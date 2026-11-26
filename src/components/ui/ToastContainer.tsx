'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[60] flex max-w-sm flex-col gap-2.5 w-[calc(100%-2rem)] sm:w-auto"
    >
      {toasts.map((toast) => {
        const styleMap = {
          success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
          error: 'border-red-200 bg-red-50 text-red-900',
          warning: 'border-amber-200 bg-amber-50 text-amber-900',
          info: 'border-slate-200 bg-white text-slate-900',
        }[toast.type];

        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'error' || toast.type === 'warning'
              ? AlertCircle
              : Info;

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 shadow-lg ${styleMap}`}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-sm font-medium leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="ml-auto rounded p-0.5 opacity-60 hover:opacity-100"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
