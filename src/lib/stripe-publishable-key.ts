import { getCloudflareContext } from "@opennextjs/cloudflare";

type CloudflareBindings = {
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
};

/** Stripe publishable key — server runtime (Workers vars/secrets) and local .env. */
export function readStripePublishableKey(): string | undefined {
  const fromProcess = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  if (fromProcess) {
    return fromProcess;
  }

  try {
    const { env } = getCloudflareContext();
    const bindings = env as typeof env & CloudflareBindings;
    const fromBinding = bindings.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
    if (fromBinding) {
      return fromBinding;
    }
  } catch {
    // Outside Cloudflare runtime
  }

  return undefined;
}

export function requireStripePublishableKey(): string {
  const key = readStripePublishableKey();
  if (!key) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
  }
  return key;
}
