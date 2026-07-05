import { prisma } from "@/lib/prisma";

export const TICKER_KEYS = {
  customLine: "ticker_custom_line",
  showFreeShipping: "ticker_show_free_shipping",
  secondaryLine: "ticker_secondary_line",
} as const;

const DEFAULT_SECONDARY =
  "Orders processed and shipped within 2-5 business days";

export type TickerSettings = {
  customLine: string;
  showFreeShipping: boolean;
  secondaryLine: string;
};

export function defaultTickerSettings(): TickerSettings {
  return {
    customLine: "",
    showFreeShipping: true,
    secondaryLine: DEFAULT_SECONDARY,
  };
}

export async function getTickerSettings(): Promise<TickerSettings> {
  const settings = await prisma.storeSetting.findMany({
    where: { key: { in: Object.values(TICKER_KEYS) } },
  });
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  const defaults = defaultTickerSettings();

  return {
    customLine: map[TICKER_KEYS.customLine] ?? defaults.customLine,
    showFreeShipping:
      map[TICKER_KEYS.showFreeShipping] !== "false",
    secondaryLine:
      map[TICKER_KEYS.secondaryLine]?.trim() || defaults.secondaryLine,
  };
}

const SP = " ".repeat(20);

/** Build scrolling ticker text from admin settings + optional free-shipping line. */
export function buildTickerAnnouncement(
  settings: TickerSettings,
  freeShippingMessage?: string | null,
) {
  const parts: string[] = [];

  if (settings.customLine.trim()) {
    parts.push(settings.customLine.trim());
  }

  if (settings.showFreeShipping && freeShippingMessage) {
    parts.push(freeShippingMessage);
  }

  if (settings.secondaryLine.trim()) {
    parts.push(settings.secondaryLine.trim());
  }

  if (parts.length === 0) {
    parts.push(DEFAULT_SECONDARY);
  }

  return `${parts.join(`${SP}/${SP}`)}${SP}/${SP}`;
}
