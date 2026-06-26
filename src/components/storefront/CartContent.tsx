"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function CartContent() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy/20 bg-blush/20 py-20 text-center">
        <ShoppingBag className="h-12 w-12 text-navy/30" />
        <p className="mt-4 font-display text-lg font-bold text-navy">Your cart is empty</p>
        <p className="mt-1 text-sm text-navy/60">Add some adorable outfits!</p>
        <Link href="/shop" className={cn(buttonVariants(), "mt-6")}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex gap-4 rounded-2xl border border-navy/10 bg-white p-4 shadow-sm"
          >
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-blush/30">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-navy/30">
                  No img
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/shop`}
                    className="font-display font-bold text-navy hover:text-coral"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm text-navy/60">
                    {item.size} / {item.color}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.variantId)}
                  className="rounded-full p-1.5 text-navy/40 hover:bg-blush hover:text-coral"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <p className="font-semibold text-navy">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-fit rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-navy">Order Summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-navy/70">
            <span>Subtotal</span>
            <span>{formatPrice(getTotal())}</span>
          </div>
          <div className="flex justify-between text-navy/70">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
        </div>
        <div className="mt-4 flex justify-between border-t border-navy/10 pt-4 font-display text-lg font-bold text-navy">
          <span>Total</span>
          <span>{formatPrice(getTotal())}</span>
        </div>
        <Link href="/checkout" className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full")}>
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
