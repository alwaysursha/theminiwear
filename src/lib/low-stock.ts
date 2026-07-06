import { prisma } from "@/lib/prisma";

export const LOW_STOCK_THRESHOLD_KEY = "low_stock_threshold";
export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export type LowStockAlertVariant = {
  variantId: string;
  productId: string;
  productName: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  previousStock: number;
};

function parseThreshold(value: string | undefined) {
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export async function getLowStockThreshold() {
  const fromEnv = parseThreshold(process.env.LOW_STOCK_THRESHOLD);
  if (fromEnv != null) return fromEnv;

  try {
    const row = await prisma.storeSetting.findUnique({
      where: { key: LOW_STOCK_THRESHOLD_KEY },
    });
    const fromDb = parseThreshold(row?.value);
    if (fromDb != null) return fromDb;
  } catch {
    // Fall back to default below.
  }

  return DEFAULT_LOW_STOCK_THRESHOLD;
}

export async function findVariantsCrossedLowStock(
  updates: Array<{ variantId: string; quantity: number }>,
  stockBefore: Map<string, number>,
) {
  if (updates.length === 0) return [];

  const variantIds = [...new Set(updates.map((item) => item.variantId))];
  const threshold = await getLowStockThreshold();

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: { select: { id: true, name: true } } },
  });

  return variants.flatMap((variant) => {
    const previousStock = stockBefore.get(variant.id) ?? variant.stock;
    const crossedIntoLow =
      previousStock > threshold && variant.stock <= threshold;
    const wentOutOfStock = previousStock > 0 && variant.stock === 0;

    if (!crossedIntoLow && !wentOutOfStock) {
      return [];
    }

    return [
      {
        variantId: variant.id,
        productId: variant.productId,
        productName: variant.product.name,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        stock: variant.stock,
        previousStock,
      },
    ] satisfies LowStockAlertVariant[];
  });
}

export async function findCurrentLowStockVariants() {
  const threshold = await getLowStockThreshold();

  const variants = await prisma.productVariant.findMany({
    where: { stock: { lte: threshold } },
    include: { product: { select: { id: true, name: true, slug: true } } },
    orderBy: [{ stock: "asc" }, { product: { name: "asc" } }],
  });

  return variants.map((variant) => ({
    variantId: variant.id,
    productId: variant.productId,
    productSlug: variant.product.slug,
    productName: variant.product.name,
    sku: variant.sku,
    size: variant.size,
    color: variant.color,
    stock: variant.stock,
  }));
}
