import type Stripe from "stripe";

let stripeClient: Stripe | null = null;

export async function getStripe() {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    const { default: StripeClient } = await import("stripe");
    stripeClient = new StripeClient(key, {
      apiVersion: "2026-05-27.dahlia",
    });
  }
  return stripeClient;
}
