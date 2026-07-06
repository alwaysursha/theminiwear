"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { updateProfile } from "@/app/(storefront)/account/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { firstNameOf, markPendingSignedOutToast } from "@/lib/auth-toast-store";
import { cn } from "@/lib/utils";

export function ProfileForm({
  name,
  email,
  phone,
  onSignOut,
  variant = "default",
}: {
  name: string;
  email: string;
  phone: string;
  onSignOut?: () => void;
  variant?: "default" | "panel";
}) {
  const isPanel = variant === "panel";
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [signingOut, setSigningOut] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const result = await updateProfile(new FormData(e.currentTarget));
    setStatus(result.success ? "success" : "error");
  }

  async function handleSignOut() {
    setSigningOut(true);
    onSignOut?.();
    markPendingSignedOutToast(firstNameOf(name));
    await signOut({ callbackUrl: "/" });
  }

  return (
    <div className={cn(isPanel ? "space-y-4" : "space-y-8")}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={name}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={email}
            disabled
            className="mt-1 opacity-60"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={phone}
            className="mt-1"
          />
        </div>
        {status === "success" && (
          <p className={cn("text-xs", isPanel ? "text-mint" : "text-green-600")}>
            Profile updated!
          </p>
        )}
        {status === "error" && (
          <p className="text-xs text-red-400">Failed to update profile</p>
        )}
        <Button type="submit" size={isPanel ? "sm" : "default"} disabled={status === "loading"}>
          {status === "loading" ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      <div className={cn("account-panel-divider border-t pt-4", isPanel ? "" : "border-navy/10 pt-6")}>
        <Button
          size={isPanel ? "sm" : "default"}
          variant="outline"
          className={isPanel ? "border-white/20 bg-white/5 text-white hover:bg-white/10" : undefined}
          onClick={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? "Signing out..." : "Sign Out"}
        </Button>
      </div>
    </div>
  );
}
