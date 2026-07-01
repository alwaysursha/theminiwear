"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ShoppingBag, Sparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SizeGuideModal } from "@/components/storefront/SizeGuideModal";
import { useCartStore } from "@/lib/cart-store";
import { useCartUiStore } from "@/lib/cart-ui-store";
import { getVariantPricing } from "@/lib/product-utils";
import type { CartProduct } from "@/lib/product-utils";
import { formatPrice } from "@/lib/utils";
import type { SiteSaleSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

type AddToCartSectionProps = {
  product: CartProduct;
  siteSale?: SiteSaleSettings;
};

function SelectorPill({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-full border-2 px-3 py-2 text-xs font-semibold transition-all duration-300 sm:px-4 sm:py-2.5 sm:text-sm",
        active
          ? "scale-100 border-coral bg-gradient-to-br from-coral to-[#ff6b5a] text-white shadow-[0_6px_20px_rgba(255,127,110,0.35)]"
          : disabled
            ? "cursor-not-allowed border-navy/8 bg-navy/5 text-navy/30 line-through"
            : "scale-[0.98] border-navy/12 bg-white/80 text-navy hover:scale-100 hover:border-coral/40 hover:shadow-sm",
      )}
    >
      {children}
    </button>
  );
}

function AddToCartButton({
  buttonRef,
  disabled,
  onClick,
  className,
}: {
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  disabled: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        buttonVariants({ size: "lg" }),
        "product-add-btn group relative h-11 w-full overflow-hidden py-2.5 text-sm font-bold sm:h-12 sm:py-4 sm:text-base",
        "shadow-[0_10px_24px_rgba(255,127,110,0.35)] transition-all duration-300 sm:shadow-[0_12px_32px_rgba(255,127,110,0.42)]",
        "hover:scale-[1.02] hover:shadow-[0_14px_32px_rgba(255,127,110,0.45)] active:scale-[0.98] disabled:hover:scale-100 sm:hover:shadow-[0_16px_40px_rgba(255,127,110,0.5)]",
        className,
      )}
    >
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        aria-hidden
      />
      <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
      Add to bag
    </button>
  );
}

