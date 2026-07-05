"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import type { AdminSaveState } from "@/lib/admin-form-state";
import { prisma } from "@/lib/prisma";

function revalidateShipping() {
  revalidatePath("/admin/shipping");
  revalidatePath("/checkout");
  revalidatePath("/cart");
  revalidatePath("/shop");
}

export async function createShippingZone(
  _prev: AdminSaveState,
  formData: FormData,
): Promise<AdminSaveState> {
  await requireAdmin();

  const name = formData.get("name") as string;
  const countriesRaw = formData.get("countries") as string;
  const isActive = formData.get("isActive") === "on";

  const countries = countriesRaw
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);

  try {
    await prisma.shippingZone.create({
      data: { name, countries, isActive },
    });

    revalidateShipping();
    return { ok: true };
  } catch {
    return { error: "Could not add shipping zone. Please try again." };
  }
}

export async function updateShippingZone(
  _prev: AdminSaveState,
  formData: FormData,
): Promise<AdminSaveState> {
  await requireAdmin();

  const zoneId = String(formData.get("zoneId") ?? "").trim();
  if (!zoneId) {
    return { error: "Zone not found." };
  }

  const name = formData.get("name") as string;
  const countriesRaw = formData.get("countries") as string;
  const isActive = formData.get("isActive") === "on";

  const countries = countriesRaw
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);

  try {
    await prisma.shippingZone.update({
      where: { id: zoneId },
      data: { name, countries, isActive },
    });

    revalidateShipping();
    return { ok: true };
  } catch {
    return { error: "Could not save zone. Please try again." };
  }
}

export async function deleteShippingZone(zoneId: string) {
  await requireAdmin();

  await prisma.shippingZone.delete({ where: { id: zoneId } });

  revalidateShipping();
}

export async function createShippingRate(
  _prev: AdminSaveState,
  formData: FormData,
): Promise<AdminSaveState> {
  await requireAdmin();

  const zoneId = String(formData.get("zoneId") ?? "").trim();
  if (!zoneId) {
    return { error: "Zone not found." };
  }

  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const minOrderRaw = formData.get("minOrder") as string;
  const maxOrderRaw = formData.get("maxOrder") as string;
  const estimatedDays = (formData.get("estimatedDays") as string) || null;

  try {
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

    revalidateShipping();
    return { ok: true };
  } catch {
    return { error: "Could not add rate. Please try again." };
  }
}

export async function updateShippingRate(
  _prev: AdminSaveState,
  formData: FormData,
): Promise<AdminSaveState> {
  await requireAdmin();

  const rateId = String(formData.get("rateId") ?? "").trim();
  if (!rateId) {
    return { error: "Rate not found." };
  }

  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const minOrderRaw = formData.get("minOrder") as string;
  const maxOrderRaw = formData.get("maxOrder") as string;
  const estimatedDays = (formData.get("estimatedDays") as string) || null;

  try {
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

    revalidateShipping();
    return { ok: true };
  } catch {
    return { error: "Could not save rate. Please try again." };
  }
}

export async function deleteShippingRate(rateId: string) {
  await requireAdmin();

  await prisma.shippingRate.delete({ where: { id: rateId } });

  revalidateShipping();
}
