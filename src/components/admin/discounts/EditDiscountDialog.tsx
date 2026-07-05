"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import {
  updateDiscount,
  type DiscountFormState,
} from "@/lib/actions/discounts";
import { AdminSaveButton } from "@/components/admin/AdminSaveButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSaveForm } from "@/hooks/useAdminSaveForm";
import type { AdminDiscountRow, DiscountTypeValue } from "./DiscountsManager";

export function EditDiscountDialog({ discount }: { discount: AdminDiscountRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { state, formAction, pending, saved, markDirty } = useAdminSaveForm(
    updateDiscount,
    {} as DiscountFormState,
  );

  useEffect(() => {
    if (state.ok && !pending) {
      router.refresh();
      setOpen(false);
    }
  }, [state.ok, pending, router]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Edit discount"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        <Pencil className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={() => !pending && setOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            Edit {discount.code}
          </h3>
          <button
            type="button"
            onClick={() => !pending && setOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form action={formAction} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="discountId" value={discount.id} />
          {state.error && (
            <p
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2"
            >
              {state.error}
            </p>
          )}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`code-${discount.id}`}>Code</Label>
            <Input
              id={`code-${discount.id}`}
              name="code"
              required
              defaultValue={discount.code}
              className="rounded-lg border-slate-200 uppercase"
              onChange={markDirty}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`type-${discount.id}`}>Type</Label>
            <select
              id={`type-${discount.id}`}
              name="type"
              defaultValue={discount.type}
              className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              onChange={markDirty}
            >
              {(["PERCENTAGE", "FIXED", "FREE_SHIPPING"] as DiscountTypeValue[]).map(
                (type) => (
                  <option key={type} value={type}>
                    {type.replace("_", " ")}
                  </option>
                ),
              )}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`value-${discount.id}`}>Value</Label>
            <Input
              id={`value-${discount.id}`}
              name="value"
              type="number"
              step="0.01"
              required
              defaultValue={discount.value}
              className="rounded-lg border-slate-200"
              onChange={markDirty}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`min-${discount.id}`}>Min order amount</Label>
            <Input
              id={`min-${discount.id}`}
              name="minOrderAmount"
              type="number"
              step="0.01"
              defaultValue={discount.minOrderAmount ?? ""}
              className="rounded-lg border-slate-200"
              onChange={markDirty}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`max-${discount.id}`}>Max uses</Label>
            <Input
              id={`max-${discount.id}`}
              name="maxUses"
              type="number"
              defaultValue={discount.maxUses ?? ""}
              className="rounded-lg border-slate-200"
              onChange={markDirty}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`expires-${discount.id}`}>Expires at</Label>
            <Input
              id={`expires-${discount.id}`}
              name="expiresAt"
              type="datetime-local"
              defaultValue={
                discount.expiresAt ? discount.expiresAt.slice(0, 16) : ""
              }
              className="rounded-lg border-slate-200"
              onChange={markDirty}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={discount.isActive}
              className="rounded border-slate-300"
              onChange={markDirty}
            />
            Active
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <AdminSaveButton
              pending={pending}
              saved={saved}
              label="Save changes"
              savingLabel="Saving"
              savedLabel="Saved"
              className="rounded-lg"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
