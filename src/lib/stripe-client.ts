import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { requireStripePublishableKey } from "@/lib/stripe-publishable-key";

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripePublishableKey(): string {
  return requireStripePublishableKey();
}

export function getStripeJs(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(getStripePublishableKey());
  }
  return stripePromise;
}
