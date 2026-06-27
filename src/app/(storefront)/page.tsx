import Link from "next/link";
import { HeroSection } from "@/components/storefront/HeroSection";
import { CategoryShowcase } from "@/components/storefront/CategoryShowcase";
import { HomepageProductSection } from "@/components/storefront/HomepageProductSection";
import { getHeroSettings, getHomepageSection } from "@/lib/cms";
import { getHomepageSectionProducts } from "@/lib/cms/products";
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
      getHomepageSectionProducts("ON_SALE"),
      getHomepageSectionProducts("CLEARANCE"),
      getHomepageSectionProducts("TRENDING"),
    ]);

    const showSaleSection =
      saleSection.enabled && (siteSale.enabled || onSale.length > 0);

    return (
      <div>
        <HeroSection hero={hero} />

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
