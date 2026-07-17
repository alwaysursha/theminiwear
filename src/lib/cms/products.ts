import type { HomepageSectionKey } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { productInclude, type ProductWithRelations } from "@/lib/product-utils";
import { getSiteSaleSettings } from "@/lib/settings";
import { getHomepageSection } from "@/lib/cms/index";
import type { Prisma } from "@prisma/client";

function orderByForSection(
  key: HomepageSectionKey,
  sortBy: string,
): Prisma.ProductOrderByWithRelationInput {
  if (key === "TRENDING" || sortBy === "TRENDING_SCORE") {
    return { trendingScore: "desc" };
  }
  if (sortBy === "NAME") return { name: "asc" };
  if (sortBy === "UPDATED") return { updatedAt: "desc" };
  return { createdAt: "desc" };
}

function whereForSection(
  key: HomepageSectionKey,
): Prisma.ProductWhereInput {
  const active = { isActive: true };

  switch (key) {
    case "NEW_ARRIVALS":
      return { ...active, isNewArrival: true };
    case "CLEARANCE":
      return { ...active, isClearance: true };
    case "TRENDING":
      return { ...active, isTrending: true };
    case "ON_SALE":
      return {
        ...active,
        OR: [
          { isOnSale: true },
          { variants: { some: { salePrice: { not: null } } } },
        ],
      };
    default:
      return active;
  }
}

/** Stable daily rotation so homepage trending slots cycle through all flagged products. */
function rotateForDay<T>(items: T[]): T[] {
  if (items.length <= 1) return items;
  const daySeed = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const offset = daySeed % items.length;
  if (offset === 0) return items;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

export async function getHomepageSectionProducts(
  key: Exclude<HomepageSectionKey, "CATEGORIES">,
  options?: { minimum?: number },
): Promise<ProductWithRelations[]> {
  const config = await getHomepageSection(key);
  const siteSale = await getSiteSaleSettings();
  const take = options?.minimum
    ? Math.max(config.productLimit, options.minimum)
    : config.productLimit;

  // Trending: load all flagged products, rotate daily, then take the section limit.
  // Stops high seed scores from permanently blocking newly marked items.
  if (key === "TRENDING") {
    const allTrending = await prisma.product.findMany({
      where: whereForSection(key),
      include: productInclude,
      orderBy: [{ updatedAt: "desc" }, { trendingScore: "desc" }],
    });
    return rotateForDay(allTrending).slice(0, take);
  }

  let products = await prisma.product.findMany({
    where: whereForSection(key),
    include: productInclude,
    take,
    orderBy: orderByForSection(key, config.sortBy),
  });

  if (
    key === "ON_SALE" &&
    config.includeSiteWideSale &&
    siteSale.enabled &&
    products.length < take
  ) {
    const existingIds = new Set(products.map((p) => p.id));
    const filler = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { notIn: [...existingIds] },
      },
      include: productInclude,
      take: take - products.length,
      orderBy: { updatedAt: "desc" },
    });
    products = [...products, ...filler];
  }

  return products;
}
