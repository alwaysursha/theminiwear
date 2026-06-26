import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { getSiteSaleSettings } from "@/lib/settings";
import { updateSiteWideSale } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const siteSale = await getSiteSaleSettings();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500">Site configuration</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-1 font-semibold text-slate-900">Site-wide sale</h3>
        <p className="mb-4 text-sm text-slate-500">
          Apply a discount to every product at once. Individual product sales and
          variant sale prices still apply — customers get the best price.
        </p>
        <form action={updateSiteWideSale} className="grid gap-4 md:grid-cols-3">
          <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-3">
            <input
              type="checkbox"
              name="siteWideSaleEnabled"
              defaultChecked={siteSale.enabled}
              className="rounded border-slate-300"
            />
            Enable site-wide sale
          </label>
          <div className="space-y-2">
            <Label htmlFor="siteWideSalePercent">Discount %</Label>
            <Input
              id="siteWideSalePercent"
              name="siteWideSalePercent"
              type="number"
              min={0}
              max={100}
              defaultValue={siteSale.percent || 15}
              className="rounded-md border-slate-200"
            />
          </div>
          <div className="flex items-end md:col-span-2">
            <Button
              type="submit"
              className="rounded-md bg-slate-900 text-white hover:bg-slate-800"
            >
              Save sale settings
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-900">Store information</h3>
        <dl className="space-y-4 text-sm">
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <dt className="text-slate-500">Store name</dt>
            <dd className="font-medium text-slate-900">{SITE_NAME}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <dt className="text-slate-500">Description</dt>
            <dd className="max-w-md text-right font-medium text-slate-900">
              {SITE_DESCRIPTION}
            </dd>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <dt className="text-slate-500">Currency</dt>
            <dd className="font-medium text-slate-900">USD</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Timezone</dt>
            <dd className="font-medium text-slate-900">America/New_York</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
