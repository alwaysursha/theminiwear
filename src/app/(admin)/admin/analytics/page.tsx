import { formatDate, subMonths, startOfMonth, endOfMonth } from "@/lib/date";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(now, 5 - i);
    return {
      label: formatDate(date, "MMM yyyy"),
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
          where: {
            createdAt: { gte: month.start, lte: month.end },
          },
        }),
      ]);

      return {
        label: month.label,
        revenue: Number(revenue._sum.total ?? 0),
        orders,
      };
    }),
  );

  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue), 1);
  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
  const totalOrders = monthlyData.reduce((sum, m) => sum + m.orders, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Analytics</h2>
        <p className="text-sm text-slate-500">
          Revenue trends over the last 6 months
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">6-month revenue</p>
          <p className="text-3xl font-semibold text-slate-900">
            {formatPrice(totalRevenue)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">6-month orders</p>
          <p className="text-3xl font-semibold text-slate-900">{totalOrders}</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 font-semibold text-slate-900">Monthly revenue</h3>
        <div className="flex items-end justify-between gap-4" style={{ height: 240 }}>
          {monthlyData.map((month) => {
            const heightPercent = (month.revenue / maxRevenue) * 100;
            return (
              <div
                key={month.label}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <span className="text-xs font-medium text-slate-600">
                  {month.revenue > 0 ? formatPrice(month.revenue) : "—"}
                </span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-slate-800 transition-all"
                    style={{
                      height: `${Math.max(heightPercent, month.revenue > 0 ? 4 : 0)}%`,
                      minHeight: month.revenue > 0 ? "8px" : "2px",
                    }}
                    title={`${month.label}: ${formatPrice(month.revenue)}`}
                  />
                </div>
                <span className="text-xs text-slate-500">{month.label}</span>
                <span className="text-xs text-slate-400">
                  {month.orders} orders
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600">Month</th>
              <th className="px-4 py-3 font-medium text-slate-600">Revenue</th>
              <th className="px-4 py-3 font-medium text-slate-600">Orders</th>
              <th className="px-4 py-3 font-medium text-slate-600">
                Avg order value
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {monthlyData.map((month) => (
              <tr key={month.label}>
                <td className="px-4 py-3 text-slate-900">{month.label}</td>
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
  );
}
