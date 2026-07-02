import { DollarSign, TrendingUp, UserPlus, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { MetricCard } from "@/components/admin/dashboard/MetricCard";
import {
  CustomersManager,
  type AdminCustomerRow,
} from "@/components/admin/customers/CustomersManager";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const [customers, spendGroups] = await Promise.all([
    prisma.user.findMany({
      where: { role: "USER" },
      include: {
        _count: { select: { orders: true, notes: true } },
        orders: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.groupBy({
      by: ["userId"],
      _sum: { total: true },
    }),
  ]);

  const spendMap = new Map<string, number>();
  for (const g of spendGroups) {
    if (g.userId) spendMap.set(g.userId, Number(g._sum.total ?? 0));
  }

  const rows: AdminCustomerRow[] = customers.map((customer) => ({
    id: customer.id,
    name: customer.name ?? "Unnamed customer",
    email: customer.email,
    ordersCount: customer._count.orders,
    totalSpend: spendMap.get(customer.id) ?? 0,
    notesCount: customer._count.notes,
    joined: customer.createdAt.toISOString(),
    lastOrderAt: customer.orders[0]?.createdAt.toISOString() ?? null,
  }));

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const withOrders = rows.filter((r) => r.ordersCount > 0).length;
  const totalRevenue = rows.reduce((sum, r) => sum + r.totalSpend, 0);
  const newThisMonth = rows.filter(
    (r) => new Date(r.joined) >= startOfMonth,
  ).length;
  const avgLtv = rows.length > 0 ? totalRevenue / rows.length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Customers
        </h2>
        <p className="text-sm text-slate-500">
          Customer relationship management
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        <MetricCard
          label="Customers"
          value={rows.length}
          icon={Users}
          accent="blue"
          sub={`${withOrders} with orders`}
        />
        <MetricCard
          label="Lifetime revenue"
          value={formatPrice(totalRevenue)}
          icon={DollarSign}
          accent="emerald"
        />
        <MetricCard
          label="Avg lifetime value"
          value={formatPrice(avgLtv)}
          icon={TrendingUp}
          accent="violet"
        />
        <MetricCard
          label="New this month"
          value={newThisMonth}
          icon={UserPlus}
          accent="amber"
        />
      </div>

      <CustomersManager customers={rows} />
    </div>
  );
}
