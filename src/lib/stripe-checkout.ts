import { STRIPE_CURRENCY } from "@/lib/currency";
import { toAbsoluteUrl } from "@/emails/theme";

/** Stripe must fetch product images over public HTTPS — skip app-proxied media. */
export function stripeCheckoutImageUrl(
  url: string | undefined,
): string | undefined {
  if (!url) return undefined;

  if (url.startsWith("/api/media/")) {
    const r2Public = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
    if (r2Public) {
      const objectKey = url.replace(/^\/api\/media\//, "");
      return `${r2Public}/${objectKey}`;
    }
    return undefined;
  }

  const absolute = toAbsoluteUrl(url);
  if (!absolute.startsWith("https://")) {
    return undefined;
  }

  return absolute;
}

export function stripeCheckoutProductData(input: {
  name: string;
  description?: string;
  imageUrl?: string;
}) {
  const productData: {
    name: string;
    description?: string;
    images?: string[];
  } = { name: input.name };

  if (input.description) {
    productData.description = input.description;
  }

  const image = stripeCheckoutImageUrl(input.imageUrl);
  if (image) {
    productData.images = [image];
  }

  return productData;
}

export function stripeCheckoutShippingLineItem(input: {
  shippingCost: number;
  label: string;
}) {
  if (input.shippingCost <= 0) {
    return null;
  }

  return {
    price_data: {
      currency: STRIPE_CURRENCY,
      product_data: { name: input.label },
      unit_amount: Math.round(input.shippingCost * 100),
    },
    quantity: 1,
  };
}

export function stripeCheckoutErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "type" in error &&
    typeof (error as { type?: string }).type === "string" &&
    (error as { type: string }).type.startsWith("Stripe")
  ) {
    const stripeError = error as { message?: string; code?: string };
    if (stripeError.code === "account_invalid") {
      return "Stripe account is not ready for live payments. Check your Stripe dashboard.";
    }
    return stripeError.message ?? "Stripe checkout failed";
  }

  if (error instanceof Error) {
    if (error.message.includes("STRIPE_SECRET_KEY")) {
      return "Payments are not configured yet. Please contact support.";
    }
    return error.message;
  }

  return "Checkout failed. Please try again.";
}
