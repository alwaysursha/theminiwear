"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createShippingZone(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const countriesRaw = formData.get("countries") as string;
  const isActive = formData.get("isActive") === "on";

  const countries = countriesRaw
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);

  await prisma.shippingZone.create({
    data: { name, countries, isActive },
  });

  revalidatePath("/admin/shipping");
}

export async function updateShippingZone(zoneId: string, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const countriesRaw = formData.get("countries") as string;
  const isActive = formData.get("isActive") === "on";

  const countries = countriesRaw
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);

  await prisma.shippingZone.update({
    where: { id: zoneId },
    data: { name, countries, isActive },
  });

  revalidatePath("/admin/shipping");
}

export async function deleteShippingZone(zoneId: string) {
  await requireAdmin();

  await prisma.shippingZone.delete({ where: { id: zoneId } });

  revalidatePath("/admin/shipping");
}

export async function createShippingRate(zoneId: string, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const minOrderRaw = formData.get("minOrder") as string;
  const maxOrderRaw = formData.get("maxOrder") as string;
  const estimatedDays = (formData.get("estimatedDays") as string) || null;

  await prisma.shippingRate.create({
    data: {
      zoneId,
      name,
      price,
      minOrder: minOrderRaw ? parseFloat(minOrderRaw) : null,
      maxOrder: maxOrderRaw ? parseFloat(maxOrderRaw) : null,
      estimatedDays,
    },
  });

  revalidatePath("/admin/shipping");
}

export async function updateShippingRate(rateId: string, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const minOrderRaw = formData.get("minOrder") as string;
  const maxOrderRaw = formData.get("maxOrder") as string;
  const estimatedDays = (formData.get("estimatedDays") as string) || null;

  await prisma.shippingRate.update({
    where: { id: rateId },
    data: {
      name,
      price,
      minOrder: minOrderRaw ? parseFloat(minOrderRaw) : null,
      maxOrder: maxOrderRaw ? parseFloat(maxOrderRaw) : null,
      estimatedDays,
    },
  });

  revalidatePath("/admin/shipping");
}

export async function deleteShippingRate(rateId: string) {
  await requireAdmin();

  await prisma.shippingRate.delete({ where: { id: rateId } });

  revalidatePath("/admin/shipping");
}
