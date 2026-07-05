"use client";

import { useMemo, useState } from "react";
import { Mail, Search, Trash2 } from "lucide-react";
import { deleteNewsletterSubscriber } from "@/lib/actions/newsletter";
import { formatDate } from "@/lib/date";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

export type AdminNewsletterRow = {
  id: string;
  email: string;
  createdAt: string;
};

type SortKey = "newest" | "oldest";

export function NewsletterManager({
  subscribers,
}: {
  subscribers: AdminNewsletterRow[];
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = subscribers.filter((row) =>
      q ? row.email.toLowerCase().includes(q) : true,
    );
    const sorted = [...list];
    sorted.sort((a, b) =>
      sort === "oldest"
        ? a.createdAt.localeCompare(b.createdAt)
        : b.createdAt.localeCompare(a.createdAt),
    );
    return sorted;
  }, [subscribers, search, sort]);

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email…"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-slate-400"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
        <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">{filtered.length}</span>{" "}
          of {subscribers.length}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Mail className="h-10 w-10 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">No subscribers yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Newsletter sign-ups from the footer will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Email</th>
                <th className="px-3 py-3">Subscribed</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {row.email}
                  </td>
                  <td className="px-3 py-3 text-slate-500">
                    {formatDate(new Date(row.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ConfirmSubmitButton
                      action={() => deleteNewsletterSubscriber(row.id)}
                      triggerLabel={<Trash2 className="h-4 w-4" />}
                      triggerClassName="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      title="Remove subscriber?"
                      description={
                        <>
                          Remove{" "}
                          <span className="font-semibold text-slate-900">
                            {row.email}
                          </span>{" "}
                          from the newsletter list.
                        </>
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
