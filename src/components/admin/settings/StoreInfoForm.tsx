"use client";

import type { StoreInfo } from "@/lib/settings";
import { updateStoreInfo } from "@/lib/actions/settings";
import { initialAdminSaveState } from "@/lib/admin-form-state";
import { AdminSaveButton } from "@/components/admin/AdminSaveButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminSaveForm } from "@/hooks/useAdminSaveForm";

const CURRENCIES = ["CAD", "USD", "EUR", "GBP", "AUD"];

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

export function StoreInfoForm({ store }: { store: StoreInfo }) {
  const { state, formAction, pending, saved, markDirty } = useAdminSaveForm(
    updateStoreInfo,
    initialAdminSaveState,
  );

  return (
    <form action={formAction} className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2"
        >
          {state.error}
        </p>
      )}
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="name">Store name</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={store.name}
          className="rounded-lg border-slate-200"
          onChange={markDirty}
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
          onChange={markDirty}
        />
        <p className="text-xs text-slate-400">
          Shown in the site footer and used as the default meta description for
          SEO and social sharing.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <select
          id="currency"
          name="currency"
          defaultValue={store.currency}
          className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
          onChange={markDirty}
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
          onChange={markDirty}
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
        <p className="text-sm font-semibold text-slate-700">WhatsApp chat</p>
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
          onChange={markDirty}
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
          onChange={markDirty}
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
          onChange={markDirty}
        />
      </div>

      <div className="flex justify-end sm:col-span-2">
        <AdminSaveButton
          pending={pending}
          saved={saved}
          label="Save store information"
          savingLabel="Saving store"
          savedLabel="Store saved"
          className="rounded-lg"
        />
      </div>
    </form>
  );
}
