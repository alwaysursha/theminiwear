import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/date";
import { ArrowLeft } from "lucide-react";
import { OrderStatus, ShipmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      items: {
        include: {
          variant: { include: { product: true } },
        },
      },
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
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              {order.orderNumber}
            </h2>
            <p className="text-sm text-slate-500">
              Placed {formatDate(order.createdAt, "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-slate-900">Order items</h3>
          <ul className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">
                    {item.variant.product.name}
                  </p>
                  <p className="text-slate-500">
                    {item.variant.size} / {item.variant.color} /{" "}
                    {item.variant.ageGroup} × {item.quantity}
                  </p>
                </div>
                <p className="font-medium text-slate-900">
                  {formatPrice(Number(item.price) * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Subtotal</dt>
              <dd>{formatPrice(Number(order.subtotal))}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Shipping</dt>
              <dd>{formatPrice(Number(order.shippingCost))}</dd>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-green-700">
                <dt>Discount</dt>
                <dd>-{formatPrice(Number(order.discountAmount))}</dd>
              </div>
            )}
            <div className="flex justify-between font-semibold text-slate-900">
              <dt>Total</dt>
              <dd>{formatPrice(Number(order.total))}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-slate-900">Customer</h3>
            <p className="text-sm text-slate-900">
              {order.user?.name ?? "Guest"}
            </p>
            <p className="text-sm text-slate-500">
              {order.user?.email ?? order.guestEmail}
            </p>
            {order.address && (
              <address className="mt-3 text-sm not-italic text-slate-600">
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
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-slate-900">Update status</h3>
            <form action={boundUpdateStatus} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={order.status}
                  className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
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
                  className="rounded-md border-slate-200"
                />
              </div>
              <Button
                type="submit"
                className="rounded-md bg-slate-900 text-white hover:bg-slate-800"
              >
                Update status
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-900">Shipping & tracking</h3>
        <form action={boundUpdateShipment} className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="carrier">Carrier</Label>
            <Input
              id="carrier"
              name="carrier"
              defaultValue={order.shipment?.carrier ?? ""}
              placeholder="USPS, UPS, FedEx"
              className="rounded-md border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trackingNumber">Tracking number</Label>
            <Input
              id="trackingNumber"
              name="trackingNumber"
              defaultValue={order.shipment?.trackingNumber ?? ""}
              className="rounded-md border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shipmentStatus">Shipment status</Label>
            <select
              id="shipmentStatus"
              name="status"
              defaultValue={order.shipment?.status ?? ShipmentStatus.PENDING}
              className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
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
              className="w-full rounded-md bg-slate-900 text-white hover:bg-slate-800"
            >
              Save tracking
            </Button>
          </div>
        </form>
      </div>

      {order.status !== OrderStatus.REFUNDED && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h3 className="mb-2 font-semibold text-red-900">Refund order</h3>
          <p className="mb-4 text-sm text-red-700">
            This will process a Stripe refund and mark the order as refunded.
          </p>
          <form action={boundRefund}>
            <Button
              type="submit"
              variant="destructive"
              className="rounded-md"
            >
              Process refund
            </Button>
          </form>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-900">Status history</h3>
        <ul className="space-y-3">
          {order.statusHistory.map((entry) => (
            <li key={entry.id} className="flex gap-4 text-sm">
              <span className="shrink-0 text-slate-500">
                {formatDate(entry.createdAt, "MMM d, h:mm a")}
              </span>
              <span className="font-medium text-slate-700">{entry.status}</span>
              {entry.note && (
                <span className="text-slate-500">— {entry.note}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
