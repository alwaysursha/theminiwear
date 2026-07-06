"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { resetPassword } from "@/lib/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set("token", token);

    const result = await resetPassword(formData);
    if (result.ok) {
      setStatus("success");
      setMessage("Your password was updated. You can sign in now.");
      window.setTimeout(() => router.push("/auth/sign-in"), 1800);
      return;
    }

    setStatus("error");
    setMessage(result.error ?? "Could not reset password.");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            className="mt-1.5"
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
          {status === "loading" ? "Updating..." : "Update password"}
        </Button>
      </form>

      <p className="text-center text-sm text-navy/60">
        <Link href="/auth/forgot-password" className="font-semibold text-coral hover:underline">
          Request a new reset link
        </Link>
      </p>
    </div>
  );
}
