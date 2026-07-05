import { Lock } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/storefront/CheckoutForm";
import { DEFAULT_SHIPPING_COUNTRY } from "@/lib/shipping";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await auth();
  const addresses = session?.user?.id
    ? await prisma.address.findMany({
        where: { userId: session.user.id },
        orderBy: [{ isDefault: "desc" }, { label: "asc" }],
      })
    : [];

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
            Secure checkout
          </p>
          <h1 className="shop-hero-title mt-2 font-display text-4xl font-extrabold text-navy sm:text-5xl">
            Checkout
          </h1>
          <p className="shop-hero-sub mt-3 max-w-md text-navy/60">
            Just a few details and your little ones&apos; new favorites are on
            their way.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <CheckoutForm
          addresses={addresses}
          userEmail={session?.user?.email}
          userName={session?.user?.name}
          isLoggedIn={!!session?.user}
          defaultCountry={DEFAULT_SHIPPING_COUNTRY}
        />
      </div>
    </div>
  );
}
