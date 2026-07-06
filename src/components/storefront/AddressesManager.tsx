"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  createAddress,
  deleteAddress,
} from "@/app/(storefront)/account/addresses/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Address = {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
};

export function AddressesManager({
  addresses,
  onMutate,
  variant = "default",
}: {
  addresses: Address[];
  onMutate?: () => void;
  variant?: "default" | "panel";
}) {
  const isPanel = variant === "panel";
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await createAddress(new FormData(e.currentTarget));
    setLoading(false);
    setShowForm(false);
    e.currentTarget.reset();
    onMutate?.();
  }

  async function handleDelete(id: string) {
    await deleteAddress(id);
    onMutate?.();
  }

  return (
    <div className={cn(isPanel ? "space-y-3" : "space-y-6")}>
      {addresses.length === 0 && !showForm && (
        <p className={cn("text-sm", isPanel ? "account-panel-muted" : "text-navy/60")}>
          No saved addresses yet.
        </p>
      )}

      <div className="space-y-2">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={cn(
              "flex items-start justify-between",
              isPanel
                ? "account-panel-card p-2.5"
                : "rounded-2xl border border-navy/10 bg-white p-5 shadow-sm",
            )}
          >
            <div className="relative z-[1] min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className={cn(
                    "font-semibold",
                    isPanel ? "text-sm text-white" : "text-navy",
                  )}
                >
                  {addr.label}
                </p>
                {addr.isDefault && (
                  <span
                    className={cn(
                      isPanel
                        ? "account-panel-status account-panel-status--coral"
                        : "rounded-full bg-coral/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-coral",
                    )}
                  >
                    Default
                  </span>
                )}
              </div>
              <p
                className={cn(
                  "mt-1 text-xs leading-relaxed",
                  isPanel ? "text-white/60" : "text-navy/70",
                )}
              >
                {addr.fullName}
                <br />
                {addr.line1}
                {addr.line2 && (
                  <>
                    <br />
                    {addr.line2}
                  </>
                )}
                <br />
                {addr.city}, {addr.state} {addr.postalCode}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(addr.id)}
              className={cn(
                "relative z-[1] shrink-0",
                isPanel ? "text-white/35 hover:text-[#ff9d70]" : "text-navy/30 hover:text-coral",
              )}
              aria-label="Delete address"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {showForm ? (
        <form
          onSubmit={handleCreate}
          className={cn(
            "space-y-3",
            isPanel
              ? "account-panel-form-card"
              : "rounded-2xl border border-navy/10 bg-white p-6 shadow-sm",
          )}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input id="label" name="label" defaultValue="Home" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" required className="mt-1" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="line1">Address</Label>
              <Input id="line1" name="line1" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" name="postalCode" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" defaultValue="US" required className="mt-1" />
            </div>
          </div>
          <label
            className={cn(
              "flex items-center gap-2 text-xs",
              isPanel ? "text-white/70" : "text-navy",
            )}
          >
            <input type="checkbox" name="isDefault" />
            Set as default
          </label>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Saving..." : "Save Address"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className={isPanel ? "border-white/20 bg-white/5 text-white hover:bg-white/10" : undefined}
          onClick={() => setShowForm(true)}
        >
          + Add Address
        </Button>
      )}
    </div>
  );
}
