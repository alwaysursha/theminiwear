"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);

    const result = await requestPasswordReset(new FormData(e.currentTarget));
    if (result.ok) {
      setStatus("success");
      setMessage(result.message ?? "Check your email for a reset link.");
      return;
    }

    setStatus("error");
    setMessage(result.error ?? "Could not send reset email.");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1.5"
            placeholder="you@example.com"
          />
        </div>
        {message && (
          <p
            className={`text-sm ${
              status === "success" ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={status === "loading"}>
          {status === "loading" ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <p className="text-center text-sm text-navy/60">
        Remember your password?{" "}
        <Link href="/auth/sign-in" className="font-semibold text-coral hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
