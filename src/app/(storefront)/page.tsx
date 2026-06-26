import Link from "next/link";
import { ArrowRight, Sparkles, Star, Tag } from "lucide-react";
import { ProductCard } from "@/components/storefront/ProductCard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { productInclude, type ProductWithRelations } from "@/lib/product-utils";
import { getSiteSaleSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let newArrivals: ProductWithRelations[] = [];
  let trending: ProductWithRelations[] = [];
  let onSale: ProductWithRelations[] = [];
  let clearance: ProductWithRelations[] = [];
  let saleFeatured: ProductWithRelations[] = [];
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  let siteSale = { enabled: false, percent: 0 };

  try {
    const [newArrivalsResult, trendingResult, onSaleResult, clearanceResult, categoriesResult, siteSaleResult, activeSample] =
      await Promise.all([
      prisma.product.findMany({
        where: { isActive: true, isNewArrival: true },
        include: productInclude,
        take: 4,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: { isActive: true, isTrending: true },
        include: productInclude,
        take: 4,
        orderBy: { trendingScore: "desc" },
      }),
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { isOnSale: true },
            { variants: { some: { salePrice: { not: null } } } },
          ],
        },
        include: productInclude,
        take: 4,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.product.findMany({
        where: { isActive: true, isClearance: true },
        include: productInclude,
        take: 4,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
        take: 6,
      }),
      getSiteSaleSettings(),
      prisma.product.findMany({
        where: { isActive: true },
        include: productInclude,
        take: 4,
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    newArrivals = newArrivalsResult;
    trending = trendingResult;
    onSale = onSaleResult;
    clearance = clearanceResult;
    categories = categoriesResult;
    siteSale = siteSaleResult;
    saleFeatured = siteSale.enabled ? activeSample : onSaleResult;
  } catch {
    // Database not running yet — page still renders
  }

  const showSaleSection = siteSale.enabled || onSale.length > 0;

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-blush via-sky/40 to-mint/50">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-coral/20 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-mint/40 blur-2xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-1.5 text-sm font-semibold text-coral shadow-sm">
              <Sparkles className="h-4 w-4" />
              Spring Collection is here!
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight text-navy sm:text-5xl lg:text-6xl">
              Dress little adventurers in{" "}
              <span className="text-coral">joyful</span> style
            </h1>
            <p className="mt-4 text-lg text-navy/70">
              Soft fabrics, playful prints, and comfy fits for every age. From
              cozy onesies to adventure-ready outfits.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className={cn(buttonVariants({ size: "lg" }))}
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/shop?new=true"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                New Arrivals
              </Link>
              <Link
                href="/shop?sale=true"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                Shop Sale
              </Link>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-navy sm:text-3xl">
            Shop by Category
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group flex flex-col items-center rounded-2xl border border-navy/10 bg-white p-6 text-center transition-all hover:border-coral/30 hover:bg-blush/30"
              >
                <span className="text-3xl">🧸</span>
                <span className="mt-2 font-display text-sm font-bold text-navy group-hover:text-coral">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-navy sm:text-3xl">
                  New Arrivals
                </h2>
                <p className="mt-1 text-navy/60">Fresh picks just landed</p>
              </div>
              <Link
                href="/shop?new=true"
                className="hidden text-sm font-semibold text-coral hover:underline sm:block"
              >
                View all
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} siteSale={siteSale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {showSaleSection && (
        <section className="bg-blush/30 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div className="flex items-center gap-2">
                <Tag className="h-6 w-6 text-coral" />
                <div>
                  <h2 className="font-display text-2xl font-bold text-navy sm:text-3xl">
                    {siteSale.enabled
                      ? `Sale — ${siteSale.percent}% off`
                      : "On Sale"}
                  </h2>
                  <p className="mt-1 text-navy/60">Limited-time deals</p>
                </div>
              </div>
              <Link
                href="/shop?sale=true"
                className="hidden text-sm font-semibold text-coral hover:underline sm:block"
              >
                View all
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {saleFeatured.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  siteSale={siteSale}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {clearance.length > 0 && (
        <section className="bg-navy py-14 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold sm:text-3xl">
                  Clearance
                </h2>
                <p className="mt-1 text-white/70">Last-chance styles at deep discounts</p>
              </div>
              <Link
                href="/shop?clearance=true"
                className="hidden text-sm font-semibold text-mint hover:underline sm:block"
              >
                View all
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {clearance.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  siteSale={siteSale}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {trending.length > 0 && (
        <section className="bg-gradient-to-b from-mint/20 to-transparent py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 fill-coral text-coral" />
                <div>
                  <h2 className="font-display text-2xl font-bold text-navy sm:text-3xl">
                    Trending Now
                  </h2>
                  <p className="mt-1 text-navy/60">Parent favorites this week</p>
                </div>
              </div>
              <Link
                href="/shop?sort=trending"
                className="hidden text-sm font-semibold text-coral hover:underline sm:block"
              >
                View all
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {trending.map((product) => (
                <ProductCard key={product.id} product={product} siteSale={siteSale} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
