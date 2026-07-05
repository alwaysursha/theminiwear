import { NextResponse } from "next/server";
import { getSiteUrl } from "@/emails/theme";
import { getStripe } from "@/lib/stripe";
import { STRIPE_CURRENCY } from "@/lib/currency";
import { stripeCheckoutErrorMessage } from "@/lib/stripe-checkout";

export const dynamic = "force-dynamic";

function envPresent(name: string) {
  return Boolean(process.env[name]);
}

export async function GET(request: Request) {
  const siteUrl = getSiteUrl();
  let stripeReady = false;
  let stripeError: string | undefined;
  let checkoutProbe: { ok: boolean; error?: string } | undefined;

  try {
    await getStripe();
    stripeReady = true;
  } catch (error) {
    stripeError =
      error instanceof Error ? error.message : "Stripe initialization failed";
  }

  const { searchParams } = new URL(request.url);
  if (stripeReady && searchParams.get("probe") === "checkout") {
    try {
      const stripe = await getStripe();
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: STRIPE_CURRENCY,
              product_data: { name: "Checkout probe" },
              unit_amount: 100,
            },
            quantity: 1,
          },
        ],
        success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/cart`,
      });
      checkoutProbe = { ok: Boolean(session.url) };
    } catch (error) {
      checkoutProbe = { ok: false, error: stripeCheckoutErrorMessage(error) };
    }
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
        R2_PUBLIC_URL: envPresent("R2_PUBLIC_URL"),
      },
      stripe: stripeReady ? "ready" : stripeError,
      checkoutProbe,
    },
    { status: stripeReady ? 200 : 503 },
  );
}
