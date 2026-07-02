"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownUp, Search, Users } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";

export type AdminCustomerRow = {
  id: string;
  name: string;
  email: string;
  ordersCount: number;
  totalSpend: number;
  notesCount: number;
  joined: string;
  lastOrderAt: string | null;
};

type OrdersFilter = "all" | "with" | "without";
type SortKey = "newest" | "spend" | "orders" | "name";

const selectClass =
  "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-slate-400";

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

const AVATAR_COLORS = [
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
];

function avatarColor(id: string) {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export function CustomersManager({
  customers,
}: {
  customers: AdminCustomerRow[];
}) {
  const [search, setSearch] = useState("");
  const [ordersFilter, setOrdersFilter] = useState<OrdersFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = customers.filter((c) => {
      if (q && !`${c.name} ${c.email}`.toLowerCase().includes(q)) return false;
      if (ordersFilter === "with" && c.ordersCount === 0) return false;
      if (ordersFilter === "without" && c.ordersCount > 0) return false;
      return true;
    });
    const sorted = [...list];
    switch (sort) {
      case "spend":
        sorted.sort((a, b) => b.totalSpend - a.totalSpend);
        break;
      case "orders":
        sorted.sort((a, b) => b.ordersCount - a.ordersCount);
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        sorted.sort((a, b) => b.joined.localeCompare(a.joined));
    }
    return sorted;
  }, [customers, search, ordersFilter, sort]);

  const hasFilters = search !== "" || ordersFilter !== "all";

  function resetFilters() {
    setSearch("");
    setOrdersFilter("all");
    setSort("newest");
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
              placeholder="Search by name or email…"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-slate-400"
            />
          </div>
          <select
            value={ordersFilter}
            onChange={(e) => setOrdersFilter(e.target.value as OrdersFilter)}
            className={selectClass}
          >
            <option value="all">All customers</option>
            <option value="with">With orders</option>
            <option value="without">No orders</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filtered.length}
            </span>{" "}
            of {customers.length}
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
                <option value="spend">Top spenders</option>
                <option value="orders">Most orders</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Users className="h-10 w-10 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">No customers found</p>
          <p className="mt-1 text-sm text-slate-500">
            {hasFilters
              ? "Try adjusting your search or filters."
              : "Customers will appear here after they sign up."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-4 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-3 py-3">Orders</th>
                  <th className="px-3 py-3">Total spend</th>
                  <th className="px-3 py-3">Notes</th>
                  <th className="px-3 py-3">Last order</th>
                  <th className="px-3 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                            avatarColor(c.id),
                          )}
                        >
                          {initials(c.name)}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/customers/${c.id}`}
                            className="block truncate font-medium text-slate-900 hover:text-slate-600"
                          >
                            {c.name}
                          </Link>
                          <p className="truncate text-xs text-slate-400">
                            {c.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{c.ordersCount}</td>
                    <td className="px-3 py-3 font-medium text-slate-900">
                      {formatPrice(c.totalSpend)}
                    </td>
                    <td className="px-3 py-3 text-slate-600">{c.notesCount}</td>
                    <td className="px-3 py-3 text-slate-500">
                      {c.lastOrderAt ? formatDate(c.lastOrderAt) : "—"}
                    </td>
                    <td className="px-3 py-3 text-slate-500">
                      {formatDate(c.joined)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet cards */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:hidden">
            {filtered.map((c) => (
              <Link
                key={c.id}
                href={`/admin/customers/${c.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      avatarColor(c.id),
                    )}
                  >
                    {initials(c.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {c.name}
                    </p>
                    <p className="truncate text-xs text-slate-400">{c.email}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {c.ordersCount}
                    </p>
                    <p className="text-[11px] text-slate-400">Orders</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatPrice(c.totalSpend)}
                    </p>
                    <p className="text-[11px] text-slate-400">Spent</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatDate(c.joined)}
                    </p>
                    <p className="text-[11px] text-slate-400">Joined</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
