import Link from "next/link";
import type { CSSProperties } from "react";
import { Tag, Star } from "lucide-react";
import { HomepageProductSectionReveal } from "@/components/storefront/HomepageProductSectionReveal";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ViewAllLink } from "@/components/storefront/ViewAllLink";
import type { HomepageSectionData } from "@/lib/cms/types";
import type { ProductWithRelations } from "@/lib/product-utils";
import type { SiteSaleSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

type HomepageProductSectionProps = {
  section: HomepageSectionData;
  products: ProductWithRelations[];
  siteSale: SiteSaleSettings;
  variant?: "default" | "sale" | "clearance" | "trending";
  saleTitle?: string;
};

const revealVariantMap = {
  default: "new-arrivals",
  sale: "on-sale",
  clearance: "clearance",
  trending: "trending",
} as const;

export function HomepageProductSection({
  section,
  products,
  siteSale,
  variant = "default",
  saleTitle,
}: HomepageProductSectionProps) {
  if (!section.enabled || products.length === 0) return null;

  const revealVariant = revealVariantMap[variant];
  const title = saleTitle ?? section.title;

  return (
    <HomepageProductSectionReveal
      revealVariant={revealVariant}
      className={cn(
        variant === "sale" && "bg-blush/30",
        variant === "clearance" && "bg-navy text-white",
        variant === "trending" && "bg-gradient-to-b from-mint/20 to-transparent",
        variant === "default" && "bg-white",
      )}
    >
      <div className="section-reveal-header flex items-end justify-between gap-4">
        <div className="flex items-center gap-2">
          {variant === "sale" && (
            <Tag className="section-reveal-icon h-6 w-6 text-coral" />
          )}
          {variant === "trending" && (
            <Star className="section-reveal-icon h-6 w-6 fill-coral text-coral" />
          )}
          <div>
            {section.eyebrow && (
              <p
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-[0.22em]",
                  variant === "clearance" ? "text-mint/80" : "text-navy/45",
                )}
              >
                {section.eyebrow}
              </p>
            )}
            <h2
              className={cn(
                "font-display text-2xl font-bold sm:text-3xl",
                variant === "clearance" ? "text-white" : "text-navy",
              )}
            >
              {title}
            </h2>
            {section.description && (
              <p
                className={cn(
                  "mt-1",
                  variant === "clearance" ? "text-white/70" : "text-navy/60",
                )}
              >
                {section.description}
              </p>
            )}
          </div>
        </div>
        {section.viewAllHref && section.viewAllLabel && (
          <ViewAllLink
            href={section.viewAllHref}
            tone={variant === "clearance" ? "mint" : "coral"}
            className="section-reveal-view-all hidden sm:inline-flex"
          >
            {section.viewAllLabel}
          </ViewAllLink>
        )}
      </div>

      <div className="section-reveal-grid mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {products.map((product, index) => (
          <div
            key={product.id}
            className={cn(
              "section-reveal-card",
              revealVariant === "trending" &&
                (index % 2 === 0
                  ? "section-reveal-card-alt-left"
                  : "section-reveal-card-alt-right"),
            )}
            style={{ "--reveal-i": index } as CSSProperties}
          >
            <ProductCard product={product} siteSale={siteSale} />
          </div>
        ))}
      </div>

      {section.viewAllHref && section.viewAllLabel && (
        <div className="section-reveal-view-all mt-6 text-center sm:hidden">
          <Link
            href={section.viewAllHref}
            className="text-sm font-semibold text-coral hover:underline"
          >
            {section.viewAllLabel}
          </Link>
        </div>
      )}
    </HomepageProductSectionReveal>
  );
}
