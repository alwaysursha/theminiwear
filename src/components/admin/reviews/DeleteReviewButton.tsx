"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { deleteProductReview } from "@/lib/actions/reviews";

export function DeleteReviewButton({
  reviewId,
  productName,
}: {
  reviewId: string;
  productName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(() => {
      deleteProductReview(reviewId)
        .then(() => {
          router.push("/admin/reviews");
          router.refresh();
        })
        .catch(() => setOpen(false));
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-rose-600/30 transition-colors hover:bg-rose-700"
      >
        <Trash2 className="h-4 w-4" />
        Delete review
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
                    <h3 className="text-lg font-bold leading-tight">
                      Delete this review?
                    </h3>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm text-slate-600">
                  The review for{" "}
                  <span className="font-semibold text-slate-900">
                    {productName}
                  </span>{" "}
                  will be{" "}
                  <span className="font-semibold text-rose-600">
                    permanently
                  </span>{" "}
                  removed from the product page and your records. This action{" "}
                  <span className="font-semibold">cannot be undone.</span>
                </p>

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
                    onClick={handleDelete}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-rose-600/30 transition-colors hover:bg-rose-700 disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete permanently
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
