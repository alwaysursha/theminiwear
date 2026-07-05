/** ISO 4217 code for storefront display (Intl.NumberFormat). */
export const STORE_CURRENCY =
  process.env.NEXT_PUBLIC_STORE_CURRENCY ?? "CAD";

/** ISO 4217 code for Stripe API (lowercase). */
export const STRIPE_CURRENCY = STORE_CURRENCY.toLowerCase();

const LOCALE_BY_CURRENCY: Record<string, string> = {
  CAD: "en-CA",
  USD: "en-US",
  GBP: "en-GB",
  EUR: "en-IE",
  AUD: "en-AU",
};

export function formatMoney(
  amount: number | string,
  currency: string = STORE_CURRENCY,
) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  const locale = LOCALE_BY_CURRENCY[currency] ?? "en-CA";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}
