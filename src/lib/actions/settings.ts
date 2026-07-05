"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import type { AdminSaveState } from "@/lib/admin-form-state";
import { prisma } from "@/lib/prisma";
import {
  SITE_SALE_ENABLED_KEY,
  SITE_SALE_PERCENT_KEY,
  STORE_INFO_KEYS,
} from "@/lib/settings";

export async function updateSiteWideSale(
  _prev: AdminSaveState,
  formData: FormData,
): Promise<AdminSaveState> {
  await requireAdmin();

  const enabled = formData.get("siteWideSaleEnabled") === "on";
  const percent = Math.min(
    100,
    Math.max(0, parseInt(formData.get("siteWideSalePercent") as string, 10) || 0),
  );

  try {
    await prisma.$transaction([
      prisma.storeSetting.upsert({
        where: { key: SITE_SALE_ENABLED_KEY },
        create: { key: SITE_SALE_ENABLED_KEY, value: String(enabled) },
        update: { value: String(enabled) },
      }),
      prisma.storeSetting.upsert({
        where: { key: SITE_SALE_PERCENT_KEY },
        create: { key: SITE_SALE_PERCENT_KEY, value: String(percent) },
        update: { value: String(percent) },
      }),
    ]);

    revalidatePath("/admin/discounts");
    revalidatePath("/");
    revalidatePath("/shop");
    return { ok: true };
  } catch {
    return { error: "Could not save site-wide sale. Please try again." };
  }
}

export async function updateStoreInfo(
  _prev: AdminSaveState,
  formData: FormData,
): Promise<AdminSaveState> {
  await requireAdmin();

  const get = (name: string) =>
    ((formData.get(name) as string | null) ?? "").trim();

  const entries: { key: string; value: string }[] = [
    { key: STORE_INFO_KEYS.name, value: get("name") },
    { key: STORE_INFO_KEYS.description, value: get("description") },
    { key: STORE_INFO_KEYS.currency, value: get("currency") },
    { key: STORE_INFO_KEYS.timezone, value: get("timezone") },
    {
      key: STORE_INFO_KEYS.whatsappE164,
      value: get("whatsappE164").replace(/[^0-9]/g, ""),
    },
    { key: STORE_INFO_KEYS.whatsappDisplay, value: get("whatsappDisplay") },
    { key: STORE_INFO_KEYS.whatsappIntro, value: get("whatsappIntro") },
  ];

  try {
    await prisma.$transaction(
      entries.map((entry) =>
        prisma.storeSetting.upsert({
          where: { key: entry.key },
          create: { key: entry.key, value: entry.value },
          update: { value: entry.value },
        }),
      ),
    );

    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return { error: "Could not save store information. Please try again." };
  }
}
