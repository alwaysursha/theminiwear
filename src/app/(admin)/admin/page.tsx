import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  DollarSign,
  Inbox,
  MessageSquare,
  Package,
  PackageCheck,
  Plus,
  ShoppingBag,
  Star,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { OrderStatus, InquiryStatus, ReviewStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatPrice, cn } from "@/lib/utils";
import { formatDate, startOfMonth, subMonths } from "@/lib/date";
import { MetricCard } from "@/components/admin/dashboard/MetricCard";
import {
  DashboardPanel,
  EmptyState,
} from "@/components/admin/dashboard/DashboardPanel";
import {
  RevenueBars,
  type RevenueDay,
} from "@/components/admin/dashboard/RevenueBars";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";

export const dynamic = "force-dynamic";

const PAID_STATUSES = [
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date, "MMM d, yyyy");
}

function initials(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const startToday = startOfDay(now);
  const startMonth = startOfMonth(now);
  const startPrevMonth = startOfMonth(subMonths(now, 1));
  const startWeek = new Date(startToday);
  startWeek.setDate(startWeek.getDate() - 6);

  const [
    revenueAgg,
    monthAgg,
    prevMonthAgg,
    ordersTodayCount,
    newOrders,
    newOrdersCount,
    processingOrders,
    processingCount,
    openInquiries,
    openInquiriesCount,
    lowStock,
    lowStockCount,
    outOfStockCount,
    pendingReviews,
    newCustomers,
    weekOrders,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: PAID_STATUSES } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { status: { in: PAID_STATUSES }, createdAt: { gte: startMonth } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: {
        status: { in: PAID_STATUSES },
        createdAt: { gte: startPrevMonth, lt: startMonth },
      },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: startToday } } }),
    prisma.order.findMany({
      where: { status: OrderStatus.PAID },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: true, _count: { select: { items: true } } },
    }),
    prisma.order.count({ where: { status: OrderStatus.PAID } }),
    prisma.order.findMany({
      where: { status: { in: [OrderStatus.PROCESSING, OrderStatus.SHIPPED] } },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { user: true, shipment: true },
    }),
    prisma.order.count({
      where: { status: { in: [OrderStatus.PROCESSING, OrderStatus.SHIPPED] } },
    }),
    prisma.inquiry.findMany({
      where: {
        status: { in: [InquiryStatus.OPEN, InquiryStatus.IN_PROGRESS] },
      },
      include: {
        user: true,
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    prisma.inquiry.count({
      where: {
        status: { in: [InquiryStatus.OPEN, InquiryStatus.IN_PROGRESS] },
      },
    }),
    prisma.productVariant.findMany({
      where: { stock: { lte: 5 } },
      include: { product: { select: { id: true, name: true } } },
      orderBy: { stock: "asc" },
      take: 8,
    }),
    prisma.productVariant.count({ where: { stock: { lte: 5 } } }),
    prisma.productVariant.count({ where: { stock: { lte: 0 } } }),
    prisma.productReview.count({ where: { status: ReviewStatus.PENDING } }),
    prisma.user.count({
      where: { role: Role.USER, createdAt: { gte: startWeek } },
    }),
    prisma.order.findMany({
      where: { status: { in: PAID_STATUSES }, createdAt: { gte: startWeek } },
      select: { total: true, createdAt: true },
    }),
  ]);

  const revenue = Number(revenueAgg._sum.total ?? 0);
  const paidOrderCount = revenueAgg._count;
  const aov = paidOrderCount > 0 ? revenue / paidOrderCount : 0;

  const monthRevenue = Number(monthAgg._sum.total ?? 0);
  const prevRevenue = Number(prevMonthAgg._sum.total ?? 0);
  const monthDeltaPct =
    prevRevenue > 0
      ? Math.round(((monthRevenue - prevRevenue) / prevRevenue) * 100)
      : null;

  const unreadInquiries = openInquiries.filter(
    (i) => i.messages[0] && !i.messages[0].isStaff,
  );
  const unreadCount = unreadInquiries.length;

  const days: RevenueDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startWeek);
    d.setDate(startWeek.getDate() + i);
    return {
      label: weekdayFormatter.format(d),
      value: 0,
      isToday: d.getTime() === startToday.getTime(),
    };
  });
  for (const order of weekOrders) {
    const idx = Math.round(
      (startOfDay(order.createdAt).getTime() - startWeek.getTime()) / 86400000,
    );
    if (idx >= 0 && idx < 7) days[idx].value += Number(order.total);
  }
  const weekTotal = days.reduce((sum, d) => sum + d.value, 0);

  const attention = [
    {
      label: "New orders to fulfill",
      value: newOrdersCount,
      href: "/admin/orders",
      dot: "bg-emerald-500",
      show: newOrdersCount > 0,
    },
    {
      label: "Orders in processing",
      value: processingCount,
      href: "/admin/orders",
      dot: "bg-sky-500",
      show: processingCount > 0,
    },
    {
      label: "Unread inquiries",
      value: unreadCount,
      href: "/admin/inquiries",
      dot: "bg-amber-500",
      show: unreadCount > 0,
    },
    {
      label: "Out of stock variants",
      value: outOfStockCount,
      href: "/admin/products",
      dot: "bg-rose-500",
      show: outOfStockCount > 0,
    },
    {
      label: "Reviews to moderate",
      value: pendingReviews,
      href: "/admin/reviews",
      dot: "bg-violet-500",
      show: pendingReviews > 0,
    },
  ].filter((a) => a.show);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="dash-rise relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 text-white shadow-sm sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200/80">
              {formatDate(now, "MMMM d, yyyy")}
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
              Store overview
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              {newOrdersCount > 0
                ? `${newOrdersCount} new ${newOrdersCount === 1 ? "order" : "orders"} waiting to be fulfilled`
                : "You're all caught up on orders "}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              <ShoppingBag className="h-4 w-4" />
              Orders
            </Link>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
            >
              <Plus className="h-4 w-4" />
              New product
            </Link>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total revenue"
          value={formatPrice(revenue)}
          icon={DollarSign}
          accent="emerald"
          sub={`${paidOrderCount} paid orders`}
        />
        <MetricCard
          label="This month"
          value={formatPrice(monthRevenue)}
          icon={TrendingUp}
          accent="violet"
          delta={
            monthDeltaPct != null
              ? {
                  value: `${Math.abs(monthDeltaPct)}%`,
                  direction:
                    monthDeltaPct > 0
                      ? "up"
                      : monthDeltaPct < 0
                        ? "down"
                        : "neutral",
                }
              : undefined
          }
          sub="vs last month"
        />
        <MetricCard
          label="Orders today"
          value={ordersTodayCount}
          icon={ShoppingBag}
          accent="blue"
          sub={formatDate(now, "MMM d, yyyy")}
        />
        <MetricCard
          label="Avg order value"
          value={formatPrice(aov)}
          icon={Boxes}
          accent="amber"
          sub="Across paid orders"
        />
      </div>

      {/* Revenue chart + attention */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="dash-rise rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900">Revenue</h3>
              <p className="text-xs text-slate-400">Last 7 days</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-slate-900">
                {formatPrice(weekTotal)}
              </p>
              <p className="text-xs text-slate-400">7-day total</p>
            </div>
          </div>
          <div className="mt-5">
            <RevenueBars days={days} />
          </div>
        </div>

        <DashboardPanel
          title="Needs attention"
          icon={AlertTriangle}
          className="order-first lg:order-none"
        >
          {attention.length === 0 ? (
            <EmptyState message="Nothing needs attention. Great job! 🎉" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {attention.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-3 transition-colors hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={cn("h-2 w-2 rounded-full", item.dot)}
                        aria-hidden
                      />
                      <span className="text-sm text-slate-600">
                        {item.label}
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900">
                        {item.value}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DashboardPanel>
      </div>

      {/* Order queues */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardPanel
          title="New orders"
          icon={Inbox}
          count={newOrdersCount}
          countTone="emerald"
          action={{ href: "/admin/orders", label: "View all" }}
        >
          {newOrders.length === 0 ? (
            <EmptyState message="No new paid orders right now." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {newOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-slate-50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
                      {initials(order.user?.name, order.user?.email ?? order.guestEmail)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {order.user?.name ?? order.guestEmail ?? "Guest"}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {order.orderNumber} · {order._count.items}{" "}
                        {order._count.items === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatPrice(Number(order.total))}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {timeAgo(order.createdAt)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Processing & shipping"
          icon={PackageCheck}
          count={processingCount}
          countTone="blue"
          action={{ href: "/admin/orders", label: "View all" }}
        >
          {processingOrders.length === 0 ? (
            <EmptyState message="No orders in progress." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {processingOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-slate-50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                      <Package className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {order.orderNumber}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {order.user?.name ?? order.guestEmail ?? "Guest"}
                        {order.shipment?.trackingNumber
                          ? ` · ${order.shipment.trackingNumber}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <OrderStatusBadge status={order.status} />
                      <p className="text-[11px] text-slate-400">
                        {timeAgo(order.updatedAt)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DashboardPanel>
      </div>

      {/* Inquiries + low stock */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardPanel
          title="Open inquiries"
          icon={MessageSquare}
          count={openInquiriesCount}
          countTone={unreadCount > 0 ? "amber" : "slate"}
          action={{ href: "/admin/inquiries", label: "View all" }}
        >
          {openInquiries.length === 0 ? (
            <EmptyState message="No open inquiries." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {openInquiries.slice(0, 6).map((inquiry) => {
                const last = inquiry.messages[0];
                const unread = Boolean(last && !last.isStaff);
                return (
                  <li key={inquiry.id}>
                    <Link
                      href={`/admin/inquiries/${inquiry.id}`}
                      className="flex items-start gap-3 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-slate-50"
                    >
                      <span className="mt-1.5 flex h-2 w-2 shrink-0 items-center justify-center">
                        {unread ? (
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                          </span>
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-slate-300" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate text-sm",
                            unread
                              ? "font-semibold text-slate-900"
                              : "font-medium text-slate-700",
                          )}
                        >
                          {inquiry.subject}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {inquiry.user?.name ??
                            inquiry.guestName ??
                            inquiry.guestEmail ??
                            "Guest"}
                          {last ? ` · ${last.content}` : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {unread && (
                          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                            New reply
                          </span>
                        )}
                        <p className="text-[11px] text-slate-400">
                          {timeAgo(inquiry.updatedAt)}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Low stock variants"
          icon={AlertTriangle}
          count={lowStockCount}
          countTone={outOfStockCount > 0 ? "rose" : "amber"}
          action={{ href: "/admin/products", label: "Manage" }}
        >
          {lowStock.length === 0 ? (
            <EmptyState message="All variants are well stocked. 👍" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {lowStock.map((variant) => {
                const out = variant.stock <= 0;
                const critical = variant.stock > 0 && variant.stock <= 2;
                const severity = out
                  ? {
                      label: "Out of stock",
                      chip: "bg-rose-100 text-rose-700",
                      bar: "bg-rose-500",
                    }
                  : critical
                    ? {
                        label: "Critical",
                        chip: "bg-orange-100 text-orange-700",
                        bar: "bg-orange-500",
                      }
                    : {
                        label: "Low",
                        chip: "bg-amber-100 text-amber-700",
                        bar: "bg-amber-500",
                      };
                const barPct = Math.min(100, Math.max(6, (variant.stock / 5) * 100));
                return (
                  <li key={variant.id}>
                    <Link
                      href={`/admin/products/${variant.product.id}/edit`}
                      className="block rounded-lg px-2.5 py-2.5 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {variant.product.name}
                          </p>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                              severity.chip,
                            )}
                          >
                            {severity.label}
                          </span>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-sm font-bold text-slate-900">
                            {variant.stock}
                          </span>
                          <span className="ml-0.5 text-[11px] text-slate-400">
                            left
                          </span>
                        </div>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {variant.size} · {variant.color} · {variant.sku}
                      </p>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn("h-full rounded-full", severity.bar)}
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </DashboardPanel>
      </div>

      {/* Secondary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="New customers"
          value={newCustomers}
          icon={UserPlus}
          accent="blue"
          sub="Last 7 days"
          href="/admin/customers"
        />
        <MetricCard
          label="Reviews to moderate"
          value={pendingReviews}
          icon={Star}
          accent={pendingReviews > 0 ? "amber" : "slate"}
          sub="Pending approval"
          href="/admin/reviews"
        />
        <MetricCard
          label="Low stock variants"
          value={lowStockCount}
          icon={AlertTriangle}
          accent={outOfStockCount > 0 ? "rose" : "amber"}
          sub={`${outOfStockCount} out of stock`}
          href="/admin/products"
        />
      </div>
    </div>
  );
}
