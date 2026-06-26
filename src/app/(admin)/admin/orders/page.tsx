import Link from "next/link";
import { format } from "date-fns";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { DataTable } from "@/components/admin/DataTable";

export const dynamic = "force-dynamic";

const statuses = ["ALL", ...Object.values(OrderStatus)] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusFilter } = await searchParams;
  const status =
    statusFilter && statusFilter !== "ALL"
      ? (statusFilter as OrderStatus)
      : undefined;

  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Orders</h2>
        <p className="text-sm text-slate-500">Manage customer orders</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => {
          const isActive =
            s === "ALL" ? !status : status === s;
          const href =
            s === "ALL" ? "/admin/orders" : `/admin/orders?status=${s}`;
          return (
            <Link
              key={s}
              href={href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {s === "ALL" ? "All" : s.replace("_", " ")}
            </Link>
          );
        })}
      </div>

      <DataTable
        data={orders}
        getRowKey={(order) => order.id}
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
            key: "customer",
            header: "Customer",
            render: (order) =>
              order.user?.name ?? order.guestEmail ?? "Guest",
          },
          {
            key: "status",
            header: "Status",
            render: (order) => (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                {order.status}
              </span>
            ),
          },
          {
            key: "total",
            header: "Total",
            render: (order) => formatPrice(Number(order.total)),
          },
          {
            key: "createdAt",
            header: "Date",
            render: (order) => format(order.createdAt, "MMM d, yyyy h:mm a"),
          },
        ]}
      />
    </div>
  );
}
