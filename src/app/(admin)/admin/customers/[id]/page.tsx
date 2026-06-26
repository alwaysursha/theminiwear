import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/date";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/admin/DataTable";
import { addCustomerNote } from "@/lib/actions/customers";

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: { orderBy: { createdAt: "desc" } },
      notes: {
        include: { author: true },
        orderBy: { createdAt: "desc" },
      },
      addresses: true,
    },
  });

  if (!customer) {
    notFound();
  }

  const spend = await prisma.order.aggregate({
    where: { userId: id },
    _sum: { total: true },
  });

  const boundAddNote = addCustomerNote.bind(null, id);

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
        <h2 className="text-2xl font-semibold text-slate-900">
          {customer.name ?? customer.email}
        </h2>
        <p className="text-sm text-slate-500">{customer.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total orders</p>
          <p className="text-2xl font-semibold text-slate-900">
            {customer.orders.length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Lifetime spend</p>
          <p className="text-2xl font-semibold text-slate-900">
            {formatPrice(Number(spend._sum.total ?? 0))}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Member since</p>
          <p className="text-2xl font-semibold text-slate-900">
            {formatDate(customer.createdAt, "MMM yyyy")}
          </p>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Orders</h3>
        <DataTable
          data={customer.orders}
          getRowKey={(order) => order.id}
          emptyMessage="No orders yet."
          columns={[
            {
              key: "orderNumber",
              header: "Order",
              render: (order) => (
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-medium text-slate-900 hover:underline"
                >
                  {order.orderNumber}
                </Link>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (order) => order.status,
            },
            {
              key: "total",
              header: "Total",
              render: (order) => formatPrice(Number(order.total)),
            },
            {
              key: "date",
              header: "Date",
              render: (order) => formatDate(order.createdAt, "MMM d, yyyy"),
            },
          ]}
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-900">CRM notes</h3>

        {customer.notes.length > 0 ? (
          <ul className="mb-6 space-y-4">
            {customer.notes.map((note) => (
              <li
                key={note.id}
                className="rounded-md border border-slate-100 bg-slate-50 p-4"
              >
                <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {note.author.name ?? note.author.email} ·{" "}
                    {formatDate(note.createdAt, "MMM d, yyyy")}
                  </span>
                  {note.tags.length > 0 && (
                    <span className="flex gap-1">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-slate-200 px-1.5 py-0.5 text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-sm text-slate-700">
                  {note.content}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-6 text-sm text-slate-500">No notes yet.</p>
        )}

        <form action={boundAddNote} className="space-y-4 border-t border-slate-100 pt-6">
          <div className="space-y-2">
            <Label htmlFor="content">Add note</Label>
            <Textarea
              id="content"
              name="content"
              required
              placeholder="Internal note about this customer..."
              className="rounded-md border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="vip, returns, wholesale"
              className="rounded-md border-slate-200"
            />
          </div>
          <Button
            type="submit"
            className="rounded-md bg-slate-900 text-white hover:bg-slate-800"
          >
            Save note
          </Button>
        </form>
      </div>
    </div>
  );
}
