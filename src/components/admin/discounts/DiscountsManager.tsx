"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownUp,
  Loader2,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import { deleteDiscount, toggleDiscountActive } from "@/lib/actions/discounts";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { EditDiscountDialog } from "@/components/admin/discounts/EditDiscountDialog";
import { formatPrice, cn } from "@/lib/utils";

export type DiscountTypeValue = "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";

export type AdminDiscountRow = {
  id: string;
  code: string;
  type: DiscountTypeValue;
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  expired: boolean;
  isActive: boolean;
  createdAt: string;
};

type TypeFilter = "all" | DiscountTypeValue;
type StatusFilter = "all" | "active" | "inactive" | "expired";
type SortKey = "newest" | "used" | "expiring";

const selectClass =
  "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-slate-400";

function typeLabel(type: DiscountTypeValue) {
  switch (type) {
    case "PERCENTAGE":
      return "Percentage";
    case "FIXED":
      return "Fixed";
    case "FREE_SHIPPING":
      return "Free shipping";
    default: {
      const never: never = type;
      return never;
    }
  }
}

function valueDisplay(type: DiscountTypeValue, value: number) {
  switch (type) {
    case "PERCENTAGE":
      return `${value}%`;
    case "FREE_SHIPPING":
      return "Free shipping";
    case "FIXED":
      return formatPrice(value);
    default: {
      const never: never = type;
      return never;
    }
  }
}

export function DiscountsManager({
  discounts,
}: {
  discounts: AdminDiscountRow[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = discounts.filter((d) => {
      if (q && !d.code.toLowerCase().includes(q)) return false;
      if (type !== "all" && d.type !== type) return false;
      if (status === "active" && (!d.isActive || d.expired)) return false;
      if (status === "inactive" && d.isActive) return false;
      if (status === "expired" && !d.expired) return false;
      return true;
    });
    const sorted = [...list];
    switch (sort) {
      case "used":
        sorted.sort((a, b) => b.usedCount - a.usedCount);
        break;
      case "expiring":
        sorted.sort((a, b) => {
          if (!a.expiresAt) return 1;
          if (!b.expiresAt) return -1;
          return a.expiresAt.localeCompare(b.expiresAt);
        });
        break;
      default:
        sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return sorted;
  }, [discounts, search, type, status, sort]);

  const hasFilters = search !== "" || type !== "all" || status !== "all";

  function resetFilters() {
    setSearch("");
    setType("all");
    setStatus("all");
    setSort("newest");
  }

  function toggle(id: string, next: boolean) {
    setBusyId(id);
    startTransition(() => {
      toggleDiscountActive(id, next)
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
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code…"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm uppercase text-slate-700 outline-none transition-colors focus:border-slate-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 lg:flex">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TypeFilter)}
              className={selectClass}
            >
              <option value="all">Any type</option>
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed</option>
              <option value="FREE_SHIPPING">Free shipping</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className={selectClass}
            >
              <option value="all">Any status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filtered.length}
            </span>{" "}
            of {discounts.length}
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
                <option value="used">Most used</option>
                <option value="expiring">Expiring soon</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Tag className="h-10 w-10 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">No discounts found</p>
          <p className="mt-1 text-sm text-slate-500">
            {hasFilters
              ? "Try adjusting your search or filters."
              : "Create your first discount code above."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-4 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Value</th>
                  <th className="px-3 py-3">Usage</th>
                  <th className="px-3 py-3">Expires</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((d) => {
                  const expired = d.expired;
                  const busy = busyId === d.id;
                  return (
                    <tr
                      key={d.id}
                      className={cn(
                        "transition-colors hover:bg-slate-50/70",
                        busy && "opacity-50",
                      )}
                    >
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-bold text-slate-900">
                          {d.code}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {typeLabel(d.type)}
                      </td>
                      <td className="px-3 py-3 font-medium text-slate-900">
                        {valueDisplay(d.type, d.value)}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {d.usedCount}
                        {d.maxUses ? ` / ${d.maxUses}` : ""}
                      </td>
                      <td className="px-3 py-3">
                        {d.expiresAt ? (
                          <span
                            className={cn(
                              expired ? "text-rose-600" : "text-slate-500",
                            )}
                          >
                            {formatDate(d.expiresAt)}
                          </span>
                        ) : (
                          <span className="text-slate-300">Never</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <StatusPill
                          active={d.isActive}
                          expired={expired}
                          busy={busy}
                          onToggle={() => toggle(d.id, !d.isActive)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <EditDiscountDialog discount={d} />
                          <ConfirmSubmitButton
                            action={() => deleteDiscount(d.id)}
                            triggerLabel={<Trash2 className="h-4 w-4" />}
                            triggerClassName="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                            title="Delete discount?"
                            description={
                              <>
                                The code{" "}
                                <span className="font-mono font-semibold text-slate-900">
                                  {d.code}
                                </span>{" "}
                                will be permanently removed. This can&apos;t be
                                undone.
                              </>
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet cards */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:hidden">
            {filtered.map((d) => {
              const expired = d.expired;
              const busy = busyId === d.id;
              return (
                <div
                  key={d.id}
                  className={cn(
                    "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
                    busy && "opacity-50",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-sm font-bold text-slate-900">
                      {d.code}
                    </span>
                    <StatusPill
                      active={d.isActive}
                      expired={expired}
                      busy={busy}
                      onToggle={() => toggle(d.id, !d.isActive)}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {typeLabel(d.type)}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {valueDisplay(d.type, d.value)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Used {d.usedCount}
                      {d.maxUses ? ` / ${d.maxUses}` : ""}
                    </span>
                    <span className={cn(expired && "text-rose-600")}>
                      {d.expiresAt ? formatDate(d.expiresAt) : "No expiry"}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
                    <EditDiscountDialog discount={d} />
                    <ConfirmSubmitButton
                      action={() => deleteDiscount(d.id)}
                      triggerLabel={
                        <>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </>
                      }
                      triggerClassName="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:text-rose-700"
                      title="Delete discount?"
                      description={
                        <>
                          The code{" "}
                          <span className="font-mono font-semibold text-slate-900">
                            {d.code}
                          </span>{" "}
                          will be permanently removed. This can&apos;t be undone.
                        </>
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

function StatusPill({
  active,
  expired,
  busy,
  onToggle,
}: {
  active: boolean;
  expired: boolean;
  busy: boolean;
  onToggle: () => void;
}) {
  if (expired) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
        Expired
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={busy}
      title={active ? "Deactivate" : "Activate"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50",
        active
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          : "bg-slate-100 text-slate-500 hover:bg-slate-200",
      )}
    >
      {busy ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            active ? "bg-emerald-500" : "bg-slate-400",
          )}
        />
      )}
      {active ? "Active" : "Inactive"}
    </button>
  );
}
