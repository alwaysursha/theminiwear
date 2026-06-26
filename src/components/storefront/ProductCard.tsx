import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SaleOffBadge } from "@/components/storefront/SaleOffBadge";
import { getProductPriceRange } from "@/lib/product-utils";
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

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-sky/30">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            👕
          </div>
        )}
        {pricing.maxDiscountPercent != null && (
          <SaleOffBadge percent={pricing.maxDiscountPercent} />
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.isClearance && <Badge variant="clearance">Clearance</Badge>}
          {product.isNewArrival && <Badge variant="new">New</Badge>}
          {product.isTrending && <Badge variant="trending">Trending</Badge>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.category && (
          <p className="text-xs font-medium uppercase tracking-wide text-navy/50">
            {product.category.name}
          </p>
        )}
        <h3 className="font-display font-bold text-navy group-hover:text-coral">
          {product.name}
        </h3>
        <div className="mt-auto flex flex-wrap items-baseline gap-2">
          <p className="text-sm font-semibold text-coral">{pricing.display}</p>
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
