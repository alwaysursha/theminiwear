import type { Metadata } from "next";
import { CartContent } from "@/components/storefront/CartContent";
import { getFreeShippingThreshold } from "@/lib/shipping";
import { noIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = noIndexMetadata(
  "Shopping cart",
  "Review items in your cart before checkout.",
);

export default async function CartPage() {
  let freeShippingThreshold: number | null = null;

  try {
    freeShippingThreshold = await getFreeShippingThreshold();
  } catch {
    // Hide progress bar when shipping settings are unavailable.
  }

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-blush/45 via-[#fffaf9] to-[#fffaf9]">
        <div
          className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-coral/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-10 top-6 h-56 w-56 rounded-full bg-sky/40 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <p className="shop-hero-eyebrow text-xs font-bold uppercase tracking-[0.25em] text-coral">
            Almost yours
          </p>
          <h1 className="shop-hero-title mt-2 font-display text-4xl font-extrabold text-navy sm:text-5xl">
            Your Bag
          </h1>
          <p className="shop-hero-sub mt-3 max-w-md text-navy/60">
            Review your little picks before checkout — every outfit is packed
            with love.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <CartContent freeShippingThreshold={freeShippingThreshold} />
      </div>
    </div>
  );
}
