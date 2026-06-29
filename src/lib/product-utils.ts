import { formatPrice } from "@/lib/utils";
import type { SiteSaleSettings } from "@/lib/settings";
import type { Prisma } from "@prisma/client";

type PricedVariant = {
  price: { toString(): string } | number;
  salePrice?: { toString(): string } | number | null;
};

type SaleProduct = {
  isOnSale: boolean;
  isClearance: boolean;
  salePercent?: number | null;
  saleEndsAt?: Date | string | null;
};

export type VariantPricing = {
  currentPrice: number;
  compareAtPrice: number | null;
  isOnSale: boolean;
};

function toNumber(value: { toString(): string } | number) {
  return Number(value);
}

function isSaleActive(product: SaleProduct) {
  if (!product.isOnSale) return false;
  if (product.saleEndsAt) {
    const endsAt =
      product.saleEndsAt instanceof Date
        ? product.saleEndsAt
        : new Date(product.saleEndsAt);
    if (endsAt < new Date()) return false;
  }
  return true;
}

export function getVariantPricing(
  variant: PricedVariant,
  product: SaleProduct,
  siteSale?: SiteSaleSettings,
): VariantPricing {
  const regularPrice = toNumber(variant.price);
  const candidates: number[] = [];

  if (variant.salePrice != null) {
    candidates.push(toNumber(variant.salePrice));
  }

  if (isSaleActive(product) && product.salePercent && product.salePercent > 0) {
    candidates.push(regularPrice * (1 - product.salePercent / 100));
  }

  if (siteSale?.enabled && siteSale.percent > 0) {
    candidates.push(regularPrice * (1 - siteSale.percent / 100));
  }

  const bestSale =
    candidates.length > 0
      ? Math.min(...candidates.map((p) => Math.round(p * 100) / 100))
      : null;

  if (bestSale != null && bestSale < regularPrice) {
    return {
      currentPrice: bestSale,
      compareAtPrice: regularPrice,
      isOnSale: true,
    };
  }

  return {
    currentPrice: regularPrice,
    compareAtPrice: null,
    isOnSale: false,
  };
}

export function getProductPriceRange(
  variants: PricedVariant[],
  product: SaleProduct,
  siteSale?: SiteSaleSettings,
) {
  if (variants.length === 0) {
    return {
      display: formatPrice(0),
      hasSale: false,
      minCurrent: 0,
      maxCurrent: 0,
      maxDiscountPercent: null as number | null,
    };
  }

  const priced = variants.map((v) => getVariantPricing(v, product, siteSale));
  const currents = priced.map((p) => p.currentPrice);
  const min = Math.min(...currents);
  const max = Math.max(...currents);
  const hasSale = priced.some((p) => p.isOnSale);

  let maxDiscountPercent: number | null = null;
  for (const p of priced) {
    if (p.isOnSale && p.compareAtPrice) {
      const pct = Math.round(
        ((p.compareAtPrice - p.currentPrice) / p.compareAtPrice) * 100,
      );
      maxDiscountPercent = Math.max(maxDiscountPercent ?? 0, pct);
    }
  }

  return {
    display: min === max ? formatPrice(min) : `${formatPrice(min)} – ${formatPrice(max)}`,
    hasSale,
    minCurrent: min,
    maxCurrent: max,
    compareAtMin:
      priced.find((p) => p.compareAtPrice != null)?.compareAtPrice ?? null,
    maxDiscountPercent: maxDiscountPercent && maxDiscountPercent > 0 ? maxDiscountPercent : null,
  };
}

export function getProductDiscountPercent(
  variants: PricedVariant[],
  product: SaleProduct,
  siteSale?: SiteSaleSettings,
) {
  return getProductPriceRange(variants, product, siteSale).maxDiscountPercent;
}

export type CartProduct = {
  id: string;
  name: string;
  slug: string;
  isNewArrival: boolean;
  isTrending: boolean;
  isOnSale: boolean;
  isClearance: boolean;
  salePercent: number | null;
  saleEndsAt: string | null;
  variants: {
    id: string;
    size: string;
    color: string;
    ageGroup: string;
    price: number;
    salePrice: number | null;
    stock: number;
  }[];
  images: { url: string }[];
};

export function serializeProductForCart(product: {
  id: string;
  name: string;
  slug: string;
  isNewArrival: boolean;
  isTrending: boolean;
  isOnSale: boolean;
  isClearance: boolean;
  salePercent: number | null;
  saleEndsAt: Date | null;
  variants: Array<{
    id: string;
    size: string;
    color: string;
    ageGroup: string;
    price: { toString(): string };
    salePrice: { toString(): string } | null;
    stock: number;
  }>;
  images: Array<{ url: string }>;
}): CartProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    isNewArrival: product.isNewArrival,
    isTrending: product.isTrending,
    isOnSale: product.isOnSale,
    isClearance: product.isClearance,
    salePercent: product.salePercent,
    saleEndsAt: product.saleEndsAt?.toISOString() ?? null,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      ageGroup: variant.ageGroup,
      price: toNumber(variant.price),
      salePrice:
        variant.salePrice != null ? toNumber(variant.salePrice) : null,
      stock: variant.stock,
    })),
    images: product.images.map((image) => ({ url: image.url })),
  };
}

export const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  variants: true,
  category: true,
} as const;

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;
