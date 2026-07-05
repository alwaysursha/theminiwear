import { Package, PackageCheck, PackageX, Timer } from "lucide-react";
import { ReturnStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/admin/dashboard/MetricCard";
import {
  ReturnsManager,
  type AdminReturnRow,
} from "@/components/admin/returns/ReturnsManager";

export const dynamic = "force-dynamic";

export default async function AdminReturnsPage() {
  const returns = await prisma.returnRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        include: { user: true },
      },
    },
  });

  const rows: AdminReturnRow[] = returns.map((row) => ({
    id: row.id,
    orderId: row.orderId,
    orderNumber: row.order.orderNumber,
    customerLabel:
      row.order.user?.name ??
      row.order.user?.email ??
      row.order.guestEmail ??
      "Unknown",
    reason: row.reason,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  }));

  const stats = {
    total: rows.length,
    requested: rows.filter((r) => r.status === ReturnStatus.REQUESTED).length,
    approved: rows.filter((r) => r.status === ReturnStatus.APPROVED).length,
    completed: rows.filter((r) => r.status === ReturnStatus.COMPLETED).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Returns
        </h2>
        <p className="text-sm text-slate-500">
          Review and process customer return requests
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          label="Total requests"
          value={stats.total}
          icon={Package}
          accent="blue"
        />
        <MetricCard
          label="Awaiting review"
          value={stats.requested}
          icon={Timer}
          accent="amber"
        />
        <MetricCard
          label="Approved"
          value={stats.approved}
          icon={PackageCheck}
          accent="violet"
        />
        <MetricCard
          label="Completed"
          value={stats.completed}
          icon={PackageX}
          accent="emerald"
        />
      </div>

      <ReturnsManager returns={rows} />
    </div>
  );
}
