"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { ProductFitImage, ProductImageFrame } from "@/components/storefront/ProductImageFrame";
import { ProductImageMagnifier } from "@/components/storefront/ProductImageMagnifier";
import { ProductImageZoomLightbox } from "@/components/storefront/ProductImageZoomLightbox";
import { SaleOffBadge } from "@/components/storefront/SaleOffBadge";
import { cn } from "@/lib/utils";

type ImageGalleryProps = {
  images: { id: string; url: string; alt: string | null }[];
  productName: string;
  discountPercent?: number | null;
  onSale?: boolean;
};

export function ImageGallery({
  images,
  productName,
  discountPercent,
  onSale,
}: ImageGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const count = images.length;

  const goTo = useCallback(
    (index: number) => {
      if (count < 1) return;
      setSelected((index + count) % count);
    },
    [count],
  );

  const goPrev = useCallback(() => goTo(selected - 1), [goTo, selected]);
  const goNext = useCallback(() => goTo(selected + 1), [goTo, selected]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (zoomOpen) return;
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goPrev, goNext, zoomOpen]);

  const currentImage = images[selected];

  if (count === 0) {
    return (
      <div className="product-gallery-enter flex aspect-[4/5] items-center justify-center rounded-3xl bg-gradient-to-br from-blush/40 via-sky/20 to-mint/30 text-6xl text-navy/20">
        👕
      </div>
    );
  }

  const frameTone = onSale ? "sale" : "cool";

  return (
    <div className="product-gallery-enter group/gallery space-y-4">
      <div className="relative">
        <div
          className="pointer-events-none absolute -left-6 -top-6 h-28 w-28 rounded-full bg-coral/20 blur-3xl product-detail-orb"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-mint/25 blur-3xl product-detail-orb-delay"
          aria-hidden
        />

        <ProductImageFrame tone={frameTone} size="lg" className="aspect-[4/5] w-full">
          <ProductImageMagnifier
            imageUrl={currentImage.url}
            alt={currentImage.alt ?? productName}
            enabled={!zoomOpen}
            className="product-gallery-main h-full w-full"
          >
            <div className="relative h-full w-full overflow-hidden">
              {images.map((img, i) => (
                <div
                  key={img.id}
                  className={cn(
                    "absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    selected === i
                      ? "z-10 scale-100 opacity-100"
                      : "z-0 scale-[1.03] opacity-0",
                  )}
                  aria-hidden={selected !== i}
                >
                  <ProductFitImage
                    src={img.url}
                    alt={img.alt ?? `${productName} — image ${i + 1}`}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    fit="lg"
                    mode="cover"
                    className="duration-700 ease-out"
                  />
                </div>
              ))}

              <div
                className="product-gallery-shimmer pointer-events-none absolute inset-0 z-20"
                aria-hidden
              />

              <button
                type="button"
                onClick={() => setZoomOpen(true)}
                className="absolute left-3 top-3 z-30 flex items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-2.5 py-1.5 text-[11px] font-semibold text-navy shadow-md backdrop-blur-sm transition-all hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral sm:left-4 sm:top-4 sm:gap-2 sm:px-3.5 sm:py-2 sm:text-xs"
                aria-label="Open magnified view"
              >
                <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Magnify
              </button>

              <button
                type="button"
                onClick={() => setZoomOpen(true)}
                className="absolute inset-0 z-[15] md:hidden"
                aria-label="Open magnified view"
              />

              <p className="pointer-events-none absolute bottom-14 left-1/2 z-20 hidden -translate-x-1/2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium text-navy/60 shadow-sm backdrop-blur-sm md:block">
                Hover to magnify texture
              </p>

              {discountPercent != null && discountPercent > 0 && (
                <SaleOffBadge
                  percent={discountPercent}
                  size="lg"
                  className="right-4 top-4 z-30 sm:right-5 sm:top-5"
                />
              )}

              {count > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/85 text-navy shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral sm:left-4 sm:h-11 sm:w-11"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-2 top-1/2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/85 text-navy shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral sm:right-4 sm:h-11 sm:w-11"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/60 bg-white/80 px-3 py-1.5 shadow-md backdrop-blur-sm">
                    {images.map((img, i) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setSelected(i)}
                        className={cn(
                          "rounded-full transition-all duration-300",
                          selected === i
                            ? "h-2 w-6 bg-coral"
                            : "h-2 w-2 bg-navy/25 hover:bg-navy/40",
                        )}
                        aria-label={`View image ${i + 1}`}
                        aria-current={selected === i}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </ProductImageMagnifier>
        </ProductImageFrame>
      </div>

      {zoomOpen && (
        <ProductImageZoomLightbox
          images={images}
          selected={selected}
          productName={productName}
          onClose={() => setZoomOpen(false)}
          onSelect={setSelected}
        />
      )}

      {count > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelected(i)}
              className={cn(
                "product-gallery-thumb relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-all duration-300 sm:h-20 sm:w-20 sm:rounded-2xl",
                selected === i
                  ? "scale-100 border-coral shadow-[0_8px_24px_rgba(255,127,110,0.28)] ring-2 ring-coral/20"
                  : "scale-[0.96] border-transparent opacity-75 hover:scale-[0.98] hover:opacity-100",
              )}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${productName} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
