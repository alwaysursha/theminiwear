"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownUp, Inbox, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type InquiryStatusValue = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type AdminInquiryRow = {
  id: string;
  subject: string;
  fromName: string;
  status: InquiryStatusValue;
  assigneeName: string | null;
  messageCount: number;
  preview: string;
  needsReply: boolean;
  updatedAt: string;
};

type StatusFilter = "all" | InquiryStatusValue;
type SortKey = "recent" | "oldest" | "messages";

const STATUS_META: Record<
  InquiryStatusValue,
  { label: string; cls: string; dot: string }
> = {
  OPEN: { label: "Open", cls: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  IN_PROGRESS: {
    label: "In progress",
    cls: "bg-sky-100 text-sky-700",
    dot: "bg-sky-500",
  },
  RESOLVED: {
    label: "Resolved",
    cls: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  CLOSED: {
    label: "Closed",
    cls: "bg-slate-100 text-slate-500",
    dot: "bg-slate-400",
  },
};

const selectClass =
  "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-slate-400";

function StatusBadge({ status }: { status: InquiryStatusValue }) {
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

export function InquiriesManager({
  inquiries,
}: {
  inquiries: AdminInquiryRow[];
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("recent");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = inquiries.filter((i) => {
      if (
        q &&
        !`${i.subject} ${i.fromName} ${i.preview}`.toLowerCase().includes(q)
      )
        return false;
      if (status !== "all" && i.status !== status) return false;
      return true;
    });
    const sorted = [...list];
    switch (sort) {
      case "oldest":
        sorted.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
        break;
      case "messages":
        sorted.sort((a, b) => b.messageCount - a.messageCount);
        break;
      default:
        sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    return sorted;
  }, [inquiries, search, status, sort]);

  const hasFilters = search !== "" || status !== "all";

  function resetFilters() {
    setSearch("");
    setStatus("all");
    setSort("recent");
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
              placeholder="Search subject, sender or message…"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-slate-400"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className={selectClass}
          >
            <option value="all">Any status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filtered.length}
            </span>{" "}
            of {inquiries.length}
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
                <option value="recent">Most recent</option>
                <option value="oldest">Oldest</option>
                <option value="messages">Most messages</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Inbox className="h-10 w-10 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">No inquiries found</p>
          <p className="mt-1 text-sm text-slate-500">
            {hasFilters
              ? "Try adjusting your search or filters."
              : "Customer messages will appear here."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-4 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-3 py-3">From</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Assignee</th>
                  <th className="px-3 py-3">Msgs</th>
                  <th className="px-3 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((i) => (
                  <tr
                    key={i.id}
                    className="align-top transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {i.needsReply && (
                          <span
                            className="h-2 w-2 shrink-0 rounded-full bg-rose-500"
                            title="Awaiting reply"
                          />
                        )}
                        <Link
                          href={`/admin/inquiries/${i.id}`}
                          className="font-medium text-slate-900 hover:text-slate-600"
                        >
                          {i.subject}
                        </Link>
                      </div>
                      <p className="mt-0.5 line-clamp-1 max-w-md text-xs text-slate-400">
                        {i.preview}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{i.fromName}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={i.status} />
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {i.assigneeName ?? (
                        <span className="text-slate-300">Unassigned</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {i.messageCount}
                    </td>
                    <td className="px-3 py-3 text-slate-500">
                      {formatDate(i.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet cards */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:hidden">
            {filtered.map((i) => (
              <Link
                key={i.id}
                href={`/admin/inquiries/${i.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    {i.needsReply && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                    )}
                    <p className="line-clamp-1 font-semibold text-slate-900">
                      {i.subject}
                    </p>
                  </div>
                  <StatusBadge status={i.status} />
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                  {i.preview}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
                  <span>{i.fromName}</span>
                  <span>
                    {i.messageCount} msg{i.messageCount === 1 ? "" : "s"} ·{" "}
                    {formatDate(i.updatedAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
