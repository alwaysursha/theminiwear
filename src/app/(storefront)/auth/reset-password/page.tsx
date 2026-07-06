import Link from "next/link";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/storefront/ResetPasswordForm";
import { findPasswordResetEmail } from "@/lib/password-reset";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const trimmedToken = token?.trim() ?? "";
  const email = trimmedToken ? await findPasswordResetEmail(trimmedToken) : null;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-2xl border border-navy/10 bg-white p-8 shadow-sm">
        <h1 className="font-display text-2xl font-extrabold text-navy">
          Choose a new password
        </h1>

        {!email ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-red-600">
              This reset link is invalid or has expired.
            </p>
            <Link
              href="/auth/forgot-password"
              className="inline-flex text-sm font-semibold text-coral hover:underline"
            >
              Request a new reset link
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-navy/60">
              Set a new password for <strong>{email}</strong>.
            </p>
            <div className="mt-6">
              <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-blush/30" />}>
                <ResetPasswordForm token={trimmedToken} />
              </Suspense>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
