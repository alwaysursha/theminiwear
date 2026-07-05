"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Minus,
  Plus,
  RotateCcw,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useCartStore, type CartItem } from "@/lib/cart-store";
import { measurementLabel } from "@/lib/custom-size";
import { cn, formatPrice } from "@/lib/utils";

export function CartContent({
  freeShippingThreshold = null,
}: {
  freeShippingThreshold?: number | null;
}) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getTotal = useCartStore((s) => s.getTotal);
  const getItemCount = useCartStore((s) => s.getItemCount);

  const [mounted, setMounted] = useState(false);
  const [confirm, setConfirm] = useState<CartItem | null>(null);
  const [exiting, setExiting] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!confirm) return;
    const scrollY = window.scrollY;
    const previous = document.body.style.cssText;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setConfirm(null);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.cssText = previous;
      window.scrollTo(0, scrollY);
    };
  }, [confirm]);

  if (!mounted) return <BagSkeleton />;

  if (items.length === 0) return <EmptyBag />;

  const subtotal = getTotal();
  const itemCount = getItemCount();
  const threshold = freeShippingThreshold ?? 0;
  const showFreeShippingProgress = freeShippingThreshold != null && threshold > 0;
  const remaining = showFreeShippingProgress
    ? Math.max(0, threshold - subtotal)
    : 0;
  const progress = showFreeShippingProgress
    ? Math.min(100, (subtotal / threshold) * 100)
    : 0;

  function confirmRemove() {
    if (!confirm) return;
    const id = confirm.lineId;
    setConfirm(null);
    setExiting(id);
    window.setTimeout(() => {
      removeItem(id);
      setExiting(null);
    }, 300);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <p className="text-sm text-navy/55">
          <span className="font-display text-base font-extrabold text-navy">
            {itemCount}
          </span>{" "}
          {itemCount === 1 ? "item" : "items"} in your bag
        </p>

        {items.map((item, index) => (
          <div
            key={item.lineId}
            className={cn(
              "bag-line group relative flex gap-4 rounded-2xl border border-navy/8 bg-white p-3.5 shadow-[0_2px_14px_rgba(30,42,74,0.06)] transition-shadow duration-300 hover:shadow-[0_16px_38px_rgba(30,42,74,0.11)] sm:p-4",
              exiting === item.lineId && "bag-line-exit",
            )}
            style={{ "--reveal-i": Math.min(index, 10) } as CSSProperties}
          >
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-blush/50 to-sky/40 ring-1 ring-navy/5 sm:h-28 sm:w-28">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  sizes="112px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-3xl">
                  👕
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-display font-bold text-navy">
                    {item.name}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-navy/[0.05] px-2.5 py-0.5 text-[11px] font-semibold text-navy/70">
                      {item.size}
                    </span>
                    <span className="rounded-full bg-navy/[0.05] px-2.5 py-0.5 text-[11px] font-semibold text-navy/70">
                      {item.color}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirm(item)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-navy/35 transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {item.custom && (
                <div className="mt-2 rounded-xl border border-coral/20 bg-coral/[0.05] px-2.5 py-2">
                  <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-coral">
                    <Scissors className="h-3 w-3" aria-hidden />
                    Custom fit · +{formatPrice(item.custom.fee)}
                  </p>
                  <ul className="mt-1 space-y-0.5 text-[11px] text-navy/60">
                    {Object.entries(item.custom.measurements).map(
                      ([key, value]) => (
                        <li key={key}>
                          <span className="font-semibold text-navy/75">
                            {measurementLabel(key)}:
                          </span>{" "}
                          {value}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}

              <div className="mt-auto flex items-end justify-between pt-3">
                <div className="inline-flex items-center rounded-full border border-navy/12 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.lineId, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-navy/70 transition-colors hover:bg-blush/50 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-9 text-center text-sm font-bold text-navy">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.lineId, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.stock}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-navy/70 transition-colors hover:bg-blush/50 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="font-display text-base font-extrabold text-navy">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-[11px] text-navy/45">
                      {formatPrice(item.price)} each
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        <Link
          href="/shop"
          className="group inline-flex items-center gap-2 pt-2 text-sm font-semibold text-navy/60 transition-colors hover:text-coral"
        >
          <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-0.5" />
          Continue shopping
        </Link>
      </div>

      <div className="lg:sticky lg:top-24 h-fit">
        <div className="rounded-3xl border border-navy/8 bg-white p-6 shadow-[0_8px_30px_rgba(30,42,74,0.07)]">
          <h2 className="font-display text-lg font-extrabold text-navy">
            Bag summary
          </h2>

          {showFreeShippingProgress && (
            <div className="mt-5 rounded-2xl bg-gradient-to-br from-mint/30 to-sky/25 p-4">
              {remaining > 0 ? (
                <p className="text-xs font-semibold text-navy">
                  You&apos;re{" "}
                  <span className="font-bold text-coral">
                    {formatPrice(remaining)}
                  </span>{" "}
                  away from free shipping
                </p>
              ) : (
                <p className="flex items-center gap-1.5 text-xs font-bold text-navy">
                  <Truck className="h-4 w-4 text-coral" />
                  You&apos;ve unlocked free shipping!
                </p>
              )}
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-white/70">
                <div
                  className="bag-progress-fill h-full rounded-full bg-gradient-to-r from-coral to-[#ffb08f]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between text-navy/65">
              <span>Subtotal ({itemCount})</span>
              <span className="font-semibold text-navy">
                {formatPrice(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-navy/65">
              <span>Shipping</span>
              {remaining > 0 ? (
                <span>Calculated at checkout</span>
              ) : (
                <span className="font-semibold text-coral">Free</span>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between border-t border-navy/10 pt-4">
            <span className="font-display text-base font-bold text-navy">
              Total
            </span>
            <span className="font-display text-2xl font-extrabold text-coral">
              {formatPrice(subtotal)}
            </span>
          </div>

          <Link
            href="/checkout"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-6 flex w-full items-center justify-center gap-2 text-base shadow-[0_10px_28px_rgba(255,127,110,0.35)] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]",
            )}
          >
            Checkout
            <ArrowRight className="h-5 w-5" />
          </Link>

          <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-navy/50">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure checkout
            </span>
            <span className="inline-flex items-center gap-1">
              <RotateCcw className="h-3.5 w-3.5" />
              Easy returns
            </span>
          </div>
        </div>
      </div>

      {confirm &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <div
              className="bag-backdrop-in absolute inset-0 bg-navy/45 backdrop-blur-sm"
              onClick={() => setConfirm(null)}
              aria-hidden
            />
            <div
              className="bag-modal-in relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/70 bg-white p-6 shadow-[0_24px_70px_rgba(30,42,74,0.28)]"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="bag-remove-title"
            >
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-navy/40 transition-colors hover:bg-navy/[0.05] hover:text-navy"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-start gap-4 pr-6">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-blush/50 to-sky/40 ring-1 ring-navy/5">
                  {confirm.image ? (
                    <Image
                      src={confirm.image}
                      alt={confirm.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl">
                      👕
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3
                    id="bag-remove-title"
                    className="font-display text-lg font-extrabold text-navy"
                  >
                    Remove from bag?
                  </h3>
                  <p className="mt-1 text-sm text-navy/60">
                    Remove{" "}
                    <span className="font-semibold text-navy">
                      {confirm.name}
                    </span>{" "}
                    ({confirm.size} / {confirm.color}) from your bag?
                  </p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirm(null)}
                  className="flex-1 rounded-full border border-navy/15 py-2.5 text-sm font-bold text-navy transition-colors hover:bg-navy/[0.04]"
                >
                  Keep it
                </button>
                <button
                  type="button"
                  onClick={confirmRemove}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-red-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

function EmptyBag() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-navy/15 bg-gradient-to-b from-white to-blush/20 py-20 text-center">
      <span className="bag-empty-icon flex h-20 w-20 items-center justify-center rounded-full bg-blush/50">
        <ShoppingBag className="h-9 w-9 text-coral" />
      </span>
      <h2 className="mt-6 font-display text-2xl font-extrabold text-navy">
        Your bag is empty
      </h2>
      <p className="mt-2 max-w-xs text-sm text-navy/55">
        Add some adorable little outfits and they&apos;ll show up right here.
      </p>
      <Link
        href="/shop"
        className={cn(buttonVariants({ size: "lg" }), "mt-7")}
      >
        Start shopping
      </Link>
    </div>
  );
}

function BagSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-2xl bg-navy/[0.04]"
          />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-3xl bg-navy/[0.04]" />
    </div>
  );
}