export function AddToCartSection({ product, siteSale }: AddToCartSectionProps) {
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const showCelebration = useCartUiStore((s) => s.showCelebration);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const stickyButtonRef = useRef<HTMLButtonElement>(null);
  const [portalReady, setPortalReady] = useState(false);
  const [duplicatePrompt, setDuplicatePrompt] = useState<{
    fromX: number;
    fromY: number;
    existingQuantity: number;
    atMaxStock: boolean;
  } | null>(null);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const sizes = useMemo(
    () => [...new Set(product.variants.map((v) => v.size))],
    [product.variants],
  );
  const colors = useMemo(
    () => [...new Set(product.variants.map((v) => v.color))],
    [product.variants],
  );

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const selectedVariant = product.variants.find(
    (v) =>
      v.size === (selectedSize ?? sizes[0]) &&
      v.color === (selectedColor ?? colors[0]),
  );

  const activeSize = selectedSize ?? sizes[0] ?? null;
  const activeColor = selectedColor ?? colors[0] ?? null;

  const variantPricing = selectedVariant
    ? getVariantPricing(selectedVariant, product, siteSale)
    : null;

  const lowStock =
    selectedVariant != null &&
    selectedVariant.stock > 0 &&
    selectedVariant.stock < 5;

  const outOfStock = !selectedVariant || selectedVariant.stock < 1;

  function performAddToCart(fromX: number, fromY: number) {
    if (!selectedVariant || !variantPricing || selectedVariant.stock < 1) return;

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: variantPricing.currentPrice,
      image: product.images[0]?.url,
      stock: selectedVariant.stock,
      quantity: 1,
    });

    showCelebration({
      name: product.name,
      image: product.images[0]?.url,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: variantPricing.currentPrice,
      quantity: 1,
      fromX,
      fromY,
    });
  }

  function handleAddToCart(sourceButton: HTMLButtonElement | null) {
    if (!selectedVariant || !variantPricing || selectedVariant.stock < 1) return;

    const rect = sourceButton?.getBoundingClientRect();
    const fromX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const fromY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

    const existingItem = cartItems.find((item) => item.variantId === selectedVariant.id);
    if (existingItem) {
      setDuplicatePrompt({
        fromX,
        fromY,
        existingQuantity: existingItem.quantity,
        atMaxStock: existingItem.quantity >= existingItem.stock,
      });
      return;
    }

    performAddToCart(fromX, fromY);
  }

  function confirmAddAnother() {
    if (!duplicatePrompt) return;
    const { fromX, fromY } = duplicatePrompt;
    setDuplicatePrompt(null);
    performAddToCart(fromX, fromY);
  }

  const stickyCartBar = (
    <div className="product-sticky-cart fixed inset-x-0 bottom-0 z-50 border-t border-navy/10 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_28px_rgba(30,42,74,0.12)] backdrop-blur-md sm:p-4 lg:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-2.5 sm:gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold text-navy/55 sm:text-xs">
            {product.name}
          </p>
          <p className="font-display text-lg font-extrabold text-coral sm:text-xl">
            {variantPricing ? formatPrice(variantPricing.currentPrice) : "—"}
          </p>
        </div>
        <div className="w-[min(48%,9.5rem)] shrink-0 sm:w-[min(52%,11rem)]">
          <AddToCartButton
            buttonRef={stickyButtonRef}
            disabled={outOfStock}
            onClick={() => handleAddToCart(stickyButtonRef.current)}
            className="h-10 py-2 text-xs sm:h-11 sm:py-3 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );

  const duplicatePromptModal = duplicatePrompt ? (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-navy/45 backdrop-blur-[2px]"
        onClick={() => setDuplicatePrompt(null)}
        aria-label="Close"
      />
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/80 bg-white p-5 shadow-[0_24px_80px_rgba(30,42,74,0.22)] sm:rounded-3xl sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="duplicate-prompt-title"
      >
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.16em] text-coral sm:text-xs">
          Already in your bag
        </p>
        <h2
          id="duplicate-prompt-title"
          className="mt-2 text-center font-display text-xl font-extrabold text-navy sm:text-2xl"
        >
          {duplicatePrompt.atMaxStock ? "That's all we have!" : "Add one more?"}
        </h2>
        <p className="mt-3 text-center text-sm leading-relaxed text-navy/65 sm:mt-4">
          {duplicatePrompt.atMaxStock ? (
            <>
              You already have{" "}
              <span className="font-semibold text-navy">
                {duplicatePrompt.existingQuantity}
              </span>{" "}
              of <span className="font-semibold text-navy">{product.name}</span> (
              {selectedVariant?.size} · {selectedVariant?.color}) in your bag — that's
              the maximum available.
            </>
          ) : (
            <>
              <span className="font-semibold text-navy">{product.name}</span> (
              {selectedVariant?.size} · {selectedVariant?.color}) is already in your bag
              {duplicatePrompt.existingQuantity > 1
                ? ` (${duplicatePrompt.existingQuantity} items)`
                : ""}
              . Want to add one more?
            </>
          )}
        </p>

        <div className="mt-5 space-y-2 sm:mt-6 sm:space-y-3">
          {duplicatePrompt.atMaxStock ? (
            <Button
              size="lg"
              className="h-11 w-full text-sm sm:h-12 sm:text-base"
              onClick={() => setDuplicatePrompt(null)}
            >
              Got it
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                className="h-11 w-full text-sm sm:h-12 sm:text-base"
                onClick={confirmAddAnother}
              >
                <ShoppingBag className="h-4 w-4" />
                Yes, add one more
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 w-full text-sm sm:h-12 sm:text-base"
                onClick={() => setDuplicatePrompt(null)}
              >
                No thanks
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="space-y-5 sm:space-y-6">
        <div className="flex flex-wrap gap-2">
          {product.isClearance && <Badge variant="clearance">Clearance</Badge>}
          {(product.isOnSale || variantPricing?.isOnSale) && (
            <Badge variant="sale">Sale</Badge>
          )}
          {product.isNewArrival && <Badge variant="new">New</Badge>}
          {product.isTrending && <Badge variant="trending">Trending</Badge>}
        </div>

        <div className="rounded-2xl border border-coral/15 bg-gradient-to-br from-white via-blush/20 to-sky/15 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-navy/45 sm:text-xs sm:tracking-[0.18em]">
            Your price
          </p>
          <div className="mt-1 flex flex-wrap items-end gap-2 sm:gap-3">
            <p
              key={variantPricing?.currentPrice ?? "empty"}
              className="product-price-pop font-display text-3xl font-extrabold tabular-nums text-coral sm:text-4xl lg:text-[2.75rem]"
            >
              {variantPricing ? formatPrice(variantPricing.currentPrice) : "—"}
            </p>
            {variantPricing?.compareAtPrice != null && (
              <p className="pb-0.5 text-base text-navy/35 line-through sm:pb-1 sm:text-lg">
                {formatPrice(variantPricing.compareAtPrice)}
              </p>
            )}
          </div>
          {variantPricing?.isOnSale && (
            <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-coral sm:mt-2 sm:gap-1.5 sm:text-sm">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
              You&apos;re getting a sweet deal!
            </p>
          )}
        </div>

        {sizes.length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between sm:mb-3">
              <p className="text-xs font-bold text-navy sm:text-sm">Pick a size</p>
              <SizeGuideModal />
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => {
                const variant = product.variants.find(
                  (v) =>
                    v.size === size &&
                    v.color === (activeColor ?? colors[0]),
                );
                const sizeOutOfStock = !variant || variant.stock < 1;
                return (
                  <SelectorPill
                    key={size}
                    active={activeSize === size}
                    disabled={sizeOutOfStock}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </SelectorPill>
                );
              })}
            </div>
          </div>
        )}

        {colors.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-bold text-navy sm:mb-3 sm:text-sm">Pick a color</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <SelectorPill
                  key={color}
                  active={activeColor === color}
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </SelectorPill>
              ))}
            </div>
          </div>
        )}

        {selectedVariant && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-navy/60 sm:gap-x-4 sm:text-sm">
            <span>Age group: {selectedVariant.ageGroup}</span>
            {lowStock && (
              <span className="product-stock-pulse font-semibold text-coral">
                Only {selectedVariant.stock} left in stock!
              </span>
            )}
          </div>
        )}

        <div className="hidden rounded-2xl border-2 border-dashed border-coral/25 bg-coral/[0.04] p-4 lg:block">
          <p className="text-center text-sm font-semibold text-navy/65">
            Ready? Tap below — we&apos;ll pop it straight into your bag with a little magic ✨
          </p>
        </div>

        <div className="hidden lg:block">
          <AddToCartButton
            buttonRef={addButtonRef}
            disabled={outOfStock}
            onClick={() => handleAddToCart(addButtonRef.current)}
          />
        </div>

        {outOfStock && (
          <p className="hidden text-center text-sm font-semibold text-coral lg:block">
            This combination is currently out of stock
          </p>
        )}
      </div>

      {portalReady ? createPortal(stickyCartBar, document.body) : null}
      {portalReady && duplicatePromptModal
        ? createPortal(duplicatePromptModal, document.body)
        : null}
    </>
  );
}
