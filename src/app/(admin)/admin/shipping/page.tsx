import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createShippingRate,
  createShippingZone,
  deleteShippingRate,
  deleteShippingZone,
  updateShippingRate,
  updateShippingZone,
} from "@/lib/actions/shipping";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  const zones = await prisma.shippingZone.findMany({
    include: { rates: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Shipping</h2>
        <p className="text-sm text-slate-500">
          Manage shipping zones and rates
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-900">Add shipping zone</h3>
        <form action={createShippingZone} className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="zone-name">Zone name</Label>
            <Input
              id="zone-name"
              name="name"
              required
              placeholder="Domestic US"
              className="rounded-md border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="countries">Countries (comma-separated)</Label>
            <Input
              id="countries"
              name="countries"
              required
              placeholder="US, CA"
              className="rounded-md border-slate-200"
            />
          </div>
          <div className="flex items-end gap-4">
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
              Add zone
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        {zones.map((zone) => {
          const boundUpdateZone = updateShippingZone.bind(null, zone.id);
          const boundDeleteZone = deleteShippingZone.bind(null, zone.id);
          const boundCreateRate = createShippingRate.bind(null, zone.id);

          return (
            <div
              key={zone.id}
              className="rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 p-6">
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="font-semibold text-slate-900">{zone.name}</h3>
                  <form action={boundDeleteZone}>
                    <button
                      type="submit"
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Delete zone
                    </button>
                  </form>
                </div>
                <form action={boundUpdateZone} className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      name="name"
                      defaultValue={zone.name}
                      className="rounded-md border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Countries</Label>
                    <Input
                      name="countries"
                      defaultValue={zone.countries.join(", ")}
                      className="rounded-md border-slate-200"
                    />
                  </div>
                  <div className="flex items-end gap-4">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        name="isActive"
                        defaultChecked={zone.isActive}
                        className="rounded border-slate-300"
                      />
                      Active
                    </label>
                    <Button
                      type="submit"
                      size="sm"
                      className="rounded-md bg-slate-900 text-white hover:bg-slate-800"
                    >
                      Save zone
                    </Button>
                  </div>
                </form>
              </div>

              <div className="p-6">
                <h4 className="mb-4 text-sm font-semibold text-slate-700">
                  Rates
                </h4>
                {zone.rates.length > 0 ? (
                  <div className="mb-6 space-y-3">
                    {zone.rates.map((rate) => {
                      const boundUpdateRate = updateShippingRate.bind(
                        null,
                        rate.id,
                      );
                      const boundDeleteRate = deleteShippingRate.bind(
                        null,
                        rate.id,
                      );

                      return (
                        <div
                          key={rate.id}
                          className="flex flex-wrap items-center gap-3 rounded-md border border-slate-100 bg-slate-50 p-4"
                        >
                          <form
                            action={boundUpdateRate}
                            className="grid flex-1 gap-3 md:grid-cols-5"
                          >
                            <Input
                              name="name"
                              defaultValue={rate.name}
                              className="rounded-md border-slate-200"
                            />
                            <Input
                              name="price"
                              type="number"
                              step="0.01"
                              defaultValue={String(rate.price)}
                              className="rounded-md border-slate-200"
                            />
                            <Input
                              name="minOrder"
                              type="number"
                              step="0.01"
                              defaultValue={
                                rate.minOrder ? String(rate.minOrder) : ""
                              }
                              placeholder="Min order"
                              className="rounded-md border-slate-200"
                            />
                            <Input
                              name="maxOrder"
                              type="number"
                              step="0.01"
                              defaultValue={
                                rate.maxOrder ? String(rate.maxOrder) : ""
                              }
                              placeholder="Max order"
                              className="rounded-md border-slate-200"
                            />
                            <Input
                              name="estimatedDays"
                              defaultValue={rate.estimatedDays ?? ""}
                              placeholder="3-5 days"
                              className="rounded-md border-slate-200"
                            />
                            <Button
                              type="submit"
                              size="sm"
                              className="rounded-md bg-slate-900 text-white hover:bg-slate-800 md:col-span-5 md:w-fit"
                            >
                              Save rate
                            </Button>
                          </form>
                          <form action={boundDeleteRate}>
                            <Button
                              type="submit"
                              size="sm"
                              variant="destructive"
                              className="rounded-md"
                            >
                              Delete
                            </Button>
                          </form>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mb-4 text-sm text-slate-500">No rates yet.</p>
                )}

                <form
                  action={boundCreateRate}
                  className="grid gap-3 rounded-md border border-dashed border-slate-200 p-4 md:grid-cols-6"
                >
                  <Input
                    name="name"
                    required
                    placeholder="Standard"
                    className="rounded-md border-slate-200"
                  />
                  <Input
                    name="price"
                    type="number"
                    step="0.01"
                    required
                    placeholder="Price"
                    className="rounded-md border-slate-200"
                  />
                  <Input
                    name="minOrder"
                    type="number"
                    step="0.01"
                    placeholder="Min order"
                    className="rounded-md border-slate-200"
                  />
                  <Input
                    name="maxOrder"
                    type="number"
                    step="0.01"
                    placeholder="Max order"
                    className="rounded-md border-slate-200"
                  />
                  <Input
                    name="estimatedDays"
                    placeholder="3-5 days"
                    className="rounded-md border-slate-200"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    className="rounded-md border-slate-200"
                  >
                    Add rate
                  </Button>
                </form>

                {zone.rates.length > 0 && (
                  <p className="mt-4 text-xs text-slate-500">
                    Current rates:{" "}
                    {zone.rates
                      .map((r) => `${r.name} (${formatPrice(Number(r.price))})`)
                      .join(", ")}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {zones.length === 0 && (
          <p className="text-sm text-slate-500">
            No shipping zones configured yet.
          </p>
        )}
      </div>
    </div>
  );
}
