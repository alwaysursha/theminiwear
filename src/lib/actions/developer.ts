"use server";

import { revalidatePath } from "next/cache";
import { Role, HomepageSectionKey, HomepageSectionSort } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { HeroButton, HeroProductTile, SitePageSlug } from "@/lib/cms/types";

async function requireDeveloper() {
  const session = await requireAdmin();
  if (session.user.role !== Role.ADMIN) {
    throw new Error("Forbidden");
  }
  return session;
}

function parseJsonArray<T>(raw: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export async function saveHeroSettings(formData: FormData) {
  await requireDeveloper();

  const buttons = parseJsonArray<HeroButton>(
    String(formData.get("buttonsJson") ?? "[]"),
    [],
  );
  const productTiles = parseJsonArray<HeroProductTile>(
    String(formData.get("productTilesJson") ?? "[]"),
    [],
  );

  await prisma.heroSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      eyebrow: String(formData.get("eyebrow") ?? ""),
      headline: String(formData.get("headline") ?? ""),
      headlineAccent: (formData.get("headlineAccent") as string) || null,
      description: String(formData.get("description") ?? ""),
      backgroundType: formData.get("backgroundType") === "image" ? "image" : "gradient",
      backgroundImageUrl: (formData.get("backgroundImageUrl") as string) || null,
      gradientPreset: String(formData.get("gradientPreset") ?? "blush-sky-mint"),
      buttons,
      productTiles,
    },
    update: {
      eyebrow: String(formData.get("eyebrow") ?? ""),
      headline: String(formData.get("headline") ?? ""),
      headlineAccent: (formData.get("headlineAccent") as string) || null,
      description: String(formData.get("description") ?? ""),
      backgroundType: formData.get("backgroundType") === "image" ? "image" : "gradient",
      backgroundImageUrl: (formData.get("backgroundImageUrl") as string) || null,
      gradientPreset: String(formData.get("gradientPreset") ?? "blush-sky-mint"),
      buttons,
      productTiles,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/developer/hero");
}

export async function saveHomepageSection(key: HomepageSectionKey, formData: FormData) {
  await requireDeveloper();

  const sortBy = String(formData.get("sortBy") ?? "NEWEST") as HomepageSectionSort;
  const validSort: HomepageSectionSort[] = [
    "NEWEST",
    "TRENDING_SCORE",
    "UPDATED",
    "NAME",
  ];

  const includeSiteWideSale =
    key === "ON_SALE" ? formData.get("includeSiteWideSale") === "on" : undefined;

  const data = {
    enabled: formData.get("enabled") === "on",
    eyebrow: (formData.get("eyebrow") as string) || null,
    title: String(formData.get("title") ?? ""),
    description: (formData.get("description") as string) || null,
    viewAllLabel: (formData.get("viewAllLabel") as string) || null,
    viewAllHref: (formData.get("viewAllHref") as string) || null,
    ...(key !== "CATEGORIES"
      ? {
          productLimit: Math.min(
            12,
            Math.max(1, Number(formData.get("productLimit") ?? 4)),
          ),
          sortBy: validSort.includes(sortBy) ? sortBy : "NEWEST",
        }
      : {}),
    ...(includeSiteWideSale !== undefined
      ? { includeSiteWideSale }
      : {}),
  };

  await prisma.homepageSectionConfig.upsert({
    where: { key },
    create: {
      key,
      productLimit: 4,
      sortBy: "NEWEST",
      includeSiteWideSale: key === "ON_SALE",
      ...data,
    },
    update: data,
  });

  revalidatePath("/");
  revalidatePath(`/admin/developer/${key.toLowerCase().replace(/_/g, "-")}`);
}

export async function saveSitePage(slug: SitePageSlug, formData: FormData) {
  await requireDeveloper();

  await prisma.sitePage.upsert({
    where: { slug },
    create: {
      slug,
      title: String(formData.get("title") ?? ""),
      subtitle: (formData.get("subtitle") as string) || null,
      body: String(formData.get("body") ?? ""),
      published: formData.get("published") === "on",
      showInNav: formData.get("showInNav") === "on",
      contactEmail: (formData.get("contactEmail") as string) || null,
      contactPhone: (formData.get("contactPhone") as string) || null,
      contactAddress: (formData.get("contactAddress") as string) || null,
      contactHours: (formData.get("contactHours") as string) || null,
    },
    update: {
      title: String(formData.get("title") ?? ""),
      subtitle: (formData.get("subtitle") as string) || null,
      body: String(formData.get("body") ?? ""),
      published: formData.get("published") === "on",
      showInNav: formData.get("showInNav") === "on",
      contactEmail: (formData.get("contactEmail") as string) || null,
      contactPhone: (formData.get("contactPhone") as string) || null,
      contactAddress: (formData.get("contactAddress") as string) || null,
      contactHours: (formData.get("contactHours") as string) || null,
    },
  });

  revalidatePath(`/${slug}`);
  revalidatePath("/");
  revalidatePath(`/admin/developer/pages/${slug}`);
}

export async function createCategory(formData: FormData) {
  await requireDeveloper();

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name || !slug) {
    throw new Error("Name and slug are required");
  }

  await prisma.category.create({
    data: { name, slug, description },
  });

  revalidatePath("/");
  revalidatePath("/admin/developer/categories");
  revalidatePath("/shop");
}

export async function updateCategory(categoryId: string, formData: FormData) {
  await requireDeveloper();

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = (formData.get("description") as string)?.trim() || null;

  await prisma.category.update({
    where: { id: categoryId },
    data: { name, slug, description },
  });

  revalidatePath("/");
  revalidatePath("/admin/developer/categories");
  revalidatePath("/shop");
}

export async function deleteCategoryWithProducts(formData: FormData) {
  await requireDeveloper();

  const categoryId = String(formData.get("categoryId") ?? "");
  const action = String(formData.get("action") ?? "");
  const targetCategoryId = (formData.get("targetCategoryId") as string) || null;
  const productIds = formData.getAll("productIds") as string[];

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { products: true },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  if (category.products.length === 0) {
    await prisma.category.delete({ where: { id: categoryId } });
    revalidatePath("/");
    revalidatePath("/admin/developer/categories");
    return;
  }

  const selected =
    productIds.length > 0
      ? category.products.filter((p) => productIds.includes(p.id))
      : category.products;

  if (action === "move") {
    if (!targetCategoryId || targetCategoryId === categoryId) {
      throw new Error("Choose a different category to move products into");
    }
    await prisma.product.updateMany({
      where: { id: { in: selected.map((p) => p.id) } },
      data: { categoryId: targetCategoryId },
    });
  } else if (action === "delete") {
    await prisma.product.deleteMany({
      where: { id: { in: selected.map((p) => p.id) } },
    });
  } else {
    throw new Error("Invalid action");
  }

  const remaining = await prisma.product.count({ where: { categoryId } });
  if (remaining === 0) {
    await prisma.category.delete({ where: { id: categoryId } });
  }

  revalidatePath("/");
  revalidatePath("/admin/developer/categories");
  revalidatePath("/shop");
}
