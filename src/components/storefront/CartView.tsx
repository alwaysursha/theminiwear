"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";

export function CartView() {
  const { items, updateQuantity, removeItem, getTotal, getItemCount } =
    useCartStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy/20 bg-blush/20 py-20 text-center">
        <ShoppingBag className="h-12 w-12 text-navy/30" />
        <p className="mt-4 font-display text-xl font-bold text-navy">
          Your cart is empty
        </p>
        <p className="mt-2 text-sm text-navy/60">
          Add some adorable outfits to get started!
        </p>
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
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-sky/30">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl">
                  👕
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col">
              <Link
                href={`/shop`}
                className="font-display font-bold text-navy hover:text-coral"
              >
                {item.name}
              </Link>
              <p className="text-sm text-navy/60">
                {item.size} / {item.color}
              </p>
              <p className="mt-1 font-semibold text-coral">
                {formatPrice(item.price)}
              </p>
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.variantId, item.quantity - 1)
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-navy/15 hover:bg-blush/40"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.variantId, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.stock}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-navy/15 hover:bg-blush/40 disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.variantId)}
                  className="text-navy/40 hover:text-coral"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-fit rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-navy">
          Order Summary
        </h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-navy/70">
            <span>Items ({getItemCount()})</span>
            <span>{formatPrice(getTotal())}</span>
          </div>
          <div className="flex justify-between text-navy/70">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
        </div>
        <div className="mt-4 flex justify-between border-t border-navy/10 pt-4 font-display text-lg font-bold text-navy">
          <span>Subtotal</span>
          <span className="text-coral">{formatPrice(getTotal())}</span>
        </div>
        <Link
          href="/checkout"
          className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full")}
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
