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

export async function getHomepageSectionProducts(
  key: Exclude<HomepageSectionKey, "CATEGORIES">,
): Promise<ProductWithRelations[]> {
  const config = await getHomepageSection(key);
  const siteSale = await getSiteSaleSettings();

  let products = await prisma.product.findMany({
    where: whereForSection(key),
    include: productInclude,
    take: config.productLimit,
    orderBy: orderByForSection(key, config.sortBy),
  });

  if (
    key === "ON_SALE" &&
    config.includeSiteWideSale &&
    siteSale.enabled &&
    products.length < config.productLimit
  ) {
    const existingIds = new Set(products.map((p) => p.id));
    const filler = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { notIn: [...existingIds] },
      },
      include: productInclude,
      take: config.productLimit - products.length,
      orderBy: { updatedAt: "desc" },
    });
    products = [...products, ...filler];
  }

  return products;
}
