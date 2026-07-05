import { DiscountType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export type ResolvedCheckoutDiscount = {
  id: string;
  code: string;
  type: DiscountType;
  amount: number;
  freeShipping: boolean;
  label: string;
};

function buildDiscountLabel(
  discount: { code: string; type: DiscountType; value: { toString(): string } },
  amount: number,
) {
  switch (discount.type) {
    case DiscountType.PERCENTAGE:
      return `${discount.code} (${Number(discount.value)}% off)`;
    case DiscountType.FIXED:
      return `${discount.code} (${formatPrice(amount)} off)`;
    case DiscountType.FREE_SHIPPING:
      return `${discount.code} (Free shipping)`;
    default: {
      const never: never = discount.type;
      return never;
    }
  }
}

export function computeCheckoutDiscountAmount(
  discount: {
    id: string;
    code: string;
    type: DiscountType;
    value: { toString(): string };
  },
  subtotal: number,
): ResolvedCheckoutDiscount {
  let amount = 0;
  let freeShipping = false;

  switch (discount.type) {
    case DiscountType.PERCENTAGE:
      amount = subtotal * (Number(discount.value) / 100);
      break;
    case DiscountType.FIXED:
      amount = Math.min(Number(discount.value), subtotal);
      break;
    case DiscountType.FREE_SHIPPING:
      freeShipping = true;
      break;
    default: {
      const never: never = discount.type;
      return never;
    }
  }

  return {
    id: discount.id,
    code: discount.code,
    type: discount.type,
    amount: Math.round(amount * 100) / 100,
    freeShipping,
    label: buildDiscountLabel(discount, amount),
  };
}

export async function previewCheckoutDiscount(
  code: string,
  subtotal: number,
): Promise<{ discount: ResolvedCheckoutDiscount } | { error: string }> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { error: "Enter a discount code." };
  }

  const discount = await prisma.discount.findFirst({
    where: {
      code: normalized,
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });

  if (!discount) {
    return { error: "This promo code is not valid." };
  }

  if (discount.maxUses != null && discount.usedCount >= discount.maxUses) {
    return { error: "This promo code has reached its usage limit." };
  }

  if (
    discount.minOrderAmount != null &&
    subtotal < Number(discount.minOrderAmount)
  ) {
    return {
      error: `Minimum order of ${formatPrice(Number(discount.minOrderAmount))} required for this code.`,
    };
  }

  return {
    discount: computeCheckoutDiscountAmount(discount, subtotal),
  };
}
