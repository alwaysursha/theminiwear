import type { Prisma } from "@prisma/client";
import type { CartItem } from "@/lib/cart-store";
import {
  buildCustomLineId,
  hasMeasurements,
  sanitizeMeasurements,
  type CustomMeasurements,
} from "@/lib/custom-size";
import { getVariantPricing } from "@/lib/product-utils";
import type { SiteSaleSettings } from "@/lib/settings";

export type CartSyncItem = {
  lineId: string;
  variantId: string;
  quantity: number;
  custom?: {
    fee: number;
    measurements: CustomMeasurements;
  };
};

type DbCartItemWithVariant = Prisma.CartItemGetPayload<{
  include: {
    variant: {
      include: {
        product: {
          include: {
            images: { take: 1; orderBy: { sortOrder: "asc" } };
          };
        };
      };
    };
  };
}>;

export function cartItemToSyncItem(item: CartItem): CartSyncItem {
  return {
    lineId: item.lineId,
    variantId: item.variantId,
    quantity: item.quantity,
    custom: item.custom,
  };
}

export function normalizeSyncItem(item: CartSyncItem): CartSyncItem {
  const measurements = item.custom
    ? sanitizeMeasurements(item.custom.measurements)
    : null;
  const isCustom = measurements != null && hasMeasurements(measurements);

  if (!isCustom) {
    return {
      lineId: item.variantId,
      variantId: item.variantId,
      quantity: item.quantity,
    };
  }

  const lineId = buildCustomLineId(item.variantId, measurements);

  return {
    lineId,
    variantId: item.variantId,
    quantity: item.quantity,
    custom: {
      fee: item.custom?.fee ?? 0,
      measurements,
    },
  };
}

export function mergeSyncItems(
  dbItems: CartSyncItem[],
  localItems: CartSyncItem[],
): CartSyncItem[] {
  const merged = new Map<string, CartSyncItem>();

  for (const item of dbItems.map(normalizeSyncItem)) {
    merged.set(item.lineId, { ...item });
  }

  for (const item of localItems.map(normalizeSyncItem)) {
    const existing = merged.get(item.lineId);
    if (existing) {
      merged.set(item.lineId, {
        ...existing,
        quantity: existing.quantity + item.quantity,
        custom: existing.custom ?? item.custom,
      });
      continue;
    }
    merged.set(item.lineId, { ...item });
  }

  return [...merged.values()];
}

export function dbCartItemToClientItem(
  item: DbCartItemWithVariant,
  siteSale: SiteSaleSettings,
): CartItem | null {
  const variant = item.variant;
  if (!variant?.product) {
    return null;
  }

  const measurements = item.customMeasurements
    ? sanitizeMeasurements(item.customMeasurements as Record<string, unknown>)
    : null;
  const isCustom = measurements != null && hasMeasurements(measurements);
  const customFee = isCustom ? Number(item.customFee ?? 0) : 0;
  const pricing = getVariantPricing(variant, variant.product, siteSale);

  return {
    lineId: item.lineId,
    variantId: variant.id,
    productId: variant.productId,
    name: variant.product.name,
    size: variant.size,
    color: variant.color,
    price: pricing.currentPrice + customFee,
    image: variant.product.images[0]?.url,
    quantity: item.quantity,
    stock: variant.stock,
    custom: isCustom
      ? {
          fee: customFee,
          measurements,
        }
      : undefined,
  };
}
