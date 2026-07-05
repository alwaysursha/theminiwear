import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/date";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Receipt,
  ShoppingBag,
  StickyNote,
  Trash2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { paidOrderWhere } from "@/lib/order-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MetricCard } from "@/components/admin/dashboard/MetricCard";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { addCustomerNote, deleteCustomerNote } from "@/lib/actions/customers";

export const dynamic = "force-dynamic";

function initials(value: string) {
  return (
    value
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: { where: paidOrderWhere, orderBy: { createdAt: "desc" } },
      notes: { include: { author: true }, orderBy: { createdAt: "desc" } },
      addresses: true,
    },
  });

  if (!customer) {
    notFound();
  }

  const spend = await prisma.order.aggregate({
    where: { userId: id, ...paidOrderWhere },
    _sum: { total: true },
  });

  const boundAddNote = addCustomerNote.bind(null, id);
  const displayName = customer.name ?? customer.email;
  const lifetimeSpend = Number(spend._sum.total ?? 0);
  const avgOrder =
    customer.orders.length > 0 ? lifetimeSpend / customer.orders.length : 0;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/customers"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to customers
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-white">
            {initials(displayName)}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-bold tracking-tight text-slate-900">
              {displayName}
            </h2>
            <p className="truncate text-sm text-slate-500">{customer.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Total orders"
          value={customer.orders.length}
          icon={ShoppingBag}
          accent="blue"
        />
        <MetricCard
          label="Lifetime spend"
          value={formatPrice(lifetimeSpend)}
          icon={Receipt}
          accent="emerald"
        />
        <MetricCard
          label="Avg order"
          value={formatPrice(avgOrder)}
          icon={Receipt}
          accent="violet"
        />
        <MetricCard
          label="Member since"
          value={formatDate(customer.createdAt, "MMM yyyy")}
          icon={CalendarDays}
          accent="amber"
        />
      </div>

      {/* Orders */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
          <ShoppingBag className="h-4 w-4 text-slate-400" />
          Orders
        </h3>
        {customer.orders.length === 0 ? (
          <p className="text-sm text-slate-500">No orders yet.</p>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-xl border border-slate-100 sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-2.5">Order</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">Total</th>
                    <th className="px-3 py-2.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customer.orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-slate-900 hover:text-slate-600"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-3 py-2.5 font-medium text-slate-900">
                        {formatPrice(Number(order.total))}
                      </td>
                      <td className="px-3 py-2.5 text-slate-500">
                        {formatDate(order.createdAt, "MMM d, yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-2 sm:hidden">
              {customer.orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDate(order.createdAt, "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                    <span className="font-medium text-slate-900">
                      {formatPrice(Number(order.total))}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Addresses */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
            <MapPin className="h-4 w-4 text-slate-400" />
            Addresses
          </h3>
          {customer.addresses.length === 0 ? (
            <p className="text-sm text-slate-500">No saved addresses.</p>
          ) : (
            <ul className="space-y-3">
              {customer.addresses.map((address) => (
                <li
                  key={address.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-sm text-slate-600"
                >
                  <p className="font-medium text-slate-900">
                    {address.fullName}
                  </p>
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}
                  <br />
                  {address.city}, {address.state} {address.postalCode}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* CRM notes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
            <StickyNote className="h-4 w-4 text-slate-400" />
            CRM notes
          </h3>

          {customer.notes.length > 0 ? (
            <ul className="mb-5 space-y-3">
              {customer.notes.map((note) => {
                const boundDeleteNote = deleteCustomerNote.bind(
                  null,
                  note.id,
                  id,
                );
                return (
                  <li
                    key={note.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span>
                        {note.author.name ?? note.author.email} ·{" "}
                        {formatDate(note.createdAt, "MMM d, yyyy")}
                      </span>
                      <ConfirmSubmitButton
                        action={boundDeleteNote}
                        triggerLabel={<Trash2 className="h-3.5 w-3.5" />}
                        triggerClassName="rounded-md p-1 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                        title="Delete note?"
                        confirmLabel="Delete note"
                        description="This CRM note will be permanently removed."
                      />
                    </div>
                    {note.tags.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-slate-200 px-1.5 py-0.5 text-[11px] font-medium text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap text-sm text-slate-700">
                      {note.content}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mb-5 text-sm text-slate-500">No notes yet.</p>
          )}

          <form
            action={boundAddNote}
            className="space-y-4 border-t border-slate-100 pt-5"
          >
            <div className="space-y-2">
              <Label htmlFor="content">Add note</Label>
              <Textarea
                id="content"
                name="content"
                required
                rows={3}
                placeholder="Internal note about this customer…"
                className="rounded-lg border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                name="tags"
                placeholder="vip, returns, wholesale"
                className="rounded-lg border-slate-200"
              />
            </div>
            <Button
              type="submit"
              className="rounded-lg bg-slate-900 text-white hover:bg-slate-800"
            >
              Save note
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
