import { prisma } from "@/lib/prisma";

export const SITE_SALE_ENABLED_KEY = "site_wide_sale_enabled";
export const SITE_SALE_PERCENT_KEY = "site_wide_sale_percent";

export type SiteSaleSettings = {
  enabled: boolean;
  percent: number;
};

export async function getSiteSaleSettings(): Promise<SiteSaleSettings> {
  const settings = await prisma.storeSetting.findMany({
    where: {
      key: { in: [SITE_SALE_ENABLED_KEY, SITE_SALE_PERCENT_KEY] },
    },
  });

  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return {
    enabled: map[SITE_SALE_ENABLED_KEY] === "true",
    percent: Math.min(100, Math.max(0, parseInt(map[SITE_SALE_PERCENT_KEY] ?? "0", 10) || 0)),
  };
}
