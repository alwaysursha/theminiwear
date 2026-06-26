"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { updateProfile } from "@/app/(storefront)/account/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({
  name,
  email,
  phone,
}: {
  name: string;
  email: string;
  phone: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const result = await updateProfile(new FormData(e.currentTarget));
    setStatus(result.success ? "success" : "error");
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={name}
            required
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={email}
            disabled
            className="mt-1.5 opacity-60"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={phone}
            className="mt-1.5"
          />
        </div>
        {status === "success" && (
          <p className="text-sm text-green-600">Profile updated!</p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-600">Failed to update profile</p>
        )}
        <Button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      <div className="border-t border-navy/10 pt-6">
        <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}
