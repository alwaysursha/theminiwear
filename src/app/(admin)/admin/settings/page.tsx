import { Store, Tag } from "lucide-react";
import { getSiteSaleSettings, getStoreInfo } from "@/lib/settings";
import { updateSiteWideSale, updateStoreInfo } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const dynamic = "force-dynamic";

const CURRENCIES = ["USD", "CAD", "EUR", "GBP", "AUD"];

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Vancouver",
  "America/Sao_Paulo",
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default async function AdminSettingsPage() {
  const [siteSale, store] = await Promise.all([
    getSiteSaleSettings(),
    getStoreInfo(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Settings
        </h2>
        <p className="text-sm text-slate-500">Store configuration</p>
      </div>

      {/* Site-wide sale */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start gap-3 border-b border-slate-100 bg-gradient-to-br from-rose-50 to-pink-50 p-4 sm:p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Site-wide sale</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Apply a discount to every product at once. Individual product sales
              and variant sale prices still apply — customers always get the best
              price.
            </p>
          </div>
        </div>
        <form
          action={updateSiteWideSale}
          className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6"
        >
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 sm:col-span-2">
            <input
              type="checkbox"
              name="siteWideSaleEnabled"
              defaultChecked={siteSale.enabled}
              className="h-4 w-4 rounded border-slate-300"
            />
            <span className="text-sm font-medium text-slate-700">
              Enable site-wide sale
            </span>
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
              className="rounded-lg border-slate-200"
            />
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              className="rounded-lg bg-slate-900 text-white hover:bg-slate-800"
            >
              Save sale settings
            </Button>
          </div>
        </form>
      </div>

      {/* Store information (editable) */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start gap-3 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 sm:p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Store information</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              These details power your site metadata (title, description),
              footer, and WhatsApp chat button.
            </p>
          </div>
        </div>
        <form
          action={updateStoreInfo}
          className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6"
        >
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Store name</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={store.name}
              className="rounded-lg border-slate-200"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={store.description}
              className="rounded-lg border-slate-200"
            />
            <p className="text-xs text-slate-400">
              Used as the default meta description for SEO and social sharing.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              name="currency"
              defaultValue={store.currency}
              className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <select
              id="timezone"
              name="timezone"
              defaultValue={store.timezone}
              className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              {(TIMEZONES.includes(store.timezone)
                ? TIMEZONES
                : [store.timezone, ...TIMEZONES]
              ).map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-2 border-t border-slate-100 pt-4 sm:col-span-2">
            <p className="text-sm font-semibold text-slate-700">
              WhatsApp chat
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsappE164">WhatsApp number (digits only)</Label>
            <Input
              id="whatsappE164"
              name="whatsappE164"
              inputMode="numeric"
              defaultValue={store.whatsappE164}
              placeholder="16476295666"
              className="rounded-lg border-slate-200"
            />
            <p className="text-xs text-slate-400">
              Country code + number, no +, spaces or dashes.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsappDisplay">Display number</Label>
            <Input
              id="whatsappDisplay"
              name="whatsappDisplay"
              defaultValue={store.whatsappDisplay}
              placeholder="+1 (647) 629 5666"
              className="rounded-lg border-slate-200"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="whatsappIntro">Chat intro message</Label>
            <Input
              id="whatsappIntro"
              name="whatsappIntro"
              defaultValue={store.whatsappIntro}
              placeholder="Hi, I have a question!"
              className="rounded-lg border-slate-200"
            />
          </div>

          <div className="flex justify-end sm:col-span-2">
            <Button
              type="submit"
              className="rounded-lg bg-slate-900 text-white hover:bg-slate-800"
            >
              Save store information
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
