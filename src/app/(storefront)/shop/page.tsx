import { Suspense } from "react";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ShopFilters } from "@/app/(storefront)/shop/ShopFilters";
import { prisma } from "@/lib/prisma";
import { getProductPriceRange, productInclude } from "@/lib/product-utils";
import { getSiteSaleSettings } from "@/lib/settings";
import type { Gender, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  category?: string;
  gender?: string;
  ageGroup?: string;
  search?: string;
  sort?: string;
  new?: string;
  sale?: string;
  clearance?: string;
}>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (params.new === "true") {
    where.isNewArrival = true;
  }

  if (params.clearance === "true") {
    where.isClearance = true;
  }

  if (params.category) {
    where.category = { slug: params.category };
  }

  if (params.gender && ["BOYS", "GIRLS", "UNISEX"].includes(params.gender)) {
    where.gender = params.gender as Gender;
  }

  if (params.ageGroup) {
    where.variants = { some: { ageGroup: params.ageGroup } };
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };

  switch (params.sort) {
    case "trending":
      orderBy = { trendingScore: "desc" };
      break;
    case "name":
      orderBy = { name: "asc" };
      break;
    case "price-asc":
    case "price-desc":
      orderBy = { createdAt: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  let siteSale = { enabled: false, percent: 0 };
  let dbUnavailable = false;

  try {
    [products, categories, siteSale] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy,
      }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      getSiteSaleSettings(),
    ]);
  } catch {
    dbUnavailable = true;
  }

  let filteredProducts = products;

  if (params.sale === "true" && !siteSale.enabled) {
    filteredProducts = products.filter(
      (product) =>
        product.isOnSale ||
        product.variants.some((variant) => variant.salePrice != null),
    );
  }

  const sortedProducts = (() => {
    if (params.sort === "price-asc" || params.sort === "price-desc") {
      return [...filteredProducts].sort((a, b) => {
        const minA = getProductPriceRange(a.variants, a, siteSale).minCurrent;
        const minB = getProductPriceRange(b.variants, b, siteSale).minCurrent;
        return params.sort === "price-asc" ? minA - minB : minB - minA;
      });
    }
    return filteredProducts;
  })();

  const title =
    params.clearance === "true"
      ? "Clearance"
      : params.sale === "true"
        ? siteSale.enabled
          ? `Sale — ${siteSale.percent}% off everything`
          : "On Sale"
        : params.new === "true"
          ? "New Arrivals"
          : params.category
            ? categories.find((c) => c.slug === params.category)?.name ?? "Shop"
            : "Shop All";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-navy sm:text-4xl">
          {title}
        </h1>
        {dbUnavailable ? (
          <p className="mt-2 rounded-lg bg-coral/10 px-4 py-2 text-sm text-coral">
            Database unavailable. Run <code className="font-mono">pnpm dev</code> to
            start PostgreSQL and seed mock data.
          </p>
        ) : (
          <p className="mt-2 text-navy/60">
            {sortedProducts.length} product{sortedProducts.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside>
          <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-blush/30" />}>
            <ShopFilters categories={categories} siteSale={siteSale} />
          </Suspense>
        </aside>

        <div>
          {sortedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy/20 bg-blush/20 py-20 text-center">
              <span className="text-5xl">🔍</span>
              <p className="mt-4 font-display text-lg font-bold text-navy">
                No products found
              </p>
              <p className="mt-1 text-sm text-navy/60">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  siteSale={siteSale}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
