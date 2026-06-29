import type { Gender, Prisma } from "@prisma/client";

export const SHOP_CATEGORY_SLUGS = [
  "girls",
  "boys",
  "toddler-girls",
  "toddler-boys",
  "infant-girls",
  "infant-boys",
] as const;

export type ShopCategorySlug = (typeof SHOP_CATEGORY_SLUGS)[number];

export type ShopCategoryDefinition = {
  slug: ShopCategorySlug;
  name: string;
  description: string;
  genders: Gender[];
  ageGroups: string[];
};

export const INFANT_AGE_GROUPS = [
  "0-3M",
  "3-6M",
  "6-12M",
  "12-18M",
  "18-24M",
  "0-12M",
  "12-24M",
] as const;

export const TODDLER_AGE_GROUPS = ["2T", "3T", "4T", "5T", "6T", "2T-4T"] as const;

export const KIDS_AGE_GROUPS = ["6T", "6", "7", "8", "10", "12", "14"] as const;

export const SHOP_CATEGORIES: ShopCategoryDefinition[] = [
  {
    slug: "girls",
    name: "Girls",
    description: "Play-ready outfits and everyday favorites for girls sizes 6T–14",
    genders: ["GIRLS", "UNISEX"],
    ageGroups: [...KIDS_AGE_GROUPS],
  },
  {
    slug: "boys",
    name: "Boys",
    description: "Durable, comfy styles built for active boys sizes 6T–14",
    genders: ["BOYS", "UNISEX"],
    ageGroups: [...KIDS_AGE_GROUPS],
  },
  {
    slug: "toddler-girls",
    name: "Toddler Girls",
    description: "Sweet, easy-on pieces for toddler girls sizes 2T–6T",
    genders: ["GIRLS", "UNISEX"],
    ageGroups: [...TODDLER_AGE_GROUPS],
  },
  {
    slug: "toddler-boys",
    name: "Toddler Boys",
    description: "Tough, cozy looks for toddler boys sizes 2T–6T",
    genders: ["BOYS", "UNISEX"],
    ageGroups: [...TODDLER_AGE_GROUPS],
  },
  {
    slug: "infant-girls",
    name: "Infant Girls",
    description: "Soft, gentle essentials for baby girls newborn–24M",
    genders: ["GIRLS", "UNISEX"],
    ageGroups: [...INFANT_AGE_GROUPS],
  },
  {
    slug: "infant-boys",
    name: "Infant Boys",
    description: "Snuggly staples for baby boys newborn–24M",
    genders: ["BOYS", "UNISEX"],
    ageGroups: [...INFANT_AGE_GROUPS],
  },
];

const shopCategoryBySlug = new Map(
  SHOP_CATEGORIES.map((category) => [category.slug, category]),
);

export function isShopCategorySlug(value: string): value is ShopCategorySlug {
  return SHOP_CATEGORIES.some((category) => category.slug === value);
}

export function getShopCategoryBySlug(
  slug: string,
): ShopCategoryDefinition | undefined {
  return isShopCategorySlug(slug) ? shopCategoryBySlug.get(slug) : undefined;
}

export function sortShopCategories<T extends { slug: string }>(categories: T[]): T[] {
  const rank = new Map<string, number>(
    SHOP_CATEGORIES.map((category, index) => [category.slug, index]),
  );
  return [...categories].sort(
    (a, b) => (rank.get(a.slug) ?? 99) - (rank.get(b.slug) ?? 99),
  );
}

function matchesAgeGroup(ageGroup: string, allowed: readonly string[]): boolean {
  if (allowed.includes(ageGroup)) return true;
  if (ageGroup.includes("-")) {
    return allowed.some((value) => ageGroup.includes(value));
  }
  return false;
}

export function buildShopCategoryWhere(
  slug: string,
): Prisma.ProductWhereInput | null {
  const category = getShopCategoryBySlug(slug);
  if (!category) return null;

  return {
    gender: { in: category.genders },
    variants: {
      some: {
        ageGroup: { in: category.ageGroups },
      },
    },
  };
}

function isInfantAge(ageGroup: string): boolean {
  return INFANT_AGE_GROUPS.some((age) => matchesAgeGroup(ageGroup, INFANT_AGE_GROUPS));
}

function isToddlerAge(ageGroup: string): boolean {
  return TODDLER_AGE_GROUPS.some((age) => matchesAgeGroup(ageGroup, TODDLER_AGE_GROUPS));
}

function isKidsAge(ageGroup: string): boolean {
  return KIDS_AGE_GROUPS.some((age) => matchesAgeGroup(ageGroup, KIDS_AGE_GROUPS));
}

export function resolveProductCategorySlug(
  gender: Gender,
  variantAgeGroups: string[],
): ShopCategorySlug {
  const ages = variantAgeGroups.length > 0 ? variantAgeGroups : ["2T"];

  if (ages.some(isInfantAge)) {
    return gender === "BOYS" ? "infant-boys" : "infant-girls";
  }

  if (ages.some(isToddlerAge)) {
    return gender === "BOYS" ? "toddler-boys" : "toddler-girls";
  }

  if (ages.some(isKidsAge)) {
    return gender === "BOYS" ? "boys" : "girls";
  }

  if (gender === "BOYS") return "toddler-boys";
  if (gender === "GIRLS") return "toddler-girls";
  return "toddler-girls";
}

export const SHOP_CATEGORY_SEED_DATA = SHOP_CATEGORIES.map(
  ({ slug, name, description }) => ({
    slug,
    name,
    description,
  }),
);

/** Homepage category grid — mobile display order */
export const CATEGORY_SHOWCASE_MOBILE_ORDER: ShopCategorySlug[] = [
  "girls",
  "boys",
  "toddler-girls",
  "toddler-boys",
  "infant-girls",
  "infant-boys",
];

export const CATEGORY_SHOWCASE_ORDER_CLASSES: Record<ShopCategorySlug, string> = {
  girls: "order-1 lg:order-1",
  boys: "order-2 lg:order-4",
  "toddler-girls": "order-3 lg:order-2",
  "toddler-boys": "order-4 lg:order-5",
  "infant-girls": "order-5 lg:order-3",
  "infant-boys": "order-6 lg:order-6",
};
