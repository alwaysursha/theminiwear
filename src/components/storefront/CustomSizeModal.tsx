"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AlertCircle, Ruler, Scissors, ShoppingBag, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { useCartUiStore } from "@/lib/cart-ui-store";
import { getVariantPricing } from "@/lib/product-utils";
import type { CartProduct } from "@/lib/product-utils";
import type { SiteSaleSettings } from "@/lib/settings";
import { formatPrice, cn } from "@/lib/utils";
import {
  CUSTOM_MEASUREMENT_FIELDS,
  CUSTOM_NOTES_KEY,
  CUSTOM_SIZE_FEE,
  hasMeasurements,
  sanitizeMeasurements,
  type CustomMeasurements,
} from "@/lib/custom-size";

type CustomSizeModalProps = {
  product: CartProduct;
  siteSale?: SiteSaleSettings;
  initialColor: string | null;
  onClose: () => void;
};

export function CustomSizeModal({
  product,
  siteSale,
  initialColor,
  onClose,
}: CustomSizeModalProps) {
  const addItem = useCartStore((s) => s.addItem);
  const showCelebration = useCartUiStore((s) => s.showCelebration);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const measurementsRef = useRef<HTMLDivElement>(null);

  const colors = useMemo(
    () => [...new Set(product.variants.map((v) => v.color))],
    [product.variants],
  );

  const [selectedColor, setSelectedColor] = useState<string | null>(
    initialColor ?? colors[0] ?? null,
  );
  const [values, setValues] = useState<CustomMeasurements>({});
  const [showError, setShowError] = useState(false);

  // Size is decided by our tailors, so we only pick a representative in-stock
  // variant for the chosen color to anchor price and stock.
  const colorVariants = product.variants.filter(
    (v) => v.color === selectedColor,
  );
  const selectedVariant =
    colorVariants.find((v) => v.stock > 0) ?? colorVariants[0];
  const variantPricing = selectedVariant
    ? getVariantPricing(selectedVariant, product, siteSale)
    : null;

  const outOfStock = !selectedVariant || selectedVariant.stock < 1;
  const basePrice = variantPricing?.currentPrice ?? 0;
  const totalPerItem = basePrice + CUSTOM_SIZE_FEE;
  const measurementsFilled = hasMeasurements(sanitizeMeasurements(values));

  useEffect(() => {
    const scrollY = window.scrollY;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKeyDown);
      window.scrollTo(0, scrollY);
    };
  }, [onClose]);

  function setField(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (showError && value.trim()) setShowError(false);
  }

  function handleConfirm() {
    if (!selectedVariant || !variantPricing || outOfStock) return;

    const measurements = sanitizeMeasurements(values);
    if (!hasMeasurements(measurements)) {
      setShowError(true);
      measurementsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    const rect = confirmRef.current?.getBoundingClientRect();
    const fromX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const fromY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      size: "Custom fit",
      color: selectedVariant.color,
      price: totalPerItem,
      image: product.images[0]?.url,
      stock: selectedVariant.stock,
      quantity: 1,
      custom: { fee: CUSTOM_SIZE_FEE, measurements },
    });

    showCelebration({
      name: product.name,
      image: product.images[0]?.url,
      size: "Custom fit",
      color: selectedVariant.color,
      price: totalPerItem,
      quantity: 1,
      fromX,
      fromY,
      customFee: CUSTOM_SIZE_FEE,
    });

    onClose();
  }

  const errorActive = showError && !measurementsFilled;

  const modal = (
    <div className="fixed inset-0 z-[95] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-navy/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close"
      />
      <div
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/80 bg-white shadow-[0_24px_80px_rgba(30,42,74,0.28)] sm:rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-size-title"
      >
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-coral via-[#ff6b5a] to-[#ff9a76] px-5 pb-5 pt-6 text-white sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 sm:right-4 sm:top-4"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/85">
            <Scissors className="h-3.5 w-3.5" aria-hidden />
            Made to measure
          </div>
          <h2
            id="custom-size-title"
            className="mt-1.5 font-display text-2xl font-extrabold leading-tight"
          >
            Custom fit tailoring
          </h2>
          <p className="mt-1 text-sm text-white/85">
            Share your measurements and our tailors will craft it to fit your
            little one perfectly — no need to pick a size.
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
            <Ruler className="h-3.5 w-3.5" aria-hidden />
            +{formatPrice(CUSTOM_SIZE_FEE)} per item
          </span>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3 rounded-2xl border border-navy/8 bg-blush/15 p-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-navy/10 bg-white">
              {product.images[0]?.url ? (
                <Image
                  src={product.images[0].url}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-bold text-navy">
                {product.name}
              </p>
              <p className="text-xs text-navy/55">
                Base {variantPricing ? formatPrice(basePrice) : "—"}
              </p>
            </div>
          </div>

          {colors.length > 1 ? (
            <div>
              <p className="mb-2 text-xs font-bold text-navy">Which color?</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "rounded-full border-2 px-3.5 py-2 text-xs font-semibold transition-all sm:text-sm",
                      selectedColor === color
                        ? "border-coral bg-coral text-white shadow-[0_6px_18px_rgba(255,127,110,0.32)]"
                        : "border-navy/12 bg-white text-navy hover:border-coral/40",
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          ) : selectedColor ? (
            <div className="flex items-center justify-between rounded-xl border border-navy/10 bg-white px-3 py-2 text-sm">
              <span className="font-semibold text-navy/60">Color</span>
              <span className="font-bold text-navy">{selectedColor}</span>
            </div>
          ) : null}

          <div ref={measurementsRef} className="scroll-mt-6">
            <div className="mb-2 flex items-baseline justify-between">
              <p
                className={cn(
                  "text-xs font-bold",
                  errorActive ? "text-coral" : "text-navy",
                )}
              >
                Measurements{" "}
                <span className="font-semibold text-navy/45">
                  (at least one required)
                </span>
              </p>
              <span className="text-[11px] font-medium text-navy/45">
                inches
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {CUSTOM_MEASUREMENT_FIELDS.map((field) => (
                <label key={field.key} className="block">
                  <span className="mb-1 block text-[11px] font-semibold text-navy/70">
                    {field.label}
                  </span>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={values[field.key] ?? ""}
                      onChange={(e) => setField(field.key, e.target.value)}
                      placeholder="—"
                      className={cn(
                        "h-10 w-full rounded-xl border-2 bg-white pl-3 pr-9 text-sm font-semibold text-navy outline-none transition-colors focus:border-coral",
                        errorActive ? "border-coral/60" : "border-navy/12",
                      )}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-navy/35">
                      in
                    </span>
                  </div>
                </label>
              ))}
            </div>
            {errorActive && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-coral">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                Please enter at least one measurement so we can tailor the fit.
              </p>
            )}
          </div>

          <div>
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold text-navy/70">
                Notes for the tailor (optional)
              </span>
              <textarea
                value={values[CUSTOM_NOTES_KEY] ?? ""}
                onChange={(e) => setField(CUSTOM_NOTES_KEY, e.target.value)}
                rows={2}
                placeholder="e.g. slightly loose sleeves, add 1 inch for growth"
                className="w-full resize-none rounded-xl border-2 border-navy/12 bg-white px-3 py-2 text-sm text-navy outline-none transition-colors focus:border-coral"
              />
            </label>
          </div>
        </div>

        <div className="shrink-0 border-t border-navy/8 bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-7">
          <div className="mb-3 space-y-1 text-sm">
            <div className="flex items-center justify-between text-navy/60">
              <span>Item price</span>
              <span>{variantPricing ? formatPrice(basePrice) : "—"}</span>
            </div>
            <div className="flex items-center justify-between text-navy/60">
              <span>Custom-fit tailoring</span>
              <span>+{formatPrice(CUSTOM_SIZE_FEE)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-navy/8 pt-1.5 font-display text-base font-extrabold text-navy">
              <span>Per item</span>
              <span className="text-coral">
                {variantPricing ? formatPrice(totalPerItem) : "—"}
              </span>
            </div>
          </div>
          <div className="flex gap-2.5">
            <Button
              variant="outline"
              size="lg"
              className="h-12 flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <button
              ref={confirmRef}
              type="button"
              disabled={outOfStock}
              onClick={handleConfirm}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 flex-[1.4] shadow-[0_10px_26px_rgba(255,127,110,0.4)] disabled:opacity-60",
              )}
            >
              <ShoppingBag className="h-5 w-5" />
              {outOfStock ? "Out of stock" : "Add custom fit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
