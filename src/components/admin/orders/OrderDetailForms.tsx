"use client";

import { OrderStatus, ShipmentStatus } from "@prisma/client";
import {
  updateOrderStatusFromForm,
  updateShipment,
} from "@/lib/actions/orders";
import { initialAdminSaveState } from "@/lib/admin-form-state";
import { AdminSaveButton } from "@/components/admin/AdminSaveButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSaveForm } from "@/hooks/useAdminSaveForm";

type OrderDetailFormsProps = {
  orderId: string;
  orderStatus: OrderStatus;
  shipment: {
    carrier: string | null;
    trackingNumber: string | null;
    status: ShipmentStatus;
  } | null;
};

export function OrderShipmentForm({
  orderId,
  shipment,
}: Pick<OrderDetailFormsProps, "orderId" | "shipment">) {
  const { state, formAction, pending, saved, markDirty } = useAdminSaveForm(
    updateShipment,
    initialAdminSaveState,
  );

  return (
    <form
      action={formAction}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <input type="hidden" name="orderId" value={orderId} />
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2 lg:col-span-4"
        >
          {state.error}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="carrier">Carrier</Label>
        <Input
          id="carrier"
          name="carrier"
          defaultValue={shipment?.carrier ?? ""}
          placeholder="USPS, UPS, FedEx"
          className="rounded-lg border-slate-200"
          onChange={markDirty}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="trackingNumber">Tracking number</Label>
        <Input
          id="trackingNumber"
          name="trackingNumber"
          defaultValue={shipment?.trackingNumber ?? ""}
          className="rounded-lg border-slate-200"
          onChange={markDirty}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="shipmentStatus">Shipment status</Label>
        <select
          id="shipmentStatus"
          name="status"
          defaultValue={shipment?.status ?? ShipmentStatus.PENDING}
          className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
          onChange={markDirty}
        >
          {Object.values(ShipmentStatus).map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end">
        <AdminSaveButton
          pending={pending}
          saved={saved}
          label="Save tracking"
          savingLabel="Saving tracking"
          savedLabel="Tracking saved"
          className="w-full rounded-lg"
        />
      </div>
    </form>
  );
}

export function OrderStatusForm({
  orderId,
  orderStatus,
}: Pick<OrderDetailFormsProps, "orderId" | "orderStatus">) {
  const { state, formAction, pending, saved, markDirty } = useAdminSaveForm(
    updateOrderStatusFromForm,
    initialAdminSaveState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {state.error}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue={orderStatus}
          className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
          onChange={markDirty}
        >
          {Object.values(OrderStatus).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Input
          id="note"
          name="note"
          placeholder="Internal note"
          className="rounded-lg border-slate-200"
          onChange={markDirty}
        />
      </div>
      <AdminSaveButton
        pending={pending}
        saved={saved}
        label="Update status"
        savingLabel="Updating status"
        savedLabel="Status updated"
        className="w-full rounded-lg"
      />
    </form>
  );
}
