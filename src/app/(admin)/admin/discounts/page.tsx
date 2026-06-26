import { format } from "date-fns";
import { DiscountType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/admin/DataTable";
import {
  createDiscount,
  deleteDiscount,
  toggleDiscountActive,
} from "@/lib/actions/discounts";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  const discounts = await prisma.discount.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Discounts</h2>
        <p className="text-sm text-slate-500">Manage discount codes</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-900">Create discount</h3>
        <form action={createDiscount} className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              name="code"
              required
              placeholder="SUMMER20"
              className="rounded-md border-slate-200 uppercase"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              name="type"
              className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
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
              className="rounded-md border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minOrderAmount">Min order amount</Label>
            <Input
              id="minOrderAmount"
              name="minOrderAmount"
              type="number"
              step="0.01"
              className="rounded-md border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxUses">Max uses</Label>
            <Input
              id="maxUses"
              name="maxUses"
              type="number"
              className="rounded-md border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expires at</Label>
            <Input
              id="expiresAt"
              name="expiresAt"
              type="datetime-local"
              className="rounded-md border-slate-200"
            />
          </div>
          <div className="flex items-end gap-4 md:col-span-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked
                className="rounded border-slate-300"
              />
              Active
            </label>
            <Button
              type="submit"
              className="rounded-md bg-slate-900 text-white hover:bg-slate-800"
            >
              Create discount
            </Button>
          </div>
        </form>
      </div>

      <DataTable
        data={discounts}
        getRowKey={(discount) => discount.id}
        columns={[
          {
            key: "code",
            header: "Code",
            render: (discount) => (
              <span className="font-mono font-medium text-slate-900">
                {discount.code}
              </span>
            ),
          },
          {
            key: "type",
            header: "Type",
            render: (discount) => discount.type.replace("_", " "),
          },
          {
            key: "value",
            header: "Value",
            render: (discount) =>
              discount.type === DiscountType.PERCENTAGE
                ? `${discount.value}%`
                : discount.type === DiscountType.FREE_SHIPPING
                  ? "Free shipping"
                  : formatPrice(Number(discount.value)),
          },
          {
            key: "usage",
            header: "Usage",
            render: (discount) =>
              `${discount.usedCount}${discount.maxUses ? ` / ${discount.maxUses}` : ""}`,
          },
          {
            key: "expiresAt",
            header: "Expires",
            render: (discount) =>
              discount.expiresAt
                ? format(discount.expiresAt, "MMM d, yyyy")
                : "—",
          },
          {
            key: "status",
            header: "Status",
            render: (discount) => (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  discount.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {discount.isActive ? "Active" : "Inactive"}
              </span>
            ),
          },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (discount) => {
              const boundToggle = toggleDiscountActive.bind(
                null,
                discount.id,
                !discount.isActive,
              );
              const boundDelete = deleteDiscount.bind(null, discount.id);

              return (
                <div className="flex justify-end gap-2">
                  <form action={boundToggle}>
                    <button
                      type="submit"
                      className="text-sm font-medium text-slate-700 hover:text-slate-900"
                    >
                      {discount.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                  <form action={boundDelete}>
                    <button
                      type="submit"
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              );
            },
          },
        ]}
      />
    </div>
  );
}
