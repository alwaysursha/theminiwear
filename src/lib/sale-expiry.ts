import { formatDate } from "@/lib/date";

type SaleProduct = {
  isOnSale: boolean;
  saleEndsAt?: Date | string | null;
};

export function getProductSaleEndsAt(product: SaleProduct): Date | null {
  if (!product.isOnSale || !product.saleEndsAt) return null;

  const endsAt =
    product.saleEndsAt instanceof Date
      ? product.saleEndsAt
      : new Date(product.saleEndsAt);

  if (Number.isNaN(endsAt.getTime()) || endsAt < new Date()) {
    return null;
  }

  return endsAt;
}

export function formatSaleEndsLabel(endsAt: Date): string {
  const now = new Date();
  const diffMs = endsAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Sale ends today";
  if (diffDays === 1) return "Sale ends tomorrow";
  if (diffDays <= 7) return `Sale ends in ${diffDays} days`;

  return `Sale ends ${formatDate(endsAt, "MMM d, yyyy")}`;
}
