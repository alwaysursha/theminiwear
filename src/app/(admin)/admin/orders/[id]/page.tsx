import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/date";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Package,
  Scissors,
  Truck,
  User,
} from "lucide-react";
import { OrderStatus, ShipmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { measurementLabel } from "@/lib/custom-size";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import {
  refundOrder,
  updateOrderStatusFromForm,
  updateShipment,
} from "@/lib/actions/orders";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      address: true,
      items: { include: { variant: { include: { product: true } } } },
      shipment: true,
      statusHistory: { orderBy: { createdAt: "desc" } },
      discount: true,
    },
  });

  if (!order) {
    notFound();
  }

  const boundUpdateStatus = updateOrderStatusFromForm.bind(null, id);
  const boundUpdateShipment = updateShipment.bind(null, id);
  const boundRefund = refundOrder.bind(null, id);

  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/orders"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {order.orderNumber}
              </h2>
              <OrderStatusBadge status={order.status} className="text-xs" />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Placed {formatDate(order.createdAt, "MMMM d, yyyy 'at' h:mm a")} ·{" "}
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-right shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Total
            </p>
            <p className="text-xl font-bold text-slate-900">
              {formatPrice(Number(order.total))}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
              <Package className="h-4 w-4 text-slate-400" />
              Order items
            </h3>
            <ul className="divide-y divide-slate-100">
              {order.items.map((item) => {
                const measurements =
                  item.customMeasurements &&
                  typeof item.customMeasurements === "object"
                    ? (item.customMeasurements as Record<string, string>)
                    : null;
                return (
                  <li key={item.id} className="flex justify-between py-3 text-sm">
                    <div className="min-w-0 pr-3">
                      <p className="font-medium text-slate-900">
                        {item.variant.product.name}
                      </p>
                      <p className="text-slate-500">
                        {item.variant.size} / {item.variant.color} /{" "}
                        {item.variant.ageGroup} × {item.quantity}
                      </p>
                      {item.customFee != null && (
                        <div className="mt-2 rounded-lg border border-amber-300 bg-amber-50 p-2">
                          <p className="flex items-center gap-1 text-xs font-semibold text-amber-800">
                            <Scissors className="h-3.5 w-3.5" aria-hidden />
                            Custom fit (+
                            {formatPrice(Number(item.customFee))}/item)
                          </p>
                          {measurements && (
                            <ul className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-amber-900">
                              {Object.entries(measurements).map(
                                ([key, value]) => (
                                  <li key={key}>
                                    <span className="font-semibold">
                                      {measurementLabel(key)}:
                                    </span>{" "}
                                    {value}
                                  </li>
                                ),
                              )}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="shrink-0 font-medium text-slate-900">
                      {formatPrice(Number(item.price) * item.quantity)}
                    </p>
                  </li>
                );
              })}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>
                <dd className="text-slate-700">
                  {formatPrice(Number(order.subtotal))}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Shipping</dt>
                <dd className="text-slate-700">
                  {formatPrice(Number(order.shippingCost))}
                </dd>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <dt>
                    Discount
                    {order.discount ? ` (${order.discount.code})` : ""}
                  </dt>
                  <dd>-{formatPrice(Number(order.discountAmount))}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900">
                <dt>Total</dt>
                <dd>{formatPrice(Number(order.total))}</dd>
              </div>
            </dl>
          </div>

          {/* Shipping & tracking */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
              <Truck className="h-4 w-4 text-slate-400" />
              Shipping & tracking
            </h3>
            <form
              action={boundUpdateShipment}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div className="space-y-2">
                <Label htmlFor="carrier">Carrier</Label>
                <Input
                  id="carrier"
                  name="carrier"
                  defaultValue={order.shipment?.carrier ?? ""}
                  placeholder="USPS, UPS, FedEx"
                  className="rounded-lg border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trackingNumber">Tracking number</Label>
                <Input
                  id="trackingNumber"
                  name="trackingNumber"
                  defaultValue={order.shipment?.trackingNumber ?? ""}
                  className="rounded-lg border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipmentStatus">Shipment status</Label>
                <select
                  id="shipmentStatus"
                  name="status"
                  defaultValue={order.shipment?.status ?? ShipmentStatus.PENDING}
                  className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                >
                  {Object.values(ShipmentStatus).map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  className="w-full rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                >
                  Save tracking
                </Button>
              </div>
            </form>
          </div>

          {/* Status history */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
              <Clock className="h-4 w-4 text-slate-400" />
              Status history
            </h3>
            {order.statusHistory.length > 0 ? (
              <ol className="relative space-y-4 border-l border-slate-200 pl-5">
                {order.statusHistory.map((entry) => (
                  <li key={entry.id} className="relative">
                    <span className="absolute -left-[1.42rem] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-slate-400 ring-1 ring-slate-200" />
                    <div className="flex flex-wrap items-center gap-2">
                      <OrderStatusBadge status={entry.status} />
                      <span className="text-xs text-slate-400">
                        {formatDate(entry.createdAt, "MMM d, h:mm a")}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="mt-1 text-sm text-slate-500">{entry.note}</p>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-slate-500">No history yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
              <User className="h-4 w-4 text-slate-400" />
              Customer
            </h3>
            <p className="text-sm font-medium text-slate-900">
              {order.user?.name ?? "Guest"}
            </p>
            <p className="text-sm text-slate-500">
              {order.user?.email ?? order.guestEmail}
            </p>
            {order.address && (
              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <address className="text-sm not-italic text-slate-600">
                  {order.address.fullName}
                  <br />
                  {order.address.line1}
                  {order.address.line2 && (
                    <>
                      <br />
                      {order.address.line2}
                    </>
                  )}
                  <br />
                  {order.address.city}, {order.address.state}{" "}
                  {order.address.postalCode}
                </address>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h3 className="mb-4 font-semibold text-slate-900">Update status</h3>
            <form action={boundUpdateStatus} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={order.status}
                  className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
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
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-lg bg-slate-900 text-white hover:bg-slate-800"
              >
                Update status
              </Button>
            </form>
          </div>

          {order.status !== OrderStatus.REFUNDED && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm sm:p-6">
              <h3 className="mb-1 font-semibold text-rose-900">Refund order</h3>
              <p className="mb-4 text-sm text-rose-700">
                Processes a Stripe refund and marks the order as refunded.
              </p>
              <ConfirmSubmitButton
                action={boundRefund}
                triggerLabel="Process refund"
                triggerClassName="inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-rose-600/30 transition-colors hover:bg-rose-700"
                title="Process refund?"
                confirmLabel="Process refund"
                description={
                  <>
                    A Stripe refund of{" "}
                    <span className="font-semibold text-slate-900">
                      {formatPrice(Number(order.total))}
                    </span>{" "}
                    will be issued for {order.orderNumber} and the order marked
                    as refunded. This can&apos;t be undone.
                  </>
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
