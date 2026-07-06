"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { registerUser } from "@/app/(storefront)/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthToastStore, firstNameOf } from "@/lib/auth-toast-store";
import { sanitizeAuthCallbackUrl } from "@/lib/constants";

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showAuthToast = useAuthToastStore((s) => s.showAuthToast);
  const callbackUrl = sanitizeAuthCallbackUrl(
    searchParams.get("callbackUrl"),
    "/",
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const signInHref =
    callbackUrl && callbackUrl !== "/"
      ? `/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/auth/sign-in";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const submitBtn = e.currentTarget.querySelector('button[type="submit"]');
    const rect = submitBtn?.getBoundingClientRect();
    const fromX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const fromY = rect ? rect.top + rect.height / 2 : window.innerHeight - 80;

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await registerUser(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInResult?.error) {
      router.push(signInHref);
      return;
    }

    showAuthToast({
      kind: "signed-up",
      firstName: firstNameOf(formData.get("name") as string),
      fromX,
      fromY,
    });

    router.replace(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required className="mt-1.5" />
      </div>
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
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="mt-1.5"
        />
        <p className="mt-1 text-xs text-navy/50">At least 8 characters</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account..." : "Create Account"}
      </Button>
      <p className="text-center text-sm text-navy/60">
        Already have an account?{" "}
        <Link href={signInHref} className="font-semibold text-coral hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
