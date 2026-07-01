"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { ArrowRight, Check, ShoppingBag, Sparkles, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { useCartUiStore } from "@/lib/cart-ui-store";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

type FlyTarget = {
  dx: number;
  dy: number;
};

export function CartAddedCelebration() {
  const celebration = useCartUiStore((s) => s.celebration);
  const dismissCelebration = useCartUiStore((s) => s.dismissCelebration);
  const setCartPulse = useCartUiStore((s) => s.setCartPulse);
  const itemCount = useCartStore((s) => s.getItemCount());
  const cartTotal = useCartStore((s) => s.getTotal());

  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null);
  const [flyPhase, setFlyPhase] = useState<"idle" | "flying" | "landed">("idle");
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (!celebration) {
      setFlyTarget(null);
      setFlyPhase("idle");
      setShowPanel(false);
      setCartPulse(false);
      return;
    }

    const cartAnchor = document.getElementById("site-cart-anchor");
    if (!cartAnchor) {
      setFlyPhase("landed");
      setShowPanel(true);
      setCartPulse(true);
      return;
    }

    const cartRect = cartAnchor.getBoundingClientRect();
    const toX = cartRect.left + cartRect.width / 2;
    const toY = cartRect.top + cartRect.height / 2;

    setFlyTarget({
      dx: toX - celebration.fromX,
      dy: toY - celebration.fromY,
    });
    setFlyPhase("flying");
    setShowPanel(false);

    const landTimer = window.setTimeout(() => {
      setFlyPhase("landed");
      setCartPulse(true);
      window.setTimeout(() => setCartPulse(false), 1600);
    }, 900);

    const panelTimer = window.setTimeout(() => {
      setShowPanel(true);
    }, 1050);

    return () => {
      window.clearTimeout(landTimer);
      window.clearTimeout(panelTimer);
    };
  }, [celebration, setCartPulse]);

  useEffect(() => {
    if (!celebration) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") dismissCelebration();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [celebration, dismissCelebration]);

  useEffect(() => {
    if (!showPanel) {
      document.body.style.removeProperty("position");
      document.body.style.removeProperty("top");
      document.body.style.removeProperty("width");
      document.body.style.removeProperty("padding-right");
      return;
    }

    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.removeProperty("position");
      document.body.style.removeProperty("top");
      document.body.style.removeProperty("width");
      document.body.style.removeProperty("padding-right");
      window.scrollTo(0, scrollY);
    };
  }, [showPanel]);

  if (!celebration) return null;

  return (
    <>
      <div
        className={cn(
          "cart-celebration-backdrop fixed inset-0 z-[90] bg-navy/40 backdrop-blur-[2px] transition-opacity duration-500",
          showPanel ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        aria-hidden
      />

      {flyTarget && flyPhase === "flying" && (
        <div
          className="cart-fly-item pointer-events-none fixed z-[115]"
          style={
            {
              left: celebration.fromX,
              top: celebration.fromY,
              "--fly-dx": `${flyTarget.dx}px`,
              "--fly-dy": `${flyTarget.dy}px`,
            } as CSSProperties
          }
          aria-hidden
        >
          <div className="cart-fly-glow absolute inset-0 rounded-full bg-coral/40 blur-md" />
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl border-[3px] border-white bg-white shadow-[0_12px_32px_rgba(255,127,110,0.45)] ring-2 ring-coral/30">
            {celebration.image ? (
              <Image
                src={celebration.image}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl">👕</div>
            )}
          </div>
        </div>
      )}

      {flyPhase === "landed" && (
        <div
          className="cart-fly-burst pointer-events-none fixed z-[112]"
          style={{ left: celebration.fromX + (flyTarget?.dx ?? 0), top: celebration.fromY + (flyTarget?.dy ?? 0) }}
          aria-hidden
        />
      )}

      <div
        className={cn(
          "fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6",
          showPanel ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "cart-celebration-panel flex max-h-[min(90vh,640px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_24px_80px_rgba(30,42,74,0.22)] sm:rounded-3xl",
            showPanel
              ? "cart-celebration-panel-visible"
              : "scale-95 opacity-0",
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-celebration-title"
        >
        <div className="cart-celebration-shine pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-mint/30 via-blush/20 to-transparent" aria-hidden />

        <button
          type="button"
          onClick={dismissCelebration}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-navy shadow-sm transition-colors hover:bg-blush/60 sm:right-4 sm:top-4 sm:h-9 sm:w-9"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative px-4 pb-5 pt-6 sm:px-7 sm:pb-7 sm:pt-8">
          <div className="cart-celebration-check mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-mint to-sky shadow-[0_8px_24px_rgba(126,207,192,0.45)] ring-2 ring-mint/25 sm:h-16 sm:w-16 sm:ring-4">
            <Check className="h-6 w-6 text-navy sm:h-8 sm:w-8" strokeWidth={3} />
          </div>

          <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-coral sm:mt-4 sm:text-xs sm:tracking-[0.2em]">
            Added to your bag
          </p>
          <h2
            id="cart-celebration-title"
            className="mt-1.5 text-center font-display text-xl font-extrabold text-navy sm:mt-2 sm:text-2xl"
          >
            Looking good!
          </h2>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-navy/8 bg-gradient-to-br from-blush/25 via-white to-sky/20 p-3 sm:mt-6 sm:gap-4 sm:rounded-2xl sm:p-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 border-white bg-white shadow-md sm:h-20 sm:w-20 sm:rounded-xl">
              {celebration.image ? (
                <Image
                  src={celebration.image}
                  alt={celebration.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-3xl">👕</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-display font-bold text-navy sm:text-base">{celebration.name}</p>
              <p className="mt-0.5 text-xs text-navy/60 sm:mt-1 sm:text-sm">
                {celebration.size} · {celebration.color}
              </p>
              <p className="mt-1 font-display text-base font-extrabold text-coral sm:mt-2 sm:text-lg">
                {formatPrice(celebration.price)}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-lg bg-navy/[0.04] px-3 py-2.5 text-xs sm:mt-4 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm">
            <span className="font-semibold text-navy/70">
              Bag total ({itemCount} {itemCount === 1 ? "item" : "items"})
            </span>
            <span className="font-display font-bold text-navy">{formatPrice(cartTotal)}</span>
          </div>

          <div className="mt-4 space-y-2 sm:mt-6 sm:space-y-3">
            <Link
              href="/checkout"
              onClick={dismissCelebration}
              className={cn(
                buttonVariants({ size: "lg" }),
                "cart-celebration-cta-primary flex h-11 w-full text-sm shadow-[0_8px_22px_rgba(255,127,110,0.32)] sm:h-12 sm:text-base sm:shadow-[0_10px_28px_rgba(255,127,110,0.38)]",
              )}
            >
              Checkout now
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>

            <Button
              size="lg"
              variant="outline"
              className="h-11 w-full text-sm sm:h-12 sm:text-base"
              onClick={dismissCelebration}
            >
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Continue shopping
            </Button>

            <Link
              href="/cart"
              onClick={dismissCelebration}
              className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-navy/55 transition-colors hover:text-coral sm:gap-2 sm:py-2 sm:text-sm"
            >
              <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              View full bag
            </Link>
          </div>

          <p className="mt-3 text-center text-[10px] text-navy/45 sm:mt-4 sm:text-xs">
            Item flew to your bag{" "}
            <span className="inline-flex align-middle text-coral">↑</span> top right
          </p>
        </div>
        </div>
      </div>
    </>
  );
}
