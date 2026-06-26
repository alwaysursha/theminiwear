"use client";

import { useState } from "react";
import Link from "next/link";
import { createCheckoutSession } from "@/app/(storefront)/checkout/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";

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
  isDefault: boolean;
};

export function CheckoutForm({
  addresses,
  userEmail,
  isLoggedIn,
}: {
  addresses: Address[];
  userEmail?: string | null;
  isLoggedIn: boolean;
}) {
  const { items, getTotal } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(addresses.length === 0);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">(
    "standard",
  );

  const shippingCost = shippingMethod === "express" ? 12.99 : 5.99;
  const subtotal = getTotal();
  const total = subtotal + shippingCost;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await createCheckoutSession({
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        addressId: useNewAddress
          ? undefined
          : (formData.get("addressId") as string) || undefined,
        guestEmail: isLoggedIn
          ? undefined
          : (formData.get("guestEmail") as string),
        shippingCost,
        discountCode: (formData.get("discountCode") as string) || undefined,
        shippingAddress: useNewAddress
          ? {
              fullName: formData.get("fullName") as string,
              line1: formData.get("line1") as string,
              line2: (formData.get("line2") as string) || undefined,
              city: formData.get("city") as string,
              state: formData.get("state") as string,
              postalCode: formData.get("postalCode") as string,
              country: formData.get("country") as string,
              phone: (formData.get("phone") as string) || undefined,
            }
          : undefined,
      });

      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center">
        <p className="text-navy/60">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-4 inline-block text-coral hover:underline"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        {!isLoggedIn && (
          <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-navy">Contact</h2>
            <div className="mt-4">
              <Label htmlFor="guestEmail">Email</Label>
              <Input
                id="guestEmail"
                name="guestEmail"
                type="email"
                required
                defaultValue={userEmail ?? ""}
                className="mt-1.5"
              />
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-navy">
            Shipping Address
          </h2>

          {addresses.length > 0 && (
            <div className="mt-4 space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-navy/10 p-4 has-[:checked]:border-coral has-[:checked]:bg-blush/20"
                >
                  <input
                    type="radio"
                    name="addressId"
                    value={addr.id}
                    defaultChecked={addr.isDefault}
                    onChange={() => setUseNewAddress(false)}
                    className="mt-1"
                  />
                  <div className="text-sm">
                    <p className="font-semibold text-navy">
                      {addr.label} — {addr.fullName}
                    </p>
                    <p className="text-navy/60">
                      {addr.line1}
                      {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city},{" "}
                      {addr.state} {addr.postalCode}
                    </p>
                  </div>
                </label>
              ))}
              <button
                type="button"
                onClick={() => setUseNewAddress(true)}
                className="text-sm font-semibold text-coral hover:underline"
              >
                + Use a new address
              </button>
            </div>
          )}

          {(useNewAddress || addresses.length === 0) && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
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
                <Input
                  id="postalCode"
                  name="postalCode"
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  defaultValue="US"
                  required
                  className="mt-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" className="mt-1.5" />
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-navy">Shipping</h2>
          <div className="mt-4 space-y-3">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-navy/10 p-4 has-[:checked]:border-coral has-[:checked]:bg-blush/20">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingMethod === "standard"}
                  onChange={() => setShippingMethod("standard")}
                />
                <div>
                  <p className="font-semibold text-navy">Standard Shipping</p>
                  <p className="text-sm text-navy/60">5–7 business days</p>
                </div>
              </div>
              <span className="font-semibold text-navy">{formatPrice(5.99)}</span>
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-navy/10 p-4 has-[:checked]:border-coral has-[:checked]:bg-blush/20">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingMethod === "express"}
                  onChange={() => setShippingMethod("express")}
                />
                <div>
                  <p className="font-semibold text-navy">Express Shipping</p>
                  <p className="text-sm text-navy/60">2–3 business days</p>
                </div>
              </div>
              <span className="font-semibold text-navy">
                {formatPrice(12.99)}
              </span>
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
          <Label htmlFor="discountCode">Discount Code</Label>
          <Input
            id="discountCode"
            name="discountCode"
            placeholder="Enter code"
            className="mt-1.5"
          />
        </section>
      </div>

      <div className="h-fit rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-navy">Summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.variantId} className="flex justify-between text-navy/70">
              <span className="truncate pr-2">
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between text-navy/70">
            <span>Shipping</span>
            <span>{formatPrice(shippingCost)}</span>
          </div>
        </div>
        <div className="mt-4 flex justify-between border-t border-navy/10 pt-4 font-display text-lg font-bold text-navy">
          <span>Total</span>
          <span className="text-coral">{formatPrice(total)}</span>
        </div>
        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}
        <Button type="submit" className="mt-6 w-full" size="lg" disabled={loading}>
          {loading ? "Processing..." : "Pay with Stripe"}
        </Button>
      </div>
    </form>
  );
}
