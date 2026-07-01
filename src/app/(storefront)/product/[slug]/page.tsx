import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Sparkles } from "lucide-react";
import { ImageGallery } from "@/components/storefront/ImageGallery";
import { AddToCartSection } from "@/components/storefront/AddToCartSection";
import { ProductReviews } from "@/components/storefront/ProductReviews";
import { ProductTrustStrip } from "@/components/storefront/ProductTrustStrip";
import { prisma } from "@/lib/prisma";
import { getProductDiscountPercent, serializeProductForCart } from "@/lib/product-utils";
import { getSiteSaleSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  const [product, siteSale] = await Promise.all([
    prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: [{ size: "asc" }, { color: "asc" }] },
        category: true,
      },
    }),
    getSiteSaleSettings(),
  ]);

  if (!product) {
    notFound();
  }

  const discountPercent = getProductDiscountPercent(
    product.variants,
    product,
    siteSale,
  );

  const onSale =
    product.isOnSale ||
    product.isClearance ||
    (discountPercent != null && discountPercent > 0);

  return (
    <div className="product-detail-page relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-blush/50 blur-3xl product-detail-orb" />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-sky/40 blur-3xl product-detail-orb-delay" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-mint/30 blur-3xl product-detail-orb" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 sm:py-10 sm:pb-10 lg:px-8 lg:py-12">
        <Link
          href="/shop"
          className="product-detail-enter-1 mb-6 inline-flex items-center gap-1 rounded-full border border-navy/10 bg-white/70 px-3 py-1.5 text-xs font-semibold text-navy/65 shadow-sm backdrop-blur-sm transition-colors hover:border-coral/30 hover:text-coral sm:mb-8 sm:gap-1.5 sm:px-4 sm:py-2 sm:text-sm"
        >
          <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Back to shop
        </Link>

        <div className="grid items-start gap-6 sm:gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14 xl:gap-16">
          <header className="product-detail-enter-3 order-1 space-y-3 sm:space-y-4 lg:order-none lg:col-start-2 lg:row-start-1">
            {product.category && (
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-coral/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-coral transition-colors hover:bg-coral/15 sm:gap-2 sm:px-3.5 sm:py-1.5 sm:text-xs sm:tracking-[0.16em]"
              >
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
                {product.category.name}
              </Link>
            )}

            <div>
              <h1 className="font-display text-2xl font-extrabold leading-[1.15] tracking-tight text-navy sm:text-3xl sm:leading-[1.1] lg:text-4xl xl:text-[2.75rem]">
                {product.name}
              </h1>
              <div
                className="product-detail-title-line mt-3 h-0.5 w-20 rounded-full bg-gradient-to-r from-coral via-blush to-mint sm:mt-4 sm:h-1 sm:w-24"
                aria-hidden
              />
            </div>

            {product.occasion && (
              <p className="inline-flex rounded-full border border-navy/10 bg-white/60 px-2.5 py-0.5 text-xs font-medium text-navy/55 backdrop-blur-sm sm:px-3 sm:py-1 sm:text-sm">
                Perfect for: {product.occasion}
              </p>
            )}
          </header>

          <div className="product-detail-enter-2 order-2 lg:order-none lg:col-start-1 lg:row-start-1 lg:row-span-3 lg:sticky lg:top-24">
            <ImageGallery
              images={product.images}
              productName={product.name}
              discountPercent={discountPercent}
              onSale={onSale}
            />
          </div>

          <div className="product-detail-enter-4 order-3 rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_12px_36px_rgba(30,42,74,0.07)] backdrop-blur-md sm:rounded-3xl sm:p-6 sm:shadow-[0_16px_48px_rgba(30,42,74,0.08)] lg:order-none lg:col-start-2 lg:p-8">
            <AddToCartSection
              product={serializeProductForCart(product)}
              siteSale={siteSale}
            />
          </div>

          <div className="product-detail-enter-4 order-4 rounded-2xl border border-navy/8 bg-white/55 p-4 backdrop-blur-sm sm:rounded-3xl sm:p-6 lg:order-none lg:col-start-2 lg:p-7">
            <h2 className="font-display text-base font-bold text-navy sm:text-lg">About this piece</h2>
            <p className="mt-2 text-sm leading-relaxed text-navy/70 sm:mt-3 sm:text-base">
              {product.description}
            </p>
          </div>

          <div className="product-detail-enter-5 order-5 lg:order-none lg:col-start-2">
            <ProductTrustStrip />
          </div>
        </div>

        <ProductReviews productId={product.id} />
      </div>
    </div>
  );
}
