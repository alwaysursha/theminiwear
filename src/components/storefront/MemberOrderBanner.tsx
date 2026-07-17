import Link from "next/link";
import { Truck } from "lucide-react";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { formatOrderProductsSubject } from "@/emails/theme";
import { orderItemProductName } from "@/lib/order-item-display";

export async function MemberOrderBanner() {
  const session = await auth();
  if (!session?.user?.id || isAdminRole(session.user.role)) {
    return null;
  }

  const order = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      status: { in: ["PROCESSING", "SHIPPED"] },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      items: {
        include: {
          variant: { include: { product: true } },
        },
      },
      shipment: true,
    },
  });

  if (!order) {
    return null;
  }

  const isOnTheWay =
    order.status === "SHIPPED" ||
    order.shipment?.status === "IN_TRANSIT";

  if (!isOnTheWay) {
    return null;
  }

  const productLabel = formatOrderProductsSubject(
    order.items.map((item) => orderItemProductName(item)),
  );

  return (
    <div className="border-b border-coral/20 bg-coral/5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
        <p className="flex min-w-0 items-center gap-2 text-sm text-navy/80">
          <Truck className="h-4 w-4 shrink-0 text-coral" aria-hidden />
          <span className="truncate">
            Your <strong className="font-semibold text-navy">{productLabel}</strong> is on
            the way
          </span>
        </p>
        <Link
          href={`/account/orders/${order.id}`}
          className="shrink-0 text-sm font-semibold text-coral hover:underline"
        >
          Track order
        </Link>
      </div>
    </div>
  );
}
