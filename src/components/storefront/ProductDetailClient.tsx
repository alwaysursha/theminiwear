"use client";

import Image from "next/image";
import { useState } from "react";
import { Ruler, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import type { Product, ProductImage, ProductVariant } from "@prisma/client";

type ProductData = Product & {
  images: ProductImage[];
  variants: ProductVariant[];
};

export function ProductDetailClient({ product }: { product: ProductData }) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id ?? "",
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [added, setAdded] = useState(false);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const colors = [...new Set(product.variants.map((v) => v.color))];
  const sizes = product.variants
    .filter((v) => !selectedVariant || v.color === selectedVariant.color)
    .map((v) => v.size);
  const uniqueSizes = [...new Set(sizes)];

  function selectColor(color: string) {
    const variant = product.variants.find((v) => v.color === color);
    if (variant) setSelectedVariantId(variant.id);
  }

  function selectSize(size: string) {
    const variant = product.variants.find(
      (v) =>
        v.size === size &&
        v.color === (selectedVariant?.color ?? product.variants[0]?.color),
    );
    if (variant) setSelectedVariantId(variant.id);
  }

  function handleAddToCart() {
    if (!selectedVariant || selectedVariant.stock < 1) return;
    const image = product.images[0]?.url;
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: Number(selectedVariant.price),
      image,
      stock: selectedVariant.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-sky/30">
            {product.images[selectedImage] ? (
              <Image
                src={product.images[selectedImage].url}
                alt={product.images[selectedImage].alt ?? product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl">
                👕
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${
                    i === selectedImage ? "border-coral" : "border-transparent"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? ""}
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-navy sm:text-4xl">
              {product.name}
            </h1>
            {selectedVariant && (
              <p className="mt-2 text-2xl font-bold text-coral">
                {formatPrice(Number(selectedVariant.price))}
              </p>
            )}
          </div>

          <p className="text-navy/70 leading-relaxed">{product.description}</p>

          <div>
            <p className="mb-2 text-sm font-semibold text-navy">Color</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => selectColor(color)}
                  className={`rounded-full border-2 px-4 py-1.5 text-sm font-medium transition-colors ${
                    selectedVariant?.color === color
                      ? "border-coral bg-coral/10 text-coral"
                      : "border-navy/15 text-navy hover:border-coral/50"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-navy">Size</p>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="flex items-center gap-1 text-xs font-semibold text-coral hover:underline"
              >
                <Ruler className="h-3.5 w-3.5" />
                Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {uniqueSizes.map((size) => {
                const variant = product.variants.find(
                  (v) =>
                    v.size === size &&
                    v.color === (selectedVariant?.color ?? colors[0]),
                );
                const outOfStock = !variant || variant.stock < 1;
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={outOfStock}
                    onClick={() => selectSize(size)}
                    className={`min-w-[3rem] rounded-xl border-2 px-3 py-2 text-sm font-medium transition-colors ${
                      selectedVariant?.size === size
                        ? "border-coral bg-coral text-white"
                        : outOfStock
                          ? "border-navy/10 text-navy/30 line-through"
                          : "border-navy/15 text-navy hover:border-coral/50"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            size="lg"
            className="w-full sm:w-auto"
            disabled={!selectedVariant || selectedVariant.stock < 1}
            onClick={handleAddToCart}
          >
            {added
              ? "Added to cart!"
              : selectedVariant && selectedVariant.stock < 1
                ? "Out of stock"
                : "Add to Cart"}
          </Button>
        </div>
      </div>

      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-navy/50"
            onClick={() => setSizeGuideOpen(false)}
            aria-label="Close size guide"
          />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-navy">
                Size Guide
              </h2>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                className="rounded-full p-1 hover:bg-blush/50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-4 text-sm text-navy/70">
              Measure your child and compare to our size chart. When in doubt,
              size up for growing kids!
            </p>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b border-navy/10 text-left">
                  <th className="py-2 font-semibold text-navy">Size</th>
                  <th className="py-2 font-semibold text-navy">Age</th>
                  <th className="py-2 font-semibold text-navy">Height</th>
                </tr>
              </thead>
              <tbody className="text-navy/70">
                {[
                  ["2T", "2 years", "33–36 in"],
                  ["3T", "3 years", "36–39 in"],
                  ["4T", "4 years", "39–42 in"],
                  ["5T", "5 years", "42–45 in"],
                  ["6", "6 years", "45–48 in"],
                  ["8", "8 years", "50–53 in"],
                ].map(([size, age, height]) => (
                  <tr key={size} className="border-b border-navy/5">
                    <td className="py-2 font-medium text-navy">{size}</td>
                    <td className="py-2">{age}</td>
                    <td className="py-2">{height}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
