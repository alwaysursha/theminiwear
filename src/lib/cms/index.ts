import { HomepageSectionKey, Prisma } from "@prisma/client";
import { getPrisma, prisma } from "@/lib/prisma";
import {
  defaultHero,
  defaultHomepageSections,
  defaultSitePages,
} from "@/lib/cms/defaults";
import type {
  HeroButton,
  HeroProductTile,
  HeroSettingsData,
  HomepageSectionData,
  HomepageSectionSort,
  SitePageData,
  SitePageSlug,
} from "@/lib/cms/types";

function cmsModelsReady() {
  const client = getPrisma();
  return Boolean(
    client.heroSettings &&
      client.homepageSectionConfig &&
      client.sitePage,
  );
}

function parseHeroButtons(value: unknown): HeroButton[] {
  if (!Array.isArray(value)) return defaultHero.buttons;
  return value
    .filter((item): item is HeroButton => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof (item as HeroButton).label === "string" &&
        typeof (item as HeroButton).href === "string"
      );
    })
    .map((item, index) => ({
      id: item.id ?? String(index + 1),
      label: item.label,
      href: item.href,
      variant: item.variant === "outline" ? "outline" : "default",
    }));
}

function parseHeroTiles(value: unknown): HeroProductTile[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is HeroProductTile => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof (item as HeroProductTile).imageUrl === "string"
      );
    })
    .map((item, index) => ({
      id: item.id ?? String(index + 1),
      imageUrl: item.imageUrl,
      alt: item.alt ?? "",
      href: item.href ?? "/shop",
    }));
}

export async function getHeroSettings(): Promise<HeroSettingsData> {
  if (!cmsModelsReady()) return defaultHero;

  try {
    const row = await prisma.heroSettings.findUnique({ where: { id: "default" } });
    if (!row) return defaultHero;

    return {
      eyebrow: row.eyebrow,
      headline: row.headline,
      headlineAccent: row.headlineAccent,
      description: row.description,
      backgroundType: row.backgroundType === "image" ? "image" : "gradient",
      backgroundImageUrl: row.backgroundImageUrl,
      gradientPreset: row.gradientPreset,
      buttons: parseHeroButtons(row.buttons),
      productTiles: parseHeroTiles(row.productTiles),
    };
  } catch {
    return defaultHero;
  }
}

export async function getHomepageSection(
  key: HomepageSectionKey,
): Promise<HomepageSectionData> {
  const fallback = defaultHomepageSections.find((s) => s.key === key)!;
  if (!cmsModelsReady()) return fallback;

  try {
    const row = await prisma.homepageSectionConfig.findUnique({ where: { key } });
    if (!row) return fallback;

    return {
      key: row.key,
      enabled: row.enabled,
      eyebrow: row.eyebrow,
      title: row.title,
      description: row.description,
      viewAllLabel: row.viewAllLabel,
      viewAllHref: row.viewAllHref,
      productLimit: row.productLimit,
      sortBy: row.sortBy as HomepageSectionSort,
      includeSiteWideSale: row.includeSiteWideSale,
    };
  } catch {
    return fallback;
  }
}

export async function getAllHomepageSections(): Promise<HomepageSectionData[]> {
  const rows = await prisma.homepageSectionConfig.findMany();
  const map = new Map(rows.map((row) => [row.key, row]));
  return defaultHomepageSections.map((fallback) => {
    const row = map.get(fallback.key as HomepageSectionKey);
    if (!row) return fallback;
    return {
      key: row.key,
      enabled: row.enabled,
      eyebrow: row.eyebrow,
      title: row.title,
      description: row.description,
      viewAllLabel: row.viewAllLabel,
      viewAllHref: row.viewAllHref,
      productLimit: row.productLimit,
      sortBy: row.sortBy as HomepageSectionSort,
      includeSiteWideSale: row.includeSiteWideSale,
    };
  });
}

export async function getSitePage(slug: SitePageSlug): Promise<SitePageData> {
  const fallback = defaultSitePages.find((p) => p.slug === slug)!;
  if (!cmsModelsReady()) return fallback;

  try {
    const row = await prisma.sitePage.findUnique({ where: { slug } });
    if (!row) return fallback;

    return mapSitePageRow(row);
  } catch {
    return fallback;
  }
}

