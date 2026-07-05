"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowDownUp, Loader2, Package, Search } from "lucide-react";
import { ReturnStatus } from "@prisma/client";
import { updateReturnStatus } from "@/lib/actions/returns";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";

export type AdminReturnRow = {
  id: string;
  orderId: string;
  orderNumber: string;
  customerLabel: string;
  reason: string;
  status: ReturnStatus;
  createdAt: string;
};

type StatusFilter = "all" | ReturnStatus;
type SortKey = "newest" | "oldest";

const STATUS_META: Record<
  ReturnStatus,
  { label: string; cls: string }
> = {
  REQUESTED: { label: "Requested", cls: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "Approved", cls: "bg-sky-100 text-sky-700" },
  REJECTED: { label: "Rejected", cls: "bg-rose-100 text-rose-700" },
  COMPLETED: { label: "Completed", cls: "bg-emerald-100 text-emerald-700" },
};

const selectClass =
  "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-slate-400";

export function ReturnsManager({ returns }: { returns: AdminReturnRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = returns.filter((row) => {
      if (
        q &&
        !`${row.orderNumber} ${row.customerLabel} ${row.reason}`
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
      if (status !== "all" && row.status !== status) return false;
      return true;
    });
    const sorted = [...list];
    sorted.sort((a, b) =>
      sort === "oldest"
        ? a.createdAt.localeCompare(b.createdAt)
        : b.createdAt.localeCompare(a.createdAt),
    );
    return sorted;
  }, [returns, search, status, sort]);

  function changeStatus(id: string, next: ReturnStatus) {
    setBusyId(id);
    startTransition(() => {
      updateReturnStatus(id, next)
        .then(() => router.refresh())
        .finally(() => setBusyId(null));
    });
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order, customer, or reason…"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-slate-400"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className={selectClass}
          >
            <option value="all">Any status</option>
            {Object.values(ReturnStatus).map((value) => (
              <option key={value} value={value}>
                {STATUS_META[value].label}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filtered.length}
            </span>{" "}
            of {returns.length}
          </p>
          <div className="flex items-center gap-1.5">
            <ArrowDownUp className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Package className="h-10 w-10 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">No return requests</p>
          <p className="mt-1 text-sm text-slate-500">
            Customer return requests will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Order</th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Reason</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Requested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => {
                const busy = busyId === row.id;
                const meta = STATUS_META[row.status];
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "align-top transition-colors hover:bg-slate-50/70",
                      busy && "opacity-50",
                    )}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${row.orderId}`}
                        className="font-mono text-xs font-semibold text-slate-900 hover:text-slate-600"
                      >
                        {row.orderNumber}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {row.customerLabel}
                    </td>
                    <td className="max-w-xs px-3 py-3 text-slate-600">
                      <p className="line-clamp-2">{row.reason}</p>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={row.status}
                        disabled={busy}
                        onChange={(e) =>
                          changeStatus(row.id, e.target.value as ReturnStatus)
                        }
                        className={cn(
                          "rounded-lg border-0 px-2.5 py-1 text-xs font-semibold outline-none focus:ring-2 focus:ring-slate-300",
                          meta.cls,
                        )}
                      >
                        {Object.values(ReturnStatus).map((value) => (
                          <option key={value} value={value}>
                            {STATUS_META[value].label}
                          </option>
                        ))}
                      </select>
                      {busy && (
                        <Loader2 className="mt-1 h-3 w-3 animate-spin text-slate-400" />
                      )}
                    </td>
                    <td className="px-3 py-3 text-slate-500">
                      {formatDate(new Date(row.createdAt), "MMM d, yyyy")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
