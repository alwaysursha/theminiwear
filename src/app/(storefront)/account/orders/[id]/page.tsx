import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Check, Circle, Package, Truck } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ReturnRequestForm } from "@/components/storefront/ReturnRequestForm";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

const statusSteps: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

const statusIcons: Record<string, typeof Circle> = {
  PENDING: Circle,
  PAID: Check,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: Check,
};

export default async function OrderDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const session = await auth();

  const order = await prisma.order.findFirst({
    where: { id, userId: session!.user.id },
      include: {
      items: {
        include: {
          variant: {
            include: {
              product: { include: { images: { take: 1 } } },
            },
          },
        },
      },
      address: true,
      shipment: true,
      returnRequest: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) {
    notFound();
  }

  const currentStepIndex = statusSteps.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/account/orders"
          className="text-sm font-semibold text-coral hover:underline"
        >
          ← Back to orders
        </Link>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-navy">
          Order {order.orderNumber}
        </h1>
        <p className="mt-1 text-sm text-navy/60">
          Placed {format(order.createdAt, "MMMM d, yyyy 'at' h:mm a")}
        </p>
      </div>

      {!isCancelled && (
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
          <h2 className="font-display font-bold text-navy">Order Timeline</h2>
          <div className="mt-6 space-y-4">
            {statusSteps.map((step, index) => {
              const isComplete = index <= currentStepIndex;
              const Icon = statusIcons[step] ?? Circle;
              const historyEntry = order.statusHistory.find(
                (h) => h.status === step,
              );

              return (
                <div key={step} className="flex items-start gap-4">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      isComplete ? "bg-mint text-navy" : "bg-navy/10 text-navy/40"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p
                      className={`font-semibold ${
                        isComplete ? "text-navy" : "text-navy/40"
                      }`}
                    >
                      {step.charAt(0) + step.slice(1).toLowerCase().replace("_", " ")}
                    </p>
                    {historyEntry && (
                      <p className="text-xs text-navy/50">
                        {format(historyEntry.createdAt, "MMM d, yyyy h:mm a")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <Badge variant="warning">{order.status}</Badge>
      )}

      {order.shipment && (
        <div className="rounded-2xl border border-navy/10 bg-sky/20 p-5">
          <p className="font-semibold text-navy">Shipment</p>
          <p className="mt-1 text-sm text-navy/70">
            {order.shipment.carrier} · {order.shipment.trackingNumber}
          </p>
          <p className="text-sm text-navy/70">Status: {order.shipment.status}</p>
        </div>
      )}

      <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
        <h2 className="font-display font-bold text-navy">Items</h2>
        <div className="mt-4 space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border-b border-navy/5 pb-4 last:border-0 last:pb-0"
            >
              <div>
                <p className="font-semibold text-navy">
                  {item.variant.product.name}
                </p>
                <p className="text-sm text-navy/60">
                  {item.variant.size} / {item.variant.color} · Qty {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-coral">
                {formatPrice(Number(item.price) * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-2 border-t border-navy/10 pt-4 text-sm">
          <div className="flex justify-between text-navy/70">
            <span>Subtotal</span>
            <span>{formatPrice(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between text-navy/70">
            <span>Shipping</span>
            <span>{formatPrice(Number(order.shippingCost))}</span>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between text-navy/70">
              <span>Discount</span>
              <span>-{formatPrice(Number(order.discountAmount))}</span>
            </div>
          )}
          <div className="flex justify-between font-display text-lg font-bold text-navy">
            <span>Total</span>
            <span className="text-coral">{formatPrice(Number(order.total))}</span>
          </div>
        </div>
      </div>

      {order.address && (
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
          <h2 className="font-display font-bold text-navy">Shipping Address</h2>
          <p className="mt-2 text-sm text-navy/70">
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
            <br />
            {order.address.country}
          </p>
        </div>
      )}

      {["DELIVERED", "SHIPPED"].includes(order.status) && !order.returnRequest && (
        <ReturnRequestForm orderId={order.id} />
      )}

      {order.returnRequest && (
        <div className="rounded-2xl border border-navy/10 bg-blush/30 p-5">
          <p className="font-semibold text-navy">Return Request</p>
          <p className="mt-1 text-sm text-navy/70">Status: {order.returnRequest.status}</p>
          <p className="mt-2 text-sm text-navy/60">{order.returnRequest.reason}</p>
        </div>
      )}
    </div>
  );
}
