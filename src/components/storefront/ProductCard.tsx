import Link from "next/link";
import { ProductFitImage, ProductImageFrame } from "@/components/storefront/ProductImageFrame";
import {
  ProductCardSaleOverlays,
  ProductCardStatusFlags,
} from "@/components/storefront/ProductCardBadges";
import { getProductPriceRange } from "@/lib/product-utils";
import { getProductSaleEndsAt } from "@/lib/sale-expiry";
import { formatPrice } from "@/lib/utils";
import type { SiteSaleSettings } from "@/lib/settings";
import type { Category, Product, ProductImage, ProductVariant } from "@prisma/client";

type ProductWithRelations = Product & {
  images: ProductImage[];
  variants: ProductVariant[];
  category: Category | null;
};

export function ProductCard({
  product,
  siteSale,
}: {
  product: ProductWithRelations;
  siteSale?: SiteSaleSettings;
}) {
  const image = product.images[0];
  const pricing = getProductPriceRange(product.variants, product, siteSale);
  const saleEndsAt = getProductSaleEndsAt(product);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group/frame flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
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
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-neutral-100 text-4xl">
                👕
              </div>
            )}
            <ProductCardSaleOverlays
              maxDiscountPercent={pricing.maxDiscountPercent}
              saleEndsAt={saleEndsAt}
            />
          </div>
        </ProductImageFrame>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3 sm:gap-1.5 sm:p-4">
        <ProductCardStatusFlags product={product} />
        {product.category && (
          <p className="text-[10px] font-medium uppercase tracking-wide text-navy/50 sm:text-xs">
            {product.category.name}
          </p>
        )}
        <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug text-navy group-hover:text-coral sm:text-base">
          {product.name}
        </h3>
        <div className="mt-auto flex flex-wrap items-baseline gap-2 pt-0.5">
          <p className="text-sm font-semibold text-coral sm:text-base">{pricing.display}</p>
          {pricing.hasSale && pricing.compareAtMin != null && (
            <p className="text-xs text-navy/40 line-through">
              {formatPrice(pricing.compareAtMin)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
