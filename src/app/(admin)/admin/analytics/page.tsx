import { formatDate, subMonths, startOfMonth, endOfMonth } from "@/lib/date";
import { OrderStatus } from "@prisma/client";
import {
  BarChart3,
  DollarSign,
  Receipt,
  ShoppingBag,
  Trophy,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { MetricCard } from "@/components/admin/dashboard/MetricCard";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(now, 5 - i);
    const label = formatDate(date, "MMM yyyy");
    return {
      label,
      short: label.split(" ")[0],
      start: startOfMonth(date),
      end: endOfMonth(date),
    };
  });

  const monthlyData = await Promise.all(
    months.map(async (month) => {
      const [revenue, orders] = await Promise.all([
        prisma.order.aggregate({
          where: {
            createdAt: { gte: month.start, lte: month.end },
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
          where: { createdAt: { gte: month.start, lte: month.end } },
        }),
      ]);

      return {
        label: month.label,
        short: month.short,
        revenue: Number(revenue._sum.total ?? 0),
        orders,
      };
    }),
  );

  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue), 1);
  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
  const totalOrders = monthlyData.reduce((sum, m) => sum + m.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const bestMonth = monthlyData.reduce((best, m) =>
    m.revenue > best.revenue ? m : best,
  );

  const current = monthlyData[monthlyData.length - 1];
  const previous = monthlyData[monthlyData.length - 2];
  let delta: { value: string; direction: "up" | "down" | "neutral" } | undefined;
  if (previous && previous.revenue > 0) {
    const pct = Math.round(
      ((current.revenue - previous.revenue) / previous.revenue) * 100,
    );
    delta = {
      value: `${Math.abs(pct)}%`,
      direction: pct > 0 ? "up" : pct < 0 ? "down" : "neutral",
    };
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Analytics
        </h2>
        <p className="text-sm text-slate-500">
          Performance over the last 6 months
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="6-month revenue"
          value={formatPrice(totalRevenue)}
          icon={DollarSign}
          accent="emerald"
          delta={delta}
          sub="vs previous month"
        />
        <MetricCard
          label="6-month orders"
          value={totalOrders}
          icon={ShoppingBag}
          accent="blue"
        />
        <MetricCard
          label="Avg order value"
          value={formatPrice(avgOrderValue)}
          icon={Receipt}
          accent="violet"
        />
        <MetricCard
          label="Best month"
          value={bestMonth.revenue > 0 ? bestMonth.short : "—"}
          icon={Trophy}
          accent="amber"
          sub={
            bestMonth.revenue > 0 ? formatPrice(bestMonth.revenue) : "No sales"
          }
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="mb-6 flex items-center gap-2 font-semibold text-slate-900">
          <BarChart3 className="h-4 w-4 text-slate-400" />
          Monthly revenue
        </h3>
        <div
          className="flex items-end justify-between gap-2 sm:gap-4"
          style={{ height: 240 }}
        >
          {monthlyData.map((month) => {
            const heightPercent = (month.revenue / maxRevenue) * 100;
            const isBest =
              month.revenue === bestMonth.revenue && month.revenue > 0;
            return (
              <div
                key={month.label}
                className="group flex flex-1 flex-col items-center gap-2"
              >
                <span className="text-[10px] font-semibold text-slate-600 sm:text-xs">
                  {month.revenue > 0 ? formatPrice(month.revenue) : "—"}
                </span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={`w-full rounded-t-lg bg-gradient-to-t transition-all duration-300 group-hover:opacity-90 ${
                      isBest
                        ? "from-amber-400 to-orange-500"
                        : "from-violet-400 to-indigo-500"
                    }`}
                    style={{
                      height: `${Math.max(heightPercent, month.revenue > 0 ? 4 : 0)}%`,
                      minHeight: month.revenue > 0 ? "8px" : "2px",
                    }}
                    title={`${month.label}: ${formatPrice(month.revenue)}`}
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-500 sm:text-xs">
                  {month.short}
                </span>
                <span className="text-[10px] text-slate-400 sm:text-xs">
                  {month.orders} ord
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80">
              <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Month</th>
                <th className="px-4 py-3">Revenue</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Avg order value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...monthlyData].reverse().map((month) => (
                <tr
                  key={month.label}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {month.label}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatPrice(month.revenue)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{month.orders}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {month.orders > 0
                      ? formatPrice(month.revenue / month.orders)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
