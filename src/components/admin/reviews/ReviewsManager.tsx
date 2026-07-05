"use client";

import {
  useMemo,
  useState,
  useTransition,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowDownUp,
  Check,
  Eye,
  Loader2,
  MessageSquare,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import {
  approveProductReviewById,
  deleteProductReview,
  rejectProductReviewById,
} from "@/lib/actions/reviews";
import { cn } from "@/lib/utils";

export type ReviewStatusValue = "PENDING" | "APPROVED" | "REJECTED";

export type AdminReviewRow = {
  id: string;
  productName: string;
  customerName: string;
  rating: number;
  status: ReviewStatusValue;
  title: string | null;
  body: string;
  orderId: string;
  orderNumber: string;
  createdAt: string;
};

type StatusFilter = "all" | ReviewStatusValue;
type RatingFilter = "all" | "5" | "4" | "3" | "2" | "1";
type SortKey = "newest" | "oldest" | "rating-high" | "rating-low";

const STATUS_META: Record<
  ReviewStatusValue,
  { label: string; cls: string; dot: string }
> = {
  PENDING: {
    label: "Pending",
    cls: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  APPROVED: {
    label: "Approved",
    cls: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    label: "Rejected",
    cls: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
  },
};

const selectClass =
  "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-slate-400";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "h-3.5 w-3.5",
            n <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200",
          )}
        />
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: ReviewStatusValue }) {
  const m = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        m.cls,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}

