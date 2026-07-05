/** Stripe publishable key — readable on the server at runtime (Workers secrets). */
export function readStripePublishableKey(): string | undefined {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || undefined;
}

export function requireStripePublishableKey(): string {
  const key = readStripePublishableKey();
  if (!key) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
  }
  return key;
}
