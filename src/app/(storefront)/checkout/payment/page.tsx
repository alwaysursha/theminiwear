import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { getEmbeddedCheckoutClientSecret } from "@/app/(storefront)/checkout/actions";
import {
  EmbeddedCheckoutAside,
  EmbeddedCheckoutError,
  EmbeddedCheckoutPanel,
} from "@/components/storefront/EmbeddedCheckoutPanel";
import { readStripePublishableKey } from "@/lib/stripe-publishable-key";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ session_id?: string }>;

export default async function CheckoutPaymentPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const sessionId = params.session_id?.trim();

  if (!sessionId) {
    redirect("/checkout");
  }

  const publishableKey = readStripePublishableKey();
  const secretResult = await getEmbeddedCheckoutClientSecret(sessionId);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-blush/45 via-[#fffaf9] to-[#fffaf9]">
        <div
          className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-coral/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-10 top-6 h-56 w-56 rounded-full bg-mint/40 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <p className="shop-hero-eyebrow flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-coral">
            <Lock className="h-3.5 w-3.5" />
            Secure payment
          </p>
          <h1 className="shop-hero-title mt-2 font-display text-4xl font-extrabold text-navy sm:text-5xl">
            Complete your order
          </h1>
          <p className="shop-hero-sub mt-3 max-w-md text-navy/60">
            You&apos;re almost there — enter payment details below.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pb-20 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {!publishableKey ? (
            <EmbeddedCheckoutError message="Payments are not configured yet. Please contact support." />
          ) : "error" in secretResult ? (
            <EmbeddedCheckoutError message={secretResult.error} />
          ) : (
            <EmbeddedCheckoutPanel
              clientSecret={secretResult.clientSecret}
              publishableKey={publishableKey}
            />
          )}
          <EmbeddedCheckoutAside />
        </div>
        <p className="mt-6 text-center text-xs text-navy/45">
          Need help?{" "}
          <Link href="/contact" className="font-semibold text-coral hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
