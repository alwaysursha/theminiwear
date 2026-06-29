import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ImageGallery } from "@/components/storefront/ImageGallery";
import { AddToCartSection } from "@/components/storefront/AddToCartSection";
import { ProductReviews } from "@/components/storefront/ProductReviews";
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/shop"
        className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-navy/60 hover:text-coral"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to shop
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <ImageGallery
          images={product.images}
          productName={product.name}
          discountPercent={discountPercent}
        />

        <div>
          {product.category && (
            <p className="text-sm font-semibold uppercase tracking-wider text-coral">
              {product.category.name}
            </p>
          )}
          <h1 className="mt-1 font-display text-3xl font-extrabold text-navy sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-navy/70 leading-relaxed">{product.description}</p>
          {product.occasion && (
            <p className="mt-2 text-sm text-navy/50">Perfect for: {product.occasion}</p>
          )}

          <div className="mt-8">
            <AddToCartSection
              product={serializeProductForCart(product)}
              siteSale={siteSale}
            />
          </div>
        </div>
      </div>

      <ProductReviews productId={product.id} />
    </div>
  );
}
