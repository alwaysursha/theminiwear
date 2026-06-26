"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  SITE_SALE_ENABLED_KEY,
  SITE_SALE_PERCENT_KEY,
} from "@/lib/settings";

export async function updateSiteWideSale(formData: FormData) {
  await requireAdmin();

  const enabled = formData.get("siteWideSaleEnabled") === "on";
  const percent = Math.min(
    100,
    Math.max(0, parseInt(formData.get("siteWideSalePercent") as string, 10) || 0),
  );

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

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/shop");
}
