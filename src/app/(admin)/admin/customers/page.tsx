import Link from "next/link";
import { formatDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { DataTable } from "@/components/admin/DataTable";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "USER" },
    include: {
      _count: { select: { orders: true, notes: true } },
      orders: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { total: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const customersWithSpend = await Promise.all(
    customers.map(async (customer) => {
      const spend = await prisma.order.aggregate({
        where: { userId: customer.id },
        _sum: { total: true },
      });
      return { ...customer, totalSpend: Number(spend._sum.total ?? 0) };
    }),
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Customers</h2>
        <p className="text-sm text-slate-500">Customer relationship management</p>
      </div>

      <DataTable
        data={customersWithSpend}
        getRowKey={(customer) => customer.id}
        columns={[
          {
            key: "name",
            header: "Customer",
            render: (customer) => (
              <Link
                href={`/admin/customers/${customer.id}`}
                className="font-medium text-slate-900 hover:underline"
              >
                {customer.name ?? "—"}
              </Link>
            ),
          },
          {
            key: "email",
            header: "Email",
            render: (customer) => customer.email,
          },
          {
            key: "orders",
            header: "Orders",
            render: (customer) => customer._count.orders,
          },
          {
            key: "totalSpend",
            header: "Total spend",
            render: (customer) => formatPrice(customer.totalSpend),
          },
          {
            key: "notes",
            header: "Notes",
            render: (customer) => customer._count.notes,
          },
          {
            key: "joined",
            header: "Joined",
            render: (customer) => formatDate(customer.createdAt, "MMM d, yyyy"),
          },
        ]}
      />
    </div>
  );
}
