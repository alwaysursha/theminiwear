"use server";

import { revalidatePath } from "next/cache";
import { Role, HomepageSectionKey, HomepageSectionSort } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TICKER_MESSAGES_KEY, normalizeTickerMessages } from "@/lib/ticker";
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

export type HeroSaveState = {
  ok?: boolean;
  error?: string;
};

export async function saveHeroSettings(
  _prev: HeroSaveState,
  formData: FormData,
): Promise<HeroSaveState> {
  await requireDeveloper();

  const buttons = parseJsonArray<HeroButton>(
    String(formData.get("buttonsJson") ?? "[]"),
    [],
  );
  const productTiles = parseJsonArray<HeroProductTile>(
    String(formData.get("productTilesJson") ?? "[]"),
    [],
  );

  try {
    await prisma.heroSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        eyebrow: String(formData.get("eyebrow") ?? ""),
        headline: String(formData.get("headline") ?? ""),
        headlineAccent: (formData.get("headlineAccent") as string) || null,
        description: String(formData.get("description") ?? ""),
        backgroundType:
          formData.get("backgroundType") === "image" ? "image" : "gradient",
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
        backgroundType:
          formData.get("backgroundType") === "image" ? "image" : "gradient",
        backgroundImageUrl: (formData.get("backgroundImageUrl") as string) || null,
        gradientPreset: String(formData.get("gradientPreset") ?? "blush-sky-mint"),
        buttons,
        productTiles,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/developer/hero");
    return { ok: true };
  } catch {
    return { error: "Could not save hero. Please try again." };
  }
}

export type SectionSaveState = {
  ok?: boolean;
  error?: string;
};

const homepageSectionKeys: HomepageSectionKey[] = [
  "CATEGORIES",
  "NEW_ARRIVALS",
  "ON_SALE",
  "CLEARANCE",
  "TRENDING",
];

export async function saveHomepageSection(
  _prev: SectionSaveState,
  formData: FormData,
): Promise<SectionSaveState> {
  await requireDeveloper();

  const key = String(formData.get("sectionKey") ?? "") as HomepageSectionKey;
  if (!homepageSectionKeys.includes(key)) {
    return { error: "Invalid section." };
  }

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

  try {
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
    revalidatePath(`/admin/developer/sections/${key.toLowerCase().replace(/_/g, "-")}`);
    return { ok: true };
  } catch {
    return { error: "Could not save section. Please try again." };
  }
}

export type PageSaveState = {
  ok?: boolean;
  error?: string;
};

const sitePageSlugs: SitePageSlug[] = ["privacy", "terms", "returns", "contact"];

export async function saveSitePage(
  _prev: PageSaveState,
  formData: FormData,
): Promise<PageSaveState> {
  await requireDeveloper();

  const slug = String(formData.get("pageSlug") ?? "") as SitePageSlug;
  if (!sitePageSlugs.includes(slug)) {
    return { error: "Invalid page." };
  }

  try {
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
    return { ok: true };
  } catch {
    return { error: "Could not save page. Please try again." };
  }
}

export type CategorySaveState = {
  ok?: boolean;
  error?: string;
};

export async function createCategory(
  _prev: CategorySaveState,
  formData: FormData,
): Promise<CategorySaveState> {
  await requireDeveloper();

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name || !slug) {
    return { error: "Name and slug are required." };
  }

  try {
    await prisma.category.create({
      data: { name, slug, description },
    });

    revalidatePath("/");
    revalidatePath("/admin/developer/categories");
    revalidatePath("/shop");
    return { ok: true };
  } catch {
    return { error: "Could not create category. The slug may already exist." };
  }
}

export async function updateCategory(
  _prev: CategorySaveState,
  formData: FormData,
): Promise<CategorySaveState> {
  await requireDeveloper();

  const categoryId = String(formData.get("categoryId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!categoryId) {
    return { error: "Category not found." };
  }

  try {
    await prisma.category.update({
      where: { id: categoryId },
      data: { name, slug, description },
    });

    revalidatePath("/");
    revalidatePath("/admin/developer/categories");
    revalidatePath("/shop");
    return { ok: true };
  } catch {
    return { error: "Could not save category. Please try again." };
  }
}

export type CategoryDeleteState = {
  ok?: boolean;
  error?: string;
};

export async function deleteCategoryWithProducts(
  _prev: CategoryDeleteState,
  formData: FormData,
): Promise<CategoryDeleteState> {
  await requireDeveloper();

  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const action = String(formData.get("action") ?? "");
  const targetCategoryId = (formData.get("targetCategoryId") as string) || null;
  const productIds = formData.getAll("productIds") as string[];

  if (!categoryId) {
    return { error: "Category not found." };
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { products: true },
    });

    if (!category) {
      return { error: "Category not found." };
    }

    if (category.products.length === 0) {
      await prisma.category.delete({ where: { id: categoryId } });
      revalidatePath("/");
      revalidatePath("/admin/developer/categories");
      revalidatePath("/shop");
      return { ok: true };
    }

    const selected =
      productIds.length > 0
        ? category.products.filter((p) => productIds.includes(p.id))
        : category.products;

    if (action === "move") {
      if (!targetCategoryId || targetCategoryId === categoryId) {
        return { error: "Choose a different category to move products into." };
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
      return { error: "Choose what to do with the products in this category." };
    }

    const remaining = await prisma.product.count({ where: { categoryId } });
    if (remaining === 0) {
      await prisma.category.delete({ where: { id: categoryId } });
    }

    revalidatePath("/");
    revalidatePath("/admin/developer/categories");
    revalidatePath("/shop");
    return { ok: true };
  } catch {
    return { error: "Could not delete category. Please try again." };
  }
}

export type TickerSaveState = {
  ok?: boolean;
  error?: string;
};

export async function saveTickerSettings(
  _prev: TickerSaveState,
  formData: FormData,
): Promise<TickerSaveState> {
  await requireDeveloper();

  const messages = normalizeTickerMessages(
    formData.getAll("messages").map((value) => String(value)),
  );

  try {
    await prisma.storeSetting.upsert({
      where: { key: TICKER_MESSAGES_KEY },
      create: {
        key: TICKER_MESSAGES_KEY,
        value: JSON.stringify(messages),
      },
      update: { value: JSON.stringify(messages) },
    });

    revalidatePath("/");
    revalidatePath("/admin/developer/ticker");
    return { ok: true };
  } catch {
    return { error: "Could not save ticker. Please try again." };
  }
}
