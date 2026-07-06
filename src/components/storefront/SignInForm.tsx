"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  resolvePostAuthDestination,
  sanitizeAuthCallbackUrl,
} from "@/lib/constants";
import { useAuthToastStore, firstNameOf } from "@/lib/auth-toast-store";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();
  const showAuthToast = useAuthToastStore((s) => s.showAuthToast);
  const callbackUrl = sanitizeAuthCallbackUrl(
    searchParams.get("callbackUrl"),
    "/",
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const signUpHref =
    callbackUrl && callbackUrl !== "/"
      ? `/auth/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/auth/sign-up";

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) {
      return;
    }

    router.replace(
      resolvePostAuthDestination(callbackUrl, session.user.role),
    );
  }, [status, session, callbackUrl, router]);

  async function handleCredentials(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const submitBtn = e.currentTarget.querySelector('button[type="submit"]');
    const rect = submitBtn?.getBoundingClientRect();
    const fromX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const fromY = rect ? rect.top + rect.height / 2 : window.innerHeight - 80;

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError("Invalid email or password");
      return;
    }

    const nextSession = await update();
    showAuthToast({
      kind: "signed-in",
      firstName: firstNameOf(nextSession?.user?.name),
      fromX,
      fromY,
    });

    const destination = resolvePostAuthDestination(
      callbackUrl,
      nextSession?.user?.role,
    );
    router.replace(destination);
    router.refresh();
  }

  async function handleGoogle() {
    setLoading(true);
    window.sessionStorage.setItem("mw-auth-welcome", "1");
    const redirectTarget = encodeURIComponent(callbackUrl);
    await signIn("google", {
      callbackUrl: `/auth/redirect?callbackUrl=${redirectTarget}`,
    });
  }

  if (status === "authenticated") {
    return (
      <div className="py-8 text-center text-sm text-navy/60">
        You&apos;re signed in. Redirecting…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCredentials} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1.5"
          />
        </div>
        <div>
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-semibold text-coral hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1.5"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-navy/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-navy/50">or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogle}
        disabled={loading}
      >
        Continue with Google
      </Button>

      <p className="text-center text-sm text-navy/60">
        Don&apos;t have an account?{" "}
        <Link href={signUpHref} className="font-semibold text-coral hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
