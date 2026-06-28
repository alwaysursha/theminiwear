"use client";

import Image from "next/image";
import { useState } from "react";
import { SaleOffBadge } from "@/components/storefront/SaleOffBadge";
import { cn } from "@/lib/utils";

type ImageGalleryProps = {
  images: { id: string; url: string; alt: string | null }[];
  productName: string;
  discountPercent?: number | null;
};

export function ImageGallery({
  images,
  productName,
  discountPercent,
}: ImageGalleryProps) {
  const [selected, setSelected] = useState(0);
  const current = images[selected] ?? images[0];

  if (!current) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-blush/30 text-navy/30">
        No image
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100">
        <Image
          src={current.url}
          alt={current.alt ?? productName}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
        {discountPercent != null && discountPercent > 0 && (
          <SaleOffBadge percent={discountPercent} size="lg" className="right-3 top-3 sm:right-4 sm:top-4" />
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelected(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-neutral-100 transition-colors",
                selected === i ? "border-coral" : "border-transparent",
              )}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${productName} ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
