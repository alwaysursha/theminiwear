"use client";

import { useActionState } from "react";
import { DiscountType } from "@prisma/client";
import {
  createDiscount,
  type DiscountFormState,
} from "@/lib/actions/discounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: DiscountFormState = {};

export function CreateDiscountForm() {
  const [state, formAction, pending] = useActionState(
    createDiscount,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2 lg:col-span-3"
        >
          {state.error}
        </p>
      )}
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
          disabled={pending}
          className="rounded-lg bg-slate-900 text-white hover:bg-slate-800"
        >
          {pending ? "Creating…" : "Create discount"}
        </Button>
      </div>
    </form>
  );
}
