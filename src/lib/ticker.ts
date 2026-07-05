import { prisma } from "@/lib/prisma";

export const TICKER_MESSAGES_KEY = "ticker_messages";

/** Legacy keys — migrated into `ticker_messages` on read. */
const LEGACY_TICKER_KEYS = {
  customLine: "ticker_custom_line",
  showFreeShipping: "ticker_show_free_shipping",
  secondaryLine: "ticker_secondary_line",
} as const;

const DEFAULT_PROCESSING_MESSAGE =
  "Orders processed and shipped within 2-5 business days";

const DEFAULT_FREE_SHIPPING_MESSAGE =
  "Free shipping on orders over $100.00";

export type TickerSettings = {
  messages: string[];
};

export function seedTickerMessages(): string[] {
  return [DEFAULT_FREE_SHIPPING_MESSAGE, DEFAULT_PROCESSING_MESSAGE];
}

export function normalizeTickerMessages(messages: string[]): string[] {
  return messages.map((message) => message.trim()).filter(Boolean);
}

function parseMessagesJson(raw: string | undefined): string[] | null {
  if (!raw?.trim()) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }
    return normalizeTickerMessages(parsed.map((entry) => String(entry)));
  } catch {
    return null;
  }
}

function migrateLegacyMessages(
  map: Record<string, string | undefined>,
): string[] {
  const parts: string[] = [];

  const customLine = map[LEGACY_TICKER_KEYS.customLine]?.trim();
  if (customLine) {
    parts.push(customLine);
  }

  const secondaryLine = map[LEGACY_TICKER_KEYS.secondaryLine]?.trim();
  if (secondaryLine) {
    parts.push(secondaryLine);
  }

  return normalizeTickerMessages(parts);
}

export async function getTickerSettings(): Promise<TickerSettings> {
  const settings = await prisma.storeSetting.findMany({
    where: {
      key: {
        in: [TICKER_MESSAGES_KEY, ...Object.values(LEGACY_TICKER_KEYS)],
      },
    },
  });
  const map = Object.fromEntries(settings.map((setting) => [setting.key, setting.value]));

  const fromJson = parseMessagesJson(map[TICKER_MESSAGES_KEY]);
  if (fromJson && fromJson.length > 0) {
    return { messages: fromJson };
  }

  const migrated = migrateLegacyMessages(map);
  if (migrated.length > 0) {
    return { messages: migrated };
  }

  return { messages: seedTickerMessages() };
}
