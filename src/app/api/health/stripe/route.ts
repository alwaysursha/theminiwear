import { NextResponse } from "next/server";
import { getSiteUrl } from "@/emails/theme";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

function envPresent(name: string) {
  return Boolean(process.env[name]);
}

export async function GET() {
  const siteUrl = getSiteUrl();
  let stripeReady = false;
  let stripeError: string | undefined;

  try {
    await getStripe();
    stripeReady = true;
  } catch (error) {
    stripeError =
      error instanceof Error ? error.message : "Stripe initialization failed";
  }

  return NextResponse.json(
    {
      ok: stripeReady,
      siteUrl,
      env: {
        DATABASE_URL: envPresent("DATABASE_URL"),
        NEXTAUTH_SECRET: envPresent("NEXTAUTH_SECRET"),
        NEXTAUTH_URL: envPresent("NEXTAUTH_URL"),
        STRIPE_SECRET_KEY: envPresent("STRIPE_SECRET_KEY"),
        STRIPE_WEBHOOK_SECRET: envPresent("STRIPE_WEBHOOK_SECRET"),
      },
      stripe: stripeReady ? "ready" : stripeError,
    },
    { status: stripeReady ? 200 : 503 },
  );
}
