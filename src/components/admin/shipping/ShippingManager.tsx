"use client";

import { Globe, Layers, Plus, Truck } from "lucide-react";
import {
  createShippingRate,
  createShippingZone,
  deleteShippingRate,
  deleteShippingZone,
  updateShippingRate,
  updateShippingZone,
} from "@/lib/actions/shipping";
import { initialAdminSaveState } from "@/lib/admin-form-state";
import { formatPrice } from "@/lib/utils";
import { AdminSaveButton } from "@/components/admin/AdminSaveButton";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { MetricCard } from "@/components/admin/dashboard/MetricCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSaveForm } from "@/hooks/useAdminSaveForm";

type ShippingRateRow = {
  id: string;
  name: string;
  price: number | string;
  minOrder: number | string | null;
  maxOrder: number | string | null;
  estimatedDays: string | null;
};

type ShippingZoneRow = {
  id: string;
  name: string;
  countries: string[];
  isActive: boolean;
  rates: ShippingRateRow[];
};

function AddZoneForm() {
  const { state, formAction, pending, saved, markDirty } = useAdminSaveForm(
    createShippingZone,
    initialAdminSaveState,
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
        <Label htmlFor="zone-name">Zone name</Label>
        <Input
          id="zone-name"
          name="name"
          required
          placeholder="Domestic US"
          className="rounded-lg border-slate-200"
          onChange={markDirty}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="countries">Countries (comma-separated)</Label>
        <Input
          id="countries"
          name="countries"
          required
          placeholder="US, CA"
          className="rounded-lg border-slate-200"
          onChange={markDirty}
        />
      </div>
      <div className="flex items-end justify-between gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked
            className="rounded border-slate-300"
            onChange={markDirty}
          />
          Active
        </label>
        <AdminSaveButton
          pending={pending}
          saved={saved}
          label="Add zone"
          savingLabel="Adding zone"
          savedLabel="Zone added"
          className="rounded-lg"
        />
      </div>
    </form>
  );
}

function ZoneForm({ zone }: { zone: ShippingZoneRow }) {
  const { state, formAction, pending, saved, markDirty } = useAdminSaveForm(
    updateShippingZone,
    initialAdminSaveState,
  );
  const boundDeleteZone = deleteShippingZone.bind(null, zone.id);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-slate-900">{zone.name}</h3>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              zone.isActive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {zone.isActive ? "Active" : "Inactive"}
          </span>
          {zone.countries.map((country) => (
            <span
              key={country}
              className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600"
            >
              {country}
            </span>
          ))}
        </div>
        <ConfirmSubmitButton
          action={boundDeleteZone}
          triggerLabel="Delete zone"
          triggerClassName="text-sm font-semibold text-rose-600 hover:text-rose-700"
          title="Delete shipping zone?"
          confirmLabel="Delete zone"
          description={
            <>
              The zone{" "}
              <span className="font-semibold text-slate-900">{zone.name}</span>{" "}
              and its {zone.rates.length} rate
              {zone.rates.length === 1 ? "" : "s"} will be permanently removed.
              This can&apos;t be undone.
            </>
          }
        />
      </div>
      <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <input type="hidden" name="zoneId" value={zone.id} />
        {state.error && (
          <p
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2 lg:col-span-3"
          >
            {state.error}
          </p>
        )}
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            name="name"
            defaultValue={zone.name}
            className="rounded-lg border-slate-200"
            onChange={markDirty}
          />
        </div>
        <div className="space-y-2">
          <Label>Countries</Label>
          <Input
            name="countries"
            defaultValue={zone.countries.join(", ")}
            className="rounded-lg border-slate-200"
            onChange={markDirty}
          />
        </div>
        <div className="flex items-end justify-between gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={zone.isActive}
              className="rounded border-slate-300"
              onChange={markDirty}
            />
            Active
          </label>
          <AdminSaveButton
            pending={pending}
            saved={saved}
            label="Save zone"
            savingLabel="Saving zone"
            savedLabel="Zone saved"
            size="sm"
            className="rounded-lg"
          />
        </div>
      </form>
    </>
  );
}

