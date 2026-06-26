"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addressSchema = z.object({
  label: z.string().min(1),
  fullName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export async function createAddress(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false as const, error: "Unauthorized" };

  try {
    const data = addressSchema.parse({
      label: formData.get("label"),
      fullName: formData.get("fullName"),
      line1: formData.get("line1"),
      line2: formData.get("line2") || undefined,
      city: formData.get("city"),
      state: formData.get("state"),
      postalCode: formData.get("postalCode"),
      country: formData.get("country"),
      phone: formData.get("phone") || undefined,
      isDefault: formData.get("isDefault") === "on",
    });

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    await prisma.address.create({
      data: { ...data, userId: session.user.id },
    });

    revalidatePath("/account/addresses");
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Invalid address data" };
  }
}

export async function deleteAddress(addressId: string) {
  const session = await auth();
  if (!session?.user) return { success: false as const, error: "Unauthorized" };

  await prisma.address.deleteMany({
    where: { id: addressId, userId: session.user.id },
  });

  revalidatePath("/account/addresses");
  return { success: true as const };
}
