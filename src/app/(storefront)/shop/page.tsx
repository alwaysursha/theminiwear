import { Suspense, type CSSProperties } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { ShopProductCard } from "@/app/(storefront)/shop/ShopProductCard";
import { ShopFilters } from "@/app/(storefront)/shop/ShopFilters";
import { ShopControls } from "@/app/(storefront)/shop/ShopControls";
import { prisma } from "@/lib/prisma";
import { getProductPriceRange, productInclude, type ProductWithRelations } from "@/lib/product-utils";
import { getSiteSaleSettings } from "@/lib/settings";
import {
  buildShopCategoryWhere,
  getShopCategoryBySlug,
  sortShopCategories,
} from "@/lib/shop-categories";
import { cn } from "@/lib/utils";
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

  if (params.new === "true") where.isNewArrival = true;
  if (params.clearance === "true") where.isClearance = true;

  if (params.category) {
    const categoryWhere = buildShopCategoryWhere(params.category);
    if (categoryWhere) Object.assign(where, categoryWhere);
    else where.category = { slug: params.category };
  }

  if (params.gender && ["BOYS", "GIRLS", "UNISEX"].includes(params.gender)) {
    where.gender = params.gender as Gender;
  }

  if (params.ageGroup) where.variants = { some: { ageGroup: params.ageGroup } };

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
    default:
      orderBy = { createdAt: "desc" };
  }

  let products: ProductWithRelations[] = [];
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  let siteSale = { enabled: false, percent: 0 };
  let dbUnavailable = false;

  try {
    [products, categories, siteSale] = await Promise.all([
      prisma.product.findMany({ where, include: productInclude, orderBy }),
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

  const categoryMeta = params.category ? getShopCategoryBySlug(params.category) : null;
  const dbCategory = params.category
    ? categories.find((category) => category.slug === params.category)
    : null;

  const title =
    params.clearance === "true"
      ? "Clearance"
      : params.sale === "true"
        ? siteSale.enabled
          ? `${siteSale.percent}% off everything`
          : "On Sale"
        : params.new === "true"
          ? "New Arrivals"
          : categoryMeta?.name ?? dbCategory?.name ?? "Shop All";

  const categoryDescription = categoryMeta?.description ?? dbCategory?.description ?? null;
  const sortedCategories = sortShopCategories(categories);

  const heroTheme: "default" | "sale" | "clearance" | "new" | "category" =
    params.clearance === "true"
      ? "clearance"
      : params.sale === "true"
        ? "sale"
        : params.new === "true"
          ? "new"
          : categoryMeta || dbCategory
            ? "category"
            : "default";

  const eyebrow =
    heroTheme === "clearance"
      ? "Final markdowns"
      : heroTheme === "sale"
        ? siteSale.enabled
          ? "Storewide event"
          : "Special offers"
        : heroTheme === "new"
          ? "Just landed"
          : heroTheme === "category"
            ? "Collection"
            : "Shop the collection";

  const heroSubtitle =
    categoryDescription ??
    (heroTheme === "clearance"
      ? "Last chance to grab these little looks before they're gone for good."
      : heroTheme === "sale"
        ? "Adorable styles at even sweeter prices."
        : heroTheme === "new"
          ? "The freshest arrivals for your little one's next adventure."
          : "Beautifully soft, playfully designed clothing for every tiny moment.");

  const isDark = heroTheme === "clearance";

  const gridKey = [
    params.category,
    params.gender,
    params.ageGroup,
    params.search,
    params.sort,
    params.new,
    params.sale,
    params.clearance,
  ].join("|");

  const railActive = (slug: string | null) =>
    slug === null
      ? !params.category && !params.new && !params.sale && !params.clearance
      : params.category === slug;

  return (
    <div>
      {/* Hero */}
      <section
        className={cn(
          "relative overflow-hidden",
          heroTheme === "default" && "bg-gradient-to-b from-blush/40 via-[#fffaf9] to-[#fffaf9]",
          heroTheme === "sale" && "bg-gradient-to-b from-coral/15 via-blush/25 to-[#fffaf9]",
          heroTheme === "new" && "bg-gradient-to-b from-mint/30 via-sky/15 to-[#fffaf9]",
          heroTheme === "category" && "bg-gradient-to-b from-sky/25 via-blush/15 to-[#fffaf9]",
          heroTheme === "clearance" && "bg-navy text-white",
        )}
      >
        {isDark ? (
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(200,240,224,0.16),transparent)]"
            aria-hidden
          />
        ) : (
          <>
            <div className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-mint/30 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -right-12 top-6 h-56 w-56 rounded-full bg-coral/15 blur-3xl" aria-hidden />
          </>
        )}

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <p
            className={cn(
              "shop-hero-eyebrow text-xs font-bold uppercase tracking-[0.28em]",
              isDark ? "text-mint" : "text-coral",
            )}
          >
            {eyebrow}
          </p>
          <h1
            className={cn(
              "shop-hero-title mt-3 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl",
              isDark ? "text-white" : "text-navy",
            )}
          >
            {title}
          </h1>
          <p
            className={cn(
              "shop-hero-sub mt-4 max-w-xl text-sm sm:text-base",
              isDark ? "text-white/70" : "text-navy/60",
            )}
          >
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Category rail */}
      {!dbUnavailable && sortedCategories.length > 0 && (
        <div className="sticky top-0 z-30 border-y border-navy/8 bg-white/85 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="no-scrollbar flex gap-2 overflow-x-auto py-3.5">
              <Link
                href="/shop"
                className={cn(
                  "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
                  railActive(null)
                    ? "bg-navy text-white shadow-sm"
                    : "bg-white text-navy/65 ring-1 ring-inset ring-navy/12 hover:ring-navy/30",
                )}
              >
                All
              </Link>
              {sortedCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className={cn(
                    "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
                    railActive(cat.slug)
                      ? "bg-navy text-white shadow-sm"
                      : "bg-white text-navy/65 ring-1 ring-inset ring-navy/12 hover:ring-navy/30",
                  )}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {dbUnavailable ? (
          <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">
            Database unavailable. Run <code className="font-mono">pnpm dev</code> to start
            PostgreSQL and seed mock data.
          </p>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[290px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-3xl border border-navy/8 bg-white/80 p-6 shadow-[0_8px_30px_rgba(30,42,74,0.06)] backdrop-blur">
                <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-blush/30" />}>
                  <ShopFilters categories={sortedCategories} siteSale={siteSale} />
                </Suspense>
              </div>
            </aside>

            <div>
              <Suspense fallback={<div className="mb-6 h-10 animate-pulse rounded-full bg-blush/30" />}>
                <ShopControls
                  total={sortedProducts.length}
                  categories={sortedCategories}
                  siteSale={siteSale}
                />
              </Suspense>

              {sortedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-navy/15 bg-white/60 py-20 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blush/50">
                    <Search className="h-7 w-7 text-coral" />
                  </span>
                  <p className="mt-5 font-display text-xl font-extrabold text-navy">
                    No products found
                  </p>
                  <p className="mt-1.5 max-w-xs text-sm text-navy/55">
                    Try removing a filter or exploring a different collection.
                  </p>
                  <Link
                    href="/shop"
                    className="mt-6 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
                  >
                    Reset filters
                  </Link>
                </div>
              ) : (
                <div
                  key={gridKey}
                  className="shop-grid grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6"
                >
                  {sortedProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="shop-card"
                      style={{ "--reveal-i": Math.min(index, 16) } as CSSProperties}
                    >
                      <ShopProductCard product={product} siteSale={siteSale} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
