"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { updateDiscount } from "@/lib/actions/discounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminDiscountRow, DiscountTypeValue } from "./DiscountsManager";

export function EditDiscountDialog({ discount }: { discount: AdminDiscountRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const boundUpdate = updateDiscount.bind(null, discount.id);

  function handleSubmit(formData: FormData) {
    startTransition(() => {
      boundUpdate(formData)
        .then(() => {
          router.refresh();
          setOpen(false);
        })
        .catch(() => setOpen(false));
    });
  }

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
        onClick={() => !isPending && setOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            Edit {discount.code}
          </h3>
          <button
            type="button"
            onClick={() => !isPending && setOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form action={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`code-${discount.id}`}>Code</Label>
            <Input
              id={`code-${discount.id}`}
              name="code"
              required
              defaultValue={discount.code}
              className="rounded-lg border-slate-200 uppercase"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`type-${discount.id}`}>Type</Label>
            <select
              id={`type-${discount.id}`}
              name="type"
              defaultValue={discount.type}
              className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
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
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`expires-${discount.id}`}>Expires at</Label>
            <Input
              id={`expires-${discount.id}`}
              name="expiresAt"
              type="datetime-local"
              defaultValue={
                discount.expiresAt
                  ? discount.expiresAt.slice(0, 16)
                  : ""
              }
              className="rounded-lg border-slate-200"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={discount.isActive}
              className="rounded border-slate-300"
            />
            Active
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-slate-900 text-white hover:bg-slate-800"
            >
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
