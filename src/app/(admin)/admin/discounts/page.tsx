import { DiscountType } from "@prisma/client";
import { CheckCircle2, Repeat, Tag, TimerOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MetricCard } from "@/components/admin/dashboard/MetricCard";
import { createDiscount } from "@/lib/actions/discounts";
import {
  DiscountsManager,
  type AdminDiscountRow,
  type DiscountTypeValue,
} from "@/components/admin/discounts/DiscountsManager";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  const discounts = await prisma.discount.findMany({
    orderBy: { createdAt: "desc" },
  });

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
          Create and manage promo codes
        </p>
      </div>

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
        <form
          action={createDiscount}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              name="code"
              required
              placeholder="SUMMER20"
              className="rounded-lg border-slate-200 uppercase"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              name="type"
              className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              {Object.values(DiscountType).map((t) => (
                <option key={t} value={t}>
                  {t.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              name="value"
              type="number"
              step="0.01"
              required
              placeholder="20"
              className="rounded-lg border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minOrderAmount">Min order amount</Label>
            <Input
              id="minOrderAmount"
              name="minOrderAmount"
              type="number"
              step="0.01"
              className="rounded-lg border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxUses">Max uses</Label>
            <Input
              id="maxUses"
              name="maxUses"
              type="number"
              className="rounded-lg border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expires at</Label>
            <Input
              id="expiresAt"
              name="expiresAt"
              type="datetime-local"
              className="rounded-lg border-slate-200"
            />
          </div>
          <div className="flex items-center justify-between gap-4 sm:col-span-2 lg:col-span-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked
                className="rounded border-slate-300"
              />
              Active immediately
            </label>
            <Button
              type="submit"
              className="rounded-lg bg-slate-900 text-white hover:bg-slate-800"
            >
              Create discount
            </Button>
          </div>
        </form>
      </div>

      <DiscountsManager discounts={rows} />
    </div>
  );
}
