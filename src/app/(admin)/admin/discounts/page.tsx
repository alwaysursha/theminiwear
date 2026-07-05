import { DiscountType } from "@prisma/client";
import { CheckCircle2, Repeat, Tag, TimerOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSiteSaleSettings } from "@/lib/settings";
import { MetricCard } from "@/components/admin/dashboard/MetricCard";
import { SiteWideSalePanel } from "@/components/admin/discounts/SiteWideSalePanel";
import { CreateDiscountForm } from "@/components/admin/discounts/CreateDiscountForm";
import {
  DiscountsManager,
  type AdminDiscountRow,
  type DiscountTypeValue,
} from "@/components/admin/discounts/DiscountsManager";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  const [discounts, siteSale] = await Promise.all([
    prisma.discount.findMany({
      orderBy: { createdAt: "desc" },
    }),
    getSiteSaleSettings(),
  ]);

  const now = new Date();
  const rows: AdminDiscountRow[] = discounts.map((d) => ({
    id: d.id,
    code: d.code,
    type: d.type as DiscountTypeValue,
    value: Number(d.value),
    minOrderAmount: d.minOrderAmount ? Number(d.minOrderAmount) : null,
    maxUses: d.maxUses,
    usedCount: d.usedCount,
    expiresAt: d.expiresAt ? d.expiresAt.toISOString() : null,
    expired: d.expiresAt != null && d.expiresAt < now,
    isActive: d.isActive,
    createdAt: d.createdAt.toISOString(),
  }));

  const stats = {
    total: rows.length,
    active: rows.filter((r) => r.isActive && !r.expired).length,
    expired: rows.filter((r) => r.expired).length,
    redemptions: rows.reduce((sum, r) => sum + r.usedCount, 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Discounts
        </h2>
        <p className="text-sm text-slate-500">
          Promo codes and site-wide sales
        </p>
      </div>

      <SiteWideSalePanel siteSale={siteSale} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        <MetricCard
          label="Total codes"
          value={stats.total}
          icon={Tag}
          accent="blue"
        />
        <MetricCard
          label="Active"
          value={stats.active}
          icon={CheckCircle2}
          accent="emerald"
        />
        <MetricCard
          label="Expired"
          value={stats.expired}
          icon={TimerOff}
          accent="rose"
        />
        <MetricCard
          label="Redemptions"
          value={stats.redemptions}
          icon={Repeat}
          accent="violet"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="mb-4 font-semibold text-slate-900">
          Create discount code
        </h3>
        <CreateDiscountForm />
      </div>

      <DiscountsManager discounts={rows} />
    </div>
  );
}
