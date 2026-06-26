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
import { Badge } from "@/components/ui/badge";

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

export function AddressesManager({ addresses }: { addresses: Address[] }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await createAddress(new FormData(e.currentTarget));
    setLoading(false);
    setShowForm(false);
    e.currentTarget.reset();
  }

  async function handleDelete(id: string) {
    await deleteAddress(id);
  }

  return (
    <div className="space-y-6">
      {addresses.length === 0 && !showForm && (
        <p className="text-sm text-navy/60">No saved addresses yet.</p>
      )}

      <div className="space-y-3">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="flex items-start justify-between rounded-2xl border border-navy/10 bg-white p-5 shadow-sm"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-navy">{addr.label}</p>
                {addr.isDefault && <Badge variant="new">Default</Badge>}
              </div>
              <p className="mt-1 text-sm text-navy/70">
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
              className="text-navy/30 hover:text-coral"
              aria-label="Delete address"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {showForm ? (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-2xl border border-navy/10 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input id="label" name="label" defaultValue="Home" required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" required className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="line1">Address</Label>
              <Input id="line1" name="line1" required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" name="postalCode" required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" defaultValue="US" required className="mt-1.5" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-navy">
            <input type="checkbox" name="isDefault" />
            Set as default
          </label>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Address"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)}>
          + Add Address
        </Button>
      )}
    </div>
  );
}