export function ReviewsManager({ reviews }: { reviews: AdminReviewRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminReviewRow | null>(
    null,
  );

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [rating, setRating] = useState<RatingFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = reviews.filter((r) => {
      if (
        q &&
        !`${r.productName} ${r.customerName} ${r.title ?? ""} ${r.body} ${r.orderNumber}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      if (status !== "all" && r.status !== status) return false;
      if (rating !== "all" && r.rating !== Number(rating)) return false;
      return true;
    });

    const sorted = [...list];
    switch (sort) {
      case "oldest":
        sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        break;
      case "rating-high":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "rating-low":
        sorted.sort((a, b) => a.rating - b.rating);
        break;
      default:
        sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return sorted;
  }, [reviews, search, status, rating, sort]);

  const hasFilters =
    search !== "" || status !== "all" || rating !== "all";

  function resetFilters() {
    setSearch("");
    setStatus("all");
    setRating("all");
    setSort("newest");
  }

  function runAction(id: string, action: () => Promise<unknown>) {
    setBusyId(id);
    startTransition(() => {
      action()
        .then(() => router.refresh())
        .finally(() => setBusyId(null));
    });
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <>
      {/* Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reviews, products, customers…"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-slate-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-nowrap">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className={selectClass}
            >
              <option value="all">Any status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value as RatingFilter)}
              className={selectClass}
            >
              <option value="all">Any rating</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filtered.length}
            </span>{" "}
            of {reviews.length}
          </p>
          <div className="flex items-center gap-2">
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                Clear filters
              </button>
            )}
            <div className="flex items-center gap-1.5">
              <ArrowDownUp className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="rating-high">Rating: high to low</option>
                <option value="rating-low">Rating: low to high</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <MessageSquare className="h-10 w-10 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">No reviews found</p>
          <p className="mt-1 text-sm text-slate-500">
            {hasFilters
              ? "Try adjusting your search or filters."
              : "Customer reviews will appear here."}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-4 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Review</th>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Rating</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Submitted</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => {
                  const busy = busyId === r.id;
                  return (
                    <tr
                      key={r.id}
                      className={cn(
                        "align-top transition-colors hover:bg-slate-50/70",
                        busy && "opacity-50",
                      )}
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/reviews/${r.id}`}
                          className="font-medium text-slate-900 hover:text-slate-600"
                        >
                          {r.productName}
                        </Link>
                        {r.title && (
                          <p className="mt-0.5 text-xs font-medium text-slate-600">
                            {r.title}
                          </p>
                        )}
                        <p className="mt-0.5 line-clamp-2 max-w-md text-xs text-slate-400">
                          {r.body}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {r.customerName}
                        <Link
                          href={`/admin/orders/${r.orderId}`}
                          className="mt-0.5 block text-xs text-slate-400 hover:text-slate-600 hover:underline"
                        >
                          {r.orderNumber}
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <Stars rating={r.rating} />
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <RowActions
                          review={r}
                          busy={busy}
                          onApprove={() =>
                            runAction(r.id, () => approveProductReviewById(r.id))
                          }
                          onReject={() =>
                            runAction(r.id, () => rejectProductReviewById(r.id))
                          }
                          onDelete={() => setConfirmDelete(r)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet cards */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:hidden">
            {filtered.map((r) => {
              const busy = busyId === r.id;
              return (
                <div
                  key={r.id}
                  className={cn(
                    "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-opacity",
                    busy && "opacity-50",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/admin/reviews/${r.id}`}
                      className="min-w-0 font-semibold text-slate-900"
                    >
                      <span className="line-clamp-1">{r.productName}</span>
                    </Link>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Stars rating={r.rating} />
                    <span className="text-xs text-slate-400">
                      {formatDate(r.createdAt)}
                    </span>
                  </div>
                  {r.title && (
                    <p className="mt-2 text-sm font-medium text-slate-700">
                      {r.title}
                    </p>
                  )}
                  <p className="mt-1 line-clamp-3 text-sm text-slate-500">
                    {r.body}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {r.customerName} ·{" "}
                    <Link
                      href={`/admin/orders/${r.orderId}`}
                      className="hover:underline"
                    >
                      {r.orderNumber}
                    </Link>
                  </p>
                  <div className="mt-3 flex items-center justify-end border-t border-slate-100 pt-3">
                    <RowActions
                      review={r}
                      busy={busy}
                      onApprove={() =>
                        runAction(r.id, () => approveProductReviewById(r.id))
                      }
                      onReject={() =>
                        runAction(r.id, () => rejectProductReviewById(r.id))
                      }
                      onDelete={() => setConfirmDelete(r)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {confirmDelete && (
        <DeleteDialog
          review={confirmDelete}
          pending={isPending}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            const target = confirmDelete;
            setConfirmDelete(null);
            runAction(target.id, () => deleteProductReview(target.id));
          }}
        />
      )}
    </>
  );
}

function RowActions({
  review,
  busy,
  onApprove,
  onReject,
  onDelete,
}: {
  review: AdminReviewRow;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}) {
  const btn =
    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50";
  return (
    <div className="flex items-center justify-end gap-1">
      {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin text-slate-400" />}
      {review.status !== "APPROVED" && (
        <button
          type="button"
          onClick={onApprove}
          disabled={busy}
          title="Approve"
          className={cn(
            btn,
            "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700",
          )}
        >
          <Check className="h-4 w-4" />
        </button>
      )}
      {review.status !== "REJECTED" && (
        <button
          type="button"
          onClick={onReject}
          disabled={busy}
          title="Reject"
          className={cn(btn, "text-amber-600 hover:bg-amber-50 hover:text-amber-700")}
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <Link
        href={`/admin/reviews/${review.id}`}
        title="View & edit"
        className={cn(btn, "text-slate-500 hover:bg-slate-100 hover:text-slate-900")}
      >
        <Eye className="h-4 w-4" />
      </Link>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        title="Delete"
        className={cn(btn, "text-slate-500 hover:bg-rose-50 hover:text-rose-600")}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function DeleteDialog({
  review,
  pending,
  onCancel,
  onConfirm,
}: {
  review: AdminReviewRow;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onCancel}
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
            onClick={onCancel}
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
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate font-semibold text-slate-900">
                {review.productName}
              </p>
              <Stars rating={review.rating} />
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">
              {review.body}
            </p>
            <p className="mt-1 text-xs text-slate-400">by {review.customerName}</p>
          </div>

          <p className="mt-4 text-sm text-slate-600">
            This review will be{" "}
            <span className="font-semibold text-rose-600">permanently</span>{" "}
            removed from the product page and your records. This action{" "}
            <span className="font-semibold">cannot be undone.</span>
          </p>

          <div className="mt-6 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              disabled={pending}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-rose-600/30 transition-colors hover:bg-rose-700 disabled:opacity-50"
            >
              {pending ? (
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
  );
}
