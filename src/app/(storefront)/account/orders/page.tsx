import Link from "next/link";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await auth();
  const orders = await prisma.order.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true, shipment: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy">Orders</h1>
      <p className="mt-1 text-sm text-navy/60">
        {orders.length} order{orders.length !== 1 ? "s" : ""}
      </p>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-navy/20 bg-blush/20 py-16 text-center">
          <p className="text-navy/60">No orders yet</p>
          <Link
            href="/shop"
            className="mt-2 inline-block text-sm font-semibold text-coral hover:underline"
          >
            Browse the shop
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block rounded-2xl border border-navy/10 bg-white p-5 shadow-sm transition-colors hover:border-coral/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display font-bold text-navy">
                    {order.orderNumber}
                  </p>
                  <p className="mt-1 text-sm text-navy/60">
                    Placed {format(order.createdAt, "MMMM d, yyyy")}
                  </p>
                  <p className="mt-1 text-sm text-navy/60">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      order.status === "DELIVERED"
                        ? "success"
                        : order.status === "CANCELLED"
                          ? "warning"
                          : "default"
                    }
                  >
                    {order.status}
                  </Badge>
                  <p className="mt-2 font-bold text-coral">
                    {formatPrice(Number(order.total))}
                  </p>
                </div>
              </div>
              {order.shipment && (
                <p className="mt-3 text-xs text-navy/50">
                  Tracking: {order.shipment.trackingNumber} via{" "}
                  {order.shipment.carrier}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
