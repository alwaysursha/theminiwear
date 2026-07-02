import { prisma } from "@/lib/prisma";
import {
  SITE_NAME,
  SITE_DESCRIPTION,
  WHATSAPP_PHONE_E164,
  WHATSAPP_DISPLAY,
  WHATSAPP_MESSAGE_INTRO,
} from "@/lib/constants";

export const SITE_SALE_ENABLED_KEY = "site_wide_sale_enabled";
export const SITE_SALE_PERCENT_KEY = "site_wide_sale_percent";

export const STORE_INFO_KEYS = {
  name: "store_name",
  description: "store_description",
  currency: "store_currency",
  timezone: "store_timezone",
  whatsappE164: "store_whatsapp_e164",
  whatsappDisplay: "store_whatsapp_display",
  whatsappIntro: "store_whatsapp_intro",
} as const;

export type StoreInfo = {
  name: string;
  description: string;
  currency: string;
  timezone: string;
  whatsappE164: string;
  whatsappDisplay: string;
  whatsappIntro: string;
};

export async function getStoreInfo(): Promise<StoreInfo> {
  const settings = await prisma.storeSetting.findMany({
    where: { key: { in: Object.values(STORE_INFO_KEYS) } },
  });
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  const pick = (key: string, fallback: string) => {
    const value = map[key];
    return value != null && value.trim() !== "" ? value : fallback;
  };

  return {
    name: pick(STORE_INFO_KEYS.name, SITE_NAME),
    description: pick(STORE_INFO_KEYS.description, SITE_DESCRIPTION),
    currency: pick(STORE_INFO_KEYS.currency, "USD"),
    timezone: pick(STORE_INFO_KEYS.timezone, "America/New_York"),
    whatsappE164: pick(STORE_INFO_KEYS.whatsappE164, WHATSAPP_PHONE_E164),
    whatsappDisplay: pick(STORE_INFO_KEYS.whatsappDisplay, WHATSAPP_DISPLAY),
    whatsappIntro: pick(STORE_INFO_KEYS.whatsappIntro, WHATSAPP_MESSAGE_INTRO),
  };
}

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
