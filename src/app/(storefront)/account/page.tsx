import Link from "next/link";
import { format } from "date-fns";
import { Package, Heart, MapPin } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [orders, wishlistCount, addressCount, openInquiries] =
    await Promise.all([
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { items: true },
      }),
      prisma.wishlistItem.count({ where: { userId } }),
      prisma.address.count({ where: { userId } }),
      prisma.inquiry.count({
        where: { userId, status: { in: ["OPEN", "IN_PROGRESS"] } },
      }),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy sm:text-3xl">
          Hello, {session!.user.name ?? "there"}!
        </h1>
        <p className="mt-1 text-navy/60">{session!.user.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/account/orders"
          className="flex items-center gap-4 rounded-2xl border border-navy/10 bg-white p-5 shadow-sm transition-colors hover:border-coral/30"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky/50">
            <Package className="h-6 w-6 text-navy" />
          </div>
          <div>
            <p className="text-2xl font-bold text-navy">{orders.length}</p>
            <p className="text-sm text-navy/60">Recent orders</p>
          </div>
        </Link>
        <Link
          href="/account/wishlist"
          className="flex items-center gap-4 rounded-2xl border border-navy/10 bg-white p-5 shadow-sm transition-colors hover:border-coral/30"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blush/80">
            <Heart className="h-6 w-6 text-coral" />
          </div>
          <div>
            <p className="text-2xl font-bold text-navy">{wishlistCount}</p>
            <p className="text-sm text-navy/60">Wishlist items</p>
          </div>
        </Link>
        <Link
          href="/account/addresses"
          className="flex items-center gap-4 rounded-2xl border border-navy/10 bg-white p-5 shadow-sm transition-colors hover:border-coral/30"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mint/50">
            <MapPin className="h-6 w-6 text-navy" />
          </div>
          <div>
            <p className="text-2xl font-bold text-navy">{addressCount}</p>
            <p className="text-sm text-navy/60">Saved addresses</p>
          </div>
        </Link>
      </div>

      {openInquiries > 0 && (
        <div className="rounded-2xl border border-coral/20 bg-coral/5 p-4">
          <p className="text-sm text-navy">
            You have{" "}
            <Link href="/account/inquiries" className="font-semibold text-coral hover:underline">
              {openInquiries} open inquir{openInquiries === 1 ? "y" : "ies"}
            </Link>
          </p>
        </div>
      )}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-navy">
            Recent Orders
          </h2>
          <Link
            href="/account/orders"
            className="text-sm font-semibold text-coral hover:underline"
          >
            View all
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="mt-4 text-sm text-navy/60">
            No orders yet.{" "}
            <Link href="/shop" className="text-coral hover:underline">
              Start shopping
            </Link>
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between rounded-2xl border border-navy/10 bg-white p-4 shadow-sm transition-colors hover:border-coral/30"
              >
                <div>
                  <p className="font-semibold text-navy">{order.orderNumber}</p>
                  <p className="text-sm text-navy/60">
                    {format(order.createdAt, "MMM d, yyyy")} · {order.items.length}{" "}
                    item{order.items.length !== 1 ? "s" : ""}
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
                  <p className="mt-1 font-semibold text-coral">
                    {formatPrice(Number(order.total))}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
