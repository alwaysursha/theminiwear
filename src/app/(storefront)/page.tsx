import { CategoryShowcase } from "@/components/storefront/CategoryShowcase";
import { HeroSlider } from "@/components/storefront/HeroSlider";
import { HomepageProductSection } from "@/components/storefront/HomepageProductSection";
import { getHeroSettings, getHomepageSection } from "@/lib/cms";
import { getHomepageSectionProducts } from "@/lib/cms/products";
import { buildHeroSlides } from "@/lib/hero-slider";
import { prisma } from "@/lib/prisma";
import { getSiteSaleSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const [
      hero,
      categoriesSection,
      newSection,
      saleSection,
      clearanceSection,
      trendingSection,
      categories,
      siteSale,
      newArrivals,
      onSale,
      clearance,
      trending,
    ] = await Promise.all([
      getHeroSettings(),
      getHomepageSection("CATEGORIES"),
      getHomepageSection("NEW_ARRIVALS"),
      getHomepageSection("ON_SALE"),
      getHomepageSection("CLEARANCE"),
      getHomepageSection("TRENDING"),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      getSiteSaleSettings(),
      getHomepageSectionProducts("NEW_ARRIVALS"),
      getHomepageSectionProducts("ON_SALE", { minimum: 5 }),
      getHomepageSectionProducts("CLEARANCE"),
      getHomepageSectionProducts("TRENDING", { minimum: 5 }),
    ]);

    const showSaleSection =
      saleSection.enabled && (siteSale.enabled || onSale.length > 0);

    const heroSlides = buildHeroSlides(hero, {
      newArrivals,
      onSale,
      trending,
      siteSale,
      saleViewAllHref: saleSection.viewAllHref ?? "/shop?sale=true",
      saleViewAllLabel: saleSection.viewAllLabel ?? "View all on sale",
      trendingViewAllHref: trendingSection.viewAllHref ?? "/shop?sort=trending",
      trendingViewAllLabel: trendingSection.viewAllLabel ?? "View all",
      newArrivalViewAllHref: newSection.viewAllHref ?? "/shop?new=true",
      newArrivalViewAllLabel: newSection.viewAllLabel ?? "View all",
    });

    return (
      <div>
        <HeroSlider slides={heroSlides} />

        {categoriesSection.enabled && (
          <CategoryShowcase
            categories={categories}
            eyebrow={categoriesSection.eyebrow}
            title={categoriesSection.title}
            viewAllHref={categoriesSection.viewAllHref ?? "/shop"}
            viewAllLabel={categoriesSection.viewAllLabel ?? "View all"}
          />
        )}

        <HomepageProductSection
          section={newSection}
          products={newArrivals}
          siteSale={siteSale}
        />

        {showSaleSection && (
          <HomepageProductSection
            section={saleSection}
            products={onSale}
            siteSale={siteSale}
            variant="sale"
            saleTitle={
              siteSale.enabled
                ? `Sale — ${siteSale.percent}% off`
                : saleSection.title
            }
          />
        )}

        <HomepageProductSection
          section={clearanceSection}
          products={clearance}
          siteSale={siteSale}
          variant="clearance"
        />

        <HomepageProductSection
          section={trendingSection}
          products={trending}
          siteSale={siteSale}
          variant="trending"
        />
      </div>
    );
  } catch {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-navy/60">Homepage content is loading…</p>
      </div>
    );
  }
}
