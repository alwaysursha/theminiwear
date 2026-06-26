import Link from "next/link";
import { format } from "date-fns";
import {
  AlertTriangle,
  DollarSign,
  MessageSquare,
  ShoppingCart,
} from "lucide-react";
import { OrderStatus, InquiryStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { StatCard } from "@/components/admin/StatCard";
import { DataTable } from "@/components/admin/DataTable";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    revenueResult,
    ordersToday,
    openInquiries,
    lowStockVariants,
    recentOrders,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: {
        status: {
          in: [
            OrderStatus.PAID,
            OrderStatus.PROCESSING,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
          ],
        },
      },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: { createdAt: { gte: today } },
    }),
    prisma.inquiry.count({
      where: {
        status: { in: [InquiryStatus.OPEN, InquiryStatus.IN_PROGRESS] },
      },
    }),
    prisma.productVariant.count({
      where: { stock: { lte: 5 } },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
  ]);

  const revenue = Number(revenueResult._sum.total ?? 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-500">
          Overview of store performance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total revenue"
          value={formatPrice(revenue)}
          description="Paid & fulfilled orders"
          icon={DollarSign}
        />
        <StatCard
          title="Orders today"
          value={ordersToday}
          description={format(today, "MMMM d, yyyy")}
          icon={ShoppingCart}
        />
        <StatCard
          title="Open inquiries"
          value={openInquiries}
          description="Needs attention"
          icon={MessageSquare}
        />
        <StatCard
          title="Low stock variants"
          value={lowStockVariants}
          description="5 or fewer in stock"
          icon={AlertTriangle}
        />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Recent orders
        </h3>
        <DataTable
          data={recentOrders}
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
              render: (order) => format(order.createdAt, "MMM d, yyyy"),
            },
          ]}
        />
      </div>
    </div>
  );
}
