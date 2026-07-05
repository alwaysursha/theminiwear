"use client";

import { Tag } from "lucide-react";
import type { SiteSaleSettings } from "@/lib/settings";
import { updateSiteWideSale } from "@/lib/actions/settings";
import { initialAdminSaveState } from "@/lib/admin-form-state";
import { AdminSaveButton } from "@/components/admin/AdminSaveButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSaveForm } from "@/hooks/useAdminSaveForm";

export function SiteWideSalePanel({
  siteSale,
}: {
  siteSale: SiteSaleSettings;
}) {
  const { state, formAction, pending, saved, markDirty } = useAdminSaveForm(
    updateSiteWideSale,
    initialAdminSaveState,
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 bg-gradient-to-br from-rose-50 to-pink-50 p-4 sm:p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
          <Tag className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Site-wide sale</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            Applies an extra discount on top of product sales. Shows a red
            announcement banner below the main ticker when enabled.
          </p>
        </div>
      </div>
      <form
        action={formAction}
        className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6"
      >
        {state.error && (
          <p
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2"
          >
            {state.error}
          </p>
        )}
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 sm:col-span-2">
          <input
            type="checkbox"
            name="siteWideSaleEnabled"
            defaultChecked={siteSale.enabled}
            className="h-4 w-4 rounded border-slate-300"
            onChange={markDirty}
          />
          <span className="text-sm font-medium text-slate-700">
            Enable site-wide sale
          </span>
        </label>
        <div className="space-y-2">
          <Label htmlFor="siteWideSalePercent">Extra discount %</Label>
          <Input
            id="siteWideSalePercent"
            name="siteWideSalePercent"
            type="number"
            min={0}
            max={100}
            defaultValue={siteSale.percent || 15}
            className="rounded-lg border-slate-200"
            onChange={markDirty}
          />
        </div>
        <div className="flex items-end">
          <AdminSaveButton
            pending={pending}
            saved={saved}
            label="Save site-wide sale"
            savingLabel="Saving sale"
            savedLabel="Sale saved"
            className="rounded-lg"
          />
        </div>
      </form>
    </div>
  );
}
