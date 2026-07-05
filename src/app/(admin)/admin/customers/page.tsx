import { DollarSign, TrendingUp, UserPlus, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { paidOrderWhere } from "@/lib/order-status";
import { MetricCard } from "@/components/admin/dashboard/MetricCard";
import {
  CustomersManager,
  type AdminCustomerRow,
} from "@/components/admin/customers/CustomersManager";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const [customers, spendGroups, guestOrders] = await Promise.all([
    prisma.user.findMany({
      where: { role: "USER" },
      include: {
        _count: { select: { orders: true, notes: true } },
        orders: {
          where: paidOrderWhere,
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.groupBy({
      by: ["userId"],
      where: { userId: { not: null }, ...paidOrderWhere },
      _sum: { total: true },
      _count: { _all: true },
    }),
    prisma.order.findMany({
      where: { userId: null, guestEmail: { not: null }, ...paidOrderWhere },
      select: { guestEmail: true, total: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const spendMap = new Map<string, { total: number; count: number }>();
  for (const group of spendGroups) {
    if (group.userId) {
      spendMap.set(group.userId, {
        total: Number(group._sum.total ?? 0),
        count: group._count._all,
      });
    }
  }

  const registeredRows: AdminCustomerRow[] = customers.map((customer) => {
    const spend = spendMap.get(customer.id);
    return {
      id: customer.id,
      name: customer.name ?? "Unnamed customer",
      email: customer.email,
      ordersCount: spend?.count ?? 0,
      totalSpend: spend?.total ?? 0,
      notesCount: customer._count.notes,
      joined: customer.createdAt.toISOString(),
      lastOrderAt: customer.orders[0]?.createdAt.toISOString() ?? null,
      isGuest: false,
    };
  });

  const guestMap = new Map<
    string,
    { total: number; count: number; lastOrderAt: string }
  >();
  for (const order of guestOrders) {
    const email = order.guestEmail!;
    const existing = guestMap.get(email);
    const createdAt = order.createdAt.toISOString();
    if (existing) {
      existing.total += Number(order.total);
      existing.count += 1;
      if (createdAt > existing.lastOrderAt) {
        existing.lastOrderAt = createdAt;
      }
    } else {
      guestMap.set(email, {
        total: Number(order.total),
        count: 1,
        lastOrderAt: createdAt,
      });
    }
  }

  const guestRows: AdminCustomerRow[] = [...guestMap.entries()].map(
    ([email, stats]) => ({
      id: `guest:${email}`,
      name: "Guest checkout",
      email,
      ordersCount: stats.count,
      totalSpend: stats.total,
      notesCount: 0,
      joined: stats.lastOrderAt,
      lastOrderAt: stats.lastOrderAt,
      isGuest: true,
    }),
  );

  const rows = [...registeredRows, ...guestRows].sort((a, b) =>
    b.joined.localeCompare(a.joined),
  );

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const withOrders = rows.filter((r) => r.ordersCount > 0).length;
  const totalRevenue = rows.reduce((sum, r) => sum + r.totalSpend, 0);
  const newThisMonth = registeredRows.filter(
    (r) => new Date(r.joined) >= startOfMonth,
  ).length;
  const avgLtv =
    withOrders > 0
      ? totalRevenue / withOrders
      : rows.length > 0
        ? totalRevenue / rows.length
        : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Customers
        </h2>
        <p className="text-sm text-slate-500">
          Registered accounts and guest checkout customers
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        <MetricCard
          label="Customers"
          value={rows.length}
          icon={Users}
          accent="blue"
          sub={`${withOrders} with orders · ${guestRows.length} guests`}
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
          label="New accounts"
          value={newThisMonth}
          icon={UserPlus}
          accent="amber"
          sub="This month"
        />
      </div>

      <CustomersManager customers={rows} />
    </div>
  );
}
