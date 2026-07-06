import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/seo";
import { SHOP_CATEGORIES } from "@/lib/shop-categories";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/shop?new=true`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/shop?sale=true`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/shop?clearance=true`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/returns`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    const categories = await prisma.category.findMany({
      select: { slug: true },
    });

    const categorySlugs = new Set([
      ...SHOP_CATEGORIES.map((category) => category.slug),
      ...categories.map((category) => category.slug),
    ]);

    return [
      ...staticPages,
      ...products.map((product) => ({
        url: `${baseUrl}/product/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...[...categorySlugs].map((slug) => ({
        url: `${baseUrl}/shop?category=${slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return staticPages;
  }
}
