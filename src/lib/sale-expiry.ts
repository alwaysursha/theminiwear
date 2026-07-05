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

export type SaleCountdownParts = {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

export function getSaleCountdownParts(
  endsAt: Date,
  now: Date = new Date(),
): SaleCountdownParts {
  const totalMs = Math.max(0, endsAt.getTime() - now.getTime());

  if (totalMs <= 0) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      expired: true,
    };
  }

  const totalSeconds = Math.floor(totalMs / 1000);

  return {
    totalMs,
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
    expired: false,
  };
}

export function padCountdownUnit(value: number, digits = 2): string {
  return String(value).padStart(digits, "0");
}
