import { prisma } from "@/lib/prisma";

export const DEFAULT_SHIPPING_COUNTRY = "CA";

export type ShippingQuote = {
  id: string;
  name: string;
  price: number;
  estimatedDays: string | null;
};

export function normalizeCountryCode(country: string): string {
  return country.trim().toUpperCase();
}

function rateMatchesSubtotal(
  rate: { minOrder: unknown; maxOrder: unknown },
  subtotal: number,
): boolean {
  const min = rate.minOrder != null ? Number(rate.minOrder) : null;
  const max = rate.maxOrder != null ? Number(rate.maxOrder) : null;

  if (min != null && subtotal < min) {
    return false;
  }
  if (max != null && subtotal > max) {
    return false;
  }

  return true;
}

export async function findShippingZoneForCountry(country: string) {
  const normalizedCountry = normalizeCountryCode(country);
  const zones = await prisma.shippingZone.findMany({
    where: { isActive: true },
    include: { rates: true },
    orderBy: { name: "asc" },
  });

  return (
    zones.find((zone) =>
      zone.countries.some(
        (zoneCountry) =>
          normalizeCountryCode(zoneCountry) === normalizedCountry,
      ),
    ) ?? null
  );
}

export async function getShippingQuotes(
  country: string,
  subtotal: number,
): Promise<ShippingQuote[]> {
  const zone = await findShippingZoneForCountry(country);
  if (!zone) {
    return [];
  }

  return zone.rates
    .filter((rate) => rateMatchesSubtotal(rate, subtotal))
    .map((rate) => ({
      id: rate.id,
      name: rate.name,
      price: Number(rate.price),
      estimatedDays: rate.estimatedDays,
    }))
    .sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
}

export async function validateShippingRate(input: {
  rateId: string;
  country: string;
  subtotal: number;
}): Promise<{ quote: ShippingQuote } | { error: string }> {
  const quotes = await getShippingQuotes(input.country, input.subtotal);
  const quote = quotes.find((entry) => entry.id === input.rateId);

  if (!quote) {
    return {
      error:
        "The selected shipping option is not available for this address and order total.",
    };
  }

  return { quote };
}

export async function getFreeShippingThreshold(
  country: string = DEFAULT_SHIPPING_COUNTRY,
): Promise<number | null> {
  const zone = await findShippingZoneForCountry(country);
  if (!zone) {
    return null;
  }

  const thresholds = zone.rates
    .filter(
      (rate) => Number(rate.price) === 0 && rate.minOrder != null,
    )
    .map((rate) => Number(rate.minOrder))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (thresholds.length === 0) {
    return null;
  }

  return Math.min(...thresholds);
}

export async function resolveShippingCountry(input: {
  addressId?: string;
  shippingAddress?: { country: string };
  userId?: string;
}): Promise<string | null> {
  if (input.shippingAddress?.country) {
    return input.shippingAddress.country;
  }

  if (input.addressId) {
    const address = await prisma.address.findFirst({
      where: {
        id: input.addressId,
        ...(input.userId ? { userId: input.userId } : {}),
      },
      select: { country: true },
    });
    return address?.country ?? null;
  }

  return null;
}

export async function resolveCheckoutShipping(input: {
  shippingRateId: string;
  country: string;
  subtotal: number;
  freeShippingDiscount?: boolean;
}): Promise<
  | { shippingCost: number; shippingLabel: string; shippingRateId: string }
  | { error: string }
> {
  const validated = await validateShippingRate({
    rateId: input.shippingRateId,
    country: input.country,
    subtotal: input.subtotal,
  });

  if ("error" in validated) {
    return validated;
  }

  if (input.freeShippingDiscount) {
    return {
      shippingCost: 0,
      shippingLabel: "Free shipping",
      shippingRateId: validated.quote.id,
    };
  }

  return {
    shippingCost: validated.quote.price,
    shippingLabel: validated.quote.name,
    shippingRateId: validated.quote.id,
  };
}
