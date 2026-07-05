import type Stripe from "stripe";
import { getCloudflareContext } from "@opennextjs/cloudflare";

type CloudflareBindings = {
  STRIPE_SECRET_KEY?: string;
};

function readStripeSecretKey(): string | undefined {
  if (process.env.STRIPE_SECRET_KEY) {
    return process.env.STRIPE_SECRET_KEY;
  }

  try {
    const { env } = getCloudflareContext();
    const bindings = env as typeof env & CloudflareBindings;
    if (typeof bindings.STRIPE_SECRET_KEY === "string" && bindings.STRIPE_SECRET_KEY) {
      return bindings.STRIPE_SECRET_KEY;
    }
  } catch {
    // Outside Cloudflare runtime
  }

  return undefined;
}

let stripeClient: Stripe | null = null;

export async function getStripe() {
  if (!stripeClient) {
    const key = readStripeSecretKey();
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    const { default: StripeClient } = await import("stripe");
    stripeClient = new StripeClient(key, {
      apiVersion: "2026-05-27.dahlia",
      // Cloudflare Workers must use fetch — Node's HTTP client fails with
      // "An error occurred with our connection to Stripe. Request was retried."
      httpClient: StripeClient.createFetchHttpClient(),
    });
  }
  return stripeClient;
}
