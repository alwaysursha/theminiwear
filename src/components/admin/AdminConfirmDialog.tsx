"use client";

import { createPortal } from "react-dom";
import type { CSSProperties, ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  tone?: "default" | "danger";
  confirmDisabled?: boolean;
};

export function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  tone = "default",
  confirmDisabled = false,
}: AdminConfirmDialogProps) {
  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <div
        className="dash-rise relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        style={{ "--dash-i": 0 } as CSSProperties}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        aria-describedby="admin-confirm-description"
      >
        <div
          className={cn(
            "relative overflow-hidden px-6 pb-5 pt-6 text-white",
            tone === "danger"
              ? "bg-gradient-to-br from-rose-500 via-red-500 to-rose-600"
              : "bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900",
          )}
        >
          <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-4 h-24 w-24 rounded-full bg-white/10" />
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="absolute right-3 top-3 rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/10">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/75">
                Please confirm
              </p>
              <h3
                id="admin-confirm-title"
                className="text-lg font-bold leading-tight"
              >
                {title}
              </h3>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div
            id="admin-confirm-description"
            className="text-sm leading-relaxed text-slate-600"
          >
            {description}
          </div>
          <div className="mt-6 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirmDisabled}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                tone === "danger"
                  ? "bg-rose-600 shadow-rose-600/30 hover:bg-rose-700"
                  : "bg-slate-900 shadow-slate-900/20 hover:bg-slate-800",
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
