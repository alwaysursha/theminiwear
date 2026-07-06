"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CartItem } from "@/lib/cart-store";
import {
  cartItemToSyncItem,
  dbCartItemToClientItem,
  mergeSyncItems,
  normalizeSyncItem,
  type CartSyncItem,
} from "@/lib/cart-db";
import { hasMeasurements } from "@/lib/custom-size";
import { getVariantPricing } from "@/lib/product-utils";
import { getSiteSaleSettings } from "@/lib/settings";

const cartItemInclude = {
  variant: {
    include: {
      product: {
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" as const } },
        },
      },
    },
  },
} as const;

async function requireUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

async function hydrateSyncItems(
  items: CartSyncItem[],
  siteSale: Awaited<ReturnType<typeof getSiteSaleSettings>>,
): Promise<CartItem[]> {
  if (items.length === 0) {
    return [];
  }

  const variantIds = [...new Set(items.map((item) => item.variantId))];
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: {
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });
  const variantMap = new Map(variants.map((variant) => [variant.id, variant]));

  const hydrated: CartItem[] = [];

  for (const item of items.map(normalizeSyncItem)) {
    const variant = variantMap.get(item.variantId);
    if (!variant || variant.stock < 1) {
      continue;
    }

    const measurements = item.custom?.measurements ?? null;
    const isCustom = measurements != null && hasMeasurements(measurements);

    const customFee = isCustom ? item.custom?.fee ?? 0 : 0;
    const pricing = getVariantPricing(variant, variant.product, siteSale);
    const quantity = Math.min(Math.max(1, item.quantity), variant.stock);

    hydrated.push({
      lineId: item.lineId,
      variantId: variant.id,
      productId: variant.productId,
      name: variant.product.name,
      size: variant.size,
      color: variant.color,
      price: pricing.currentPrice + customFee,
      image: variant.product.images[0]?.url,
      quantity,
      stock: variant.stock,
      custom: isCustom
        ? {
            fee: customFee,
            measurements,
          }
        : undefined,
    });
  }

  return hydrated;
}

async function persistUserCart(userId: string, items: CartSyncItem[]) {
  const normalized = items.map(normalizeSyncItem);

  await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.upsert({
      where: { userId },
      create: { userId },
      update: { updatedAt: new Date() },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    if (normalized.length === 0) {
      return;
    }

    await tx.cartItem.createMany({
      data: normalized.map((item) => ({
        cartId: cart.id,
        lineId: item.lineId,
        variantId: item.variantId,
        quantity: item.quantity,
        customFee: item.custom?.fee ?? null,
        customMeasurements: item.custom?.measurements ?? undefined,
      })),
    });
  });
}

export async function loadUserCart(): Promise<
  { items: CartItem[] } | { error: string }
> {
  const userId = await requireUserId();
  if (!userId) {
    return { error: "You must be signed in to sync your cart." };
  }

  const [cart, siteSale] = await Promise.all([
    prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: cartItemInclude,
          orderBy: { id: "asc" },
        },
      },
    }),
    getSiteSaleSettings(),
  ]);

  if (!cart) {
    return { items: [] };
  }

  const items = cart.items
    .map((item) => dbCartItemToClientItem(item, siteSale))
    .filter((item): item is CartItem => item != null);

  return { items };
}

export async function saveUserCart(
  items: CartSyncItem[],
): Promise<{ success: true } | { error: string }> {
  const userId = await requireUserId();
  if (!userId) {
    return { error: "You must be signed in to sync your cart." };
  }

  const siteSale = await getSiteSaleSettings();
  const hydrated = await hydrateSyncItems(items, siteSale);
  const syncItems = hydrated.map(cartItemToSyncItem);

  await persistUserCart(userId, syncItems);
  return { success: true };
}

export async function mergeUserCart(
  localItems: CartSyncItem[],
): Promise<{ items: CartItem[] } | { error: string }> {
  const userId = await requireUserId();
  if (!userId) {
    return { error: "You must be signed in to sync your cart." };
  }

  const [existingCart, siteSale] = await Promise.all([
    prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: cartItemInclude,
          orderBy: { id: "asc" },
        },
      },
    }),
    getSiteSaleSettings(),
  ]);

  const dbItems =
    existingCart?.items
      .map((item) => dbCartItemToClientItem(item, siteSale))
      .filter((item): item is CartItem => item != null)
      .map(cartItemToSyncItem) ?? [];

  const merged = mergeSyncItems(dbItems, localItems);
  const hydrated = await hydrateSyncItems(merged, siteSale);
  const syncItems = hydrated.map(cartItemToSyncItem);

  await persistUserCart(userId, syncItems);
  return { items: hydrated };
}

export async function clearUserCart(): Promise<
  { success: true } | { error: string }
> {
  const userId = await requireUserId();
  if (!userId) {
    return { error: "You must be signed in to sync your cart." };
  }

  await clearUserCartById(userId);
  return { success: true };
}

export async function clearUserCartById(userId: string) {
  await prisma.cart.deleteMany({ where: { userId } });
}
