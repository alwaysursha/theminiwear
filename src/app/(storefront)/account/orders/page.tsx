import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/date";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AccountChromeHidden } from "@/components/storefront/AccountPanelChrome";
import { AccountPageHeader } from "@/components/storefront/AccountPageHeader";
import { OpenInquiryBanner } from "@/components/storefront/OpenInquiryBanner";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await auth();
  const [orders, openInquiries] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session!.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } },
              },
            },
          },
        },
        shipment: true,
      },
    }),
    prisma.inquiry.count({
      where: { userId: session!.user.id, status: { in: ["OPEN", "IN_PROGRESS"] } },
    }),
  ]);

  return (
    <div>
      <AccountChromeHidden>
        <AccountPageHeader
          title="Orders"
          subtitle={`${orders.length} order${orders.length !== 1 ? "s" : ""}`}
        />
      </AccountChromeHidden>

      <OpenInquiryBanner count={openInquiries} />

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
          {orders.map((order) => {
            const leadItem = order.items[0];
            const image = leadItem?.variant.product.images[0];
            const productNames = order.items.map((item) => item.variant.product.name);
            const summaryLabel =
              productNames.length <= 1
                ? productNames[0] ?? "Order items"
                : `${productNames[0]} + ${productNames.length - 1} more`;

            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex gap-4 rounded-2xl border border-navy/10 bg-white p-4 shadow-sm transition-colors hover:border-coral/30 sm:p-5"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sky/30 sm:h-24 sm:w-24">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={image.alt ?? leadItem.variant.product.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl">
                      👕
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-display font-bold text-navy">
                        {summaryLabel}
                      </p>
                      <p className="mt-1 text-sm text-navy/60">
                        {order.orderNumber}
                      </p>
                      <p className="mt-1 text-sm text-navy/60">
                        Placed {formatDate(order.createdAt, "MMMM d, yyyy")}
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
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
