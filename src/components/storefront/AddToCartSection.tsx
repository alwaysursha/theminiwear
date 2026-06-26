"use client";

import { useMemo, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SizeGuideModal } from "@/components/storefront/SizeGuideModal";
import { useCartStore } from "@/lib/cart-store";
import { getVariantPricing } from "@/lib/product-utils";
import { formatPrice } from "@/lib/utils";
import type { SiteSaleSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

type Variant = {
  id: string;
  size: string;
  color: string;
  ageGroup: string;
  price: { toString(): string };
  salePrice?: { toString(): string } | null;
  stock: number;
};

type AddToCartSectionProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    isNewArrival: boolean;
    isTrending: boolean;
    isOnSale: boolean;
    isClearance: boolean;
    salePercent?: number | null;
    saleEndsAt?: Date | null;
    variants: Variant[];
    images: { url: string }[];
  };
  siteSale?: SiteSaleSettings;
};

export function AddToCartSection({ product, siteSale }: AddToCartSectionProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const sizes = useMemo(
    () => [...new Set(product.variants.map((v) => v.size))],
    [product.variants],
  );
  const colors = useMemo(
    () => [...new Set(product.variants.map((v) => v.color))],
    [product.variants],
  );

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

  function handleAddToCart() {
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

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {product.isClearance && <Badge variant="clearance">Clearance</Badge>}
        {(product.isOnSale || variantPricing?.isOnSale) && (
          <Badge variant="sale">Sale</Badge>
        )}
        {product.isNewArrival && <Badge variant="new">New</Badge>}
        {product.isTrending && <Badge variant="trending">Trending</Badge>}
      </div>

      {sizes.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-navy">Size</p>
            <SizeGuideModal />
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors",
                  activeSize === size
                    ? "border-coral bg-coral/10 text-coral"
                    : "border-navy/15 text-navy hover:border-navy/30",
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-navy">Color</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors",
                  activeColor === color
                    ? "border-coral bg-coral/10 text-coral"
                    : "border-navy/15 text-navy hover:border-navy/30",
                )}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedVariant && (
        <p className="text-sm text-navy/60">
          Age group: {selectedVariant.ageGroup}
          {selectedVariant.stock < 5 && selectedVariant.stock > 0 && (
            <span className="ml-2 text-coral">Only {selectedVariant.stock} left!</span>
          )}
        </p>
      )}

      <div className="flex items-center gap-3">
        <p className="font-display text-2xl font-extrabold text-coral">
          {variantPricing ? formatPrice(variantPricing.currentPrice) : "—"}
        </p>
        {variantPricing?.compareAtPrice != null && (
          <p className="text-lg text-navy/40 line-through">
            {formatPrice(variantPricing.compareAtPrice)}
          </p>
        )}
      </div>

      <Button
        size="lg"
        className="w-full sm:w-auto"
        disabled={!selectedVariant || selectedVariant.stock < 1}
        onClick={handleAddToCart}
      >
        {added ? (
          <>
            <Check className="h-4 w-4" />
            Added to cart!
          </>
        ) : selectedVariant?.stock === 0 ? (
          "Out of stock"
        ) : (
          <>
            <ShoppingBag className="h-4 w-4" />
            Add to cart
          </>
        )}
      </Button>
    </div>
  );
}
