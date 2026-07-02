"use client";

import {
  useState,
  useTransition,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, X } from "lucide-react";

export function ConfirmSubmitButton({
  action,
  triggerLabel,
  triggerClassName,
  title = "Are you sure?",
  description,
  confirmLabel = "Delete permanently",
  icon,
}: {
  action: () => Promise<unknown>;
  triggerLabel: ReactNode;
  triggerClassName?: string;
  title?: string;
  description: ReactNode;
  confirmLabel?: string;
  icon?: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(() => {
      action()
        .then(() => {
          router.refresh();
          setOpen(false);
        })
        .catch(() => setOpen(false));
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 transition-colors hover:text-rose-700"
        }
      >
        {icon}
        {triggerLabel}
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
            <button
              type="button"
              aria-label="Close"
              onClick={() => !isPending && setOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <div
              className="dash-rise relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
              style={{ "--dash-i": 0 } as CSSProperties}
              role="alertdialog"
              aria-modal="true"
            >
              <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-red-500 to-rose-600 px-6 pb-5 pt-6 text-white">
                <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/10" />
                <div className="absolute -bottom-10 -left-4 h-24 w-24 rounded-full bg-white/10" />
                <button
                  type="button"
                  onClick={() => !isPending && setOpen(false)}
                  aria-label="Close"
                  className="absolute right-3 top-3 rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="relative flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 animate-pulse items-center justify-center rounded-full bg-white/20 ring-4 ring-white/20">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
                      Danger zone
                    </p>
                    <h3 className="text-lg font-bold leading-tight">{title}</h3>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="text-sm text-slate-600">{description}</div>
                <div className="mt-6 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={isPending}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-rose-600/30 transition-colors hover:bg-rose-700 disabled:opacity-50"
                  >
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {confirmLabel}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
