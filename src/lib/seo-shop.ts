import { prisma } from "@/lib/prisma";
import {
  buildPageMetadata,
  buildShopPath,
  truncateForMeta,
} from "@/lib/seo";
import { getSiteSaleSettings } from "@/lib/settings";
import { getShopCategoryBySlug } from "@/lib/shop-categories";

export type ShopSearchParams = {
  category?: string;
  gender?: string;
  ageGroup?: string;
  search?: string;
  sort?: string;
  new?: string;
  sale?: string;
  clearance?: string;
};

export async function buildShopMetadata(params: ShopSearchParams) {
  let siteSale = { enabled: false, percent: 0 };
  let dbCategory: { name: string; description: string | null } | null = null;

  try {
    [siteSale, dbCategory] = await Promise.all([
      getSiteSaleSettings(),
      params.category
        ? prisma.category.findUnique({
            where: { slug: params.category },
            select: { name: true, description: true },
          })
        : Promise.resolve(null),
    ]);
  } catch {
    // Fall back to static titles below.
  }

  const categoryMeta = params.category
    ? getShopCategoryBySlug(params.category)
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

  const description =
    categoryMeta?.description ??
    dbCategory?.description ??
    (params.clearance === "true"
      ? "Last chance markdowns on adorable kids clothing before they're gone."
      : params.sale === "true"
        ? "Shop sale styles and sweet deals on comfortable kids clothing."
        : params.new === "true"
          ? "Discover the latest arrivals in soft, playful kids clothing."
          : "Browse our full collection of adorable, comfortable kids clothing.");

  const path = buildShopPath(params);
  const noIndex = Boolean(params.search?.trim());

  return buildPageMetadata({
    title,
    description: truncateForMeta(description),
    path,
    noIndex,
  });
}
