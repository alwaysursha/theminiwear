"use server";

import { revalidatePath } from "next/cache";
import { DiscountType } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function parseDiscountFormData(formData: FormData) {
  const code = (formData.get("code") as string).toUpperCase().trim();
  const type = formData.get("type") as DiscountType;
  const value = parseFloat(formData.get("value") as string);
  const minOrderAmountRaw = formData.get("minOrderAmount") as string;
  const maxUsesRaw = formData.get("maxUses") as string;
  const expiresAtRaw = formData.get("expiresAt") as string;
  const isActive = formData.get("isActive") === "on";

  return {
    code,
    type,
    value,
    minOrderAmount: minOrderAmountRaw ? parseFloat(minOrderAmountRaw) : null,
    maxUses: maxUsesRaw ? parseInt(maxUsesRaw, 10) : null,
    expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
    isActive,
  };
}

export async function createDiscount(formData: FormData) {
  await requireAdmin();

  const data = parseDiscountFormData(formData);

  await prisma.discount.create({ data });

  revalidatePath("/admin/discounts");
}

export async function updateDiscount(discountId: string, formData: FormData) {
  await requireAdmin();

  const data = parseDiscountFormData(formData);

  await prisma.discount.update({
    where: { id: discountId },
    data,
  });

  revalidatePath("/admin/discounts");
}

export async function deleteDiscount(discountId: string) {
  await requireAdmin();

  await prisma.discount.delete({ where: { id: discountId } });

  revalidatePath("/admin/discounts");
}

export async function toggleDiscountActive(
  discountId: string,
  isActive: boolean,
) {
  await requireAdmin();

  await prisma.discount.update({
    where: { id: discountId },
    data: { isActive },
  });

  revalidatePath("/admin/discounts");
}
