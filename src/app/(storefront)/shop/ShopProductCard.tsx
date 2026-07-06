import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductFitImage, ProductImageFrame } from "@/components/storefront/ProductImageFrame";
import {
  ProductCardSaleOverlays,
  ProductCardStatusFlags,
} from "@/components/storefront/ProductCardBadges";
import { normalizeProductImageFraming } from "@/lib/product-image-display";
import { getProductPriceRange, type ProductWithRelations } from "@/lib/product-utils";
import { getProductSaleEndsAt } from "@/lib/sale-expiry";
import { getColorSwatch, uniqueColors } from "@/lib/color-utils";
import { formatPrice, cn } from "@/lib/utils";
import type { SiteSaleSettings } from "@/lib/settings";

export function ShopProductCard({
  product,
  siteSale,
}: {
  product: ProductWithRelations;
  siteSale?: SiteSaleSettings;
}) {
  const image = product.images[0];
  const framing = image ? normalizeProductImageFraming(image) : null;
  const pricing = getProductPriceRange(product.variants, product, siteSale);
  const colors = uniqueColors(product.variants);
  const saleEndsAt = getProductSaleEndsAt(product);
  const soldOut = product.variants.every((v) => v.stock <= 0) && product.variants.length > 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group/frame relative flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-navy/8 bg-white shadow-[0_2px_14px_rgba(30,42,74,0.06)] transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_46px_rgba(30,42,74,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/50"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <ProductImageFrame flush size="lg" className="h-full">
          <div className="relative h-full">
            {image ? (
              <ProductFitImage
                src={image.url}
                alt={image.alt ?? product.name}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                mode="cover"
                focalX={framing?.focalX}
                focalY={framing?.focalY}
                zoom={framing?.zoom}
                fitMode={framing?.fitMode}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-blush/40 to-sky/30 text-5xl">
                👕
              </div>
            )}

            <span className="shop-card-sheen pointer-events-none absolute inset-0 z-10" aria-hidden />

            <ProductCardSaleOverlays
              maxDiscountPercent={pricing.maxDiscountPercent}
              saleEndsAt={saleEndsAt}
            />

            {soldOut && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/45 backdrop-blur-[1px]">
                <span className="rounded-full bg-navy/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  Sold out
                </span>
              </div>
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 translate-y-full bg-gradient-to-t from-navy/75 via-navy/25 to-transparent px-3 pb-3 pt-8 opacity-0 transition-all duration-400 ease-out group-hover/frame:translate-y-0 group-hover/frame:opacity-100">
              <span className="flex items-center justify-center gap-1.5 rounded-full bg-white/95 py-2 text-xs font-bold text-navy shadow-lg">
                View details
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </ProductImageFrame>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <ProductCardStatusFlags product={product} />
        {product.category && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/45 sm:text-[11px]">
            {product.category.name}
          </p>
        )}
        <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug text-navy transition-colors duration-300 group-hover/frame:text-coral sm:text-base">
          {product.name}
        </h3>

        {colors.length > 0 && (
          <div className="mt-0.5 flex items-center gap-1.5">
            {colors.slice(0, 5).map((c) => {
              const swatch = getColorSwatch(c);
              return (
                <span
                  key={c}
                  title={c}
                  className={cn(
                    "h-3.5 w-3.5 rounded-full ring-1 ring-inset transition-transform duration-300 group-hover/frame:scale-110",
                    swatch.light ? "ring-navy/20" : "ring-black/10",
                  )}
                  style={{ background: swatch.css }}
                />
              );
            })}
            {colors.length > 5 && (
              <span className="text-[11px] font-semibold text-navy/45">
                +{colors.length - 5}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-baseline gap-2 pt-1.5">
          <span className="font-display text-base font-extrabold text-coral sm:text-lg">
            {pricing.display}
          </span>
          {pricing.hasSale && pricing.compareAtMin != null && (
            <span className="text-xs text-navy/40 line-through">
              {formatPrice(pricing.compareAtMin)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
