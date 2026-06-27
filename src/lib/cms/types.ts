export type HeroButton = {
  id: string;
  label: string;
  href: string;
  variant: "default" | "outline";
};

export type HeroProductTile = {
  id: string;
  imageUrl: string;
  alt: string;
  href: string;
};

export type HeroSettingsData = {
  eyebrow: string;
  headline: string;
  headlineAccent: string | null;
  description: string;
  backgroundType: "gradient" | "image";
  backgroundImageUrl: string | null;
  gradientPreset: string;
  buttons: HeroButton[];
  productTiles: HeroProductTile[];
};

export type HomepageSectionKey =
  | "CATEGORIES"
  | "NEW_ARRIVALS"
  | "ON_SALE"
  | "CLEARANCE"
  | "TRENDING";

export type HomepageSectionSort =
  | "NEWEST"
  | "TRENDING_SCORE"
  | "UPDATED"
  | "NAME";

export type HomepageSectionData = {
  key: HomepageSectionKey;
  enabled: boolean;
  eyebrow: string | null;
  title: string;
  description: string | null;
  viewAllLabel: string | null;
  viewAllHref: string | null;
  productLimit: number;
  sortBy: HomepageSectionSort;
  includeSiteWideSale: boolean;
};

export type SitePageSlug = "privacy" | "terms" | "returns" | "contact";

export type SitePageData = {
  slug: SitePageSlug;
  title: string;
  subtitle: string | null;
  body: string;
  published: boolean;
  showInNav: boolean;
  contactEmail: string | null;
  contactPhone: string | null;
  contactAddress: string | null;
  contactHours: string | null;
};

export const HERO_GRADIENT_PRESETS: Record<string, string> = {
  "blush-sky-mint": "bg-gradient-to-br from-blush via-sky/40 to-mint/50",
  blush: "bg-gradient-to-br from-blush to-blush/60",
  sky: "bg-gradient-to-br from-sky/60 to-mint/40",
  navy: "bg-gradient-to-br from-navy to-navy/80",
};

export const SECTION_RULES: Record<
  Exclude<HomepageSectionKey, "CATEGORIES">,
  string
> = {
  NEW_ARRIVALS:
    "Shows active products marked New Arrival on the product edit screen.",
  ON_SALE:
    "Shows active products on sale (product sale flag or variant sale price). Site-wide sale can extend what appears when enabled below.",
  CLEARANCE: "Shows active products marked Clearance on the product edit screen.",
  TRENDING:
    "Shows active products marked Trending, ordered by trending score when that sort is selected.",
};