function RateForm({ rate }: { rate: ShippingRateRow }) {
  const { state, formAction, pending, saved, markDirty } = useAdminSaveForm(
    updateShippingRate,
    initialAdminSaveState,
  );
  const boundDeleteRate = deleteShippingRate.bind(null, rate.id);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
      <form action={formAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input type="hidden" name="rateId" value={rate.id} />
        {state.error && (
          <p
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2 lg:col-span-5"
          >
            {state.error}
          </p>
        )}
        <div className="space-y-1">
          <Label className="text-xs">Name</Label>
          <Input
            name="name"
            defaultValue={rate.name}
            className="rounded-lg border-slate-200"
            onChange={markDirty}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Price</Label>
          <Input
            name="price"
            type="number"
            step="0.01"
            defaultValue={String(rate.price)}
            className="rounded-lg border-slate-200"
            onChange={markDirty}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Min order</Label>
          <Input
            name="minOrder"
            type="number"
            step="0.01"
            defaultValue={rate.minOrder ? String(rate.minOrder) : ""}
            placeholder="—"
            className="rounded-lg border-slate-200"
            onChange={markDirty}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Max order</Label>
          <Input
            name="maxOrder"
            type="number"
            step="0.01"
            defaultValue={rate.maxOrder ? String(rate.maxOrder) : ""}
            placeholder="—"
            className="rounded-lg border-slate-200"
            onChange={markDirty}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Est. days</Label>
          <Input
            name="estimatedDays"
            defaultValue={rate.estimatedDays ?? ""}
            placeholder="3-5 days"
            className="rounded-lg border-slate-200"
            onChange={markDirty}
          />
        </div>
        <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-5">
          <AdminSaveButton
            pending={pending}
            saved={saved}
            label="Save rate"
            savingLabel="Saving rate"
            savedLabel="Rate saved"
            size="sm"
            className="rounded-lg"
          />
        </div>
      </form>
      <div className="mt-2 border-t border-slate-100 pt-2">
        <ConfirmSubmitButton
          action={boundDeleteRate}
          triggerLabel="Delete rate"
          triggerClassName="text-xs font-semibold text-rose-600 hover:text-rose-700"
          title="Delete rate?"
          confirmLabel="Delete rate"
          description={
            <>
              The rate{" "}
              <span className="font-semibold text-slate-900">{rate.name}</span>{" "}
              ({formatPrice(Number(rate.price))}) will be permanently removed.
            </>
          }
        />
      </div>
    </div>
  );
}

function AddRateForm({ zoneId }: { zoneId: string }) {
  const { state, formAction, pending, saved, markDirty } = useAdminSaveForm(
    createShippingRate,
    initialAdminSaveState,
  );

  return (
    <form
      action={formAction}
      className="grid gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-3 sm:grid-cols-2 lg:grid-cols-6 sm:p-4"
    >
      <input type="hidden" name="zoneId" value={zoneId} />
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2 lg:col-span-6"
        >
          {state.error}
        </p>
      )}
      <Input
        name="name"
        required
        placeholder="Standard"
        className="rounded-lg border-slate-200"
        onChange={markDirty}
      />
      <Input
        name="price"
        type="number"
        step="0.01"
        required
        placeholder="Price"
        className="rounded-lg border-slate-200"
        onChange={markDirty}
      />
      <Input
        name="minOrder"
        type="number"
        step="0.01"
        placeholder="Min order"
        className="rounded-lg border-slate-200"
        onChange={markDirty}
      />
      <Input
        name="maxOrder"
        type="number"
        step="0.01"
        placeholder="Max order"
        className="rounded-lg border-slate-200"
        onChange={markDirty}
      />
      <Input
        name="estimatedDays"
        placeholder="3-5 days"
        className="rounded-lg border-slate-200"
        onChange={markDirty}
      />
      <AdminSaveButton
        pending={pending}
        saved={saved}
        label="Add rate"
        savingLabel="Adding rate"
        savedLabel="Rate added"
        size="sm"
        variant="outline"
        className="rounded-lg border-slate-200"
      />
    </form>
  );
}

export function ShippingManager({ zones }: { zones: ShippingZoneRow[] }) {
  const totalRates = zones.reduce((sum, z) => sum + z.rates.length, 0);
  const activeZones = zones.filter((z) => z.isActive).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Shipping
        </h2>
        <p className="text-sm text-slate-500">
          Manage shipping zones and their rates
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Zones" value={zones.length} icon={Globe} accent="blue" />
        <MetricCard
          label="Active zones"
          value={activeZones}
          icon={Truck}
          accent="emerald"
        />
        <MetricCard
          label="Total rates"
          value={totalRates}
          icon={Layers}
          accent="violet"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
          <Plus className="h-4 w-4 text-slate-400" />
          Add shipping zone
        </h3>
        <AddZoneForm />
      </div>

      <div className="space-y-5">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 p-4 sm:p-6">
              <ZoneForm zone={zone} />
            </div>
            <div className="bg-slate-50/50 p-4 sm:p-6">
              <h4 className="mb-3 text-sm font-semibold text-slate-700">Rates</h4>
              {zone.rates.length > 0 ? (
                <div className="mb-5 space-y-3">
                  {zone.rates.map((rate) => (
                    <RateForm
                      key={`${rate.id}-${rate.minOrder ?? "none"}-${rate.price}`}
                      rate={rate}
                    />
                  ))}
                </div>
              ) : (
                <p className="mb-5 text-sm text-slate-500">No rates yet.</p>
              )}
              <AddRateForm zoneId={zone.id} />
            </div>
          </div>
        ))}

        {zones.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <Truck className="h-10 w-10 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-900">
              No shipping zones yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Add your first zone above to start charging shipping.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
