import type { HeroSettingsData } from "@/lib/cms/types";
import {
  getProductPriceRange,
  type ProductWithRelations,
} from "@/lib/product-utils";
import type { SiteSaleSettings } from "@/lib/settings";

export type HeroBrandSlide = {
  type: "brand";
  id: string;
  hero: HeroSettingsData;
};

export type HeroProductItem = {
  slug: string;
  name: string;
  categoryName: string | null;
  priceDisplay: string;
  discountPercent: number | null;
  imageUrl: string | null;
  imageAlt: string | null;
};

export type HeroProductAdVariant = "duo-spotlight" | "showcase" | "feature";

export type HeroDuoSpotlightSlide = {
  type: "product-ad";
  id: string;
  tag: string;
  theme: "fresh" | "sale" | "trending";
  variant: "duo-spotlight";
  products: [HeroProductItem, HeroProductItem];
};

export type HeroFeatureSlide = {
  type: "product-ad";
  id: string;
  tag: string;
  theme: "fresh";
  variant: "feature";
  product: HeroProductItem;
  viewAllHref: string;
  viewAllLabel: string;
};

export type HeroShowcaseSlide = {
  type: "product-ad";
  id: string;
  tag: string;
  theme: "sale" | "trending";
  variant: "showcase";
  topPick: HeroProductItem;
  gridProducts: HeroProductItem[];
  gridLabel: string;
  viewAllHref: string;
  viewAllLabel: string;
};

export type HeroProductAdSlide =
  | HeroDuoSpotlightSlide
  | HeroShowcaseSlide
  | HeroFeatureSlide;

export type HeroSlide = HeroBrandSlide | HeroProductAdSlide;

function toProductItem(
  product: ProductWithRelations,
  siteSale: SiteSaleSettings,
): HeroProductItem {
  const pricing = getProductPriceRange(product.variants, product, siteSale);
  const image = product.images[0];

  return {
    slug: product.slug,
    name: product.name,
    categoryName: product.category?.name ?? null,
    priceDisplay: pricing.display,
    discountPercent: pricing.maxDiscountPercent,
    imageUrl: image?.url ?? null,
    imageAlt: image?.alt ?? product.name,
  };
}

type BuildHeroSlidesOptions = {
  newArrivals: ProductWithRelations[];
  onSale: ProductWithRelations[];
  trending: ProductWithRelations[];
  siteSale: SiteSaleSettings;
  saleViewAllHref?: string;
  saleViewAllLabel?: string;
  trendingViewAllHref?: string;
  trendingViewAllLabel?: string;
  newArrivalViewAllHref?: string;
  newArrivalViewAllLabel?: string;
};

const SHOWCASE_GRID_MOCKS: Record<"sale" | "trending", HeroProductItem[]> = {
  sale: [
    {
      slug: "peach-pocket-tee",
      name: "Peach Pocket Tee",
      categoryName: "Tops & Tees",
      priceDisplay: "$14.39",
      discountPercent: 20,
      imageUrl:
        "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80",
      imageAlt: "Peach Pocket Tee",
    },
    {
      slug: "mini-fleece-jogger-set",
      name: "Mini Fleece Jogger Set",
      categoryName: "Bottoms",
      priceDisplay: "$26.59",
      discountPercent: 24,
      imageUrl:
        "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=800&q=80",
      imageAlt: "Mini Fleece Jogger Set",
    },
    {
      slug: "mint-meadow-sundress",
      name: "Mint Meadow Sundress",
      categoryName: "Dresses",
      priceDisplay: "$21.59",
      discountPercent: 28,
      imageUrl:
        "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80",
      imageAlt: "Mint Meadow Sundress",
    },
    {
      slug: "cloud-knit-beanie-set",
      name: "Cloud Knit Beanie Set",
      categoryName: "Accessories",
      priceDisplay: "$15.59",
      discountPercent: 22,
      imageUrl:
        "https://images.unsplash.com/photo-1519458067894-ff9796f8742b?auto=format&fit=crop&w=800&q=80",
      imageAlt: "Cloud Knit Beanie Set",
    },
  ],
  trending: [
    {
      slug: "bunny-knit-cardigan",
      name: "Bunny Knit Cardigan",
      categoryName: "Outerwear",
      priceDisplay: "$32.99",
      discountPercent: null,
      imageUrl:
        "https://images.unsplash.com/photo-1632337948797-ba161d29532b?auto=format&fit=crop&w=800&q=80",
      imageAlt: "Bunny Knit Cardigan",
    },
    {
      slug: "starlight-pajama-set",
      name: "Starlight Pajama Set",
      categoryName: "Sleepwear",
      priceDisplay: "$28.99",
      discountPercent: null,
      imageUrl:
        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80",
      imageAlt: "Starlight Pajama Set",
    },
    {
      slug: "little-explorer-overalls",
      name: "Little Explorer Overalls",
      categoryName: "Bottoms",
      priceDisplay: "$34.99",
      discountPercent: null,
      imageUrl:
        "https://images.unsplash.com/photo-1632337950445-ba446cb0e26f?auto=format&fit=crop&w=800&q=80",
      imageAlt: "Little Explorer Overalls",
    },
    {
      slug: "dino-roar-hoodie",
      name: "Dino Roar Hoodie",
      categoryName: "Tops & Tees",
      priceDisplay: "$29.99",
      discountPercent: null,
      imageUrl:
        "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80",
      imageAlt: "Dino Roar Hoodie",
    },
  ],
};

