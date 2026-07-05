"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";

export function EmbeddedCheckoutPanel({
  clientSecret,
  publishableKey,
}: {
  clientSecret: string;
  publishableKey: string;
}) {
  const stripePromise = useMemo(
    () => loadStripe(publishableKey),
    [publishableKey],
  );

  return (
    <div className="rounded-3xl border border-navy/8 bg-background p-2 pb-6 shadow-[0_8px_30px_rgba(30,42,74,0.06)] sm:p-3 sm:pb-8">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ clientSecret }}
      >
        <div className="stripe-embedded-checkout min-h-[520px] overflow-hidden rounded-2xl bg-background">
          <EmbeddedCheckout className="bg-background" />
        </div>
      </EmbeddedCheckoutProvider>
    </div>
  );
}

export function EmbeddedCheckoutError({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm text-red-700">{message}</p>
      <Link
        href="/checkout"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-coral"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to checkout
      </Link>
    </div>
  );
}

export function EmbeddedCheckoutAside() {
  return (
    <div className="lg:sticky lg:top-24 h-fit space-y-4">
      <div className="rounded-3xl border border-navy/8 bg-white p-6 shadow-[0_8px_30px_rgba(30,42,74,0.07)]">
        <h2 className="font-display text-lg font-extrabold text-navy">
          Secure payment
        </h2>
        <p className="mt-2 text-sm text-navy/60">
          Your card details are encrypted and processed by Stripe. We never store
          your full card number.
        </p>
        <ul className="mt-5 space-y-3 text-sm text-navy/70">
          <li className="flex items-center gap-2">
            <Lock className="h-4 w-4 shrink-0 text-coral" />
            SSL-encrypted checkout
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-coral" />
            Powered by Stripe
          </li>
        </ul>
      </div>
      <Link
        href="/checkout"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy/55 transition-colors hover:text-coral"
      >
        <ArrowLeft className="h-4 w-4" />
        Edit shipping &amp; details
      </Link>
    </div>
  );
}
