"use client";

import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAddress } from "@/app/(storefront)/account/addresses/actions";

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

export function AddressesList({ addresses: initial }: { addresses: Address[] }) {
  const [showForm, setShowForm] = useState(false);
  const [addresses, setAddresses] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await createAddress(new FormData(e.currentTarget));
    setLoading(false);
    if (result.success && "address" in result && result.address) {
      setAddresses((prev) => [...prev, result.address as Address]);
      setShowForm(false);
      e.currentTarget.reset();
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Saved Addresses</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
            Add Address
          </Button>
        </CardHeader>
        <CardContent>
          {addresses.length === 0 && !showForm ? (
            <div className="py-8 text-center text-navy/60">
              <MapPin className="mx-auto h-8 w-8 text-navy/30" />
              <p className="mt-2">No saved addresses yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="rounded-xl border border-navy/10 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-navy">{addr.label}</p>
                    {addr.isDefault && (
                      <span className="rounded-full bg-mint/50 px-2 py-0.5 text-xs font-semibold text-navy">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-navy/70">
                    {addr.fullName}
                    <br />
                    {addr.line1}
                    {addr.line2 && <>, {addr.line2}</>}
                    <br />
                    {addr.city}, {addr.state} {addr.postalCode}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Address</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="label">Label</Label>
                <Input id="label" name="label" defaultValue="Home" required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" required className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="line1">Address Line 1</Label>
                <Input id="line1" name="line1" required className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="line2">Address Line 2</Label>
                <Input id="line2" name="line2" className="mt-1.5" />
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
              <div className="sm:col-span-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Address"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