function padShowcaseGridProducts(
  theme: "sale" | "trending",
  topPick: ProductWithRelations,
  gridSource: ProductWithRelations[],
  siteSale: SiteSaleSettings,
): HeroProductItem[] {
  const gridProducts = gridSource.map((product) =>
    toProductItem(product, siteSale),
  );

  if (gridProducts.length >= 4) {
    return gridProducts.slice(0, 4);
  }

  const usedSlugs = new Set([
    topPick.slug,
    ...gridProducts.map((product) => product.slug),
  ]);

  for (const mock of SHOWCASE_GRID_MOCKS[theme]) {
    if (gridProducts.length >= 4) break;
    if (usedSlugs.has(mock.slug)) continue;
    gridProducts.push(mock);
    usedSlugs.add(mock.slug);
  }

  return gridProducts;
}

export function buildHeroSlides(
  hero: HeroSettingsData,
  {
    newArrivals,
    onSale,
    trending,
    siteSale,
    saleViewAllHref = "/shop?sale=true",
    saleViewAllLabel = "View all on sale",
    trendingViewAllHref = "/shop?sort=trending",
    trendingViewAllLabel = "View all",
    newArrivalViewAllHref = "/shop?new=true",
    newArrivalViewAllLabel = "View all",
  }: BuildHeroSlidesOptions,
): HeroSlide[] {
  const slides: HeroSlide[] = [{ type: "brand", id: "brand", hero }];

  if (newArrivals.length >= 1) {
    slides.push({
      type: "product-ad",
      id: "product-ad-new",
      tag: "New arrival",
      theme: "fresh",
      variant: "feature",
      product: toProductItem(newArrivals[0], siteSale),
      viewAllHref: newArrivalViewAllHref,
      viewAllLabel: newArrivalViewAllLabel,
    });
  }

  if (onSale.length >= 1) {
    const gridSource = onSale.slice(1, 5);
    slides.push({
      type: "product-ad",
      id: "product-ad-sale",
      tag: "On sale",
      theme: "sale",
      variant: "showcase",
      topPick: toProductItem(onSale[0], siteSale),
      gridProducts: padShowcaseGridProducts("sale", onSale[0], gridSource, siteSale),
      gridLabel: "More on sale",
      viewAllHref: saleViewAllHref,
      viewAllLabel: saleViewAllLabel,
    });
  }

  if (trending.length >= 1) {
    const gridSource = trending.slice(1, 5);
    slides.push({
      type: "product-ad",
      id: "product-ad-trending",
      tag: "Trending now",
      theme: "trending",
      variant: "showcase",
      topPick: toProductItem(trending[0], siteSale),
      gridProducts: padShowcaseGridProducts(
        "trending",
        trending[0],
        gridSource,
        siteSale,
      ),
      gridLabel: "Also trending",
      viewAllHref: trendingViewAllHref,
      viewAllLabel: trendingViewAllLabel,
    });
  }

  return slides;
}