function mapSitePageRow(row: {
  slug: string;
  title: string;
  subtitle: string | null;
  body: string;
  published: boolean;
  showInNav: boolean;
  contactEmail: string | null;
  contactPhone: string | null;
  contactAddress: string | null;
  contactHours: string | null;
}): SitePageData {
  return {
    slug: row.slug as SitePageSlug,
    title: row.title,
    subtitle: row.subtitle,
    body: row.body,
    published: row.published,
    showInNav: row.showInNav,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    contactAddress: row.contactAddress,
    contactHours: row.contactHours,
  };
}

export async function getContactNavPage(): Promise<SitePageData | null> {
  const fallback = defaultSitePages.find((p) => p.slug === "contact");
  if (!cmsModelsReady()) {
    return fallback?.showInNav ? fallback : null;
  }

  try {
    const row = await prisma.sitePage.findUnique({ where: { slug: "contact" } });
    if (row) {
      return row.showInNav ? mapSitePageRow(row) : null;
    }
    return fallback?.showInNav ? fallback : null;
  } catch {
    return fallback?.showInNav ? fallback : null;
  }
}

export async function getFooterLegalPages(): Promise<
  { href: string; label: string }[]
> {
  if (!cmsModelsReady()) {
    return defaultSitePages
      .filter((p) => ["privacy", "terms", "returns"].includes(p.slug) && p.showInNav)
      .map((p) => ({ href: `/${p.slug}`, label: p.title }));
  }

  try {
    const rows = await prisma.sitePage.findMany({
      where: {
        slug: { in: ["privacy", "terms", "returns"] },
        showInNav: true,
      },
    });
    if (rows.length === 0) {
      return defaultSitePages
        .filter((p) => ["privacy", "terms", "returns"].includes(p.slug) && p.showInNav)
        .map((p) => ({ href: `/${p.slug}`, label: p.title }));
    }
    return rows.map((row) => ({
      href: `/${row.slug}`,
      label: row.title,
    }));
  } catch {
    return defaultSitePages
      .filter((p) => ["privacy", "terms", "returns"].includes(p.slug) && p.showInNav)
      .map((p) => ({ href: `/${p.slug}`, label: p.title }));
  }
}

function sectionOrderBy(
  sortBy: HomepageSectionSort,
): Prisma.ProductOrderByWithRelationInput {
  switch (sortBy) {
    case "TRENDING_SCORE":
      return { trendingScore: "desc" };
    case "UPDATED":
      return { updatedAt: "desc" };
    case "NAME":
      return { name: "asc" };
    case "NEWEST":
    default:
      return { createdAt: "desc" };
  }
}

export async function countSectionProducts(
  key: Exclude<HomepageSectionKey, "CATEGORIES">,
  includeSiteWideSale: boolean,
) {
  const where = sectionProductWhere(key, includeSiteWideSale);
  return prisma.product.count({ where });
}

function sectionProductWhere(
  key: Exclude<HomepageSectionKey, "CATEGORIES">,
  includeSiteWideSale: boolean,
): Prisma.ProductWhereInput {
  const active = { isActive: true } satisfies Prisma.ProductWhereInput;

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
          ...(includeSiteWideSale ? [{ isActive: true }] : []),
        ],
      };
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
}

export async function ensureCmsDefaults() {
  await prisma.heroSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      ...defaultHero,
      buttons: defaultHero.buttons,
      productTiles: defaultHero.productTiles,
    },
    update: {},
  });

  for (const section of defaultHomepageSections) {
    await prisma.homepageSectionConfig.upsert({
      where: { key: section.key as HomepageSectionKey },
      create: {
        key: section.key as HomepageSectionKey,
        enabled: section.enabled,
        eyebrow: section.eyebrow,
        title: section.title,
        description: section.description,
        viewAllLabel: section.viewAllLabel,
        viewAllHref: section.viewAllHref,
        productLimit: section.productLimit,
        sortBy: section.sortBy,
        includeSiteWideSale: section.includeSiteWideSale,
      },
      update: {},
    });
  }

  for (const page of defaultSitePages) {
    await prisma.sitePage.upsert({
      where: { slug: page.slug },
      create: page,
      update: {},
    });
  }
}
