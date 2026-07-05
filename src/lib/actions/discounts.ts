"use server";

import { revalidatePath } from "next/cache";
import { DiscountType, Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { flashAdminSaved } from "@/lib/admin-save-flash";
import { prisma } from "@/lib/prisma";

export type DiscountFormState = {
  error?: string;
};

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

async function duplicateCodeMessage(
  code: string,
  excludeId?: string,
): Promise<string | null> {
  const existing = await prisma.discount.findFirst({
    where: {
      code,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    return `The code "${code}" is already in use. Choose a different code.`;
  }

  return null;
}

function isUniqueCodeError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function createDiscount(
  _prevState: DiscountFormState,
  formData: FormData,
): Promise<DiscountFormState> {
  await requireAdmin();

  const data = parseDiscountFormData(formData);

  if (!data.code) {
    return { error: "Discount code is required." };
  }

  if (!Number.isFinite(data.value) || data.value < 0) {
    return { error: "Enter a valid discount value." };
  }

  const duplicate = await duplicateCodeMessage(data.code);
  if (duplicate) {
    return { error: duplicate };
  }

  try {
    await prisma.discount.create({ data });
  } catch (error) {
    if (isUniqueCodeError(error)) {
      return {
        error: `The code "${data.code}" is already in use. Choose a different code.`,
      };
    }
    throw error;
  }

  revalidatePath("/admin/discounts");
  await flashAdminSaved();
  return {};
}

export async function updateDiscount(
  discountId: string,
  formData: FormData,
): Promise<DiscountFormState> {
  await requireAdmin();

  const data = parseDiscountFormData(formData);

  if (!data.code) {
    return { error: "Discount code is required." };
  }

  if (!Number.isFinite(data.value) || data.value < 0) {
    return { error: "Enter a valid discount value." };
  }

  const duplicate = await duplicateCodeMessage(data.code, discountId);
  if (duplicate) {
    return { error: duplicate };
  }

  try {
    await prisma.discount.update({
      where: { id: discountId },
      data,
    });
  } catch (error) {
    if (isUniqueCodeError(error)) {
      return {
        error: `The code "${data.code}" is already in use. Choose a different code.`,
      };
    }
    throw error;
  }

  revalidatePath("/admin/discounts");
  await flashAdminSaved();
  return {};
}

export async function deleteDiscount(discountId: string) {
  await requireAdmin();

  await prisma.discount.delete({ where: { id: discountId } });

  revalidatePath("/admin/discounts");
  await flashAdminSaved();
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
  await flashAdminSaved();
}
