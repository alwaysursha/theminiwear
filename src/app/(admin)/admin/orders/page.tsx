import { OrderStatus } from "@prisma/client";
import {
  DollarSign,
  PackageCheck,
  ShoppingBag,
  Timer,
  Truck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { MetricCard } from "@/components/admin/dashboard/MetricCard";
import {
  OrdersManager,
  type AdminOrderRow,
} from "@/components/admin/orders/OrdersManager";

export const dynamic = "force-dynamic";

const REVENUE_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      items: { select: { quantity: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows: AdminOrderRow[] = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.user?.name ?? order.guestEmail ?? "Guest",
    customerEmail: order.user?.email ?? order.guestEmail ?? null,
    isGuest: !order.userId,
    status: order.status,
    itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
    total: Number(order.total),
    createdAt: order.createdAt.toISOString(),
  }));

  const revenue = rows
    .filter((r) => REVENUE_STATUSES.includes(r.status))
    .reduce((sum, r) => sum + r.total, 0);
  const awaiting = rows.filter(
    (r) => r.status === "PAID" || r.status === "PROCESSING",
  ).length;
  const shipped = rows.filter((r) => r.status === "SHIPPED").length;
  const delivered = rows.filter((r) => r.status === "DELIVERED").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Orders
        </h2>
        <p className="text-sm text-slate-500">
          Track, filter and fulfill customer orders
          {awaiting > 0 ? ` · ${awaiting} awaiting fulfillment` : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard
          label="Total orders"
          value={rows.length}
          icon={ShoppingBag}
          accent="blue"
        />
        <MetricCard
          label="Revenue"
          value={formatPrice(revenue)}
          icon={DollarSign}
          accent="emerald"
          sub="Paid & fulfilled"
        />
        <MetricCard
          label="Awaiting"
          value={awaiting}
          icon={Timer}
          accent="amber"
          sub="Paid or processing"
        />
        <MetricCard
          label="Shipped"
          value={shipped}
          icon={Truck}
          accent="violet"
          sub="In transit"
        />
        <MetricCard
          label="Delivered"
          value={delivered}
          icon={PackageCheck}
          accent="slate"
        />
      </div>

      <OrdersManager orders={rows} />
    </div>
  );
}
