import { Suspense } from "react";
import { SignInForm } from "@/components/storefront/SignInForm";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-2xl border border-navy/10 bg-white p-8 shadow-sm">
        <h1 className="font-display text-2xl font-extrabold text-navy">
          Welcome back!
        </h1>
        <p className="mt-2 text-sm text-navy/60">
          Sign in to track orders and manage your account
        </p>
        <div className="mt-6">
          <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-blush/30" />}>
            <SignInForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
