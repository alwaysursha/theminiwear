import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/storefront/ForgotPasswordForm";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-2xl border border-navy/10 bg-white p-8 shadow-sm">
        <h1 className="font-display text-2xl font-extrabold text-navy">
          Forgot password?
        </h1>
        <p className="mt-2 text-sm text-navy/60">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
        <div className="mt-6">
          <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-blush/30" />}>
            <ForgotPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
