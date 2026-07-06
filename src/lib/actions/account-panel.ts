"use server";

import { auth, resolveSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProductPriceRange, productInclude } from "@/lib/product-utils";
import { getSiteSaleSettings } from "@/lib/settings";

type PanelAuthError = { error: "Unauthorized" };

async function requireUserId(): Promise<PanelAuthError | { userId: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }
  return { userId: session.user.id };
}

function isPanelAuthError(
  value: PanelAuthError | { userId: string },
): value is PanelAuthError {
  return "error" in value;
}

export async function fetchAccountPanelProfile() {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: "Unauthorized" as const };
  }

  const user = await resolveSessionUser(session);
  return {
    name: user?.name ?? session.user.name ?? "",
    email: user?.email ?? session.user.email,
    phone: user?.phone ?? "",
  };
}

export async function fetchAccountPanelOrders() {
  const authResult = await requireUserId();
  if (isPanelAuthError(authResult)) return authResult;

  const [orders, openInquiries] = await Promise.all([
    prisma.order.findMany({
      where: { userId: authResult.userId },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { take: 1, orderBy: { sortOrder: "asc" } },
                  },
                },
              },
            },
          },
        },
        shipment: true,
      },
    }),
    prisma.inquiry.count({
      where: {
        userId: authResult.userId,
        status: { in: ["OPEN", "IN_PROGRESS"] },
      },
    }),
  ]);

  return {
    orders: orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
      itemCount: order.items.length,
      leadProductName: order.items[0]?.variant.product.name ?? "Order items",
      leadImageUrl: order.items[0]?.variant.product.images[0]?.url ?? null,
      trackingNumber: order.shipment?.trackingNumber ?? null,
      carrier: order.shipment?.carrier ?? null,
    })),
    openInquiries,
  };
}

export async function fetchAccountPanelWishlist() {
  const authResult = await requireUserId();
  if (isPanelAuthError(authResult)) return authResult;

  const [items, siteSale] = await Promise.all([
    prisma.wishlistItem.findMany({
      where: { userId: authResult.userId },
      include: { product: { include: productInclude } },
      orderBy: { product: { name: "asc" } },
    }),
    getSiteSaleSettings(),
  ]);

  return {
    items: items.map((item) => ({
      id: item.id,
      productId: item.productId,
      slug: item.product.slug,
      name: item.product.name,
      imageUrl: item.product.images[0]?.url ?? null,
      imageAlt: item.product.images[0]?.alt ?? item.product.name,
      priceDisplay: getProductPriceRange(
        item.product.variants,
        item.product,
        siteSale,
      ).display,
      product: item.product,
    })),
    siteSale,
  };
}

export async function fetchAccountPanelAddresses() {
  const authResult = await requireUserId();
  if (isPanelAuthError(authResult)) return authResult;

  const addresses = await prisma.address.findMany({
    where: { userId: authResult.userId },
    orderBy: [{ isDefault: "desc" }, { label: "asc" }],
  });

  return { addresses };
}

export async function fetchAccountPanelMessages() {
  const authResult = await requireUserId();
  if (isPanelAuthError(authResult)) return authResult;

  const inquiries = await prisma.inquiry.findMany({
    where: { userId: authResult.userId },
    orderBy: { updatedAt: "desc" },
    include: { messages: { take: 1, orderBy: { createdAt: "desc" } } },
  });

  return {
    inquiries: inquiries.map((inquiry) => ({
      id: inquiry.id,
      subject: inquiry.subject,
      status: inquiry.status,
      updatedAt: inquiry.updatedAt.toISOString(),
      preview: inquiry.messages[0]?.content ?? "No messages",
    })),
  };
}
